import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { fabric } from 'fabric';
import { SelectionTool } from '../SelectionTool';
import { useSelectionStore } from '@/stores/canvas/useSelectionStore';

// Mock fabric.js
vi.mock('fabric', () => ({
  fabric: {
    Canvas: vi.fn(),
    Point: vi.fn().mockImplementation((x, y) => ({ x, y })),
    Rect: vi.fn().mockImplementation((options) => ({
      ...options,
      type: 'rect',
    })),
    ActiveSelection: vi.fn().mockImplementation((objects, options) => ({
      objects,
      ...options,
      type: 'activeSelection',
    })),
  },
}));

// Mock stores
vi.mock('@/stores/canvas/useSelectionStore');

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Square: () => <div data-testid="icon-square" />,
  Group: () => <div data-testid="icon-group" />,
  Ungroup: () => <div data-testid="icon-ungroup" />,
  AlignLeft: () => <div data-testid="icon-align-left" />,
  AlignCenter: () => <div data-testid="icon-align-center" />,
  AlignRight: () => <div data-testid="icon-align-right" />,
  Copy: () => <div data-testid="icon-copy" />,
  Trash2: () => <div data-testid="icon-trash" />,
}));

describe('SelectionTool', () => {
  let mockCanvas: any;
  let mockStoreState: any;

  beforeEach(() => {
    // Setup mock canvas
    mockCanvas = {
      on: vi.fn(),
      off: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      renderAll: vi.fn(),
      getObjects: vi.fn().mockReturnValue([]),
      getActiveObjects: vi.fn().mockReturnValue([]),
      setActiveObject: vi.fn(),
      discardActiveObject: vi.fn(),
      selection: true,
    };

    // Setup mock store state
    mockStoreState = {
      selectedObjects: [],
      rubberBandStart: null,
      rubberBandEnd: null,
      isSelecting: false,
      selectionMode: 'multi',
      startRubberBand: vi.fn(),
      updateRubberBand: vi.fn(),
      endRubberBand: vi.fn(),
      handleClick: vi.fn(),
      selectAll: vi.fn(),
      clearSelection: vi.fn(),
      createGroup: vi.fn(),
      ungroupSelection: vi.fn(),
      deleteSelected: vi.fn(),
      duplicateSelected: vi.fn(),
      alignSelected: vi.fn(),
      distributeSelected: vi.fn(),
      getSelectedCount: vi.fn().mockReturnValue(0),
      hasSelection: vi.fn().mockReturnValue(false),
      setSelectedObjects: vi.fn(),
    };

    // Mock store implementations
    (useSelectionStore as any).mockReturnValue(mockStoreState);
    (useSelectionStore as any).getState = vi.fn().mockReturnValue(mockStoreState);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('renders status indicator when active', () => {
      const { getByText } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Selection Tool Active')).toBeTruthy();
      expect(getByText('Click objects to select • Shift+Click: Multi-select')).toBeTruthy();
    });

    it('does not render status indicator when inactive', () => {
      const { container } = render(
        <SelectionTool canvas={mockCanvas} isActive={false} />
      );

      expect(container.querySelector('.absolute')).toBeNull();
    });

    it('sets up canvas event listeners', () => {
      render(<SelectionTool canvas={mockCanvas} isActive={true} />);

      expect(mockCanvas.on).toHaveBeenCalledWith('selection:created', expect.any(Function));
      expect(mockCanvas.on).toHaveBeenCalledWith('selection:updated', expect.any(Function));
      expect(mockCanvas.on).toHaveBeenCalledWith('selection:cleared', expect.any(Function));
      expect(mockCanvas.on).toHaveBeenCalledWith('mouse:down', expect.any(Function));
      expect(mockCanvas.on).toHaveBeenCalledWith('mouse:move', expect.any(Function));
      expect(mockCanvas.on).toHaveBeenCalledWith('mouse:up', expect.any(Function));
    });
  });

  describe('Selection Events', () => {
    it('handles selection created event', () => {
      const mockObjects = [{ id: 1 }, { id: 2 }];
      mockCanvas.getActiveObjects.mockReturnValue(mockObjects);
      const onSelectionChange = vi.fn();

      render(
        <SelectionTool canvas={mockCanvas} isActive={true} onSelectionChange={onSelectionChange} />
      );

      const selectionCreatedHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'selection:created'
      )?.[1];

      selectionCreatedHandler?.({});

      expect(mockStoreState.setSelectedObjects).toHaveBeenCalledWith(mockObjects);
      expect(onSelectionChange).toHaveBeenCalledWith(mockObjects);
    });

    it('handles selection updated event', () => {
      const mockObjects = [{ id: 3 }];
      mockCanvas.getActiveObjects.mockReturnValue(mockObjects);
      const onSelectionChange = vi.fn();

      render(
        <SelectionTool canvas={mockCanvas} isActive={true} onSelectionChange={onSelectionChange} />
      );

      const selectionUpdatedHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'selection:updated'
      )?.[1];

      selectionUpdatedHandler?.({});

      expect(mockStoreState.setSelectedObjects).toHaveBeenCalledWith(mockObjects);
      expect(onSelectionChange).toHaveBeenCalledWith(mockObjects);
    });

    it('handles selection cleared event', () => {
      const onSelectionChange = vi.fn();

      render(
        <SelectionTool canvas={mockCanvas} isActive={true} onSelectionChange={onSelectionChange} />
      );

      const selectionClearedHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'selection:cleared'
      )?.[1];

      selectionClearedHandler?.();

      expect(mockStoreState.clearSelection).toHaveBeenCalled();
      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Rubber Band Selection', () => {
    it('starts rubber band selection on empty space click', () => {
      render(<SelectionTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      mouseDownHandler?.({ pointer: { x: 100, y: 100 }, target: null });

      expect(mockStoreState.startRubberBand).toHaveBeenCalledWith({ x: 100, y: 100 });
      expect(mockCanvas.selection).toBe(false);
    });

    it('updates rubber band on mouse move', () => {
      mockStoreState.isSelecting = true;
      mockStoreState.rubberBandStart = { x: 100, y: 100 };
      mockStoreState.rubberBandEnd = { x: 200, y: 200 };

      render(<SelectionTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];
      const mouseMoveHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:move'
      )?.[1];

      // Start dragging
      mouseDownHandler?.({ pointer: { x: 100, y: 100 }, target: null });

      // Move mouse
      mouseMoveHandler?.({ pointer: { x: 250, y: 250 } });

      expect(mockStoreState.updateRubberBand).toHaveBeenCalledWith({ x: 250, y: 250 });
      expect(mockCanvas.add).toHaveBeenCalled(); // Rubber band visual
    });

    it('completes rubber band selection on mouse up', () => {
      const mockObjects = [
        { 
          id: 1, 
          selectable: true,
          getBoundingRect: () => ({ left: 110, top: 110, width: 50, height: 50 })
        },
        { 
          id: 2, 
          selectable: true,
          getBoundingRect: () => ({ left: 300, top: 300, width: 50, height: 50 })
        },
      ];
      mockCanvas.getObjects.mockReturnValue(mockObjects);
      mockStoreState.isSelecting = true;
      mockStoreState.rubberBandStart = { x: 100, y: 100 };
      mockStoreState.rubberBandEnd = { x: 200, y: 200 };

      render(<SelectionTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];
      const mouseUpHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:up'
      )?.[1];

      // Start dragging
      mouseDownHandler?.({ pointer: { x: 100, y: 100 }, target: null });

      // Release mouse
      mouseUpHandler?.({});

      // Only the first object should be selected (within bounds)
      expect(mockStoreState.setSelectedObjects).toHaveBeenCalledWith([mockObjects[0]]);
      expect(mockCanvas.setActiveObject).toHaveBeenCalled();
      expect(mockStoreState.endRubberBand).toHaveBeenCalled();
      expect(mockCanvas.selection).toBe(true);
    });

    it('displays rubber band selection status', () => {
      mockStoreState.isSelecting = true;

      const { getByText } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Rubber Band Selection')).toBeTruthy();
      expect(getByText('Drag to select multiple objects')).toBeTruthy();
    });
  });

  describe('Object Selection', () => {
    it('handles click on object', () => {
      const mockObject = { id: 1, type: 'rect' };

      render(<SelectionTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      const mockEvent = { pointer: { x: 100, y: 100 }, target: mockObject };
      mouseDownHandler?.(mockEvent);

      expect(mockStoreState.handleClick).toHaveBeenCalledWith(mockObject, mockEvent);
    });

    it('clears selection on empty space click in single mode', () => {
      mockStoreState.selectionMode = 'single';

      render(<SelectionTool canvas={mockCanvas} isActive={true} />);

      const mouseDownHandler = mockCanvas.on.mock.calls.find(
        ([event]) => event === 'mouse:down'
      )?.[1];

      const mockEvent = { pointer: { x: 100, y: 100 }, target: null };
      mouseDownHandler?.(mockEvent);

      expect(mockStoreState.handleClick).toHaveBeenCalledWith(null, mockEvent);
    });
  });

  describe('Keyboard Shortcuts', () => {
    let keyDownHandler: (e: KeyboardEvent) => void;

    beforeEach(() => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      render(<SelectionTool canvas={mockCanvas} isActive={true} />);
      keyDownHandler = addEventListenerSpy.mock.calls.find(
        ([event]) => event === 'keydown'
      )?.[1] as any;
    });

    it('selects all on Ctrl+A', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.selectAll).toHaveBeenCalledWith(mockCanvas);
    });

    it('clears selection on Escape', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.clearSelection).toHaveBeenCalled();
      expect(mockCanvas.discardActiveObject).toHaveBeenCalled();
    });

    it('deletes selected on Delete key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.deleteSelected).toHaveBeenCalledWith(mockCanvas);
    });

    it('duplicates selected on Ctrl+D', () => {
      const event = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.duplicateSelected).toHaveBeenCalledWith(mockCanvas);
    });

    it('groups selected on Ctrl+G', () => {
      const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.createGroup).toHaveBeenCalledWith(mockCanvas);
    });

    it('ungroups selected on Ctrl+Shift+U', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'u', 
        ctrlKey: true, 
        shiftKey: true 
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      keyDownHandler(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockStoreState.ungroupSelection).toHaveBeenCalledWith(mockCanvas);
    });

    it('ignores shortcuts when typing in input', () => {
      const input = document.createElement('input');
      Object.defineProperty(event, 'target', {
        value: input,
        writable: true,
      });

      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      keyDownHandler(event);

      expect(mockStoreState.selectAll).not.toHaveBeenCalled();
    });
  });

  describe('Selection Toolbar', () => {
    it('shows toolbar when objects are selected', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(2);
      mockStoreState.selectedObjects = [{}, {}];

      const { getByText, getByTestId } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('2 selected')).toBeTruthy();
      expect(getByTestId('icon-group')).toBeTruthy();
      expect(getByTestId('icon-copy')).toBeTruthy();
      expect(getByTestId('icon-trash')).toBeTruthy();
    });

    it('shows alignment buttons for multiple selection', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(3);
      mockStoreState.selectedObjects = [{}, {}, {}];

      const { getByTestId } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByTestId('icon-align-left')).toBeTruthy();
      expect(getByTestId('icon-align-center')).toBeTruthy();
      expect(getByTestId('icon-align-right')).toBeTruthy();
    });

    it('shows ungroup button for groups', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(1);
      mockStoreState.selectedObjects = [{ type: 'group' }];

      const { getByTestId } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByTestId('icon-ungroup')).toBeTruthy();
    });

    it('handles toolbar button clicks', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(2);
      mockStoreState.selectedObjects = [{}, {}];

      const { getByTestId } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      // Test group button
      fireEvent.click(getByTestId('icon-group'));
      expect(mockStoreState.createGroup).toHaveBeenCalledWith(mockCanvas);

      // Test duplicate button
      fireEvent.click(getByTestId('icon-copy'));
      expect(mockStoreState.duplicateSelected).toHaveBeenCalledWith(mockCanvas);

      // Test delete button
      fireEvent.click(getByTestId('icon-trash'));
      expect(mockStoreState.deleteSelected).toHaveBeenCalledWith(mockCanvas);
    });
  });

  describe('Status Display', () => {
    it('shows selection count when objects selected', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(3);

      const { getByText } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('3 objects selected')).toBeTruthy();
    });

    it('shows singular form for single selection', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(1);

      const { getByText } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('1 object selected')).toBeTruthy();
    });

    it('shows keyboard shortcuts in status', () => {
      mockStoreState.hasSelection.mockReturnValue(true);
      mockStoreState.getSelectedCount.mockReturnValue(2);

      const { getByText } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      expect(getByText('Ctrl+A: Select All • Esc: Clear • Del: Delete')).toBeTruthy();
      expect(getByText('Ctrl+D: Duplicate • Ctrl+G: Group')).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <SelectionTool canvas={mockCanvas} isActive={true} />
      );

      unmount();

      expect(mockCanvas.off).toHaveBeenCalledWith('selection:created', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('selection:updated', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('selection:cleared', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:down', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:move', expect.any(Function));
      expect(mockCanvas.off).toHaveBeenCalledWith('mouse:up', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});