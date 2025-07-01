import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fabric } from 'fabric';
import { useCanvasToolStore } from '../canvas/useCanvasToolStore';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
    Line: vi.fn().mockImplementation((points, options) => ({
      points,
      ...options,
      type: 'line',
    })),
    Object: vi.fn(),
  },
}));

describe('useCanvasToolStore', () => {
  beforeEach(() => {
    // Reset store state before each test
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
      areaTool: {
        minPoints: 3,
        maxPoints: 50,
        closeOnDoubleClick: true,
        showDimensions: true,
      },
      lineTool: {
        defaultStyle: {
          stroke: '#3b82f6',
          strokeWidth: 2,
          fill: '',
          strokeDashArray: [],
        },
        showDimensions: true,
        snapToAngles: true,
        angleSnapTolerance: 15,
      },
    });
  });

  describe('Tool Selection', () => {
    it('initializes with select tool active', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      expect(result.current.activeTool).toBe('select');
    });

    it('changes active tool', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setActiveTool('area');
      });
      
      expect(result.current.activeTool).toBe('area');
    });

    it('supports all tool types', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      const tools = ['select', 'area', 'line', 'move', 'rotate', 'scale'] as const;
      
      tools.forEach(tool => {
        act(() => {
          result.current.setActiveTool(tool);
        });
        expect(result.current.activeTool).toBe(tool);
      });
    });
  });

  describe('Drawing State', () => {
    it('manages drawing state', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      expect(result.current.isDrawing).toBe(false);
      
      act(() => {
        result.current.setDrawing(true);
      });
      
      expect(result.current.isDrawing).toBe(true);
    });

    it('manages drawing points', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      const point1 = new fabric.Point(100, 100);
      const point2 = new fabric.Point(200, 200);
      
      act(() => {
        result.current.addDrawingPoint(point1);
      });
      
      expect(result.current.drawingPoints).toHaveLength(1);
      expect(result.current.drawingPoints[0]).toBe(point1);
      
      act(() => {
        result.current.addDrawingPoint(point2);
      });
      
      expect(result.current.drawingPoints).toHaveLength(2);
      
      act(() => {
        result.current.clearDrawingPoints();
      });
      
      expect(result.current.drawingPoints).toHaveLength(0);
    });

    it('sets drawing points array', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      const points = [
        new fabric.Point(0, 0),
        new fabric.Point(100, 0),
        new fabric.Point(100, 100),
      ];
      
      act(() => {
        result.current.setDrawingPoints(points);
      });
      
      expect(result.current.drawingPoints).toEqual(points);
    });

    it('manages preview object', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      const mockObject = { type: 'rect' } as fabric.Object;
      
      act(() => {
        result.current.setPreviewObject(mockObject);
      });
      
      expect(result.current.previewObject).toBe(mockObject);
      
      act(() => {
        result.current.setPreviewObject(null);
      });
      
      expect(result.current.previewObject).toBeNull();
    });
  });

  describe('Snap Settings', () => {
    it('manages snap mode', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setSnapMode('object');
      });
      expect(result.current.snapMode).toBe('object');
      
      act(() => {
        result.current.setSnapMode('both');
      });
      expect(result.current.snapMode).toBe('both');
      
      act(() => {
        result.current.setSnapMode('none');
      });
      expect(result.current.snapMode).toBe('none');
    });

    it('manages snap tolerance', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setSnapTolerance(15);
      });
      
      expect(result.current.snapTolerance).toBe(15);
    });

    it('manages grid settings', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setGridSize(30);
      });
      expect(result.current.gridSize).toBe(30);
      
      act(() => {
        result.current.setShowGrid(false);
      });
      expect(result.current.showGrid).toBe(false);
    });

    it('manages snap guide visibility', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setShowSnapGuides(false);
      });
      expect(result.current.showSnapGuides).toBe(false);
    });
  });

  describe('Grid Snapping', () => {
    it('snaps points to grid', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setGridSize(20);
      });
      
      const point = new fabric.Point(27, 33);
      const snapped = result.current.snapToGrid(point);
      
      expect(snapped.x).toBe(20); // Rounds to nearest 20
      expect(snapped.y).toBe(40);
    });

    it('handles exact grid positions', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      const point = new fabric.Point(40, 60);
      const snapped = result.current.snapToGrid(point);
      
      expect(snapped.x).toBe(40);
      expect(snapped.y).toBe(60);
    });
  });

  describe('Object Snapping', () => {
    it('snaps to object corners', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      const mockObject = {
        getBoundingRect: () => ({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
        }),
      } as fabric.Object;
      
      const point = new fabric.Point(97, 98);
      const snapped = result.current.snapToObjects(point, [mockObject]);
      
      expect(snapped.x).toBe(100); // Snapped to corner
      expect(snapped.y).toBe(100);
    });

    it('snaps to object edges', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      const mockObject = {
        getBoundingRect: () => ({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
        }),
      } as fabric.Object;
      
      const point = new fabric.Point(148, 102);
      const snapped = result.current.snapToObjects(point, [mockObject]);
      
      expect(snapped.x).toBe(150); // Snapped to center of top edge
      expect(snapped.y).toBe(100);
    });

    it('respects snap tolerance', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setSnapTolerance(5);
      });
      
      const mockObject = {
        getBoundingRect: () => ({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
        }),
      } as fabric.Object;
      
      const point = new fabric.Point(90, 90); // Too far away
      const snapped = result.current.snapToObjects(point, [mockObject]);
      
      expect(snapped).toBe(point); // No snapping
    });
  });

  describe('Combined Snapping', () => {
    it('combines grid and object snapping', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setSnapMode('both');
        result.current.setGridSize(20);
      });
      
      const mockObject = {
        getBoundingRect: () => ({
          left: 105,
          top: 105,
          width: 50,
          height: 50,
        }),
      } as fabric.Object;
      
      const point = new fabric.Point(102, 102);
      const snapped = result.current.snapPoint(point, [mockObject]);
      
      // Should prefer object snap (105, 105) over grid snap (100, 100)
      // because it's closer
      expect(snapped.x).toBe(105);
      expect(snapped.y).toBe(105);
    });

    it('prefers closer snap point', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setSnapMode('both');
        result.current.setGridSize(20);
      });
      
      const mockObject = {
        getBoundingRect: () => ({
          left: 150,
          top: 150,
          width: 50,
          height: 50,
        }),
      } as fabric.Object;
      
      const point = new fabric.Point(19, 19);
      const snapped = result.current.snapPoint(point, [mockObject]);
      
      // Grid snap (20, 20) is closer than object snap
      expect(snapped.x).toBe(20);
      expect(snapped.y).toBe(20);
    });

    it('respects snap mode none', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setSnapMode('none');
      });
      
      const point = new fabric.Point(27, 33);
      const snapped = result.current.snapPoint(point);
      
      expect(snapped).toBe(point); // No snapping
    });
  });

  describe('Snap Guides', () => {
    it('creates grid snap guides', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setShowSnapGuides(true);
        result.current.setGridSize(20);
      });
      
      const point = new fabric.Point(19, 21);
      const guides = result.current.getSnapGuides(point);
      
      expect(guides).toHaveLength(2); // Vertical and horizontal
      expect(guides[0].type).toBe('line');
      expect(guides[0].stroke).toBe('#3b82f6'); // Grid color
    });

    it('creates object snap guides', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      const mockObject = {
        getBoundingRect: () => ({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
        }),
      } as fabric.Object;
      
      const point = new fabric.Point(102, 102);
      const guides = result.current.getSnapGuides(point, [mockObject]);
      
      // Should create guides for the corner snap
      const objectGuides = guides.filter(g => g.stroke === '#ef4444');
      expect(objectGuides.length).toBeGreaterThan(0);
    });

    it('returns empty array when guides disabled', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setShowSnapGuides(false);
      });
      
      const point = new fabric.Point(19, 21);
      const guides = result.current.getSnapGuides(point);
      
      expect(guides).toHaveLength(0);
    });
  });

  describe('Tool Settings', () => {
    it('updates area tool settings', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setAreaToolSettings({
          minPoints: 4,
          maxPoints: 100,
          showDimensions: false,
        });
      });
      
      expect(result.current.areaTool.minPoints).toBe(4);
      expect(result.current.areaTool.maxPoints).toBe(100);
      expect(result.current.areaTool.showDimensions).toBe(false);
      expect(result.current.areaTool.closeOnDoubleClick).toBe(true); // Unchanged
    });

    it('updates line tool settings', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      act(() => {
        result.current.setLineToolSettings({
          defaultStyle: {
            stroke: '#ff0000',
            strokeWidth: 3,
          },
          snapToAngles: false,
        });
      });
      
      expect(result.current.lineTool.defaultStyle.stroke).toBe('#ff0000');
      expect(result.current.lineTool.defaultStyle.strokeWidth).toBe(3);
      expect(result.current.lineTool.snapToAngles).toBe(false);
      expect(result.current.lineTool.angleSnapTolerance).toBe(15); // Unchanged
    });

    it('preserves existing settings when partially updating', () => {
      const { result } = renderHook(() => useCanvasToolStore());
      
      const originalSettings = { ...result.current.areaTool };
      
      act(() => {
        result.current.setAreaToolSettings({
          minPoints: 5,
        });
      });
      
      expect(result.current.areaTool.minPoints).toBe(5);
      expect(result.current.areaTool.maxPoints).toBe(originalSettings.maxPoints);
      expect(result.current.areaTool.closeOnDoubleClick).toBe(originalSettings.closeOnDoubleClick);
      expect(result.current.areaTool.showDimensions).toBe(originalSettings.showDimensions);
    });
  });
});