import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { maskService } from '@terrashaper/shared';

import { protectedProcedure, router } from '../trpc';

const maskDataSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().min(1).max(50),
  path: z.any(), // GeoJSON object
  authorId: z.string().uuid().optional(),
});

export const maskRouter = router({
  /**
   * Save masks for a scene with diff tracking
   */
  save: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
        masks: z.array(maskDataSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await maskService.saveMasks(
          input.sceneId,
          input.masks,
          ctx.session.userId
        );

        return {
          success: true,
          message: 'Masks saved successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save masks',
          cause: error,
        });
      }
    }),

  /**
   * Get masks by category for a scene
   */
  getByCategory: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const masks = await maskService.getMasksByCategory(
          input.sceneId,
          input.category
        );
        return masks;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch masks by category',
          cause: error,
        });
      }
    }),

  /**
   * Get all masks for a scene
   */
  getByScene: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const masks = await maskService.getMasksByScene(input.sceneId);
        return masks;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch masks',
          cause: error,
        });
      }
    }),

  /**
   * Get mask history for a scene
   */
  history: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await maskService.getMaskHistory(input.sceneId);
        return history;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch mask history',
          cause: error,
        });
      }
    }),

  /**
   * Delete a specific mask
   */
  delete: protectedProcedure
    .input(
      z.object({
        maskId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await maskService.softDeleteMask(input.maskId);
        
        return {
          success: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete mask',
          cause: error,
        });
      }
    }),

  /**
   * Export masks as GeoJSON
   */
  exportGeoJSON: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const geoJSON = await maskService.exportMasksAsGeoJSON(input.sceneId);
        return geoJSON;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export masks',
          cause: error,
        });
      }
    }),

  /**
   * Get available categories
   */
  getCategories: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const categories = await maskService.getCategories(input.sceneId);
        return categories;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
          cause: error,
        });
      }
    }),
});