"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderStorageService = void 0;
const node_buffer_1 = require("node:buffer");
const storage_1 = require("@terrashaper/storage");
/**
 * Service responsible for storing rendered images and creating thumbnails
 */
class RenderStorageService {
    constructor(storage, bucketName) {
        this.storage = storage;
        this.bucketName = bucketName;
    }
    /**
     * Store rendered image and create thumbnail
     */
    async storeRenderResult(renderId, projectId, imageBuffer, settings, promptHash) {
        const bucket = this.storage.bucket(this.bucketName);
        const fileName = `renders/${projectId}/${renderId}.${settings.format.toLowerCase()}`;
        const thumbnailFileName = `renders/${projectId}/${renderId}_thumb.webp`;
        // Store main image
        const file = bucket.file(fileName);
        await file.save(imageBuffer, {
            metadata: {
                contentType: `image/${settings.format.toLowerCase()}`,
                metadata: {
                    renderId,
                    projectId,
                    promptHash,
                },
            },
        });
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
        // Create and store thumbnail
        const thumbnailBuffer = await storage_1.ImageProcessor.createThumbnail(imageBuffer);
        const thumbnailFile = bucket.file(thumbnailFileName);
        await thumbnailFile.save(thumbnailBuffer, {
            metadata: {
                contentType: 'image/webp',
            },
        });
        await thumbnailFile.makePublic();
        const thumbnailUrl = `https://storage.googleapis.com/${this.bucketName}/${thumbnailFileName}`;
        return { imageUrl: publicUrl, thumbnailUrl };
    }
    /**
     * Convert image result to buffer
     */
    async prepareImageBuffer(result) {
        if (result.imageBase64) {
            return node_buffer_1.Buffer.from(result.imageBase64, 'base64');
        }
        else if (result.imageUrl) {
            const response = await fetch(result.imageUrl);
            return node_buffer_1.Buffer.from(await response.arrayBuffer());
        }
        else {
            throw new Error('No image data provided');
        }
    }
}
exports.RenderStorageService = RenderStorageService;
