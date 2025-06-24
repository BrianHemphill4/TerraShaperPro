import { z } from 'zod';
export declare const storageRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    generateUploadUrl: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            fileName: string;
            contentType: string;
            bucketType: "renders" | "assets";
            expiresInMinutes?: number | undefined;
        };
        output: {
            uploadUrl: string;
            fileName: string;
            publicUrl: string;
            expiresAt: Date;
        };
        meta: object;
    }>;
    generateDownloadUrl: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            fileName: string;
            bucketType: "renders" | "assets";
            expiresInMinutes?: number | undefined;
        };
        output: {
            downloadUrl: string;
            fileName: string;
            expiresAt: Date;
        };
        meta: object;
    }>;
    fileExists: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            fileName: string;
            bucketType: "renders" | "assets";
        };
        output: {
            exists: boolean;
            fileName: string;
        };
        meta: object;
    }>;
    getFileMetadata: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            fileName: string;
            bucketType: "renders" | "assets";
        };
        output: {
            fileName: string;
            size: string | number | undefined;
            contentType: string | undefined;
            created: string | undefined;
            updated: string | undefined;
            etag: string | undefined;
        };
        meta: object;
    }>;
    deleteFile: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            fileName: string;
            bucketType: "renders" | "assets";
        };
        output: {
            success: boolean;
            fileName: string;
        };
        meta: object;
    }>;
    generateFileName: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            type: "render" | "upload" | "asset";
            id?: string | undefined;
            originalFileName?: string | undefined;
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
