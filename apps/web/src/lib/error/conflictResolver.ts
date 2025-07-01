import { SyncError } from './errorTypes';
import { reportError } from './errorReporter';

export enum ConflictResolutionStrategy {
  LOCAL_WINS = 'local_wins',
  REMOTE_WINS = 'remote_wins',
  MERGE = 'merge',
  MANUAL = 'manual'
}

export interface ConflictInfo {
  type: string;
  path: string[];
  localValue: any;
  remoteValue: any;
  baseValue?: any;
  localTimestamp?: Date;
  remoteTimestamp?: Date;
}

export interface ConflictResolution {
  conflicts: ConflictInfo[];
  strategy: ConflictResolutionStrategy;
  resolvedValue: any;
  metadata?: Record<string, any>;
}

export class ConflictResolver {
  private resolutionHistory: ConflictResolution[] = [];
  private customResolvers: Map<string, (conflict: ConflictInfo) => any> = new Map();

  // Register a custom resolver for specific conflict types
  registerResolver(type: string, resolver: (conflict: ConflictInfo) => any): void {
    this.customResolvers.set(type, resolver);
  }

  // Main conflict resolution method
  async resolveConflicts(
    local: any,
    remote: any,
    base?: any,
    strategy: ConflictResolutionStrategy = ConflictResolutionStrategy.MERGE
  ): Promise<ConflictResolution> {
    const conflicts = this.detectConflicts(local, remote, base);

    if (conflicts.length === 0) {
      return {
        conflicts: [],
        strategy,
        resolvedValue: local
      };
    }

    let resolvedValue: any;

    switch (strategy) {
      case ConflictResolutionStrategy.LOCAL_WINS:
        resolvedValue = local;
        break;

      case ConflictResolutionStrategy.REMOTE_WINS:
        resolvedValue = remote;
        break;

      case ConflictResolutionStrategy.MERGE:
        resolvedValue = await this.mergeConflicts(local, remote, conflicts);
        break;

      case ConflictResolutionStrategy.MANUAL:
        throw new SyncError('Manual conflict resolution required', {
          context: { conflicts },
          userMessage: 'There are conflicts that require your attention.'
        });
    }

    const resolution: ConflictResolution = {
      conflicts,
      strategy,
      resolvedValue,
      metadata: {
        timestamp: new Date().toISOString(),
        conflictCount: conflicts.length
      }
    };

    this.resolutionHistory.push(resolution);
    return resolution;
  }

  // Detect conflicts between local and remote states
  private detectConflicts(
    local: any,
    remote: any,
    base?: any,
    path: string[] = []
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    // Handle null/undefined cases
    if (local === remote) {
      return conflicts;
    }

    if (local === null || local === undefined || remote === null || remote === undefined) {
      if (local !== remote) {
        conflicts.push({
          type: 'value',
          path,
          localValue: local,
          remoteValue: remote,
          baseValue: base
        });
      }
      return conflicts;
    }

    // Handle different types
    if (typeof local !== typeof remote) {
      conflicts.push({
        type: 'type_mismatch',
        path,
        localValue: local,
        remoteValue: remote,
        baseValue: base
      });
      return conflicts;
    }

    // Handle primitives
    if (typeof local !== 'object') {
      if (local !== remote) {
        // Check if both changed from base (real conflict)
        if (base !== undefined && local !== base && remote !== base) {
          conflicts.push({
            type: 'value',
            path,
            localValue: local,
            remoteValue: remote,
            baseValue: base
          });
        }
      }
      return conflicts;
    }

    // Handle arrays
    if (Array.isArray(local) && Array.isArray(remote)) {
      return this.detectArrayConflicts(local, remote, base, path);
    }

    // Handle objects
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
    
    for (const key of allKeys) {
      const subPath = [...path, key];
      const localValue = local[key];
      const remoteValue = remote[key];
      const baseValue = base?.[key];

      // Skip if values are the same
      if (localValue === remoteValue) {
        continue;
      }

      // Check for additions/deletions
      if (!(key in local) || !(key in remote)) {
        if (base && key in base) {
          // Both deleted the same key - no conflict
          if (!(key in local) && !(key in remote)) {
            continue;
          }
          // One deleted, one modified - conflict
          conflicts.push({
            type: 'deletion_conflict',
            path: subPath,
            localValue,
            remoteValue,
            baseValue
          });
        }
        // One added - no conflict, will be merged
        continue;
      }

      // Recursively check for nested conflicts
      const nestedConflicts = this.detectConflicts(
        localValue,
        remoteValue,
        baseValue,
        subPath
      );
      
      conflicts.push(...nestedConflicts);
    }

    return conflicts;
  }

  // Detect conflicts in arrays
  private detectArrayConflicts(
    local: any[],
    remote: any[],
    base: any[] | undefined,
    path: string[]
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];

    // Simple strategy: if arrays differ in length or content, it's a conflict
    if (local.length !== remote.length) {
      conflicts.push({
        type: 'array_length',
        path,
        localValue: local,
        remoteValue: remote,
        baseValue: base
      });
      return conflicts;
    }

    // Check each element
    for (let i = 0; i < local.length; i++) {
      const elementConflicts = this.detectConflicts(
        local[i],
        remote[i],
        base?.[i],
        [...path, i.toString()]
      );
      conflicts.push(...elementConflicts);
    }

    return conflicts;
  }

  // Merge conflicts using various strategies
  private async mergeConflicts(
    local: any,
    remote: any,
    conflicts: ConflictInfo[]
  ): Promise<any> {
    // Deep clone to avoid mutations
    const result = JSON.parse(JSON.stringify(local));

    for (const conflict of conflicts) {
      try {
        // Check for custom resolver
        const customResolver = this.customResolvers.get(conflict.type);
        if (customResolver) {
          const resolved = customResolver(conflict);
          this.applyResolution(result, conflict.path, resolved);
          continue;
        }

        // Default resolution strategies
        switch (conflict.type) {
          case 'value':
            // Use timestamp if available
            if (conflict.localTimestamp && conflict.remoteTimestamp) {
              const useLocal = conflict.localTimestamp > conflict.remoteTimestamp;
              this.applyResolution(
                result,
                conflict.path,
                useLocal ? conflict.localValue : conflict.remoteValue
              );
            } else {
              // Default to local
              this.applyResolution(result, conflict.path, conflict.localValue);
            }
            break;

          case 'type_mismatch':
            // Type conflicts default to local
            this.applyResolution(result, conflict.path, conflict.localValue);
            break;

          case 'deletion_conflict':
            // If one side deleted and other modified, keep the modification
            const value = conflict.localValue !== undefined 
              ? conflict.localValue 
              : conflict.remoteValue;
            this.applyResolution(result, conflict.path, value);
            break;

          case 'array_length':
            // For arrays, merge unique items
            const merged = this.mergeArrays(
              conflict.localValue,
              conflict.remoteValue
            );
            this.applyResolution(result, conflict.path, merged);
            break;

          default:
            // Unknown conflict type, default to local
            this.applyResolution(result, conflict.path, conflict.localValue);
        }
      } catch (error) {
        reportError(new SyncError('Failed to resolve conflict', {
          context: { conflict, error }
        }));
      }
    }

    return result;
  }

  // Apply a resolution to the result object
  private applyResolution(obj: any, path: string[], value: any): void {
    if (path.length === 0) {
      return;
    }

    let current = obj;
    
    // Navigate to the parent
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      
      if (!(key in current)) {
        // Create intermediate objects/arrays as needed
        current[key] = isNaN(Number(path[i + 1])) ? {} : [];
      }
      
      current = current[key];
    }

    // Set the final value
    const lastKey = path[path.length - 1];
    if (value === undefined) {
      delete current[lastKey];
    } else {
      current[lastKey] = value;
    }
  }

  // Merge two arrays, attempting to preserve unique items
  private mergeArrays(local: any[], remote: any[]): any[] {
    // Simple strategy: concatenate and remove duplicates
    const merged = [...local];
    
    for (const item of remote) {
      // Check if item exists in local (simple comparison)
      const exists = merged.some(localItem => 
        JSON.stringify(localItem) === JSON.stringify(item)
      );
      
      if (!exists) {
        merged.push(item);
      }
    }

    return merged;
  }

  // Get resolution history
  getHistory(): ConflictResolution[] {
    return [...this.resolutionHistory];
  }

  // Clear resolution history
  clearHistory(): void {
    this.resolutionHistory = [];
  }

  // Create a three-way merge patch
  createMergePatch(base: any, local: any, remote: any): any {
    const patch: any = {};

    const createPatch = (b: any, l: any, r: any, p: any, path: string[] = []) => {
      // Handle all keys from all three objects
      const allKeys = new Set([
        ...Object.keys(b || {}),
        ...Object.keys(l || {}),
        ...Object.keys(r || {})
      ]);

      for (const key of allKeys) {
        const basVal = b?.[key];
        const locVal = l?.[key];
        const remVal = r?.[key];
        const subPath = [...path, key];

        // No changes
        if (JSON.stringify(basVal) === JSON.stringify(locVal) && 
            JSON.stringify(basVal) === JSON.stringify(remVal)) {
          continue;
        }

        // Only local changed
        if (JSON.stringify(basVal) !== JSON.stringify(locVal) && 
            JSON.stringify(basVal) === JSON.stringify(remVal)) {
          p[key] = locVal;
          continue;
        }

        // Only remote changed
        if (JSON.stringify(basVal) === JSON.stringify(locVal) && 
            JSON.stringify(basVal) !== JSON.stringify(remVal)) {
          p[key] = remVal;
          continue;
        }

        // Both changed to same value
        if (JSON.stringify(locVal) === JSON.stringify(remVal)) {
          p[key] = locVal;
          continue;
        }

        // Both changed to different values - need to merge
        if (typeof locVal === 'object' && typeof remVal === 'object' && 
            locVal !== null && remVal !== null &&
            !Array.isArray(locVal) && !Array.isArray(remVal)) {
          p[key] = {};
          createPatch(basVal, locVal, remVal, p[key], subPath);
        } else {
          // Conflict - will need resolution
          p[key] = {
            __conflict: true,
            base: basVal,
            local: locVal,
            remote: remVal
          };
        }
      }
    };

    createPatch(base, local, remote, patch);
    return patch;
  }
}

// Create singleton instance
export const conflictResolver = new ConflictResolver();