export declare const maskRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    /**
     * Save masks for a scene with diff tracking
     */
    save: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            sceneId?: string;
            masks?: {
                category?: string;
                path?: any;
                id?: string;
                authorId?: string;
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
            category?: string;
            sceneId?: string;
        };
        output: {
            category: string;
            path: unknown;
            id: string;
            sceneId: string;
            createdAt: Date;
            deleted: boolean;
            authorId: string;
        }[];
        meta: object;
    }>;
    /**
     * Get all masks for a scene
     */
    getByScene: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId?: string;
        };
        output: {
            category: string;
            path: unknown;
            id: string;
            sceneId: string;
            createdAt: Date;
            deleted: boolean;
            authorId: string;
        }[];
        meta: object;
    }>;
    /**
     * Get mask history for a scene
     */
    history: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId?: string;
        };
        output: import("@terrashaper/shared").MaskHistory[];
        meta: object;
    }>;
    /**
     * Delete a specific mask
     */
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            maskId?: string;
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
            sceneId?: string;
        };
        output: any;
        meta: object;
    }>;
    /**
     * Get available categories
     */
    getCategories: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId?: string;
        };
        output: string[];
        meta: object;
    }>;
}>>;
