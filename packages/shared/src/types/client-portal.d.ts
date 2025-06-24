import { z } from 'zod';
export declare const ClientPermissionsSchema: z.ZodObject<{
    view: z.ZodDefault<z.ZodBoolean>;
    comment: z.ZodDefault<z.ZodBoolean>;
    approve: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    view: boolean;
    comment: boolean;
    approve: boolean;
}, {
    view?: boolean | undefined;
    comment?: boolean | undefined;
    approve?: boolean | undefined;
}>;
export type ClientPermissions = z.infer<typeof ClientPermissionsSchema>;
export declare const ClientAccessLinkSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    created_by: z.ZodString;
    token: z.ZodString;
    client_email: z.ZodNullable<z.ZodString>;
    client_name: z.ZodNullable<z.ZodString>;
    permissions: z.ZodObject<{
        view: z.ZodDefault<z.ZodBoolean>;
        comment: z.ZodDefault<z.ZodBoolean>;
        approve: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        view: boolean;
        comment: boolean;
        approve: boolean;
    }, {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    }>;
    expires_at: z.ZodNullable<z.ZodString>;
    last_accessed_at: z.ZodNullable<z.ZodString>;
    access_count: z.ZodDefault<z.ZodNumber>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    project_id: string;
    expires_at: string | null;
    is_active: boolean;
    token: string;
    client_email: string | null;
    client_name: string | null;
    permissions: {
        view: boolean;
        comment: boolean;
        approve: boolean;
    };
    last_accessed_at: string | null;
    access_count: number;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    project_id: string;
    expires_at: string | null;
    token: string;
    client_email: string | null;
    client_name: string | null;
    permissions: {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    };
    last_accessed_at: string | null;
    is_active?: boolean | undefined;
    access_count?: number | undefined;
}>;
export type ClientAccessLink = z.infer<typeof ClientAccessLinkSchema>;
export declare const ApprovalStatusEnum: z.ZodEnum<["pending", "approved", "rejected", "revision_requested"]>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusEnum>;
export declare const ProjectApprovalSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    version_id: z.ZodNullable<z.ZodString>;
    requested_by: z.ZodString;
    approved_by: z.ZodNullable<z.ZodString>;
    client_access_link_id: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["pending", "approved", "rejected", "revision_requested"]>;
    notes: z.ZodNullable<z.ZodString>;
    approved_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "pending" | "approved" | "rejected" | "revision_requested";
    project_id: string;
    version_id: string | null;
    requested_by: string;
    approved_by: string | null;
    client_access_link_id: string | null;
    notes: string | null;
    approved_at: string | null;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "pending" | "approved" | "rejected" | "revision_requested";
    project_id: string;
    version_id: string | null;
    requested_by: string;
    approved_by: string | null;
    client_access_link_id: string | null;
    notes: string | null;
    approved_at: string | null;
}>;
export type ProjectApproval = z.infer<typeof ProjectApprovalSchema>;
export declare const CommentPositionSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
}, {
    x: number;
    y: number;
}>;
export type CommentPosition = z.infer<typeof CommentPositionSchema>;
export declare const ProjectCommentSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    parent_id: z.ZodNullable<z.ZodString>;
    author_id: z.ZodNullable<z.ZodString>;
    author_email: z.ZodNullable<z.ZodString>;
    author_name: z.ZodNullable<z.ZodString>;
    client_access_link_id: z.ZodNullable<z.ZodString>;
    content: z.ZodString;
    position: z.ZodNullable<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    is_resolved: z.ZodDefault<z.ZodBoolean>;
    resolved_by: z.ZodNullable<z.ZodString>;
    resolved_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    author_id: string | null;
    client_access_link_id: string | null;
    parent_id: string | null;
    author_email: string | null;
    author_name: string | null;
    content: string;
    position: {
        x: number;
        y: number;
    } | null;
    attachments: any[];
    is_resolved: boolean;
    resolved_by: string | null;
    resolved_at: string | null;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    project_id: string;
    author_id: string | null;
    client_access_link_id: string | null;
    parent_id: string | null;
    author_email: string | null;
    author_name: string | null;
    content: string;
    position: {
        x: number;
        y: number;
    } | null;
    resolved_by: string | null;
    resolved_at: string | null;
    attachments?: any[] | undefined;
    is_resolved?: boolean | undefined;
}>;
export type ProjectComment = z.infer<typeof ProjectCommentSchema>;
export declare const CreateClientAccessLinkSchema: z.ZodObject<{
    projectId: z.ZodString;
    clientEmail: z.ZodOptional<z.ZodString>;
    clientName: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodObject<{
        view: z.ZodDefault<z.ZodBoolean>;
        comment: z.ZodDefault<z.ZodBoolean>;
        approve: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        view: boolean;
        comment: boolean;
        approve: boolean;
    }, {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    }>>;
    expiresIn: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    permissions?: {
        view: boolean;
        comment: boolean;
        approve: boolean;
    } | undefined;
    clientEmail?: string | undefined;
    clientName?: string | undefined;
    expiresIn?: number | undefined;
}, {
    projectId: string;
    permissions?: {
        view?: boolean | undefined;
        comment?: boolean | undefined;
        approve?: boolean | undefined;
    } | undefined;
    clientEmail?: string | undefined;
    clientName?: string | undefined;
    expiresIn?: number | undefined;
}>;
export type CreateClientAccessLinkInput = z.infer<typeof CreateClientAccessLinkSchema>;
export declare const CreateProjectApprovalSchema: z.ZodObject<{
    projectId: z.ZodString;
    versionId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    notes?: string | undefined;
    versionId?: string | undefined;
}, {
    projectId: string;
    notes?: string | undefined;
    versionId?: string | undefined;
}>;
export type CreateProjectApprovalInput = z.infer<typeof CreateProjectApprovalSchema>;
export declare const UpdateApprovalStatusSchema: z.ZodObject<{
    approvalId: z.ZodString;
    status: z.ZodEnum<["pending", "approved", "rejected", "revision_requested"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "approved" | "rejected" | "revision_requested";
    approvalId: string;
    notes?: string | undefined;
}, {
    status: "pending" | "approved" | "rejected" | "revision_requested";
    approvalId: string;
    notes?: string | undefined;
}>;
export type UpdateApprovalStatusInput = z.infer<typeof UpdateApprovalStatusSchema>;
export declare const CreateProjectCommentSchema: z.ZodObject<{
    projectId: z.ZodString;
    content: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    clientAccessToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    content: string;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parentId?: string | undefined;
    clientAccessToken?: string | undefined;
}, {
    projectId: string;
    content: string;
    position?: {
        x: number;
        y: number;
    } | undefined;
    parentId?: string | undefined;
    clientAccessToken?: string | undefined;
}>;
export type CreateProjectCommentInput = z.infer<typeof CreateProjectCommentSchema>;
export declare const ResolveCommentSchema: z.ZodObject<{
    commentId: z.ZodString;
    resolved: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    commentId: string;
    resolved: boolean;
}, {
    commentId: string;
    resolved: boolean;
}>;
export type ResolveCommentInput = z.infer<typeof ResolveCommentSchema>;
