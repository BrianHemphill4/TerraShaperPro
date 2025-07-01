'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { StateValidator } from '@/lib/error/stateValidator';
import { stateRecovery } from '@/lib/error/stateRecovery';
import { ValidationError, StateError } from '@/lib/error/errorTypes';
import { reportError } from '@/lib/error/errorReporter';
import { toast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  repaired?: any;
}

interface StateValidationOptions {
  validateOnChange?: boolean;
  autoRepair?: boolean;
  validationInterval?: number;
  onValidationError?: (errors: string[]) => void;
  onRepair?: (repairedState: any) => void;
}

interface StateValidationState {
  isValidating: boolean;
  isValid: boolean;
  validationErrors: string[];
  lastValidation: Date | null;
  repairAttempts: number;
}

export function useStateValidation<T>(
  state: T,
  stateType: string,
  options: StateValidationOptions = {}
) {
  const {
    validateOnChange = true,
    autoRepair = true,
    validationInterval = 300000, // 5 minutes
    onValidationError,
    onRepair
  } = options;

  const [validationState, setValidationState] = useState<StateValidationState>({
    isValidating: false,
    isValid: true,
    validationErrors: [],
    lastValidation: null,
    repairAttempts: 0
  });

  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastValidStateRef = useRef<T>(state);

  // Validate state
  const validateState = useCallback(async (
    stateToValidate: T
  ): Promise<ValidationResult> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      // Check for corruption
      const issues = StateValidator.detectCorruption(stateToValidate, stateType);
      
      if (issues.length === 0) {
        // Try full validation
        StateValidator.validate(stateType, stateToValidate);
        
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          isValid: true,
          validationErrors: [],
          lastValidation: new Date(),
          repairAttempts: 0
        }));

        // Store last valid state
        lastValidStateRef.current = stateToValidate;

        return {
          isValid: true,
          errors: []
        };
      } else {
        // Validation failed
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          isValid: false,
          validationErrors: issues,
          lastValidation: new Date()
        }));

        if (onValidationError) {
          onValidationError(issues);
        }

        // Try to repair if enabled
        if (autoRepair) {
          const repaired = await attemptRepair(stateToValidate, issues);
          if (repaired) {
            return {
              isValid: false,
              errors: issues,
              repaired
            };
          }
        }

        return {
          isValid: false,
          errors: issues
        };
      }
    } catch (error) {
      const validationError = error as Error;
      const errors = [validationError.message];

      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false,
        validationErrors: errors,
        lastValidation: new Date()
      }));

      reportError(new ValidationError('State validation failed', {
        context: { stateType, error: validationError }
      }));

      return {
        isValid: false,
        errors
      };
    }
  }, [stateType, autoRepair, onValidationError]);

  // Attempt to repair corrupted state
  const attemptRepair = useCallback(async (
    corruptedState: T,
    issues: string[]
  ): Promise<T | null> => {
    setValidationState(prev => ({
      ...prev,
      repairAttempts: prev.repairAttempts + 1
    }));

    try {
      // First, try StateValidator repair
      const repaired = StateValidator.repair(stateType, corruptedState);
      
      if (repaired && StateValidator.isValid(stateType, repaired)) {
        toast({
          title: 'State Repaired',
          description: 'Corrupted state has been automatically repaired.',
          variant: 'default'
        });

        if (onRepair) {
          onRepair(repaired);
        }

        setValidationState(prev => ({
          ...prev,
          isValid: true,
          validationErrors: [],
          repairAttempts: 0
        }));

        return repaired as T;
      }

      // If that fails, try state recovery
      const recovered = await stateRecovery.recoverCorruptedState(
        stateType,
        corruptedState
      );

      if (recovered) {
        toast({
          title: 'State Recovered',
          description: 'State has been recovered from a previous snapshot.',
          variant: 'default'
        });

        if (onRepair) {
          onRepair(recovered);
        }

        setValidationState(prev => ({
          ...prev,
          isValid: true,
          validationErrors: [],
          repairAttempts: 0
        }));

        return recovered as T;
      }

      // Repair failed
      reportError(new StateError('State repair failed', {
        context: { stateType, issues },
        severity: 'high' as any
      }));

      return null;
    } catch (error) {
      reportError(new StateError('Critical state repair failure', {
        context: { stateType, error },
        severity: 'critical' as any
      }));

      return null;
    }
  }, [stateType, onRepair]);

  // Force validation
  const forceValidate = useCallback(async () => {
    return validateState(state);
  }, [state, validateState]);

  // Get last valid state
  const getLastValidState = useCallback((): T => {
    return lastValidStateRef.current;
  }, []);

  // Reset to last valid state
  const resetToValidState = useCallback(async (): Promise<T> => {
    const lastValid = lastValidStateRef.current;
    
    // Validate the last known valid state
    const result = await validateState(lastValid);
    
    if (result.isValid) {
      toast({
        title: 'State Reset',
        description: 'State has been reset to the last valid version.',
        variant: 'default'
      });
      
      return lastValid;
    } else {
      // Even the last valid state is corrupted, try recovery
      const recovered = await stateRecovery.getLatestSnapshot(stateType);
      
      if (recovered) {
        const restoredState = await stateRecovery.restoreSnapshot(recovered.id);
        
        toast({
          title: 'State Restored',
          description: 'State has been restored from a backup.',
          variant: 'default'
        });
        
        return restoredState as T;
      }
      
      throw new StateError('No valid state available', {
        severity: 'critical' as any
      });
    }
  }, [stateType, validateState]);

  // Effect: Validate on state change
  useEffect(() => {
    if (!validateOnChange) return;

    // Debounce validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateState(state);
    }, 1000);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [state, validateOnChange, validateState]);

  // Effect: Periodic validation
  useEffect(() => {
    if (validationInterval <= 0) return;

    const intervalId = setInterval(() => {
      validateState(state);
    }, validationInterval);

    return () => clearInterval(intervalId);
  }, [state, validationInterval, validateState]);

  // Effect: Create recovery snapshot on valid state
  useEffect(() => {
    if (validationState.isValid && validationState.lastValidation) {
      // Create a snapshot of valid state
      stateRecovery.createSnapshot(stateType, state, {
        reason: 'Valid state snapshot',
        autoSnapshot: true
      }).catch(console.error);
    }
  }, [validationState.isValid, validationState.lastValidation, state, stateType]);

  return {
    ...validationState,
    validateState: forceValidate,
    getLastValidState,
    resetToValidState,
    canRecover: validationState.repairAttempts < 3
  };
}