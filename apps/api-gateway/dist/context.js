"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    // Create chainable query builder
    const createQueryBuilder = () => {
        const builder = {
            eq: (_column, _value) => builder,
            neq: (_column, _value) => builder,
            in: (_column, _values) => builder,
            contains: (_column, _value) => builder,
            textSearch: (_column, _query) => builder,
            order: (_column, _options) => builder,
            range: (_from, _to) => builder,
            single: () => Promise.resolve({ data: { id: 'mock-id', jobId: 'mock-job-id' }, error: null }),
            limit: (_count) => builder,
            gte: (_column, _value) => builder,
            not: (_column, _operator, _value) => builder,
            is: (_column, _value) => builder,
            select: (_columns) => builder,
            then: (onfulfilled) => {
                const result = { data: [{ id: 'mock-id' }], error: null, count: 1 };
                return Promise.resolve(onfulfilled ? onfulfilled(result) : result);
            },
        };
        return builder;
    };
    // Mock Supabase client
    const supabase = {
        from: (_table) => ({
            insert: (data) => ({
                select: () => ({
                    single: () => Promise.resolve({ data, error: null }),
                }),
                error: null,
            }),
            update: (data) => ({
                eq: (_column, _value) => Promise.resolve({ data, error: null }),
            }),
            delete: () => createQueryBuilder(),
            select: (_columns, _options) => createQueryBuilder(),
        }),
        rpc: (_functionName, _params) => Promise.resolve({ data: {}, error: null }),
    };
    return {
        session,
        supabase,
    };
}
