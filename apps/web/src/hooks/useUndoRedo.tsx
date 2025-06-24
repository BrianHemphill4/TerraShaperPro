import { fabric } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

type HistoryState = {
  json: string;
  timestamp: number;
};

type UseUndoRedoOptions = {
  maxHistorySize?: number;
  excludeFromHistory?: (obj: fabric.Object) => boolean;
};

export const useUndoRedo = (canvas: fabric.Canvas | null, options: UseUndoRedoOptions = {}) => {
  const { maxHistorySize = 50, excludeFromHistory = (obj) => (obj as any).evented === false } =
    options;

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const isPerformingUndoRedo = useRef(false);
  const lastSavedState = useRef<string | null>(null);

  // Save the current canvas state to history
  const saveState = useCallback(() => {
    if (!canvas || isPerformingUndoRedo.current) return;

    // Get only objects that should be included in history
    const objects = canvas.getObjects().filter((obj) => !excludeFromHistory(obj));

    // Create a minimal state representation
    const state = JSON.stringify({
      objects: objects.map((obj) =>
        obj.toObject(['id', 'layerId', 'material', 'plantId', 'plantName'])
      ),
      background: canvas.backgroundColor,
    });

    // Avoid saving duplicate states
    if (state === lastSavedState.current) return;
    lastSavedState.current = state;

    setHistory((prevHistory) => {
      // Remove any states after the current index (for redo functionality)
      const newHistory = prevHistory.slice(0, currentIndex + 1);

      // Add the new state
      newHistory.push({
        json: state,
        timestamp: Date.now(),
      });

      // Limit history size to prevent memory issues
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      return newHistory;
    });
  }, [canvas, currentIndex, excludeFromHistory, maxHistorySize]);

  // Load a state from history
  const loadState = useCallback(
    (state: HistoryState) => {
      if (!canvas) return;

      isPerformingUndoRedo.current = true;

      const data = JSON.parse(state.json);

      // Clear canvas (except excluded objects)
      const objectsToKeep = canvas.getObjects().filter(excludeFromHistory);
      canvas.clear();
      objectsToKeep.forEach((obj) => canvas.add(obj));

      // Set background
      if (data.background) {
        canvas.backgroundColor = data.background;
      }

      // Load objects
      data.objects.forEach((objData: any) => {
        fabric.util.enlivenObjects([objData], (objects: fabric.Object[]) => {
          objects.forEach((obj) => {
            // Restore custom properties
            Object.keys(objData).forEach((key) => {
              if (!['type', 'version', 'originX', 'originY'].includes(key)) {
                (obj as any)[key] = objData[key];
              }
            });
            canvas.add(obj);
          });
          canvas.renderAll();
        });
      });

      lastSavedState.current = state.json;

      setTimeout(() => {
        isPerformingUndoRedo.current = false;
      }, 100);
    },
    [canvas, excludeFromHistory]
  );

  // Undo action
  const undo = useCallback(() => {
    if (!canUndo || currentIndex <= 0) return;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    loadState(history[newIndex]);
  }, [canUndo, currentIndex, history, loadState]);

  // Redo action
  const redo = useCallback(() => {
    if (!canRedo || currentIndex >= history.length - 1) return;

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    loadState(history[newIndex]);
  }, [canRedo, currentIndex, history, loadState]);

  // Update can undo/redo states
  useEffect(() => {
    setCanUndo(currentIndex > 0);
    setCanRedo(currentIndex < history.length - 1);
  }, [currentIndex, history.length]);

  // Set up canvas event listeners
  useEffect(() => {
    if (!canvas) return;

    // Save initial state
    if (history.length === 0) {
      saveState();
    }

    const events = [
      'object:added',
      'object:removed',
      'object:modified',
      'path:created',
      'selection:cleared',
    ];

    const handleCanvasChange = () => {
      if (!isPerformingUndoRedo.current) {
        // Debounce saves to avoid too many history entries
        setTimeout(saveState, 100);
      }
    };

    events.forEach((event) => {
      canvas.on(event, handleCanvasChange);
    });

    return () => {
      events.forEach((event) => {
        canvas.off(event, handleCanvasChange);
      });
    };
  }, [canvas, history.length, saveState]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    historySize: history.length,
    currentHistoryIndex: currentIndex,
    clearHistory: () => {
      setHistory([]);
      setCurrentIndex(-1);
      saveState();
    },
  };
};
