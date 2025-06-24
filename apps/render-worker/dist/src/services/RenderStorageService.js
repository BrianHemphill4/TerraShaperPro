"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    storeRenderResult(renderId, projectId, imageBuffer, settings, promptHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const bucket = this.storage.bucket(this.bucketName);
            const fileName = `renders/${projectId}/${renderId}.${settings.format.toLowerCase()}`;
            const thumbnailFileName = `renders/${projectId}/${renderId}_thumb.webp`;
            // Store main image
            const file = bucket.file(fileName);
            yield file.save(imageBuffer, {
                metadata: {
                    contentType: `image/${settings.format.toLowerCase()}`,
                    metadata: {
                        renderId,
                        projectId,
                        promptHash,
                    },
                },
            });
            yield file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
            // Create and store thumbnail
            const thumbnailBuffer = yield storage_1.ImageProcessor.createThumbnail(imageBuffer);
            const thumbnailFile = bucket.file(thumbnailFileName);
            yield thumbnailFile.save(thumbnailBuffer, {
                metadata: {
                    contentType: 'image/webp',
                },
            });
            yield thumbnailFile.makePublic();
            const thumbnailUrl = `https://storage.googleapis.com/${this.bucketName}/${thumbnailFileName}`;
            return { imageUrl: publicUrl, thumbnailUrl };
        });
    }
    /**
     * Convert image result to buffer
     */
    prepareImageBuffer(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (result.imageBase64) {
                return node_buffer_1.Buffer.from(result.imageBase64, 'base64');
            }
            else if (result.imageUrl) {
                const response = yield fetch(result.imageUrl);
                return node_buffer_1.Buffer.from(yield response.arrayBuffer());
            }
            else {
                throw new Error('No image data provided');
            }
        });
    }
}
exports.RenderStorageService = RenderStorageService;
