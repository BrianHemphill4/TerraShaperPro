import { z } from 'zod';
export declare const UserRoleEnum: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
export type UserRole = z.infer<typeof UserRoleEnum>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    clerk_id: z.ZodString;
    email: z.ZodString;
    full_name: z.ZodNullable<z.ZodString>;
    organization_id: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    clerk_id: string;
    created_at: string;
    updated_at: string;
    email: string;
    full_name: string | null;
    organization_id: string;
    role: "admin" | "member" | "owner" | "designer" | "viewer";
}, {
    id: string;
    clerk_id: string;
    created_at: string;
    updated_at: string;
    email: string;
    full_name: string | null;
    organization_id: string;
    role: "admin" | "member" | "owner" | "designer" | "viewer";
}>;
export type User = z.infer<typeof UserSchema>;
export declare const InvitationSchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
    invited_by: z.ZodString;
    token: z.ZodString;
    expires_at: z.ZodString;
    accepted_at: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    email: string;
    organization_id: string;
    role: "admin" | "member" | "owner" | "designer" | "viewer";
    expires_at: string;
    token: string;
    invited_by: string;
    accepted_at: string | null;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    email: string;
    organization_id: string;
    role: "admin" | "member" | "owner" | "designer" | "viewer";
    expires_at: string;
    token: string;
    invited_by: string;
    accepted_at: string | null;
}>;
export type Invitation = z.infer<typeof InvitationSchema>;
export declare const ActivityLogSchema: z.ZodObject<{
    id: z.ZodString;
    organization_id: z.ZodString;
    user_id: z.ZodNullable<z.ZodString>;
    action: z.ZodString;
    entity_type: z.ZodString;
    entity_id: z.ZodNullable<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ip_address: z.ZodNullable<z.ZodString>;
    user_agent: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    organization_id: string;
    metadata: Record<string, any>;
    user_id: string | null;
    action: string;
    ip_address: string | null;
    user_agent: string | null;
    entity_type: string;
    entity_id: string | null;
}, {
    id: string;
    created_at: string;
    organization_id: string;
    user_id: string | null;
    action: string;
    ip_address: string | null;
    user_agent: string | null;
    entity_type: string;
    entity_id: string | null;
    metadata?: Record<string, any> | undefined;
}>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
export declare const CreateInvitationSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "admin" | "member" | "owner" | "designer" | "viewer";
}, {
    email: string;
    role: "admin" | "member" | "owner" | "designer" | "viewer";
}>;
export type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>;
export declare const UpdateUserRoleSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<["owner", "admin", "designer", "member", "viewer"]>;
}, "strip", z.ZodTypeAny, {
    role: "admin" | "member" | "owner" | "designer" | "viewer";
    userId: string;
}, {
    role: "admin" | "member" | "owner" | "designer" | "viewer";
    userId: string;
}>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export declare const AcceptInvitationSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>;
export declare const roleHierarchy: Record<UserRole, number>;
export declare function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean;
export declare const ActivityActions: {
    readonly USER_INVITED: "user.invited";
    readonly USER_JOINED: "user.joined";
    readonly USER_ROLE_CHANGED: "user.role_changed";
    readonly USER_REMOVED: "user.removed";
    readonly PROJECT_CREATED: "project.created";
    readonly PROJECT_UPDATED: "project.updated";
    readonly PROJECT_DELETED: "project.deleted";
    readonly PROJECT_SHARED: "project.shared";
    readonly RENDER_STARTED: "render.started";
    readonly RENDER_COMPLETED: "render.completed";
    readonly RENDER_FAILED: "render.failed";
    readonly ORG_SETTINGS_UPDATED: "org.settings_updated";
    readonly ORG_SUBSCRIPTION_CHANGED: "org.subscription_changed";
};
export type ActivityAction = (typeof ActivityActions)[keyof typeof ActivityActions];
