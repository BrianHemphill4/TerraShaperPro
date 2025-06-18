'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createContext = createContext;
function createContext(_opts) {
  // For now, we're not using the request or response objects
  // but this is where you would add things like user authentication
  // In a real implementation, you would extract session from JWT/cookies
  // Mock context for development
  const session = {
    userId: 'mock-user-id',
    organizationId: 'mock-org-id',
    subscriptionTier: 'pro',
  };
  // Mock Supabase client
  const supabase = {
    from: (table) => ({
      insert: (data) => ({
        select: () => ({
          single: () => Promise.resolve({ data, error: null }),
        }),
      }),
      update: (data) => ({
        eq: (column, value) => Promise.resolve({ data, error: null }),
      }),
      select: (columns) => ({
        eq: (column, value) => ({
          single: () => Promise.resolve({ data: { jobId: 'mock-job-id' }, error: null }),
        }),
      }),
    }),
  };
  return {
    session,
    supabase,
  };
}
