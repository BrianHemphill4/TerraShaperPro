import { fabric } from 'fabric';
import { MeasurementUnit, RealWorldPoint, ScaleConfiguration } from './types';
import { UnitConverter } from './UnitConverter';

export class GeometryUtils {
  /**
   * Calculate Euclidean distance between two points
   */
  static calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate total distance for a series of connected points
   */
  static calculateTotalDistance(points: { x: number; y: number }[]): number {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += this.calculateDistance(points[i], points[i + 1]);
    }
    return totalDistance;
  }

  /**
   * Calculate polygon area using the shoelace formula
   */
  static calculatePolygonArea(points: { x: number; y: number }[]): number {
    if (points.length < 3) return 0;

    let area = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    
    return Math.abs(area) / 2;
  }

  /**
   * Calculate area with holes (complex polygons)
   */
  static calculateAreaWithHoles(
    outline: { x: number; y: number }[], 
    holes: { x: number; y: number }[][]
  ): number {
    const outlineArea = this.calculatePolygonArea(outline);
    let holesArea = 0;
    
    for (const hole of holes) {
      holesArea += this.calculatePolygonArea(hole);
    }
    
    return Math.max(0, outlineArea - holesArea);
  }

  /**
   * Calculate perimeter of a polygon
   */
  static calculatePolygonPerimeter(points: { x: number; y: number }[]): number {
    if (points.length < 2) return 0;
    
    // Create a closed polygon by adding the first point at the end
    const closedPoints = [...points, points[0]];
    return this.calculateTotalDistance(closedPoints);
  }

  /**
   * Calculate angle between three points (in radians)
   */
  static calculateAngle(
    p1: { x: number; y: number }, 
    p2: { x: number; y: number }, 
    p3: { x: number; y: number }
  ): number {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  }

  /**
   * Calculate angle in degrees
   */
  static calculateAngleDegrees(
    p1: { x: number; y: number }, 
    p2: { x: number; y: number }, 
    p3: { x: number; y: number }
  ): number {
    return this.calculateAngle(p1, p2, p3) * (180 / Math.PI);
  }

  /**
   * Calculate perpendicular distance between two parallel lines
   */
  static calculateParallelDistance(line1: fabric.Line, line2: fabric.Line): number {
    // Get line vectors
    const v1 = { 
      x: (line1.x2 ?? 0) - (line1.x1 ?? 0), 
      y: (line1.y2 ?? 0) - (line1.y1 ?? 0) 
    };
    const v2 = { 
      x: (line2.x2 ?? 0) - (line2.x1 ?? 0), 
      y: (line2.y2 ?? 0) - (line2.y1 ?? 0) 
    };
    
    // Check if lines are parallel (cross product ~ 0)
    const cross = v1.x * v2.y - v1.y * v2.x;
    if (Math.abs(cross) > 0.001) {
      throw new Error('Lines are not parallel');
    }
    
    // Calculate distance from a point on line1 to line2
    const p1 = { x: line1.x1 ?? 0, y: line1.y1 ?? 0 };
    const p2 = { x: line2.x1 ?? 0, y: line2.y1 ?? 0 };
    
    // Normalize line2 direction vector
    const len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (len === 0) return this.calculateDistance(p1, p2);
    
    const n = { x: -v2.y / len, y: v2.x / len }; // Normal vector
    
    // Distance is the dot product of the vector from p2 to p1 with the normal
    const diff = { x: p1.x - p2.x, y: p1.y - p2.y };
    return Math.abs(diff.x * n.x + diff.y * n.y);
  }

  /**
   * Convert canvas coordinates to real-world coordinates
   */
  static canvasToRealWorld(
    point: { x: number; y: number }, 
    scale: ScaleConfiguration
  ): RealWorldPoint {
    // Use the appropriate scale factor
    const pixelsPerUnit = scale.units === 'metric' ? scale.pixelsPerMeter : scale.pixelsPerFoot;
    const baseUnit = scale.units === 'metric' ? MeasurementUnit.METERS : MeasurementUnit.FEET;
    
    return {
      x: point.x / pixelsPerUnit,
      y: point.y / pixelsPerUnit,
      unit: baseUnit
    };
  }

  /**
   * Convert real-world coordinates to canvas coordinates
   */
  static realWorldToCanvas(
    point: RealWorldPoint, 
    scale: ScaleConfiguration
  ): { x: number; y: number } {
    // Convert to base unit first if needed
    const baseUnit = scale.units === 'metric' ? MeasurementUnit.METERS : MeasurementUnit.FEET;
    const convertedX = UnitConverter.convert(point.x, point.unit, baseUnit);
    const convertedY = UnitConverter.convert(point.y, point.unit, baseUnit);
    
    const pixelsPerUnit = scale.units === 'metric' ? scale.pixelsPerMeter : scale.pixelsPerFoot;
    
    return {
      x: convertedX * pixelsPerUnit,
      y: convertedY * pixelsPerUnit
    };
  }

  /**
   * Calculate the center point of a polygon
   */
  static calculatePolygonCenter(points: { x: number; y: number }[]): { x: number; y: number } {
    if (points.length === 0) return { x: 0, y: 0 };
    
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  }

  /**
   * Calculate the centroid (center of mass) of a polygon
   */
  static calculatePolygonCentroid(points: { x: number; y: number }[]): { x: number; y: number } {
    if (points.length < 3) return this.calculatePolygonCenter(points);
    
    let area = 0;
    let centroidX = 0;
    let centroidY = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const crossProduct = points[i].x * points[j].y - points[j].x * points[i].y;
      area += crossProduct;
      centroidX += (points[i].x + points[j].x) * crossProduct;
      centroidY += (points[i].y + points[j].y) * crossProduct;
    }
    
    area /= 2;
    if (Math.abs(area) < 0.001) return this.calculatePolygonCenter(points);
    
    centroidX /= (6 * area);
    centroidY /= (6 * area);
    
    return { x: centroidX, y: centroidY };
  }

  /**
   * Find the closest point on a line to a given point
   */
  static closestPointOnLine(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): { x: number; y: number } {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    
    if (dx === 0 && dy === 0) {
      return lineStart; // Line is actually a point
    }
    
    const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    const clampedT = Math.max(0, Math.min(1, t)); // Clamp to line segment
    
    return {
      x: lineStart.x + clampedT * dx,
      y: lineStart.y + clampedT * dy
    };
  }

  /**
   * Check if a point is inside a polygon using ray casting
   */
  static isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
    if (polygon.length < 3) return false;
    
    let inside = false;
    const n = polygon.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Simplify a polygon using Douglas-Peucker algorithm
   */
  static simplifyPolygon(points: { x: number; y: number }[], tolerance: number): { x: number; y: number }[] {
    if (points.length <= 2) return points;
    
    return this.douglasPeucker(points, tolerance);
  }
  
  private static douglasPeucker(points: { x: number; y: number }[], tolerance: number): { x: number; y: number }[] {
    if (points.length <= 2) return points;
    
    let maxDistance = 0;
    let index = 0;
    const end = points.length - 1;
    
    for (let i = 1; i < end; i++) {
      const distance = this.perpendicularDistance(points[i], points[0], points[end]);
      if (distance > maxDistance) {
        index = i;
        maxDistance = distance;
      }
    }
    
    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, index + 1), tolerance);
      const right = this.douglasPeucker(points.slice(index), tolerance);
      
      return [...left.slice(0, -1), ...right];
    } else {
      return [points[0], points[end]];
    }
  }
  
  private static perpendicularDistance(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    
    if (dx === 0 && dy === 0) {
      return this.calculateDistance(point, lineStart);
    }
    
    const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
    const denominator = Math.sqrt(dy * dy + dx * dx);
    
    return numerator / denominator;
  }
}