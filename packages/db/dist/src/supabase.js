"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkerClient = exports.createAdminClient = exports.createSupabaseServerClient = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
/**
 * Singleton factory for creating and managing Supabase clients.
 * Provides centralized client creation with proper configuration and caching.
 */
class SupabaseClientFactory {
    constructor() {
        this.validateEnvironment();
        this.config = {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        };
    }
    /**
     * Gets the singleton instance of the SupabaseClientFactory.
     * @returns The factory instance
     */
    static getInstance() {
        if (!SupabaseClientFactory.instance) {
            SupabaseClientFactory.instance = new SupabaseClientFactory();
        }
        return SupabaseClientFactory.instance;
    }
    /**
     * Validates that required environment variables are present.
     * @throws {Error} When required environment variables are missing
     */
    validateEnvironment() {
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
    getBrowserClient() {
        if (!this.browserClient) {
            this.browserClient = (0, supabase_js_1.createClient)(this.config.url, this.config.anonKey, {
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
    createServerClient() {
        return (0, supabase_js_1.createClient)(this.config.url, this.config.anonKey, {
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
    getAdminClient() {
        if (!this.config.serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
        }
        if (!this.adminClient) {
            this.adminClient = (0, supabase_js_1.createClient)(this.config.url, this.config.serviceRoleKey, {
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
    createWorkerClient() {
        if (!this.config.serviceRoleKey) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for worker operations');
        }
        return (0, supabase_js_1.createClient)(this.config.url, this.config.serviceRoleKey, {
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
exports.supabase = factory.getBrowserClient();
/**
 * Factory function for creating server-side Supabase clients.
 * Use in API routes and server components.
 */
exports.createSupabaseServerClient = factory.createServerClient.bind(factory);
/**
 * Factory function for creating admin Supabase clients.
 * Has elevated privileges and bypasses Row Level Security.
 */
exports.createAdminClient = factory.getAdminClient.bind(factory);
/**
 * Factory function for creating worker Supabase clients.
 * Optimized for background job processing.
 */
exports.createWorkerClient = factory.createWorkerClient.bind(factory);
