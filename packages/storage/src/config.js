"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageConfig = getStorageConfig;
function getStorageConfig() {
    const projectId = process.env.GCS_PROJECT_ID;
    const rendersBucket = process.env.GCS_RENDERS_BUCKET;
    const assetsBucket = process.env.GCS_ASSETS_BUCKET;
    if (!projectId || !rendersBucket || !assetsBucket) {
        throw new Error('Missing required Google Cloud Storage environment variables: GCS_PROJECT_ID, GCS_RENDERS_BUCKET, GCS_ASSETS_BUCKET');
    }
    return {
        projectId,
        rendersBucket,
        assetsBucket,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        cdnUrl: process.env.GCS_CDN_URL,
    };
}
