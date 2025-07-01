export declare const storageRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    generateUploadUrl: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            fileName?: string;
            contentType?: string;
            bucketType?: "renders" | "assets";
            expiresInMinutes?: number;
        };
        output: {
            uploadUrl: any;
            fileName: any;
            publicUrl: string;
            expiresAt: Date;
        };
        meta: object;
    }>;
    generateDownloadUrl: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            fileName?: string;
            bucketType?: "renders" | "assets";
            expiresInMinutes?: number;
        };
        output: {
            downloadUrl: any;
            fileName: string;
            expiresAt: Date;
        };
        meta: object;
    }>;
    fileExists: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            fileName?: string;
            bucketType?: "renders" | "assets";
        };
        output: {
            exists: any;
            fileName: string;
        };
        meta: object;
    }>;
    getFileMetadata: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            fileName?: string;
            bucketType?: "renders" | "assets";
        };
        output: {
            fileName: string;
            size: any;
            contentType: any;
            created: any;
            updated: any;
            etag: any;
        };
        meta: object;
    }>;
    deleteFile: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            fileName?: string;
            bucketType?: "renders" | "assets";
        };
        output: {
            success: boolean;
            fileName: string;
        };
        meta: object;
    }>;
    generateFileName: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            type?: "render" | "asset" | "upload";
            id?: string;
            originalFileName?: string;
        };
        output: {
            fileName: string;
        };
        meta: object;
    }>;
    getCorsConfig: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            origin: string[];
            methods: string[];
            allowedHeaders: string[];
            maxAgeSeconds: number;
        };
        meta: object;
    }>;
}>>;
