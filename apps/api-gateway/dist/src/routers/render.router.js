"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRouter = void 0;
const queue_1 = require("@terrashaper/queue");
const server_1 = require("@trpc/server");
const observable_1 = require("@trpc/server/observable");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const usage_limits_1 = require("../middleware/usage-limits");
const trpc_1 = require("../trpc");
const renderSettingsSchema = zod_1.z.object({
    provider: zod_1.z.enum(['google-imagen', 'openai-gpt-image']),
    resolution: zod_1.z.enum(['1024x1024', '2048x2048', '4096x4096']),
    format: zod_1.z.enum(['PNG', 'JPEG']).default('PNG'),
    quality: zod_1.z.number().min(1).max(100).optional(),
});
const annotationSchema = zod_1.z.object({
    type: zod_1.z.enum(['mask', 'assetInstance', 'textLabel']),
    data: zod_1.z.any(),
});
exports.renderRouter = (0, trpc_1.router)({
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string(),
        sceneId: zod_1.z.string(),
        sourceImageUrl: zod_1.z.string().url(),
        maskImageUrl: zod_1.z.string().url().optional(),
        prompt: zod_1.z.object({
            system: zod_1.z.string(),
            user: zod_1.z.string(),
        }),
        annotations: zod_1.z.array(annotationSchema),
        settings: renderSettingsSchema,
    }))
        .mutation(async ({ ctx, input }) => {
        // Check monthly render limit
        await (0, usage_limits_1.checkUsageLimit)(ctx, {
            limitType: 'maxRendersPerMonth',
            customMessage: 'You have reached your monthly render limit. Please upgrade your plan or wait until next month.',
        });
        // Check rate limits
        const canSubmit = await (0, queue_1.canUserSubmitRender)(ctx.session.userId, ctx.session.subscriptionTier);
        if (!canSubmit.allowed) {
            throw new server_1.TRPCError({
                code: 'TOO_MANY_REQUESTS',
                message: canSubmit.reason,
            });
        }
        // Create render record in database
        const renderId = (0, uuid_1.v4)();
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
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create render record',
            });
        }
        // Add job to queue
        const job = await (0, queue_1.addRenderJob)({
            renderId,
            projectId: input.projectId,
            sceneId: input.sceneId,
            userId: ctx.session.userId,
            organizationId: ctx.session.organizationId,
            subscriptionTier: ctx.session.subscriptionTier,
            sourceImageUrl: input.sourceImageUrl,
            maskImageUrl: input.maskImageUrl,
            prompt: input.prompt,
            annotations: input.annotations,
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
    status: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        renderId: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        const { data: render, error } = await ctx.supabase
            .from('renders')
            .select('*')
            .eq('id', input.renderId)
            .eq('userId', ctx.session.userId)
            .single();
        if (error || !render) {
            throw new server_1.TRPCError({
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
    subscribe: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        renderId: zod_1.z.string(),
    }))
        .subscription(({ ctx, input }) => {
        return (0, observable_1.observable)((emit) => {
            const queueEvents = (0, queue_1.getQueueEventEmitter)();
            // Map to store jobId -> renderId mapping
            const jobToRenderMap = new Map();
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
            const progressHandler = (data) => {
                if (jobToRenderMap.get(data.jobId) === input.renderId) {
                    emit.next({ type: 'progress', progress: data.progress });
                    // Update progress in database
                    ctx.supabase
                        .from('renders')
                        .update({ progress: data.progress, updatedAt: new Date().toISOString() })
                        .eq('id', input.renderId);
                }
            };
            const completedHandler = (data) => {
                if (jobToRenderMap.get(data.jobId) === input.renderId) {
                    emit.next({ type: 'completed', result: data.result });
                    emit.complete();
                }
            };
            const failedHandler = (data) => {
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
    metrics: trpc_1.protectedProcedure.query(async () => {
        const metrics = await (0, queue_1.getQueueMetrics)();
        return metrics;
    }),
    retry: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        renderId: zod_1.z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        // Get the original render
        const { data: render, error } = await ctx.supabase
            .from('renders')
            .select('*')
            .eq('id', input.renderId)
            .eq('userId', ctx.session.userId)
            .single();
        if (error || !render || render.status !== 'failed') {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Cannot retry this render',
            });
        }
        // Create a new render with the same settings
        const newRenderId = (0, uuid_1.v4)();
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
        const job = await (0, queue_1.addRenderJob)({
            renderId: newRenderId,
            projectId: render.projectId,
            sceneId: render.sceneId,
            userId: ctx.session.userId,
            organizationId: ctx.session.organizationId,
            subscriptionTier: ctx.session.subscriptionTier,
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
