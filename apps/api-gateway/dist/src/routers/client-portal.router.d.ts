import { z } from 'zod';
export declare const clientPortalRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    createAccessLink: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId: string;
            permissions?: {
                view?: boolean | undefined;
                comment?: boolean | undefined;
                approve?: boolean | undefined;
            } | undefined;
            clientEmail?: string | undefined;
            clientName?: string | undefined;
            expiresIn?: number | undefined;
        };
        output: any;
        meta: object;
    }>;
    listAccessLinks: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId: string;
        };
        output: any;
        meta: object;
    }>;
    revokeAccessLink: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            linkId: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    createApprovalRequest: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId: string;
            notes?: string | undefined;
            versionId?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    listApprovals: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId: string;
            status?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    updateApprovalStatus: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            status: "pending" | "approved" | "rejected" | "revision_requested";
            approvalId: string;
            notes?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    createComment: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId: string;
            content: string;
            position?: {
                x: number;
                y: number;
            } | undefined;
            parentId?: string | undefined;
            clientAccessToken?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    listComments: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            projectId: string;
            includeResolved?: boolean | undefined;
        };
        output: any;
        meta: object;
    }>;
    resolveComment: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            commentId: string;
            resolved: boolean;
        };
        output: any;
        meta: object;
    }>;
    getClientProject: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            token: string;
        };
        output: {
            project: any;
            permissions: any;
            clientName: any;
        };
        meta: object;
    }>;
    createClientComment: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            projectId: string;
            token: string;
            content: string;
            authorEmail: string;
            authorName: string;
            position?: {
                x: number;
                y: number;
            } | undefined;
        };
        output: any;
        meta: object;
    }>;
    submitClientApproval: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            status: "approved" | "rejected" | "revision_requested";
            token: string;
            approvalId: string;
            approverEmail: string;
            approverName: string;
            notes?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
}>>;
