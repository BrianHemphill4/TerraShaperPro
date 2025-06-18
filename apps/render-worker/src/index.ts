import dotenv from 'dotenv';
import { createRenderWorker } from '@terrashaper/queue';
import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import { processRenderJob } from './processors/renderProcessor';
import { startFailureMonitor } from './processors/failureMonitor';
import { connection } from './config/redis';
import { initSentry, captureException } from './lib/sentry';

dotenv.config();

// Initialize Sentry before anything else
initSentry();

const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5');

const worker = createRenderWorker(
  processRenderJob,
  connection,
  concurrency
);

worker.on('completed', (job: any, result: RenderJobResult) => {
  console.log(`✓ Render ${job.id} completed in ${result.processingTime}ms`);
});

worker.on('failed', (job: any, err: Error) => {
  console.error(`✗ Render ${job?.id} failed:`, err.message);
  captureException(err as Error, {
    jobId: job?.id,
    jobData: job?.data,
  });
});

worker.on('progress', (job: any, progress: number) => {
  console.log(`◊ Render ${job.id} progress: ${progress}%`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});

console.log(`🚀 Render Worker started with concurrency: ${concurrency}`);

// Start failure monitoring
startFailureMonitor();