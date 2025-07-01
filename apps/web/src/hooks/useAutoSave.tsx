'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { snapshotManager } from '@/lib/error/stateSnapshot';
import { conflictResolver, ConflictResolutionStrategy } from '@/lib/error/conflictResolver';
import { toast } from '@/hooks/use-toast';
import { reportError } from '@/lib/error/errorReporter';
import { SyncError } from '@/lib/error/errorTypes';

interface AutoSaveOptions {
  interval?: number; // Save interval in ms
  debounceDelay?: number; // Debounce delay for changes
  maxVersions?: number; // Max number of versions to keep
  conflictStrategy?: ConflictResolutionStrategy;
  onSave?: (data: any) => Promise<void>;
  onConflict?: (conflicts: any[]) => Promise<any>;
  onError?: (error: Error) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: Error | null;
  conflictDetected: boolean;
  saveCount: number;
}

export function useAutoSave<T>(
  data: T,
  stateType: string,
  options: AutoSaveOptions = {}
) {
  const {
    interval = 60000, // 1 minute
    debounceDelay = 2000, // 2 seconds
    maxVersions = 10,
    conflictStrategy = ConflictResolutionStrategy.MERGE,
    onSave,
    onConflict,
    onError
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null,
    conflictDetected: false,
    saveCount: 0
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<T>(data);
  const remoteVersionRef = useRef<T | null>(null);
  const saveQueueRef = useRef<Array<() => Promise<void>>>([]);
  const isProcessingRef = useRef(false);

  // Debounced data for auto-save
  const debouncedData = useDebounce(data, debounceDelay);

  // Check if data has changed
  const hasDataChanged = useCallback((newData: T, oldData: T): boolean => {
    return JSON.stringify(newData) !== JSON.stringify(oldData);
  }, []);

  // Process save queue
  const processSaveQueue = useCallback(async () => {
    if (isProcessingRef.current || saveQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    while (saveQueueRef.current.length > 0) {
      const saveTask = saveQueueRef.current.shift();
      if (saveTask) {
        try {
          await saveTask();
        } catch (error) {
          console.error('Save task failed:', error);
        }
      }
    }

    isProcessingRef.current = false;
  }, []);

  // Core save function
  const performSave = useCallback(async (dataToSave: T, isManual = false) => {
    // Check if data has actually changed
    if (!isManual && !hasDataChanged(dataToSave, lastSavedDataRef.current)) {
      return;
    }

    setState(prev => ({
      ...prev,
      isSaving: true,
      saveError: null
    }));

    try {
      // Create snapshot before save
      const snapshotId = await snapshotManager.autoSave(stateType, dataToSave);

      // Check for remote changes (if we have a remote version)
      if (remoteVersionRef.current && hasDataChanged(dataToSave, remoteVersionRef.current)) {
        const resolution = await conflictResolver.resolveConflicts(
          dataToSave,
          remoteVersionRef.current,
          lastSavedDataRef.current,
          conflictStrategy
        );

        if (resolution.conflicts.length > 0) {
          setState(prev => ({ ...prev, conflictDetected: true }));

          // Handle conflicts
          let resolvedData = resolution.resolvedValue;
          
          if (onConflict) {
            resolvedData = await onConflict(resolution.conflicts);
          } else if (conflictStrategy === ConflictResolutionStrategy.MANUAL) {
            throw new SyncError('Manual conflict resolution required', {
              context: { conflicts: resolution.conflicts }
            });
          }

          dataToSave = resolvedData;
        }
      }

      // Perform the actual save
      if (onSave) {
        await onSave(dataToSave);
      }

      // Update references
      lastSavedDataRef.current = dataToSave;
      remoteVersionRef.current = dataToSave;

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveError: null,
        conflictDetected: false,
        saveCount: prev.saveCount + 1
      }));

      // Show success feedback for manual saves
      if (isManual) {
        toast({
          title: 'Saved',
          description: 'Your changes have been saved successfully.',
          variant: 'default'
        });
      }

    } catch (error) {
      const saveError = error as Error;
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError,
        hasUnsavedChanges: true
      }));

      reportError(new SyncError('Auto-save failed', {
        context: { error: saveError, stateType }
      }));

      if (onError) {
        onError(saveError);
      } else {
        toast({
          title: 'Save Failed',
          description: saveError.message || 'Failed to save your changes.',
          variant: 'destructive'
        });
      }

      throw error;
    }
  }, [stateType, hasDataChanged, conflictStrategy, onSave, onConflict, onError]);

  // Queue a save operation
  const queueSave = useCallback((dataToSave: T, isManual = false) => {
    saveQueueRef.current.push(async () => {
      await performSave(dataToSave, isManual);
    });

    processSaveQueue();
  }, [performSave, processSaveQueue]);

  // Manual save trigger
  const save = useCallback(async () => {
    return queueSave(data, true);
  }, [data, queueSave]);

  // Force save (bypasses queue)
  const forceSave = useCallback(async () => {
    await performSave(data, true);
  }, [data, performSave]);

  // Load remote version for conflict detection
  const loadRemoteVersion = useCallback(async (remoteData: T) => {
    remoteVersionRef.current = remoteData;
    
    // Check for conflicts immediately
    if (hasDataChanged(data, remoteData) && hasDataChanged(data, lastSavedDataRef.current)) {
      setState(prev => ({ ...prev, conflictDetected: true }));
    }
  }, [data, hasDataChanged]);

  // Reset save state
  const resetSaveState = useCallback(() => {
    setState({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      saveError: null,
      conflictDetected: false,
      saveCount: 0
    });
    lastSavedDataRef.current = data;
    remoteVersionRef.current = null;
    saveQueueRef.current = [];
  }, [data]);

  // Effect for auto-save on data changes
  useEffect(() => {
    if (!debouncedData) return;

    const hasChanges = hasDataChanged(debouncedData, lastSavedDataRef.current);
    
    setState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));

    if (hasChanges) {
      queueSave(debouncedData, false);
    }
  }, [debouncedData, hasDataChanged, queueSave]);

  // Effect for periodic auto-save
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (state.hasUnsavedChanges && !state.isSaving) {
        queueSave(data, false);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, state.hasUnsavedChanges, state.isSaving, data, queueSave]);

  // Effect for beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Try to save any pending changes
      if (state.hasUnsavedChanges) {
        forceSave().catch(console.error);
      }
    };
  }, [state.hasUnsavedChanges, forceSave]);

  return {
    ...state,
    save,
    forceSave,
    loadRemoteVersion,
    resetSaveState,
    canSave: !state.isSaving && state.hasUnsavedChanges,
    timeSinceLastSave: state.lastSaved 
      ? Date.now() - state.lastSaved.getTime() 
      : null
  };
}