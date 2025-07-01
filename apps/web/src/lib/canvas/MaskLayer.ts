import { fabric } from 'fabric';
import { CATEGORY_COLORS, type AnnotationCategory } from '@terrashaper/shared';

export interface MaskLayerOptions extends fabric.IPolygonOptions {
  category: AnnotationCategory;
  deleted?: boolean;
  createdAt?: Date;
  authorId?: string;
  maskId?: string;
}

export interface MaskLayerData {
  maskId: string;
  category: AnnotationCategory;
  deleted: boolean;
  createdAt: Date;
  authorId: string;
}

/**
 * Custom Fabric.js object for annotation masks
 * Extends fabric.Polygon with mask-specific properties and methods
 */
export class MaskLayer extends fabric.Polygon {
  public maskId: string;
  public category: AnnotationCategory;
  public deleted: boolean;
  public createdAt: Date;
  public authorId: string;

  static type = 'MaskLayer';

  constructor(points: fabric.Point[] | { x: number; y: number }[], options: MaskLayerOptions) {
    // Ensure points are in the correct format
    const fabricPoints = points.map(point => 
      point instanceof fabric.Point ? point : new fabric.Point(point.x, point.y)
    );

    // Set default styling based on category
    const categoryColor = CATEGORY_COLORS[options.category] || '#3b82f6';
    
    const defaultOptions: Partial<fabric.IPolygonOptions> = {
      fill: categoryColor + '40', // 25% opacity
      stroke: categoryColor,
      strokeWidth: 2,
      selectable: true,
      evented: true,
      opacity: options.deleted ? 0.3 : 0.7,
      strokeDashArray: options.deleted ? [5, 5] : undefined,
      hoverCursor: 'pointer',
      moveCursor: 'move',
      // Enable corner controls for resizing
      hasControls: true,
      hasBorders: true,
      // Custom corner style
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      cornerColor: categoryColor,
      cornerStrokeColor: '#ffffff',
      borderColor: categoryColor,
      borderScaleFactor: 1.5,
      // Enable rotation
      hasRotatingPoint: true,
      // Lock some properties to maintain mask integrity
      lockScalingFlip: true,
      lockUniScaling: false
    };

    super(fabricPoints, { ...defaultOptions, ...options });

    // Set mask-specific properties
    this.maskId = options.maskId || this.generateMaskId();
    this.category = options.category;
    this.deleted = options.deleted || false;
    this.createdAt = options.createdAt || new Date();
    this.authorId = options.authorId || 'current-user'; // TODO: Get from auth context

    // Set the type for serialization
    this.type = 'MaskLayer';
  }

  /**
   * Generate a unique mask ID
   */
  private generateMaskId(): string {
    return `mask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the category and refresh styling
   */
  setCategory(category: AnnotationCategory): void {
    this.category = category;
    this.updateStyling();
  }

  /**
   * Mark mask as deleted (soft delete)
   */
  markDeleted(): void {
    this.deleted = true;
    this.updateStyling();
  }

  /**
   * Restore deleted mask
   */
  restore(): void {
    this.deleted = false;
    this.updateStyling();
  }

  /**
   * Update visual styling based on current state
   */
  private updateStyling(): void {
    const categoryColor = CATEGORY_COLORS[this.category] || '#3b82f6';
    
    this.set({
      fill: categoryColor + '40',
      stroke: categoryColor,
      opacity: this.deleted ? 0.3 : 0.7,
      strokeDashArray: this.deleted ? [5, 5] : undefined,
      cornerColor: categoryColor,
      borderColor: categoryColor
    });

    if (this.canvas) {
      this.canvas.renderAll();
    }
  }

  /**
   * Get GeoJSON representation of the mask
   */
  toGeoJSON(): {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      maskId: string;
      category: AnnotationCategory;
      deleted: boolean;
      createdAt: string;
      authorId: string;
    };
  } {
    // Get the polygon points relative to the object
    const matrix = this.calcTransformMatrix();
    const points = this.points || [];
    
    // Transform points to absolute coordinates
    const transformedPoints = points.map(point => {
      const transformed = fabric.util.transformPoint(point, matrix);
      return [transformed.x, transformed.y];
    });

    // Close the polygon if not already closed
    if (transformedPoints.length > 0) {
      const firstPoint = transformedPoints[0];
      const lastPoint = transformedPoints[transformedPoints.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        transformedPoints.push([...firstPoint]);
      }
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [transformedPoints]
      },
      properties: {
        maskId: this.maskId,
        category: this.category,
        deleted: this.deleted,
        createdAt: this.createdAt.toISOString(),
        authorId: this.authorId
      }
    };
  }

  /**
   * Create MaskLayer from GeoJSON
   */
  static fromGeoJSON(
    geoJSON: {
      geometry: { type: 'Polygon'; coordinates: number[][][] };
      properties: {
        maskId: string;
        category: AnnotationCategory;
        deleted?: boolean;
        createdAt?: string;
        authorId?: string;
      };
    },
    options: Partial<MaskLayerOptions> = {}
  ): MaskLayer {
    const coordinates = geoJSON.geometry.coordinates[0];
    const points = coordinates.slice(0, -1).map(([x, y]) => ({ x, y })); // Remove last point if it closes the polygon

    return new MaskLayer(points, {
      maskId: geoJSON.properties.maskId,
      category: geoJSON.properties.category,
      deleted: geoJSON.properties.deleted || false,
      createdAt: geoJSON.properties.createdAt ? new Date(geoJSON.properties.createdAt) : new Date(),
      authorId: geoJSON.properties.authorId || 'unknown',
      ...options
    });
  }

  /**
   * Get serializable data for storage
   */
  toObject(propertiesToInclude: string[] = []): MaskLayerData & fabric.IPolygonOptions {
    const object = super.toObject([
      'maskId',
      'category', 
      'deleted',
      'createdAt',
      'authorId',
      ...propertiesToInclude
    ]);

    return {
      ...object,
      type: 'MaskLayer',
      maskId: this.maskId,
      category: this.category,
      deleted: this.deleted,
      createdAt: this.createdAt,
      authorId: this.authorId
    };
  }

  /**
   * Create MaskLayer from serialized object
   */
  static fromObject(object: any, callback: (obj: MaskLayer) => void): void {
    const points = object.points || [];
    
    const maskLayer = new MaskLayer(points, {
      maskId: object.maskId,
      category: object.category,
      deleted: object.deleted || false,
      createdAt: object.createdAt ? new Date(object.createdAt) : new Date(),
      authorId: object.authorId || 'unknown',
      ...object
    });

    callback(maskLayer);
  }

  /**
   * Calculate the area of the mask in square pixels
   */
  getArea(): number {
    if (!this.points || this.points.length < 3) return 0;

    // Use shoelace formula for polygon area
    let area = 0;
    const points = this.points;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }

    return Math.abs(area) / 2;
  }

  /**
   * Get bounding box of the mask
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
   * Check if a point is inside the mask
   */
  containsPoint(point: fabric.Point | { x: number; y: number }): boolean {
    return this.containsPoint(new fabric.Point(point.x, point.y));
  }

  /**
   * Clone the mask layer
   */
  clone(callback?: (clone: MaskLayer) => void): MaskLayer {
    const clonedPoints = this.points?.map(p => ({ x: p.x, y: p.y })) || [];
    
    const clone = new MaskLayer(clonedPoints, {
      category: this.category,
      deleted: this.deleted,
      createdAt: new Date(this.createdAt),
      authorId: this.authorId,
      ...this.toObject()
    });

    // Generate new mask ID for the clone
    clone.maskId = clone.generateMaskId();

    if (callback) {
      callback(clone);
    }

    return clone;
  }
}

// Register the custom class with Fabric.js
fabric.MaskLayer = MaskLayer;

// Extend fabric types
declare module 'fabric' {
  namespace fabric {
    class MaskLayer extends Polygon {
      constructor(points: Point[] | { x: number; y: number }[], options: MaskLayerOptions);
      static fromGeoJSON(geoJSON: any, options?: Partial<MaskLayerOptions>): MaskLayer;
      static fromObject(object: any, callback: (obj: MaskLayer) => void): void;
      
      maskId: string;
      category: AnnotationCategory;
      deleted: boolean;
      createdAt: Date;
      authorId: string;
      
      setCategory(category: AnnotationCategory): void;
      markDeleted(): void;
      restore(): void;
      toGeoJSON(): any;
      getArea(): number;
      getBoundingBox(): { left: number; top: number; width: number; height: number };
      containsPoint(point: Point | { x: number; y: number }): boolean;
      clone(callback?: (clone: MaskLayer) => void): MaskLayer;
    }
  }
}

export default MaskLayer;