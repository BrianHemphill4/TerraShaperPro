"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorage = getStorage;
const node_buffer_1 = require("node:buffer");
const storage_1 = require("@google-cloud/storage");
let storage;
function getStorage() {
    if (!storage) {
        // In production (Vercel), decode the base64 key
        if (process.env.GCS_KEY_BASE64) {
            const keyJson = node_buffer_1.Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf-8');
            const keyData = JSON.parse(keyJson);
            storage = new storage_1.Storage({
                projectId: keyData.project_id,
                credentials: keyData,
            });
        }
        else {
            // In local development, use the key file path
            storage = new storage_1.Storage({
                projectId: process.env.GCS_PROJECT_ID,
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            });
        }
    }
    return storage;
}
