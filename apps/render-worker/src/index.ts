import type { RenderJobResult } from '@terrashaper/queue';
import { createRenderWorker } from '@terrashaper/queue';
import dotenv from 'dotenv';

import { connection } from './config/redis';
import { logger } from './lib/logger';
import { workerMetrics } from './lib/metrics';
import { captureException, initSentry } from './lib/sentry';
import { startFailureMonitor } from './processors/failureMonitor';
import { processRenderJob } from './processors/renderProcessor';

dotenv.config();

// Initialize Sentry before anything else
initSentry();

const concurrency = Number.parseInt(process.env.WORKER_CONCURRENCY || '5');

const worker = createRenderWorker(processRenderJob, connection, concurrency);

worker.on('completed', (job: any, result: RenderJobResult) => {
  logger.info(`✓ Render ${job.id} completed in ${result.processingTime}ms`);
});

worker.on('failed', (job: any, err: Error) => {
  logger.error(`✗ Render ${job?.id} failed:`, err, {
    jobId: job?.id,
    jobData: job?.data,
  });
  captureException(err as Error, {
    jobId: job?.id,
    jobData: job?.data,
  });
});

worker.on('progress', (job: any, progress: any) => {
  const progressValue = typeof progress === 'object' ? progress.percent || 0 : progress;
  logger.debug(`◊ Render ${job.id} progress: ${progressValue}%`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});

logger.info(`🚀 Render Worker started with concurrency: ${concurrency}`);

// Start failure monitoring
startFailureMonitor();

// Start periodic queue metrics collection
setInterval(async () => {
  try {
    // Use the metrics function from the queue module instead of accessing worker.queue
    const { getRenderQueue } = await import('@terrashaper/queue');
    const queue = getRenderQueue(connection);
    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    const completed = await queue.getCompletedCount();
    const failed = await queue.getFailedCount();

    workerMetrics.recordQueueMetrics('render', waiting + active, waiting, active);

    logger.debug(
      `Queue metrics: waiting=${waiting}, active=${active}, completed=${completed}, failed=${failed}`
    );
  } catch (error) {
    logger.error('Failed to collect queue metrics', error);
  }
}, 30000); // Every 30 seconds
