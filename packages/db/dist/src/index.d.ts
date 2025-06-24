import { Pool } from 'pg';
import * as schema from './schema';
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
export * from './schema';
export * from './supabase';
export * from './supabase-helpers';
export { eq, and } from 'drizzle-orm';
