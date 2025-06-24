import { z } from 'zod';
export declare const renderRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId: string;
            sceneId: string;
            sourceImageUrl: string;
            prompt: {
                user: string;
                system: string;
            };
            annotations: {
                type: "mask" | "assetInstance" | "textLabel";
                data?: any;
            }[];
            settings: {
                resolution: "1024x1024" | "2048x2048" | "4096x4096";
                provider: "google-imagen" | "openai-gpt-image";
                format?: "PNG" | "JPEG" | undefined;
                quality?: number | undefined;
            };
            maskImageUrl?: string | undefined;
        };
        output: {
            renderId: string;
            jobId: string | undefined;
            status: string;
        };
        meta: object;
    }>;
    status: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            renderId: string;
        };
        output: {
            renderId: any;
            status: any;
            progress: any;
            imageUrl: any;
            thumbnailUrl: any;
            error: any;
            metadata: any;
        };
        meta: object;
    }>;
    subscribe: import("@trpc/server/dist/unstable-core-do-not-import.d-CSxj_rbP.cjs").LegacyObservableSubscriptionProcedure<{
        input: {
            renderId: string;
        };
        output: {
            type: "progress" | "completed" | "failed" | "ping";
            progress?: number;
            result?: any;
            error?: string;
        };
        meta: object;
    }>;
    metrics: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            delayed: number;
            paused: number;
            total: number;
        };
        meta: object;
    }>;
    retry: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            renderId: string;
        };
        output: {
            renderId: string;
            jobId: string | undefined;
            status: string;
        };
        meta: object;
    }>;
}>>;
