import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fabric } from 'fabric';
import { useSelectionStore } from '../canvas/useSelectionStore';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
    ActiveSelection: vi.fn().mockImplementation((objects, options) => ({
      objects,
      ...options,
      type: 'activeSelection',
    })),
    Group: vi.fn().mockImplementation((objects, options) => ({
      objects,
      ...options,
      type: 'group',
      getObjects: () => objects,
      destroy: vi.fn(),
    })),
    Rect: vi.fn().mockImplementation((options) => ({
      ...options,
      type: 'rect',
    })),
    Object: vi.fn(),
  },
}));

describe('useSelectionStore', () => {
  let mockCanvas: any;

  beforeEach(() => {
    // Reset store state
    useSelectionStore.setState({
      selectedObjects: [],
      selectionMode: 'single',
      rubberBandStart: null,
      rubberBandEnd: null,
      isSelecting: false,
      groupSelectionEnabled: true,
      lastClickTime: 0,
      clickCount: 0,
    });

    // Mock canvas
    mockCanvas = {
      getObjects: vi.fn().mockReturnValue([]),
      setActiveObject: vi.fn(),
      discardActiveObject: vi.fn(),
      renderAll: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
    };

    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Selection Management', () => {
    it('sets selected objects', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [{ id: 1 }, { id: 2 }] as fabric.Object[];

      act(() => {
        result.current.setSelectedObjects(objects);
      });

      expect(result.current.selectedObjects).toEqual(objects);
    });

    it('adds object to selection', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = { id: 1 } as fabric.Object;
      const obj2 = { id: 2 } as fabric.Object;

      act(() => {
        result.current.addToSelection(obj1);
      });
      expect(result.current.selectedObjects).toContain(obj1);

      act(() => {
        result.current.addToSelection(obj2);
      });
      expect(result.current.selectedObjects).toHaveLength(2);
    });

    it('prevents duplicate additions', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj = { id: 1 } as fabric.Object;

      act(() => {
        result.current.addToSelection(obj);
        result.current.addToSelection(obj);
      });

      expect(result.current.selectedObjects).toHaveLength(1);
    });

    it('removes object from selection', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = { id: 1 } as fabric.Object;
      const obj2 = { id: 2 } as fabric.Object;

      act(() => {
        result.current.setSelectedObjects([obj1, obj2]);
        result.current.removeFromSelection(obj1);
      });

      expect(result.current.selectedObjects).not.toContain(obj1);
      expect(result.current.selectedObjects).toContain(obj2);
    });

    it('clears selection', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [{ id: 1 }, { id: 2 }] as fabric.Object[];

      act(() => {
        result.current.setSelectedObjects(objects);
        result.current.clearSelection();
      });

      expect(result.current.selectedObjects).toHaveLength(0);
    });
  });

  describe('Select All / Invert', () => {
    it('selects all selectable objects', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [
        { id: 1, selectable: true },
        { id: 2, selectable: true },
        { id: 3, selectable: false },
      ] as fabric.Object[];

      mockCanvas.getObjects.mockReturnValue(objects);

      act(() => {
        result.current.selectAll(mockCanvas);
      });

      expect(result.current.selectedObjects).toHaveLength(2);
      expect(result.current.selectedObjects).not.toContain(objects[2]);
      expect(mockCanvas.setActiveObject).toHaveBeenCalled();
    });

    it('inverts selection', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [
        { id: 1, selectable: true },
        { id: 2, selectable: true },
        { id: 3, selectable: true },
      ] as fabric.Object[];

      mockCanvas.getObjects.mockReturnValue(objects);

      act(() => {
        result.current.setSelectedObjects([objects[0], objects[1]]);
        result.current.invertSelection(mockCanvas);
      });

      expect(result.current.selectedObjects).toHaveLength(1);
      expect(result.current.selectedObjects).toContain(objects[2]);
    });
  });

  describe('Rubber Band Selection', () => {
    it('manages rubber band state', () => {
      const { result } = renderHook(() => useSelectionStore());
      const startPoint = new fabric.Point(100, 100);
      const endPoint = new fabric.Point(200, 200);

      act(() => {
        result.current.startRubberBand(startPoint);
      });

      expect(result.current.rubberBandStart).toBe(startPoint);
      expect(result.current.rubberBandEnd).toBe(startPoint);
      expect(result.current.isSelecting).toBe(true);

      act(() => {
        result.current.updateRubberBand(endPoint);
      });

      expect(result.current.rubberBandEnd).toBe(endPoint);

      act(() => {
        result.current.endRubberBand();
      });

      expect(result.current.rubberBandStart).toBeNull();
      expect(result.current.rubberBandEnd).toBeNull();
      expect(result.current.isSelecting).toBe(false);
    });
  });

  describe('Selection Modes', () => {
    it('changes selection mode', () => {
      const { result } = renderHook(() => useSelectionStore());

      act(() => {
        result.current.setSelectionMode('multi');
      });
      expect(result.current.selectionMode).toBe('multi');

      act(() => {
        result.current.setSelectionMode('rubber-band');
      });
      expect(result.current.selectionMode).toBe('rubber-band');
    });

    it('toggles group selection', () => {
      const { result } = renderHook(() => useSelectionStore());

      act(() => {
        result.current.setGroupSelectionEnabled(false);
      });
      expect(result.current.groupSelectionEnabled).toBe(false);
    });
  });

  describe('Click Handling', () => {
    it('handles single click on object', () => {
      const { result } = renderHook(() => useSelectionStore());
      const target = { id: 1 } as fabric.Object;
      const event = { e: {} } as fabric.IEvent;

      act(() => {
        result.current.handleClick(target, event);
      });

      expect(result.current.selectedObjects).toContain(target);
    });

    it('handles shift-click for multi-selection', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = { id: 1 } as fabric.Object;
      const obj2 = { id: 2 } as fabric.Object;
      const shiftEvent = { e: { shiftKey: true } } as fabric.IEvent;

      act(() => {
        result.current.setSelectedObjects([obj1]);
        result.current.handleClick(obj2, shiftEvent);
      });

      expect(result.current.selectedObjects).toHaveLength(2);
      expect(result.current.selectedObjects).toContain(obj1);
      expect(result.current.selectedObjects).toContain(obj2);
    });

    it('handles ctrl-click toggle', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj = { id: 1 } as fabric.Object;
      const ctrlEvent = { e: { ctrlKey: true } } as fabric.IEvent;

      act(() => {
        result.current.handleClick(obj, ctrlEvent);
      });
      expect(result.current.selectedObjects).toContain(obj);

      act(() => {
        result.current.handleClick(obj, ctrlEvent);
      });
      expect(result.current.selectedObjects).not.toContain(obj);
    });

    it('detects double-click', () => {
      const { result } = renderHook(() => useSelectionStore());
      const target = { id: 1 } as fabric.Object;
      const event = { e: {} } as fabric.IEvent;
      const consoleSpy = vi.spyOn(console, 'log');

      act(() => {
        result.current.handleClick(target, event);
      });

      act(() => {
        result.current.handleClick(target, event);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Double-click detected on:', target);
    });

    it('clears selection on empty space click', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj = { id: 1 } as fabric.Object;
      const event = { e: {} } as fabric.IEvent;

      act(() => {
        result.current.setSelectedObjects([obj]);
        result.current.handleClick(null, event);
      });

      expect(result.current.selectedObjects).toHaveLength(0);
    });
  });

  describe('Getters', () => {
    it('returns selected count', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [{ id: 1 }, { id: 2 }] as fabric.Object[];

      act(() => {
        result.current.setSelectedObjects(objects);
      });

      expect(result.current.getSelectedCount()).toBe(2);
    });

    it('checks if has selection', () => {
      const { result } = renderHook(() => useSelectionStore());

      expect(result.current.hasSelection()).toBe(false);

      act(() => {
        result.current.setSelectedObjects([{ id: 1 } as fabric.Object]);
      });

      expect(result.current.hasSelection()).toBe(true);
    });

    it('checks if object is selected', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = { id: 1 } as fabric.Object;
      const obj2 = { id: 2 } as fabric.Object;

      act(() => {
        result.current.setSelectedObjects([obj1]);
      });

      expect(result.current.isSelected(obj1)).toBe(true);
      expect(result.current.isSelected(obj2)).toBe(false);
    });

    it('calculates selection bounds', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [
        {
          getBoundingRect: () => ({ left: 10, top: 10, width: 50, height: 50 }),
        },
        {
          getBoundingRect: () => ({ left: 100, top: 100, width: 50, height: 50 }),
        },
      ] as fabric.Object[];

      act(() => {
        result.current.setSelectedObjects(objects);
      });

      const bounds = result.current.getSelectionBounds();
      expect(bounds).toBeTruthy();
      expect(bounds?.left).toBe(10);
      expect(bounds?.top).toBe(10);
      expect(bounds?.width).toBe(140);
      expect(bounds?.height).toBe(140);
    });
  });

  describe('Group Operations', () => {
    it('creates group from selection', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [{ id: 1 }, { id: 2 }] as fabric.Object[];

      act(() => {
        result.current.setSelectedObjects(objects);
      });

      act(() => {
        const group = result.current.createGroup(mockCanvas);
        expect(group).toBeTruthy();
      });

      expect(mockCanvas.remove).toHaveBeenCalledTimes(2);
      expect(mockCanvas.add).toHaveBeenCalled();
      expect(mockCanvas.setActiveObject).toHaveBeenCalled();
    });

    it('does not create group with less than 2 objects', () => {
      const { result } = renderHook(() => useSelectionStore());

      act(() => {
        result.current.setSelectedObjects([{ id: 1 } as fabric.Object]);
      });

      const group = result.current.createGroup(mockCanvas);
      expect(group).toBeNull();
    });

    it('ungroups selected groups', () => {
      const { result } = renderHook(() => useSelectionStore());
      const groupObjects = [{ id: 1 }, { id: 2 }] as fabric.Object[];
      const group = {
        type: 'group',
        getObjects: () => groupObjects,
        destroy: vi.fn(),
      } as any;

      act(() => {
        result.current.setSelectedObjects([group]);
        result.current.ungroupSelection(mockCanvas);
      });

      expect(group.destroy).toHaveBeenCalled();
      expect(mockCanvas.remove).toHaveBeenCalledWith(group);
      expect(mockCanvas.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('Bulk Operations', () => {
    it('deletes selected objects', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [{ id: 1 }, { id: 2 }] as fabric.Object[];

      act(() => {
        result.current.setSelectedObjects(objects);
        result.current.deleteSelected(mockCanvas);
      });

      expect(mockCanvas.remove).toHaveBeenCalledTimes(2);
      expect(result.current.selectedObjects).toHaveLength(0);
      expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
    });

    it('duplicates selected objects', () => {
      const { result } = renderHook(() => useSelectionStore());
      const clonedObj = { id: 2, left: 20, top: 20 } as fabric.Object;
      const obj = {
        id: 1,
        left: 0,
        top: 0,
        clone: vi.fn((callback) => callback(clonedObj)),
      } as any;

      act(() => {
        result.current.setSelectedObjects([obj]);
        result.current.duplicateSelected(mockCanvas);
      });

      expect(obj.clone).toHaveBeenCalled();
      expect(mockCanvas.add).toHaveBeenCalledWith(clonedObj);

      // Wait for timeout
      act(() => {
        vi.advanceTimersByTime(10);
      });

      expect(result.current.selectedObjects).toContain(clonedObj);
    });
  });

  describe('Alignment', () => {
    const createMockObject = (left: number, top: number, width: number, height: number) => ({
      getBoundingRect: () => ({ left, top, width, height }),
      set: vi.fn(),
      setCoords: vi.fn(),
    } as any);

    it('aligns objects left', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = createMockObject(50, 0, 50, 50);
      const obj2 = createMockObject(100, 0, 50, 50);

      act(() => {
        result.current.setSelectedObjects([obj1, obj2]);
        result.current.alignSelected(mockCanvas, 'left');
      });

      expect(obj1.set).toHaveBeenCalledWith('left', 50);
      expect(obj2.set).toHaveBeenCalledWith('left', 50);
    });

    it('aligns objects center', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = createMockObject(0, 0, 50, 50);
      const obj2 = createMockObject(100, 0, 50, 50);

      act(() => {
        result.current.setSelectedObjects([obj1, obj2]);
        result.current.alignSelected(mockCanvas, 'center');
      });

      const centerX = 75; // (0 + 150) / 2
      expect(obj1.set).toHaveBeenCalledWith('left', centerX - 25);
      expect(obj2.set).toHaveBeenCalledWith('left', centerX - 25);
    });

    it('aligns objects right', () => {
      const { result } = renderHook(() => useSelectionStore());
      const obj1 = createMockObject(0, 0, 50, 50);
      const obj2 = createMockObject(100, 0, 50, 50);

      act(() => {
        result.current.setSelectedObjects([obj1, obj2]);
        result.current.alignSelected(mockCanvas, 'right');
      });

      expect(obj1.set).toHaveBeenCalledWith('left', 100);
      expect(obj2.set).toHaveBeenCalledWith('left', 100);
    });
  });

  describe('Distribution', () => {
    const createMockObject = (left: number, top: number, width: number, height: number) => ({
      getBoundingRect: () => ({ left, top, width, height }),
      set: vi.fn(),
      setCoords: vi.fn(),
    } as any);

    it('distributes objects horizontally', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [
        createMockObject(0, 0, 50, 50),
        createMockObject(100, 0, 50, 50),
        createMockObject(250, 0, 50, 50),
      ];

      act(() => {
        result.current.setSelectedObjects(objects);
        result.current.distributeSelected(mockCanvas, 'horizontal');
      });

      // Middle object should be repositioned
      expect(objects[1].set).toHaveBeenCalled();
    });

    it('distributes objects vertically', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [
        createMockObject(0, 0, 50, 50),
        createMockObject(0, 100, 50, 50),
        createMockObject(0, 250, 50, 50),
      ];

      act(() => {
        result.current.setSelectedObjects(objects);
        result.current.distributeSelected(mockCanvas, 'vertical');
      });

      // Middle object should be repositioned
      expect(objects[1].set).toHaveBeenCalled();
    });

    it('requires at least 3 objects', () => {
      const { result } = renderHook(() => useSelectionStore());
      const objects = [
        createMockObject(0, 0, 50, 50),
        createMockObject(100, 0, 50, 50),
      ];

      act(() => {
        result.current.setSelectedObjects(objects);
        result.current.distributeSelected(mockCanvas, 'horizontal');
      });

      expect(objects[0].set).not.toHaveBeenCalled();
      expect(objects[1].set).not.toHaveBeenCalled();
    });
  });
});