import {
  ActivityActions,
  CreateInvitationSchema,
  hasPermission,
  UpdateUserRoleSchema,
  type UserRole,
} from '@terrashaper/shared';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { checkUsageLimit } from '../middleware/usage-limits';
import { protectedProcedure, router } from '../trpc';

export const teamRouter = router({
  // Get organization members
  listMembers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: members, error } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('organization_id', ctx.session.organizationId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch team members',
        });
      }

      const { count } = await ctx.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', ctx.session.organizationId);

      return {
        members,
        total: count || 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Create invitation
  createInvitation: protectedProcedure
    .input(CreateInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to invite
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();

      if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to invite users',
        });
      }

      // Check if user already exists in organization
      const { data: existingUser } = await ctx.supabase
        .from('users')
        .select('id')
        .eq('email', input.email)
        .eq('organization_id', ctx.session.organizationId)
        .single();

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this organization',
        });
      }

      // Check team member limit before creating invitation
      await checkUsageLimit(ctx, {
        limitType: 'maxTeamMembers',
        customMessage:
          'You have reached your team member limit. Please upgrade your plan to invite more members.',
      });

      // Create invitation
      const token = crypto.randomUUID(); // In production, use a more secure token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

      const { data: invitation, error } = await ctx.supabase
        .from('invitations')
        .insert({
          organization_id: ctx.session.organizationId,
          email: input.email,
          role: input.role,
          invited_by: ctx.session.userId,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invitation',
        });
      }

      // Log activity
      await ctx.supabase.from('activity_logs').insert({
        organization_id: ctx.session.organizationId,
        user_id: ctx.session.userId,
        action: ActivityActions.USER_INVITED,
        entity_type: 'invitation',
        entity_id: invitation.id,
        metadata: { email: input.email, role: input.role },
      });

      // In production, send invitation email here

      return invitation;
    }),

  // List pending invitations
  listInvitations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();

      if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view invitations',
        });
      }

      const { data: invitations, error } = await ctx.supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', ctx.session.organizationId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch invitations',
        });
      }

      return {
        invitations,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Cancel invitation
  cancelInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();

      if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel invitations',
        });
      }

      const { error } = await ctx.supabase
        .from('invitations')
        .delete()
        .eq('id', input.invitationId)
        .eq('organization_id', ctx.session.organizationId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel invitation',
        });
      }

      return { success: true };
    }),

  // Update user role
  updateUserRole: protectedProcedure
    .input(UpdateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();

      if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update user roles',
        });
      }

      // Prevent demoting the last owner
      if (currentUser.role === 'owner') {
        const { count } = await ctx.supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', ctx.session.organizationId)
          .eq('role', 'owner');

        if (count === 1 && input.userId === ctx.session.userId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot demote the last owner of the organization',
          });
        }
      }

      // Update role
      const { data: updatedUser, error } = await ctx.supabase
        .from('users')
        .update({ role: input.role })
        .eq('id', input.userId)
        .eq('organization_id', ctx.session.organizationId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
        });
      }

      // Log activity
      await ctx.supabase.from('activity_logs').insert({
        organization_id: ctx.session.organizationId,
        user_id: ctx.session.userId,
        action: ActivityActions.USER_ROLE_CHANGED,
        entity_type: 'user',
        entity_id: input.userId,
        metadata: {
          oldRole: currentUser.role,
          newRole: input.role,
          targetUserId: input.userId,
        },
      });

      return updatedUser;
    }),

  // Remove user from organization
  removeUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check permission
      const { data: currentUser } = await ctx.supabase
        .from('users')
        .select('role')
        .eq('id', ctx.session.userId)
        .single();

      if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove users',
        });
      }

      // Prevent removing self
      if (input.userId === ctx.session.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot remove yourself from the organization',
        });
      }

      // Get user info before deletion
      const { data: userToRemove } = await ctx.supabase
        .from('users')
        .select('email, full_name')
        .eq('id', input.userId)
        .single();

      // Remove user
      const { error } = await ctx.supabase
        .from('users')
        .delete()
        .eq('id', input.userId)
        .eq('organization_id', ctx.session.organizationId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove user',
        });
      }

      // Log activity
      await ctx.supabase.from('activity_logs').insert({
        organization_id: ctx.session.organizationId,
        user_id: ctx.session.userId,
        action: ActivityActions.USER_REMOVED,
        entity_type: 'user',
        entity_id: input.userId,
        metadata: {
          removedUser: userToRemove,
        },
      });

      return { success: true };
    }),

  // Get activity logs
  getActivityLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        action: z.string().optional(),
        userId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('activity_logs')
        .select('*, user:users!activity_logs_user_id_fkey(email, full_name)')
        .eq('organization_id', ctx.session.organizationId)
        .order('created_at', { ascending: false });

      if (input.action) {
        query = query.eq('action', input.action);
      }

      if (input.userId) {
        query = query.eq('user_id', input.userId);
      }

      const { data: logs, error } = await query.range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch activity logs',
        });
      }

      const { count } = await ctx.supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', ctx.session.organizationId);

      return {
        logs,
        total: count || 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),
});
