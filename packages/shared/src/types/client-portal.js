import { z } from 'zod';
export const ClientPermissionsSchema = z.object({
    view: z.boolean().default(true),
    comment: z.boolean().default(true),
    approve: z.boolean().default(false),
});
export const ClientAccessLinkSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    created_by: z.string().uuid(),
    token: z.string(),
    client_email: z.string().email().nullable(),
    client_name: z.string().nullable(),
    permissions: ClientPermissionsSchema,
    expires_at: z.string().datetime().nullable(),
    last_accessed_at: z.string().datetime().nullable(),
    access_count: z.number().int().default(0),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
export const ApprovalStatusEnum = z.enum(['pending', 'approved', 'rejected', 'revision_requested']);
export const ProjectApprovalSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    version_id: z.string().uuid().nullable(),
    requested_by: z.string().uuid(),
    approved_by: z.string().nullable(),
    client_access_link_id: z.string().uuid().nullable(),
    status: ApprovalStatusEnum,
    notes: z.string().nullable(),
    approved_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
export const CommentPositionSchema = z.object({
    x: z.number(),
    y: z.number(),
});
export const ProjectCommentSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    parent_id: z.string().uuid().nullable(),
    author_id: z.string().uuid().nullable(),
    author_email: z.string().email().nullable(),
    author_name: z.string().nullable(),
    client_access_link_id: z.string().uuid().nullable(),
    content: z.string(),
    position: CommentPositionSchema.nullable(),
    attachments: z.array(z.any()).default([]),
    is_resolved: z.boolean().default(false),
    resolved_by: z.string().uuid().nullable(),
    resolved_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
// Input schemas for API operations
export const CreateClientAccessLinkSchema = z.object({
    projectId: z.string().uuid(),
    clientEmail: z.string().email().optional(),
    clientName: z.string().optional(),
    permissions: ClientPermissionsSchema.optional(),
    expiresIn: z.number().int().optional(), // Hours until expiration
});
export const CreateProjectApprovalSchema = z.object({
    projectId: z.string().uuid(),
    versionId: z.string().uuid().optional(),
    notes: z.string().optional(),
});
export const UpdateApprovalStatusSchema = z.object({
    approvalId: z.string().uuid(),
    status: ApprovalStatusEnum,
    notes: z.string().optional(),
});
export const CreateProjectCommentSchema = z.object({
    projectId: z.string().uuid(),
    content: z.string(),
    parentId: z.string().uuid().optional(),
    position: CommentPositionSchema.optional(),
    clientAccessToken: z.string().optional(), // For client comments
});
export const ResolveCommentSchema = z.object({
    commentId: z.string().uuid(),
    resolved: z.boolean(),
});
