import { z } from 'zod';
export const UserRoleEnum = z.enum(['owner', 'admin', 'designer', 'member', 'viewer']);
export const UserSchema = z.object({
    id: z.string().uuid(),
    clerk_id: z.string(),
    email: z.string().email(),
    full_name: z.string().nullable(),
    organization_id: z.string().uuid(),
    role: UserRoleEnum,
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
export const InvitationSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    email: z.string().email(),
    role: UserRoleEnum,
    invited_by: z.string().uuid(),
    token: z.string(),
    expires_at: z.string().datetime(),
    accepted_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
export const ActivityLogSchema = z.object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    user_id: z.string().uuid().nullable(),
    action: z.string(),
    entity_type: z.string(),
    entity_id: z.string().uuid().nullable(),
    metadata: z.record(z.any()).default({}),
    ip_address: z.string().nullable(),
    user_agent: z.string().nullable(),
    created_at: z.string().datetime(),
});
// Input schemas for API operations
export const CreateInvitationSchema = z.object({
    email: z.string().email(),
    role: UserRoleEnum,
});
export const UpdateUserRoleSchema = z.object({
    userId: z.string().uuid(),
    role: UserRoleEnum,
});
export const AcceptInvitationSchema = z.object({
    token: z.string(),
});
// Permission helpers
export const roleHierarchy = {
    owner: 5,
    admin: 4,
    designer: 3,
    member: 2,
    viewer: 1,
};
export function hasPermission(userRole, requiredRole) {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
// Activity log action types
export const ActivityActions = {
    // User management
    USER_INVITED: 'user.invited',
    USER_JOINED: 'user.joined',
    USER_ROLE_CHANGED: 'user.role_changed',
    USER_REMOVED: 'user.removed',
    // Project actions
    PROJECT_CREATED: 'project.created',
    PROJECT_UPDATED: 'project.updated',
    PROJECT_DELETED: 'project.deleted',
    PROJECT_SHARED: 'project.shared',
    // Render actions
    RENDER_STARTED: 'render.started',
    RENDER_COMPLETED: 'render.completed',
    RENDER_FAILED: 'render.failed',
    // Organization actions
    ORG_SETTINGS_UPDATED: 'org.settings_updated',
    ORG_SUBSCRIPTION_CHANGED: 'org.subscription_changed',
};
