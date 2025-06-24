"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityActions = exports.roleHierarchy = exports.AcceptInvitationSchema = exports.UpdateUserRoleSchema = exports.CreateInvitationSchema = exports.ActivityLogSchema = exports.InvitationSchema = exports.UserSchema = exports.UserRoleEnum = void 0;
exports.hasPermission = hasPermission;
const zod_1 = require("zod");
exports.UserRoleEnum = zod_1.z.enum(['owner', 'admin', 'designer', 'member', 'viewer']);
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clerk_id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    full_name: zod_1.z.string().nullable(),
    organization_id: zod_1.z.string().uuid(),
    role: exports.UserRoleEnum,
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.InvitationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organization_id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    role: exports.UserRoleEnum,
    invited_by: zod_1.z.string().uuid(),
    token: zod_1.z.string(),
    expires_at: zod_1.z.string().datetime(),
    accepted_at: zod_1.z.string().datetime().nullable(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.ActivityLogSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organization_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid().nullable(),
    action: zod_1.z.string(),
    entity_type: zod_1.z.string(),
    entity_id: zod_1.z.string().uuid().nullable(),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
    ip_address: zod_1.z.string().nullable(),
    user_agent: zod_1.z.string().nullable(),
    created_at: zod_1.z.string().datetime(),
});
// Input schemas for API operations
exports.CreateInvitationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: exports.UserRoleEnum,
});
exports.UpdateUserRoleSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    role: exports.UserRoleEnum,
});
exports.AcceptInvitationSchema = zod_1.z.object({
    token: zod_1.z.string(),
});
// Permission helpers
exports.roleHierarchy = {
    owner: 5,
    admin: 4,
    designer: 3,
    member: 2,
    viewer: 1,
};
function hasPermission(userRole, requiredRole) {
    return exports.roleHierarchy[userRole] >= exports.roleHierarchy[requiredRole];
}
// Activity log action types
exports.ActivityActions = {
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
