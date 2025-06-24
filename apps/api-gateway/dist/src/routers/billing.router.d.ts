import { z } from 'zod';
export declare const billingRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    getPlans: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: any;
        meta: object;
    }>;
    getCurrentSubscription: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: any;
        meta: object;
    }>;
    createCheckoutSession: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            priceId: string;
            successUrl: string;
            cancelUrl: string;
        };
        output: {
            sessionId: any;
            url: any;
        };
        meta: object;
    }>;
    createPortalSession: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            returnUrl: string;
        };
        output: {
            url: any;
        };
        meta: object;
    }>;
    updateSubscription: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            priceId: string;
            prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
        };
        output: any;
        meta: object;
    }>;
    cancelSubscription: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            cancelAtPeriodEnd?: boolean | undefined;
            reason?: string | undefined;
        };
        output: any;
        meta: object;
    }>;
    getPaymentMethods: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: any;
        meta: object;
    }>;
    addPaymentMethod: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            paymentMethodId: string;
            setAsDefault?: boolean | undefined;
        };
        output: any;
        meta: object;
    }>;
    getInvoices: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number | undefined;
            offset?: number | undefined;
        };
        output: {
            invoices: any;
            total: any;
            limit: number;
            offset: number;
        };
        meta: object;
    }>;
    getUsageSummary: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            usage: {
                renders: number;
                storage: number;
                apiCalls: number;
            };
            limits: {
                renders: any;
            };
            period: {
                start: string;
                end: string;
            };
        };
        meta: object;
    }>;
    getSubscription: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            organization: any;
            subscription: {
                id: any;
                status: any;
                currentPeriodEnd: any;
                cancelAt: any;
                canceledAt: any;
                tier: any;
                plan: any;
            };
        };
        meta: object;
    }>;
    checkFeature: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            feature: string;
        };
        output: {
            hasAccess: any;
            feature: string;
        };
        meta: object;
    }>;
    checkUsageLimit: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limitType: "projects" | "team_members" | "renders" | "storage_gb";
            currentUsage?: number | undefined;
        };
        output: any;
        meta: object;
    }>;
    getCurrentOverages: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: any;
        meta: object;
    }>;
    getOverageHistory: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number | undefined;
            offset?: number | undefined;
        };
        output: {
            charges: any;
            total: any;
            limit: number;
            offset: number;
        };
        meta: object;
    }>;
}>>;
