import { StateValidator } from './stateValidator';
import { stateRecovery } from './stateRecovery';

interface SnapshotMetadata {
  reason: string;
  tags?: string[];
  important?: boolean;
  expiresAt?: Date;
}

export class StateSnapshotManager {
  private static instance: StateSnapshotManager;
  private snapshotQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  static getInstance(): StateSnapshotManager {
    if (!this.instance) {
      this.instance = new StateSnapshotManager();
    }
    return this.instance;
  }

  // Take a snapshot with metadata
  async takeSnapshot(
    type: string,
    state: any,
    metadata: SnapshotMetadata
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.snapshotQueue.push(async () => {
        try {
          const snapshotId = stateRecovery.createSnapshot(type, state, metadata);
          resolve(snapshotId);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  // Create a checkpoint before risky operations
  async createCheckpoint(
    type: string,
    state: any,
    operation: string
  ): Promise<string> {
    return this.takeSnapshot(type, state, {
      reason: `Checkpoint before ${operation}`,
      tags: ['checkpoint', operation],
      important: true
    });
  }

  // Create auto-save snapshot
  async autoSave(type: string, state: any): Promise<string> {
    return this.takeSnapshot(type, state, {
      reason: 'Auto-save',
      tags: ['auto-save'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    });
  }

  // Create a recovery point
  async createRecoveryPoint(
    type: string,
    state: any,
    error?: Error
  ): Promise<string> {
    return this.takeSnapshot(type, state, {
      reason: error ? `Recovery point after error: ${error.message}` : 'Manual recovery point',
      tags: ['recovery', error ? 'error' : 'manual'],
      important: true
    });
  }

  // Batch snapshot multiple states
  async batchSnapshot(
    snapshots: Array<{ type: string; state: any; metadata: SnapshotMetadata }>
  ): Promise<string[]> {
    const results = await Promise.all(
      snapshots.map(({ type, state, metadata }) =>
        this.takeSnapshot(type, state, metadata)
      )
    );
    return results;
  }

  // Get snapshot history with filtering
  getSnapshotHistory(
    type?: string,
    filters?: {
      tags?: string[];
      afterDate?: Date;
      beforeDate?: Date;
      important?: boolean;
    }
  ): any[] {
    // This would need to be implemented in stateRecovery
    // For now, return empty array
    return [];
  }

  // Compare current state with a snapshot
  async compareWithSnapshot(
    snapshotId: string,
    currentState: any
  ): Promise<any> {
    const snapshotState = await stateRecovery.restoreSnapshot(snapshotId);
    return stateRecovery.compareStates(currentState, snapshotState);
  }

  // Restore to a specific snapshot with validation
  async restoreToSnapshot(
    snapshotId: string,
    type: string
  ): Promise<any> {
    const state = await stateRecovery.restoreSnapshot(snapshotId);
    
    // Validate the restored state
    const validatedState = StateValidator.validate(type, state);
    
    return validatedState;
  }

  // Create a snapshot before and after an operation
  async withSnapshot<T>(
    type: string,
    getState: () => any,
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    // Take snapshot before
    const beforeId = await this.createCheckpoint(type, getState(), operationName);

    try {
      // Execute operation
      const result = await operation();

      // Take snapshot after success
      await this.takeSnapshot(type, getState(), {
        reason: `After successful ${operationName}`,
        tags: ['success', operationName]
      });

      return result;
    } catch (error) {
      // Take snapshot after failure
      await this.createRecoveryPoint(type, getState(), error as Error);

      // Optionally restore to before state
      throw error;
    }
  }

  // Process snapshot queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.snapshotQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.snapshotQueue.length > 0) {
      const task = this.snapshotQueue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error('Snapshot task failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  // Cleanup old snapshots based on metadata
  async cleanupExpiredSnapshots(): Promise<number> {
    // This would need to be implemented to check expiration dates
    // For now, use default cleanup
    return stateRecovery.cleanupSnapshots();
  }
}

// Export singleton instance
export const snapshotManager = StateSnapshotManager.getInstance();

// Convenience functions
export async function takeSnapshot(
  type: string,
  state: any,
  reason: string
): Promise<string> {
  return snapshotManager.takeSnapshot(type, state, { reason });
}

export async function createCheckpoint(
  type: string,
  state: any,
  operation: string
): Promise<string> {
  return snapshotManager.createCheckpoint(type, state, operation);
}

export async function withSnapshot<T>(
  type: string,
  getState: () => any,
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return snapshotManager.withSnapshot(type, getState, operation, operationName);
}