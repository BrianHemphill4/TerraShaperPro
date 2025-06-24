import type { SupabaseClient } from '@supabase/supabase-js';
/**
 * Upload a file to Supabase Storage
 */
export declare function uploadFile(bucket: string, path: string, file: File | Blob | ArrayBuffer, options?: {
    contentType?: string;
    upsert?: boolean;
}): Promise<{
    data?: {
        path: string;
        url: string;
    };
    error?: Error;
}>;
/**
 * Get a signed URL for private file access
 */
export declare function getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<{
    data?: string;
    error?: Error;
}>;
/**
 * Delete a file from Supabase Storage
 */
export declare function deleteFile(bucket: string, paths: string[]): Promise<{
    error?: Error;
}>;
/**
 * List files in a storage bucket folder
 */
export declare function listFiles(bucket: string, folder: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: {
        column: string;
        order: 'asc' | 'desc';
    };
}): Promise<{
    data?: any[];
    error?: Error;
}>;
/**
 * Helper to check if user has permission for an action
 */
export declare function checkPermission(_userId: string, _resource: 'project' | 'scene' | 'render' | 'template', _resourceId: string, _action: 'view' | 'create' | 'update' | 'delete'): Promise<boolean>;
/**
 * Get organization storage usage
 */
export declare function getOrganizationStorageUsage(organizationId: string): Promise<{
    data?: {
        totalBytes: number;
        fileCount: number;
    };
    error?: Error;
}>;
/**
 * Create a new project with proper permissions
 */
export declare function createProject(client: SupabaseClient, project: {
    name: string;
    description?: string;
    clientName?: string;
    address?: string;
    metadata?: any;
}): Promise<{
    data?: any;
    error?: Error;
}>;
//# sourceMappingURL=supabase-helpers.d.ts.map