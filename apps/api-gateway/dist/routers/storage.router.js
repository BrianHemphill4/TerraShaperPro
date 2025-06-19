'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.storageRouter = void 0;
const storage_1 = require('@terrashaper/storage');
const server_1 = require('@trpc/server');
const zod_1 = require('zod');
const trpc_1 = require('../trpc');
let storageService = null;
function getStorageService() {
  if (!storageService) {
    try {
      storageService = new storage_1.StorageService();
    } catch (error) {
      console.warn('StorageService initialization failed:', error);
      throw new server_1.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Storage service not configured',
      });
    }
  }
  return storageService;
}
const uploadRequestSchema = zod_1.z.object({
  fileName: zod_1.z.string().min(1).max(255),
  contentType: zod_1.z.string(),
  bucketType: zod_1.z.enum(['renders', 'assets']),
  expiresInMinutes: zod_1.z.number().min(1).max(60).optional().default(15),
});
const fileOperationSchema = zod_1.z.object({
  fileName: zod_1.z.string().min(1),
  bucketType: zod_1.z.enum(['renders', 'assets']),
});
exports.storageRouter = (0, trpc_1.router)({
  // Generate signed upload URL for direct browser uploads
  generateUploadUrl: trpc_1.protectedProcedure
    .input(uploadRequestSchema)
    .mutation(async ({ input }) => {
      const { fileName, contentType, bucketType, expiresInMinutes } = input;
      // Validate file type
      const validation = storage_1.UploadUtils.validateImageFile(contentType);
      if (!validation.valid) {
        throw new server_1.TRPCError({
          code: 'BAD_REQUEST',
          message: validation.error,
        });
      }
      try {
        const result = await storage_1.UploadUtils.generateDirectUploadUrl(
          bucketType,
          fileName,
          contentType,
          expiresInMinutes
        );
        return result;
      } catch {
        throw new server_1.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URL',
        });
      }
    }),
  // Generate signed download URL
  generateDownloadUrl: trpc_1.protectedProcedure
    .input(
      fileOperationSchema.extend({
        expiresInMinutes: zod_1.z.number().min(1).max(1440).optional().default(60), // Max 24 hours
      })
    )
    .query(async ({ input }) => {
      const { fileName, bucketType, expiresInMinutes } = input;
      try {
        const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        const downloadUrl = await getStorageService().generateDownloadUrl(
          bucketType,
          fileName,
          expires
        );
        return {
          downloadUrl,
          fileName,
          expiresAt: expires,
        };
      } catch {
        throw new server_1.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL',
        });
      }
    }),
  // Check if file exists
  fileExists: trpc_1.protectedProcedure.input(fileOperationSchema).query(async ({ input }) => {
    const { fileName, bucketType } = input;
    try {
      const exists = await getStorageService().fileExists(bucketType, fileName);
      return { exists, fileName };
    } catch {
      throw new server_1.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check file existence',
      });
    }
  }),
  // Get file metadata
  getFileMetadata: trpc_1.protectedProcedure.input(fileOperationSchema).query(async ({ input }) => {
    const { fileName, bucketType } = input;
    try {
      const exists = await getStorageService().fileExists(bucketType, fileName);
      if (!exists) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }
      const metadata = await getStorageService().getFileMetadata(bucketType, fileName);
      return {
        fileName,
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        etag: metadata.etag,
      };
    } catch (error) {
      if (error instanceof server_1.TRPCError) {
        throw error;
      }
      throw new server_1.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get file metadata',
      });
    }
  }),
  // Delete file
  deleteFile: trpc_1.protectedProcedure.input(fileOperationSchema).mutation(async ({ input }) => {
    const { fileName, bucketType } = input;
    try {
      const exists = await getStorageService().fileExists(bucketType, fileName);
      if (!exists) {
        throw new server_1.TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }
      await getStorageService().deleteFile(bucketType, fileName);
      return { success: true, fileName };
    } catch (error) {
      if (error instanceof server_1.TRPCError) {
        throw error;
      }
      throw new server_1.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete file',
      });
    }
  }),
  // Generate file name for uploads
  generateFileName: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        type: zod_1.z.enum(['render', 'asset', 'upload']),
        originalFileName: zod_1.z.string().optional(),
        id: zod_1.z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      const { type, originalFileName, id } = input;
      let fileName;
      switch (type) {
        case 'render':
          if (!id) {
            throw new server_1.TRPCError({
              code: 'BAD_REQUEST',
              message: 'ID is required for render files',
            });
          }
          fileName = storage_1.UploadUtils.generateRenderFileName(id);
          break;
        case 'asset':
          if (!id) {
            throw new server_1.TRPCError({
              code: 'BAD_REQUEST',
              message: 'ID is required for asset files',
            });
          }
          fileName = storage_1.UploadUtils.generateAssetFileName(id);
          break;
        case 'upload':
          if (!originalFileName) {
            throw new server_1.TRPCError({
              code: 'BAD_REQUEST',
              message: 'Original file name is required for uploads',
            });
          }
          fileName = storage_1.UploadUtils.generateUserUploadFileName(
            ctx.session.userId,
            originalFileName
          );
          break;
        default:
          throw new server_1.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid file type',
          });
      }
      return { fileName };
    }),
  // Get CORS configuration for client-side uploads
  getCorsConfig: trpc_1.protectedProcedure.query(() => {
    return storage_1.UploadUtils.getCorsConfig();
  }),
});
