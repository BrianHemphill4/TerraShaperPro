import {
  boolean,
  decimal,
  inet,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { organizations, users } from './auth';
import { projects } from './core';

export const designElements = pgTable('design_elements', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  elementType: varchar('element_type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  positionX: decimal('position_x', { precision: 6, scale: 2 }).notNull(),
  positionY: decimal('position_y', { precision: 6, scale: 2 }).notNull(),
  width: decimal('width', { precision: 6, scale: 2 }),
  height: decimal('height', { precision: 6, scale: 2 }),
  rotation: decimal('rotation', { precision: 5, scale: 2 }).default('0'),
  properties: jsonb('properties').default({}).notNull(),
  layerOrder: integer('layer_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const plants = pgTable('plants', {
  id: uuid('id').defaultRandom().primaryKey(),
  scientificName: varchar('scientific_name', { length: 255 }).notNull(),
  commonNames: text('common_names').array().default([]),
  usdaZones: text('usda_zones').array().default([]),
  waterNeeds: varchar('water_needs', { length: 50 }),
  sunRequirements: varchar('sun_requirements', { length: 50 }),
  matureHeightFt: decimal('mature_height_ft', { precision: 5, scale: 2 }),
  matureWidthFt: decimal('mature_width_ft', { precision: 5, scale: 2 }),
  growthRate: varchar('growth_rate', { length: 50 }),
  texasNative: boolean('texas_native').default(false),
  droughtTolerant: boolean('drought_tolerant').default(false),
  imageUrl: text('image_url'),
  description: text('description'),
  careInstructions: text('care_instructions'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  service: varchar('service', { length: 50 }).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  changes: jsonb('changes'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
