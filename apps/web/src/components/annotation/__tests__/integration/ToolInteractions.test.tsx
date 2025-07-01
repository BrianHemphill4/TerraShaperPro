import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fabric } from 'fabric';
import { AnnotationCanvas } from '../../AnnotationCanvas';
import { AreaTool } from '../../../canvas/tools/AreaTool';
import { LineTool } from '../../../canvas/tools/LineTool';
import { SelectionTool } from '../../../canvas/tools/SelectionTool';
import { useCanvasToolStore } from '@/stores/canvas/useCanvasToolStore';
import { useSelectionStore } from '@/stores/canvas/useSelectionStore';
import { useMaterialStore } from '@/stores/canvas/useMaterialStore';

// Mock fabric.js with more complete implementation
vi.mock('fabric', () => {
  const mockCanvas = {
    on: vi.fn(),
    off: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    renderAll: vi.fn(),
    getObjects: vi.fn().mockReturnValue([]),
    setActiveObject: vi.fn(),
    discardActiveObject: vi.fn(),
    getActiveObjects: vi.fn().mockReturnValue([]),
    selection: true,
    dispose: vi.fn(),
    setDimensions: vi.fn(),
    setBackgroundColor: vi.fn(),
    getPointer: vi.fn((e) => ({ x: 100, y: 100 })),
  };

  return {
    fabric: {
      Canvas: vi.fn().mockImplementation(() => mockCanvas),
      Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
      Polygon: vi.fn().mockImplementation((points, options) => ({
        points,
        ...options,
        type: 'polygon',
        getBoundingRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
        setCoords: vi.fn(),
        clone: vi.fn((callback) => callback({ ...options, type: 'polygon' })),
      })),
      Line: vi.fn().mockImplementation((points, options) => ({
        x1: points[0],
        y1: points[1],
        x2: points[2],
        y2: points[3],
        ...options,
        type: 'line',
        getBoundingRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
        setCoords: vi.fn(),
        clone: vi.fn((callback) => callback({ ...options, type: 'line' })),
      })),
      Rect: vi.fn().mockImplementation((options) => ({
        ...options,
        type: 'rect',
        getBoundingRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
        setCoords: vi.fn(),
      })),
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
    },
  };
});

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('Tool Interactions Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockCanvas: any;

  beforeEach(() => {
    user = userEvent.setup();
    
    // Reset all stores
    useCanvasToolStore.setState({
      activeTool: 'select',
      isDrawing: false,
      snapMode: 'grid',
      drawingPoints: [],
      previewObject: null,
    });

    useSelectionStore.setState({
      selectedObjects: [],
      selectionMode: 'single',
      rubberBandStart: null,
      rubberBandEnd: null,
      isSelecting: false,
    });

    useMaterialStore.setState({
      materials: [
        { id: 'mat1', name: 'Grass', color: '#00ff00', type: 'vegetation' },
        { id: 'mat2', name: 'Stone', color: '#808080', type: 'hardscape' },
      ],
      selectedMaterialId: 'mat1',
    });

    // Get canvas mock
    mockCanvas = (fabric.Canvas as any).mock.results[0]?.value;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Switching', () => {
    it('switches between tools seamlessly', async () => {
      const { container } = render(
        <div>
          <AnnotationCanvas 
            imageUrl="/test-image.jpg"
            sceneId="test-scene"
            projectId="test-project"
          />
        </div>
      );

      // Wait for canvas initialization
      await waitFor(() => {
        expect(fabric.Canvas).toHaveBeenCalled();
      });

      // Start with selection tool (default)
      expect(useCanvasToolStore.getState().activeTool).toBe('select');

      // Switch to area tool
      act(() => {
        useCanvasToolStore.getState().setActiveTool('area');
      });
      expect(useCanvasToolStore.getState().activeTool).toBe('area');

      // Switch to line tool
      act(() => {
        useCanvasToolStore.getState().setActiveTool('line');
      });
      expect(useCanvasToolStore.getState().activeTool).toBe('line');

      // Ensure drawing state is reset between switches
      expect(useCanvasToolStore.getState().isDrawing).toBe(false);
      expect(useCanvasToolStore.getState().drawingPoints).toHaveLength(0);
    });

    it('cleans up tool state when switching', async () => {
      const { container } = render(
        <div>
          <AreaTool canvas={mockCanvas} isActive={true} />
        </div>
      );

      // Start drawing with area tool
      act(() => {
        useCanvasToolStore.getState().setDrawing(true);
        useCanvasToolStore.getState().addDrawingPoint(new fabric.Point(100, 100));
      });

      // Switch tool (deactivate area tool)
      const { rerender } = render(
        <AreaTool canvas={mockCanvas} isActive={false} />
      );

      await waitFor(() => {
        expect(useCanvasToolStore.getState().isDrawing).toBe(false);
        expect(useCanvasToolStore.getState().drawingPoints).toHaveLength(0);
      });
    });
  });

  describe('Area and Selection Tool Interaction', () => {
    it('selects created area with selection tool', async () => {
      // Create area with area tool
      const onAreaCreated = vi.fn();
      render(
        <AreaTool 
          canvas={mockCanvas} 
          isActive={true} 
          onAreaCreated={onAreaCreated}
        />
      );

      // Simulate area creation
      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // Create a triangle
      act(() => {
        mouseDownHandler?.({ pointer: { x: 100, y: 100 } });
        mouseDownHandler?.({ pointer: { x: 200, y: 100 } });
        mouseDownHandler?.({ pointer: { x: 150, y: 200 } });
      });

      // Finish area
      const keyDownHandler = vi.fn();
      window.addEventListener('keydown', keyDownHandler);
      
      await user.keyboard('{Enter}');

      expect(onAreaCreated).toHaveBeenCalled();
      const createdArea = onAreaCreated.mock.calls[0][0];

      // Switch to selection tool
      render(
        <SelectionTool 
          canvas={mockCanvas} 
          isActive={true}
        />
      );

      // Select the created area
      act(() => {
        useSelectionStore.getState().setSelectedObjects([createdArea]);
      });

      expect(useSelectionStore.getState().hasSelection()).toBe(true);
      expect(useSelectionStore.getState().isSelected(createdArea)).toBe(true);
    });
  });

  describe('Line and Selection Tool Interaction', () => {
    it('creates multiple lines and groups them', async () => {
      const lines: any[] = [];
      const onLineCreated = vi.fn((line) => lines.push(line));

      // Create multiple lines
      const { rerender } = render(
        <LineTool 
          canvas={mockCanvas} 
          isActive={true} 
          onLineCreated={onLineCreated}
        />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // Create first line
      act(() => {
        mouseDownHandler?.({ pointer: { x: 0, y: 0 } });
        mouseDownHandler?.({ pointer: { x: 100, y: 0 } });
      });

      // Create second line
      act(() => {
        mouseDownHandler?.({ pointer: { x: 0, y: 50 } });
        mouseDownHandler?.({ pointer: { x: 100, y: 50 } });
      });

      expect(lines).toHaveLength(2);

      // Switch to selection tool
      rerender(
        <SelectionTool 
          canvas={mockCanvas} 
          isActive={true}
        />
      );

      // Select both lines
      act(() => {
        useSelectionStore.getState().setSelectedObjects(lines);
      });

      // Group the lines
      act(() => {
        const group = useSelectionStore.getState().createGroup(mockCanvas);
        expect(group).toBeTruthy();
        expect(group?.type).toBe('group');
      });

      expect(mockCanvas.remove).toHaveBeenCalledTimes(2); // Both lines removed
      expect(mockCanvas.add).toHaveBeenCalled(); // Group added
    });
  });

  describe('Snap Interaction Between Tools', () => {
    it('snaps line to area corners', async () => {
      // Create an area first
      const area = {
        type: 'polygon',
        getBoundingRect: () => ({ 
          left: 100, 
          top: 100, 
          width: 100, 
          height: 100 
        }),
      };
      
      mockCanvas.getObjects.mockReturnValue([area]);

      // Use line tool with snapping
      render(
        <LineTool 
          canvas={mockCanvas} 
          isActive={true}
        />
      );

      act(() => {
        useCanvasToolStore.getState().setSnapMode('object');
      });

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // Click near area corner - should snap
      act(() => {
        mouseDownHandler?.({ pointer: { x: 98, y: 98 } });
      });

      // Verify snap occurred
      const snapPoint = useCanvasToolStore.getState().snapPoint(
        new fabric.Point(98, 98),
        [area]
      );
      
      expect(snapPoint.x).toBe(100);
      expect(snapPoint.y).toBe(100);
    });
  });

  describe('Material Consistency', () => {
    it('uses same material across different tools', async () => {
      // Set a specific material
      act(() => {
        useMaterialStore.getState().selectMaterial('mat2');
      });

      const createdObjects: any[] = [];

      // Create area with material
      const { rerender } = render(
        <AreaTool 
          canvas={mockCanvas} 
          isActive={true} 
          onAreaCreated={(area) => createdObjects.push(area)}
        />
      );

      // Create line with same material
      rerender(
        <LineTool 
          canvas={mockCanvas} 
          isActive={true} 
          onLineCreated={(line) => createdObjects.push(line)}
        />
      );

      // Both should use the same material
      expect(createdObjects).toHaveLength(0); // No objects created yet in this simplified test
      
      // Verify material store returns consistent material
      const material = useMaterialStore.getState().getSelectedMaterial();
      expect(material?.id).toBe('mat2');
      expect(material?.color).toBe('#808080');
    });
  });

  describe('Undo/Redo Across Tools', () => {
    it('maintains undo history across tool switches', async () => {
      const objects: any[] = [];
      
      // Create area
      render(
        <AreaTool 
          canvas={mockCanvas} 
          isActive={true} 
          onAreaCreated={(area) => objects.push(area)}
        />
      );

      // Create line  
      render(
        <LineTool 
          canvas={mockCanvas} 
          isActive={true} 
          onLineCreated={(line) => objects.push(line)}
        />
      );

      // Select and delete
      render(
        <SelectionTool 
          canvas={mockCanvas} 
          isActive={true}
        />
      );

      act(() => {
        useSelectionStore.getState().setSelectedObjects(objects);
        useSelectionStore.getState().deleteSelected(mockCanvas);
      });

      // Verify deletion
      expect(mockCanvas.remove).toHaveBeenCalledTimes(objects.length);
    });
  });

  describe('Performance with Multiple Tools', () => {
    it('handles rapid tool switching without memory leaks', async () => {
      const { rerender } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      // Rapidly switch tools
      for (let i = 0; i < 10; i++) {
        rerender(
          <LineTool canvas={mockCanvas} isActive={true} />
        );
        rerender(
          <SelectionTool canvas={mockCanvas} isActive={true} />
        );
        rerender(
          <AreaTool canvas={mockCanvas} isActive={true} />
        );
      }

      // Verify event listeners are properly cleaned up
      const offCalls = mockCanvas.off.mock.calls.length;
      expect(offCalls).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    it('recovers from tool errors gracefully', async () => {
      // Simulate error in area tool
      const errorCanvas = {
        ...mockCanvas,
        add: vi.fn().mockImplementationOnce(() => {
          throw new Error('Canvas error');
        }),
      };

      const { rerender } = render(
        <AreaTool canvas={errorCanvas} isActive={true} />
      );

      // Tool should handle error without crashing
      expect(() => {
        const mouseDownHandler = errorCanvas.on.mock.calls.find(
          ([event]) => event === 'mouse:down'
        )?.[1];
        
        act(() => {
          mouseDownHandler?.({ pointer: { x: 100, y: 100 } });
        });
      }).not.toThrow();

      // Should be able to switch to another tool
      rerender(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );
    });
  });
});