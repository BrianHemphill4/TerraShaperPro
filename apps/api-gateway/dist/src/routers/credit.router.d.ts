import { z } from 'zod';
export declare const creditRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    balance: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            balance: any;
        };
        meta: object;
    }>;
    transactions: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            limit?: number | undefined;
            offset?: number | undefined;
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
            period?: "day" | "week" | "month" | "year" | undefined;
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
