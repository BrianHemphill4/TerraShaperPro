"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessor = void 0;
const sharp_1 = __importDefault(require("sharp"));
class ImageProcessor {
    static async optimizeImage(buffer, options = {}) {
        const { width, height, quality = 80, format = 'webp', thumbnail = false } = options;
        let processor = (0, sharp_1.default)(buffer);
        // Resize if dimensions specified
        if (width || height) {
            processor = processor.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }
        // Create thumbnail if requested
        if (thumbnail) {
            processor = processor.resize(300, 300, {
                fit: 'cover',
                position: 'center',
            });
        }
        // Convert format and apply quality
        switch (format) {
            case 'webp':
                processor = processor.webp({ quality });
                break;
            case 'jpeg':
                processor = processor.jpeg({ quality });
                break;
            case 'png':
                processor = processor.png({ quality });
                break;
        }
        const optimizedBuffer = await processor.toBuffer();
        return {
            buffer: optimizedBuffer,
            contentType: `image/${format}`,
            size: optimizedBuffer.length,
        };
    }
    static async createThumbnail(buffer) {
        return (0, sharp_1.default)(buffer)
            .resize(300, 300, {
            fit: 'cover',
            position: 'center',
        })
            .webp({ quality: 70 })
            .toBuffer();
    }
    static async getImageMetadata(buffer) {
        const metadata = await (0, sharp_1.default)(buffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: metadata.size,
            hasAlpha: metadata.hasAlpha,
        };
    }
}
exports.ImageProcessor = ImageProcessor;
