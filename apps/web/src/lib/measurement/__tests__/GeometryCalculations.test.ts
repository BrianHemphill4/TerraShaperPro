import { GeometryUtils } from '../GeometryCalculations';

describe('GeometryUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(GeometryUtils.calculateDistance(p1, p2)).toBe(5);
    });

    it('should handle same point distance', () => {
      const p1 = { x: 1, y: 1 };
      const p2 = { x: 1, y: 1 };
      expect(GeometryUtils.calculateDistance(p1, p2)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const p1 = { x: -2, y: -1 };
      const p2 = { x: 1, y: 3 };
      expect(GeometryUtils.calculateDistance(p1, p2)).toBe(5);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate total distance for multiple points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 4 },
        { x: 0, y: 4 }
      ];
      expect(GeometryUtils.calculateTotalDistance(points)).toBe(10);
    });

    it('should return 0 for single point', () => {
      const points = [{ x: 1, y: 1 }];
      expect(GeometryUtils.calculateTotalDistance(points)).toBe(0);
    });

    it('should handle empty array', () => {
      expect(GeometryUtils.calculateTotalDistance([])).toBe(0);
    });
  });

  describe('calculatePolygonArea', () => {
    it('should calculate area of a rectangle', () => {
      const rectangle = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 }
      ];
      expect(GeometryUtils.calculatePolygonArea(rectangle)).toBe(12);
    });

    it('should calculate area of a triangle', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 3 }
      ];
      expect(GeometryUtils.calculatePolygonArea(triangle)).toBe(6);
    });

    it('should return 0 for insufficient points', () => {
      const twoPoints = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
      expect(GeometryUtils.calculatePolygonArea(twoPoints)).toBe(0);
    });

    it('should handle clockwise and counter-clockwise polygons', () => {
      const clockwise = [
        { x: 0, y: 0 },
        { x: 0, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 0 }
      ];
      const counterClockwise = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 }
      ];
      
      const area1 = GeometryUtils.calculatePolygonArea(clockwise);
      const area2 = GeometryUtils.calculatePolygonArea(counterClockwise);
      
      expect(area1).toBe(area2);
      expect(area1).toBe(4);
    });
  });

  describe('calculateAreaWithHoles', () => {
    it('should calculate area with holes correctly', () => {
      const outline = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]; // 100 unit square
      
      const holes = [
        [
          { x: 2, y: 2 },
          { x: 4, y: 2 },
          { x: 4, y: 4 },
          { x: 2, y: 4 }
        ] // 4 unit square hole
      ];
      
      expect(GeometryUtils.calculateAreaWithHoles(outline, holes)).toBe(96);
    });

    it('should handle multiple holes', () => {
      const outline = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]; // 100 unit square
      
      const holes = [
        [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 3, y: 3 },
          { x: 1, y: 3 }
        ], // 4 unit hole
        [
          { x: 6, y: 6 },
          { x: 8, y: 6 },
          { x: 8, y: 8 },
          { x: 6, y: 8 }
        ] // 4 unit hole
      ];
      
      expect(GeometryUtils.calculateAreaWithHoles(outline, holes)).toBe(92);
    });

    it('should not return negative area', () => {
      const outline = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 }
      ]; // 4 unit square
      
      const holes = [
        [
          { x: -1, y: -1 },
          { x: 3, y: -1 },
          { x: 3, y: 3 },
          { x: -1, y: 3 }
        ] // 16 unit hole (larger than outline)
      ];
      
      expect(GeometryUtils.calculateAreaWithHoles(outline, holes)).toBe(0);
    });
  });

  describe('calculateAngle', () => {
    it('should calculate angle in radians correctly', () => {
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 0 }; // vertex
      const p3 = { x: 0, y: 1 };
      
      const angle = GeometryUtils.calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(Math.PI / 2, 5); // 90 degrees
    });

    it('should handle straight line (180 degrees)', () => {
      const p1 = { x: -1, y: 0 };
      const p2 = { x: 0, y: 0 };
      const p3 = { x: 1, y: 0 };
      
      const angle = GeometryUtils.calculateAngle(p1, p2, p3);
      expect(angle).toBeCloseTo(Math.PI, 5); // 180 degrees
    });
  });

  describe('calculateAngleDegrees', () => {
    it('should convert radians to degrees correctly', () => {
      const p1 = { x: 1, y: 0 };
      const p2 = { x: 0, y: 0 };
      const p3 = { x: 0, y: 1 };
      
      const degrees = GeometryUtils.calculateAngleDegrees(p1, p2, p3);
      expect(degrees).toBeCloseTo(90, 2);
    });
  });

  describe('calculatePolygonCenter', () => {
    it('should calculate centroid of a triangle', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 3, y: 6 }
      ];
      
      const center = GeometryUtils.calculatePolygonCenter(triangle);
      expect(center.x).toBe(3);
      expect(center.y).toBe(2);
    });

    it('should handle empty array', () => {
      const center = GeometryUtils.calculatePolygonCenter([]);
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);
    });
  });

  describe('calculatePolygonCentroid', () => {
    it('should calculate true centroid for complex polygons', () => {
      const square = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 }
      ];
      
      const centroid = GeometryUtils.calculatePolygonCentroid(square);
      expect(centroid.x).toBeCloseTo(1, 2);
      expect(centroid.y).toBeCloseTo(1, 2);
    });

    it('should fallback to center for degenerate polygons', () => {
      const line = [{ x: 0, y: 0 }, { x: 2, y: 0 }];
      const centroid = GeometryUtils.calculatePolygonCentroid(line);
      expect(centroid.x).toBe(1);
      expect(centroid.y).toBe(0);
    });
  });

  describe('closestPointOnLine', () => {
    it('should find closest point on line segment', () => {
      const point = { x: 2, y: 2 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 4, y: 0 };
      
      const closest = GeometryUtils.closestPointOnLine(point, lineStart, lineEnd);
      expect(closest.x).toBe(2);
      expect(closest.y).toBe(0);
    });

    it('should clamp to line segment endpoints', () => {
      const point = { x: -1, y: 1 };
      const lineStart = { x: 0, y: 0 };
      const lineEnd = { x: 2, y: 0 };
      
      const closest = GeometryUtils.closestPointOnLine(point, lineStart, lineEnd);
      expect(closest.x).toBe(0);
      expect(closest.y).toBe(0);
    });

    it('should handle point-line (zero length)', () => {
      const point = { x: 2, y: 2 };
      const lineStart = { x: 1, y: 1 };
      const lineEnd = { x: 1, y: 1 };
      
      const closest = GeometryUtils.closestPointOnLine(point, lineStart, lineEnd);
      expect(closest.x).toBe(1);
      expect(closest.y).toBe(1);
    });
  });

  describe('isPointInPolygon', () => {
    it('should detect point inside polygon', () => {
      const polygon = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 0, y: 4 }
      ];
      
      expect(GeometryUtils.isPointInPolygon({ x: 2, y: 2 }, polygon)).toBe(true);
      expect(GeometryUtils.isPointInPolygon({ x: 5, y: 2 }, polygon)).toBe(false);
      expect(GeometryUtils.isPointInPolygon({ x: 0, y: 0 }, polygon)).toBe(false); // on edge
    });

    it('should handle complex polygons', () => {
      const triangle = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 3 }
      ];
      
      expect(GeometryUtils.isPointInPolygon({ x: 2, y: 1 }, triangle)).toBe(true);
      expect(GeometryUtils.isPointInPolygon({ x: 1, y: 2 }, triangle)).toBe(false);
    });

    it('should return false for degenerate polygons', () => {
      const line = [{ x: 0, y: 0 }, { x: 2, y: 0 }];
      expect(GeometryUtils.isPointInPolygon({ x: 1, y: 0 }, line)).toBe(false);
    });
  });
});