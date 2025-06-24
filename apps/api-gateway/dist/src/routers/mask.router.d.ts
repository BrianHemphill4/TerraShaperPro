import { z } from 'zod';
export declare const maskRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: {
        data: {
            zodError: z.typeToFlattenedError<any, string> | null;
            code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
            httpStatus: number;
            path?: string;
            stack?: string;
        };
        message: string;
        code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
    };
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    /**
     * Save masks for a scene with diff tracking
     */
    save: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            sceneId: string;
            masks: {
                category: string;
                path?: any;
                id?: string | undefined;
                authorId?: string | undefined;
            }[];
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: object;
    }>;
    /**
     * Get masks by category for a scene
     */
    getByCategory: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId: string;
            category: string;
        };
        output: {
            path: unknown;
            id: string;
            sceneId: string;
            createdAt: Date;
            category: string;
            deleted: boolean;
            authorId: string | null;
        }[];
        meta: object;
    }>;
    /**
     * Get all masks for a scene
     */
    getByScene: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId: string;
        };
        output: {
            path: unknown;
            id: string;
            sceneId: string;
            createdAt: Date;
            category: string;
            deleted: boolean;
            authorId: string | null;
        }[];
        meta: object;
    }>;
    /**
     * Get mask history for a scene
     */
    history: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId: string;
        };
        output: import("@terrashaper/shared").MaskHistory[];
        meta: object;
    }>;
    /**
     * Delete a specific mask
     */
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            maskId: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    /**
     * Export masks as GeoJSON
     */
    exportGeoJSON: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId: string;
        };
        output: any;
        meta: object;
    }>;
    /**
     * Get available categories
     */
    getCategories: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId?: string | undefined;
        };
        output: string[];
        meta: object;
    }>;
}>>;
