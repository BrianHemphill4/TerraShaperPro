import type { RenderJobData, RenderJobResult } from '@terrashaper/queue';
import type { Job } from 'bullmq';

import { RenderCoordinator } from '../services/RenderCoordinator';

const renderCoordinator = new RenderCoordinator();

export async function processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  return renderCoordinator.processRenderJob(job);
}
