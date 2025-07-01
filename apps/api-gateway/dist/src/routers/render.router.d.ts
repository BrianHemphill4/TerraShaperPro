export declare const renderRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId?: string;
            sceneId?: string;
            sourceImageUrl?: string;
            maskImageUrl?: string;
            prompt?: {
                system?: string;
                user?: string;
            };
            annotations?: {
                type?: "mask" | "assetInstance" | "textLabel";
                data?: any;
            }[];
            settings?: {
                provider?: "google-imagen" | "openai-gpt-image";
                resolution?: "1024x1024" | "2048x2048" | "4096x4096";
                format?: "PNG" | "JPEG";
                quality?: number;
            };
        };
        output: {
            renderId: string;
            jobId: string;
            status: string;
        };
        meta: object;
    }>;
    status: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            renderId?: string;
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
            renderId?: string;
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
            renderId?: string;
        };
        output: {
            renderId: string;
            jobId: string;
            status: string;
        };
        meta: object;
    }>;
}>>;
