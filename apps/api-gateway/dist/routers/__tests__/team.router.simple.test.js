"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@terrashaper/shared");
const vitest_1 = require("vitest");
// Simple tests for team router related validation and helper logic
(0, vitest_1.describe)('Team Router Logic Tests', () => {
    (0, vitest_1.describe)('Input Validation', () => {
        (0, vitest_1.it)('should validate CreateInvitation input', () => {
            const valid = { email: 'user@example.com', role: 'designer' };
            (0, vitest_1.expect)(() => shared_1.CreateInvitationSchema.parse(valid)).not.toThrow();
            // Invalid email
            (0, vitest_1.expect)(() => shared_1.CreateInvitationSchema.parse({ email: 'not-an-email', role: 'viewer' })).toThrow();
            // Invalid role
            (0, vitest_1.expect)(() => shared_1.CreateInvitationSchema.parse({ email: 'user@example.com', role: 'invalid' })).toThrow();
        });
        (0, vitest_1.it)('should validate UpdateUserRole input', () => {
            const valid = {
                userId: '550e8400-e29b-41d4-a716-446655440000',
                role: 'admin',
            };
            (0, vitest_1.expect)(() => shared_1.UpdateUserRoleSchema.parse(valid)).not.toThrow();
            // Invalid UUID
            (0, vitest_1.expect)(() => shared_1.UpdateUserRoleSchema.parse({ userId: '123', role: 'admin' })).toThrow();
        });
    });
    (0, vitest_1.describe)('Permission Checks', () => {
        (0, vitest_1.it)('should respect role hierarchy', () => {
            const roleHierarchy = {
                owner: 5,
                admin: 4,
                designer: 3,
                member: 2,
                viewer: 1,
            };
            const hasPermission = (userRole, requiredRole) => {
                return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
            };
            (0, vitest_1.expect)(hasPermission('owner', 'admin')).toBe(true);
            (0, vitest_1.expect)(hasPermission('admin', 'owner')).toBe(false);
            (0, vitest_1.expect)(hasPermission('designer', 'viewer')).toBe(true);
        });
    });
});
