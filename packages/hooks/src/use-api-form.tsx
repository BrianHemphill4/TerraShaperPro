import type { UseMutationResult } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useToast } from './use-toast';

export type UseApiFormOptions<TData, TError = Error> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  resetOnSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string | ((error: TError) => string);
};

export type UseApiFormState<TFormData> = {
  formData: TFormData;
  isSubmitting: boolean;
  error: Error | null;
};

export type UseApiFormActions<TFormData, TInput> = {
  updateField: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
  updateFormData: (data: Partial<TFormData>) => void;
  setFormData: (data: TFormData) => void;
  resetForm: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  submit: (input?: TInput) => Promise<void>;
};

export type UseApiFormResult<TFormData, TInput> = {
  actions: UseApiFormActions<TFormData, TInput>;
} & UseApiFormState<TFormData>;

export function useApiForm<TFormData, TInput = TFormData, TData = unknown, TError = Error>(
  initialData: TFormData,
  mutation: UseMutationResult<TData, TError, TInput>,
  options: UseApiFormOptions<TData, TError> = {}
): UseApiFormResult<TFormData, TInput> {
  const { onSuccess, onError, resetOnSuccess = true, successMessage, errorMessage } = options;

  const { toast } = useToast();
  const [formData, setFormData] = useState<TFormData>(initialData);
  const [error, setError] = useState<Error | null>(null);

  const updateField = useCallback(
    <K extends keyof TFormData>(field: K, value: TFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError(null);
    },
    [error]
  );

  const updateFormData = useCallback(
    (data: Partial<TFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }));
      if (error) setError(null);
    },
    [error]
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setError(null);
  }, [initialData]);

  const submit = useCallback(
    async (input?: TInput) => {
      try {
        setError(null);
        const submitData = input ?? (formData as unknown as TInput);
        const result = await mutation.mutateAsync(submitData);

        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }

        if (resetOnSuccess) {
          resetForm();
        }

        onSuccess?.(result);
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('An error occurred');
        setError(errorInstance);

        const errorMsg =
          typeof errorMessage === 'function'
            ? errorMessage(err as TError)
            : errorMessage || errorInstance.message;

        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });

        onError?.(err as TError);
      }
    },
    [
      formData,
      mutation,
      successMessage,
      errorMessage,
      resetOnSuccess,
      onSuccess,
      onError,
      toast,
      resetForm,
    ]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      await submit();
    },
    [submit]
  );

  return {
    formData,
    isSubmitting: mutation.isPending,
    error,
    actions: {
      updateField,
      updateFormData,
      setFormData,
      resetForm,
      handleSubmit,
      submit,
    },
  };
}
