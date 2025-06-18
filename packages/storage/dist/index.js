"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ImageProcessor: () => ImageProcessor,
  RenderStorageService: () => RenderStorageService,
  StorageService: () => StorageService,
  UploadUtils: () => UploadUtils,
  default: () => StorageService,
  getBucket: () => getBucket,
  getStorageClient: () => getStorageClient,
  getStorageConfig: () => getStorageConfig
});
module.exports = __toCommonJS(index_exports);

// src/config.ts
function getStorageConfig() {
  const projectId = process.env.GCS_PROJECT_ID;
  const rendersBucket = process.env.GCS_RENDERS_BUCKET;
  const assetsBucket = process.env.GCS_ASSETS_BUCKET;
  if (!projectId || !rendersBucket || !assetsBucket) {
    throw new Error(
      "Missing required Google Cloud Storage environment variables: GCS_PROJECT_ID, GCS_RENDERS_BUCKET, GCS_ASSETS_BUCKET"
    );
  }
  return {
    projectId,
    rendersBucket,
    assetsBucket,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    cdnUrl: process.env.GCS_CDN_URL
  };
}

// src/client.ts
var import_storage = require("@google-cloud/storage");
var storageClient = null;
function getStorageClient() {
  if (!storageClient) {
    const config = getStorageConfig();
    storageClient = new import_storage.Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename
    });
  }
  return storageClient;
}
function getBucket(bucketType) {
  const client = getStorageClient();
  const config = getStorageConfig();
  const bucketName = bucketType === "renders" ? config.rendersBucket : config.assetsBucket;
  return client.bucket(bucketName);
}

// src/storage-service.ts
var import_mime_types = require("mime-types");

// src/image-processor.ts
var import_sharp = __toESM(require("sharp"));
var ImageProcessor = class {
  static async optimizeImage(buffer, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = "webp",
      thumbnail = false
    } = options;
    let processor = (0, import_sharp.default)(buffer);
    if (width || height) {
      processor = processor.resize(width, height, {
        fit: "inside",
        withoutEnlargement: true
      });
    }
    if (thumbnail) {
      processor = processor.resize(300, 300, {
        fit: "cover",
        position: "center"
      });
    }
    switch (format) {
      case "webp":
        processor = processor.webp({ quality });
        break;
      case "jpeg":
        processor = processor.jpeg({ quality });
        break;
      case "png":
        processor = processor.png({ quality });
        break;
    }
    const optimizedBuffer = await processor.toBuffer();
    return {
      buffer: optimizedBuffer,
      contentType: `image/${format}`,
      size: optimizedBuffer.length
    };
  }
  static async createThumbnail(buffer) {
    return (0, import_sharp.default)(buffer).resize(300, 300, {
      fit: "cover",
      position: "center"
    }).webp({ quality: 70 }).toBuffer();
  }
  static async getImageMetadata(buffer) {
    const metadata = await (0, import_sharp.default)(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha
    };
  }
};

// src/storage-service.ts
var StorageService = class {
  config = getStorageConfig();
  async uploadFile(options) {
    const {
      bucket: bucketType,
      fileName,
      buffer,
      contentType,
      metadata = {},
      makePublic = false
    } = options;
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);
    const finalContentType = contentType || (0, import_mime_types.lookup)(fileName) || "application/octet-stream";
    await file.save(buffer, {
      metadata: {
        contentType: finalContentType,
        metadata
      },
      resumable: false
    });
    if (makePublic) {
      await file.makePublic();
    }
    const bucketName = bucketType === "renders" ? this.config.rendersBucket : this.config.assetsBucket;
    const publicUrl = this.getPublicUrl(bucketName, fileName);
    return {
      fileName,
      bucket: bucketName,
      publicUrl,
      size: buffer.length,
      contentType: finalContentType
    };
  }
  async uploadImage(bucketType, fileName, buffer, optimizationOptions) {
    let finalBuffer = buffer;
    let contentType = "image/jpeg";
    if (optimizationOptions) {
      const optimized = await ImageProcessor.optimizeImage(buffer, optimizationOptions);
      finalBuffer = optimized.buffer;
      contentType = optimized.contentType;
    }
    const original = await this.uploadFile({
      bucket: bucketType,
      fileName,
      buffer: finalBuffer,
      contentType,
      makePublic: true
    });
    let thumbnail;
    if (!optimizationOptions?.thumbnail) {
      const thumbnailBuffer = await ImageProcessor.createThumbnail(buffer);
      const thumbnailFileName = this.getThumbnailFileName(fileName);
      thumbnail = await this.uploadFile({
        bucket: bucketType,
        fileName: thumbnailFileName,
        buffer: thumbnailBuffer,
        contentType: "image/webp",
        makePublic: true
      });
    }
    return { original, thumbnail };
  }
  async generateSignedUrl(options) {
    const {
      bucket: bucketType,
      fileName,
      action,
      expires = new Date(Date.now() + 15 * 60 * 1e3),
      // 15 minutes default
      contentType
    } = options;
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action,
      expires,
      contentType
    });
    return url;
  }
  async generateUploadUrl(bucketType, fileName, contentType, expires) {
    return this.generateSignedUrl({
      bucket: bucketType,
      fileName,
      action: "write",
      contentType,
      expires
    });
  }
  async generateDownloadUrl(bucketType, fileName, expires) {
    return this.generateSignedUrl({
      bucket: bucketType,
      fileName,
      action: "read",
      expires
    });
  }
  async deleteFile(bucketType, fileName) {
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);
    await file.delete();
  }
  async fileExists(bucketType, fileName) {
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    return exists;
  }
  async getFileMetadata(bucketType, fileName) {
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);
    const [metadata] = await file.getMetadata();
    return metadata;
  }
  async copyFile(sourceBucket, sourceFileName, destBucket, destFileName) {
    const sourceBucketObj = getBucket(sourceBucket);
    const destBucketObj = getBucket(destBucket);
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
    const lastDotIndex = originalFileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return `${originalFileName}_thumb.webp`;
    }
    const name = originalFileName.substring(0, lastDotIndex);
    return `${name}_thumb.webp`;
  }
  // Utility methods for common file operations
  async uploadRenderResult(renderId, imageBuffer, metadata) {
    const fileName = `renders/${renderId}.webp`;
    const result = await this.uploadImage("renders", fileName, imageBuffer, {
      format: "webp",
      quality: 85
    });
    if (metadata && result.thumbnail) {
      const bucket = getBucket("renders");
      const originalFile = bucket.file(fileName);
      const thumbnailFile = bucket.file(this.getThumbnailFileName(fileName));
      await Promise.all([
        originalFile.setMetadata({ metadata }),
        thumbnailFile.setMetadata({ metadata })
      ]);
    }
    return result;
  }
  async uploadAsset(assetId, imageBuffer, metadata) {
    const fileName = `assets/${assetId}.webp`;
    const result = await this.uploadImage("assets", fileName, imageBuffer, {
      format: "webp",
      quality: 90
    });
    if (metadata && result.thumbnail) {
      const bucket = getBucket("assets");
      const originalFile = bucket.file(fileName);
      const thumbnailFile = bucket.file(this.getThumbnailFileName(fileName));
      await Promise.all([
        originalFile.setMetadata({ metadata }),
        thumbnailFile.setMetadata({ metadata })
      ]);
    }
    return result;
  }
};

// src/upload-utils.ts
var UploadUtils = class {
  static storageService = new StorageService();
  /**
   * Generate a direct upload URL for client-side uploads
   */
  static async generateDirectUploadUrl(bucketType, fileName, contentType, expiresInMinutes = 15) {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1e3);
    const uploadUrl = await this.storageService.generateUploadUrl(
      bucketType,
      fileName,
      contentType,
      expiresAt
    );
    const bucketName = bucketType === "renders" ? process.env.GCS_RENDERS_BUCKET : process.env.GCS_ASSETS_BUCKET;
    const publicUrl = this.storageService.getPublicUrl(bucketName, fileName);
    return {
      uploadUrl,
      fileName,
      publicUrl,
      expiresAt
    };
  }
  /**
   * Generate unique file name with timestamp and random suffix
   */
  static generateFileName(prefix, extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }
  /**
   * Generate file name for render result
   */
  static generateRenderFileName(renderId, format = "webp") {
    return `renders/${renderId}.${format}`;
  }
  /**
   * Generate file name for asset
   */
  static generateAssetFileName(assetId, format = "webp") {
    return `assets/${assetId}.${format}`;
  }
  /**
   * Generate file name for user upload
   */
  static generateUserUploadFileName(userId, originalFileName) {
    const extension = originalFileName.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `uploads/${userId}/${timestamp}-${random}.${extension}`;
  }
  /**
   * Validate file type for uploads
   */
  static validateImageFile(contentType, maxSizeMB = 10) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif"
    ];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`
      };
    }
    return { valid: true };
  }
  /**
   * Get CORS configuration for direct uploads
   */
  static getCorsConfig() {
    return {
      origin: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "https://terrashaper.pro",
        "https://*.terrashaper.pro"
      ],
      methods: ["GET", "PUT", "POST", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Content-Length",
        "x-goog-content-length-range",
        "x-goog-resumable"
      ],
      maxAgeSeconds: 3600
    };
  }
  /**
   * Create presigned POST policy for direct browser uploads
   */
  static async generatePresignedPost(bucketType, fileName, contentType, maxSizeBytes = 10 * 1024 * 1024) {
    const uploadUrl = await this.storageService.generateUploadUrl(
      bucketType,
      fileName,
      contentType
    );
    return {
      url: uploadUrl,
      fields: {
        "Content-Type": contentType
      }
    };
  }
};

// src/render-storage.ts
var RenderStorageService = class extends StorageService {
  /**
   * Store a completed render result with optimized images and thumbnails
   */
  async storeRenderResult(renderId, imageBuffer, metadata) {
    const fileName = `renders/${renderId}`;
    const imageMetadata = await ImageProcessor.getImageMetadata(imageBuffer);
    const webpOptimized = await ImageProcessor.optimizeImage(imageBuffer, {
      format: "webp",
      quality: 85,
      width: Math.min(imageMetadata.width || 2048, 2048),
      height: Math.min(imageMetadata.height || 2048, 2048)
    });
    const thumbnailBuffer = await ImageProcessor.createThumbnail(imageBuffer);
    const [original, webp, thumbnail] = await Promise.all([
      // Original (high quality)
      this.uploadFile({
        bucket: "renders",
        fileName: `${fileName}_original.${imageMetadata.format || "jpg"}`,
        buffer: imageBuffer,
        contentType: `image/${imageMetadata.format || "jpeg"}`,
        makePublic: true,
        metadata: {
          renderId,
          type: "original",
          userId: metadata.userId,
          projectId: metadata.projectId,
          provider: metadata.provider
        }
      }),
      // Optimized WebP (primary display)
      this.uploadFile({
        bucket: "renders",
        fileName: `${fileName}.webp`,
        buffer: webpOptimized.buffer,
        contentType: webpOptimized.contentType,
        makePublic: true,
        metadata: {
          renderId,
          type: "optimized",
          userId: metadata.userId,
          projectId: metadata.projectId,
          provider: metadata.provider
        }
      }),
      // Thumbnail
      this.uploadFile({
        bucket: "renders",
        fileName: `${fileName}_thumb.webp`,
        buffer: thumbnailBuffer,
        contentType: "image/webp",
        makePublic: true,
        metadata: {
          renderId,
          type: "thumbnail",
          userId: metadata.userId,
          projectId: metadata.projectId,
          provider: metadata.provider
        }
      })
    ]);
    const metadataContent = {
      renderId,
      ...metadata,
      images: {
        original: {
          url: original.publicUrl,
          size: original.size,
          contentType: original.contentType,
          width: imageMetadata.width,
          height: imageMetadata.height
        },
        webp: {
          url: webp.publicUrl,
          size: webp.size,
          contentType: webp.contentType
        },
        thumbnail: {
          url: thumbnail.publicUrl,
          size: thumbnail.size,
          contentType: thumbnail.contentType
        }
      },
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.uploadFile({
      bucket: "renders",
      fileName: `${fileName}_metadata.json`,
      buffer: Buffer.from(JSON.stringify(metadataContent, null, 2)),
      contentType: "application/json",
      makePublic: false,
      metadata: {
        renderId,
        type: "metadata"
      }
    });
    return {
      original,
      webp,
      thumbnail,
      metadata: metadataContent
    };
  }
  /**
   * Get render result URLs
   */
  async getRenderUrls(renderId) {
    try {
      const fileName = `renders/${renderId}`;
      const webpExists = await this.fileExists("renders", `${fileName}.webp`);
      if (!webpExists) {
        return null;
      }
      const bucketName = process.env.GCS_RENDERS_BUCKET;
      const urls = {
        webp: this.getPublicUrl(bucketName, `${fileName}.webp`),
        thumbnail: this.getPublicUrl(bucketName, `${fileName}_thumb.webp`)
      };
      const [originalExists, metadataExists] = await Promise.all([
        this.checkOriginalFile(renderId),
        this.fileExists("renders", `${fileName}_metadata.json`)
      ]);
      if (originalExists.exists) {
        urls.original = this.getPublicUrl(bucketName, originalExists.fileName);
      }
      let metadata = null;
      if (metadataExists) {
        try {
          const metadataUrl = await this.generateDownloadUrl(
            "renders",
            `${fileName}_metadata.json`,
            new Date(Date.now() + 5 * 60 * 1e3)
            // 5 minutes
          );
          const response = await fetch(metadataUrl);
          if (response.ok) {
            metadata = await response.json();
          }
        } catch (error) {
          console.warn("Failed to fetch render metadata:", error);
        }
      }
      return { ...urls, metadata };
    } catch (error) {
      console.error("Failed to get render URLs:", error);
      return null;
    }
  }
  /**
   * Delete all files associated with a render
   */
  async deleteRender(renderId) {
    const fileName = `renders/${renderId}`;
    const possibleFiles = [
      `${fileName}.webp`,
      `${fileName}_thumb.webp`,
      `${fileName}_metadata.json`
    ];
    const originalFile = await this.checkOriginalFile(renderId);
    if (originalFile.exists) {
      possibleFiles.push(originalFile.fileName);
    }
    const deletePromises = possibleFiles.map(async (file) => {
      try {
        const exists = await this.fileExists("renders", file);
        if (exists) {
          await this.deleteFile("renders", file);
        }
      } catch (error) {
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
    const possibleExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff"];
    for (const ext of possibleExtensions) {
      const testFileName = `${fileName}_original.${ext}`;
      const exists = await this.fileExists("renders", testFileName);
      if (exists) {
        return { exists: true, fileName: testFileName };
      }
    }
    return { exists: false, fileName: "" };
  }
  /**
   * Generate download URLs for render results
   */
  async generateRenderDownloadUrls(renderId, expiresInHours = 24) {
    const fileName = `renders/${renderId}`;
    const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1e3);
    const urls = {};
    try {
      const webpExists = await this.fileExists("renders", `${fileName}.webp`);
      if (webpExists) {
        urls.webp = await this.generateDownloadUrl("renders", `${fileName}.webp`, expires);
      }
      const thumbExists = await this.fileExists("renders", `${fileName}_thumb.webp`);
      if (thumbExists) {
        urls.thumbnail = await this.generateDownloadUrl("renders", `${fileName}_thumb.webp`, expires);
      }
      const originalFile = await this.checkOriginalFile(renderId);
      if (originalFile.exists) {
        urls.original = await this.generateDownloadUrl("renders", originalFile.fileName, expires);
      }
    } catch (error) {
      console.error("Failed to generate download URLs:", error);
    }
    return urls;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ImageProcessor,
  RenderStorageService,
  StorageService,
  UploadUtils,
  getBucket,
  getStorageClient,
  getStorageConfig
});
//# sourceMappingURL=index.js.map