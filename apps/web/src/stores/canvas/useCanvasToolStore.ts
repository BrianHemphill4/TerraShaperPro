import { create } from 'zustand';
import { fabric } from 'fabric';

export type CanvasToolType = 
  | 'select' 
  | 'area' 
  | 'line' 
  | 'move' 
  | 'rotate' 
  | 'scale';

export type SnapMode = 'none' | 'grid' | 'object' | 'both';

export interface CanvasToolState {
  activeTool: CanvasToolType;
  isDrawing: boolean;
  snapMode: SnapMode;
  snapTolerance: number;
  gridSize: number;
  showGrid: boolean;
  showSnapGuides: boolean;
  drawingPoints: fabric.Point[];
  previewObject: fabric.Object | null;
  
  // Tool-specific settings
  areaTool: {
    minPoints: number;
    maxPoints: number;
    closeOnDoubleClick: boolean;
    showDimensions: boolean;
  };
  
  lineTool: {
    defaultStyle: fabric.ILineOptions;
    showDimensions: boolean;
    snapToAngles: boolean;
    angleSnapTolerance: number;
  };
}

export interface CanvasToolStore extends CanvasToolState {
  // Actions
  setActiveTool: (tool: CanvasToolType) => void;
  setDrawing: (isDrawing: boolean) => void;
  setSnapMode: (mode: SnapMode) => void;
  setSnapTolerance: (tolerance: number) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowSnapGuides: (show: boolean) => void;
  setDrawingPoints: (points: fabric.Point[]) => void;
  addDrawingPoint: (point: fabric.Point) => void;
  clearDrawingPoints: () => void;
  setPreviewObject: (object: fabric.Object | null) => void;
  
  // Area tool settings
  setAreaToolSettings: (settings: Partial<CanvasToolState['areaTool']>) => void;
  
  // Line tool settings
  setLineToolSettings: (settings: Partial<CanvasToolState['lineTool']>) => void;
  
  // Snap utilities
  snapToGrid: (point: fabric.Point) => fabric.Point;
  snapToObjects: (point: fabric.Point, objects: fabric.Object[]) => fabric.Point;
  snapPoint: (point: fabric.Point, objects?: fabric.Object[]) => fabric.Point;
  getSnapGuides: (point: fabric.Point, objects?: fabric.Object[]) => fabric.Line[];
}

export const useCanvasToolStore = create<CanvasToolStore>((set, get) => ({
  // Initial state
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
    showDimensions: true
  },
  
  lineTool: {
    defaultStyle: {
      stroke: '#3b82f6',
      strokeWidth: 2,
      fill: '',
      strokeDashArray: []
    },
    showDimensions: true,
    snapToAngles: true,
    angleSnapTolerance: 15 // degrees
  },

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setDrawing: (isDrawing) => set({ isDrawing }),
  
  setSnapMode: (mode) => set({ snapMode: mode }),
  
  setSnapTolerance: (tolerance) => set({ snapTolerance: tolerance }),
  
  setGridSize: (size) => set({ gridSize: size }),
  
  setShowGrid: (show) => set({ showGrid: show }),
  
  setShowSnapGuides: (show) => set({ showSnapGuides: show }),
  
  setDrawingPoints: (points) => set({ drawingPoints: points }),
  
  addDrawingPoint: (point) => set((state) => ({
    drawingPoints: [...state.drawingPoints, point]
  })),
  
  clearDrawingPoints: () => set({ drawingPoints: [] }),
  
  setPreviewObject: (object) => set({ previewObject: object }),
  
  setAreaToolSettings: (settings) => set((state) => ({
    areaTool: { ...state.areaTool, ...settings }
  })),
  
  setLineToolSettings: (settings) => set((state) => ({
    lineTool: { ...state.lineTool, ...settings }
  })),

  // Snap utilities
  snapToGrid: (point) => {
    const { gridSize } = get();
    return new fabric.Point(
      Math.round(point.x / gridSize) * gridSize,
      Math.round(point.y / gridSize) * gridSize
    );
  },

  snapToObjects: (point, objects) => {
    const { snapTolerance } = get();
    let snappedPoint = point;
    let minDistance = snapTolerance;

    objects.forEach(obj => {
      const boundingRect = obj.getBoundingRect();
      const objPoints = [
        new fabric.Point(boundingRect.left, boundingRect.top),
        new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top),
        new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top + boundingRect.height),
        new fabric.Point(boundingRect.left, boundingRect.top + boundingRect.height),
        new fabric.Point(boundingRect.left + boundingRect.width / 2, boundingRect.top),
        new fabric.Point(boundingRect.left + boundingRect.width / 2, boundingRect.top + boundingRect.height),
        new fabric.Point(boundingRect.left, boundingRect.top + boundingRect.height / 2),
        new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top + boundingRect.height / 2)
      ];

      objPoints.forEach(objPoint => {
        const distance = Math.sqrt(
          Math.pow(point.x - objPoint.x, 2) + Math.pow(point.y - objPoint.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          snappedPoint = objPoint;
        }
      });
    });

    return snappedPoint;
  },

  snapPoint: (point, objects = []) => {
    const { snapMode } = get();
    let snappedPoint = point;

    if (snapMode === 'grid' || snapMode === 'both') {
      snappedPoint = get().snapToGrid(snappedPoint);
    }

    if ((snapMode === 'object' || snapMode === 'both') && objects.length > 0) {
      const objectSnap = get().snapToObjects(point, objects);
      // Choose the closest snap point
      const gridDistance = Math.sqrt(
        Math.pow(point.x - snappedPoint.x, 2) + Math.pow(point.y - snappedPoint.y, 2)
      );
      const objectDistance = Math.sqrt(
        Math.pow(point.x - objectSnap.x, 2) + Math.pow(point.y - objectSnap.y, 2)
      );
      
      if (objectDistance < gridDistance) {
        snappedPoint = objectSnap;
      }
    }

    return snappedPoint;
  },

  getSnapGuides: (point, objects = []) => {
    const { snapTolerance, showSnapGuides } = get();
    const guides: fabric.Line[] = [];

    if (!showSnapGuides) return guides;

    // Grid guides
    const { gridSize } = get();
    const snappedToGrid = get().snapToGrid(point);
    const gridDistance = Math.sqrt(
      Math.pow(point.x - snappedToGrid.x, 2) + Math.pow(point.y - snappedToGrid.y, 2)
    );

    if (gridDistance < snapTolerance) {
      // Vertical grid guide
      guides.push(new fabric.Line([snappedToGrid.x, 0, snappedToGrid.x, 1000], {
        stroke: '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        opacity: 0.7
      }));

      // Horizontal grid guide
      guides.push(new fabric.Line([0, snappedToGrid.y, 1000, snappedToGrid.y], {
        stroke: '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        opacity: 0.7
      }));
    }

    // Object guides
    objects.forEach(obj => {
      const boundingRect = obj.getBoundingRect();
      const objPoints = [
        { x: boundingRect.left, y: boundingRect.top },
        { x: boundingRect.left + boundingRect.width, y: boundingRect.top },
        { x: boundingRect.left + boundingRect.width, y: boundingRect.top + boundingRect.height },
        { x: boundingRect.left, y: boundingRect.top + boundingRect.height },
        { x: boundingRect.left + boundingRect.width / 2, y: boundingRect.top },
        { x: boundingRect.left + boundingRect.width / 2, y: boundingRect.top + boundingRect.height },
        { x: boundingRect.left, y: boundingRect.top + boundingRect.height / 2 },
        { x: boundingRect.left + boundingRect.width, y: boundingRect.top + boundingRect.height / 2 }
      ];

      objPoints.forEach(objPoint => {
        const distance = Math.sqrt(
          Math.pow(point.x - objPoint.x, 2) + Math.pow(point.y - objPoint.y, 2)
        );
        
        if (distance < snapTolerance) {
          // Vertical object guide
          guides.push(new fabric.Line([objPoint.x, 0, objPoint.x, 1000], {
            stroke: '#ef4444',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
            opacity: 0.7
          }));

          // Horizontal object guide
          guides.push(new fabric.Line([0, objPoint.y, 1000, objPoint.y], {
            stroke: '#ef4444',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
            opacity: 0.7
          }));
        }
      });
    });

    return guides;
  }
}));