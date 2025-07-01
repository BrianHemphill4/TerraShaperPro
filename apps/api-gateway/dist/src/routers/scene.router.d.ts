export declare const sceneRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    /**
     * Upload a new scene to a project
     */
    upload: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId?: string;
            imageUrl?: string;
            order?: number;
        };
        output: {
            success: boolean;
            scene: {
                id: string;
                isDefault: boolean;
                projectId: string;
                imageUrl: string;
                order: number;
                createdAt: Date;
                updatedAt: Date;
            };
        };
        meta: object;
    }>;
    /**
     * Reorder scenes within a project
     */
    reorder: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId?: string;
            sceneIds?: string[];
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    /**
     * Get all scenes for a project
     */
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId?: string;
        };
        output: {
            id: string;
            isDefault: boolean;
            projectId: string;
            imageUrl: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: object;
    }>;
    /**
     * Get a single scene with its masks
     */
    getWithMasks: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId?: string;
        };
        output: import("@terrashaper/shared").SceneWithMasks;
        meta: object;
    }>;
    /**
     * Delete a scene
     */
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            sceneId?: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    /**
     * Set a scene as default for a project
     */
    setDefault: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId?: string;
            sceneId?: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
}>>;
