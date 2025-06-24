import {
  addRenderJob,
  canUserSubmitRender,
  getQueueEventEmitter,
  getQueueMetrics,
} from '@terrashaper/queue';
import { TRPCError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { checkUsageLimit } from '../middleware/usage-limits';
import { protectedProcedure, router } from '../trpc';

const renderSettingsSchema = z.object({
  provider: z.enum(['google-imagen', 'openai-gpt-image']),
  resolution: z.enum(['1024x1024', '2048x2048', '4096x4096']),
  format: z.enum(['PNG', 'JPEG']).default('PNG'),
  quality: z.number().min(1).max(100).optional(),
});

const annotationSchema = z.object({
  type: z.enum(['mask', 'assetInstance', 'textLabel']),
  data: z.any(),
});

export const renderRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        sceneId: z.string(),
        sourceImageUrl: z.string().url(),
        maskImageUrl: z.string().url().optional(),
        prompt: z.object({
          system: z.string(),
          user: z.string(),
        }),
        annotations: z.array(annotationSchema),
        settings: renderSettingsSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check monthly render limit
      await checkUsageLimit(ctx, {
        limitType: 'maxRendersPerMonth',
        customMessage:
          'You have reached your monthly render limit. Please upgrade your plan or wait until next month.',
      });

      // Check rate limits
      const canSubmit = await canUserSubmitRender(
        ctx.session.userId,
        ctx.session.subscriptionTier as 'starter' | 'pro' | 'growth'
      );

      if (!canSubmit.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: canSubmit.reason,
        });
      }

      // Create render record in database
      const renderId = uuidv4();
      const now = new Date().toISOString();

      const { error } = await ctx.supabase
        .from('renders')
        .insert({
          id: renderId,
          projectId: input.projectId,
          sceneId: input.sceneId,
          userId: ctx.session.userId,
          organizationId: ctx.session.organizationId,
          status: 'queued',
          provider: input.settings.provider,
          prompt: input.prompt.user,
          systemPrompt: input.prompt.system,
          annotations: input.annotations,
          settings: input.settings,
          sourceImageUrl: input.sourceImageUrl,
          maskImageUrl: input.maskImageUrl,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create render record',
        });
      }

      // Add job to queue
      const job = await addRenderJob({
        renderId,
        projectId: input.projectId,
        sceneId: input.sceneId,
        userId: ctx.session.userId,
        organizationId: ctx.session.organizationId,
        subscriptionTier: ctx.session.subscriptionTier as 'starter' | 'pro' | 'growth',
        sourceImageUrl: input.sourceImageUrl,
        maskImageUrl: input.maskImageUrl,
        prompt: input.prompt,
        annotations: input.annotations as Array<{
          type: 'mask' | 'assetInstance' | 'textLabel';
          data: any;
        }>,
        settings: input.settings,
      });

      // Update render with jobId
      await ctx.supabase.from('renders').update({ jobId: job.id }).eq('id', renderId);

      return {
        renderId,
        jobId: job.id,
        status: 'queued',
      };
    }),

  status: protectedProcedure
    .input(
      z.object({
        renderId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: render, error } = await ctx.supabase
        .from('renders')
        .select('*')
        .eq('id', input.renderId)
        .eq('userId', ctx.session.userId)
        .single();

      if (error || !render) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Render not found',
        });
      }

      return {
        renderId: render.id,
        status: render.status,
        progress: render.progress || 0,
        imageUrl: render.imageUrl,
        thumbnailUrl: render.thumbnailUrl,
        error: render.error,
        metadata: render.metadata,
      };
    }),

  // Server-sent events for real-time progress
  subscribe: protectedProcedure
    .input(
      z.object({
        renderId: z.string(),
      })
    )
    .subscription(({ ctx, input }) => {
      return observable<{
        type: 'progress' | 'completed' | 'failed' | 'ping';
        progress?: number;
        result?: any;
        error?: string;
      }>((emit) => {
        const queueEvents = getQueueEventEmitter();

        // Map to store jobId -> renderId mapping
        const jobToRenderMap = new Map<string, string>();

        // Look up the job for this render
        ctx.supabase
          .from('renders')
          .select('jobId')
          .eq('id', input.renderId)
          .single()
          .then(({ data }) => {
            if (data?.jobId) {
              jobToRenderMap.set(data.jobId, input.renderId);
            }
          });

        // Set up event listeners
        const progressHandler = (data: { jobId: string; progress: number }) => {
          if (jobToRenderMap.get(data.jobId) === input.renderId) {
            emit.next({ type: 'progress', progress: data.progress });

            // Update progress in database
            ctx.supabase
              .from('renders')
              .update({ progress: data.progress, updatedAt: new Date().toISOString() })
              .eq('id', input.renderId);
          }
        };

        const completedHandler = (data: { jobId: string; result: any }) => {
          if (jobToRenderMap.get(data.jobId) === input.renderId) {
            emit.next({ type: 'completed', result: data.result });
            emit.complete();
          }
        };

        const failedHandler = (data: { jobId: string; error: Error }) => {
          if (jobToRenderMap.get(data.jobId) === input.renderId) {
            emit.next({ type: 'failed', error: data.error.message });
            emit.complete();
          }
        };

        queueEvents.on('progress', progressHandler);
        queueEvents.on('completed', completedHandler);
        queueEvents.on('failed', failedHandler);

        // Send periodic pings to keep connection alive
        const pingInterval = setInterval(() => {
          emit.next({ type: 'ping' });
        }, 30000);

        // Cleanup function
        return () => {
          clearInterval(pingInterval);
          queueEvents.off('progress', progressHandler);
          queueEvents.off('completed', completedHandler);
          queueEvents.off('failed', failedHandler);
        };
      });
    }),

  metrics: protectedProcedure.query(async () => {
    const metrics = await getQueueMetrics();
    return metrics;
  }),

  retry: protectedProcedure
    .input(
      z.object({
        renderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the original render
      const { data: render, error } = await ctx.supabase
        .from('renders')
        .select('*')
        .eq('id', input.renderId)
        .eq('userId', ctx.session.userId)
        .single();

      if (error || !render || render.status !== 'failed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot retry this render',
        });
      }

      // Create a new render with the same settings
      const newRenderId = uuidv4();
      const now = new Date().toISOString();

      await ctx.supabase.from('renders').insert({
        id: newRenderId,
        projectId: render.projectId,
        sceneId: render.sceneId,
        userId: ctx.session.userId,
        organizationId: ctx.session.organizationId,
        status: 'queued',
        provider: render.provider,
        prompt: render.prompt,
        systemPrompt: render.systemPrompt,
        annotations: render.annotations,
        settings: render.settings,
        sourceImageUrl: render.sourceImageUrl,
        maskImageUrl: render.maskImageUrl,
        createdAt: now,
        updatedAt: now,
      });

      // Add new job to queue
      const job = await addRenderJob({
        renderId: newRenderId,
        projectId: render.projectId,
        sceneId: render.sceneId,
        userId: ctx.session.userId,
        organizationId: ctx.session.organizationId,
        subscriptionTier: ctx.session.subscriptionTier as 'starter' | 'pro' | 'growth',
        sourceImageUrl: render.sourceImageUrl,
        maskImageUrl: render.maskImageUrl,
        prompt: render.prompt,
        annotations: render.annotations,
        settings: render.settings,
      });

      await ctx.supabase.from('renders').update({ jobId: job.id }).eq('id', newRenderId);

      return {
        renderId: newRenderId,
        jobId: job.id,
        status: 'queued',
      };
    }),
});
