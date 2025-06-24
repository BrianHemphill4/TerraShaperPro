"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogs = exports.apiKeys = exports.plants = exports.designElements = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const auth_1 = require("./auth");
const core_1 = require("./core");
exports.designElements = (0, pg_core_1.pgTable)('design_elements', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id')
        .references(() => core_1.projects.id, { onDelete: 'cascade' })
        .notNull(),
    elementType: (0, pg_core_1.varchar)('element_type', { length: 50 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    positionX: (0, pg_core_1.decimal)('position_x', { precision: 6, scale: 2 }).notNull(),
    positionY: (0, pg_core_1.decimal)('position_y', { precision: 6, scale: 2 }).notNull(),
    width: (0, pg_core_1.decimal)('width', { precision: 6, scale: 2 }),
    height: (0, pg_core_1.decimal)('height', { precision: 6, scale: 2 }),
    rotation: (0, pg_core_1.decimal)('rotation', { precision: 5, scale: 2 }).default('0'),
    properties: (0, pg_core_1.jsonb)('properties').default({}).notNull(),
    layerOrder: (0, pg_core_1.integer)('layer_order').default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.plants = (0, pg_core_1.pgTable)('plants', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    scientificName: (0, pg_core_1.varchar)('scientific_name', { length: 255 }).notNull(),
    commonNames: (0, pg_core_1.text)('common_names').array().default([]),
    usdaZones: (0, pg_core_1.text)('usda_zones').array().default([]),
    waterNeeds: (0, pg_core_1.varchar)('water_needs', { length: 50 }),
    sunRequirements: (0, pg_core_1.varchar)('sun_requirements', { length: 50 }),
    matureHeightFt: (0, pg_core_1.decimal)('mature_height_ft', { precision: 5, scale: 2 }),
    matureWidthFt: (0, pg_core_1.decimal)('mature_width_ft', { precision: 5, scale: 2 }),
    growthRate: (0, pg_core_1.varchar)('growth_rate', { length: 50 }),
    texasNative: (0, pg_core_1.boolean)('texas_native').default(false),
    droughtTolerant: (0, pg_core_1.boolean)('drought_tolerant').default(false),
    imageUrl: (0, pg_core_1.text)('image_url'),
    description: (0, pg_core_1.text)('description'),
    careInstructions: (0, pg_core_1.text)('care_instructions'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.apiKeys = (0, pg_core_1.pgTable)('api_keys', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id')
        .references(() => auth_1.organizations.id, { onDelete: 'cascade' })
        .notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    keyHash: (0, pg_core_1.varchar)('key_hash', { length: 255 }).notNull(),
    service: (0, pg_core_1.varchar)('service', { length: 50 }).notNull(),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at', { withTimezone: true }),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    organizationId: (0, pg_core_1.uuid)('organization_id').references(() => auth_1.organizations.id, {
        onDelete: 'cascade',
    }),
    userId: (0, pg_core_1.uuid)('user_id').references(() => auth_1.users.id, { onDelete: 'set null' }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    resourceType: (0, pg_core_1.varchar)('resource_type', { length: 50 }),
    resourceId: (0, pg_core_1.uuid)('resource_id'),
    changes: (0, pg_core_1.jsonb)('changes'),
    ipAddress: (0, pg_core_1.inet)('ip_address'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
