import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { fabric } from 'fabric';
import { AreaTool } from '../AreaTool';
import { useCanvasToolStore } from '@/stores/canvas/useCanvasToolStore';
import { useMaterialStore } from '@/stores/canvas/useMaterialStore';
import { AreaObject } from '@/lib/canvas/objects/AreaObject';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      off: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      renderAll: vi.fn(),
      getObjects: vi.fn().mockReturnValue([]),
      setActiveObject: vi.fn(),
    })),
    Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
    Polygon: vi.fn().mockImplementation((points, options) => ({
      points,
      ...options,
    })),
    Line: vi.fn().mockImplementation((points, options) => ({
      points,
      ...options,
    })),
  },
}));

// Mock stores
vi.mock('@/stores/canvas/useCanvasToolStore');
vi.mock('@/stores/canvas/useMaterialStore');
vi.mock('@/lib/canvas/objects/AreaObject');

describe('AreaTool', () => {
  let mockCanvas: any;
  let mockStoreState: any;
  let mockMaterialStoreState: any;

  beforeEach(() => {
    // Setup mock canvas
    mockCanvas = {
      on: vi.fn(),
      off: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      renderAll: vi.fn(),
      getObjects: vi.fn().mockReturnValue([]),
      setActiveObject: vi.fn(),
    };

    // Setup mock store state
    mockStoreState = {
      drawingPoints: [],
      addDrawingPoint: vi.fn(),
      clearDrawingPoints: vi.fn(),
      setDrawing: vi.fn(),
      setDrawingPoints: vi.fn(),
      isDrawing: false,
      snapPoint: vi.fn((point) => point),
      getSnapGuides: vi.fn().mockReturnValue([]),
      areaTool: {
        minPoints: 3,
        maxPoints: 20,
        closeOnDoubleClick: true,
        showDimensions: true,
      },
    };

    mockMaterialStoreState = {
      getSelectedMaterial: vi.fn().mockReturnValue({
        id: 'test-material',
        name: 'Test Material',
        color: '#3b82f6',
      }),
    };

    // Mock store implementations
    (useCanvasToolStore as any).mockReturnValue(mockStoreState);
    (useCanvasToolStore as any).getState = vi.fn().mockReturnValue(mockStoreState);
    (useMaterialStore as any).mockReturnValue(mockMaterialStoreState);

    // Mock AreaObject constructor
    (AreaObject as any).mockImplementation((points, options) => ({
      points,
      options,
      type: 'areaObject',
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('renders status indicator when active', () => {
      const { getByText } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Area Tool Active')).toBeTruthy();
      expect(getByText('Click to start drawing a landscape area')).toBeTruthy();
    });

    it('does not render status indicator when inactive', () => {
      const { container } = render(
        <AreaTool canvas={mockCanvas} isActive={false} />
      );

      expect(container.querySelector('.absolute')).toBeNull();
    });

    it('cleans up when tool becomes inactive', async () => {
      const { rerender } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      // Make tool inactive
      rerender(<AreaTool canvas={mockCanvas} isActive={false} />);

      await waitFor(() => {
        expect(mockStoreState.clearDrawingPoints).toHaveBeenCalled();
        expect(mockStoreState.setDrawing).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Mouse Events', () => {
    it('starts drawing on mouse down', () => {
      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      expect(mockStoreState.setDrawing).toHaveBeenCalledWith(true);
      expect(mockStoreState.addDrawingPoint).toHaveBeenCalledWith({ x: 100, y: 100 });
    });

    it('adds points while drawing', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [{ x: 100, y: 100 }];

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 200, y: 200 } });

      expect(mockStoreState.addDrawingPoint).toHaveBeenCalledWith({ x: 200, y: 200 });
    });

    it('respects maxPoints limit', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = new Array(20).fill({ x: 0, y: 0 }); // Max points reached

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 300, y: 300 } });

      expect(mockStoreState.addDrawingPoint).not.toHaveBeenCalled();
    });

    it('updates preview on mouse move', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [{ x: 100, y: 100 }];

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      mouseMoveHandler?.({ pointer: { x: 200, y: 200 } });

      expect(mockCanvas.add).toHaveBeenCalled();
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });

    it('finishes drawing on double click', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 150, y: 300 },
      ];

      const onAreaCreated = vi.fn();
      render(
        <AreaTool canvas={mockCanvas} isActive={true} onAreaCreated={onAreaCreated} />
      );

      const dblClickHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:dblclick'
      )?.[1];

      dblClickHandler?.({});

      expect(AreaObject).toHaveBeenCalledWith(
        mockStoreState.drawingPoints,
        expect.objectContaining({
          material: mockMaterialStoreState.getSelectedMaterial(),
          showDimensions: true,
        })
      );
      expect(mockCanvas.add).toHaveBeenCalled();
      expect(onAreaCreated).toHaveBeenCalled();
    });
  });

  describe('Keyboard Events', () => {
    let keyDownHandler: (e: KeyboardEvent) => void;

    beforeEach(() => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      render(<AreaTool canvas={mockCanvas} isActive={true} />);
      keyDownHandler = addEventListenerSpy.mock.calls.find(
        ([event]) => event === 'keydown'
      )?.[1] as any;
    });

    it('finishes drawing on Enter key', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 150, y: 300 },
      ];

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(AreaObject).toHaveBeenCalled();
      expect(mockCanvas.add).toHaveBeenCalled();
    });

    it('cancels drawing on Escape key', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [{ x: 100, y: 100 }];

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.clearDrawingPoints).toHaveBeenCalled();
      expect(mockStoreState.setDrawing).toHaveBeenCalledWith(false);
    });

    it('removes last point on Backspace', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ];

      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.setDrawingPoints).toHaveBeenCalledWith([
        { x: 100, y: 100 },
      ]);
    });

    it('does not finish drawing if minPoints not met', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [{ x: 100, y: 100 }]; // Only 1 point, min is 3

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      keyDownHandler(event);

      expect(AreaObject).not.toHaveBeenCalled();
      expect(mockCanvas.add).not.toHaveBeenCalled();
    });
  });

  describe('Snapping', () => {
    it('uses snap point for mouse positions', () => {
      const snappedPoint = { x: 105, y: 95 };
      mockStoreState.snapPoint.mockReturnValue(snappedPoint);

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      expect(mockStoreState.snapPoint).toHaveBeenCalledWith(
        { x: 100, y: 100 },
        []
      );
      expect(mockStoreState.addDrawingPoint).toHaveBeenCalledWith(snappedPoint);
    });

    it('displays snap guides', () => {
      const mockGuides = [
        { type: 'line', points: [0, 100, 1000, 100] },
        { type: 'line', points: [100, 0, 100, 1000] },
      ];
      mockStoreState.getSnapGuides.mockReturnValue(mockGuides);

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      mouseMoveHandler?.({ pointer: { x: 100, y: 100 } });

      expect(mockStoreState.getSnapGuides).toHaveBeenCalled();
      expect(mockCanvas.add).toHaveBeenCalledTimes(mockGuides.length + 1); // guides + preview
    });
  });

  describe('Material Integration', () => {
    it('uses selected material color for preview', () => {
      const customMaterial = {
        id: 'custom',
        name: 'Custom Material',
        color: '#ff0000',
      };
      mockMaterialStoreState.getSelectedMaterial.mockReturnValue(customMaterial);

      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ];

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const polygonCall = vi.mocked(fabric.Polygon).mock.calls[0];
      expect(polygonCall[1]).toMatchObject({
        fill: '#ff000030', // Color with 30 opacity
        stroke: '#ff0000',
      });
    });

    it('creates area object with selected material', () => {
      const material = mockMaterialStoreState.getSelectedMaterial();
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 150, y: 300 },
      ];

      render(<AreaTool canvas={mockCanvas} isActive={true} />);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(enterEvent);

      expect(AreaObject).toHaveBeenCalledWith(
        mockStoreState.drawingPoints,
        expect.objectContaining({ material })
      );
    });
  });

  describe('Status Display', () => {
    it('shows drawing progress', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ];

      const { getByText } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Drawing Area (2/20 points)')).toBeTruthy();
      expect(getByText('Click to add points • Enter to finish • Esc to cancel')).toBeTruthy();
    });

    it('shows ready to finish message when minPoints met', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 150, y: 300 },
      ];

      const { getByText } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Ready to finish (min 3 points)')).toBeTruthy();
      expect(getByText('Double-click to finish')).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      unmount();

      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:down', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:move', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:up', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:dblclick', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('clears preview and guides on cleanup', () => {
      mockStoreState.isDrawing = true;
      mockStoreState.drawingPoints = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ];

      const { rerender } = render(
        <AreaTool canvas={mockCanvas} isActive={true} />
      );

      // Create preview
      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];
      mouseMoveHandler?.({ pointer: { x: 300, y: 300 } });

      // Make tool inactive to trigger cleanup
      rerender(<AreaTool canvas={mockCanvas} isActive={false} />);

      expect(mockCanvas.remove).toHaveBeenCalled();
      expect(mockStoreState.clearDrawingPoints).toHaveBeenCalled();
    });
  });
});