import { create } from 'zustand';
import { fabric } from 'fabric';

export interface SelectionState {
  selectedObjects: fabric.Object[];
  selectionMode: 'single' | 'multi' | 'rubber-band';
  rubberBandStart: fabric.Point | null;
  rubberBandEnd: fabric.Point | null;
  isSelecting: boolean;
  groupSelectionEnabled: boolean;
  lastClickTime: number;
  clickCount: number;
}

export interface SelectionStore extends SelectionState {
  // Selection actions
  setSelectedObjects: (objects: fabric.Object[]) => void;
  addToSelection: (object: fabric.Object) => void;
  removeFromSelection: (object: fabric.Object) => void;
  clearSelection: () => void;
  selectAll: (canvas: fabric.Canvas) => void;
  invertSelection: (canvas: fabric.Canvas) => void;
  
  // Rubber band selection
  startRubberBand: (point: fabric.Point) => void;
  updateRubberBand: (point: fabric.Point) => void;
  endRubberBand: () => void;
  
  // Selection modes
  setSelectionMode: (mode: 'single' | 'multi' | 'rubber-band') => void;
  setGroupSelectionEnabled: (enabled: boolean) => void;
  
  // Click handling
  handleClick: (target: fabric.Object | null, e: fabric.IEvent) => void;
  
  // Getters
  getSelectedCount: () => number;
  hasSelection: () => boolean;
  isSelected: (object: fabric.Object) => boolean;
  getSelectionBounds: () => fabric.Rect | null;
  
  // Group operations
  createGroup: (canvas: fabric.Canvas) => fabric.Group | null;
  ungroupSelection: (canvas: fabric.Canvas) => void;
  
  // Bulk operations
  deleteSelected: (canvas: fabric.Canvas) => void;
  duplicateSelected: (canvas: fabric.Canvas) => void;
  alignSelected: (canvas: fabric.Canvas, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (canvas: fabric.Canvas, distribution: 'horizontal' | 'vertical') => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  // Initial state
  selectedObjects: [],
  selectionMode: 'single',
  rubberBandStart: null,
  rubberBandEnd: null,
  isSelecting: false,
  groupSelectionEnabled: true,
  lastClickTime: 0,
  clickCount: 0,

  // Selection actions
  setSelectedObjects: (objects) => set({ selectedObjects: objects }),

  addToSelection: (object) => set((state) => {
    if (!state.selectedObjects.includes(object)) {
      return { selectedObjects: [...state.selectedObjects, object] };
    }
    return state;
  }),

  removeFromSelection: (object) => set((state) => ({
    selectedObjects: state.selectedObjects.filter(obj => obj !== object)
  })),

  clearSelection: () => set({ selectedObjects: [] }),

  selectAll: (canvas) => {
    const allObjects = canvas.getObjects().filter(obj => obj.selectable !== false);
    set({ selectedObjects: allObjects });
    
    if (allObjects.length > 1) {
      const selection = new fabric.ActiveSelection(allObjects, { canvas });
      canvas.setActiveObject(selection);
    } else if (allObjects.length === 1) {
      canvas.setActiveObject(allObjects[0]);
    }
    canvas.renderAll();
  },

  invertSelection: (canvas) => {
    const { selectedObjects } = get();
    const allObjects = canvas.getObjects().filter(obj => obj.selectable !== false);
    const newSelection = allObjects.filter(obj => !selectedObjects.includes(obj));
    
    set({ selectedObjects: newSelection });
    
    if (newSelection.length > 1) {
      const selection = new fabric.ActiveSelection(newSelection, { canvas });
      canvas.setActiveObject(selection);
    } else if (newSelection.length === 1) {
      canvas.setActiveObject(newSelection[0]);
    } else {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
  },

  // Rubber band selection
  startRubberBand: (point) => set({
    rubberBandStart: point,
    rubberBandEnd: point,
    isSelecting: true
  }),

  updateRubberBand: (point) => set({
    rubberBandEnd: point
  }),

  endRubberBand: () => set({
    rubberBandStart: null,
    rubberBandEnd: null,
    isSelecting: false
  }),

  // Selection modes
  setSelectionMode: (mode) => set({ selectionMode: mode }),

  setGroupSelectionEnabled: (enabled) => set({ groupSelectionEnabled: enabled }),

  // Click handling with double-click detection
  handleClick: (target, e) => {
    const now = Date.now();
    const { lastClickTime, clickCount } = get();
    const timeDiff = now - lastClickTime;
    const isDoubleClick = timeDiff < 300 && clickCount === 1;

    set({
      lastClickTime: now,
      clickCount: isDoubleClick ? 0 : clickCount + 1
    });

    // Clear click count after delay
    setTimeout(() => {
      if (get().clickCount > 0) {
        set({ clickCount: 0 });
      }
    }, 300);

    const isShiftClick = e.e && (e.e as MouseEvent).shiftKey;
    const isCtrlClick = e.e && ((e.e as MouseEvent).ctrlKey || (e.e as MouseEvent).metaKey);

    if (isDoubleClick && target) {
      // Double-click: Edit mode or special action
      console.log('Double-click detected on:', target);
      return;
    }

    if (!target) {
      // Clicked on empty space
      if (!isShiftClick && !isCtrlClick) {
        get().clearSelection();
      }
      return;
    }

    const { selectedObjects, selectionMode } = get();
    const isCurrentlySelected = selectedObjects.includes(target);

    if (selectionMode === 'single' && !isShiftClick && !isCtrlClick) {
      // Single selection mode
      set({ selectedObjects: [target] });
    } else if (isShiftClick || isCtrlClick || selectionMode === 'multi') {
      // Multi-selection mode
      if (isCurrentlySelected) {
        get().removeFromSelection(target);
      } else {
        get().addToSelection(target);
      }
    } else {
      // Default behavior
      set({ selectedObjects: [target] });
    }
  },

  // Getters
  getSelectedCount: () => get().selectedObjects.length,

  hasSelection: () => get().selectedObjects.length > 0,

  isSelected: (object) => get().selectedObjects.includes(object),

  getSelectionBounds: () => {
    const { selectedObjects } = get();
    if (selectedObjects.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedObjects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    return new fabric.Rect({
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
      fill: 'transparent',
      stroke: '#007bff',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false
    });
  },

  // Group operations
  createGroup: (canvas) => {
    const { selectedObjects } = get();
    if (selectedObjects.length < 2) return null;

    const group = new fabric.Group(selectedObjects, {
      selectable: true,
      evented: true
    });

    // Remove individual objects and add group
    selectedObjects.forEach(obj => canvas.remove(obj));
    canvas.add(group);
    canvas.setActiveObject(group);
    set({ selectedObjects: [group] });
    canvas.renderAll();

    return group;
  },

  ungroupSelection: (canvas) => {
    const { selectedObjects } = get();
    const groups = selectedObjects.filter(obj => obj.type === 'group') as fabric.Group[];

    groups.forEach(group => {
      const objects = group.getObjects();
      group.destroy();
      canvas.remove(group);
      
      objects.forEach(obj => {
        canvas.add(obj);
      });
    });

    const newSelection = selectedObjects.filter(obj => obj.type !== 'group');
    set({ selectedObjects: newSelection });
    canvas.renderAll();
  },

  // Bulk operations
  deleteSelected: (canvas) => {
    const { selectedObjects } = get();
    selectedObjects.forEach(obj => canvas.remove(obj));
    set({ selectedObjects: [] });
    canvas.discardActiveObject();
    canvas.renderAll();
  },

  duplicateSelected: (canvas) => {
    const { selectedObjects } = get();
    const clonedObjects: fabric.Object[] = [];

    selectedObjects.forEach(obj => {
      obj.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20
        });
        canvas.add(cloned);
        clonedObjects.push(cloned);
      });
    });

    // Select the cloned objects
    setTimeout(() => {
      set({ selectedObjects: clonedObjects });
      if (clonedObjects.length > 1) {
        const selection = new fabric.ActiveSelection(clonedObjects, { canvas });
        canvas.setActiveObject(selection);
      } else if (clonedObjects.length === 1) {
        canvas.setActiveObject(clonedObjects[0]);
      }
      canvas.renderAll();
    }, 10);
  },

  alignSelected: (canvas, alignment) => {
    const { selectedObjects } = get();
    if (selectedObjects.length < 2) return;

    let referenceValue: number;
    const bounds = selectedObjects.map(obj => obj.getBoundingRect());

    switch (alignment) {
      case 'left':
        referenceValue = Math.min(...bounds.map(b => b.left));
        selectedObjects.forEach(obj => {
          obj.set('left', referenceValue);
          obj.setCoords();
        });
        break;
      case 'center':
        const leftmost = Math.min(...bounds.map(b => b.left));
        const rightmost = Math.max(...bounds.map(b => b.left + b.width));
        referenceValue = (leftmost + rightmost) / 2;
        selectedObjects.forEach(obj => {
          const objBounds = obj.getBoundingRect();
          obj.set('left', referenceValue - objBounds.width / 2);
          obj.setCoords();
        });
        break;
      case 'right':
        referenceValue = Math.max(...bounds.map(b => b.left + b.width));
        selectedObjects.forEach(obj => {
          const objBounds = obj.getBoundingRect();
          obj.set('left', referenceValue - objBounds.width);
          obj.setCoords();
        });
        break;
      case 'top':
        referenceValue = Math.min(...bounds.map(b => b.top));
        selectedObjects.forEach(obj => {
          obj.set('top', referenceValue);
          obj.setCoords();
        });
        break;
      case 'middle':
        const topmost = Math.min(...bounds.map(b => b.top));
        const bottommost = Math.max(...bounds.map(b => b.top + b.height));
        referenceValue = (topmost + bottommost) / 2;
        selectedObjects.forEach(obj => {
          const objBounds = obj.getBoundingRect();
          obj.set('top', referenceValue - objBounds.height / 2);
          obj.setCoords();
        });
        break;
      case 'bottom':
        referenceValue = Math.max(...bounds.map(b => b.top + b.height));
        selectedObjects.forEach(obj => {
          const objBounds = obj.getBoundingRect();
          obj.set('top', referenceValue - objBounds.height);
          obj.setCoords();
        });
        break;
    }

    canvas.renderAll();
  },

  distributeSelected: (canvas, distribution) => {
    const { selectedObjects } = get();
    if (selectedObjects.length < 3) return;

    const bounds = selectedObjects.map(obj => obj.getBoundingRect());

    if (distribution === 'horizontal') {
      // Sort by left position
      const sorted = selectedObjects
        .map((obj, index) => ({ obj, bounds: bounds[index] }))
        .sort((a, b) => a.bounds.left - b.bounds.left);

      const totalWidth = sorted[sorted.length - 1].bounds.left + sorted[sorted.length - 1].bounds.width - sorted[0].bounds.left;
      const objectsWidth = sorted.reduce((sum, item) => sum + item.bounds.width, 0);
      const spacing = (totalWidth - objectsWidth) / (sorted.length - 1);

      let currentX = sorted[0].bounds.left;
      sorted.forEach((item, index) => {
        if (index > 0) {
          currentX += spacing;
          item.obj.set('left', currentX);
          item.obj.setCoords();
        }
        currentX += item.bounds.width;
      });
    } else {
      // Sort by top position
      const sorted = selectedObjects
        .map((obj, index) => ({ obj, bounds: bounds[index] }))
        .sort((a, b) => a.bounds.top - b.bounds.top);

      const totalHeight = sorted[sorted.length - 1].bounds.top + sorted[sorted.length - 1].bounds.height - sorted[0].bounds.top;
      const objectsHeight = sorted.reduce((sum, item) => sum + item.bounds.height, 0);
      const spacing = (totalHeight - objectsHeight) / (sorted.length - 1);

      let currentY = sorted[0].bounds.top;
      sorted.forEach((item, index) => {
        if (index > 0) {
          currentY += spacing;
          item.obj.set('top', currentY);
          item.obj.setCoords();
        }
        currentY += item.bounds.height;
      });
    }

    canvas.renderAll();
  }
}));