import { fabric } from 'fabric';
import type { Material } from '@/stores/canvas/useMaterialStore';

export interface AreaObjectOptions extends fabric.IPolygonOptions {
  material?: Material;
  showDimensions?: boolean;
  areaId?: string;
  metadata?: {
    name?: string;
    notes?: string;
    tags?: string[];
  };
}

export interface AreaObjectData {
  areaId: string;
  material?: Material;
  showDimensions: boolean;
  metadata: {
    name?: string;
    notes?: string;
    tags?: string[];
  };
  area: number; // in square units
  perimeter: number; // in linear units
}

/**
 * Custom Fabric.js object for landscape areas
 * Extends fabric.Polygon with material properties and area calculations
 */
export class AreaObject extends fabric.Polygon {
  public areaId: string;
  public material?: Material;
  public showDimensions: boolean;
  public metadata: {
    name?: string;
    notes?: string;
    tags?: string[];
  };

  static type = 'AreaObject';

  constructor(points: fabric.Point[] | { x: number; y: number }[], options: AreaObjectOptions = {}) {
    // Ensure points are in the correct format
    const fabricPoints = points.map(point => 
      point instanceof fabric.Point ? point : new fabric.Point(point.x, point.y)
    );

    // Set default styling
    const defaultOptions: Partial<fabric.IPolygonOptions> = {
      fill: options.material ? options.material.color + '60' : '#3b82f640', // 40% opacity
      stroke: options.material ? options.material.color : '#3b82f6',
      strokeWidth: 2,
      selectable: true,
      evented: true,
      opacity: 0.8,
      hoverCursor: 'pointer',
      moveCursor: 'move',
      // Enable corner controls for resizing
      hasControls: true,
      hasBorders: true,
      // Custom corner style
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      cornerColor: options.material ? options.material.color : '#3b82f6',
      cornerStrokeColor: '#ffffff',
      borderColor: options.material ? options.material.color : '#3b82f6',
      borderScaleFactor: 1.5,
      // Enable rotation
      hasRotatingPoint: true,
      // Lock some properties to maintain area integrity
      lockScalingFlip: true,
      lockUniScaling: false
    };

    super(fabricPoints, { ...defaultOptions, ...options });

    // Set area-specific properties
    this.areaId = options.areaId || this.generateAreaId();
    this.material = options.material;
    this.showDimensions = options.showDimensions ?? true;
    this.metadata = options.metadata || {};

    // Set the type for serialization
    this.type = 'AreaObject';

    // Add dimension labels if enabled
    if (this.showDimensions) {
      this.on('modified', this.updateDimensionLabels.bind(this));
      this.on('moving', this.updateDimensionLabels.bind(this));
      this.on('scaling', this.updateDimensionLabels.bind(this));
    }
  }

  /**
   * Generate a unique area ID
   */
  private generateAreaId(): string {
    return `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the material and refresh styling
   */
  setMaterial(material: Material): void {
    this.material = material;
    this.updateStyling();
  }

  /**
   * Update visual styling based on current material
   */
  private updateStyling(): void {
    const color = this.material ? this.material.color : '#3b82f6';
    
    this.set({
      fill: color + '60', // 40% opacity
      stroke: color,
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
      (obj as any).isAreaDimension && (obj as any).areaId === this.areaId
    );
    existingLabels.forEach(label => this.canvas!.remove(label));

    // Add area label at centroid
    const centroid = this.getCentroid();
    const area = this.getArea();
    const areaText = `${area.toFixed(1)} ${this.material?.unit || 'sq ft'}`;
    
    const areaLabel = new fabric.Text(areaText, {
      left: centroid.x,
      top: centroid.y,
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fill: '#374151',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: 4,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center'
    });

    (areaLabel as any).isAreaDimension = true;
    (areaLabel as any).areaId = this.areaId;
    
    this.canvas.add(areaLabel);
  }

  /**
   * Calculate the area of the polygon in real-world units
   */
  getArea(): number {
    if (!this.points || this.points.length < 3) return 0;

    // Use shoelace formula for polygon area
    let area = 0;
    const points = this.points;
    const n = points.length;

    // Apply current transformation matrix
    const matrix = this.calcTransformMatrix();
    const transformedPoints = points.map(p => fabric.util.transformPoint(p, matrix));

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += transformedPoints[i].x * transformedPoints[j].y;
      area -= transformedPoints[j].x * transformedPoints[i].y;
    }

    return Math.abs(area) / 2;
  }

  /**
   * Calculate the perimeter of the polygon
   */
  getPerimeter(): number {
    if (!this.points || this.points.length < 2) return 0;

    let perimeter = 0;
    const points = this.points;
    const n = points.length;

    // Apply current transformation matrix
    const matrix = this.calcTransformMatrix();
    const transformedPoints = points.map(p => fabric.util.transformPoint(p, matrix));

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = transformedPoints[j].x - transformedPoints[i].x;
      const dy = transformedPoints[j].y - transformedPoints[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    return perimeter;
  }

  /**
   * Get the centroid of the polygon
   */
  getCentroid(): fabric.Point {
    if (!this.points || this.points.length === 0) {
      return new fabric.Point(this.left || 0, this.top || 0);
    }

    let cx = 0;
    let cy = 0;
    let area = 0;
    const n = this.points.length;

    // Apply current transformation matrix
    const matrix = this.calcTransformMatrix();
    const transformedPoints = this.points.map(p => fabric.util.transformPoint(p, matrix));

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const cross = transformedPoints[i].x * transformedPoints[j].y - transformedPoints[j].x * transformedPoints[i].y;
      area += cross;
      cx += (transformedPoints[i].x + transformedPoints[j].x) * cross;
      cy += (transformedPoints[i].y + transformedPoints[j].y) * cross;
    }

    area *= 0.5;
    if (area === 0) {
      // Fallback for degenerate polygons
      cx = transformedPoints.reduce((sum, p) => sum + p.x, 0) / n;
      cy = transformedPoints.reduce((sum, p) => sum + p.y, 0) / n;
    } else {
      cx /= (6 * area);
      cy /= (6 * area);
    }

    return new fabric.Point(cx, cy);
  }

  /**
   * Calculate material cost for this area
   */
  getMaterialCost(): number {
    if (!this.material) return 0;
    const area = this.getArea();
    return area * this.material.costPerUnit;
  }

  /**
   * Get bounding box of the area
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
  toObject(propertiesToInclude: string[] = []): AreaObjectData & fabric.IPolygonOptions {
    const object = super.toObject([
      'areaId',
      'material',
      'showDimensions',
      'metadata',
      ...propertiesToInclude
    ]);

    return {
      ...object,
      type: 'AreaObject',
      areaId: this.areaId,
      material: this.material,
      showDimensions: this.showDimensions,
      metadata: this.metadata,
      area: this.getArea(),
      perimeter: this.getPerimeter()
    };
  }

  /**
   * Create AreaObject from serialized object
   */
  static fromObject(object: any, callback: (obj: AreaObject) => void): void {
    const points = object.points || [];
    
    const areaObject = new AreaObject(points, {
      areaId: object.areaId,
      material: object.material,
      showDimensions: object.showDimensions ?? true,
      metadata: object.metadata || {},
      ...object
    });

    callback(areaObject);
  }

  /**
   * Clone the area object
   */
  clone(callback?: (clone: AreaObject) => void): AreaObject {
    const clonedPoints = this.points?.map(p => ({ x: p.x, y: p.y })) || [];
    
    const clone = new AreaObject(clonedPoints, {
      material: this.material,
      showDimensions: this.showDimensions,
      metadata: { ...this.metadata },
      ...this.toObject()
    });

    // Generate new area ID for the clone
    clone.areaId = clone.generateAreaId();

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
        (obj as any).isAreaDimension && (obj as any).areaId === this.areaId
      );
      dimensionLabels.forEach(label => this.canvas!.remove(label));
    }
  }
}

// Register the custom class with Fabric.js
fabric.AreaObject = AreaObject;

// Extend fabric types
declare module 'fabric' {
  namespace fabric {
    class AreaObject extends Polygon {
      constructor(points: Point[] | { x: number; y: number }[], options?: AreaObjectOptions);
      static fromObject(object: any, callback: (obj: AreaObject) => void): void;
      
      areaId: string;
      material?: Material;
      showDimensions: boolean;
      metadata: {
        name?: string;
        notes?: string;
        tags?: string[];
      };
      
      setMaterial(material: Material): void;
      getArea(): number;
      getPerimeter(): number;
      getCentroid(): Point;
      getMaterialCost(): number;
      getBoundingBox(): { left: number; top: number; width: number; height: number };
      clone(callback?: (clone: AreaObject) => void): AreaObject;
      destroy(): void;
    }
  }
}

export default AreaObject;