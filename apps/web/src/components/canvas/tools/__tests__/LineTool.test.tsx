import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { fabric } from 'fabric';
import { LineTool } from '../LineTool';
import { useCanvasToolStore } from '@/stores/canvas/useCanvasToolStore';
import { useMaterialStore } from '@/stores/canvas/useMaterialStore';
import { LineObject } from '@/lib/canvas/objects/LineObject';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn(),
    Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
    Line: vi.fn().mockImplementation((points, options) => ({
      x1: points[0],
      y1: points[1],
      x2: points[2],
      y2: points[3],
      ...options,
    })),
  },
}));

// Mock stores
vi.mock('@/stores/canvas/useCanvasToolStore');
vi.mock('@/stores/canvas/useMaterialStore');
vi.mock('@/lib/canvas/objects/LineObject');

describe('LineTool', () => {
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
      snapPoint: vi.fn((point) => point),
      getSnapGuides: vi.fn().mockReturnValue([]),
      lineTool: {
        defaultStyle: {
          stroke: '#000000',
          strokeWidth: 2,
        },
        showDimensions: true,
        snapToAngles: false,
        angleSnapTolerance: 5,
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
    (useMaterialStore as any).mockReturnValue(mockMaterialStoreState);

    // Mock LineObject constructor
    (LineObject as any).mockImplementation((points, options) => ({
      points,
      options,
      type: 'lineObject',
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('renders status indicator when active', () => {
      const { getByText } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Line Tool Active')).toBeTruthy();
      expect(getByText('Click to start drawing a line')).toBeTruthy();
    });

    it('does not render status indicator when inactive', () => {
      const { container } = render(
        <LineTool canvas={mockCanvas} isActive={false} />
      );

      expect(container.querySelector('.absolute')).toBeNull();
    });

    it('shows angle snapping info when enabled', () => {
      mockStoreState.lineTool.snapToAngles = true;
      mockStoreState.lineTool.angleSnapTolerance = 10;

      const { getByText } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Angle snapping enabled (10°)')).toBeTruthy();
    });
  });

  describe('Mouse Events', () => {
    it('starts drawing on first click', () => {
      const { getByText } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      expect(getByText('Drawing Line')).toBeTruthy();
      expect(mockCanvas.add).toHaveBeenCalled(); // Preview line added
    });

    it('finishes drawing on second click', () => {
      const onLineCreated = vi.fn();
      render(
        <LineTool canvas={mockCanvas} isActive={true} onLineCreated={onLineCreated} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // First click - start point
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Second click - end point
      mouseDownHandler?.({ pointer: { x: 200, y: 200 } });

      expect(LineObject).toHaveBeenCalledWith(
        [100, 100, 200, 200],
        expect.objectContaining({
          material: mockMaterialStoreState.getSelectedMaterial(),
          showDimensions: true,
          lineType: 'edge',
        })
      );
      expect(mockCanvas.add).toHaveBeenCalled();
      expect(onLineCreated).toHaveBeenCalled();
    });

    it('does not create zero-length lines', () => {
      const onLineCreated = vi.fn();
      render(
        <LineTool canvas={mockCanvas} isActive={true} onLineCreated={onLineCreated} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // First click
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Second click at same location
      mouseDownHandler?.({ pointer: { x: 101, y: 101 } }); // Very short line < 5 units

      expect(LineObject).not.toHaveBeenCalled();
      expect(onLineCreated).not.toHaveBeenCalled();
    });

    it('updates preview on mouse move', () => {
      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];
      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      // Start drawing
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Move mouse
      mouseMoveHandler?.({ pointer: { x: 200, y: 200 } });

      // Check preview line was updated
      const lineCall = vi.mocked(fabric.Line).mock.calls.find(
        call => call[0][2] === 200 && call[0][3] === 200
      );
      expect(lineCall).toBeTruthy();
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });
  });

  describe('Angle Snapping', () => {
    beforeEach(() => {
      mockStoreState.lineTool.snapToAngles = true;
      mockStoreState.lineTool.angleSnapTolerance = 5;
    });

    it('snaps to horizontal line (0°)', () => {
      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];
      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      // Start drawing
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Move mouse slightly off horizontal
      mouseMoveHandler?.({ pointer: { x: 200, y: 103 } }); // 3 degrees off

      // Check preview line was snapped to horizontal
      const lineCall = vi.mocked(fabric.Line).mock.calls[vi.mocked(fabric.Line).mock.calls.length - 1];
      expect(lineCall[0][3]).toBeCloseTo(100, 0); // y2 should be same as y1
    });

    it('snaps to 45° angle', () => {
      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];
      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      // Start drawing
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Move mouse close to 45 degrees
      mouseMoveHandler?.({ pointer: { x: 200, y: 198 } }); // Close to 45°

      // Check preview line was snapped to 45 degrees
      const lineCall = vi.mocked(fabric.Line).mock.calls[vi.mocked(fabric.Line).mock.calls.length - 1];
      const dx = lineCall[0][2] - lineCall[0][0];
      const dy = lineCall[0][3] - lineCall[0][1];
      expect(Math.abs(dx - dy)).toBeLessThan(1); // dx and dy should be equal for 45°
    });

    it('displays snapping status', () => {
      const { getByText } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      expect(getByText('Snapping to common angles')).toBeTruthy();
    });
  });

  describe('Keyboard Events', () => {
    let keyDownHandler: (e: KeyboardEvent) => void;

    beforeEach(() => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      render(<LineTool canvas={mockCanvas} isActive={true} />);
      keyDownHandler = addEventListenerSpy.mock.calls.find(
        ([event]) => event === 'keydown'
      )?.[1] as any;
    });

    it('cancels drawing on Escape key', () => {
      const { queryByText } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // Start drawing
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });
      expect(queryByText('Drawing Line')).toBeTruthy();

      // Press Escape
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockCanvas.remove).toHaveBeenCalled(); // Preview removed
    });
  });

  describe('Snapping', () => {
    it('uses snap point for mouse positions', () => {
      const snappedPoint = { x: 105, y: 95 };
      mockStoreState.snapPoint.mockReturnValue(snappedPoint);

      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      expect(mockStoreState.snapPoint).toHaveBeenCalledWith(
        { x: 100, y: 100 },
        []
      );

      // Check preview line uses snapped point
      const lineCall = vi.mocked(fabric.Line).mock.calls[0];
      expect(lineCall[0][0]).toBe(105);
      expect(lineCall[0][1]).toBe(95);
    });

    it('displays snap guides', () => {
      const mockGuides = [
        { type: 'line', points: [0, 100, 1000, 100] },
        { type: 'line', points: [100, 0, 100, 1000] },
      ];
      mockStoreState.getSnapGuides.mockReturnValue(mockGuides);

      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      mouseMoveHandler?.({ pointer: { x: 100, y: 100 } });

      expect(mockStoreState.getSnapGuides).toHaveBeenCalled();
      expect(mockCanvas.add).toHaveBeenCalledTimes(mockGuides.length);
    });

    it('clears snap guides on mouse up', async () => {
      const mockGuides = [{ type: 'line' }];
      mockStoreState.getSnapGuides.mockReturnValue(mockGuides);

      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseUpHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:up'
      )?.[1];

      mouseMoveHandler?.({ pointer: { x: 100, y: 100 } });
      mouseUpHandler?.({});

      await waitFor(() => {
        expect(mockCanvas.remove).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Line Information Display', () => {
    it('shows line length and angle while drawing', () => {
      const { getByText } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];
      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      // Start drawing
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Move mouse
      mouseMoveHandler?.({ pointer: { x: 200, y: 200 } });

      // Length should be sqrt(100^2 + 100^2) = 141.4
      expect(getByText(/Length: 141\.\d units/)).toBeTruthy();
      // Angle should be 45 degrees
      expect(getByText(/Angle: 45\.\d°/)).toBeTruthy();
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

      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      const lineCall = vi.mocked(fabric.Line).mock.calls[0];
      expect(lineCall[1]).toMatchObject({
        stroke: '#ff0000',
      });
    });

    it('uses default style when no material selected', () => {
      mockMaterialStoreState.getSelectedMaterial.mockReturnValue(null);

      render(<LineTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      const lineCall = vi.mocked(fabric.Line).mock.calls[0];
      expect(lineCall[1]).toMatchObject({
        stroke: mockStoreState.lineTool.defaultStyle.stroke,
      });
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      unmount();

      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:down', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:move', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:up', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('clears preview when tool becomes inactive', () => {
      const { rerender } = render(
        <LineTool canvas={mockCanvas} isActive={true} />
      );

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      // Start drawing
      mouseDownHandler?.({ pointer: { x: 100, y: 100 } });

      // Make tool inactive
      rerender(<LineTool canvas={mockCanvas} isActive={false} />);

      expect(mockCanvas.remove).toHaveBeenCalled();
    });
  });
});