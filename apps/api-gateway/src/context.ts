import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export type Session = {
  userId: string;
  organizationId: string;
  subscriptionTier: 'starter' | 'pro' | 'growth';
};

export type SupabaseQueryBuilder = {
  eq: (_column: string, _value: any) => SupabaseQueryBuilder;
  single: () => Promise<{ data?: any; error?: any }>;
};

export type SupabaseClient = {
  from: (_table: string) => {
    insert: (data: any) => { select: () => { single: () => Promise<{ data?: any; error?: any }> } };
    update: (data: any) => {
      eq: (_column: string, _value: any) => Promise<{ data?: any; error?: any }>;
    };
    select: (_columns?: string) => SupabaseQueryBuilder;
  };
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
  const createQueryBuilder = (): SupabaseQueryBuilder => ({
    eq: (_column: string, _value: any) => createQueryBuilder(),
    single: () => Promise.resolve({ data: { id: 'mock-id', jobId: 'mock-job-id' }, error: null }),
  });

  // Mock Supabase client
  const supabase: SupabaseClient = {
    from: (_table: string) => ({
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data, error: null }),
        }),
      }),
      update: (data: any) => ({
        eq: (_column: string, _value: any) => Promise.resolve({ data, error: null }),
      }),
      select: (_columns?: string) => createQueryBuilder(),
    }),
  };

  return {
    session,
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
