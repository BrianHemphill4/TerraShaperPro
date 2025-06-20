// import type { RenderJobResult } from '@terrashaper/queue';
import { createRenderWorker } from '@terrashaper/queue';
import dotenv from 'dotenv';

import type { RenderJobResult } from '../../../packages/queue/src/types';
import { connection } from './config/redis';
import { logger } from './lib/logger';
import { captureException, initSentry } from './lib/sentry';
import { workerMetrics } from './lib/metrics';
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
    const queueMetrics = await worker.getQueueMetrics();
    workerMetrics.recordQueueMetrics(
      'render',
      queueMetrics.counts.active + queueMetrics.counts.waiting,
      queueMetrics.counts.waiting,
      queueMetrics.counts.active
    );
  } catch (error) {
    logger.error('Failed to collect queue metrics', error);
  }
}, 30000); // Every 30 seconds
