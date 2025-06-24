import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { sceneService, maskService } from '@terrashaper/shared';

import { protectedProcedure, router } from '../trpc';

export const exportRouter = router({
  /**
   * Export all masks from a project as GeoJSON
   */
  projectGeoJSON: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get all scenes for the project
        const scenes = await sceneService.getScenesByProject(input.projectId);
        
        const allFeatures: any[] = [];
        
        // Collect masks from all scenes
        for (const scene of scenes) {
          const sceneGeoJSON = await maskService.exportMasksAsGeoJSON(scene.id);
          
          // Add scene metadata to each feature
          const sceneFeaturesWithMetadata = sceneGeoJSON.features.map((feature: any) => ({
            ...feature,
            properties: {
              ...feature.properties,
              sceneId: scene.id,
              sceneImageUrl: scene.imageUrl,
              sceneOrder: scene.order,
              isDefaultScene: scene.isDefault,
            },
          }));
          
          allFeatures.push(...sceneFeaturesWithMetadata);
        }

        return {
          type: 'FeatureCollection',
          properties: {
            projectId: input.projectId,
            exportDate: new Date().toISOString(),
            totalScenes: scenes.length,
            totalMasks: allFeatures.length,
          },
          features: allFeatures,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export project GeoJSON',
          cause: error,
        });
      }
    }),

  /**
   * Export masks from a scene as PNG sprite sheet (stub implementation)
   */
  sceneSprite: protectedProcedure
    .input(
      z.object({
        sceneId: z.string().uuid(),
        format: z.enum(['png', 'svg']).default('png'),
        resolution: z.enum(['1x', '2x', '4x']).default('1x'),
      })
    )
    .query(async ({ input }) => {
      try {
        // This is a stub implementation
        // In a real implementation, this would:
        // 1. Get the scene and its masks
        // 2. Render each mask as a separate image
        // 3. Combine into a sprite sheet
        // 4. Return the sprite sheet URL and metadata
        
        const scene = await sceneService.getSceneWithMasks(input.sceneId);
        
        if (!scene) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Scene not found',
          });
        }

        // Stub response
        return {
          spriteSheetUrl: `https://example.com/sprites/${input.sceneId}.${input.format}`,
          format: input.format,
          resolution: input.resolution,
          maskCount: scene.masks.length,
          metadata: {
            sceneId: input.sceneId,
            imageUrl: scene.imageUrl,
            generatedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate sprite sheet',
          cause: error,
        });
      }
    }),

  /**
   * Export project summary with statistics
   */
  projectSummary: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const scenes = await sceneService.getScenesByProject(input.projectId);
        
        let totalMasks = 0;
        const categoryStats: Record<string, number> = {};
        const sceneStats = [];
        
        for (const scene of scenes) {
          const masks = await maskService.getMasksByScene(scene.id);
          totalMasks += masks.length;
          
          const sceneCategoryStats: Record<string, number> = {};
          masks.forEach(mask => {
            categoryStats[mask.category] = (categoryStats[mask.category] || 0) + 1;
            sceneCategoryStats[mask.category] = (sceneCategoryStats[mask.category] || 0) + 1;
          });
          
          sceneStats.push({
            sceneId: scene.id,
            imageUrl: scene.imageUrl,
            order: scene.order,
            isDefault: scene.isDefault,
            maskCount: masks.length,
            categories: sceneCategoryStats,
          });
        }

        return {
          projectId: input.projectId,
          totalScenes: scenes.length,
          totalMasks,
          categoryStats,
          sceneStats,
          exportedAt: new Date().toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate project summary',
          cause: error,
        });
      }
    }),
});