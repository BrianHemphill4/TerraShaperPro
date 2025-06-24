import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

/**
 * Type definition for a typed Supabase client with the application's database schema.
 */
export type SupabaseClientType = SupabaseClient<Database>;

/**
 * Configuration interface for Supabase client initialization.
 */
interface SupabaseConfig {
  /** The public Supabase URL */
  url: string;
  /** The anonymous/public key for client authentication */
  anonKey: string;
  /** Optional service role key for admin operations */
  serviceRoleKey?: string;
}

/**
 * Singleton factory for creating and managing Supabase clients.
 * Provides centralized client creation with proper configuration and caching.
 */
class SupabaseClientFactory {
  private static instance: SupabaseClientFactory;
  private config: SupabaseConfig;
  private adminClient?: SupabaseClientType;
  private browserClient?: SupabaseClientType;

  private constructor() {
    this.validateEnvironment();
    this.config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  /**
   * Gets the singleton instance of the SupabaseClientFactory.
   * @returns The factory instance
   */
  public static getInstance(): SupabaseClientFactory {
    if (!SupabaseClientFactory.instance) {
      SupabaseClientFactory.instance = new SupabaseClientFactory();
    }
    return SupabaseClientFactory.instance;
  }

  /**
   * Validates that required environment variables are present.
   * @throws {Error} When required environment variables are missing
   */
  private validateEnvironment(): void {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    }
  }

  /**
   * Gets a browser client suitable for frontend use.
   * Includes session persistence and auto-refresh for better UX.
   * @returns A configured Supabase client for browser environments
   */
  public getBrowserClient(): SupabaseClientType {
    if (!this.browserClient) {
      this.browserClient = createClient<Database>(this.config.url, this.config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return this.browserClient;
  }

  /**
   * Creates a server client for API routes and server-side operations.
   * Does not persist sessions as they're managed by the server.
   * @returns A configured Supabase client for server environments
   */
  public createServerClient(): SupabaseClientType {
    return createClient<Database>(this.config.url, this.config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
    });
  }

  /**
   * Gets an admin client with elevated privileges for administrative operations.
   * Uses the service role key to bypass RLS policies.
   * @returns A configured admin Supabase client
   * @throws {Error} When SUPABASE_SERVICE_ROLE_KEY is not configured
   */
  public getAdminClient(): SupabaseClientType {
    if (!this.config.serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
    }

    if (!this.adminClient) {
      this.adminClient = createClient<Database>(this.config.url, this.config.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return this.adminClient;
  }

  /**
   * Creates a worker client for background jobs and queue processing.
   * Uses service role key but creates a new instance for each call.
   * @returns A configured Supabase client for worker environments
   * @throws {Error} When SUPABASE_SERVICE_ROLE_KEY is not configured
   */
  public createWorkerClient(): SupabaseClientType {
    if (!this.config.serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for worker operations');
    }

    return createClient<Database>(this.config.url, this.config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

const factory = SupabaseClientFactory.getInstance();

/**
 * Default browser Supabase client instance.
 * Pre-configured for frontend use with session persistence.
 */
export const supabase = factory.getBrowserClient();

/**
 * Factory function for creating server-side Supabase clients.
 * Use in API routes and server components.
 */
export const createSupabaseServerClient = factory.createServerClient.bind(factory);

/**
 * Factory function for creating admin Supabase clients.
 * Has elevated privileges and bypasses Row Level Security.
 */
export const createAdminClient = factory.getAdminClient.bind(factory);

/**
 * Factory function for creating worker Supabase clients.
 * Optimized for background job processing.
 */
export const createWorkerClient = factory.createWorkerClient.bind(factory);

/**
 * Database schema type definition.
 * Contains all table definitions and relationships.
 */
export type { Database };
