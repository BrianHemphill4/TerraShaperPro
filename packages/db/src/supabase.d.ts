import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
/**
 * Type definition for a typed Supabase client with the application's database schema.
 */
export type SupabaseClientType = SupabaseClient<Database>;
/**
 * Default browser Supabase client instance.
 * Pre-configured for frontend use with session persistence.
 */
export declare const supabase: SupabaseClientType;
/**
 * Factory function for creating server-side Supabase clients.
 * Use in API routes and server components.
 */
export declare const createSupabaseServerClient: () => SupabaseClientType;
/**
 * Factory function for creating admin Supabase clients.
 * Has elevated privileges and bypasses Row Level Security.
 */
export declare const createAdminClient: () => SupabaseClientType;
/**
 * Factory function for creating worker Supabase clients.
 * Optimized for background job processing.
 */
export declare const createWorkerClient: () => SupabaseClientType;
/**
 * Database schema type definition.
 * Contains all table definitions and relationships.
 */
export type { Database };
//# sourceMappingURL=supabase.d.ts.map