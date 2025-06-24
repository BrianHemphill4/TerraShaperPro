"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageClient = getStorageClient;
exports.getBucket = getBucket;
const node_buffer_1 = require("node:buffer");
const storage_1 = require("@google-cloud/storage");
const config_1 = require("./config");
let storageClient = null;
function getStorageClient() {
    if (!storageClient) {
        const config = (0, config_1.getStorageConfig)();
        // In production (Vercel), decode the base64 key
        if (process.env.GCS_KEY_BASE64) {
            const keyJson = node_buffer_1.Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf-8');
            const keyData = JSON.parse(keyJson);
            storageClient = new storage_1.Storage({
                projectId: keyData.project_id,
                credentials: keyData,
            });
        }
        else {
            // In local development, use the key file path
            storageClient = new storage_1.Storage({
                projectId: config.projectId,
                keyFilename: config.keyFilename,
            });
        }
    }
    return storageClient;
}
function getBucket(bucketType) {
    const client = getStorageClient();
    const config = (0, config_1.getStorageConfig)();
    const bucketName = bucketType === 'renders' ? config.rendersBucket : config.assetsBucket;
    return client.bucket(bucketName);
}
