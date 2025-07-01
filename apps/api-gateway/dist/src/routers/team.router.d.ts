export declare const teamRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    listMembers: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number;
            offset?: number;
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
            role: "admin" | "member" | "owner" | "designer" | "viewer";
        };
        output: any;
        meta: object;
    }>;
    listInvitations: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number;
            offset?: number;
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
            invitationId?: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    updateUserRole: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            role: "admin" | "member" | "owner" | "designer" | "viewer";
            userId: string;
        };
        output: any;
        meta: object;
    }>;
    removeUser: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId?: string;
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    getActivityLogs: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number;
            offset?: number;
            userId?: string;
            action?: string;
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
