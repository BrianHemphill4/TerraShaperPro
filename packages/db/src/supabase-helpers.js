var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase, createAdminClient } from './supabase';
/**
 * Upload a file to Supabase Storage
 */
export function uploadFile(bucket, path, file, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase.storage.from(bucket).upload(path, file, {
            contentType: options === null || options === void 0 ? void 0 : options.contentType,
            upsert: (options === null || options === void 0 ? void 0 : options.upsert) || false,
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
    });
}
/**
 * Get a signed URL for private file access
 */
export function getSignedUrl(bucket_1, path_1) {
    return __awaiter(this, arguments, void 0, function* (bucket, path, expiresIn = 3600) {
        const { data, error } = yield supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
        if (error) {
            return { error: new Error(error.message) };
        }
        return { data: data.signedUrl };
    });
}
/**
 * Delete a file from Supabase Storage
 */
export function deleteFile(bucket, paths) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase.storage.from(bucket).remove(paths);
        if (error) {
            return { error: new Error(error.message) };
        }
        return {};
    });
}
/**
 * List files in a storage bucket folder
 */
export function listFiles(bucket, folder, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield supabase.storage.from(bucket).list(folder, {
            limit: (options === null || options === void 0 ? void 0 : options.limit) || 100,
            offset: (options === null || options === void 0 ? void 0 : options.offset) || 0,
            sortBy: options === null || options === void 0 ? void 0 : options.sortBy,
        });
        if (error) {
            return { error: new Error(error.message) };
        }
        return { data };
    });
}
/**
 * Helper to check if user has permission for an action
 */
export function checkPermission(_userId, _resource, _resourceId, _action) {
    return __awaiter(this, void 0, void 0, function* () {
        // This would typically call a database function or check RLS policies
        // For now, return true as a placeholder
        return true;
    });
}
/**
 * Get organization storage usage
 */
export function getOrganizationStorageUsage(organizationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminClient = createAdminClient();
        let totalBytes = 0;
        let fileCount = 0;
        const buckets = ['project-uploads', 'renders', 'templates'];
        for (const bucket of buckets) {
            const { data, error } = yield adminClient.storage.from(bucket).list(organizationId, {
                limit: 1000,
            });
            if (error) {
                return { error: new Error(error.message) };
            }
            if (data) {
                fileCount += data.length;
                totalBytes += data.reduce((sum, file) => { var _a; return sum + (((_a = file.metadata) === null || _a === void 0 ? void 0 : _a.size) || 0); }, 0);
            }
        }
        return {
            data: {
                totalBytes,
                fileCount,
            },
        };
    });
}
/**
 * Create a new project with proper permissions
 */
export function createProject(client, project) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield client.from('projects').insert(project).select().single();
        if (error) {
            return { error: new Error(error.message) };
        }
        return { data };
    });
}
