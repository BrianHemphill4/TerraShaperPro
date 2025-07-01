import { StateValidator } from './stateValidator';
import { StateError } from './errorTypes';
import { reportError } from './errorReporter';

interface StateSnapshot {
  id: string;
  timestamp: Date;
  state: any;
  type: string;
  version: number;
  checksum?: string;
}

interface RecoveryOptions {
  maxSnapshots?: number;
  snapshotInterval?: number;
  enableAutoSnapshot?: boolean;
  compressionEnabled?: boolean;
}

export class StateRecovery {
  private snapshots: Map<string, StateSnapshot[]> = new Map();
  private snapshotTimers: Map<string, NodeJS.Timeout> = new Map();
  private options: RecoveryOptions;
  private storage: Storage;

  constructor(options: RecoveryOptions = {}, storage: Storage = localStorage) {
    this.options = {
      maxSnapshots: 10,
      snapshotInterval: 60000, // 1 minute
      enableAutoSnapshot: true,
      compressionEnabled: true,
      ...options
    };
    this.storage = storage;
    this.loadSnapshots();
  }

  // Create a snapshot of the current state
  createSnapshot(type: string, state: any, metadata?: any): string {
    try {
      // Validate state before creating snapshot
      const validatedState = StateValidator.sanitize(type, state);
      
      const snapshot: StateSnapshot = {
        id: this.generateSnapshotId(),
        timestamp: new Date(),
        state: this.options.compressionEnabled 
          ? this.compressState(validatedState)
          : validatedState,
        type,
        version: 1,
        checksum: this.calculateChecksum(validatedState)
      };

      // Store metadata if provided
      if (metadata) {
        (snapshot as any).metadata = metadata;
      }

      // Add to snapshots
      const typeSnapshots = this.snapshots.get(type) || [];
      typeSnapshots.push(snapshot);

      // Limit number of snapshots
      if (typeSnapshots.length > this.options.maxSnapshots!) {
        typeSnapshots.shift();
      }

      this.snapshots.set(type, typeSnapshots);
      this.saveSnapshots();

      return snapshot.id;
    } catch (error) {
      reportError(new StateError('Failed to create state snapshot', {
        context: { type, error }
      }));
      throw error;
    }
  }

  // Restore state from a snapshot
  async restoreSnapshot(snapshotId: string): Promise<any> {
    try {
      let foundSnapshot: StateSnapshot | undefined;
      let snapshotType: string | undefined;

      // Find the snapshot
      for (const [type, snapshots] of this.snapshots.entries()) {
        const snapshot = snapshots.find(s => s.id === snapshotId);
        if (snapshot) {
          foundSnapshot = snapshot;
          snapshotType = type;
          break;
        }
      }

      if (!foundSnapshot || !snapshotType) {
        throw new StateError('Snapshot not found', {
          context: { snapshotId }
        });
      }

      // Decompress if needed
      const state = this.options.compressionEnabled
        ? this.decompressState(foundSnapshot.state)
        : foundSnapshot.state;

      // Validate restored state
      const validatedState = StateValidator.validate(snapshotType, state);

      // Verify checksum if available
      if (foundSnapshot.checksum) {
        const currentChecksum = this.calculateChecksum(validatedState);
        if (currentChecksum !== foundSnapshot.checksum) {
          throw new StateError('Snapshot checksum mismatch', {
            context: { 
              snapshotId, 
              expected: foundSnapshot.checksum,
              actual: currentChecksum
            }
          });
        }
      }

      return validatedState;
    } catch (error) {
      reportError(new StateError('Failed to restore snapshot', {
        context: { snapshotId, error }
      }));
      throw error;
    }
  }

  // Get the latest valid snapshot for a type
  getLatestSnapshot(type: string): StateSnapshot | null {
    const snapshots = this.snapshots.get(type) || [];
    
    // Try snapshots from newest to oldest
    for (let i = snapshots.length - 1; i >= 0; i--) {
      const snapshot = snapshots[i];
      try {
        const state = this.options.compressionEnabled
          ? this.decompressState(snapshot.state)
          : snapshot.state;
        
        if (StateValidator.isValid(type, state)) {
          return snapshot;
        }
      } catch {
        // Skip invalid snapshots
        continue;
      }
    }

    return null;
  }

  // Enable automatic snapshots for a state type
  enableAutoSnapshot(type: string, getState: () => any): void {
    if (!this.options.enableAutoSnapshot) return;

    // Clear existing timer
    this.disableAutoSnapshot(type);

    // Set up new timer
    const timer = setInterval(() => {
      try {
        const state = getState();
        this.createSnapshot(type, state, { auto: true });
      } catch (error) {
        console.error(`Auto-snapshot failed for ${type}:`, error);
      }
    }, this.options.snapshotInterval!);

    this.snapshotTimers.set(type, timer);
  }

  // Disable automatic snapshots for a state type
  disableAutoSnapshot(type: string): void {
    const timer = this.snapshotTimers.get(type);
    if (timer) {
      clearInterval(timer);
      this.snapshotTimers.delete(type);
    }
  }

  // Compare two states and return differences
  compareStates(state1: any, state2: any): any {
    const diff: any = {};

    const compare = (obj1: any, obj2: any, path: string[] = []) => {
      // Handle different types
      if (typeof obj1 !== typeof obj2) {
        return { old: obj1, new: obj2 };
      }

      // Handle primitives
      if (typeof obj1 !== 'object' || obj1 === null) {
        if (obj1 !== obj2) {
          return { old: obj1, new: obj2 };
        }
        return null;
      }

      // Handle arrays
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
          return { old: obj1, new: obj2 };
        }
        
        const arrayDiff: any[] = [];
        for (let i = 0; i < obj1.length; i++) {
          const itemDiff = compare(obj1[i], obj2[i], [...path, i.toString()]);
          if (itemDiff) {
            arrayDiff.push({ index: i, diff: itemDiff });
          }
        }
        
        return arrayDiff.length > 0 ? arrayDiff : null;
      }

      // Handle objects
      const objDiff: any = {};
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      
      for (const key of allKeys) {
        const keyDiff = compare(obj1[key], obj2[key], [...path, key]);
        if (keyDiff) {
          objDiff[key] = keyDiff;
        }
      }

      return Object.keys(objDiff).length > 0 ? objDiff : null;
    };

    return compare(state1, state2) || {};
  }

  // Attempt to recover corrupted state
  async recoverCorruptedState(type: string, corruptedState: any): Promise<any> {
    try {
      // First, try to repair the state
      const repaired = StateValidator.repair(type, corruptedState);
      if (repaired) {
        reportError(new StateError('State repaired successfully', {
          context: { type, severity: 'low' },
          severity: 'low' as any
        }));
        return repaired;
      }

      // If repair fails, try to find the latest valid snapshot
      const latestSnapshot = this.getLatestSnapshot(type);
      if (latestSnapshot) {
        const restoredState = await this.restoreSnapshot(latestSnapshot.id);
        
        reportError(new StateError('State restored from snapshot', {
          context: { 
            type, 
            snapshotId: latestSnapshot.id,
            snapshotAge: Date.now() - latestSnapshot.timestamp.getTime()
          },
          severity: 'medium' as any
        }));
        
        return restoredState;
      }

      // Last resort: return default state
      const defaultState = StateValidator.sanitize(type, {});
      
      reportError(new StateError('State reset to defaults', {
        context: { type },
        severity: 'high' as any
      }));
      
      return defaultState;
    } catch (error) {
      reportError(new StateError('Critical state recovery failure', {
        context: { type, error },
        severity: 'critical' as any,
        recoverable: false
      }));
      throw error;
    }
  }

  // Clean up old snapshots
  cleanupSnapshots(olderThan?: Date): number {
    let removedCount = 0;
    const cutoffDate = olderThan || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

    for (const [type, snapshots] of this.snapshots.entries()) {
      const filtered = snapshots.filter(s => s.timestamp > cutoffDate);
      removedCount += snapshots.length - filtered.length;
      this.snapshots.set(type, filtered);
    }

    this.saveSnapshots();
    return removedCount;
  }

  // Private helper methods
  private generateSnapshotId(): string {
    return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateChecksum(state: any): string {
    const str = JSON.stringify(state);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  private compressState(state: any): string {
    // Simple compression using base64 encoding
    // In production, you might use a proper compression library
    return btoa(encodeURIComponent(JSON.stringify(state)));
  }

  private decompressState(compressed: string): any {
    try {
      return JSON.parse(decodeURIComponent(atob(compressed)));
    } catch {
      // If decompression fails, assume it's not compressed
      return compressed;
    }
  }

  private loadSnapshots(): void {
    try {
      const stored = this.storage.getItem('state-snapshots');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Restore snapshots with proper Date objects
        for (const [type, snapshots] of Object.entries(parsed)) {
          this.snapshots.set(type, (snapshots as any[]).map(s => ({
            ...s,
            timestamp: new Date(s.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    }
  }

  private saveSnapshots(): void {
    try {
      const toStore: Record<string, any> = {};
      
      for (const [type, snapshots] of this.snapshots.entries()) {
        toStore[type] = snapshots;
      }
      
      this.storage.setItem('state-snapshots', JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save snapshots:', error);
    }
  }

  // Cleanup method
  destroy(): void {
    // Clear all timers
    for (const timer of this.snapshotTimers.values()) {
      clearInterval(timer);
    }
    this.snapshotTimers.clear();
  }
}

// Create singleton instance
export const stateRecovery = new StateRecovery();