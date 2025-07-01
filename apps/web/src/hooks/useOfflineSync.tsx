'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { networkErrorHandler } from '@/lib/error/networkErrorHandler';
import { toast } from '@/hooks/use-toast';
import { reportError } from '@/lib/error/errorReporter';
import { NetworkError, SyncError } from '@/lib/error/errorTypes';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

interface OfflineSyncOptions {
  syncInterval?: number; // Sync interval in ms
  maxRetries?: number;
  onSync?: (operations: SyncOperation[]) => Promise<void>;
  onConflict?: (operation: SyncOperation, serverData: any) => Promise<any>;
  storageKey?: string;
}

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: SyncOperation[];
  lastSyncTime: Date | null;
  syncError: Error | null;
  failedOperations: SyncOperation[];
}

export function useOfflineSync(options: OfflineSyncOptions = {}) {
  const {
    syncInterval = 30000, // 30 seconds
    maxRetries = 3,
    onSync,
    onConflict,
    storageKey = 'offline-sync-queue'
  } = options;

  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: [],
    lastSyncTime: null,
    syncError: null,
    failedOperations: []
  });

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const syncInProgressRef = useRef(false);

  // Load pending operations from storage
  const loadPendingOperations = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const operations = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          pendingOperations: operations.map((op: any) => ({
            ...op,
            timestamp: new Date(op.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }, [storageKey]);

  // Save pending operations to storage
  const savePendingOperations = useCallback((operations: SyncOperation[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }, [storageKey]);

  // Queue an operation for sync
  const queueOperation = useCallback((
    type: SyncOperation['type'],
    resource: string,
    data: any
  ) => {
    const operation: SyncOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      resource,
      data,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending'
    };

    setState(prev => {
      const newOperations = [...prev.pendingOperations, operation];
      savePendingOperations(newOperations);
      return {
        ...prev,
        pendingOperations: newOperations
      };
    });

    // Try to sync immediately if online
    if (state.isOnline && !syncInProgressRef.current) {
      performSync();
    }

    return operation.id;
  }, [state.isOnline, savePendingOperations]);

  // Perform sync of pending operations
  const performSync = useCallback(async () => {
    if (syncInProgressRef.current || state.pendingOperations.length === 0) {
      return;
    }

    syncInProgressRef.current = true;
    setState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    const operationsToSync = [...state.pendingOperations];
    const completedOperations: string[] = [];
    const failedOperations: SyncOperation[] = [];

    try {
      if (onSync) {
        // Batch sync
        await onSync(operationsToSync);
        completedOperations.push(...operationsToSync.map(op => op.id));
      } else {
        // Individual sync
        for (const operation of operationsToSync) {
          try {
            // Update operation status
            setState(prev => ({
              ...prev,
              pendingOperations: prev.pendingOperations.map(op =>
                op.id === operation.id ? { ...op, status: 'syncing' } : op
              )
            }));

            // Perform the sync based on operation type
            await syncOperation(operation);
            
            completedOperations.push(operation.id);
          } catch (error) {
            const syncError = error as Error;
            
            // Handle conflicts
            if (syncError.message.includes('conflict') && onConflict) {
              try {
                const resolved = await onConflict(operation, syncError);
                operation.data = resolved;
                await syncOperation(operation);
                completedOperations.push(operation.id);
                continue;
              } catch (conflictError) {
                // Conflict resolution failed
              }
            }

            // Increment retry count
            operation.retryCount++;
            
            if (operation.retryCount >= maxRetries) {
              operation.status = 'failed';
              failedOperations.push(operation);
              
              reportError(new SyncError('Operation failed after max retries', {
                context: { operation, error: syncError }
              }));
            } else {
              // Keep in queue for retry
              failedOperations.push(operation);
            }
          }
        }
      }

      // Update state with results
      setState(prev => {
        const remainingOperations = prev.pendingOperations.filter(
          op => !completedOperations.includes(op.id)
        );
        
        savePendingOperations(remainingOperations);
        
        return {
          ...prev,
          pendingOperations: remainingOperations,
          failedOperations: failedOperations.filter(op => op.status === 'failed'),
          lastSyncTime: new Date(),
          isSyncing: false
        };
      });

      // Show success notification if operations were synced
      if (completedOperations.length > 0) {
        toast({
          title: 'Synced',
          description: `${completedOperations.length} changes synchronized successfully.`,
          variant: 'default'
        });
      }

    } catch (error) {
      const syncError = error as Error;
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncError
      }));

      reportError(new NetworkError('Sync failed', {
        context: { 
          error: syncError,
          operationCount: operationsToSync.length 
        }
      }));

      if (!state.isOnline) {
        toast({
          title: 'Offline',
          description: 'Changes will be synced when connection is restored.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: 'Some changes could not be synchronized.',
          variant: 'destructive'
        });
      }
    } finally {
      syncInProgressRef.current = false;
    }
  }, [state.pendingOperations, state.isOnline, onSync, onConflict, maxRetries, savePendingOperations]);

  // Sync a single operation
  const syncOperation = async (operation: SyncOperation) => {
    // This is a placeholder - implement based on your API
    const endpoint = `/api/${operation.resource}`;
    
    switch (operation.type) {
      case 'create':
        await networkErrorHandler.fetchWithRetry(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation.data)
        });
        break;
        
      case 'update':
        await networkErrorHandler.fetchWithRetry(`${endpoint}/${operation.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation.data)
        });
        break;
        
      case 'delete':
        await networkErrorHandler.fetchWithRetry(`${endpoint}/${operation.data.id}`, {
          method: 'DELETE'
        });
        break;
    }
  };

  // Retry failed operations
  const retryFailedOperations = useCallback(() => {
    const retriableOperations = state.failedOperations.map(op => ({
      ...op,
      status: 'pending' as const,
      retryCount: 0
    }));

    setState(prev => ({
      ...prev,
      pendingOperations: [...prev.pendingOperations, ...retriableOperations],
      failedOperations: []
    }));

    if (state.isOnline) {
      performSync();
    }
  }, [state.failedOperations, state.isOnline, performSync]);

  // Clear all pending operations
  const clearPendingOperations = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendingOperations: [],
      failedOperations: []
    }));
    
    localStorage.removeItem(storageKey);
    
    toast({
      title: 'Cleared',
      description: 'All pending operations have been cleared.',
      variant: 'default'
    });
  }, [storageKey]);

  // Get operation status
  const getOperationStatus = useCallback((operationId: string) => {
    const operation = state.pendingOperations.find(op => op.id === operationId) ||
                     state.failedOperations.find(op => op.id === operationId);
    
    return operation?.status || null;
  }, [state.pendingOperations, state.failedOperations]);

  // Setup online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      performSync();
      
      toast({
        title: 'Back Online',
        description: 'Connection restored. Syncing changes...',
        variant: 'default'
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      
      toast({
        title: 'Offline',
        description: 'You are working offline. Changes will sync when reconnected.',
        variant: 'default'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performSync]);

  // Setup periodic sync
  useEffect(() => {
    if (syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (state.isOnline && state.pendingOperations.length > 0) {
          performSync();
        }
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, state.isOnline, state.pendingOperations.length, performSync]);

  // Load pending operations on mount
  useEffect(() => {
    loadPendingOperations();
  }, [loadPendingOperations]);

  return {
    ...state,
    queueOperation,
    sync: performSync,
    retryFailedOperations,
    clearPendingOperations,
    getOperationStatus,
    hasUnsyncedChanges: state.pendingOperations.length > 0,
    totalPending: state.pendingOperations.length + state.failedOperations.length
  };
}