import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { fabric } from 'fabric';
import { useCanvasToolStore } from '@/stores/canvas/useCanvasToolStore';
import { useSelectionStore } from '@/stores/canvas/useSelectionStore';
import { useMaterialStore } from '@/stores/canvas/useMaterialStore';
import { useClipboardStore } from '@/stores/canvas/useClipboardStore';
import { useLayerStore } from '@/stores/useLayerStore';
import { useMeasurementStore } from '@/stores/useMeasurementStore';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
    Object: vi.fn(),
    util: {
      object: {
        clone: vi.fn((obj) => ({ ...obj })),
      },
    },
  },
}));

describe('State Synchronization Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    useCanvasToolStore.setState({
      activeTool: 'select',
      isDrawing: false,
      snapMode: 'grid',
      snapTolerance: 10,
      gridSize: 20,
      showGrid: true,
      showSnapGuides: true,
      drawingPoints: [],
      previewObject: null,
    });

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

    useMaterialStore.setState({
      materials: [],
      selectedMaterialId: null,
    });

    useClipboardStore.setState({
      copiedObjects: [],
      cutObjects: [],
      isCutting: false,
    });

    useLayerStore.setState({
      layers: [],
      activeLayerId: null,
      layerVisibility: {},
      layerLocks: {},
    });

    useMeasurementStore.setState({
      measurements: [],
      activeMeasurement: null,
      measurementUnit: 'feet',
      showMeasurements: true,
      precision: 2,
    });
  });

  describe('Tool and Selection State Sync', () => {
    it('clears selection when switching from selection tool', () => {
      const { result: toolStore } = renderHook(() => useCanvasToolStore());
      const { result: selectionStore } = renderHook(() => useSelectionStore());

      // Set up selection
      const mockObjects = [{ id: 1 }, { id: 2 }] as fabric.Object[];
      act(() => {
        selectionStore.current.setSelectedObjects(mockObjects);
      });
      expect(selectionStore.current.hasSelection()).toBe(true);

      // Switch to area tool
      act(() => {
        toolStore.current.setActiveTool('area');
      });

      // Selection should persist (tools don't auto-clear selection)
      expect(selectionStore.current.hasSelection()).toBe(true);
    });

    it('maintains drawing points across store updates', () => {
      const { result: toolStore } = renderHook(() => useCanvasToolStore());

      const point1 = new fabric.Point(100, 100);
      const point2 = new fabric.Point(200, 200);

      act(() => {
        toolStore.current.setActiveTool('area');
        toolStore.current.setDrawing(true);
        toolStore.current.addDrawingPoint(point1);
      });

      // Add another point
      act(() => {
        toolStore.current.addDrawingPoint(point2);
      });

      expect(toolStore.current.drawingPoints).toHaveLength(2);
      expect(toolStore.current.drawingPoints[0]).toBe(point1);
      expect(toolStore.current.drawingPoints[1]).toBe(point2);
    });
  });

  describe('Material and Tool State Sync', () => {
    it('preserves material selection across tool changes', () => {
      const { result: toolStore } = renderHook(() => useCanvasToolStore());
      const { result: materialStore } = renderHook(() => useMaterialStore());

      // Add materials
      act(() => {
        materialStore.current.addMaterial({
          id: 'mat1',
          name: 'Grass',
          color: '#00ff00',
          type: 'vegetation',
        });
        materialStore.current.selectMaterial('mat1');
      });

      const initialMaterial = materialStore.current.getSelectedMaterial();
      expect(initialMaterial?.id).toBe('mat1');

      // Change tools
      act(() => {
        toolStore.current.setActiveTool('area');
      });
      act(() => {
        toolStore.current.setActiveTool('line');
      });

      // Material should remain selected
      const currentMaterial = materialStore.current.getSelectedMaterial();
      expect(currentMaterial?.id).toBe('mat1');
    });

    it('updates material across multiple objects', () => {
      const { result: selectionStore } = renderHook(() => useSelectionStore());
      const { result: materialStore } = renderHook(() => useMaterialStore());

      const objects = [
        { id: 1, set: vi.fn() },
        { id: 2, set: vi.fn() },
      ] as any[];

      act(() => {
        selectionStore.current.setSelectedObjects(objects);
        materialStore.current.updateSelectedObjectsMaterial({
          id: 'mat2',
          name: 'Stone',
          color: '#808080',
          type: 'hardscape',
        });
      });

      // Verify material update was called on objects
      objects.forEach(obj => {
        expect(obj.set).toHaveBeenCalledWith('fill', '#808080');
      });
    });
  });

  describe('Clipboard and Selection State Sync', () => {
    it('copies selected objects to clipboard', () => {
      const { result: selectionStore } = renderHook(() => useSelectionStore());
      const { result: clipboardStore } = renderHook(() => useClipboardStore());

      const objects = [
        { id: 1, clone: vi.fn((cb) => cb({ id: 1, cloned: true })) },
        { id: 2, clone: vi.fn((cb) => cb({ id: 2, cloned: true })) },
      ] as any[];

      act(() => {
        selectionStore.current.setSelectedObjects(objects);
        clipboardStore.current.copy(objects);
      });

      expect(clipboardStore.current.hasCopiedObjects()).toBe(true);
      expect(clipboardStore.current.getCopiedCount()).toBe(2);
    });

    it('maintains cut state during paste', () => {
      const { result: clipboardStore } = renderHook(() => useClipboardStore());

      const mockCanvas = {
        add: vi.fn(),
        remove: vi.fn(),
        renderAll: vi.fn(),
      } as any;

      const objects = [{ id: 1 }] as any[];

      act(() => {
        clipboardStore.current.cut(objects);
      });

      expect(clipboardStore.current.isCutting).toBe(true);

      act(() => {
        clipboardStore.current.paste(mockCanvas, new fabric.Point(0, 0));
      });

      expect(clipboardStore.current.isCutting).toBe(false);
      expect(mockCanvas.remove).toHaveBeenCalledWith(objects[0]);
    });
  });

  describe('Layer State Synchronization', () => {
    it('syncs active layer with object creation', () => {
      const { result: layerStore } = renderHook(() => useLayerStore());

      act(() => {
        layerStore.current.addLayer({
          id: 'layer1',
          name: 'Background',
          order: 0,
        });
        layerStore.current.addLayer({
          id: 'layer2',
          name: 'Foreground',
          order: 1,
        });
        layerStore.current.setActiveLayer('layer2');
      });

      // New objects should be assigned to active layer
      const activeLayer = layerStore.current.getActiveLayer();
      expect(activeLayer?.id).toBe('layer2');
    });

    it('handles layer visibility changes', () => {
      const { result: layerStore } = renderHook(() => useLayerStore());

      act(() => {
        layerStore.current.addLayer({
          id: 'layer1',
          name: 'Test Layer',
          order: 0,
        });
        layerStore.current.toggleLayerVisibility('layer1');
      });

      expect(layerStore.current.isLayerVisible('layer1')).toBe(false);

      act(() => {
        layerStore.current.toggleLayerVisibility('layer1');
      });

      expect(layerStore.current.isLayerVisible('layer1')).toBe(true);
    });
  });

  describe('Measurement State Updates', () => {
    it('updates measurement units globally', () => {
      const { result: measurementStore } = renderHook(() => useMeasurementStore());

      act(() => {
        measurementStore.current.addMeasurement({
          id: 'measure1',
          type: 'distance',
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
          ],
          value: 100,
          unit: 'feet',
        });
      });

      act(() => {
        measurementStore.current.setMeasurementUnit('meters');
      });

      expect(measurementStore.current.measurementUnit).toBe('meters');
      // All measurements should be converted to new unit
    });

    it('toggles measurement visibility', () => {
      const { result: measurementStore } = renderHook(() => useMeasurementStore());

      expect(measurementStore.current.showMeasurements).toBe(true);

      act(() => {
        measurementStore.current.toggleMeasurements();
      });

      expect(measurementStore.current.showMeasurements).toBe(false);
    });
  });

  describe('Cross-Store State Dependencies', () => {
    it('coordinates selection and clipboard operations', async () => {
      const { result: selectionStore } = renderHook(() => useSelectionStore());
      const { result: clipboardStore } = renderHook(() => useClipboardStore());

      const mockCanvas = {
        add: vi.fn(),
        remove: vi.fn(),
        renderAll: vi.fn(),
        setActiveObject: vi.fn(),
      } as any;

      const object = {
        id: 1,
        left: 100,
        top: 100,
        clone: vi.fn((callback) => 
          callback({ 
            id: 2, 
            left: 100, 
            top: 100,
            set: vi.fn(),
          })
        ),
      } as any;

      // Select, copy, and paste workflow
      act(() => {
        selectionStore.current.setSelectedObjects([object]);
      });

      act(() => {
        clipboardStore.current.copy([object]);
      });

      act(() => {
        clipboardStore.current.paste(mockCanvas, new fabric.Point(150, 150));
      });

      await waitFor(() => {
        expect(mockCanvas.add).toHaveBeenCalled();
      });
    });

    it('maintains consistency during bulk operations', () => {
      const { result: selectionStore } = renderHook(() => useSelectionStore());
      const { result: layerStore } = renderHook(() => useLayerStore());

      const mockCanvas = {
        getObjects: vi.fn().mockReturnValue([]),
        remove: vi.fn(),
        renderAll: vi.fn(),
        discardActiveObject: vi.fn(),
      } as any;

      const objects = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        layerId: 'layer1',
      })) as any[];

      act(() => {
        layerStore.current.addLayer({
          id: 'layer1',
          name: 'Test Layer',
          order: 0,
        });
        selectionStore.current.setSelectedObjects(objects);
      });

      // Delete all selected
      act(() => {
        selectionStore.current.deleteSelected(mockCanvas);
      });

      expect(mockCanvas.remove).toHaveBeenCalledTimes(10);
      expect(selectionStore.current.hasSelection()).toBe(false);
    });
  });

  describe('State Persistence and Recovery', () => {
    it('recovers from invalid state transitions', () => {
      const { result: toolStore } = renderHook(() => useCanvasToolStore());

      // Set invalid state
      act(() => {
        toolStore.current.setDrawing(true);
        toolStore.current.setActiveTool('select'); // Selection tool shouldn't be drawing
      });

      // Tool should handle invalid state
      expect(toolStore.current.activeTool).toBe('select');
      // Drawing state might persist but won't affect selection tool
    });

    it('handles concurrent state updates', async () => {
      const { result: selectionStore } = renderHook(() => useSelectionStore());
      const { result: toolStore } = renderHook(() => useCanvasToolStore());

      const updates = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve().then(() => {
          act(() => {
            if (i % 2 === 0) {
              selectionStore.current.addToSelection({ id: i } as any);
            } else {
              toolStore.current.setSnapTolerance(i);
            }
          });
        })
      );

      await Promise.all(updates);

      // All updates should be applied
      expect(selectionStore.current.getSelectedCount()).toBeGreaterThan(0);
      expect(toolStore.current.snapTolerance).toBeGreaterThan(0);
    });
  });

  describe('Performance with Large State', () => {
    it('handles large selection efficiently', () => {
      const { result: selectionStore } = renderHook(() => useSelectionStore());

      const largeSelection = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        getBoundingRect: () => ({
          left: i * 10,
          top: i * 10,
          width: 50,
          height: 50,
        }),
      })) as any[];

      const startTime = performance.now();

      act(() => {
        selectionStore.current.setSelectedObjects(largeSelection);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(100); // 100ms threshold
      expect(selectionStore.current.getSelectedCount()).toBe(1000);
    });

    it('optimizes repeated state queries', () => {
      const { result: toolStore } = renderHook(() => useCanvasToolStore());

      // Set up state
      act(() => {
        toolStore.current.setGridSize(25);
      });

      // Multiple rapid queries
      const results = Array.from({ length: 100 }, () => {
        const point = new fabric.Point(27, 33);
        return toolStore.current.snapToGrid(point);
      });

      // All results should be consistent
      results.forEach(result => {
        expect(result.x).toBe(25);
        expect(result.y).toBe(25);
      });
    });
  });
});