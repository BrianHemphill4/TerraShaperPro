import { Storage } from '@google-cloud/storage';

import { getStorageConfig } from './config';

let storageClient: Storage | null = null;

export function getStorageClient(): Storage {
  if (!storageClient) {
    const config = getStorageConfig();
    
    storageClient = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
  }
  
  return storageClient;
}

export function getBucket(bucketType: 'renders' | 'assets') {
  const client = getStorageClient();
  const config = getStorageConfig();
  
  const bucketName = bucketType === 'renders' 
    ? config.rendersBucket 
    : config.assetsBucket;
    
  return client.bucket(bucketName);
}