import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { sceneService } from '@terrashaper/shared';

import { protectedProcedure, router } from '../trpc';

const imageFileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  buffer: z.any(), // File buffer
});

export const sceneRouter = router({
  /**
   * Upload a new scene to a project
   */
  upload: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        imageUrl: z.string().url(), // Already uploaded image URL
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // In a real implementation, you would:
        // 1. Validate image dimensions using imageFileSchema
        // 2. Upload file to storage service
        // 3. Get the URL from storage
        
        // For now, we'll use the provided imageUrl
        const scene = await sceneService.createScene(
          input.projectId,
          input.imageUrl,
          input.order
        );

        return {
          success: true,
          scene,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload scene',
          cause: error,
        });
      }
    }),

  /**
   * Reorder scenes within a project
   */
  reorder: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        sceneIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await sceneService.reorderScenes(input.projectId, input.sceneIds);
        
        return {
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reorder scenes',
          cause: error,
        });
      }
    }),

  /**
   * Get all scenes for a project
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const scenes = await sceneService.getScenesByProject(input.projectId);
        return scenes;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch scenes',
          cause: error,
        });
      }
    }),

  /**
   * Get a single scene with its masks
   */
  getWithMasks: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const scene = await sceneService.getSceneWithMasks(input.sceneId);
        
        if (!scene) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Scene not found',
          });
        }

        return scene;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch scene',
          cause: error,
        });
      }
    }),

  /**
   * Delete a scene
   */
  delete: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await sceneService.deleteScene(input.sceneId);
        
        return {
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete scene',
          cause: error,
        });
      }
    }),

  /**
   * Set a scene as default for a project
   */
  setDefault: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        sceneId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await sceneService.setDefaultScene(input.projectId, input.sceneId);
        
        return {
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set default scene',
          cause: error,
        });
      }
    }),
});