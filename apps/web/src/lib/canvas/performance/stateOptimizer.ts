/**
 * State Management Optimizer
 * Provides utilities for optimizing React state updates and Zustand stores
 */

import { useCallback, useRef, useMemo, DependencyList } from 'react';
import { shallow } from 'zustand/shallow';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Debounced state updater for rapid state changes
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 100
): [T, (value: T) => void, T] {
  const [state, setState] = React.useState(initialValue);
  const [debouncedState, setDebouncedState] = React.useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setDebouncedValue = useCallback((value: T) => {
    setState(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedState(value);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedState, setDebouncedValue, state];
}

/**
 * Batched state updates for multiple rapid changes
 */
export class StateUpdateBatcher<T> {
  private updates: Partial<T>[] = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private callback: (updates: Partial<T>) => void;
  private delay: number;

  constructor(callback: (updates: Partial<T>) => void, delay: number = 16) {
    this.callback = callback;
    this.delay = delay;
  }

  add(update: Partial<T>): void {
    this.updates.push(update);
    
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  }

  flush(): void {
    if (this.updates.length === 0) return;

    // Merge all updates
    const merged = this.updates.reduce((acc, update) => ({
      ...acc,
      ...update
    }), {} as Partial<T>);

    this.callback(merged);
    this.updates = [];
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  clear(): void {
    this.updates = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Optimized Zustand selector with shallow comparison
 */
export function useShallowStore<T, U>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U
): U {
  return store(selector, shallow);
}

/**
 * Subscription-based store updates
 */
export function useStoreSubscription<T>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => unknown,
  callback: () => void,
  deps: DependencyList = []
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = store.subscribe(
      (state) => selector(state),
      () => callbackRef.current()
    );
    return unsubscribe;
  }, [store, selector, ...deps]);
}

/**
 * Memoized selector creator for complex state derivations
 */
export function createMemoizedSelector<T, Args extends unknown[], Result>(
  selector: (state: T, ...args: Args) => Result
): (state: T, ...args: Args) => Result {
  const cache = new WeakMap<T, Map<string, Result>>();

  return (state: T, ...args: Args): Result => {
    let stateCache = cache.get(state);
    if (!stateCache) {
      stateCache = new Map();
      cache.set(state, stateCache);
    }

    const key = JSON.stringify(args);
    if (stateCache.has(key)) {
      return stateCache.get(key)!;
    }

    const result = selector(state, ...args);
    stateCache.set(key, result);
    return result;
  };
}

/**
 * History state compression for undo/redo
 */
export class StateCompressor<T> {
  private compressionLevel: number;

  constructor(compressionLevel: number = 5) {
    this.compressionLevel = compressionLevel;
  }

  async compress(state: T): Promise<ArrayBuffer> {
    const json = JSON.stringify(state);
    const encoder = new TextEncoder();
    const data = encoder.encode(json);

    // Use CompressionStream if available
    if ('CompressionStream' in globalThis) {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      writer.write(data);
      writer.close();

      const chunks: Uint8Array[] = [];
      const reader = cs.readable.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      return compressed.buffer;
    }

    // Fallback: return uncompressed
    return data.buffer;
  }

  async decompress(buffer: ArrayBuffer): Promise<T> {
    // Use DecompressionStream if available
    if ('DecompressionStream' in globalThis) {
      try {
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(new Uint8Array(buffer));
        writer.close();

        const chunks: Uint8Array[] = [];
        const reader = ds.readable.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }

        const decoder = new TextDecoder();
        const json = decoder.decode(decompressed);
        return JSON.parse(json);
      } catch {
        // Fall through to uncompressed handling
      }
    }

    // Handle uncompressed data
    const decoder = new TextDecoder();
    const json = decoder.decode(buffer);
    return JSON.parse(json);
  }
}

/**
 * React component memoization helper
 */
export function memoizeComponent<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, propsAreEqual || shallow);
}

/**
 * Selective re-render hook
 */
export function useSelectiveUpdate<T>(
  value: T,
  shouldUpdate: (prev: T, next: T) => boolean
): T {
  const ref = useRef(value);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  if (shouldUpdate(ref.current, value)) {
    ref.current = value;
    forceUpdate();
  }

  return ref.current;
}

/**
 * Performance-optimized state diff
 */
export function createStateDiff<T extends Record<string, unknown>>(
  prev: T,
  next: T
): Partial<T> {
  const diff: Partial<T> = {};
  
  for (const key in next) {
    if (prev[key] !== next[key]) {
      diff[key] = next[key];
    }
  }
  
  return diff;
}

/**
 * Immutable update helper with path support
 */
export function immutableUpdate<T>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  const clone = structuredClone(obj);
  let current: any = clone;
  
  for (const key of keys) {
    current = current[key];
  }
  
  current[lastKey] = value;
  return clone;
}

// Re-export React for convenience
import React, { useEffect } from 'react';