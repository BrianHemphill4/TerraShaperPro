"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveCommentSchema = exports.CreateProjectCommentSchema = exports.UpdateApprovalStatusSchema = exports.CreateProjectApprovalSchema = exports.CreateClientAccessLinkSchema = exports.ProjectCommentSchema = exports.CommentPositionSchema = exports.ProjectApprovalSchema = exports.ApprovalStatusEnum = exports.ClientAccessLinkSchema = exports.ClientPermissionsSchema = void 0;
const zod_1 = require("zod");
exports.ClientPermissionsSchema = zod_1.z.object({
    view: zod_1.z.boolean().default(true),
    comment: zod_1.z.boolean().default(true),
    approve: zod_1.z.boolean().default(false),
});
exports.ClientAccessLinkSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(),
    created_by: zod_1.z.string().uuid(),
    token: zod_1.z.string(),
    client_email: zod_1.z.string().email().nullable(),
    client_name: zod_1.z.string().nullable(),
    permissions: exports.ClientPermissionsSchema,
    expires_at: zod_1.z.string().datetime().nullable(),
    last_accessed_at: zod_1.z.string().datetime().nullable(),
    access_count: zod_1.z.number().int().default(0),
    is_active: zod_1.z.boolean().default(true),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.ApprovalStatusEnum = zod_1.z.enum(['pending', 'approved', 'rejected', 'revision_requested']);
exports.ProjectApprovalSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(),
    version_id: zod_1.z.string().uuid().nullable(),
    requested_by: zod_1.z.string().uuid(),
    approved_by: zod_1.z.string().nullable(),
    client_access_link_id: zod_1.z.string().uuid().nullable(),
    status: exports.ApprovalStatusEnum,
    notes: zod_1.z.string().nullable(),
    approved_at: zod_1.z.string().datetime().nullable(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.CommentPositionSchema = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
});
exports.ProjectCommentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(),
    parent_id: zod_1.z.string().uuid().nullable(),
    author_id: zod_1.z.string().uuid().nullable(),
    author_email: zod_1.z.string().email().nullable(),
    author_name: zod_1.z.string().nullable(),
    client_access_link_id: zod_1.z.string().uuid().nullable(),
    content: zod_1.z.string(),
    position: exports.CommentPositionSchema.nullable(),
    attachments: zod_1.z.array(zod_1.z.any()).default([]),
    is_resolved: zod_1.z.boolean().default(false),
    resolved_by: zod_1.z.string().uuid().nullable(),
    resolved_at: zod_1.z.string().datetime().nullable(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
// Input schemas for API operations
exports.CreateClientAccessLinkSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid(),
    clientEmail: zod_1.z.string().email().optional(),
    clientName: zod_1.z.string().optional(),
    permissions: exports.ClientPermissionsSchema.optional(),
    expiresIn: zod_1.z.number().int().optional(), // Hours until expiration
});
exports.CreateProjectApprovalSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid(),
    versionId: zod_1.z.string().uuid().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateApprovalStatusSchema = zod_1.z.object({
    approvalId: zod_1.z.string().uuid(),
    status: exports.ApprovalStatusEnum,
    notes: zod_1.z.string().optional(),
});
exports.CreateProjectCommentSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid(),
    content: zod_1.z.string(),
    parentId: zod_1.z.string().uuid().optional(),
    position: exports.CommentPositionSchema.optional(),
    clientAccessToken: zod_1.z.string().optional(), // For client comments
});
exports.ResolveCommentSchema = zod_1.z.object({
    commentId: zod_1.z.string().uuid(),
    resolved: zod_1.z.boolean(),
});
