import { useCallback, useMemo, useState } from 'react';

export type FormStep<T = any> = {
  id: string;
  title: string;
  description?: string;
  isValid?: (data: T) => boolean;
  isRequired?: boolean;
  component?: React.ComponentType<any>;
};

export type UseMultiStepFormOptions<T> = {
  initialData?: Partial<T>;
  onStepChange?: (currentStep: number, stepId: string) => void;
  onComplete?: (data: T) => void;
  onCancel?: () => void;
  validateOnNext?: boolean;
  persistData?: boolean;
  storageKey?: string;
};

export type UseMultiStepFormState<T> = {
  currentStep: number;
  currentStepId: string;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  completedSteps: Set<number>;
  data: Partial<T>;
  canGoNext: boolean;
  canGoPrevious: boolean;
};

export type UseMultiStepFormActions<T> = {
  goToStep: (step: number) => void;
  goToStepById: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToFirstStep: () => void;
  goToLastStep: () => void;
  updateData: (data: Partial<T>) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  resetForm: () => void;
  markStepCompleted: (step?: number) => void;
  markStepIncomplete: (step?: number) => void;
  completeForm: () => void;
  cancelForm: () => void;
};

export type UseMultiStepFormResult<T> = {
  steps: FormStep<T>[];
  currentStepData: FormStep<T>;
  actions: UseMultiStepFormActions<T>;
  progress: number;
} & UseMultiStepFormState<T>;

export function useMultiStepForm<T extends Record<string, any>>(
  steps: FormStep<T>[],
  options: UseMultiStepFormOptions<T> = {}
): UseMultiStepFormResult<T> {
  const {
    initialData = {},
    onStepChange,
    onComplete,
    onCancel,
    validateOnNext = true,
    persistData = false,
    storageKey = 'multiStepFormData',
  } = options;

  // Load persisted data if enabled
  const getInitialData = (): Partial<T> => {
    if (persistData && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
      } catch {
        return initialData;
      }
    }
    return initialData;
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<T>>(getInitialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Persist data when it changes
  const persistFormData = useCallback(
    (newData: Partial<T>) => {
      if (persistData && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newData));
        } catch (error) {
          console.warn('Failed to persist form data:', error);
        }
      }
    },
    [persistData, storageKey]
  );

  // Memoized derived state
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepData = steps[currentStep];
  const currentStepId = currentStepData?.id || '';

  const canGoNext = useMemo(() => {
    if (isLastStep) return false;
    if (!validateOnNext) return true;

    const step = steps[currentStep];
    return !step?.isValid || step.isValid(data as T);
  }, [currentStep, isLastStep, validateOnNext, steps, data]);

  const canGoPrevious = useMemo(() => !isFirstStep, [isFirstStep]);

  const progress = useMemo(() => {
    return totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;
  }, [currentStep, totalSteps]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step, steps[step]?.id || '');
      }
    },
    [totalSteps, steps, onStepChange]
  );

  const goToStepById = useCallback(
    (stepId: string) => {
      const stepIndex = steps.findIndex((step) => step.id === stepId);
      if (stepIndex !== -1) {
        goToStep(stepIndex);
      }
    },
    [steps, goToStep]
  );

  const nextStep = useCallback(() => {
    if (canGoNext) {
      const nextStepIndex = currentStep + 1;
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      goToStep(nextStepIndex);
    }
  }, [canGoNext, currentStep, goToStep]);

  const previousStep = useCallback(() => {
    if (canGoPrevious) {
      goToStep(currentStep - 1);
    }
  }, [canGoPrevious, currentStep, goToStep]);

  const goToFirstStep = useCallback(() => {
    goToStep(0);
  }, [goToStep]);

  const goToLastStep = useCallback(() => {
    goToStep(totalSteps - 1);
  }, [goToStep, totalSteps]);

  const updateData = useCallback(
    (newData: Partial<T>) => {
      const updatedData = { ...data, ...newData };
      setData(updatedData);
      persistFormData(updatedData);
    },
    [data, persistFormData]
  );

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      updateData({ [field]: value } as Partial<T>);
    },
    [updateData]
  );

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setData(initialData);
    setCompletedSteps(new Set());

    if (persistData && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [initialData, persistData, storageKey]);

  const markStepCompleted = useCallback(
    (step: number = currentStep) => {
      setCompletedSteps((prev) => new Set([...prev, step]));
    },
    [currentStep]
  );

  const markStepIncomplete = useCallback(
    (step: number = currentStep) => {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(step);
        return newSet;
      });
    },
    [currentStep]
  );

  const completeForm = useCallback(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    onComplete?.(data as T);

    if (persistData && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [currentStep, data, onComplete, persistData, storageKey]);

  const cancelForm = useCallback(() => {
    onCancel?.();
    resetForm();
  }, [onCancel, resetForm]);

  return {
    steps,
    currentStep,
    currentStepId,
    currentStepData,
    totalSteps,
    isFirstStep,
    isLastStep,
    completedSteps,
    data,
    canGoNext,
    canGoPrevious,
    progress,
    actions: {
      goToStep,
      goToStepById,
      nextStep,
      previousStep,
      goToFirstStep,
      goToLastStep,
      updateData,
      updateField,
      resetForm,
      markStepCompleted,
      markStepIncomplete,
      completeForm,
      cancelForm,
    },
  };
}
