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
  order: (_column: string, _options?: { ascending?: boolean }) => SupabaseQueryBuilder;
  range: (_from: number, _to: number) => SupabaseQueryBuilder;
  single: () => Promise<{ data?: any; error?: any }>;
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
      select: () => { single: () => Promise<{ data?: any; error?: any }> };
      error?: any;
    };
    update: (data: any) => SupabaseQueryBuilder;
    delete: () => SupabaseQueryBuilder;
    select: (
      _columns?: string,
      _options?: { count?: 'exact'; head?: boolean }
    ) => SupabaseQueryBuilder;
  };
  rpc: (_functionName: string, _params?: any) => Promise<{ data?: any; error?: any }>;
};

export function createContext(_opts: CreateFastifyContextOptions) {
  // For now, we're not using the request or response objects
  // but this is where you would add things like user authentication
  // In a real implementation, you would extract session from JWT/cookies

  // Mock context for development
  const session: Session = {
    userId: 'mock-user-id',
    organizationId: 'mock-org-id',
    subscriptionTier: 'pro',
  };

  // Create chainable query builder
  const createQueryBuilder = (): SupabaseQueryBuilder => {
    const builder: SupabaseQueryBuilder = {
      eq: (_column: string, _value: any) => builder,
      neq: (_column: string, _value: any) => builder,
      in: (_column: string, _values: any[]) => builder,
      contains: (_column: string, _value: any) => builder,
      textSearch: (_column: string, _query: string) => builder,
      order: (_column: string, _options?: { ascending?: boolean }) => builder,
      range: (_from: number, _to: number) => builder,
      single: () => Promise.resolve({ data: { id: 'mock-id', jobId: 'mock-job-id' }, error: null }),
      limit: (_count: number) => builder,
      gt: (_column: string, _value: any) => builder,
      gte: (_column: string, _value: any) => builder,
      not: (_column: string, _operator: string, _value: any) => builder,
      is: (_column: string, _value: any) => builder,
      select: (_columns?: string) => builder,
      then: (onfulfilled?: (value: any) => any) => {
        const result = { data: [{ id: 'mock-id' }], error: null, count: 1 };
        return Promise.resolve(onfulfilled ? onfulfilled(result) : result);
      },
    };
    return builder;
  };

  // Mock Supabase client
  const supabase: SupabaseClient = {
    from: (_table: string) => ({
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data, error: null }),
        }),
        error: null,
      }),
      update: (_data: any) => createQueryBuilder(),
      delete: () => createQueryBuilder(),
      select: (_columns?: string, _options?: { count?: 'exact'; head?: boolean }) =>
        createQueryBuilder(),
    }),
    rpc: (_functionName: string, _params?: any) => Promise.resolve({ data: {}, error: null }),
  };

  return {
    session,
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
