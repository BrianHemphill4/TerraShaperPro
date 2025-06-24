import { useCallback, useMemo, useState } from 'react';

export type FilterField<T> = {
  key: keyof T;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
};

export type UseFilterFormOptions<T> = {
  initialFilters?: Partial<T>;
  onFiltersChange?: (filters: Partial<T>) => void;
  debounceMs?: number;
};

export type UseFilterFormActions<T> = {
  updateFilter: <K extends keyof T>(key: K, value: T[K] | undefined) => void;
  toggleArrayItem: <K extends keyof T>(key: K, item: T[K] extends (infer U)[] ? U : never) => void;
  clearFilter: <K extends keyof T>(key: K) => void;
  clearAllFilters: () => void;
  resetFilters: () => void;
  setFilters: (filters: Partial<T>) => void;
};

export type UseFilterFormResult<T> = {
  filters: Partial<T>;
  hasFilters: boolean;
  filterCount: number;
  actions: UseFilterFormActions<T>;
};

export function useFilterForm<T extends Record<string, any>>(
  options: UseFilterFormOptions<T> = {}
): UseFilterFormResult<T> {
  const { initialFilters = {}, onFiltersChange, debounceMs = 0 } = options;

  const [filters, setFilters] = useState<Partial<T>>(initialFilters);

  // Memoized derived state
  const hasFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);
  const filterCount = useMemo(() => Object.keys(filters).length, [filters]);

  // Debounced callback if specified
  const debouncedOnFiltersChange = useMemo(() => {
    if (!onFiltersChange || debounceMs === 0) return onFiltersChange;

    let timeoutId: NodeJS.Timeout;
    return (newFilters: Partial<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => onFiltersChange(newFilters), debounceMs);
    };
  }, [onFiltersChange, debounceMs]);

  const updateFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) => {
      setFilters((prev) => {
        const newFilters = { ...prev };

        if (value === undefined || value === null || value === '') {
          delete newFilters[key];
        } else if (Array.isArray(value) && value.length === 0) {
          delete newFilters[key];
        } else {
          newFilters[key] = value;
        }

        debouncedOnFiltersChange?.(newFilters);
        return newFilters;
      });
    },
    [debouncedOnFiltersChange]
  );

  const toggleArrayItem = useCallback(
    <K extends keyof T>(key: K, item: T[K] extends (infer U)[] ? U : never) => {
      setFilters((prev) => {
        const currentArray = (prev[key] as any[]) || [];
        const newArray = currentArray.includes(item)
          ? currentArray.filter((i) => i !== item)
          : [...currentArray, item];

        const newFilters = { ...prev };
        if (newArray.length === 0) {
          delete newFilters[key];
        } else {
          newFilters[key] = newArray as T[K];
        }

        debouncedOnFiltersChange?.(newFilters);
        return newFilters;
      });
    },
    [debouncedOnFiltersChange]
  );

  const clearFilter = useCallback(
    <K extends keyof T>(key: K) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[key];
        debouncedOnFiltersChange?.(newFilters);
        return newFilters;
      });
    },
    [debouncedOnFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    setFilters({});
    debouncedOnFiltersChange?.({});
  }, [debouncedOnFiltersChange]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    debouncedOnFiltersChange?.(initialFilters);
  }, [initialFilters, debouncedOnFiltersChange]);

  const setFiltersDirectly = useCallback(
    (newFilters: Partial<T>) => {
      setFilters(newFilters);
      debouncedOnFiltersChange?.(newFilters);
    },
    [debouncedOnFiltersChange]
  );

  return {
    filters,
    hasFilters,
    filterCount,
    actions: {
      updateFilter,
      toggleArrayItem,
      clearFilter,
      clearAllFilters,
      resetFilters,
      setFilters: setFiltersDirectly,
    },
  };
}
