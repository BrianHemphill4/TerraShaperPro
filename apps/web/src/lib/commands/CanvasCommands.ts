import { fabric } from 'fabric';
import { BaseCommand } from './Command';

/**
 * Command for clearing the entire canvas
 */
export class CanvasClearCommand extends BaseCommand {
  private removedObjects: fabric.Object[] = [];
  private backgroundColor?: string;
  
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly preserveGrid: boolean = true
  ) {
    super('canvas_clear', 'Clear canvas');
  }
  
  execute(): void {
    // Store objects that will be removed
    this.removedObjects = this.canvas.getObjects().filter(obj => {
      if (this.preserveGrid && (obj as any).evented === false) {
        return false; // Keep grid lines and other non-interactive objects
      }
      return true;
    });
    
    // Store background color
    this.backgroundColor = this.canvas.backgroundColor as string;
    
    // Remove objects
    this.removedObjects.forEach(obj => this.canvas.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }
  
  undo(): void {
    // Restore objects
    this.removedObjects.forEach(obj => this.canvas.add(obj));
    
    // Restore background color
    if (this.backgroundColor) {
      this.canvas.backgroundColor = this.backgroundColor;
    }
    
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      removedObjects: this.removedObjects.map(obj => 
        obj.toObject(['id', 'layerId', 'material', 'plantId', 'plantName'])
      ),
      backgroundColor: this.backgroundColor,
      preserveGrid: this.preserveGrid,
    };
  }
}

/**
 * Command for changing canvas background
 */
export class CanvasBackgroundCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly previousBackground: string | fabric.Pattern | null,
    private readonly newBackground: string | fabric.Pattern | null
  ) {
    super('canvas_background', 'Change background');
  }
  
  execute(): void {
    this.canvas.setBackgroundColor(this.newBackground, () => {
      this.canvas.renderAll();
    });
  }
  
  undo(): void {
    this.canvas.setBackgroundColor(this.previousBackground, () => {
      this.canvas.renderAll();
    });
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      previousBackground: typeof this.previousBackground === 'string' ? this.previousBackground : null,
      newBackground: typeof this.newBackground === 'string' ? this.newBackground : null,
    };
  }
}

/**
 * Command for changing canvas dimensions
 */
export class CanvasResizeCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly previousDimensions: { width: number; height: number },
    private readonly newDimensions: { width: number; height: number }
  ) {
    super('canvas_background', 'Resize canvas');
  }
  
  execute(): void {
    this.canvas.setDimensions(this.newDimensions);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.canvas.setDimensions(this.previousDimensions);
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      previousDimensions: this.previousDimensions,
      newDimensions: this.newDimensions,
    };
  }
}

/**
 * Command for canvas zoom operations
 */
export class CanvasZoomCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly previousZoom: number,
    private readonly newZoom: number,
    private readonly zoomPoint?: fabric.Point
  ) {
    super('canvas_background', 'Zoom canvas');
  }
  
  execute(): void {
    if (this.zoomPoint) {
      this.canvas.zoomToPoint(this.zoomPoint, this.newZoom);
    } else {
      this.canvas.setZoom(this.newZoom);
    }
    this.canvas.renderAll();
  }
  
  undo(): void {
    if (this.zoomPoint) {
      this.canvas.zoomToPoint(this.zoomPoint, this.previousZoom);
    } else {
      this.canvas.setZoom(this.previousZoom);
    }
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      previousZoom: this.previousZoom,
      newZoom: this.newZoom,
      zoomPoint: this.zoomPoint ? { x: this.zoomPoint.x, y: this.zoomPoint.y } : null,
    };
  }
}

/**
 * Command for canvas pan operations
 */
export class CanvasPanCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly previousViewport: fabric.Point,
    private readonly newViewport: fabric.Point
  ) {
    super('canvas_background', 'Pan canvas');
  }
  
  execute(): void {
    this.canvas.absolutePan(this.newViewport);
    this.canvas.renderAll();
  }
  
  undo(): void {
    this.canvas.absolutePan(this.previousViewport);
    this.canvas.renderAll();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      previousViewport: { x: this.previousViewport.x, y: this.previousViewport.y },
      newViewport: { x: this.newViewport.x, y: this.newViewport.y },
    };
  }
}

/**
 * Command for batch canvas state changes
 */
export class CanvasStateCommand extends BaseCommand {
  constructor(
    private readonly canvas: fabric.Canvas,
    private readonly previousState: {
      objects: any[];
      background?: string;
      dimensions?: { width: number; height: number };
      zoom?: number;
      viewport?: fabric.Point;
    },
    private readonly newState: {
      objects: any[];
      background?: string;
      dimensions?: { width: number; height: number };
      zoom?: number;
      viewport?: fabric.Point;
    }
  ) {
    super('canvas_background', 'Change canvas state');
  }
  
  async execute(): Promise<void> {
    return new Promise((resolve) => {
      // Clear current objects
      const objectsToKeep = this.canvas.getObjects().filter(obj => 
        (obj as any).evented === false
      );
      this.canvas.clear();
      objectsToKeep.forEach(obj => this.canvas.add(obj));
      
      // Apply new state
      this.applyCanvasState(this.newState, resolve);
    });
  }
  
  async undo(): Promise<void> {
    return new Promise((resolve) => {
      // Clear current objects
      const objectsToKeep = this.canvas.getObjects().filter(obj => 
        (obj as any).evented === false
      );
      this.canvas.clear();
      objectsToKeep.forEach(obj => this.canvas.add(obj));
      
      // Apply previous state
      this.applyCanvasState(this.previousState, resolve);
    });
  }
  
  private applyCanvasState(
    state: {
      objects: any[];
      background?: string;
      dimensions?: { width: number; height: number };
      zoom?: number;
      viewport?: fabric.Point;
    },
    callback: () => void
  ): void {
    // Load objects
    if (state.objects.length > 0) {
      fabric.util.enlivenObjects(state.objects, (objects: fabric.Object[]) => {
        objects.forEach(obj => {
          this.canvas.add(obj);
        });
        
        this.applyOtherCanvasSettings(state, callback);
      });
    } else {
      this.applyOtherCanvasSettings(state, callback);
    }
  }
  
  private applyOtherCanvasSettings(
    state: {
      background?: string;
      dimensions?: { width: number; height: number };
      zoom?: number;
      viewport?: fabric.Point;
    },
    callback: () => void
  ): void {
    // Apply background
    if (state.background) {
      this.canvas.setBackgroundColor(state.background, () => {
        this.canvas.renderAll();
      });
    }
    
    // Apply dimensions
    if (state.dimensions) {
      this.canvas.setDimensions(state.dimensions);
    }
    
    // Apply zoom
    if (state.zoom) {
      this.canvas.setZoom(state.zoom);
    }
    
    // Apply viewport
    if (state.viewport) {
      this.canvas.absolutePan(state.viewport);
    }
    
    this.canvas.renderAll();
    callback();
  }
  
  getSerializableData(): Record<string, any> {
    return {
      ...super.getSerializableData(),
      previousState: {
        ...this.previousState,
        viewport: this.previousState.viewport ? {
          x: this.previousState.viewport.x,
          y: this.previousState.viewport.y
        } : null,
      },
      newState: {
        ...this.newState,
        viewport: this.newState.viewport ? {
          x: this.newState.viewport.x,
          y: this.newState.viewport.y
        } : null,
      },
    };
  }
}