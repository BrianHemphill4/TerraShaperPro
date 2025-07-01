'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useErrorHandler } from '@/components/error-boundary';
import { handleError } from '@/lib/error/errorHandlers';
import { stateRecovery } from '@/lib/error/stateRecovery';
import { snapshotManager } from '@/lib/error/stateSnapshot';
import type { AppError } from '@/lib/error/errorTypes';

interface UseErrorRecoveryOptions {
  autoRecover?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: AppError) => void;
  onRecovery?: (error: AppError) => void;
  onRecoveryFailed?: (error: AppError) => void;
}

interface ErrorRecoveryState {
  isRecovering: boolean;
  lastError: AppError | null;
  recoveryAttempts: number;
  canRecover: boolean;
}

export function useErrorRecovery(options: UseErrorRecoveryOptions = {}) {
  const {
    autoRecover = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRecovery,
    onRecoveryFailed
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    lastError: null,
    recoveryAttempts: 0,
    canRecover: true
  });

  const errorHandler = useErrorHandler();
  const recoveryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // Handle errors with recovery
  const handleErrorWithRecovery = useCallback(async (error: Error | AppError) => {
    const appError = error as AppError;
    
    // Update state
    setState(prev => ({
      ...prev,
      lastError: appError,
      canRecover: appError.recoverable !== false
    }));

    // Call custom error handler
    onError?.(appError);

    // Report error
    errorHandler(error);

    if (!autoRecover || !appError.recoverable) {
      return false;
    }

    // Get retry count for this error type
    const errorKey = `${appError.type}-${appError.message}`;
    const currentRetries = retryCountRef.current.get(errorKey) || 0;

    if (currentRetries >= maxRetries) {
      setState(prev => ({ ...prev, canRecover: false }));
      onRecoveryFailed?.(appError);
      return false;
    }

    setState(prev => ({
      ...prev,
      isRecovering: true,
      recoveryAttempts: currentRetries + 1
    }));

    // Attempt recovery with exponential backoff
    const delay = retryDelay * Math.pow(2, currentRetries);
    
    recoveryTimeoutRef.current = setTimeout(async () => {
      try {
        const recovered = await handleError(appError);
        
        if (recovered) {
          // Reset retry count on success
          retryCountRef.current.delete(errorKey);
          
          setState(prev => ({
            ...prev,
            isRecovering: false,
            recoveryAttempts: 0,
            lastError: null
          }));
          
          onRecovery?.(appError);
          return true;
        } else {
          // Increment retry count
          retryCountRef.current.set(errorKey, currentRetries + 1);
          
          // Try again if retries available
          if (currentRetries + 1 < maxRetries) {
            return handleErrorWithRecovery(appError);
          } else {
            setState(prev => ({
              ...prev,
              isRecovering: false,
              canRecover: false
            }));
            
            onRecoveryFailed?.(appError);
            return false;
          }
        }
      } catch (recoveryError) {
        setState(prev => ({
          ...prev,
          isRecovering: false,
          canRecover: false
        }));
        
        onRecoveryFailed?.(appError);
        return false;
      }
    }, delay);

    return true;
  }, [autoRecover, maxRetries, retryDelay, errorHandler, onError, onRecovery, onRecoveryFailed]);

  // Create recovery checkpoint
  const createRecoveryCheckpoint = useCallback(async (
    type: string,
    state: any,
    operation: string
  ) => {
    try {
      return await snapshotManager.createCheckpoint(type, state, operation);
    } catch (error) {
      handleErrorWithRecovery(error as Error);
      throw error;
    }
  }, [handleErrorWithRecovery]);

  // Restore from checkpoint
  const restoreFromCheckpoint = useCallback(async (
    snapshotId: string,
    type: string
  ) => {
    try {
      setState(prev => ({ ...prev, isRecovering: true }));
      
      const restoredState = await snapshotManager.restoreToSnapshot(snapshotId, type);
      
      setState(prev => ({
        ...prev,
        isRecovering: false,
        lastError: null,
        recoveryAttempts: 0
      }));
      
      return restoredState;
    } catch (error) {
      setState(prev => ({ ...prev, isRecovering: false }));
      handleErrorWithRecovery(error as Error);
      throw error;
    }
  }, [handleErrorWithRecovery]);

  // Execute operation with recovery
  const executeWithRecovery = useCallback(async <T,>(
    operation: () => Promise<T>,
    stateType?: string,
    getState?: () => any
  ): Promise<T> => {
    let checkpointId: string | undefined;

    try {
      // Create checkpoint if state provided
      if (stateType && getState) {
        checkpointId = await createRecoveryCheckpoint(
          stateType,
          getState(),
          'operation'
        );
      }

      // Execute operation
      const result = await operation();
      
      // Clear any error state on success
      setState(prev => ({
        ...prev,
        lastError: null,
        recoveryAttempts: 0
      }));

      return result;
    } catch (error) {
      const appError = error as AppError;
      
      // Attempt automatic recovery
      const recovered = await handleErrorWithRecovery(appError);

      if (!recovered && checkpointId && stateType) {
        // Try to restore from checkpoint
        try {
          await restoreFromCheckpoint(checkpointId, stateType);
        } catch (restoreError) {
          // Recovery failed completely
          console.error('Failed to restore from checkpoint:', restoreError);
        }
      }

      throw error;
    }
  }, [createRecoveryCheckpoint, handleErrorWithRecovery, restoreFromCheckpoint]);

  // Reset error state
  const resetError = useCallback(() => {
    setState({
      isRecovering: false,
      lastError: null,
      recoveryAttempts: 0,
      canRecover: true
    });
    retryCountRef.current.clear();
  }, []);

  // Manual recovery trigger
  const triggerRecovery = useCallback(async () => {
    if (!state.lastError || state.isRecovering) {
      return false;
    }

    return handleErrorWithRecovery(state.lastError);
  }, [state.lastError, state.isRecovering, handleErrorWithRecovery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    handleError: handleErrorWithRecovery,
    createCheckpoint: createRecoveryCheckpoint,
    restoreCheckpoint: restoreFromCheckpoint,
    executeWithRecovery,
    resetError,
    triggerRecovery
  };
}