import { fabric } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CommandHistory, type Command } from '@/lib/commands';

/**
 * Options for the advanced undo/redo hook
 */
interface UseAdvancedUndoRedoOptions {
  maxHistorySize?: number;
  enableBranching?: boolean;
  enablePersistence?: boolean;
  persistenceKey?: string;
  onHistoryChange?: (info: {
    size: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    hasUnsavedChanges: boolean;
  }) => void;
}

/**
 * Advanced undo/redo hook with command pattern support
 */
export const useAdvancedUndoRedo = (
  canvas: fabric.Canvas | null,
  options: UseAdvancedUndoRedoOptions = {}
) => {
  const {
    maxHistorySize = 50,
    enableBranching = false,
    enablePersistence = false,
    persistenceKey = 'terrashaper-history',
    onHistoryChange,
  } = options;

  const [historyInfo, setHistoryInfo] = useState({
    size: 0,
    currentIndex: -1,
    canUndo: false,
    canRedo: false,
    hasUnsavedChanges: false,
    currentBranch: 'main',
    branches: ['main'],
  });

  const commandHistory = useRef<CommandHistory | null>(null);
  const isExecutingCommand = useRef(false);

  // Initialize command history
  useEffect(() => {
    if (!canvas) return;

    commandHistory.current = new CommandHistory(maxHistorySize, enableBranching);

    // Set up history change listener
    const removeListener = commandHistory.current.addListener(() => {
      const info = commandHistory.current!.getHistoryInfo();
      setHistoryInfo(info);
      onHistoryChange?.(info);
    });

    // Load persisted history if enabled
    if (enablePersistence) {
      loadPersistedHistory();
    }

    return () => {
      removeListener();
      if (enablePersistence) {
        persistHistory();
      }
    };
  }, [canvas, maxHistorySize, enableBranching, enablePersistence, persistenceKey, onHistoryChange]);

  // Persist history to localStorage
  const persistHistory = useCallback(() => {
    if (!commandHistory.current || !enablePersistence) return;

    try {
      const historyData = commandHistory.current.exportHistory();
      localStorage.setItem(persistenceKey, JSON.stringify(historyData));
    } catch (error) {
      console.warn('Failed to persist history:', error);
    }
  }, [enablePersistence, persistenceKey]);

  // Load persisted history from localStorage
  const loadPersistedHistory = useCallback(() => {
    if (!commandHistory.current || !enablePersistence) return;

    try {
      const persistedData = localStorage.getItem(persistenceKey);
      if (persistedData) {
        // For now, just clear history as full restoration would require
        // recreating fabric objects from serialized data
        commandHistory.current.clear();
        console.log('History cleared (full restoration not yet implemented)');
      }
    } catch (error) {
      console.warn('Failed to load persisted history:', error);
    }
  }, [enablePersistence, persistenceKey]);

  // Execute a command
  const executeCommand = useCallback(async (command: Command): Promise<boolean> => {
    if (!commandHistory.current || isExecutingCommand.current) {
      return false;
    }

    isExecutingCommand.current = true;

    try {
      await commandHistory.current.execute(command);
      
      // Persist after each command if enabled
      if (enablePersistence) {
        persistHistory();
      }
      
      return true;
    } catch (error) {
      console.error('Command execution failed:', error);
      return false;
    } finally {
      isExecutingCommand.current = false;
    }
  }, [enablePersistence, persistHistory]);

  // Undo the last command
  const undo = useCallback(async (): Promise<boolean> => {
    if (!commandHistory.current || isExecutingCommand.current) {
      return false;
    }

    isExecutingCommand.current = true;

    try {
      const result = await commandHistory.current.undo();
      
      if (result && enablePersistence) {
        persistHistory();
      }
      
      return result;
    } catch (error) {
      console.error('Undo failed:', error);
      return false;
    } finally {
      isExecutingCommand.current = false;
    }
  }, [enablePersistence, persistHistory]);

  // Redo the next command
  const redo = useCallback(async (): Promise<boolean> => {
    if (!commandHistory.current || isExecutingCommand.current) {
      return false;
    }

    isExecutingCommand.current = true;

    try {
      const result = await commandHistory.current.redo();
      
      if (result && enablePersistence) {
        persistHistory();
      }
      
      return result;
    } catch (error) {
      console.error('Redo failed:', error);
      return false;
    } finally {
      isExecutingCommand.current = false;
    }
  }, [enablePersistence, persistHistory]);

  // Jump to a specific history index
  const jumpToHistory = useCallback(async (index: number): Promise<boolean> => {
    if (!commandHistory.current || isExecutingCommand.current) {
      return false;
    }

    isExecutingCommand.current = true;

    try {
      const result = await commandHistory.current.jumpToIndex(index);
      
      if (result && enablePersistence) {
        persistHistory();
      }
      
      return result;
    } catch (error) {
      console.error('History jump failed:', error);
      return false;
    } finally {
      isExecutingCommand.current = false;
    }
  }, [enablePersistence, persistHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    if (!commandHistory.current) return;

    commandHistory.current.clear();
    
    if (enablePersistence) {
      localStorage.removeItem(persistenceKey);
    }
  }, [enablePersistence, persistenceKey]);

  // Mark current state as saved
  const markSaved = useCallback(() => {
    if (!commandHistory.current) return;

    commandHistory.current.markSaved();
    
    if (enablePersistence) {
      persistHistory();
    }
  }, [enablePersistence, persistHistory]);

  // Get full history for display
  const getHistory = useCallback(() => {
    if (!commandHistory.current) return [];
    return commandHistory.current.getHistory();
  }, []);

  // Branch management (if enabled)
  const createBranch = useCallback((name: string): string | null => {
    if (!commandHistory.current || !enableBranching) return null;

    try {
      return commandHistory.current.createBranch(name);
    } catch (error) {
      console.error('Failed to create branch:', error);
      return null;
    }
  }, [enableBranching]);

  const switchBranch = useCallback((branchId: string): boolean => {
    if (!commandHistory.current || !enableBranching) return false;

    return commandHistory.current.switchBranch(branchId);
  }, [enableBranching]);

  const deleteBranch = useCallback((branchId: string): boolean => {
    if (!commandHistory.current || !enableBranching) return false;

    return commandHistory.current.deleteBranch(branchId);
  }, [enableBranching]);

  const getBranches = useCallback(() => {
    if (!commandHistory.current || !enableBranching) return [];
    return commandHistory.current.getBranches();
  }, [enableBranching]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        markSaved();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, markSaved]);

  return {
    // Core undo/redo operations
    executeCommand,
    undo,
    redo,
    jumpToHistory,
    
    // History management
    clearHistory,
    markSaved,
    getHistory,
    
    // State information
    historyInfo,
    canUndo: historyInfo.canUndo,
    canRedo: historyInfo.canRedo,
    hasUnsavedChanges: historyInfo.hasUnsavedChanges,
    
    // Branch management (if enabled)
    createBranch: enableBranching ? createBranch : undefined,
    switchBranch: enableBranching ? switchBranch : undefined,
    deleteBranch: enableBranching ? deleteBranch : undefined,
    getBranches: enableBranching ? getBranches : undefined,
    
    // Utilities
    isExecuting: isExecutingCommand.current,
  };
};

export default useAdvancedUndoRedo;