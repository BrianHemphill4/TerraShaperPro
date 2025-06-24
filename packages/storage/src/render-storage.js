"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderStorageService = void 0;
const node_buffer_1 = require("node:buffer");
const image_processor_1 = require("./image-processor");
const storage_service_1 = require("./storage-service");
class RenderStorageService extends storage_service_1.StorageService {
    /**
     * Store a completed render result with optimized images and thumbnails
     */
    async storeRenderResult(renderId, imageBuffer, metadata) {
        const fileName = `renders/${renderId}`;
        // Get image metadata
        const imageMetadata = await image_processor_1.ImageProcessor.getImageMetadata(imageBuffer);
        // Create optimized WebP version
        const webpOptimized = await image_processor_1.ImageProcessor.optimizeImage(imageBuffer, {
            format: 'webp',
            quality: 85,
            width: Math.min(imageMetadata.width || 2048, 2048),
            height: Math.min(imageMetadata.height || 2048, 2048),
        });
        // Create thumbnail
        const thumbnailBuffer = await image_processor_1.ImageProcessor.createThumbnail(imageBuffer);
        // Upload all versions
        const [original, webp, thumbnail] = await Promise.all([
            // Original (high quality)
            this.uploadFile({
                bucket: 'renders',
                fileName: `${fileName}_original.${imageMetadata.format || 'jpg'}`,
                buffer: imageBuffer,
                contentType: `image/${imageMetadata.format || 'jpeg'}`,
                makePublic: true,
                metadata: {
                    renderId,
                    type: 'original',
                    userId: metadata.userId,
                    projectId: metadata.projectId,
                    provider: metadata.provider,
                },
            }),
            // Optimized WebP (primary display)
            this.uploadFile({
                bucket: 'renders',
                fileName: `${fileName}.webp`,
                buffer: webpOptimized.buffer,
                contentType: webpOptimized.contentType,
                makePublic: true,
                metadata: {
                    renderId,
                    type: 'optimized',
                    userId: metadata.userId,
                    projectId: metadata.projectId,
                    provider: metadata.provider,
                },
            }),
            // Thumbnail
            this.uploadFile({
                bucket: 'renders',
                fileName: `${fileName}_thumb.webp`,
                buffer: thumbnailBuffer,
                contentType: 'image/webp',
                makePublic: true,
                metadata: {
                    renderId,
                    type: 'thumbnail',
                    userId: metadata.userId,
                    projectId: metadata.projectId,
                    provider: metadata.provider,
                },
            }),
        ]);
        // Store metadata file
        const metadataContent = {
            renderId,
            ...metadata,
            images: {
                original: {
                    url: original.publicUrl,
                    size: original.size,
                    contentType: original.contentType,
                    width: imageMetadata.width,
                    height: imageMetadata.height,
                },
                webp: {
                    url: webp.publicUrl,
                    size: webp.size,
                    contentType: webp.contentType,
                },
                thumbnail: {
                    url: thumbnail.publicUrl,
                    size: thumbnail.size,
                    contentType: thumbnail.contentType,
                },
            },
            createdAt: new Date().toISOString(),
        };
        await this.uploadFile({
            bucket: 'renders',
            fileName: `${fileName}_metadata.json`,
            buffer: node_buffer_1.Buffer.from(JSON.stringify(metadataContent, null, 2)),
            contentType: 'application/json',
            makePublic: false,
            metadata: {
                renderId,
                type: 'metadata',
            },
        });
        return {
            original,
            webp,
            thumbnail,
            metadata: metadataContent,
        };
    }
    /**
     * Get render result URLs
     */
    async getRenderUrls(renderId) {
        try {
            const fileName = `renders/${renderId}`;
            // Check if main WebP exists
            const webpExists = await this.fileExists('renders', `${fileName}.webp`);
            if (!webpExists) {
                return null;
            }
            // Get public URLs
            const bucketName = process.env.GCS_RENDERS_BUCKET;
            const urls = {
                webp: this.getPublicUrl(bucketName, `${fileName}.webp`),
                thumbnail: this.getPublicUrl(bucketName, `${fileName}_thumb.webp`),
            };
            // Check for original and metadata
            const [originalExists, metadataExists] = await Promise.all([
                this.checkOriginalFile(renderId),
                this.fileExists('renders', `${fileName}_metadata.json`),
            ]);
            if (originalExists.exists) {
                urls.original = this.getPublicUrl(bucketName, originalExists.fileName);
            }
            let metadata = null;
            if (metadataExists) {
                try {
                    // Generate signed URL to read metadata (since it's private)
                    const metadataUrl = await this.generateDownloadUrl('renders', `${fileName}_metadata.json`, new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
                    );
                    const response = await fetch(metadataUrl);
                    if (response.ok) {
                        metadata = await response.json();
                    }
                }
                catch (error) {
                    console.warn('Failed to fetch render metadata:', error);
                }
            }
            return { ...urls, metadata };
        }
        catch (error) {
            console.error('Failed to get render URLs:', error);
            return null;
        }
    }
    /**
     * Delete all files associated with a render
     */
    async deleteRender(renderId) {
        const fileName = `renders/${renderId}`;
        // List all possible files for this render
        const possibleFiles = [
            `${fileName}.webp`,
            `${fileName}_thumb.webp`,
            `${fileName}_metadata.json`,
        ];
        // Check for original files (unknown format)
        const originalFile = await this.checkOriginalFile(renderId);
        if (originalFile.exists) {
            possibleFiles.push(originalFile.fileName);
        }
        // Delete all existing files
        const deletePromises = possibleFiles.map(async (file) => {
            try {
                const exists = await this.fileExists('renders', file);
                if (exists) {
                    await this.deleteFile('renders', file);
                }
            }
            catch (error) {
                console.warn(`Failed to delete file ${file}:`, error);
            }
        });
        await Promise.all(deletePromises);
    }
    /**
     * Check for original file with unknown extension
     */
    async checkOriginalFile(renderId) {
        const fileName = `renders/${renderId}`;
        const possibleExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
        for (const ext of possibleExtensions) {
            const testFileName = `${fileName}_original.${ext}`;
            const exists = await this.fileExists('renders', testFileName);
            if (exists) {
                return { exists: true, fileName: testFileName };
            }
        }
        return { exists: false, fileName: '' };
    }
    /**
     * Generate download URLs for render results
     */
    async generateRenderDownloadUrls(renderId, expiresInHours = 24) {
        const fileName = `renders/${renderId}`;
        const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
        const urls = {};
        // Generate signed URLs for private access
        try {
            const webpExists = await this.fileExists('renders', `${fileName}.webp`);
            if (webpExists) {
                urls.webp = await this.generateDownloadUrl('renders', `${fileName}.webp`, expires);
            }
            const thumbExists = await this.fileExists('renders', `${fileName}_thumb.webp`);
            if (thumbExists) {
                urls.thumbnail = await this.generateDownloadUrl('renders', `${fileName}_thumb.webp`, expires);
            }
            const originalFile = await this.checkOriginalFile(renderId);
            if (originalFile.exists) {
                urls.original = await this.generateDownloadUrl('renders', originalFile.fileName, expires);
            }
        }
        catch (error) {
            console.error('Failed to generate download URLs:', error);
        }
        return urls;
    }
}
exports.RenderStorageService = RenderStorageService;
