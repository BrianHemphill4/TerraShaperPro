import { afterAll,vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
process.env.CLERK_SECRET_KEY = 'sk_test_123';
process.env.SENTRY_DSN = '';
process.env.METRICS_ENABLED = 'false';

// Mock external services
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn().mockResolvedValue({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    orgId: 'test-org-id',
  }),
}));

vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  captureEvent: vi.fn(),
  withScope: vi.fn((cb) => cb({ setContext: vi.fn() })),
  setTag: vi.fn(),
  setContext: vi.fn(),
  configureScope: vi.fn(),
  startSpan: vi.fn((options, callback) => callback ? callback() : { finish: vi.fn() }),
  getCurrentScope: vi.fn(() => ({
    setTag: vi.fn(),
    setContext: vi.fn(),
    setUser: vi.fn(),
  })),
  Integrations: {},
  ProfilingIntegration: vi.fn(),
}));

// Mock Supabase client
vi.mock('@terrashaper/db', () => ({
  supabase: {
    from: vi.fn((_table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      execute: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
  db: {
    selectFrom: vi.fn().mockReturnThis(),
    insertInto: vi.fn().mockReturnThis(),
    updateTable: vi.fn().mockReturnThis(),
    deleteFrom: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returningAll: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn().mockResolvedValue(null),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue({}),
    execute: vi.fn().mockResolvedValue([]),
  },
}));

// Mock queue completely - prevent Redis connection
vi.mock('@terrashaper/queue', () => ({
  getRenderQueue: vi.fn(() => ({
    add: vi.fn().mockResolvedValue({ id: 'test-job-id' }),
    getJob: vi.fn().mockResolvedValue(null),
    getJobs: vi.fn().mockResolvedValue([]),
    close: vi.fn(),
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
vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    quit: vi.fn(),
    zremrangebyscore: vi.fn().mockResolvedValue(0),
    zcard: vi.fn().mockResolvedValue(0),
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    zadd: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    del: vi.fn().mockResolvedValue(1),
  })),
}));

// Mock storage
vi.mock('@terrashaper/storage', () => ({
  StorageService: vi.fn().mockImplementation(() => ({
    uploadFile: vi.fn().mockResolvedValue({
      url: 'https://storage.test/file.png',
      key: 'test-key',
      size: 1024,
    }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    getSignedUrl: vi.fn().mockResolvedValue('https://storage.test/signed-url'),
  })),
}));

// Mock Stripe services
vi.mock('@terrashaper/stripe', () => ({
  CustomerService: vi.fn().mockImplementation(() => ({
    createCustomer: vi.fn().mockResolvedValue({ id: 'cus_test' }),
    getCustomer: vi.fn().mockResolvedValue({ id: 'cus_test' }),
  })),
  SubscriptionService: vi.fn().mockImplementation(() => ({
    createSubscription: vi.fn().mockResolvedValue({ id: 'sub_test' }),
    getSubscription: vi.fn().mockResolvedValue({ id: 'sub_test' }),
    updateSubscription: vi.fn().mockResolvedValue({ id: 'sub_test' }),
    cancelSubscription: vi.fn().mockResolvedValue({ id: 'sub_test' }),
  })),
  PaymentService: vi.fn().mockImplementation(() => ({
    createPaymentIntent: vi.fn().mockResolvedValue({ id: 'pi_test' }),
  })),
  InvoiceService: vi.fn().mockImplementation(() => ({
    listInvoices: vi.fn().mockResolvedValue([]),
  })),
  PortalService: vi.fn().mockImplementation(() => ({
    createSession: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
  })),
}));

// Mock the metrics module
vi.mock('../lib/metrics', () => ({
  ApiMetrics: {
    getInstance: vi.fn(() => ({
      recordHttpRequest: vi.fn(),
      recordDatabaseQuery: vi.fn(),
      recordCacheOperation: vi.fn(),
      recordApiCall: vi.fn(),
      recordBusinessMetric: vi.fn(),
      flushMetrics: vi.fn(),
      destroy: vi.fn(),
    })),
  },
  metricsMiddleware: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

afterAll(() => {
  // Clear all timers
  vi.clearAllTimers();
  // Clear all mocks
  vi.clearAllMocks();
});