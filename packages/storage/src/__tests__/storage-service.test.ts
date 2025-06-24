import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBucket } from '../client';
import { getStorageConfig } from '../config';
import { ImageProcessor } from '../image-processor';
import { StorageService } from '../storage-service';
import type { ImageOptimizationOptions, StorageBucket, UploadOptions } from '../types';

// Mock dependencies
vi.mock('../client');
vi.mock('../config');
vi.mock('../image-processor');
vi.mock('mime-types', () => ({
  lookup: vi.fn((fileName: string) => {
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'image/jpeg';
    if (fileName.endsWith('.png')) return 'image/png';
    if (fileName.endsWith('.webp')) return 'image/webp';
    return null;
  }),
}));

const mockGetBucket = vi.mocked(getBucket);
const mockGetStorageConfig = vi.mocked(getStorageConfig);
const mockImageProcessor = vi.mocked(ImageProcessor);

describe('StorageService', () => {
  let storageService: StorageService;
  let mockBucket: any;
  let mockFile: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock file object
    mockFile = {
      save: vi.fn(),
      makePublic: vi.fn(),
      exists: vi.fn(),
      delete: vi.fn(),
      getSignedUrl: vi.fn(),
      copy: vi.fn(),
      getMetadata: vi.fn(),
    };

    // Mock bucket object
    mockBucket = {
      file: vi.fn(() => mockFile),
    };

    // Mock bucket getter
    mockGetBucket.mockReturnValue(mockBucket);

    // Mock config
    mockGetStorageConfig.mockReturnValue({
      rendersBucket: 'test-renders-bucket',
      assetsBucket: 'test-assets-bucket',
      cdnUrl: 'https://cdn.example.com',
    });

    storageService = new StorageService();
  });

  describe('uploadFile', () => {
    const mockBuffer = Buffer.from('test file content');
    const uploadOptions: UploadOptions = {
      bucket: 'renders',
      fileName: 'test-image.jpg',
      buffer: mockBuffer,
      contentType: 'image/jpeg',
      metadata: { userId: 'user-123' },
      makePublic: true,
    };

    it('should upload file successfully', async () => {
      mockFile.save.mockResolvedValue(undefined);
      mockFile.makePublic.mockResolvedValue(undefined);

      const result = await storageService.uploadFile(uploadOptions);

      expect(mockBucket.file).toHaveBeenCalledWith('test-image.jpg');
      expect(mockFile.save).toHaveBeenCalledWith(mockBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: { userId: 'user-123' },
        },
        resumable: false,
      });
      expect(mockFile.makePublic).toHaveBeenCalled();

      expect(result).toEqual({
        fileName: 'test-image.jpg',
        bucket: 'test-renders-bucket',
        publicUrl: expect.any(String),
        size: mockBuffer.length,
        contentType: 'image/jpeg',
      });
    });

    it('should not make file public when makePublic is false', async () => {
      mockFile.save.mockResolvedValue(undefined);

      await storageService.uploadFile({
        ...uploadOptions,
        makePublic: false,
      });

      expect(mockFile.makePublic).not.toHaveBeenCalled();
    });

    it('should detect content type from file name when not provided', async () => {
      mockFile.save.mockResolvedValue(undefined);

      await storageService.uploadFile({
        ...uploadOptions,
        contentType: undefined,
      });

      expect(mockFile.save).toHaveBeenCalledWith(mockBuffer, {
        metadata: {
          contentType: 'image/jpeg', // Should detect from .jpg extension
          metadata: { userId: 'user-123' },
        },
        resumable: false,
      });
    });

    it('should use default content type for unknown file types', async () => {
      mockFile.save.mockResolvedValue(undefined);

      await storageService.uploadFile({
        ...uploadOptions,
        fileName: 'test-file.unknown',
        contentType: undefined,
      });

      expect(mockFile.save).toHaveBeenCalledWith(mockBuffer, {
        metadata: {
          contentType: 'application/octet-stream',
          metadata: { userId: 'user-123' },
        },
        resumable: false,
      });
    });

    it('should handle upload errors', async () => {
      const uploadError = new Error('Upload failed');
      mockFile.save.mockRejectedValue(uploadError);

      await expect(storageService.uploadFile(uploadOptions)).rejects.toThrow('Upload failed');
    });

    it('should handle makePublic errors', async () => {
      mockFile.save.mockResolvedValue(undefined);
      const publicError = new Error('Make public failed');
      mockFile.makePublic.mockRejectedValue(publicError);

      await expect(storageService.uploadFile(uploadOptions)).rejects.toThrow('Make public failed');
    });

    it('should use correct bucket for assets', async () => {
      mockFile.save.mockResolvedValue(undefined);

      const result = await storageService.uploadFile({
        ...uploadOptions,
        bucket: 'assets' as StorageBucket,
      });

      expect(result.bucket).toBe('test-assets-bucket');
    });
  });

  describe('uploadImage', () => {
    const mockBuffer = Buffer.from('test image content');
    const optimizationOptions: ImageOptimizationOptions = {
      quality: 80,
      width: 1024,
      height: 768,
      format: 'jpeg',
    };

    beforeEach(() => {
      mockFile.save.mockResolvedValue(undefined);
      mockFile.makePublic.mockResolvedValue(undefined);

      mockImageProcessor.optimizeImage.mockResolvedValue({
        buffer: Buffer.from('optimized image'),
        contentType: 'image/jpeg',
        metadata: { width: 1024, height: 768 },
      });

      mockImageProcessor.createThumbnail.mockResolvedValue(Buffer.from('thumbnail image'));
    });

    it('should upload image with optimization', async () => {
      const result = await storageService.uploadImage(
        'renders',
        'test-image.jpg',
        mockBuffer,
        optimizationOptions
      );

      expect(mockImageProcessor.optimizeImage).toHaveBeenCalledWith(
        mockBuffer,
        optimizationOptions
      );
      expect(mockFile.save).toHaveBeenCalledTimes(2); // original + thumbnail
      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('thumbnail');
    });

    it('should upload image without optimization', async () => {
      const result = await storageService.uploadImage('renders', 'test-image.jpg', mockBuffer);

      expect(mockImageProcessor.optimizeImage).not.toHaveBeenCalled();
      expect(mockImageProcessor.createThumbnail).toHaveBeenCalledWith(mockBuffer);
      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('thumbnail');
    });

    it('should not create thumbnail when thumbnail option is true', async () => {
      const thumbnailOptions = { ...optimizationOptions, thumbnail: true };

      const result = await storageService.uploadImage(
        'renders',
        'test-image.jpg',
        mockBuffer,
        thumbnailOptions
      );

      expect(mockImageProcessor.createThumbnail).not.toHaveBeenCalled();
      expect(result.thumbnail).toBeUndefined();
    });

    it('should handle optimization errors', async () => {
      const optimizationError = new Error('Optimization failed');
      mockImageProcessor.optimizeImage.mockRejectedValue(optimizationError);

      await expect(
        storageService.uploadImage('renders', 'test-image.jpg', mockBuffer, optimizationOptions)
      ).rejects.toThrow('Optimization failed');
    });

    it('should handle thumbnail creation errors', async () => {
      const thumbnailError = new Error('Thumbnail creation failed');
      mockImageProcessor.createThumbnail.mockRejectedValue(thumbnailError);

      await expect(
        storageService.uploadImage('renders', 'test-image.jpg', mockBuffer)
      ).rejects.toThrow('Thumbnail creation failed');
    });
  });

  describe('getPublicUrl', () => {
    it('should generate correct public URL', () => {
      const url = storageService.getPublicUrl('test-bucket', 'test-file.jpg');

      expect(url).toBe('https://cdn.example.com/test-bucket/test-file.jpg');
    });

    it('should handle special characters in file names', () => {
      const url = storageService.getPublicUrl('test-bucket', 'test file with spaces.jpg');

      expect(url).toContain('test file with spaces.jpg');
    });
  });

  describe('getThumbnailFileName', () => {
    it('should generate thumbnail filename', () => {
      const thumbnailName = storageService.getThumbnailFileName('image.jpg');

      expect(thumbnailName).toBe('image_thumb.webp');
    });

    it('should handle files with multiple dots', () => {
      const thumbnailName = storageService.getThumbnailFileName('my.image.file.png');

      expect(thumbnailName).toBe('my.image.file_thumb.webp');
    });

    it('should handle files without extension', () => {
      const thumbnailName = storageService.getThumbnailFileName('image');

      expect(thumbnailName).toBe('image_thumb.webp');
    });
  });

  describe('fileExists', () => {
    it('should check if file exists', async () => {
      mockFile.exists.mockResolvedValue([true]);

      const exists = await storageService.fileExists('renders', 'test-file.jpg');

      expect(mockBucket.file).toHaveBeenCalledWith('test-file.jpg');
      expect(mockFile.exists).toHaveBeenCalled();
      expect(exists).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      mockFile.exists.mockResolvedValue([false]);

      const exists = await storageService.fileExists('renders', 'test-file.jpg');

      expect(exists).toBe(false);
    });

    it('should handle exists() errors', async () => {
      const existsError = new Error('Exists check failed');
      mockFile.exists.mockRejectedValue(existsError);

      await expect(storageService.fileExists('renders', 'test-file.jpg')).rejects.toThrow(
        'Exists check failed'
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockFile.delete.mockResolvedValue(undefined);

      await storageService.deleteFile('renders', 'test-file.jpg');

      expect(mockBucket.file).toHaveBeenCalledWith('test-file.jpg');
      expect(mockFile.delete).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const deleteError = new Error('Delete failed');
      mockFile.delete.mockRejectedValue(deleteError);

      await expect(storageService.deleteFile('renders', 'test-file.jpg')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);
      mockFile.save.mockResolvedValue(undefined);

      const result = await storageService.uploadFile({
        bucket: 'renders',
        fileName: 'empty.txt',
        buffer: emptyBuffer,
      });

      expect(result.size).toBe(0);
    });

    it('should handle very large file names', async () => {
      const longFileName = `${'a'.repeat(1000)}.jpg`;
      mockFile.save.mockResolvedValue(undefined);

      await storageService.uploadFile({
        bucket: 'renders',
        fileName: longFileName,
        buffer: Buffer.from('test'),
      });

      expect(mockBucket.file).toHaveBeenCalledWith(longFileName);
    });

    it('should handle undefined metadata', async () => {
      mockFile.save.mockResolvedValue(undefined);

      await storageService.uploadFile({
        bucket: 'renders',
        fileName: 'test.jpg',
        buffer: Buffer.from('test'),
        metadata: undefined,
      });

      expect(mockFile.save).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          metadata: {
            contentType: expect.any(String),
            metadata: {},
          },
        })
      );
    });
  });
});
