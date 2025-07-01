"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
process.env.CLERK_SECRET_KEY = 'sk_test_123';
process.env.SENTRY_DSN = '';
process.env.METRICS_ENABLED = 'false';
// Mock external services
vitest_1.vi.mock('@clerk/nextjs/server', () => ({
    getAuth: vitest_1.vi.fn().mockResolvedValue({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        orgId: 'test-org-id',
    }),
}));
vitest_1.vi.mock('@sentry/node', () => ({
    init: vitest_1.vi.fn(),
    captureException: vitest_1.vi.fn(),
    captureMessage: vitest_1.vi.fn(),
    captureEvent: vitest_1.vi.fn(),
    withScope: vitest_1.vi.fn((cb) => cb({ setContext: vitest_1.vi.fn() })),
    setTag: vitest_1.vi.fn(),
    setContext: vitest_1.vi.fn(),
    configureScope: vitest_1.vi.fn(),
    startSpan: vitest_1.vi.fn((options, callback) => callback ? callback() : { finish: vitest_1.vi.fn() }),
    getCurrentScope: vitest_1.vi.fn(() => ({
        setTag: vitest_1.vi.fn(),
        setContext: vitest_1.vi.fn(),
        setUser: vitest_1.vi.fn(),
    })),
    Integrations: {},
    ProfilingIntegration: vitest_1.vi.fn(),
}));
// Mock Supabase client
vitest_1.vi.mock('@terrashaper/db', () => ({
    supabase: {
        from: vitest_1.vi.fn((_table) => ({
            select: vitest_1.vi.fn().mockReturnThis(),
            insert: vitest_1.vi.fn().mockReturnThis(),
            update: vitest_1.vi.fn().mockReturnThis(),
            delete: vitest_1.vi.fn().mockReturnThis(),
            eq: vitest_1.vi.fn().mockReturnThis(),
            neq: vitest_1.vi.fn().mockReturnThis(),
            in: vitest_1.vi.fn().mockReturnThis(),
            gte: vitest_1.vi.fn().mockReturnThis(),
            lte: vitest_1.vi.fn().mockReturnThis(),
            order: vitest_1.vi.fn().mockReturnThis(),
            limit: vitest_1.vi.fn().mockReturnThis(),
            single: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
            execute: vitest_1.vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
        rpc: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    db: {
        selectFrom: vitest_1.vi.fn().mockReturnThis(),
        insertInto: vitest_1.vi.fn().mockReturnThis(),
        updateTable: vitest_1.vi.fn().mockReturnThis(),
        deleteFrom: vitest_1.vi.fn().mockReturnThis(),
        where: vitest_1.vi.fn().mockReturnThis(),
        values: vitest_1.vi.fn().mockReturnThis(),
        set: vitest_1.vi.fn().mockReturnThis(),
        returningAll: vitest_1.vi.fn().mockReturnThis(),
        executeTakeFirst: vitest_1.vi.fn().mockResolvedValue(null),
        executeTakeFirstOrThrow: vitest_1.vi.fn().mockResolvedValue({}),
        execute: vitest_1.vi.fn().mockResolvedValue([]),
    },
}));
// Mock queue completely - prevent Redis connection
vitest_1.vi.mock('@terrashaper/queue', () => ({
    getRenderQueue: vitest_1.vi.fn(() => ({
        add: vitest_1.vi.fn().mockResolvedValue({ id: 'test-job-id' }),
        getJob: vitest_1.vi.fn().mockResolvedValue(null),
        getJobs: vitest_1.vi.fn().mockResolvedValue([]),
        close: vitest_1.vi.fn(),
    })),
    QUEUE_NAMES: {
        RENDER: 'render',
    },
    defaultQueueOptions: {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    },
}));
// Mock ioredis to prevent connection attempts
vitest_1.vi.mock('ioredis', () => {
    const mockRedis = vitest_1.vi.fn().mockImplementation(() => ({
        connect: vitest_1.vi.fn(),
        disconnect: vitest_1.vi.fn(),
        on: vitest_1.vi.fn(),
        off: vitest_1.vi.fn(),
        quit: vitest_1.vi.fn(),
        zremrangebyscore: vitest_1.vi.fn().mockResolvedValue(0),
        zcard: vitest_1.vi.fn().mockResolvedValue(0),
        get: vitest_1.vi.fn().mockResolvedValue(null),
        setex: vitest_1.vi.fn().mockResolvedValue('OK'),
        zadd: vitest_1.vi.fn().mockResolvedValue(1),
        expire: vitest_1.vi.fn().mockResolvedValue(1),
        del: vitest_1.vi.fn().mockResolvedValue(1),
    }));
    return {
        default: mockRedis,
        Redis: mockRedis,
    };
});
// Mock storage
vitest_1.vi.mock('@terrashaper/storage', () => ({
    StorageService: vitest_1.vi.fn().mockImplementation(() => ({
        uploadFile: vitest_1.vi.fn().mockResolvedValue({
            url: 'https://storage.test/file.png',
            key: 'test-key',
            size: 1024,
        }),
        deleteFile: vitest_1.vi.fn().mockResolvedValue(undefined),
        getSignedUrl: vitest_1.vi.fn().mockResolvedValue('https://storage.test/signed-url'),
    })),
}));
// Mock Stripe services
vitest_1.vi.mock('@terrashaper/stripe', () => ({
    CustomerService: vitest_1.vi.fn().mockImplementation(() => ({
        createCustomer: vitest_1.vi.fn().mockResolvedValue({ id: 'cus_test' }),
        getCustomer: vitest_1.vi.fn().mockResolvedValue({ id: 'cus_test' }),
    })),
    SubscriptionService: vitest_1.vi.fn().mockImplementation(() => ({
        createSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        getSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        updateSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        cancelSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
    })),
    PaymentService: vitest_1.vi.fn().mockImplementation(() => ({
        createPaymentIntent: vitest_1.vi.fn().mockResolvedValue({ id: 'pi_test' }),
    })),
    InvoiceService: vitest_1.vi.fn().mockImplementation(() => ({
        listInvoices: vitest_1.vi.fn().mockResolvedValue([]),
    })),
    PortalService: vitest_1.vi.fn().mockImplementation(() => ({
        createSession: vitest_1.vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
    })),
}));
// Mock the metrics module
vitest_1.vi.mock('../lib/metrics', () => ({
    apiMetrics: {
        recordTrpcCall: vitest_1.vi.fn(),
        recordHttpRequest: vitest_1.vi.fn(),
        recordDatabaseQuery: vitest_1.vi.fn(),
        recordCacheOperation: vitest_1.vi.fn(),
        recordApiCall: vitest_1.vi.fn(),
        recordBusinessMetric: vitest_1.vi.fn(),
        flushMetrics: vitest_1.vi.fn(),
        destroy: vitest_1.vi.fn(),
    },
    ApiMetrics: {
        getInstance: vitest_1.vi.fn(() => ({
            recordHttpRequest: vitest_1.vi.fn(),
            recordDatabaseQuery: vitest_1.vi.fn(),
            recordCacheOperation: vitest_1.vi.fn(),
            recordApiCall: vitest_1.vi.fn(),
            recordBusinessMetric: vitest_1.vi.fn(),
            recordTrpcCall: vitest_1.vi.fn(),
            flushMetrics: vitest_1.vi.fn(),
            destroy: vitest_1.vi.fn(),
        })),
    },
    metricsMiddleware: vitest_1.vi.fn(() => (req, res, next) => next()),
}));
// Mock shared services
vitest_1.vi.mock('@terrashaper/shared', () => ({
    sceneService: {
        createScene: vitest_1.vi.fn(),
        updateScene: vitest_1.vi.fn(),
        deleteScene: vitest_1.vi.fn(),
        getSceneById: vitest_1.vi.fn(),
        getScenesByProject: vitest_1.vi.fn(),
        reorderScenes: vitest_1.vi.fn(),
    },
    maskService: {
        saveMasks: vitest_1.vi.fn(),
        getMasksByScene: vitest_1.vi.fn(),
        getMaskHistory: vitest_1.vi.fn(),
        exportMasks: vitest_1.vi.fn(),
    },
    quotaService: {
        checkQuota: vitest_1.vi.fn(),
        incrementUsage: vitest_1.vi.fn(),
        resetQuota: vitest_1.vi.fn(),
    },
}));
// Enhanced storage mock  
vitest_1.vi.mock('@terrashaper/storage', () => ({
    StorageService: vitest_1.vi.fn().mockImplementation(() => ({
        uploadFile: vitest_1.vi.fn().mockResolvedValue({
            url: 'https://storage.test/file.png',
            key: 'test-key',
            size: 1024,
        }),
        deleteFile: vitest_1.vi.fn().mockResolvedValue(undefined),
        getSignedUrl: vitest_1.vi.fn().mockResolvedValue('https://storage.test/signed-url'),
        getUsage: vitest_1.vi.fn().mockResolvedValue({
            used: 100,
            total: 1000,
            remaining: 900,
        }),
    })),
    storageService: {
        uploadFile: vitest_1.vi.fn().mockResolvedValue({
            url: 'https://storage.test/file.png',
            key: 'test-key',
            size: 1024,
        }),
        deleteFile: vitest_1.vi.fn().mockResolvedValue(undefined),
        getSignedUrl: vitest_1.vi.fn().mockResolvedValue('https://storage.test/signed-url'),
        getUsage: vitest_1.vi.fn().mockResolvedValue({
            used: 100,
            total: 1000,
            remaining: 900,
        }),
    },
}));
// Enhanced Stripe mock
vitest_1.vi.mock('@terrashaper/stripe', () => ({
    CustomerService: vitest_1.vi.fn().mockImplementation(() => ({
        createCustomer: vitest_1.vi.fn().mockResolvedValue({ id: 'cus_test' }),
        getCustomer: vitest_1.vi.fn().mockResolvedValue({ id: 'cus_test' }),
    })),
    SubscriptionService: vitest_1.vi.fn().mockImplementation(() => ({
        createSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        getSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        updateSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        cancelSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        getCurrentPlan: vitest_1.vi.fn().mockResolvedValue({
            maxProjects: 10,
            maxTeamMembers: 5,
            renderCreditsMonthly: 100,
        }),
    })),
    subscriptionService: {
        createSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        getSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        updateSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        cancelSubscription: vitest_1.vi.fn().mockResolvedValue({ id: 'sub_test' }),
        getCurrentPlan: vitest_1.vi.fn().mockResolvedValue({
            maxProjects: 10,
            maxTeamMembers: 5,
            renderCreditsMonthly: 100,
        }),
    },
    PaymentService: vitest_1.vi.fn().mockImplementation(() => ({
        createPaymentIntent: vitest_1.vi.fn().mockResolvedValue({ id: 'pi_test' }),
    })),
    InvoiceService: vitest_1.vi.fn().mockImplementation(() => ({
        listInvoices: vitest_1.vi.fn().mockResolvedValue([]),
    })),
    PortalService: vitest_1.vi.fn().mockImplementation(() => ({
        createSession: vitest_1.vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
    })),
}));
(0, vitest_1.afterAll)(() => {
    // Clear all timers
    vitest_1.vi.clearAllTimers();
    // Clear all mocks
    vitest_1.vi.clearAllMocks();
});
