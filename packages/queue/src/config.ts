import { ConnectionOptions, QueueOptions } from 'bullmq';

// Parse Upstash Redis URL if provided
function getRedisConnection(): ConnectionOptions {
  const redisHost = process.env.REDIS_HOST;

  // If REDIS_HOST is a URL (Upstash format)
  if (redisHost && redisHost.startsWith('https://')) {
    const url = new URL(redisHost);
    return {
      host: url.hostname,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      tls: {},
      maxRetriesPerRequest: null,
    };
  }

  // Standard Redis connection
  return {
    host: redisHost || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  };
}

export const redisConnection: ConnectionOptions = getRedisConnection();

export const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 24 * 3600, // 24 hours
    },
  },
};

export const QUEUE_NAMES = {
  RENDER: 'renderQueue',
  NOTIFICATION: 'notificationQueue',
} as const;

export const QUEUE_PRIORITIES = {
  STARTER: 5,
  PRO: 3,
  GROWTH: 1,
} as const;
