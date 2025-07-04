"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientPortalRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const server_1 = require("@trpc/server");
const shared_1 = require("@terrashaper/shared");
exports.clientPortalRouter = (0, trpc_1.router)({
    // Create client access link
    createAccessLink: trpc_1.protectedProcedure
        .input(shared_1.CreateClientAccessLinkSchema)
        .mutation(async ({ ctx, input }) => {
        // Check if user has permission
        const { data: currentUser } = await ctx.supabase
            .from('users')
            .select('role')
            .eq('id', ctx.session.userId)
            .single();
        if (!currentUser || !(0, shared_1.hasPermission)(currentUser.role, 'designer')) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to create client access links',
            });
        }
        // Verify project exists and user has access
        const { data: project } = await ctx.supabase
            .from('projects')
            .select('id, name')
            .eq('id', input.projectId)
            .eq('organization_id', ctx.session.organizationId)
            .single();
        if (!project) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Project not found',
            });
        }
        const token = crypto.randomUUID();
        const expiresAt = input.expiresIn
            ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000).toISOString()
            : null;
        const { data: accessLink, error } = await ctx.supabase
            .from('client_access_links')
            .insert({
            project_id: input.projectId,
            created_by: ctx.session.userId,
            token,
            client_email: input.clientEmail,
            client_name: input.clientName,
            permissions: input.permissions || { view: true, comment: true, approve: false },
            expires_at: expiresAt,
        })
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create access link',
            });
        }
        // Log activity
        await ctx.supabase.from('activity_logs').insert({
            organization_id: ctx.session.organizationId,
            user_id: ctx.session.userId,
            action: shared_1.ActivityActions.PROJECT_SHARED,
            entity_type: 'project',
            entity_id: input.projectId,
            metadata: {
                clientEmail: input.clientEmail,
                accessLinkId: accessLink.id,
            },
        });
        return {
            ...accessLink,
            shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/${token}`,
        };
    }),
    // List access links for a project
    listAccessLinks: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
    }))
        .query(async ({ ctx, input }) => {
        const { data: links, error } = await ctx.supabase
            .from('client_access_links')
            .select('*')
            .eq('project_id', input.projectId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch access links',
            });
        }
        return links.map((link) => ({
            ...link,
            shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/${link.token}`,
        }));
    }),
    // Revoke access link
    revokeAccessLink: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        linkId: zod_1.z.string().uuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        const { error } = await ctx.supabase
            .from('client_access_links')
            .update({ is_active: false })
            .eq('id', input.linkId)
            .eq('created_by', ctx.session.userId);
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to revoke access link',
            });
        }
        return { success: true };
    }),
    // Create approval request
    createApprovalRequest: trpc_1.protectedProcedure
        .input(shared_1.CreateProjectApprovalSchema)
        .mutation(async ({ ctx, input }) => {
        const { data: approval, error } = await ctx.supabase
            .from('project_approvals')
            .insert({
            project_id: input.projectId,
            version_id: input.versionId,
            requested_by: ctx.session.userId,
            notes: input.notes,
        })
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create approval request',
            });
        }
        return approval;
    }),
    // List approval requests
    listApprovals: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        status: zod_1.z.string().optional(),
    }))
        .query(async ({ ctx, input }) => {
        let query = ctx.supabase
            .from('project_approvals')
            .select('*, requested_by_user:users!project_approvals_requested_by_fkey(email, full_name)')
            .eq('project_id', input.projectId)
            .order('created_at', { ascending: false });
        if (input.status) {
            query = query.eq('status', input.status);
        }
        const { data: approvals, error } = await query;
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch approvals',
            });
        }
        return approvals;
    }),
    // Update approval status (for admins)
    updateApprovalStatus: trpc_1.protectedProcedure
        .input(shared_1.UpdateApprovalStatusSchema)
        .mutation(async ({ ctx, input }) => {
        // Check permission
        const { data: currentUser } = await ctx.supabase
            .from('users')
            .select('role')
            .eq('id', ctx.session.userId)
            .single();
        if (!currentUser || !(0, shared_1.hasPermission)(currentUser.role, 'admin')) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to update approval status',
            });
        }
        const { data: approval, error } = await ctx.supabase
            .from('project_approvals')
            .update({
            status: input.status,
            notes: input.notes,
            approved_by: ctx.session.userId,
            approved_at: input.status === 'approved' ? new Date().toISOString() : null,
        })
            .eq('id', input.approvalId)
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update approval',
            });
        }
        return approval;
    }),
    // Create comment
    createComment: trpc_1.protectedProcedure
        .input(shared_1.CreateProjectCommentSchema)
        .mutation(async ({ ctx, input }) => {
        const { data: comment, error } = await ctx.supabase
            .from('project_comments')
            .insert({
            project_id: input.projectId,
            parent_id: input.parentId,
            author_id: ctx.session.userId,
            content: input.content,
            position: input.position,
        })
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create comment',
            });
        }
        return comment;
    }),
    // List comments
    listComments: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        projectId: zod_1.z.string().uuid(),
        includeResolved: zod_1.z.boolean().default(false),
    }))
        .query(async ({ ctx, input }) => {
        let query = ctx.supabase
            .from('project_comments')
            .select(`
          *,
          author:users!project_comments_author_id_fkey(email, full_name),
          replies:project_comments!parent_id(*)
        `)
            .eq('project_id', input.projectId)
            .is('parent_id', null)
            .order('created_at', { ascending: false });
        if (!input.includeResolved) {
            query = query.eq('is_resolved', false);
        }
        const { data: comments, error } = await query;
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch comments',
            });
        }
        return comments;
    }),
    // Resolve/unresolve comment
    resolveComment: trpc_1.protectedProcedure
        .input(shared_1.ResolveCommentSchema)
        .mutation(async ({ ctx, input }) => {
        const { data: comment, error } = await ctx.supabase
            .from('project_comments')
            .update({
            is_resolved: input.resolved,
            resolved_by: input.resolved ? ctx.session.userId : null,
            resolved_at: input.resolved ? new Date().toISOString() : null,
        })
            .eq('id', input.commentId)
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update comment',
            });
        }
        return comment;
    }),
    // Public endpoint for client portal access
    getClientProject: trpc_1.publicProcedure
        .input(zod_1.z.object({
        token: zod_1.z.string(),
    }))
        .query(async ({ ctx, input }) => {
        // Validate token and get project
        const { data: accessLink } = await ctx.supabase
            .from('client_access_links')
            .select(`
          *,
          project:projects(*)
        `)
            .eq('token', input.token)
            .eq('is_active', true)
            .single();
        if (!accessLink) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Invalid or expired access link',
            });
        }
        // Check expiration
        if (accessLink.expires_at && new Date(accessLink.expires_at) < new Date()) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'This access link has expired',
            });
        }
        // Update access tracking
        await ctx.supabase
            .from('client_access_links')
            .update({
            last_accessed_at: new Date().toISOString(),
            access_count: (accessLink.access_count || 0) + 1,
        })
            .eq('id', accessLink.id);
        return {
            project: accessLink.project,
            permissions: accessLink.permissions,
            clientName: accessLink.client_name,
        };
    }),
    // Create client comment (public endpoint)
    createClientComment: trpc_1.publicProcedure
        .input(zod_1.z.object({
        token: zod_1.z.string(),
        projectId: zod_1.z.string().uuid(),
        content: zod_1.z.string(),
        authorEmail: zod_1.z.string().email(),
        authorName: zod_1.z.string(),
        position: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }).optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        // Validate token
        const { data: accessLink } = await ctx.supabase
            .from('client_access_links')
            .select('*')
            .eq('token', input.token)
            .eq('project_id', input.projectId)
            .eq('is_active', true)
            .single();
        if (!accessLink || !accessLink.permissions.comment) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to comment',
            });
        }
        const { data: comment, error } = await ctx.supabase
            .from('project_comments')
            .insert({
            project_id: input.projectId,
            author_email: input.authorEmail,
            author_name: input.authorName,
            client_access_link_id: accessLink.id,
            content: input.content,
            position: input.position,
        })
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create comment',
            });
        }
        return comment;
    }),
    // Submit client approval (public endpoint)
    submitClientApproval: trpc_1.publicProcedure
        .input(zod_1.z.object({
        token: zod_1.z.string(),
        approvalId: zod_1.z.string().uuid(),
        status: zod_1.z.enum(['approved', 'rejected', 'revision_requested']),
        notes: zod_1.z.string().optional(),
        approverEmail: zod_1.z.string().email(),
        approverName: zod_1.z.string(),
    }))
        .mutation(async ({ ctx, input }) => {
        // Validate token and permissions
        const { data: accessLink } = await ctx.supabase
            .from('client_access_links')
            .select('*')
            .eq('token', input.token)
            .eq('is_active', true)
            .single();
        if (!accessLink || !accessLink.permissions.approve) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to approve',
            });
        }
        const { data: approval, error } = await ctx.supabase
            .from('project_approvals')
            .update({
            status: input.status,
            notes: input.notes,
            approved_by: `${input.approverName} <${input.approverEmail}>`,
            approved_at: input.status === 'approved' ? new Date().toISOString() : null,
            client_access_link_id: accessLink.id,
        })
            .eq('id', input.approvalId)
            .select()
            .single();
        if (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update approval',
            });
        }
        return approval;
    }),
});
