"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const shared_1 = require("@terrashaper/shared");
const trpc_1 = require("../trpc");
const maskDataSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    category: zod_1.z.string().min(1).max(50),
    path: zod_1.z.any(), // GeoJSON object
    authorId: zod_1.z.string().uuid().optional(),
});
exports.maskRouter = (0, trpc_1.router)({
    /**
     * Save masks for a scene with diff tracking
     */
    save: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
        masks: zod_1.z.array(maskDataSchema),
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            await shared_1.maskService.saveMasks(input.sceneId, input.masks, ctx.session.userId);
            return {
                success: true,
                message: 'Masks saved successfully',
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to save masks',
                cause: error,
            });
        }
    }),
    /**
     * Get masks by category for a scene
     */
    getByCategory: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
        category: zod_1.z.string(),
    }))
        .query(async ({ input }) => {
        try {
            const masks = await shared_1.maskService.getMasksByCategory(input.sceneId, input.category);
            return masks;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch masks by category',
                cause: error,
            });
        }
    }),
    /**
     * Get all masks for a scene
     */
    getByScene: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            const masks = await shared_1.maskService.getMasksByScene(input.sceneId);
            return masks;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch masks',
                cause: error,
            });
        }
    }),
    /**
     * Get mask history for a scene
     */
    history: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            const history = await shared_1.maskService.getMaskHistory(input.sceneId);
            return history;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch mask history',
                cause: error,
            });
        }
    }),
    /**
     * Delete a specific mask
     */
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        maskId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ input }) => {
        try {
            await shared_1.maskService.softDeleteMask(input.maskId);
            return {
                success: true,
            };
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete mask',
                cause: error,
            });
        }
    }),
    /**
     * Export masks as GeoJSON
     */
    exportGeoJSON: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid(),
    }))
        .query(async ({ input }) => {
        try {
            const geoJSON = await shared_1.maskService.exportMasksAsGeoJSON(input.sceneId);
            return geoJSON;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to export masks',
                cause: error,
            });
        }
    }),
    /**
     * Get available categories
     */
    getCategories: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        sceneId: zod_1.z.string().uuid().optional(),
    }))
        .query(async ({ input }) => {
        try {
            const categories = await shared_1.maskService.getCategories(input.sceneId);
            return categories;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch categories',
                cause: error,
            });
        }
    }),
});
