import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
export type Session = {
    userId: string;
    organizationId: string;
    subscriptionTier: 'starter' | 'pro' | 'growth';
};
export type SupabaseQueryBuilder = {
    eq: (_column: string, _value: any) => SupabaseQueryBuilder;
    neq: (_column: string, _value: any) => SupabaseQueryBuilder;
    in: (_column: string, _values: any[]) => SupabaseQueryBuilder;
    contains: (_column: string, _value: any) => SupabaseQueryBuilder;
    textSearch: (_column: string, _query: string) => SupabaseQueryBuilder;
    order: (_column: string, _options?: {
        ascending?: boolean;
    }) => SupabaseQueryBuilder;
    range: (_from: number, _to: number) => SupabaseQueryBuilder;
    single: () => Promise<{
        data?: any;
        error?: any;
    }>;
    limit: (_count: number) => SupabaseQueryBuilder;
    gt: (_column: string, _value: any) => SupabaseQueryBuilder;
    gte: (_column: string, _value: any) => SupabaseQueryBuilder;
    not: (_column: string, _operator: string, _value: any) => SupabaseQueryBuilder;
    is: (_column: string, _value: any) => SupabaseQueryBuilder;
    select: (_columns?: string) => SupabaseQueryBuilder;
    then: (onfulfilled?: (value: any) => any) => Promise<any>;
};
export type SupabaseClient = {
    from: (_table: string) => {
        insert: (data: any) => {
            select: () => {
                single: () => Promise<{
                    data?: any;
                    error?: any;
                }>;
            };
            error?: any;
        };
        update: (data: any) => SupabaseQueryBuilder;
        delete: () => SupabaseQueryBuilder;
        select: (_columns?: string, _options?: {
            count?: 'exact';
            head?: boolean;
        }) => SupabaseQueryBuilder;
    };
    rpc: (_functionName: string, _params?: any) => Promise<{
        data?: any;
        error?: any;
    }>;
};
export declare function createContext(_opts: CreateFastifyContextOptions): {
    session: Session;
    supabase: SupabaseClient;
};
export type Context = Awaited<ReturnType<typeof createContext>>;
