"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sceneRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const shared_1 = require("@terrashaper/shared");
const trpc_1 = require("../trpc");
const imageFileSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    size: zod_1.z.number(),
    buffer: zod_1.z.any(), // File buffer
});
exports.sceneRouter = (0, trpc_1.router)({
    /**
     * Upload a new scene to a project
     */
    upload: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        imageUrl: zod_1.z.string().url(), // Already uploaded image URL
        order: zod_1.z.number().optional(),
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            // In a real implementation, you would:
            // 1. Validate image dimensions using imageFileSchema
            // 2. Upload file to storage service
            // 3. Get the URL from storage
            // For now, we'll use the provided imageUrl
            const scene = await shared_1.sceneService.createScene(input.projectId, input.imageUrl, input.order);
            return {
                success: true,
                scene,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to upload scene',
                cause: error,
            });
        }
    }),
    /**
     * Reorder scenes within a project
     */
    reorder: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        sceneIds: zod_1.z.array(zod_1.z.string().uuid()),
    }))
        .mutation(async ({ input }) => {
        try {
            await shared_1.sceneService.reorderScenes(input.projectId, input.sceneIds);
            return {
                success: true,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to reorder scenes',
                cause: error,
            });
        }
    }),
    /**
     * Get all scenes for a project
     */
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            const scenes = await shared_1.sceneService.getScenesByProject(input.projectId);
            return scenes;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch scenes',
                cause: error,
            });
        }
    }),
    /**
     * Get a single scene with its masks
     */
    getWithMasks: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            const scene = await shared_1.sceneService.getSceneWithMasks(input.sceneId);
            if (!scene) {
                throw new server_1.TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Scene not found',
                });
            }
            return scene;
        }
        catch (error) {
            if (error instanceof server_1.TRPCError) {
                throw error;
            }
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch scene',
                cause: error,
            });
        }
    }),
    /**
     * Delete a scene
     */
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ input }) => {
        try {
            await shared_1.sceneService.deleteScene(input.sceneId);
            return {
                success: true,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete scene',
                cause: error,
            });
        }
    }),
    /**
     * Set a scene as default for a project
     */
    setDefault: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        sceneId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ input }) => {
        try {
            await shared_1.sceneService.setDefaultScene(input.projectId, input.sceneId);
            return {
                success: true,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to set default scene',
                cause: error,
            });
        }
    }),
});
