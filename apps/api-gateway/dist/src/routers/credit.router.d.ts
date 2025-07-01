export declare const creditRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("../context").Session;
        supabase: import("../context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    balance: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            balance: any;
        };
        meta: object;
    }>;
    transactions: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number;
            offset?: number;
        };
        output: {
            transactions: any;
            total: any;
            hasMore: boolean;
        };
        meta: object;
    }>;
    usage: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            period?: "day" | "week" | "month" | "year";
        };
        output: {
            chartData: {
                date: string;
                credits: number;
            }[];
            totalUsed: any;
            period: "day" | "week" | "month" | "year";
        };
        meta: object;
    }>;
    packages: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            packages: any;
        };
        meta: object;
    }>;
}>>;
