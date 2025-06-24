import { z } from 'zod';
export declare const projectRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            search?: string | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
            sortBy?: "status" | "name" | "recent" | undefined;
            filterStatus?: "active" | "all" | "completed" | "archived" | undefined;
        };
        output: {
            projects: any;
            total: any;
            hasMore: boolean;
        };
        meta: object;
    }>;
    stats: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            totalProjects: any;
            activeProjects: any;
            completedProjects: any;
            archivedProjects: any;
        };
        meta: object;
    }>;
    get: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: any;
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name: string;
            description?: string | undefined;
            address?: string | undefined;
            client_name?: string | undefined;
            client_email?: string | undefined;
            canvas_data?: Record<string, any> | undefined;
        };
        output: any;
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            description?: string | undefined;
            status?: "active" | "completed" | "archived" | undefined;
            name?: string | undefined;
            address?: string | undefined;
            client_name?: string | undefined;
            client_email?: string | undefined;
            canvas_data?: Record<string, any> | undefined;
        };
        output: any;
        meta: object;
    }>;
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    listVersions: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId: string;
            limit?: number | undefined;
            offset?: number | undefined;
        };
        output: {
            versions: any;
            total: any;
            hasMore: boolean;
        };
        meta: object;
    }>;
    createVersion: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId: string;
            snapshot: Record<string, any>;
            comment?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    getVersionDiff: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            versionIdA: string;
            versionIdB: string;
        };
        output: {
            diff: Record<string, {
                from?: any;
                to?: any;
            }>;
            snapshotA: Record<string, any>;
            snapshotB: Record<string, any>;
        };
        meta: object;
    }>;
    restoreVersion: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            versionId: string;
        };
        output: {
            restored: boolean;
        };
        meta: object;
    }>;
}>>;
