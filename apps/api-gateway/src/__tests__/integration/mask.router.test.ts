import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';

// Import the router after setup mocks are in place
const { appRouter } = await import('../../router');

describe('Mask Router Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock context following existing test patterns
  const mockContext = {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    user: { 
      id: 'test-user-id',
      organizationId: 'test-org-id'
    },
  };

  describe('mask.save', () => {
    const validGeoJSON = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    };

    const validMaskData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        category: 'vegetation',
        path: validGeoJSON,
        authorId: '550e8400-e29b-41d4-a716-446655440002',
      },
      {
        category: 'water',
        path: validGeoJSON,
      },
    ];

    it('should save masks successfully with valid GeoJSON', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      maskService.saveMasks.mockResolvedValue(undefined);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.mask.save({
        sceneId: '550e8400-e29b-41d4-a716-446655440000',
        masks: validMaskData,
      });

      expect(result).toEqual({
        success: true,
        message: 'Masks saved successfully',
      });
      expect(maskService.saveMasks).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        validMaskData,
        'test-user-id'
      );
    });

    it('should reject invalid scene UUID format', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.save({
          sceneId: 'invalid-uuid',
          masks: validMaskData,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid mask category length', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      const invalidMaskData = [
        {
          category: '', // Empty category
          path: validGeoJSON,
        },
      ];

      await expect(
        caller.mask.save({
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
          masks: invalidMaskData,
        })
      ).rejects.toThrow();
    });

    it('should reject category longer than 50 characters', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      const invalidMaskData = [
        {
          category: 'a'.repeat(51), // Too long category
          path: validGeoJSON,
        },
      ];

      await expect(
        caller.mask.save({
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
          masks: invalidMaskData,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid mask ID UUID format', async () => {
      const caller = appRouter.createCaller(mockContext);
      
      const invalidMaskData = [
        {
          id: 'invalid-uuid',
          category: 'vegetation',
          path: validGeoJSON,
        },
      ];

      await expect(
        caller.mask.save({
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
          masks: invalidMaskData,
        })
      ).rejects.toThrow();
    });

    it('should handle empty masks array', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      maskService.saveMasks.mockResolvedValue(undefined);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.mask.save({
        sceneId: '550e8400-e29b-41d4-a716-446655440000',
        masks: [],
      });

      expect(result).toEqual({
        success: true,
        message: 'Masks saved successfully',
      });
    });

    it('should handle service failures', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      maskService.saveMasks.mockRejectedValue(new Error('Database error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.save({
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
          masks: validMaskData,
        })
      ).rejects.toThrow();
    });
  });

  describe('mask.history', () => {
    it('should return mask history successfully', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      const mockHistory = [
        {
          id: 'scene-123-2024-01-01',
          masks: [
            {
              id: 'mask-1',
              category: 'vegetation',
              path: { type: 'Polygon', coordinates: [] },
              deleted: false,
              authorId: 'test-user-id',
              createdAt: new Date('2024-01-01'),
            },
          ],
          createdAt: new Date('2024-01-01'),
          authorId: 'test-user-id',
        },
      ];
      
      maskService.getMaskHistory.mockResolvedValue(mockHistory);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.mask.history({
        sceneId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual(mockHistory);
      expect(maskService.getMaskHistory).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should reject invalid scene UUID format', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.history({
          sceneId: 'invalid-uuid',
        })
      ).rejects.toThrow();
    });

    it('should handle empty history gracefully', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      maskService.getMaskHistory.mockResolvedValue([]);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.mask.history({
        sceneId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual([]);
    });

    it('should handle service failures', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      maskService.getMaskHistory.mockRejectedValue(new Error('Database error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.history({
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
        })
      ).rejects.toThrow();
    });
  });

  describe('mask.list', () => {
    it('should list masks for scene successfully', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      const mockMasks = [
        {
          id: 'mask-1',
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
          category: 'vegetation',
          path: { type: 'Polygon', coordinates: [] },
          deleted: false,
          authorId: 'test-user-id',
          createdAt: new Date(),
        },
        {
          id: 'mask-2',
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
          category: 'water',
          path: { type: 'Polygon', coordinates: [] },
          deleted: false,
          authorId: 'test-user-id',
          createdAt: new Date(),
        },
      ];
      
      maskService.getMasksByScene.mockResolvedValue(mockMasks);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.mask.list({
        sceneId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual(mockMasks);
      expect(maskService.getMasksByScene).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should reject invalid scene UUID', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.list({
          sceneId: 'invalid-uuid',
        })
      ).rejects.toThrow();
    });
  });

  describe('mask.export', () => {
    it('should export masks as GeoJSON successfully', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      const mockGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: 'mask-1',
              category: 'vegetation',
              authorId: 'test-user-id',
              createdAt: new Date(),
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
      };
      
      maskService.exportMasksAsGeoJSON.mockResolvedValue(mockGeoJSON);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.mask.export({
        sceneId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual(mockGeoJSON);
      expect(maskService.exportMasksAsGeoJSON).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should reject invalid scene UUID', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.export({
          sceneId: 'invalid-uuid',
        })
      ).rejects.toThrow();
    });

    it('should handle export failures', async () => {
      const { maskService } = await vi.importMock('@terrashaper/shared');
      
      maskService.exportMasksAsGeoJSON.mockRejectedValue(new Error('Export error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.mask.export({
          sceneId: '550e8400-e29b-41d4-a716-446655440000',
        })
      ).rejects.toThrow();
    });
  });
});