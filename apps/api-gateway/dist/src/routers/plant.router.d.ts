import { z } from 'zod';
export declare const plantRouter: import("@trpc/server").TRPCBuiltRouter<{
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
            limit?: number | undefined;
            offset?: number | undefined;
            filters?: {
                tags?: string[] | undefined;
                search?: string | undefined;
                category?: string | undefined;
                sunRequirements?: ("full_sun" | "partial_sun" | "shade")[] | undefined;
                waterNeeds?: ("low" | "moderate" | "high")[] | undefined;
                usdaZones?: string[] | undefined;
                texasNative?: boolean | undefined;
                droughtTolerant?: boolean | undefined;
                favoritesOnly?: boolean | undefined;
            } | undefined;
            sortBy?: "name" | "category" | "scientific" | "water" | "sun" | undefined;
            sortOrder?: "asc" | "desc" | undefined;
        };
        output: {
            plants: any;
            total: any;
            hasMore: boolean;
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
    categories: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            name: string;
            count: number;
        }[];
        meta: object;
    }>;
    toggleFavorite: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            plantId: string;
        };
        output: {
            isFavorite: boolean;
        };
        meta: object;
    }>;
    favorites: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            plants: any;
        };
        meta: object;
    }>;
}>>;
