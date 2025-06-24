import { z } from 'zod';
export declare const exportRouter: import("@trpc/server").TRPCBuiltRouter<{
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
     * Export all masks from a project as GeoJSON
     */
    projectGeoJSON: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId: string;
        };
        output: {
            type: string;
            properties: {
                projectId: string;
                exportDate: string;
                totalScenes: number;
                totalMasks: number;
            };
            features: any[];
        };
        meta: object;
    }>;
    /**
     * Export masks from a scene as PNG sprite sheet (stub implementation)
     */
    sceneSprite: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sceneId: string;
            format?: "png" | "svg" | undefined;
            resolution?: "1x" | "2x" | "4x" | undefined;
        };
        output: {
            spriteSheetUrl: string;
            format: "png" | "svg";
            resolution: "1x" | "2x" | "4x";
            maskCount: number;
            metadata: {
                sceneId: string;
                imageUrl: string;
                generatedAt: string;
            };
        };
        meta: object;
    }>;
    /**
     * Export project summary with statistics
     */
    projectSummary: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId: string;
        };
        output: {
            projectId: string;
            totalScenes: number;
            totalMasks: number;
            categoryStats: Record<string, number>;
            sceneStats: {
                sceneId: string;
                imageUrl: string;
                order: number;
                isDefault: boolean;
                maskCount: number;
                categories: Record<string, number>;
            }[];
            exportedAt: string;
        };
        meta: object;
    }>;
}>>;
