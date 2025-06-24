import { Buffer } from 'node:buffer';
import type { Storage } from '@google-cloud/storage';
/**
 * Service responsible for storing rendered images and creating thumbnails
 */
export declare class RenderStorageService {
    private storage;
    private bucketName;
    constructor(storage: Storage, bucketName: string);
    /**
     * Store rendered image and create thumbnail
     */
    storeRenderResult(renderId: string, projectId: string, imageBuffer: Buffer, settings: any, promptHash: string): Promise<{
        imageUrl: string;
        thumbnailUrl: string;
    }>;
    /**
     * Convert image result to buffer
     */
    prepareImageBuffer(result: {
        imageBase64?: string;
        imageUrl?: string;
    }): Promise<Buffer>;
}
