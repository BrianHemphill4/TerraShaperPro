import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error: Error | null;
}

interface LoadingStateManager {
  state: LoadingState;
  startLoading: (message?: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  finishLoading: () => void;
  setError: (error: Error) => void;
  reset: () => void;
}

export function useLoadingState(initialMessage = 'Loading...'): LoadingStateManager {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: initialMessage,
    error: null,
  });

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message: message || initialMessage,
      error: null,
    });
  }, [initialMessage]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(Math.max(0, progress), 100),
      message: message || prev.message,
    }));
  }, []);

  const finishLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100,
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: initialMessage,
      error: null,
    });
  }, [initialMessage]);

  return {
    state,
    startLoading,
    updateProgress,
    finishLoading,
    setError,
    reset,
  };
}

interface AsyncLoadingOptions {
  onProgress?: (progress: number) => void;
  progressSteps?: number;
}

export function useAsyncLoading<T>(
  asyncFn: () => Promise<T>,
  options: AsyncLoadingOptions = {}
): {
  execute: () => Promise<T | undefined>;
  loading: LoadingStateManager;
} {
  const loading = useLoadingState();
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    try {
      loading.startLoading();
      abortControllerRef.current = new AbortController();

      const { progressSteps = 1 } = options;
      let currentStep = 0;

      if (options.onProgress) {
        const progressInterval = setInterval(() => {
          if (currentStep < progressSteps - 1) {
            currentStep++;
            const progress = (currentStep / progressSteps) * 90;
            loading.updateProgress(progress);
            options.onProgress?.(progress);
          }
        }, 100);

        try {
          const result = await asyncFn();
          clearInterval(progressInterval);
          loading.finishLoading();
          return result;
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      } else {
        const result = await asyncFn();
        loading.finishLoading();
        return result;
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        loading.setError(error);
      }
      return undefined;
    }
  }, [asyncFn, loading, options]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { execute, loading };
}

export function useMultiLoadingState(): {
  states: Map<string, LoadingState>;
  startLoading: (key: string, message?: string) => void;
  updateProgress: (key: string, progress: number, message?: string) => void;
  finishLoading: (key: string) => void;
  setError: (key: string, error: Error) => void;
  reset: (key?: string) => void;
  isAnyLoading: boolean;
  overallProgress: number;
} {
  const [states, setStates] = useState<Map<string, LoadingState>>(new Map());

  const startLoading = useCallback((key: string, message = 'Loading...') => {
    setStates(prev => {
      const next = new Map(prev);
      next.set(key, {
        isLoading: true,
        progress: 0,
        message,
        error: null,
      });
      return next;
    });
  }, []);

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setStates(prev => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current) {
        next.set(key, {
          ...current,
          progress: Math.min(Math.max(0, progress), 100),
          message: message || current.message,
        });
      }
      return next;
    });
  }, []);

  const finishLoading = useCallback((key: string) => {
    setStates(prev => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current) {
        next.set(key, {
          ...current,
          isLoading: false,
          progress: 100,
        });
      }
      return next;
    });
  }, []);

  const setError = useCallback((key: string, error: Error) => {
    setStates(prev => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current) {
        next.set(key, {
          ...current,
          isLoading: false,
          error,
        });
      }
      return next;
    });
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    } else {
      setStates(new Map());
    }
  }, []);

  const isAnyLoading = Array.from(states.values()).some(state => state.isLoading);
  
  const overallProgress = states.size === 0 
    ? 0 
    : Array.from(states.values()).reduce((sum, state) => sum + state.progress, 0) / states.size;

  return {
    states,
    startLoading,
    updateProgress,
    finishLoading,
    setError,
    reset,
    isAnyLoading,
    overallProgress,
  };
}