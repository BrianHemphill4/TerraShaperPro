"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.organizations = exports.subscriptionTierEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.subscriptionTierEnum = (0, pg_core_1.pgEnum)('subscription_tier', [
    'free',
    'professional',
    'business',
    'enterprise',
]);
exports.organizations = (0, pg_core_1.pgTable)('organizations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    clerkId: (0, pg_core_1.varchar)('clerk_id', { length: 255 }).unique().notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    subscriptionTier: (0, exports.subscriptionTierEnum)('subscription_tier').default('free').notNull(),
    subscriptionExpiresAt: (0, pg_core_1.timestamp)('subscription_expires_at', { withTimezone: true }),
    renderCredits: (0, pg_core_1.integer)('render_credits').default(10).notNull(),
    renderQuota: (0, pg_core_1.integer)('render_quota').default(20).notNull(),
    renderQuotaUsed: (0, pg_core_1.integer)('render_quota_used').default(0).notNull(),
    quotaRefreshDate: (0, pg_core_1.date)('quota_refresh_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    clerkId: (0, pg_core_1.varchar)('clerk_id', { length: 255 }).unique().notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).unique().notNull(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 255 }),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => exports.organizations.id, {
        onDelete: 'cascade',
    }),
    role: (0, pg_core_1.varchar)('role', { length: 50 }).default('member').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
