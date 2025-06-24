import { Queue, Worker, QueueEvents, Job, ConnectionOptions } from 'bullmq';
import { RenderJobData, RenderJobResult } from '../types';
import { QUEUE_NAMES, QUEUE_PRIORITIES, defaultQueueOptions } from '../config';

let renderQueue: Queue<RenderJobData, RenderJobResult> | null = null;
let renderQueueEvents: QueueEvents | null = null;

export function getRenderQueue(
  connection?: ConnectionOptions
): Queue<RenderJobData, RenderJobResult> {
  if (!renderQueue) {
    renderQueue = new Queue<RenderJobData, RenderJobResult>(QUEUE_NAMES.RENDER, {
      ...defaultQueueOptions,
      ...(connection && { connection }),
    });
  }
  return renderQueue;
}

export function getRenderQueueEvents(connection?: ConnectionOptions): QueueEvents {
  if (!renderQueueEvents) {
    renderQueueEvents = new QueueEvents(QUEUE_NAMES.RENDER, {
      connection: connection || defaultQueueOptions.connection,
    });
  }
  return renderQueueEvents;
}

export async function addRenderJob(
  data: RenderJobData,
  options?: {
    priority?: number;
    delay?: number;
  }
): Promise<Job<RenderJobData, RenderJobResult>> {
  const queue = getRenderQueue();

  // Set priority based on subscription tier
  const priority =
    options?.priority ??
    QUEUE_PRIORITIES[data.subscriptionTier.toUpperCase() as keyof typeof QUEUE_PRIORITIES];

  return queue.add('render', data, {
    priority,
    delay: options?.delay,
  });
}

export function createRenderWorker(
  processFunction: (job: Job<RenderJobData>) => Promise<RenderJobResult>,
  connection?: ConnectionOptions,
  concurrency = 5
): Worker<RenderJobData, RenderJobResult> {
  return new Worker<RenderJobData, RenderJobResult>(QUEUE_NAMES.RENDER, processFunction, {
    connection: connection || defaultQueueOptions.connection,
    concurrency,
    autorun: true,
  });
}

// Rate limiting helpers
export async function getRenderJobCount(userId: string, windowMs = 60000): Promise<number> {
  const queue = getRenderQueue();
  const jobs = await queue.getJobs(['active', 'waiting', 'delayed']);
  const cutoff = Date.now() - windowMs;

  return jobs.filter((job) => job.data.userId === userId && (job.timestamp || 0) > cutoff).length;
}

export async function canUserSubmitRender(
  userId: string,
  subscriptionTier: 'starter' | 'pro' | 'growth'
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = {
    starter: { perMinute: 2, perHour: 20 },
    pro: { perMinute: 10, perHour: 100 },
    growth: { perMinute: 20, perHour: 300 },
  };

  const limit = limits[subscriptionTier];
  const minuteCount = await getRenderJobCount(userId, 60000);
  const hourCount = await getRenderJobCount(userId, 3600000);

  if (minuteCount >= limit.perMinute) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${limit.perMinute} renders per minute`,
    };
  }

  if (hourCount >= limit.perHour) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${limit.perHour} renders per hour`,
    };
  }

  return { allowed: true };
}

// Queue metrics
export async function getQueueMetrics() {
  const queue = getRenderQueue();

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  // BullMQ doesn't have getPausedCount in newer versions
  const paused = 0;

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    paused,
    total: waiting + active + delayed + paused,
  };
}

// Cleanup on shutdown
export async function closeRenderQueue() {
  if (renderQueue) {
    await renderQueue.close();
    renderQueue = null;
  }
  if (renderQueueEvents) {
    await renderQueueEvents.close();
    renderQueueEvents = null;
  }
}
