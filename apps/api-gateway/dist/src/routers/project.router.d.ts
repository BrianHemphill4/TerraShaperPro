export declare const projectRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            search?: string;
            limit?: number;
            offset?: number;
            sortBy?: "status" | "name" | "recent";
            filterStatus?: "all" | "active" | "completed" | "archived";
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
            id?: string;
        };
        output: any;
        meta: object;
    }>;
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            name?: string;
            description?: string;
            address?: string;
            client_name?: string;
            client_email?: string;
            canvas_data?: Record<string, any>;
        };
        output: any;
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            status?: "active" | "completed" | "archived";
            name?: string;
            description?: string;
            id?: string;
            address?: string;
            client_name?: string;
            client_email?: string;
            canvas_data?: Record<string, any>;
        };
        output: any;
        meta: object;
    }>;
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id?: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    listVersions: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number;
            offset?: number;
            projectId?: string;
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
            projectId?: string;
            snapshot?: Record<string, any>;
            comment?: string;
        };
        output: any;
        meta: object;
    }>;
    getVersionDiff: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            versionIdA?: string;
            versionIdB?: string;
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
            versionId?: string;
        };
        output: {
            restored: boolean;
        };
        meta: object;
    }>;
}>>;
