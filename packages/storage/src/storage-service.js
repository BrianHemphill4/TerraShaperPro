"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const mime_types_1 = require("mime-types");
const client_1 = require("./client");
const config_1 = require("./config");
const image_processor_1 = require("./image-processor");
class StorageService {
    config = (0, config_1.getStorageConfig)();
    async uploadFile(options) {
        const { bucket: bucketType, fileName, buffer, contentType, metadata = {}, makePublic = false, } = options;
        const bucket = (0, client_1.getBucket)(bucketType);
        const file = bucket.file(fileName);
        // Determine content type
        const finalContentType = contentType || (0, mime_types_1.lookup)(fileName) || 'application/octet-stream';
        // Upload file
        await file.save(buffer, {
            metadata: {
                contentType: finalContentType,
                metadata,
            },
            resumable: false,
        });
        // Make public if requested
        if (makePublic) {
            await file.makePublic();
        }
        const bucketName = bucketType === 'renders' ? this.config.rendersBucket : this.config.assetsBucket;
        const publicUrl = this.getPublicUrl(bucketName, fileName);
        return {
            fileName,
            bucket: bucketName,
            publicUrl,
            size: buffer.length,
            contentType: finalContentType,
        };
    }
    async uploadImage(bucketType, fileName, buffer, optimizationOptions) {
        // Optimize original image if options provided
        let finalBuffer = buffer;
        let contentType = 'image/jpeg';
        if (optimizationOptions) {
            const optimized = await image_processor_1.ImageProcessor.optimizeImage(buffer, optimizationOptions);
            finalBuffer = optimized.buffer;
            contentType = optimized.contentType;
        }
        // Upload original/optimized image
        const original = await this.uploadFile({
            bucket: bucketType,
            fileName,
            buffer: finalBuffer,
            contentType,
            makePublic: true,
        });
        // Create and upload thumbnail if not already a thumbnail
        let thumbnail;
        if (!optimizationOptions?.thumbnail) {
            const thumbnailBuffer = await image_processor_1.ImageProcessor.createThumbnail(buffer);
            const thumbnailFileName = this.getThumbnailFileName(fileName);
            thumbnail = await this.uploadFile({
                bucket: bucketType,
                fileName: thumbnailFileName,
                buffer: thumbnailBuffer,
                contentType: 'image/webp',
                makePublic: true,
            });
        }
        return { original, thumbnail };
    }
    async generateSignedUrl(options) {
        const { bucket: bucketType, fileName, action, expires = new Date(Date.now() + 15 * 60 * 1000), // 15 minutes default
        contentType, } = options;
        const bucket = (0, client_1.getBucket)(bucketType);
        const file = bucket.file(fileName);
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action,
            expires,
            contentType,
        });
        return url;
    }
    async generateUploadUrl(bucketType, fileName, contentType, expires) {
        return this.generateSignedUrl({
            bucket: bucketType,
            fileName,
            action: 'write',
            contentType,
            expires,
        });
    }
    async generateDownloadUrl(bucketType, fileName, expires) {
        return this.generateSignedUrl({
            bucket: bucketType,
            fileName,
            action: 'read',
            expires,
        });
    }
    async deleteFile(bucketType, fileName) {
        const bucket = (0, client_1.getBucket)(bucketType);
        const file = bucket.file(fileName);
        await file.delete();
    }
    async fileExists(bucketType, fileName) {
        const bucket = (0, client_1.getBucket)(bucketType);
        const file = bucket.file(fileName);
        const [exists] = await file.exists();
        return exists;
    }
    async getFileMetadata(bucketType, fileName) {
        const bucket = (0, client_1.getBucket)(bucketType);
        const file = bucket.file(fileName);
        const [metadata] = await file.getMetadata();
        return metadata;
    }
    async copyFile(sourceBucket, sourceFileName, destBucket, destFileName) {
        const sourceBucketObj = (0, client_1.getBucket)(sourceBucket);
        const destBucketObj = (0, client_1.getBucket)(destBucket);
        const sourceFile = sourceBucketObj.file(sourceFileName);
        const destFile = destBucketObj.file(destFileName);
        await sourceFile.copy(destFile);
    }
    getPublicUrl(bucketName, fileName) {
        if (this.config.cdnUrl) {
            return `${this.config.cdnUrl}/${fileName}`;
        }
        return `https://storage.googleapis.com/${bucketName}/${fileName}`;
    }
    getThumbnailFileName(originalFileName) {
        const lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return `${originalFileName}_thumb.webp`;
        }
        const name = originalFileName.substring(0, lastDotIndex);
        return `${name}_thumb.webp`;
    }
    // Utility methods for common file operations
    async uploadRenderResult(renderId, imageBuffer, metadata) {
        const fileName = `renders/${renderId}.webp`;
        const result = await this.uploadImage('renders', fileName, imageBuffer, {
            format: 'webp',
            quality: 85,
        });
        // Add metadata to both files
        if (metadata && result.thumbnail) {
            const bucket = (0, client_1.getBucket)('renders');
            const originalFile = bucket.file(fileName);
            const thumbnailFile = bucket.file(this.getThumbnailFileName(fileName));
            await Promise.all([
                originalFile.setMetadata({ metadata }),
                thumbnailFile.setMetadata({ metadata }),
            ]);
        }
        return result;
    }
    async uploadAsset(assetId, imageBuffer, metadata) {
        const fileName = `assets/${assetId}.webp`;
        const result = await this.uploadImage('assets', fileName, imageBuffer, {
            format: 'webp',
            quality: 90,
        });
        if (metadata && result.thumbnail) {
            const bucket = (0, client_1.getBucket)('assets');
            const originalFile = bucket.file(fileName);
            const thumbnailFile = bucket.file(this.getThumbnailFileName(fileName));
            await Promise.all([
                originalFile.setMetadata({ metadata }),
                thumbnailFile.setMetadata({ metadata }),
            ]);
        }
        return result;
    }
}
exports.StorageService = StorageService;
