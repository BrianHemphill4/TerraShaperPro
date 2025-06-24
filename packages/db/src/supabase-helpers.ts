import { supabase, createAdminClient } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer,
  options?: {
    contentType?: string;
    upsert?: boolean;
  }
): Promise<{ data?: { path: string; url: string }; error?: Error }> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: options?.contentType,
    upsert: options?.upsert || false,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    data: {
      path: data.path,
      url: urlData.publicUrl,
    },
  };
}

/**
 * Get a signed URL for private file access
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<{ data?: string; error?: Error }> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data: data.signedUrl };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, paths: string[]): Promise<{ error?: Error }> {
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    return { error: new Error(error.message) };
  }

  return {};
}

/**
 * List files in a storage bucket folder
 */
export async function listFiles(
  bucket: string,
  folder: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: {
      column: string;
      order: 'asc' | 'desc';
    };
  }
): Promise<{ data?: any[]; error?: Error }> {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: options?.limit || 100,
    offset: options?.offset || 0,
    sortBy: options?.sortBy,
  });

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data };
}

/**
 * Helper to check if user has permission for an action
 */
export async function checkPermission(
  _userId: string,
  _resource: 'project' | 'scene' | 'render' | 'template',
  _resourceId: string,
  _action: 'view' | 'create' | 'update' | 'delete'
): Promise<boolean> {
  // This would typically call a database function or check RLS policies
  // For now, return true as a placeholder
  return true;
}

/**
 * Get organization storage usage
 */
export async function getOrganizationStorageUsage(
  organizationId: string
): Promise<{ data?: { totalBytes: number; fileCount: number }; error?: Error }> {
  const adminClient = createAdminClient();

  let totalBytes = 0;
  let fileCount = 0;

  const buckets = ['project-uploads', 'renders', 'templates'];

  for (const bucket of buckets) {
    const { data, error } = await adminClient.storage.from(bucket).list(organizationId, {
      limit: 1000,
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data) {
      fileCount += data.length;
      totalBytes += data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    }
  }

  return {
    data: {
      totalBytes,
      fileCount,
    },
  };
}

/**
 * Create a new project with proper permissions
 */
export async function createProject(
  client: SupabaseClient,
  project: {
    name: string;
    description?: string;
    clientName?: string;
    address?: string;
    metadata?: any;
  }
): Promise<{ data?: any; error?: Error }> {
  const { data, error } = await client.from('projects').insert(project).select().single();

  if (error) {
    return { error: new Error(error.message) };
  }

  return { data };
}
