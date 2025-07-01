import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnotationCanvas } from '../AnnotationCanvas';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';

// Mock fabric.js
const mockCanvas = {
  dispose: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  setDimensions: jest.fn(),
  setZoom: jest.fn(),
  getElement: jest.fn(() => ({
    style: {},
    width: 800,
    height: 600
  })),
  getContext: jest.fn(() => ({
    scale: jest.fn()
  })),
  setBackgroundImage: jest.fn(),
  setOverlayImage: jest.fn(),
  renderAll: jest.fn(),
  getActiveObjects: jest.fn(() => []),
  getObjects: jest.fn(() => []),
  add: jest.fn(),
  remove: jest.fn(),
  discardActiveObject: jest.fn(),
  setActiveObject: jest.fn(),
  width: 800,
  height: 600,
  selection: true,
  skipTargetFind: false,
  hoverCursor: 'default',
  moveCursor: 'default',
  defaultCursor: 'default'
};

const mockPattern = {};

jest.mock('fabric', () => ({
  fabric: {
    Canvas: jest.fn().mockImplementation(() => mockCanvas),
    Image: {
      fromURL: jest.fn((url, callback) => {
        const mockImage = {
          width: 1000,
          height: 600,
          set: jest.fn(),
          scaleX: 1,
          scaleY: 1
        };
        callback(mockImage);
      })
    },
    Polygon: jest.fn().mockImplementation((points, options) => ({
      data: options.data,
      ...options
    })),
    ActiveSelection: jest.fn(),
    Pattern: jest.fn().mockImplementation(() => mockPattern)
  }
}));

// Mock the stores
jest.mock('@/stores/useMaskStore');
jest.mock('@/stores/useSceneStore');

const mockUseMaskStore = useMaskStore as jest.MockedFunction<typeof useMaskStore>;
const mockUseSceneStore = useSceneStore as jest.MockedFunction<typeof useSceneStore>;

describe('AnnotationCanvas', () => {
  const mockGetMasksByScene = jest.fn();
  const mockAddMask = jest.fn();
  const mockSetSelectedMasks = jest.fn();
  const mockGetCurrentScene = jest.fn();
  const mockOnMaskCreated = jest.fn();
  const mockOnMaskSelected = jest.fn();
  const mockOnCanvasReady = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMaskStore.mockReturnValue({
      getMasksByScene: mockGetMasksByScene,
      addMask: mockAddMask,
      drawingCategory: 'Plants & Trees',
      setSelectedMasks: mockSetSelectedMasks,
      selectedMaskIds: []
    } as any);

    mockUseSceneStore.mockReturnValue({
      getCurrentScene: mockGetCurrentScene
    } as any);

    mockGetMasksByScene.mockReturnValue([]);
    mockGetCurrentScene.mockReturnValue({
      id: 'scene-123',
      imageUrl: 'https://example.com/scene.jpg'
    });

    // Reset canvas mock
    Object.assign(mockCanvas, {
      selection: true,
      skipTargetFind: false,
      hoverCursor: 'default',
      moveCursor: 'default',
      defaultCursor: 'default'
    });
  });

  it('renders loading state initially', () => {
    render(<AnnotationCanvas />);
    expect(screen.getByText('Loading canvas...')).toBeInTheDocument();
  });

  it('initializes fabric canvas on mount', async () => {
    const { fabric } = require('fabric');
    render(<AnnotationCanvas onCanvasReady={mockOnCanvasReady} />);
    
    await waitFor(() => {
      expect(fabric.Canvas).toHaveBeenCalled();
      expect(mockOnCanvasReady).toHaveBeenCalledWith(mockCanvas);
    });
  });

  it('loads scene image as background', async () => {
    const { fabric } = require('fabric');
    render(<AnnotationCanvas />);
    
    await waitFor(() => {
      expect(fabric.Image.fromURL).toHaveBeenCalledWith(
        'https://example.com/scene.jpg',
        expect.any(Function),
        { crossOrigin: 'anonymous' }
      );
    });
  });

  it('toggles grid overlay', async () => {
    render(<AnnotationCanvas />);
    
    await waitFor(() => {
      expect(screen.getByText('Grid')).toBeInTheDocument();
    });

    const gridButton = screen.getByText('Grid');
    await userEvent.click(gridButton);
    
    expect(mockCanvas.setOverlayImage).toHaveBeenCalled();
  });

  it('updates canvas mode based on active tool', async () => {
    const { rerender } = render(<AnnotationCanvas activeTool="select" />);
    
    await waitFor(() => {
      expect(mockCanvas.selection).toBe(true);
      expect(mockCanvas.skipTargetFind).toBe(false);
    });

    rerender(<AnnotationCanvas activeTool="mask-polygon" />);
    
    await waitFor(() => {
      expect(mockCanvas.selection).toBe(false);
      expect(mockCanvas.skipTargetFind).toBe(true);
      expect(mockCanvas.hoverCursor).toBe('crosshair');
    });
  });

  it('shows tool-specific instructions', async () => {
    render(<AnnotationCanvas activeTool="mask-polygon" />);
    
    await waitFor(() => {
      expect(screen.getByText('Click to place polygon points')).toBeInTheDocument();
      expect(screen.getByText('Press Enter to complete, Esc to cancel')).toBeInTheDocument();
    });
  });

  it('displays current tool and category in indicator', async () => {
    render(<AnnotationCanvas activeTool="mask-brush" />);
    
    await waitFor(() => {
      expect(screen.getByText('Tool:')).toBeInTheDocument();
      expect(screen.getByText('Mask brush')).toBeInTheDocument();
      expect(screen.getByText('Plants & Trees')).toBeInTheDocument();
    });
  });

  it('handles keyboard shortcuts', async () => {
    render(<AnnotationCanvas />);
    
    await waitFor(() => {
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });

    // Test grid toggle with 'g' key
    fireEvent.keyDown(window, { key: 'g' });
    expect(mockCanvas.setOverlayImage).toHaveBeenCalled();

    // Test escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
  });

  it('renders existing masks', async () => {
    const { fabric } = require('fabric');
    const mockMask = {
      id: 'mask-1',
      category: 'Plants & Trees',
      path: {
        type: 'Polygon',
        coordinates: [[[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]]
      }
    };

    mockGetMasksByScene.mockReturnValue([mockMask]);
    
    render(<AnnotationCanvas />);
    
    await waitFor(() => {
      expect(fabric.Polygon).toHaveBeenCalledWith(
        expect.arrayContaining([
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 },
          { x: 100, y: 100 }
        ]),
        expect.objectContaining({
          data: {
            maskId: 'mask-1',
            category: 'Plants & Trees'
          }
        })
      );
      expect(mockCanvas.add).toHaveBeenCalled();
    });
  });

  it('handles mask selection', async () => {
    render(<AnnotationCanvas onMaskSelected={mockOnMaskSelected} />);
    
    await waitFor(() => {
      expect(mockCanvas.on).toHaveBeenCalledWith('selection:created', expect.any(Function));
    });

    // Simulate selection event
    const selectionHandler = mockCanvas.on.mock.calls.find(
      call => call[0] === 'selection:created'
    )?.[1];

    if (selectionHandler) {
      mockCanvas.getActiveObjects.mockReturnValue([
        { data: { maskId: 'mask-1' } }
      ]);
      
      selectionHandler({});
      
      expect(mockSetSelectedMasks).toHaveBeenCalledWith(['mask-1']);
      expect(mockOnMaskSelected).toHaveBeenCalledWith(['mask-1']);
    }
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<AnnotationCanvas />);
    
    unmount();
    
    expect(mockCanvas.dispose).toHaveBeenCalled();
  });

  it('applies custom className', async () => {
    render(<AnnotationCanvas className="custom-canvas" />);
    
    await waitFor(() => {
      const container = screen.getByText('Loading canvas...').closest('.custom-canvas');
      expect(container).toBeInTheDocument();
    });
  });

  it('does not handle keyboard shortcuts when typing in input', async () => {
    render(
      <div>
        <input data-testid="text-input" />
        <AnnotationCanvas />
      </div>
    );
    
    const input = screen.getByTestId('text-input');
    input.focus();
    
    fireEvent.keyDown(input, { key: 'g' });
    
    // Should not have toggled grid
    expect(mockCanvas.setOverlayImage).not.toHaveBeenCalled();
  });
});