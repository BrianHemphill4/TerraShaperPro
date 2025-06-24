"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const shared_1 = require("@terrashaper/shared");
const trpc_1 = require("../trpc");
exports.exportRouter = (0, trpc_1.router)({
    /**
     * Export all masks from a project as GeoJSON
     */
    projectGeoJSON: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            // Get all scenes for the project
            const scenes = await shared_1.sceneService.getScenesByProject(input.projectId);
            const allFeatures = [];
            // Collect masks from all scenes
            for (const scene of scenes) {
                const sceneGeoJSON = await shared_1.maskService.exportMasksAsGeoJSON(scene.id);
                // Add scene metadata to each feature
                const sceneFeaturesWithMetadata = sceneGeoJSON.features.map((feature) => ({
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
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to export project GeoJSON',
                cause: error,
            });
        }
    }),
    /**
     * Export masks from a scene as PNG sprite sheet (stub implementation)
     */
    sceneSprite: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
        format: zod_1.z.enum(['png', 'svg']).default('png'),
        resolution: zod_1.z.enum(['1x', '2x', '4x']).default('1x'),
    }))
        .query(async ({ input }) => {
        try {
            // This is a stub implementation
            // In a real implementation, this would:
            // 1. Get the scene and its masks
            // 2. Render each mask as a separate image
            // 3. Combine into a sprite sheet
            // 4. Return the sprite sheet URL and metadata
            const scene = await shared_1.sceneService.getSceneWithMasks(input.sceneId);
            if (!scene) {
                throw new server_1.TRPCError({
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
        }
        catch (error) {
            if (error instanceof server_1.TRPCError) {
                throw error;
            }
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to generate sprite sheet',
                cause: error,
            });
        }
    }),
    /**
     * Export project summary with statistics
     */
    projectSummary: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            const scenes = await shared_1.sceneService.getScenesByProject(input.projectId);
            let totalMasks = 0;
            const categoryStats = {};
            const sceneStats = [];
            for (const scene of scenes) {
                const masks = await shared_1.maskService.getMasksByScene(scene.id);
                totalMasks += masks.length;
                const sceneCategoryStats = {};
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
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to generate project summary',
                cause: error,
            });
        }
    }),
});
