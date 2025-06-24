import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';

// Import the router after setup mocks are in place
const { appRouter } = await import('../../router');

describe('Scene Router Integration Tests', () => {
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

  describe('scene.upload', () => {
    it('should upload scene successfully with valid input', async () => {
      // Get mocked services
      const { sceneService } = await vi.importMock('@terrashaper/shared');
      const { storageService } = await vi.importMock('@terrashaper/storage');
      
      // Mock storage quota check
      storageService.getUsage.mockResolvedValue({
        used: 100,
        total: 1000,
        remaining: 900,
      });

      // Mock scene creation
      const mockScene = {
        id: 'scene-123',
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        imageUrl: 'https://example.com/image.jpg',
        order: 1,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sceneService.createScene.mockResolvedValue(mockScene);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.scene.upload({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        imageUrl: 'https://example.com/image.jpg',
        order: 1,
      });

      expect(result).toEqual({
        success: true,
        scene: mockScene,
      });
      expect(sceneService.createScene).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'https://example.com/image.jpg',
        1
      );
    });

    it('should reject invalid image URLs', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.upload({
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          imageUrl: 'invalid-url',
        })
      ).rejects.toThrow();
    });

    it('should reject invalid project UUID format', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.upload({
          projectId: 'invalid-uuid',
          imageUrl: 'https://example.com/image.jpg',
        })
      ).rejects.toThrow();
    });

    it('should handle scene creation failures', async () => {
      const { sceneService } = await vi.importMock('@terrashaper/shared');
      const { storageService } = await vi.importMock('@terrashaper/storage');
      
      storageService.getUsage.mockResolvedValue({
        used: 100,
        total: 1000,
        remaining: 900,
      });

      sceneService.createScene.mockRejectedValue(new Error('Database error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.upload({
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          imageUrl: 'https://example.com/image.jpg',
        })
      ).rejects.toThrow();
    });
  });

  describe('scene.reorder', () => {
    it('should reorder scenes successfully', async () => {
      const { sceneService } = await vi.importMock('@terrashaper/shared');
      
      sceneService.reorderScenes.mockResolvedValue(undefined);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.scene.reorder({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        sceneIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ],
      });

      expect(result).toEqual({
        success: true,
      });
      expect(sceneService.reorderScenes).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ]
      );
    });

    it('should reject invalid project UUID format', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.reorder({
          projectId: 'invalid-uuid',
          sceneIds: ['550e8400-e29b-41d4-a716-446655440001'],
        })
      ).rejects.toThrow();
    });

    it('should reject invalid scene UUIDs in array', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.reorder({
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          sceneIds: ['invalid-uuid', '550e8400-e29b-41d4-a716-446655440001'],
        })
      ).rejects.toThrow();
    });

    it('should handle reorder service failures', async () => {
      const { sceneService } = await vi.importMock('@terrashaper/shared');
      
      sceneService.reorderScenes.mockRejectedValue(new Error('Database error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.reorder({
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          sceneIds: ['550e8400-e29b-41d4-a716-446655440001'],
        })
      ).rejects.toThrow();
    });
  });

  describe('scene.list', () => {
    it('should list scenes for project successfully', async () => {
      const { sceneService } = await vi.importMock('@terrashaper/shared');
      
      const mockScenes = [
        {
          id: 'scene-1',
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          imageUrl: 'https://example.com/image1.jpg',
          order: 1,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'scene-2',
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          imageUrl: 'https://example.com/image2.jpg',
          order: 2,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      sceneService.getScenesByProject.mockResolvedValue(mockScenes);

      const caller = appRouter.createCaller(mockContext);
      
      const result = await caller.scene.list({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result).toEqual(mockScenes);
      expect(sceneService.getScenesByProject).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should reject invalid project UUID', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.list({
          projectId: 'invalid-uuid',
        })
      ).rejects.toThrow();
    });

    it('should handle service failures gracefully', async () => {
      const { sceneService } = await vi.importMock('@terrashaper/shared');
      
      sceneService.getScenesByProject.mockRejectedValue(new Error('Database error'));

      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.scene.list({
          projectId: '550e8400-e29b-41d4-a716-446655440000',
        })
      ).rejects.toThrow();
    });
  });
});