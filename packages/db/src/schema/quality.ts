import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  decimal,
  jsonb,
  boolean,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { renders, projects } from './core';
import { users } from './auth';

export const qualityStatusEnum = pgEnum('quality_status', [
  'pending',
  'approved',
  'rejected',
  'auto_approved',
]);
export const alertSeverityEnum = pgEnum('alert_severity', ['low', 'medium', 'high', 'critical']);

// Quality reviews table
export const qualityReviews = pgTable('quality_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  renderId: uuid('render_id')
    .references(() => renders.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  qualityScore: decimal('quality_score', { precision: 3, scale: 2 }).notNull(),
  issues: text('issues').array().default([]).notNull(),
  status: qualityStatusEnum('status').default('pending').notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Failure alerts table
export const failureAlerts = pgTable('failure_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  severity: alertSeverityEnum('severity').notNull(),
  message: text('message').notNull(),
  details: jsonb('details').default({}).notNull(),
  acknowledged: boolean('acknowledged').default(false).notNull(),
  acknowledgedBy: uuid('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Quality metrics table for tracking trends
export const qualityMetrics = pgTable('quality_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  totalRenders: integer('total_renders').notNull(),
  failedRenders: integer('failed_renders').notNull(),
  avgQualityScore: decimal('avg_quality_score', { precision: 3, scale: 2 }),
  avgProcessingTime: integer('avg_processing_time_ms'),
  providerMetrics: jsonb('provider_metrics').default({}).notNull(),
  issueBreakdown: jsonb('issue_breakdown').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Perceptual hash index for duplicate detection
export const perceptualHashes = pgTable('perceptual_hashes', {
  id: uuid('id').defaultRandom().primaryKey(),
  renderId: uuid('render_id')
    .references(() => renders.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  hash: varchar('hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Review criteria configuration
export const reviewCriteria = pgTable('review_criteria', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  autoApproveThreshold: decimal('auto_approve_threshold', { precision: 3, scale: 2 }).notNull(),
  autoRejectThreshold: decimal('auto_reject_threshold', { precision: 3, scale: 2 }).notNull(),
  requireManualReviewFor: text('require_manual_review_for').array().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
