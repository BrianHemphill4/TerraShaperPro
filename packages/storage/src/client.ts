import { Buffer } from 'node:buffer';

import { Storage } from '@google-cloud/storage';

import { getStorageConfig } from './config';

let storageClient: Storage | null = null;

export function getStorageClient(): Storage {
  if (!storageClient) {
    const config = getStorageConfig();

    // In production (Vercel), decode the base64 key
    if (process.env.GCS_KEY_BASE64) {
      const keyJson = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf-8');
      const keyData = JSON.parse(keyJson);

      storageClient = new Storage({
        projectId: keyData.project_id,
        credentials: keyData,
      });
    } else {
      // In local development, use the key file path
      storageClient = new Storage({
        projectId: config.projectId,
        keyFilename: config.keyFilename,
      });
    }
  }

  return storageClient;
}

export function getBucket(bucketType: 'renders' | 'assets') {
  const client = getStorageClient();
  const config = getStorageConfig();

  const bucketName = bucketType === 'renders' ? config.rendersBucket : config.assetsBucket;

  return client.bucket(bucketName);
}
