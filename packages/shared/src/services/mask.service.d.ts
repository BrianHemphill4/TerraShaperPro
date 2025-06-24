import { type Mask } from '@terrashaper/db';
export interface MaskData {
    id?: string;
    category: string;
    path: any;
    authorId?: string;
}
export interface MaskHistory {
    id: string;
    masks: Mask[];
    createdAt: Date;
    authorId: string | null;
}
export declare class MaskService {
    /**
     * Save masks for a scene with diff tracking
     */
    saveMasks(sceneId: string, maskData: MaskData[], authorId?: string): Promise<void>;
    /**
     * Get masks by category for a scene
     */
    getMasksByCategory(sceneId: string, category: string): Promise<Mask[]>;
    /**
     * Get all masks for a scene
     */
    getMasksByScene(sceneId: string): Promise<Mask[]>;
    /**
     * Soft delete a specific mask
     */
    softDeleteMask(maskId: string): Promise<void>;
    /**
     * Get mask history for a scene (simplified version)
     * In a full implementation, this would track changes over time
     */
    getMaskHistory(sceneId: string): Promise<MaskHistory[]>;
    /**
     * Export masks as GeoJSON format
     */
    exportMasksAsGeoJSON(sceneId: string): Promise<any>;
    /**
     * Get available mask categories
     */
    getCategories(sceneId?: string): Promise<string[]>;
}
export declare const maskService: MaskService;
