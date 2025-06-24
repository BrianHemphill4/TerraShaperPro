import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { organizations, users } from './auth';

export const projectStatusEnum = pgEnum('project_status', ['draft', 'active', 'archived']);
export const renderStatusEnum = pgEnum('render_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);
export const renderProviderEnum = pgEnum('render_provider', ['google-imagen', 'openai-dalle']);
export const renderQualityStatusEnum = pgEnum('render_quality_status', [
  'pending_review',
  'approved',
  'rejected',
  'auto_approved',
]);

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  address: text('address'),
  // postgis geometry fields are not directly supported in drizzle, we use text for now
  location: text('location'),
  propertySizeSqft: integer('property_size_sqft'),
  budgetMin: decimal('budget_min', { precision: 10, scale: 2 }),
  budgetMax: decimal('budget_max', { precision: 10, scale: 2 }),
  status: projectStatusEnum('status').default('draft').notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  isPublic: boolean('is_public').default(false).notNull(),
  category: varchar('category', { length: 100 }),
  tags: text('tags').array().default([]),
  designData: jsonb('design_data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const scenes = pgTable(
  'scenes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    imageUrl: text('image_url').notNull(),
    order: integer('order').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index('idx_scenes_project_id').on(table.projectId),
  })
);

export const masks = pgTable(
  'masks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sceneId: uuid('scene_id')
      .references(() => scenes.id, { onDelete: 'cascade' })
      .notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    path: jsonb('path').notNull(),
    deleted: boolean('deleted').default(false).notNull(),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sceneIdIdx: index('idx_masks_scene_id').on(table.sceneId),
    categoryIdx: index('idx_masks_category').on(table.category),
  })
);

export const renders = pgTable(
  'renders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sceneId: uuid('scene_id')
      .references(() => scenes.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    prompt: text('prompt').notNull(),
    enhancedPrompt: text('enhanced_prompt'),
    imageUrl: text('image_url'),
    thumbnailUrl: text('thumbnail_url'),
    provider: renderProviderEnum('provider').notNull(),
    status: renderStatusEnum('status').default('pending').notNull(),
    qualityStatus: renderQualityStatusEnum('quality_status'),
    resolution: varchar('resolution', { length: 20 }).default('4K').notNull(),
    processingTimeMs: integer('processing_time_ms'),
    errorMessage: text('error_message'),
    settings: jsonb('settings').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    sceneIdIdx: index('idx_renders_scene_id').on(table.sceneId),
  })
);

export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
export type Mask = typeof masks.$inferSelect;
export type NewMask = typeof masks.$inferInsert;
