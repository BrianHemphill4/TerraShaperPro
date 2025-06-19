import { Buffer } from 'node:buffer';

import { Storage } from '@google-cloud/storage';

let storage: Storage;

export function getStorage(): Storage {
  if (!storage) {
    // In production (Vercel), decode the base64 key
    if (process.env.GCS_KEY_BASE64) {
      const keyJson = Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf-8');
      const keyData = JSON.parse(keyJson);

      storage = new Storage({
        projectId: keyData.project_id,
        credentials: keyData,
      });
    } else {
      // In local development, use the key file path
      storage = new Storage({
        projectId: process.env.GCS_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    }
  }

  return storage;
}
