import { fabric } from 'fabric';
import { MaskLayer, type MaskLayerOptions } from '../MaskLayer';
import { CATEGORY_COLORS } from '@terrashaper/shared';

// Mock fabric.js
jest.mock('fabric', () => {
  const mockFabric = {
    Polygon: jest.fn().mockImplementation(function(this: any, points: any, options: any) {
      this.points = points;
      this.type = 'polygon';
      this.canvas = null;
      this.set = jest.fn();
      this.getBoundingRect = jest.fn(() => ({ left: 0, top: 0, width: 100, height: 100 }));
      this.calcTransformMatrix = jest.fn(() => [1, 0, 0, 1, 0, 0]);
      this.toObject = jest.fn(() => ({ type: 'polygon', points: this.points }));
      this.containsPoint = jest.fn(() => true);
      Object.assign(this, options);
      return this;
    }),
    Point: jest.fn().mockImplementation((x: number, y: number) => ({ x, y })),
    util: {
      transformPoint: jest.fn((point: any) => point)
    }
  };
  
  return { fabric: mockFabric };
});

describe('MaskLayer', () => {
  const mockPoints = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];

  const mockOptions: MaskLayerOptions = {
    category: 'Plants & Trees',
    maskId: 'test-mask-id',
    authorId: 'test-author'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates a mask layer with default options', () => {
      const mask = new MaskLayer(mockPoints, { category: 'Plants & Trees' });
      
      expect(mask.category).toBe('Plants & Trees');
      expect(mask.deleted).toBe(false);
      expect(mask.maskId).toBeDefined();
      expect(mask.createdAt).toBeInstanceOf(Date);
      expect(mask.authorId).toBe('current-user');
      expect(mask.type).toBe('MaskLayer');
    });

    it('creates a mask layer with custom options', () => {
      const createdAt = new Date('2023-01-01');
      
      const mask = new MaskLayer(mockPoints, {
        category: 'Hardscape',
        maskId: 'custom-id',
        authorId: 'custom-author',
        createdAt,
        deleted: true
      });
      
      expect(mask.category).toBe('Hardscape');
      expect(mask.maskId).toBe('custom-id');
      expect(mask.authorId).toBe('custom-author');
      expect(mask.createdAt).toBe(createdAt);
      expect(mask.deleted).toBe(true);
    });

    it('applies correct styling based on category', () => {
      const { fabric } = require('fabric');
      const mask = new MaskLayer(mockPoints, { category: 'Plants & Trees' });
      
      const expectedColor = CATEGORY_COLORS['Plants & Trees'];
      const constructorCall = fabric.Polygon.mock.calls[0];
      const options = constructorCall[1];
      
      expect(options.fill).toBe(expectedColor + '40');
      expect(options.stroke).toBe(expectedColor);
      expect(options.strokeWidth).toBe(2);
      expect(options.opacity).toBe(0.7);
    });

    it('applies deleted styling when mask is deleted', () => {
      const { fabric } = require('fabric');
      const mask = new MaskLayer(mockPoints, { 
        category: 'Plants & Trees',
        deleted: true 
      });
      
      const constructorCall = fabric.Polygon.mock.calls[0];
      const options = constructorCall[1];
      
      expect(options.opacity).toBe(0.3);
      expect(options.strokeDashArray).toEqual([5, 5]);
    });
  });

  describe('setCategory', () => {
    it('updates category and styling', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      mask.setCategory('Hardscape');
      
      expect(mask.category).toBe('Hardscape');
      expect(mask.set).toHaveBeenCalledWith(expect.objectContaining({
        fill: CATEGORY_COLORS['Hardscape'] + '40',
        stroke: CATEGORY_COLORS['Hardscape']
      }));
    });
  });

  describe('markDeleted and restore', () => {
    it('marks mask as deleted', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      mask.markDeleted();
      
      expect(mask.deleted).toBe(true);
      expect(mask.set).toHaveBeenCalledWith(expect.objectContaining({
        opacity: 0.3,
        strokeDashArray: [5, 5]
      }));
    });

    it('restores deleted mask', () => {
      const mask = new MaskLayer(mockPoints, { ...mockOptions, deleted: true });
      mask.restore();
      
      expect(mask.deleted).toBe(false);
      expect(mask.set).toHaveBeenCalledWith(expect.objectContaining({
        opacity: 0.7,
        strokeDashArray: undefined
      }));
    });
  });

  describe('toGeoJSON', () => {
    it('converts mask to GeoJSON format', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const geoJSON = mask.toGeoJSON();
      
      expect(geoJSON.type).toBe('Feature');
      expect(geoJSON.geometry.type).toBe('Polygon');
      expect(geoJSON.geometry.coordinates).toHaveLength(1);
      expect(geoJSON.geometry.coordinates[0]).toHaveLength(5); // Closed polygon
      
      expect(geoJSON.properties.maskId).toBe('test-mask-id');
      expect(geoJSON.properties.category).toBe('Plants & Trees');
      expect(geoJSON.properties.deleted).toBe(false);
      expect(geoJSON.properties.authorId).toBe('test-author');
    });

    it('closes polygon if not already closed', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const geoJSON = mask.toGeoJSON();
      
      const coordinates = geoJSON.geometry.coordinates[0];
      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      
      expect(firstPoint).toEqual(lastPoint);
    });
  });

  describe('fromGeoJSON', () => {
    it('creates mask from GeoJSON', () => {
      const geoJSON = {
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]]
        },
        properties: {
          maskId: 'geo-mask-id',
          category: 'Hardscape' as const,
          deleted: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          authorId: 'geo-author'
        }
      };

      const mask = MaskLayer.fromGeoJSON(geoJSON);
      
      expect(mask.maskId).toBe('geo-mask-id');
      expect(mask.category).toBe('Hardscape');
      expect(mask.deleted).toBe(true);
      expect(mask.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
      expect(mask.authorId).toBe('geo-author');
    });

    it('handles missing optional properties', () => {
      const geoJSON = {
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]]
        },
        properties: {
          maskId: 'minimal-mask',
          category: 'Other' as const
        }
      };

      const mask = MaskLayer.fromGeoJSON(geoJSON);
      
      expect(mask.deleted).toBe(false);
      expect(mask.createdAt).toBeInstanceOf(Date);
      expect(mask.authorId).toBe('unknown');
    });
  });

  describe('toObject and fromObject', () => {
    it('serializes mask to object', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const obj = mask.toObject();
      
      expect(obj.type).toBe('MaskLayer');
      expect(obj.maskId).toBe('test-mask-id');
      expect(obj.category).toBe('Plants & Trees');
      expect(obj.deleted).toBe(false);
      expect(obj.authorId).toBe('test-author');
    });

    it('deserializes mask from object', () => {
      const obj = {
        type: 'MaskLayer',
        points: mockPoints,
        maskId: 'deserialized-mask',
        category: 'Mulch & Rocks',
        deleted: false,
        createdAt: new Date('2023-01-01'),
        authorId: 'deserialized-author'
      };

      MaskLayer.fromObject(obj, (mask) => {
        expect(mask.maskId).toBe('deserialized-mask');
        expect(mask.category).toBe('Mulch & Rocks');
        expect(mask.deleted).toBe(false);
        expect(mask.authorId).toBe('deserialized-author');
      });
    });
  });

  describe('getArea', () => {
    it('calculates area using shoelace formula', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const area = mask.getArea();
      
      // Area of 100x100 square = 10000
      expect(area).toBe(10000);
    });

    it('returns 0 for invalid polygons', () => {
      const invalidPoints = [{ x: 0, y: 0 }, { x: 10, y: 10 }]; // Less than 3 points
      const mask = new MaskLayer(invalidPoints, mockOptions);
      
      expect(mask.getArea()).toBe(0);
    });
  });

  describe('getBoundingBox', () => {
    it('returns bounding box coordinates', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const bbox = mask.getBoundingBox();
      
      expect(bbox).toEqual({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      });
    });
  });

  describe('clone', () => {
    it('creates a copy with new mask ID', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const clone = mask.clone();
      
      expect(clone.maskId).not.toBe(mask.maskId);
      expect(clone.category).toBe(mask.category);
      expect(clone.deleted).toBe(mask.deleted);
      expect(clone.authorId).toBe(mask.authorId);
      expect(clone.createdAt).toEqual(mask.createdAt);
    });

    it('calls callback with cloned mask', () => {
      const mask = new MaskLayer(mockPoints, mockOptions);
      const callback = jest.fn();
      
      mask.clone(callback);
      
      expect(callback).toHaveBeenCalledWith(expect.any(MaskLayer));
    });
  });

  describe('generateMaskId', () => {
    it('generates unique IDs', () => {
      const mask1 = new MaskLayer(mockPoints, { category: 'Plants & Trees' });
      const mask2 = new MaskLayer(mockPoints, { category: 'Plants & Trees' });
      
      expect(mask1.maskId).not.toBe(mask2.maskId);
      expect(mask1.maskId).toMatch(/^mask_\d+_[a-z0-9]+$/);
      expect(mask2.maskId).toMatch(/^mask_\d+_[a-z0-9]+$/);
    });
  });
});