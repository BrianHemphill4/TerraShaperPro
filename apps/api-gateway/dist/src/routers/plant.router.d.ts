export declare const plantRouter: import("@trpc/server").TRPCBuiltRouter<{
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
            limit?: number;
            offset?: number;
            filters?: {
                search?: string;
                category?: string;
                sunRequirements?: ("full_sun" | "partial_sun" | "shade")[];
                waterNeeds?: ("low" | "moderate" | "high")[];
                usdaZones?: string[];
                texasNative?: boolean;
                droughtTolerant?: boolean;
                tags?: string[];
                favoritesOnly?: boolean;
            };
            sortBy?: "category" | "name" | "scientific" | "water" | "sun";
            sortOrder?: "asc" | "desc";
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
            id?: string;
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
            plantId?: string;
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
