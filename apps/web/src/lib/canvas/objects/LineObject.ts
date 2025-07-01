import { fabric } from 'fabric';
import type { Material } from '@/stores/canvas/useMaterialStore';

export interface LineObjectOptions extends fabric.ILineOptions {
  material?: Material;
  showDimensions?: boolean;
  lineId?: string;
  lineType?: 'edge' | 'border' | 'path' | 'utility';
  metadata?: {
    name?: string;
    notes?: string;
    tags?: string[];
  };
}

export interface LineObjectData {
  lineId: string;
  material?: Material;
  showDimensions: boolean;
  lineType: 'edge' | 'border' | 'path' | 'utility';
  metadata: {
    name?: string;
    notes?: string;
    tags?: string[];
  };
  length: number; // in linear units
  angle: number; // in degrees
}

/**
 * Custom Fabric.js object for landscape lines (edging, borders, paths)
 * Extends fabric.Line with material properties and measurement calculations
 */
export class LineObject extends fabric.Line {
  public lineId: string;
  public material?: Material;
  public showDimensions: boolean;
  public lineType: 'edge' | 'border' | 'path' | 'utility';
  public metadata: {
    name?: string;
    notes?: string;
    tags?: string[];
  };

  static type = 'LineObject';

  constructor(points: number[], options: LineObjectOptions = {}) {
    // Set default styling based on line type
    const defaultOptions: Partial<fabric.ILineOptions> = {
      stroke: options.material ? options.material.color : LineObject.getDefaultColor(options.lineType),
      strokeWidth: LineObject.getDefaultStrokeWidth(options.lineType),
      fill: '',
      selectable: true,
      evented: true,
      hoverCursor: 'pointer',
      moveCursor: 'move',
      // Enable corner controls for resizing
      hasControls: true,
      hasBorders: true,
      // Custom corner style
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      cornerColor: options.material ? options.material.color : LineObject.getDefaultColor(options.lineType),
      cornerStrokeColor: '#ffffff',
      borderColor: options.material ? options.material.color : LineObject.getDefaultColor(options.lineType),
      borderScaleFactor: 1.5,
      // Enable rotation
      hasRotatingPoint: true,
      // Line-specific styling
      strokeDashArray: LineObject.getDefaultDashArray(options.lineType)
    };

    super(points, { ...defaultOptions, ...options });

    // Set line-specific properties
    this.lineId = options.lineId || this.generateLineId();
    this.material = options.material;
    this.showDimensions = options.showDimensions ?? true;
    this.lineType = options.lineType || 'edge';
    this.metadata = options.metadata || {};

    // Set the type for serialization
    this.type = 'LineObject';

    // Add dimension labels if enabled
    if (this.showDimensions) {
      this.on('modified', this.updateDimensionLabels.bind(this));
      this.on('moving', this.updateDimensionLabels.bind(this));
      this.on('scaling', this.updateDimensionLabels.bind(this));
    }
  }

  /**
   * Get default color based on line type
   */
  static getDefaultColor(lineType?: 'edge' | 'border' | 'path' | 'utility'): string {
    switch (lineType) {
      case 'edge': return '#8B4513'; // Brown for edging
      case 'border': return '#228B22'; // Green for borders
      case 'path': return '#696969'; // Gray for paths
      case 'utility': return '#FF6347'; // Red for utilities
      default: return '#3b82f6'; // Blue default
    }
  }

  /**
   * Get default stroke width based on line type
   */
  static getDefaultStrokeWidth(lineType?: 'edge' | 'border' | 'path' | 'utility'): number {
    switch (lineType) {
      case 'edge': return 3;
      case 'border': return 2;
      case 'path': return 4;
      case 'utility': return 2;
      default: return 2;
    }
  }

  /**
   * Get default dash array based on line type
   */
  static getDefaultDashArray(lineType?: 'edge' | 'border' | 'path' | 'utility'): number[] | undefined {
    switch (lineType) {
      case 'edge': return undefined; // Solid line
      case 'border': return undefined; // Solid line
      case 'path': return undefined; // Solid line
      case 'utility': return [5, 5]; // Dashed line
      default: return undefined;
    }
  }

  /**
   * Generate a unique line ID
   */
  private generateLineId(): string {
    return `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the material and refresh styling
   */
  setMaterial(material: Material): void {
    this.material = material;
    this.updateStyling();
  }

  /**
   * Update line type and refresh styling
   */
  setLineType(lineType: 'edge' | 'border' | 'path' | 'utility'): void {
    this.lineType = lineType;
    this.updateStyling();
  }

  /**
   * Update visual styling based on current material and line type
   */
  private updateStyling(): void {
    const color = this.material ? this.material.color : LineObject.getDefaultColor(this.lineType);
    const strokeWidth = LineObject.getDefaultStrokeWidth(this.lineType);
    const strokeDashArray = LineObject.getDefaultDashArray(this.lineType);
    
    this.set({
      stroke: color,
      strokeWidth: strokeWidth,
      strokeDashArray: strokeDashArray,
      cornerColor: color,
      borderColor: color
    });

    if (this.canvas) {
      this.canvas.renderAll();
    }
  }

  /**
   * Update dimension labels (if enabled)
   */
  private updateDimensionLabels(): void {
    if (!this.showDimensions || !this.canvas) return;

    // Remove existing dimension labels
    const existingLabels = this.canvas.getObjects().filter(obj => 
      (obj as any).isLineDimension && (obj as any).lineId === this.lineId
    );
    existingLabels.forEach(label => this.canvas!.remove(label));

    // Add length label at midpoint
    const midpoint = this.getMidpoint();
    const length = this.getLength();
    const angle = this.getAngle();
    const lengthText = `${length.toFixed(1)} ${this.material?.unit || 'ft'}`;
    
    const lengthLabel = new fabric.Text(lengthText, {
      left: midpoint.x,
      top: midpoint.y - 10,
      fontSize: 10,
      fontFamily: 'Inter, sans-serif',
      fill: '#374151',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: 2,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
      angle: Math.abs(angle) > 90 ? angle + 180 : angle // Keep text readable
    });

    (lengthLabel as any).isLineDimension = true;
    (lengthLabel as any).lineId = this.lineId;
    
    this.canvas.add(lengthLabel);
  }

  /**
   * Calculate the length of the line
   */
  getLength(): number {
    const x1 = this.x1 || 0;
    const y1 = this.y1 || 0;
    const x2 = this.x2 || 0;
    const y2 = this.y2 || 0;

    // Apply scaling from current transformation
    const scaleX = this.scaleX || 1;
    const scaleY = this.scaleY || 1;

    const dx = (x2 - x1) * scaleX;
    const dy = (y2 - y1) * scaleY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate the angle of the line in degrees
   */
  getAngle(): number {
    const x1 = this.x1 || 0;
    const y1 = this.y1 || 0;
    const x2 = this.x2 || 0;
    const y2 = this.y2 || 0;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const radians = Math.atan2(dy, dx);
    const degrees = radians * (180 / Math.PI);

    // Add object rotation if any
    const objectAngle = this.angle || 0;
    return degrees + objectAngle;
  }

  /**
   * Get the midpoint of the line
   */
  getMidpoint(): fabric.Point {
    const x1 = this.x1 || 0;
    const y1 = this.y1 || 0;
    const x2 = this.x2 || 0;
    const y2 = this.y2 || 0;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Transform to absolute coordinates
    const center = this.getCenterPoint();
    return new fabric.Point(center.x + midX, center.y + midY);
  }

  /**
   * Get start point in absolute coordinates
   */
  getStartPoint(): fabric.Point {
    const x1 = this.x1 || 0;
    const y1 = this.y1 || 0;
    const center = this.getCenterPoint();
    return new fabric.Point(center.x + x1, center.y + y1);
  }

  /**
   * Get end point in absolute coordinates
   */
  getEndPoint(): fabric.Point {
    const x2 = this.x2 || 0;
    const y2 = this.y2 || 0;
    const center = this.getCenterPoint();
    return new fabric.Point(center.x + x2, center.y + y2);
  }

  /**
   * Calculate material cost for this line
   */
  getMaterialCost(): number {
    if (!this.material) return 0;
    const length = this.getLength();
    return length * this.material.costPerUnit;
  }

  /**
   * Check if line intersects with another line
   */
  intersectsWithLine(other: LineObject): fabric.Point | null {
    const p1 = this.getStartPoint();
    const p2 = this.getEndPoint();
    const p3 = other.getStartPoint();
    const p4 = other.getEndPoint();

    const denominator = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    
    if (Math.abs(denominator) < 1e-10) {
      return null; // Lines are parallel
    }

    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denominator;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return new fabric.Point(
        p1.x + t * (p2.x - p1.x),
        p1.y + t * (p2.y - p1.y)
      );
    }

    return null;
  }

  /**
   * Get bounding box of the line
   */
  getBoundingBox(): { 
    left: number; 
    top: number; 
    width: number; 
    height: number; 
  } {
    const boundingRect = this.getBoundingRect();
    return {
      left: boundingRect.left,
      top: boundingRect.top,
      width: boundingRect.width,
      height: boundingRect.height
    };
  }

  /**
   * Get serializable data for storage
   */
  toObject(propertiesToInclude: string[] = []): LineObjectData & fabric.ILineOptions {
    const object = super.toObject([
      'lineId',
      'material',
      'showDimensions',
      'lineType',
      'metadata',
      ...propertiesToInclude
    ]);

    return {
      ...object,
      type: 'LineObject',
      lineId: this.lineId,
      material: this.material,
      showDimensions: this.showDimensions,
      lineType: this.lineType,
      metadata: this.metadata,
      length: this.getLength(),
      angle: this.getAngle()
    };
  }

  /**
   * Create LineObject from serialized object
   */
  static fromObject(object: any, callback: (obj: LineObject) => void): void {
    const points = [object.x1 || 0, object.y1 || 0, object.x2 || 0, object.y2 || 0];
    
    const lineObject = new LineObject(points, {
      lineId: object.lineId,
      material: object.material,
      showDimensions: object.showDimensions ?? true,
      lineType: object.lineType || 'edge',
      metadata: object.metadata || {},
      ...object
    });

    callback(lineObject);
  }

  /**
   * Clone the line object
   */
  clone(callback?: (clone: LineObject) => void): LineObject {
    const points = [this.x1 || 0, this.y1 || 0, this.x2 || 0, this.y2 || 0];
    
    const clone = new LineObject(points, {
      material: this.material,
      showDimensions: this.showDimensions,
      lineType: this.lineType,
      metadata: { ...this.metadata },
      ...this.toObject()
    });

    // Generate new line ID for the clone
    clone.lineId = clone.generateLineId();

    if (callback) {
      callback(clone);
    }

    return clone;
  }

  /**
   * Cleanup method to remove dimension labels
   */
  destroy(): void {
    if (this.canvas) {
      // Remove associated dimension labels
      const dimensionLabels = this.canvas.getObjects().filter(obj => 
        (obj as any).isLineDimension && (obj as any).lineId === this.lineId
      );
      dimensionLabels.forEach(label => this.canvas!.remove(label));
    }
  }
}

// Register the custom class with Fabric.js
fabric.LineObject = LineObject;

// Extend fabric types
declare module 'fabric' {
  namespace fabric {
    class LineObject extends Line {
      constructor(points: number[], options?: LineObjectOptions);
      static fromObject(object: any, callback: (obj: LineObject) => void): void;
      
      lineId: string;
      material?: Material;
      showDimensions: boolean;
      lineType: 'edge' | 'border' | 'path' | 'utility';
      metadata: {
        name?: string;
        notes?: string;
        tags?: string[];
      };
      
      setMaterial(material: Material): void;
      setLineType(lineType: 'edge' | 'border' | 'path' | 'utility'): void;
      getLength(): number;
      getAngle(): number;
      getMidpoint(): Point;
      getStartPoint(): Point;
      getEndPoint(): Point;
      getMaterialCost(): number;
      intersectsWithLine(other: LineObject): Point | null;
      getBoundingBox(): { left: number; top: number; width: number; height: number };
      clone(callback?: (clone: LineObject) => void): LineObject;
      destroy(): void;
    }
  }
}

export default LineObject;