import { fabric } from 'fabric';
import { SnapSettings } from './types';
import { GeometryUtils } from './GeometryCalculations';

interface SnapResult {
  point: { x: number; y: number };
  snapType: 'none' | 'grid' | 'endpoint' | 'midpoint' | 'intersection' | 'object';
  snapObject?: fabric.Object;
  distance: number;
}

export class SnapManager {
  private canvas: fabric.Canvas;
  private settings: SnapSettings;
  private gridSize: number;

  constructor(canvas: fabric.Canvas, settings: SnapSettings, gridSize: number = 20) {
    this.canvas = canvas;
    this.settings = settings;
    this.gridSize = gridSize;
  }

  /**
   * Find the best snap point for a given coordinate
   */
  findSnapPoint(point: { x: number; y: number }): SnapResult {
    if (!this.settings.enabled) {
      return {
        point,
        snapType: 'none',
        distance: 0
      };
    }

    const candidates: SnapResult[] = [];

    // Grid snapping
    if (this.settings.snapToGrid) {
      const gridSnap = this.snapToGrid(point);
      if (gridSnap.distance <= this.settings.threshold) {
        candidates.push(gridSnap);
      }
    }

    // Object snapping
    if (this.settings.snapToObjects || this.settings.snapToEndpoints || this.settings.snapToMidpoints) {
      const objectSnaps = this.snapToObjects(point);
      candidates.push(...objectSnaps.filter(snap => snap.distance <= this.settings.threshold));
    }

    // Intersection snapping
    if (this.settings.snapToIntersections) {
      const intersectionSnaps = this.snapToIntersections(point);
      candidates.push(...intersectionSnaps.filter(snap => snap.distance <= this.settings.threshold));
    }

    // Return the closest snap point, or original point if no snapping
    if (candidates.length === 0) {
      return {
        point,
        snapType: 'none',
        distance: 0
      };
    }

    return candidates.reduce((closest, current) => 
      current.distance < closest.distance ? current : closest
    );
  }

  /**
   * Snap to grid points
   */
  private snapToGrid(point: { x: number; y: number }): SnapResult {
    const gridX = Math.round(point.x / this.gridSize) * this.gridSize;
    const gridY = Math.round(point.y / this.gridSize) * this.gridSize;
    const gridPoint = { x: gridX, y: gridY };
    
    return {
      point: gridPoint,
      snapType: 'grid',
      distance: GeometryUtils.calculateDistance(point, gridPoint)
    };
  }

  /**
   * Snap to object features (endpoints, midpoints, edges)
   */
  private snapToObjects(point: { x: number; y: number }): SnapResult[] {
    const results: SnapResult[] = [];
    const objects = this.canvas.getObjects();

    for (const obj of objects) {
      // Skip measurement objects and non-geometric objects
      if ((obj as any).isMeasurement || !this.isGeometricObject(obj)) {
        continue;
      }

      // Endpoint snapping
      if (this.settings.snapToEndpoints) {
        const endpoints = this.getObjectEndpoints(obj);
        for (const endpoint of endpoints) {
          const distance = GeometryUtils.calculateDistance(point, endpoint);
          if (distance <= this.settings.threshold) {
            results.push({
              point: endpoint,
              snapType: 'endpoint',
              snapObject: obj,
              distance
            });
          }
        }
      }

      // Midpoint snapping
      if (this.settings.snapToMidpoints) {
        const midpoints = this.getObjectMidpoints(obj);
        for (const midpoint of midpoints) {
          const distance = GeometryUtils.calculateDistance(point, midpoint);
          if (distance <= this.settings.threshold) {
            results.push({
              point: midpoint,
              snapType: 'midpoint',
              snapObject: obj,
              distance
            });
          }
        }
      }

      // Object edge snapping
      if (this.settings.snapToObjects) {
        const edgePoint = this.getClosestPointOnObject(obj, point);
        if (edgePoint) {
          const distance = GeometryUtils.calculateDistance(point, edgePoint);
          if (distance <= this.settings.threshold) {
            results.push({
              point: edgePoint,
              snapType: 'object',
              snapObject: obj,
              distance
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Snap to line intersections
   */
  private snapToIntersections(point: { x: number; y: number }): SnapResult[] {
    const results: SnapResult[] = [];
    const lines = this.canvas.getObjects().filter(obj => 
      obj instanceof fabric.Line && !(obj as any).isMeasurement
    ) as fabric.Line[];

    // Find all line intersections
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const intersection = this.getLineIntersection(lines[i], lines[j]);
        if (intersection) {
          const distance = GeometryUtils.calculateDistance(point, intersection);
          if (distance <= this.settings.threshold) {
            results.push({
              point: intersection,
              snapType: 'intersection',
              distance
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Check if an object is geometric and supports snapping
   */
  private isGeometricObject(obj: fabric.Object): boolean {
    return obj instanceof fabric.Line ||
           obj instanceof fabric.Rect ||
           obj instanceof fabric.Circle ||
           obj instanceof fabric.Ellipse ||
           obj instanceof fabric.Polygon ||
           obj instanceof fabric.Polyline ||
           obj instanceof fabric.Path;
  }

  /**
   * Get endpoint coordinates for an object
   */
  private getObjectEndpoints(obj: fabric.Object): { x: number; y: number }[] {
    const endpoints: { x: number; y: number }[] = [];

    if (obj instanceof fabric.Line) {
      endpoints.push(
        { x: obj.x1 || 0, y: obj.y1 || 0 },
        { x: obj.x2 || 0, y: obj.y2 || 0 }
      );
    } else if (obj instanceof fabric.Polyline || obj instanceof fabric.Polygon) {
      const points = (obj as any).points || [];
      endpoints.push(...points.map((p: any) => ({ x: p.x, y: p.y })));
    } else if (obj instanceof fabric.Rect) {
      const bounds = obj.getBoundingRect();
      endpoints.push(
        { x: bounds.left, y: bounds.top },
        { x: bounds.left + bounds.width, y: bounds.top },
        { x: bounds.left + bounds.width, y: bounds.top + bounds.height },
        { x: bounds.left, y: bounds.top + bounds.height }
      );
    } else if (obj instanceof fabric.Circle || obj instanceof fabric.Ellipse) {
      const center = obj.getCenterPoint();
      const radius = (obj as any).radius || 0;
      endpoints.push(
        { x: center.x - radius, y: center.y },
        { x: center.x + radius, y: center.y },
        { x: center.x, y: center.y - radius },
        { x: center.x, y: center.y + radius }
      );
    }

    return endpoints;
  }

  /**
   * Get midpoint coordinates for an object
   */
  private getObjectMidpoints(obj: fabric.Object): { x: number; y: number }[] {
    const midpoints: { x: number; y: number }[] = [];

    if (obj instanceof fabric.Line) {
      const x1 = obj.x1 || 0;
      const y1 = obj.y1 || 0;
      const x2 = obj.x2 || 0;
      const y2 = obj.y2 || 0;
      midpoints.push({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
    } else if (obj instanceof fabric.Rect) {
      const bounds = obj.getBoundingRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      midpoints.push(
        { x: centerX, y: bounds.top },                    // Top midpoint
        { x: bounds.left + bounds.width, y: centerY },    // Right midpoint
        { x: centerX, y: bounds.top + bounds.height },    // Bottom midpoint
        { x: bounds.left, y: centerY }                    // Left midpoint
      );
    } else if (obj instanceof fabric.Circle || obj instanceof fabric.Ellipse) {
      midpoints.push(obj.getCenterPoint());
    }

    return midpoints;
  }

  /**
   * Get the closest point on an object to a given point
   */
  private getClosestPointOnObject(obj: fabric.Object, point: { x: number; y: number }): { x: number; y: number } | null {
    if (obj instanceof fabric.Line) {
      const x1 = obj.x1 || 0;
      const y1 = obj.y1 || 0;
      const x2 = obj.x2 || 0;
      const y2 = obj.y2 || 0;
      return GeometryUtils.closestPointOnLine(point, { x: x1, y: y1 }, { x: x2, y: y2 });
    }

    // For other objects, return the closest endpoint for simplicity
    const endpoints = this.getObjectEndpoints(obj);
    if (endpoints.length === 0) return null;

    return endpoints.reduce((closest, endpoint) => {
      const distanceToEndpoint = GeometryUtils.calculateDistance(point, endpoint);
      const distanceToClosest = GeometryUtils.calculateDistance(point, closest);
      return distanceToEndpoint < distanceToClosest ? endpoint : closest;
    });
  }

  /**
   * Calculate intersection point between two lines
   */
  private getLineIntersection(line1: fabric.Line, line2: fabric.Line): { x: number; y: number } | null {
    const x1 = line1.x1 || 0;
    const y1 = line1.y1 || 0;
    const x2 = line1.x2 || 0;
    const y2 = line1.y2 || 0;
    
    const x3 = line2.x1 || 0;
    const y3 = line2.y1 || 0;
    const x4 = line2.x2 || 0;
    const y4 = line2.y2 || 0;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    // Lines are parallel
    if (Math.abs(denominator) < 0.0001) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    // Check if intersection is within both line segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }

    return null;
  }

  /**
   * Update snap settings
   */
  updateSettings(settings: Partial<SnapSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Update grid size
   */
  updateGridSize(gridSize: number): void {
    this.gridSize = gridSize;
  }

  /**
   * Get current settings
   */
  getSettings(): SnapSettings {
    return { ...this.settings };
  }

  /**
   * Toggle snap functionality
   */
  toggle(enabled?: boolean): void {
    this.settings.enabled = enabled !== undefined ? enabled : !this.settings.enabled;
  }
}