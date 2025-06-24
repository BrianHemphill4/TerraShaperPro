import { type Scene } from '@terrashaper/db';
export interface SceneWithMasks extends Scene {
    masks: Array<{
        id: string;
        category: string;
        path: any;
        deleted: boolean;
        authorId: string | null;
        createdAt: Date;
    }>;
}
export declare class SceneService {
    /**
     * Create a new scene for a project
     */
    createScene(projectId: string, imageUrl: string, order?: number): Promise<Scene>;
    /**
     * Get all scenes for a project
     */
    getScenesByProject(projectId: string): Promise<Scene[]>;
    /**
     * Get a scene with its masks
     */
    getSceneWithMasks(sceneId: string): Promise<SceneWithMasks | null>;
    /**
     * Reorder scenes within a project
     */
    reorderScenes(projectId: string, sceneOrder: string[]): Promise<void>;
    /**
     * Delete a scene (soft delete)
     */
    deleteScene(sceneId: string): Promise<void>;
    /**
     * Set a scene as the default for a project
     */
    setDefaultScene(projectId: string, sceneId: string): Promise<void>;
    /**
     * Validate image dimensions (≥1500×1000px as mentioned in requirements)
     */
    validateImageDimensions(width: number, height: number): boolean;
}
export declare const sceneService: SceneService;
