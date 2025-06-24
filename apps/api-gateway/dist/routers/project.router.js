"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const shared_1 = require("@terrashaper/shared");
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const usage_limits_1 = require("../middleware/usage-limits");
const trpc_1 = require("../trpc");
exports.projectRouter = (0, trpc_1.router)({
    list: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.enum(['recent', 'name', 'status']).default('recent'),
        filterStatus: zod_1.z.enum(['all', 'active', 'completed', 'archived']).default('all'),
        limit: zod_1.z.number().min(1).max(100).default(20),
        offset: zod_1.z.number().min(0).default(0),
    }))
        .query(async ({ ctx, input }) => {
        let query = ctx.supabase.from('projects').select('*');
        // Search by text
        if (input.search) {
            query = query.textSearch('search_vector', input.search);
        }
        // Filter by status
        if (input.filterStatus !== 'all') {
            query = query.eq('status', input.filterStatus);
        }
        // Sorting
        if (input.sortBy === 'recent') {
            query = query.order('updated_at', { ascending: false });
        }
        else if (input.sortBy === 'name') {
            query = query.order('name', { ascending: true });
        }
        else if (input.sortBy === 'status') {
            query = query.order('status', { ascending: true });
        }
        // Pagination
        query = query.range(input.offset, input.offset + input.limit - 1);
        const { data: projects, error } = await query;
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch projects',
            });
        }
        // Total count
        const { count } = await ctx.supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });
        return {
            projects: projects || [],
            total: count || 0,
            hasMore: (count || 0) > input.offset + input.limit,
        };
    }),
    stats: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        // Helper to fetch count by status
        const countByStatus = async (status) => {
            let q = ctx.supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', ctx.session.organizationId);
            if (status) {
                q = q.eq('status', status);
            }
            const { count } = await q;
            return count || 0;
        };
        const [total, active, completed, archived] = await Promise.all([
            countByStatus(),
            countByStatus('active'),
            countByStatus('completed'),
            countByStatus('archived'),
        ]);
        return {
            totalProjects: total,
            activeProjects: active,
            completedProjects: completed,
            archivedProjects: archived,
        };
    }),
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string().uuid() }))
        .query(async ({ ctx, input }) => {
        const { data: project, error } = await ctx.supabase
            .from('projects')
            .select('*')
            .eq('id', input.id)
            .single();
        if (error || !project) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }
        return project;
    }),
    create: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        client_name: zod_1.z.string().optional(),
        client_email: zod_1.z.string().email().optional(),
        canvas_data: zod_1.z.record(zod_1.z.any()).optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        // Check project limit before creating
        await (0, usage_limits_1.checkUsageLimit)(ctx, {
            limitType: 'maxProjects',
            customMessage: 'You have reached your project limit. Please upgrade your plan to create more projects.',
        });
        const { data: project, error } = await ctx.supabase
            .from('projects')
            .insert({
            organization_id: ctx.session.organizationId,
            created_by: ctx.session.userId,
            ...input,
            status: 'active',
        })
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create project',
            });
        }
        // Log activity
        await ctx.supabase.from('activity_logs').insert({
            organization_id: ctx.session.organizationId,
            user_id: ctx.session.userId,
            action: shared_1.ActivityActions.PROJECT_CREATED,
            entity_type: 'project',
            entity_id: project.id,
            metadata: { project_name: project.name },
        });
        return project;
    }),
    update: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1).max(255).optional(),
        description: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        client_name: zod_1.z.string().optional(),
        client_email: zod_1.z.string().email().optional(),
        canvas_data: zod_1.z.record(zod_1.z.any()).optional(),
        status: zod_1.z.enum(['active', 'completed', 'archived']).optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;
        const { data: project, error } = await ctx.supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', ctx.session.organizationId)
            .select()
            .single();
        if (error || !project) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Project not found or you do not have permission to update it',
            });
        }
        // Log activity
        await ctx.supabase.from('activity_logs').insert({
            organization_id: ctx.session.organizationId,
            user_id: ctx.session.userId,
            action: shared_1.ActivityActions.PROJECT_UPDATED,
            entity_type: 'project',
            entity_id: project.id,
            metadata: { changes: Object.keys(updateData) },
        });
        return project;
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
            .from('projects')
            .delete()
            .eq('id', input.id)
            .eq('organization_id', ctx.session.organizationId);
        if (error) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Project not found or you do not have permission to delete it',
            });
        }
        // Log activity
        await ctx.supabase.from('activity_logs').insert({
            organization_id: ctx.session.organizationId,
            user_id: ctx.session.userId,
            action: shared_1.ActivityActions.PROJECT_DELETED,
            entity_type: 'project',
            entity_id: input.id,
        });
        return { success: true };
    }),
    // --- Versioning procedures ---
    listVersions: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        limit: zod_1.z.number().min(1).max(100).default(20),
        offset: zod_1.z.number().min(0).default(0),
    }))
        .query(async ({ ctx, input }) => {
        const { data: versions, error } = await ctx.supabase
            .from('project_versions')
            .select('*')
            .eq('project_id', input.projectId)
            .order('created_at', { ascending: false })
            .range(input.offset, input.offset + input.limit - 1);
        if (error) {
            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch versions' });
        }
        const { count } = await ctx.supabase
            .from('project_versions')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', input.projectId);
        return {
            versions: versions || [],
            total: count || 0,
            hasMore: (count || 0) > input.offset + input.limit,
        };
    }),
    createVersion: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        snapshot: zod_1.z.record(zod_1.z.any()),
        comment: zod_1.z.string().optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        const versionData = {
            project_id: input.projectId,
            snapshot: input.snapshot,
            comment: input.comment || null,
            created_by: ctx.session.userId,
        };
        const { data, error } = await ctx.supabase
            .from('project_versions')
            .insert(versionData)
            .select()
            .single();
        if (error || !data) {
            throw new server_1.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create version' });
        }
        return data;
    }),
    getVersionDiff: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        versionIdA: zod_1.z.string().uuid(),
        versionIdB: zod_1.z.string().uuid(),
    }))
        .query(async ({ ctx, input }) => {
        const fetchVersion = async (id) => {
            const { data, error } = await ctx.supabase
                .from('project_versions')
                .select('snapshot')
                .eq('id', id)
                .single();
            if (error || !data) {
                throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Version not found' });
            }
            return data.snapshot;
        };
        const [snapshotA, snapshotB] = await Promise.all([
            fetchVersion(input.versionIdA),
            fetchVersion(input.versionIdB),
        ]);
        // Simple JSON diff (keys added/changed/removed)
        const diff = {};
        const allKeys = new Set([...Object.keys(snapshotA), ...Object.keys(snapshotB)]);
        allKeys.forEach((key) => {
            const valA = snapshotA[key];
            const valB = snapshotB[key];
            if (JSON.stringify(valA) !== JSON.stringify(valB)) {
                diff[key] = { from: valA, to: valB };
            }
        });
        return { diff, snapshotA, snapshotB };
    }),
    restoreVersion: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        versionId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        // Fetch snapshot
        const { data: version, error: versionError } = await ctx.supabase
            .from('project_versions')
            .select('*')
            .eq('id', input.versionId)
            .single();
        if (versionError || !version) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Version not found' });
        }
        // Update project with snapshot
        const { error: updateError } = await ctx.supabase
            .from('projects')
            .update({ ...version.snapshot })
            .eq('id', version.project_id);
        if (updateError) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to restore version',
            });
        }
        return { restored: true };
    }),
});
