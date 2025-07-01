export declare const router: import("@trpc/server").TRPCRouterBuilder<{
    ctx: {
        session: import("./context").Session;
        supabase: import("./context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    session: import("./context").Session;
    supabase: import("./context").SupabaseClient;
}, object, {}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const protectedProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    session: import("./context").Session;
    supabase: import("./context").SupabaseClient;
}, object, {}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const authProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    session: import("./context").Session;
    supabase: import("./context").SupabaseClient;
}, object, {}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const renderProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    session: import("./context").Session;
    supabase: import("./context").SupabaseClient;
}, object, {}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
