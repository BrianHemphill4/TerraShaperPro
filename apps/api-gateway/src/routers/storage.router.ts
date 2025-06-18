import { StorageService, UploadUtils } from '@terrashaper/storage';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, router } from '../trpc';

const storageService = new StorageService();

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string(),
  bucketType: z.enum(['renders', 'assets']),
  expiresInMinutes: z.number().min(1).max(60).optional().default(15),
});

const fileOperationSchema = z.object({
  fileName: z.string().min(1),
  bucketType: z.enum(['renders', 'assets']),
});

export const storageRouter = router({
  // Generate signed upload URL for direct browser uploads
  generateUploadUrl: protectedProcedure.input(uploadRequestSchema).mutation(async ({ input }) => {
    const { fileName, contentType, bucketType, expiresInMinutes } = input;

    // Validate file type
    const validation = UploadUtils.validateImageFile(contentType);
    if (!validation.valid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: validation.error,
      });
    }

    try {
      const result = await UploadUtils.generateDirectUploadUrl(
        bucketType,
        fileName,
        contentType,
        expiresInMinutes
      );

      return result;
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate upload URL',
      });
    }
  }),

  // Generate signed download URL
  generateDownloadUrl: protectedProcedure
    .input(
      fileOperationSchema.extend({
        expiresInMinutes: z.number().min(1).max(1440).optional().default(60), // Max 24 hours
      })
    )
    .query(async ({ input }) => {
      const { fileName, bucketType, expiresInMinutes } = input;

      try {
        const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        const downloadUrl = await storageService.generateDownloadUrl(bucketType, fileName, expires);

        return {
          downloadUrl,
          fileName,
          expiresAt: expires,
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL',
        });
      }
    }),

  // Check if file exists
  fileExists: protectedProcedure.input(fileOperationSchema).query(async ({ input }) => {
    const { fileName, bucketType } = input;

    try {
      const exists = await storageService.fileExists(bucketType, fileName);
      return { exists, fileName };
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check file existence',
      });
    }
  }),

  // Get file metadata
  getFileMetadata: protectedProcedure.input(fileOperationSchema).query(async ({ input }) => {
    const { fileName, bucketType } = input;

    try {
      const exists = await storageService.fileExists(bucketType, fileName);
      if (!exists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      const metadata = await storageService.getFileMetadata(bucketType, fileName);

      return {
        fileName,
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        etag: metadata.etag,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get file metadata',
      });
    }
  }),

  // Delete file
  deleteFile: protectedProcedure.input(fileOperationSchema).mutation(async ({ input }) => {
    const { fileName, bucketType } = input;

    try {
      const exists = await storageService.fileExists(bucketType, fileName);
      if (!exists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      await storageService.deleteFile(bucketType, fileName);

      return { success: true, fileName };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete file',
      });
    }
  }),

  // Generate file name for uploads
  generateFileName: protectedProcedure
    .input(
      z.object({
        type: z.enum(['render', 'asset', 'upload']),
        originalFileName: z.string().optional(),
        id: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      const { type, originalFileName, id } = input;

      let fileName: string;

      switch (type) {
        case 'render':
          if (!id) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'ID is required for render files',
            });
          }
          fileName = UploadUtils.generateRenderFileName(id);
          break;

        case 'asset':
          if (!id) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'ID is required for asset files',
            });
          }
          fileName = UploadUtils.generateAssetFileName(id);
          break;

        case 'upload':
          if (!originalFileName) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Original file name is required for uploads',
            });
          }
          fileName = UploadUtils.generateUserUploadFileName(ctx.session.userId, originalFileName);
          break;

        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid file type',
          });
      }

      return { fileName };
    }),

  // Get CORS configuration for client-side uploads
  getCorsConfig: protectedProcedure.query(() => {
    return UploadUtils.getCorsConfig();
  }),
});
