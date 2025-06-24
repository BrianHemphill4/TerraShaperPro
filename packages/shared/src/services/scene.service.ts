import { db, scenes, masks, type Scene, type NewScene, eq, and } from '@terrasherper/db';

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

export class SceneService {
  /**
   * Create a new scene for a project
   */
  async createScene(projectId: string, imageUrl: string, order?: number): Promise<Scene> {
    // If order is not provided, get the next available order
    if (order === undefined) {
      const existingScenes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.projectId, projectId));

      order = existingScenes.length + 1;
    }

    const newScene: NewScene = {
      projectId,
      imageUrl,
      order,
      isDefault: false,
    };

    const [scene] = await db.insert(scenes).values(newScene).returning();
    return scene;
  }

  /**
   * Get all scenes for a project
   */
  async getScenesByProject(projectId: string): Promise<Scene[]> {
    return await db
      .select()
      .from(scenes)
      .where(eq(scenes.projectId, projectId))
      .orderBy(scenes.order);
  }

  /**
   * Get a scene with its masks
   */
  async getSceneWithMasks(sceneId: string): Promise<SceneWithMasks | null> {
    const [scene] = await db
      .select()
      .from(scenes)
      .where(eq(scenes.id, sceneId));

    if (!scene) {
      return null;
    }

    const sceneMasks = await db
      .select()
      .from(masks)
      .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));

    return {
      ...scene,
      masks: sceneMasks,
    };
  }

  /**
   * Reorder scenes within a project
   */
  async reorderScenes(projectId: string, sceneOrder: string[]): Promise<void> {
    // Update each scene with its new order
    const updates = sceneOrder.map((sceneId, index) =>
      db
        .update(scenes)
        .set({ order: index + 1 })
        .where(and(eq(scenes.id, sceneId), eq(scenes.projectId, projectId)))
    );

    await Promise.all(updates);
  }

  /**
   * Delete a scene (soft delete)
   */
  async deleteScene(sceneId: string): Promise<void> {
    // First, soft delete all masks associated with this scene
    await db
      .update(masks)
      .set({ deleted: true })
      .where(eq(masks.sceneId, sceneId));

    // Then delete the scene
    await db.delete(scenes).where(eq(scenes.id, sceneId));
  }

  /**
   * Set a scene as the default for a project
   */
  async setDefaultScene(projectId: string, sceneId: string): Promise<void> {
    // First, unset all existing defaults for the project
    await db
      .update(scenes)
      .set({ isDefault: false })
      .where(eq(scenes.projectId, projectId));

    // Then set the specified scene as default
    await db
      .update(scenes)
      .set({ isDefault: true })
      .where(and(eq(scenes.id, sceneId), eq(scenes.projectId, projectId)));
  }

  /**
   * Validate image dimensions (≥1500×1000px as mentioned in requirements)
   */
  validateImageDimensions(width: number, height: number): boolean {
    return width >= 1500 && height >= 1000;
  }
}

export const sceneService = new SceneService();