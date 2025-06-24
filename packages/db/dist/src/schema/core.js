"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renders = exports.masks = exports.scenes = exports.templates = exports.projects = exports.renderQualityStatusEnum = exports.renderProviderEnum = exports.renderStatusEnum = exports.projectStatusEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const auth_1 = require("./auth");
exports.projectStatusEnum = (0, pg_core_1.pgEnum)('project_status', ['draft', 'active', 'archived']);
exports.renderStatusEnum = (0, pg_core_1.pgEnum)('render_status', [
    'pending',
    'processing',
    'completed',
    'failed',
]);
exports.renderProviderEnum = (0, pg_core_1.pgEnum)('render_provider', ['google-imagen', 'openai-dalle']);
exports.renderQualityStatusEnum = (0, pg_core_1.pgEnum)('render_quality_status', [
    'pending_review',
    'approved',
    'rejected',
    'auto_approved',
]);
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id')
        .references(() => auth_1.organizations.id, { onDelete: 'cascade' })
        .notNull(),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => auth_1.users.id, { onDelete: 'set null' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    address: (0, pg_core_1.text)('address'),
    // postgis geometry fields are not directly supported in drizzle, we use text for now
    location: (0, pg_core_1.text)('location'),
    propertySizeSqft: (0, pg_core_1.integer)('property_size_sqft'),
    budgetMin: (0, pg_core_1.decimal)('budget_min', { precision: 10, scale: 2 }),
    budgetMax: (0, pg_core_1.decimal)('budget_max', { precision: 10, scale: 2 }),
    status: (0, exports.projectStatusEnum)('status').default('draft').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata').default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.templates = (0, pg_core_1.pgTable)('templates', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => auth_1.organizations.id, {
        onDelete: 'cascade',
    }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    isPublic: (0, pg_core_1.boolean)('is_public').default(false).notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 100 }),
    tags: (0, pg_core_1.text)('tags').array().default([]),
    designData: (0, pg_core_1.jsonb)('design_data').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.scenes = (0, pg_core_1.pgTable)('scenes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .references(() => exports.projects.id, { onDelete: 'cascade' })
        .notNull(),
    imageUrl: (0, pg_core_1.text)('image_url').notNull(),
    order: (0, pg_core_1.integer)('order').notNull(),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    projectIdIdx: (0, pg_core_1.index)('idx_scenes_project_id').on(table.projectId),
}));
exports.masks = (0, pg_core_1.pgTable)('masks', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    sceneId: (0, pg_core_1.uuid)('scene_id')
        .references(() => exports.scenes.id, { onDelete: 'cascade' })
        .notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 50 }).notNull(),
    path: (0, pg_core_1.jsonb)('path').notNull(),
    deleted: (0, pg_core_1.boolean)('deleted').default(false).notNull(),
    authorId: (0, pg_core_1.uuid)('author_id').references(() => auth_1.users.id, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    sceneIdIdx: (0, pg_core_1.index)('idx_masks_scene_id').on(table.sceneId),
    categoryIdx: (0, pg_core_1.index)('idx_masks_category').on(table.category),
}));
exports.renders = (0, pg_core_1.pgTable)('renders', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    sceneId: (0, pg_core_1.uuid)('scene_id')
        .references(() => exports.scenes.id, { onDelete: 'cascade' })
        .notNull(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .references(() => exports.projects.id, { onDelete: 'cascade' })
        .notNull(),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => auth_1.users.id, { onDelete: 'set null' }),
    prompt: (0, pg_core_1.text)('prompt').notNull(),
    enhancedPrompt: (0, pg_core_1.text)('enhanced_prompt'),
    imageUrl: (0, pg_core_1.text)('image_url'),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    provider: (0, exports.renderProviderEnum)('provider').notNull(),
    status: (0, exports.renderStatusEnum)('status').default('pending').notNull(),
    qualityStatus: (0, exports.renderQualityStatusEnum)('quality_status'),
    resolution: (0, pg_core_1.varchar)('resolution', { length: 20 }).default('4K').notNull(),
    processingTimeMs: (0, pg_core_1.integer)('processing_time_ms'),
    errorMessage: (0, pg_core_1.text)('error_message'),
    settings: (0, pg_core_1.jsonb)('settings').default({}).notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata').default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
}, (table) => ({
    sceneIdIdx: (0, pg_core_1.index)('idx_renders_scene_id').on(table.sceneId),
}));
