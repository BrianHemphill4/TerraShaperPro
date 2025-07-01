export declare const billingRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getPlans: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: any;
        meta: object;
    }>;
    getCurrentSubscription: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: import("stripe").Stripe.Subscription;
        meta: object;
    }>;
    createCheckoutSession: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            priceId: string;
            successUrl: string;
            cancelUrl: string;
        };
        output: {
            sessionId: string;
            url: string;
        };
        meta: object;
    }>;
    createPortalSession: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            returnUrl: string;
        };
        output: {
            url: string;
        };
        meta: object;
    }>;
    updateSubscription: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            priceId: string;
            prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
        };
        output: import("stripe").Stripe.Subscription;
        meta: object;
    }>;
    cancelSubscription: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            cancelAtPeriodEnd?: boolean | undefined;
            reason?: string | undefined;
        };
        output: import("stripe").Stripe.Subscription;
        meta: object;
    }>;
    getPaymentMethods: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            id: any;
            type: any;
            brand: any;
            last4: any;
            expMonth: any;
            expYear: any;
            isDefault: any;
        }[];
        meta: object;
    }>;
    addPaymentMethod: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            paymentMethodId: string;
            setAsDefault?: boolean | undefined;
        };
        output: import("stripe").Stripe.PaymentMethod;
        meta: object;
    }>;
    getInvoices: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number;
            offset?: number;
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
            feature?: string;
        };
        output: {
            hasAccess: any;
            feature: string;
        };
        meta: object;
    }>;
    checkUsageLimit: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limitType?: "projects" | "team_members" | "renders" | "storage_gb";
            currentUsage?: number;
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
            limit?: number;
            offset?: number;
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
