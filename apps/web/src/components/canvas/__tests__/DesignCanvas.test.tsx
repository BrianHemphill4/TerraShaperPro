import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DesignCanvas from '../DesignCanvas';

// Mock Fabric.js
const mockCanvas = {
  on: vi.fn(),
  off: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  renderAll: vi.fn(),
  setDimensions: vi.fn(),
  getObjects: vi.fn(() => []),
  getActiveObject: vi.fn(),
  getActiveObjects: vi.fn(() => []),
  discardActiveObject: vi.fn(),
  setActiveObject: vi.fn(),
  dispose: vi.fn(),
  toJSON: vi.fn(() => ({})),
  loadFromJSON: vi.fn(),
  requestRenderAll: vi.fn(),
};

vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn(() => mockCanvas),
    Object: {
      prototype: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
    util: {
      requestAnimFrame: vi.fn((callback) => setTimeout(callback, 16)),
    },
  },
}));

// Mock Next.js
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock React hooks
const mockOnElementsChange = vi.fn();

const mockProps = {
  onReady: vi.fn(),
  onElementsChange: mockOnElementsChange,
};

describe('DesignCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
    // Mock ResizeObserver
    globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Canvas Initialization', () => {
    it('should render canvas element', () => {
      render(<DesignCanvas {...mockProps} />);

      const canvas = document.querySelector('canvas');

      expect(canvas).toBeInTheDocument();
    });

    it('should call onCanvasReady when canvas is initialized', async () => {
      render(<DesignCanvas {...mockProps} />);

      await waitFor(() => {
        expect(mockProps.onReady).toHaveBeenCalledWith(mockCanvas);
      });
    });

    it('should set canvas dimensions', async () => {
      render(<DesignCanvas {...mockProps} />);

      await waitFor(() => {
        expect(mockCanvas.renderAll).toHaveBeenCalled();
      });
    });
  });

  describe('Canvas Events', () => {
    it('should register canvas event listeners', async () => {
      render(<DesignCanvas {...mockProps} />);

      await waitFor(() => {
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:move', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('mouse:dblclick', expect.any(Function));
      });
    });

    it('should handle object selection events', async () => {
      render(<DesignCanvas {...mockProps} />);

      await waitFor(() => {
        expect(mockCanvas.on).toHaveBeenCalledWith('selection:created', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('selection:updated', expect.any(Function));
        expect(mockCanvas.on).toHaveBeenCalledWith('selection:cleared', expect.any(Function));
      });
    });
  });

  describe('Element Management', () => {
    it('should call onElementsChange when elements are modified', async () => {
      // Mock canvas getObjects to return some test objects
      mockCanvas.getObjects.mockReturnValue([
        { id: 'test-1', type: 'rect', left: 0, top: 0, evented: true },
      ] as any);

      render(<DesignCanvas {...mockProps} />);

      // The component should call onElementsChange during initialization
      await waitFor(() => {
        expect(mockOnElementsChange).toHaveBeenCalled();
      });
    });
  });

  describe('Canvas Cleanup', () => {
    it('should dispose canvas on unmount', () => {
      const { unmount } = render(<DesignCanvas {...mockProps} />);

      unmount();

      expect(mockCanvas.dispose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle canvas initialization errors gracefully', () => {
      // Should not throw error
      expect(() => render(<DesignCanvas {...mockProps} />)).not.toThrow();
    });
  });
});
