"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCriteria = exports.perceptualHashes = exports.qualityMetrics = exports.failureAlerts = exports.qualityReviews = exports.alertSeverityEnum = exports.qualityStatusEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const core_1 = require("./core");
const auth_1 = require("./auth");
exports.qualityStatusEnum = (0, pg_core_1.pgEnum)('quality_status', [
    'pending',
    'approved',
    'rejected',
    'auto_approved',
]);
exports.alertSeverityEnum = (0, pg_core_1.pgEnum)('alert_severity', ['low', 'medium', 'high', 'critical']);
// Quality reviews table
exports.qualityReviews = (0, pg_core_1.pgTable)('quality_reviews', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    renderId: (0, pg_core_1.uuid)('render_id')
        .references(() => core_1.renders.id, { onDelete: 'cascade' })
        .notNull(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .references(() => core_1.projects.id, { onDelete: 'cascade' })
        .notNull(),
    imageUrl: (0, pg_core_1.text)('image_url').notNull(),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url').notNull(),
    qualityScore: (0, pg_core_1.decimal)('quality_score', { precision: 3, scale: 2 }).notNull(),
    issues: (0, pg_core_1.text)('issues').array().default([]).notNull(),
    status: (0, exports.qualityStatusEnum)('status').default('pending').notNull(),
    reviewedBy: (0, pg_core_1.uuid)('reviewed_by').references(() => auth_1.users.id, { onDelete: 'set null' }),
    reviewedAt: (0, pg_core_1.timestamp)('reviewed_at', { withTimezone: true }),
    reviewNotes: (0, pg_core_1.text)('review_notes'),
    metadata: (0, pg_core_1.jsonb)('metadata').default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// Failure alerts table
exports.failureAlerts = (0, pg_core_1.pgTable)('failure_alerts', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    severity: (0, exports.alertSeverityEnum)('severity').notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    details: (0, pg_core_1.jsonb)('details').default({}).notNull(),
    acknowledged: (0, pg_core_1.boolean)('acknowledged').default(false).notNull(),
    acknowledgedBy: (0, pg_core_1.uuid)('acknowledged_by').references(() => auth_1.users.id, { onDelete: 'set null' }),
    acknowledgedAt: (0, pg_core_1.timestamp)('acknowledged_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// Quality metrics table for tracking trends
exports.qualityMetrics = (0, pg_core_1.pgTable)('quality_metrics', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    date: (0, pg_core_1.timestamp)('date', { withTimezone: true }).notNull(),
    totalRenders: (0, pg_core_1.integer)('total_renders').notNull(),
    failedRenders: (0, pg_core_1.integer)('failed_renders').notNull(),
    avgQualityScore: (0, pg_core_1.decimal)('avg_quality_score', { precision: 3, scale: 2 }),
    avgProcessingTime: (0, pg_core_1.integer)('avg_processing_time_ms'),
    providerMetrics: (0, pg_core_1.jsonb)('provider_metrics').default({}).notNull(),
    issueBreakdown: (0, pg_core_1.jsonb)('issue_breakdown').default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// Perceptual hash index for duplicate detection
exports.perceptualHashes = (0, pg_core_1.pgTable)('perceptual_hashes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    renderId: (0, pg_core_1.uuid)('render_id')
        .references(() => core_1.renders.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    hash: (0, pg_core_1.varchar)('hash', { length: 64 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// Review criteria configuration
exports.reviewCriteria = (0, pg_core_1.pgTable)('review_criteria', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull().unique(),
    autoApproveThreshold: (0, pg_core_1.decimal)('auto_approve_threshold', { precision: 3, scale: 2 }).notNull(),
    autoRejectThreshold: (0, pg_core_1.decimal)('auto_reject_threshold', { precision: 3, scale: 2 }).notNull(),
    requireManualReviewFor: (0, pg_core_1.text)('require_manual_review_for').array().default([]).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
