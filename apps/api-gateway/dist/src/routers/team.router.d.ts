import { z } from 'zod';
export declare const teamRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    listMembers: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number | undefined;
            offset?: number | undefined;
        };
        output: {
            members: any;
            total: any;
            limit: number;
            offset: number;
        };
        meta: object;
    }>;
    createInvitation: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            email: string;
            role: "member" | "owner" | "admin" | "designer" | "viewer";
        };
        output: any;
        meta: object;
    }>;
    listInvitations: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number | undefined;
            offset?: number | undefined;
        };
        output: {
            invitations: any;
            limit: number;
            offset: number;
        };
        meta: object;
    }>;
    cancelInvitation: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            invitationId: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    updateUserRole: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            role: "member" | "owner" | "admin" | "designer" | "viewer";
            userId: string;
        };
        output: any;
        meta: object;
    }>;
    removeUser: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    getActivityLogs: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            userId?: string | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
            action?: string | undefined;
        };
        output: {
            logs: any;
            total: any;
            limit: number;
            offset: number;
        };
        meta: object;
    }>;
}>>;
