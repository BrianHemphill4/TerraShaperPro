import { useCallback, useMemo, useState } from 'react';

export type FormError = {
  field?: string;
  message: string;
  type?: 'validation' | 'server' | 'network' | 'custom';
};

export type UseFormErrorsOptions = {
  clearOnChange?: boolean;
  maxErrors?: number;
};

export type UseFormErrorsState = {
  errors: FormError[];
  hasErrors: boolean;
  errorCount: number;
  fieldErrors: Record<string, FormError[]>;
  globalErrors: FormError[];
};

export type UseFormErrorsActions = {
  addError: (error: FormError | string, field?: string) => void;
  addErrors: (errors: FormError[] | Record<string, string>) => void;
  removeError: (index: number) => void;
  removeFieldErrors: (field: string) => void;
  clearAllErrors: () => void;
  clearFieldError: (field: string) => void;
  setErrors: (errors: FormError[]) => void;
};

export type UseFormErrorsResult = {
  actions: UseFormErrorsActions;
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
} & UseFormErrorsState;

export function useFormErrors(options: UseFormErrorsOptions = {}): UseFormErrorsResult {
  const { clearOnChange = true, maxErrors = 10 } = options;
  const [errors, setErrors] = useState<FormError[]>([]);

  // Memoized derived state
  const hasErrors = useMemo(() => errors.length > 0, [errors]);
  const errorCount = useMemo(() => errors.length, [errors]);

  const fieldErrors = useMemo(() => {
    return errors.reduce(
      (acc, error) => {
        if (error.field) {
          if (!acc[error.field]) {
            acc[error.field] = [];
          }
          acc[error.field]!.push(error);
        }
        return acc;
      },
      {} as Record<string, FormError[]>
    );
  }, [errors]);

  const globalErrors = useMemo(() => {
    return errors.filter((error) => !error.field);
  }, [errors]);

  const addError = useCallback(
    (error: FormError | string, field?: string) => {
      const formError: FormError =
        typeof error === 'string' ? { message: error, field, type: 'custom' } : error;

      setErrors((prev) => {
        const newErrors = [...prev, formError];
        return newErrors.slice(-maxErrors); // Keep only the last maxErrors errors
      });
    },
    [maxErrors]
  );

  const addErrors = useCallback(
    (newErrors: FormError[] | Record<string, string>) => {
      if (Array.isArray(newErrors)) {
        setErrors((prev) => [...prev, ...newErrors].slice(-maxErrors));
      } else {
        // Convert Record<string, string> to FormError[]
        const formErrors: FormError[] = Object.entries(newErrors).map(([field, message]) => ({
          field,
          message,
          type: 'validation' as const,
        }));
        setErrors((prev) => [...prev, ...formErrors].slice(-maxErrors));
      }
    },
    [maxErrors]
  );

  const removeError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeFieldErrors = useCallback((field: string) => {
    setErrors((prev) => prev.filter((error) => error.field !== field));
  }, []);

  const clearFieldError = useCallback(
    (field: string) => {
      if (clearOnChange) {
        removeFieldErrors(field);
      }
    },
    [clearOnChange, removeFieldErrors]
  );

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const setErrorsDirectly = useCallback(
    (newErrors: FormError[]) => {
      setErrors(newErrors.slice(-maxErrors));
    },
    [maxErrors]
  );

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      const fieldError = fieldErrors[field]?.[0];
      return fieldError?.message;
    },
    [fieldErrors]
  );

  const hasFieldError = useCallback(
    (field: string): boolean => {
      return Boolean(fieldErrors[field]?.length);
    },
    [fieldErrors]
  );

  return {
    errors,
    hasErrors,
    errorCount,
    fieldErrors,
    globalErrors,
    actions: {
      addError,
      addErrors,
      removeError,
      removeFieldErrors,
      clearAllErrors,
      clearFieldError,
      setErrors: setErrorsDirectly,
    },
    getFieldError,
    hasFieldError,
  };
}
