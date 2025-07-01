import { fabric } from 'fabric';
import { TouchGestureManager } from './touchGestureManager';

interface MobileToolConfig {
  canvas: fabric.Canvas;
  onShapeComplete?: (shape: fabric.Object) => void;
  onShapeUpdate?: (shape: fabric.Object) => void;
}

abstract class MobileTool {
  protected canvas: fabric.Canvas;
  protected isDrawing: boolean = false;
  protected startPoint: { x: number; y: number } | null = null;
  protected currentShape: fabric.Object | null = null;
  protected config: MobileToolConfig;

  constructor(config: MobileToolConfig) {
    this.canvas = config.canvas;
    this.config = config;
  }

  abstract activate(): void;
  abstract deactivate(): void;
  abstract handleTouchStart(point: { x: number; y: number }): void;
  abstract handleTouchMove(point: { x: number; y: number }): void;
  abstract handleTouchEnd(point: { x: number; y: number }): void;

  protected snapToGrid(point: { x: number; y: number }, gridSize: number = 10): { x: number; y: number } {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }

  protected getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export class MobileRectangleTool extends MobileTool {
  private preview: fabric.Rect | null = null;

  activate(): void {
    this.canvas.defaultCursor = 'crosshair';
    this.setupTouchHandlers();
  }

  deactivate(): void {
    this.canvas.defaultCursor = 'default';
    this.cleanup();
  }

  private setupTouchHandlers(): void {
    this.canvas.on('touch:gesture', this.handleGesture.bind(this));
    this.canvas.on('touch:drag', this.handleDrag.bind(this));
    this.canvas.on('touch:orientation', this.handleOrientation.bind(this));
  }

  handleTouchStart(point: { x: number; y: number }): void {
    this.isDrawing = true;
    this.startPoint = point;

    // Create preview rectangle
    this.preview = new fabric.Rect({
      left: point.x,
      top: point.y,
      width: 0,
      height: 0,
      fill: 'rgba(0, 123, 255, 0.3)',
      stroke: '#007bff',
      strokeWidth: 2,
      selectable: false,
      evented: false
    });

    this.canvas.add(this.preview);
  }

  handleTouchMove(point: { x: number; y: number }): void {
    if (!this.isDrawing || !this.startPoint || !this.preview) return;

    const width = point.x - this.startPoint.x;
    const height = point.y - this.startPoint.y;

    this.preview.set({
      width: Math.abs(width),
      height: Math.abs(height),
      left: width > 0 ? this.startPoint.x : point.x,
      top: height > 0 ? this.startPoint.y : point.y
    });

    this.canvas.renderAll();
  }

  handleTouchEnd(point: { x: number; y: number }): void {
    if (!this.isDrawing || !this.startPoint || !this.preview) return;

    this.isDrawing = false;

    const width = Math.abs(point.x - this.startPoint.x);
    const height = Math.abs(point.y - this.startPoint.y);

    // Minimum size threshold
    if (width < 20 || height < 20) {
      this.canvas.remove(this.preview);
      this.cleanup();
      return;
    }

    // Create final rectangle
    const rect = new fabric.Rect({
      left: this.preview.left,
      top: this.preview.top,
      width: width,
      height: height,
      fill: 'rgba(0, 123, 255, 0.5)',
      stroke: '#007bff',
      strokeWidth: 2,
      cornerColor: '#007bff',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 12, // Larger corners for touch
      touchCornerSize: 24 // Even larger touch area
    });

    this.canvas.remove(this.preview);
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();

    this.config.onShapeComplete?.(rect);
    this.cleanup();
  }

  private handleGesture(e: any): void {
    // Handle pinch to resize if shape is selected
    if (e.e.scale && this.canvas.getActiveObject()) {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        activeObject.scale(activeObject.scaleX! * e.e.scale);
        this.canvas.renderAll();
      }
    }
  }

  private handleDrag(e: any): void {
    // Handle drag to move if shape is selected
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && e.e.target === activeObject) {
      activeObject.left! += e.e.movementX;
      activeObject.top! += e.e.movementY;
      activeObject.setCoords();
      this.canvas.renderAll();
    }
  }

  private handleOrientation(e: any): void {
    // Handle rotation gesture if shape is selected
    if (e.e.rotation && this.canvas.getActiveObject()) {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        activeObject.rotate((activeObject.angle || 0) + e.e.rotation);
        this.canvas.renderAll();
      }
    }
  }

  private cleanup(): void {
    this.preview = null;
    this.startPoint = null;
    this.isDrawing = false;
  }
}

export class MobilePolygonTool extends MobileTool {
  private points: { x: number; y: number }[] = [];
  private preview: fabric.Polyline | null = null;
  private tempLine: fabric.Line | null = null;
  private closeThreshold: number = 30;

  activate(): void {
    this.canvas.defaultCursor = 'crosshair';
    this.setupGestureHandling();
  }

  deactivate(): void {
    this.canvas.defaultCursor = 'default';
    this.cleanup();
  }

  private setupGestureHandling(): void {
    // Double tap to finish polygon
    this.canvas.on('touch:doubleTap', this.finishPolygon.bind(this));
  }

  handleTouchStart(point: { x: number; y: number }): void {
    // Check if clicking near first point to close polygon
    if (this.points.length > 2) {
      const distance = this.getDistance(point, this.points[0]);
      if (distance < this.closeThreshold) {
        this.finishPolygon();
        return;
      }
    }

    this.points.push(point);
    this.updatePreview();
  }

  handleTouchMove(point: { x: number; y: number }): void {
    if (this.points.length === 0) return;

    // Update temporary line
    if (this.tempLine) {
      this.canvas.remove(this.tempLine);
    }

    const lastPoint = this.points[this.points.length - 1];
    this.tempLine = new fabric.Line(
      [lastPoint.x, lastPoint.y, point.x, point.y],
      {
        stroke: '#007bff',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false
      }
    );

    this.canvas.add(this.tempLine);
    this.canvas.renderAll();
  }

  handleTouchEnd(point: { x: number; y: number }): void {
    // Touch end is handled in touchStart for polygons
  }

  private updatePreview(): void {
    if (this.preview) {
      this.canvas.remove(this.preview);
    }

    if (this.points.length < 2) return;

    this.preview = new fabric.Polyline(this.points, {
      fill: 'rgba(0, 123, 255, 0.3)',
      stroke: '#007bff',
      strokeWidth: 2,
      selectable: false,
      evented: false
    });

    this.canvas.add(this.preview);
    this.canvas.sendToBack(this.preview);
    this.canvas.renderAll();
  }

  private finishPolygon(): void {
    if (this.points.length < 3) {
      this.cleanup();
      return;
    }

    const polygon = new fabric.Polygon(this.points, {
      fill: 'rgba(0, 123, 255, 0.5)',
      stroke: '#007bff',
      strokeWidth: 2,
      cornerColor: '#007bff',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 12,
      touchCornerSize: 24
    });

    this.canvas.add(polygon);
    this.canvas.setActiveObject(polygon);
    this.canvas.renderAll();

    this.config.onShapeComplete?.(polygon);
    this.cleanup();
  }

  private cleanup(): void {
    if (this.preview) {
      this.canvas.remove(this.preview);
    }
    if (this.tempLine) {
      this.canvas.remove(this.tempLine);
    }
    
    this.points = [];
    this.preview = null;
    this.tempLine = null;
  }
}

export class MobileBrushTool extends MobileTool {
  private isDrawing: boolean = false;
  private brushPoints: { x: number; y: number }[] = [];
  private currentPath: fabric.Path | null = null;

  activate(): void {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 5;
    this.canvas.freeDrawingBrush.color = '#007bff';
    
    // Setup smooth brush for touch
    if (this.canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
      this.canvas.freeDrawingBrush.decimate = 2; // Simplify path
    }
  }

  deactivate(): void {
    this.canvas.isDrawingMode = false;
  }

  handleTouchStart(point: { x: number; y: number }): void {
    this.isDrawing = true;
    this.brushPoints = [point];
  }

  handleTouchMove(point: { x: number; y: number }): void {
    if (!this.isDrawing) return;
    
    // Add smoothing for touch input
    const lastPoint = this.brushPoints[this.brushPoints.length - 1];
    const distance = this.getDistance(lastPoint, point);
    
    // Only add point if moved enough (reduces jitter)
    if (distance > 2) {
      this.brushPoints.push(point);
    }
  }

  handleTouchEnd(point: { x: number; y: number }): void {
    this.isDrawing = false;
    
    // Canvas handles the path creation in drawing mode
    this.brushPoints = [];
  }
}

export class MobileTextTool extends MobileTool {
  private textbox: fabric.IText | null = null;

  activate(): void {
    this.canvas.defaultCursor = 'text';
  }

  deactivate(): void {
    this.canvas.defaultCursor = 'default';
    if (this.textbox && this.textbox.text === '') {
      this.canvas.remove(this.textbox);
    }
  }

  handleTouchStart(point: { x: number; y: number }): void {
    // Check if tapping on existing text
    const target = this.canvas.findTarget(new MouseEvent('click', {
      clientX: point.x,
      clientY: point.y
    }) as any, false);

    if (target && target instanceof fabric.IText) {
      this.canvas.setActiveObject(target);
      target.enterEditing();
      return;
    }

    // Create new text
    this.textbox = new fabric.IText('Tap to edit', {
      left: point.x,
      top: point.y,
      fontSize: 20,
      fill: '#007bff',
      fontFamily: 'Arial',
      cornerColor: '#007bff',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 12,
      touchCornerSize: 24
    });

    this.canvas.add(this.textbox);
    this.canvas.setActiveObject(this.textbox);
    this.textbox.enterEditing();
    this.textbox.selectAll();
    this.canvas.renderAll();

    this.config.onShapeComplete?.(this.textbox);
  }

  handleTouchMove(point: { x: number; y: number }): void {
    // Text tool doesn't use touch move
  }

  handleTouchEnd(point: { x: number; y: number }): void {
    // Text tool doesn't use touch end
  }
}

// Tool Manager for mobile
export class MobileToolManager {
  private canvas: fabric.Canvas;
  private currentTool: MobileTool | null = null;
  private tools: Map<string, MobileTool> = new Map();
  private gestureManager: TouchGestureManager;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.gestureManager = new TouchGestureManager(canvas, {
      onTap: this.handleTap.bind(this),
      onDoubleTap: this.handleDoubleTap.bind(this),
      onLongPress: this.handleLongPress.bind(this),
      onPinchZoom: this.handlePinchZoom.bind(this),
      onTwoFingerPan: this.handleTwoFingerPan.bind(this)
    });

    this.initializeTools();
  }

  private initializeTools(): void {
    const config = {
      canvas: this.canvas,
      onShapeComplete: (shape: fabric.Object) => {
        // Handle shape completion
      }
    };

    this.tools.set('rectangle', new MobileRectangleTool(config));
    this.tools.set('polygon', new MobilePolygonTool(config));
    this.tools.set('brush', new MobileBrushTool(config));
    this.tools.set('text', new MobileTextTool(config));
  }

  setTool(toolName: string): void {
    // Deactivate current tool
    if (this.currentTool) {
      this.currentTool.deactivate();
    }

    // Activate new tool
    const tool = this.tools.get(toolName);
    if (tool) {
      this.currentTool = tool;
      tool.activate();
    } else {
      this.currentTool = null;
      this.canvas.defaultCursor = 'default';
    }
  }

  private handleTap(point: { x: number; y: number }): void {
    if (this.currentTool) {
      this.currentTool.handleTouchStart(point);
      this.currentTool.handleTouchEnd(point);
    }
  }

  private handleDoubleTap(point: { x: number; y: number }): void {
    // Quick shape completion or edit mode
    const target = this.canvas.findTarget(new MouseEvent('click', {
      clientX: point.x,
      clientY: point.y
    }) as any, false);

    if (target && target instanceof fabric.IText) {
      target.enterEditing();
    }
  }

  private handleLongPress(point: { x: number; y: number }): void {
    // Context menu or shape properties
    const target = this.canvas.findTarget(new MouseEvent('click', {
      clientX: point.x,
      clientY: point.y
    }) as any, false);

    if (target) {
      // Show context menu
      this.showContextMenu(target, point);
    }
  }

  private handlePinchZoom(scale: number, center: { x: number; y: number }): void {
    const zoom = this.canvas.getZoom() * scale;
    this.canvas.zoomToPoint(new fabric.Point(center.x, center.y), zoom);
  }

  private handleTwoFingerPan(delta: { x: number; y: number }): void {
    const vpt = this.canvas.viewportTransform!;
    vpt[4] += delta.x;
    vpt[5] += delta.y;
    this.canvas.setViewportTransform(vpt);
    this.canvas.renderAll();
  }

  private showContextMenu(target: fabric.Object, point: { x: number; y: number }): void {
    // Implement context menu for mobile
    console.log('Show context menu for', target, 'at', point);
  }

  destroy(): void {
    this.currentTool?.deactivate();
    this.gestureManager.destroy();
  }
}