"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sceneService = exports.SceneService = void 0;
const db_1 = require("@terrasherper/db");
class SceneService {
    /**
     * Create a new scene for a project
     */
    async createScene(projectId, imageUrl, order) {
        // If order is not provided, get the next available order
        if (order === undefined) {
            const existingScenes = await db_1.db
                .select()
                .from(db_1.scenes)
                .where((0, db_1.eq)(db_1.scenes.projectId, projectId));
            order = existingScenes.length + 1;
        }
        const newScene = {
            projectId,
            imageUrl,
            order,
            isDefault: false,
        };
        const [scene] = await db_1.db.insert(db_1.scenes).values(newScene).returning();
        return scene;
    }
    /**
     * Get all scenes for a project
     */
    async getScenesByProject(projectId) {
        return await db_1.db
            .select()
            .from(db_1.scenes)
            .where((0, db_1.eq)(db_1.scenes.projectId, projectId))
            .orderBy(db_1.scenes.order);
    }
    /**
     * Get a scene with its masks
     */
    async getSceneWithMasks(sceneId) {
        const [scene] = await db_1.db
            .select()
            .from(db_1.scenes)
            .where((0, db_1.eq)(db_1.scenes.id, sceneId));
        if (!scene) {
            return null;
        }
        const sceneMasks = await db_1.db
            .select()
            .from(db_1.masks)
            .where((0, db_1.and)((0, db_1.eq)(db_1.masks.sceneId, sceneId), (0, db_1.eq)(db_1.masks.deleted, false)));
        return {
            ...scene,
            masks: sceneMasks,
        };
    }
    /**
     * Reorder scenes within a project
     */
    async reorderScenes(projectId, sceneOrder) {
        // Update each scene with its new order
        const updates = sceneOrder.map((sceneId, index) => db_1.db
            .update(db_1.scenes)
            .set({ order: index + 1 })
            .where((0, db_1.and)((0, db_1.eq)(db_1.scenes.id, sceneId), (0, db_1.eq)(db_1.scenes.projectId, projectId))));
        await Promise.all(updates);
    }
    /**
     * Delete a scene (soft delete)
     */
    async deleteScene(sceneId) {
        // First, soft delete all masks associated with this scene
        await db_1.db
            .update(db_1.masks)
            .set({ deleted: true })
            .where((0, db_1.eq)(db_1.masks.sceneId, sceneId));
        // Then delete the scene
        await db_1.db.delete(db_1.scenes).where((0, db_1.eq)(db_1.scenes.id, sceneId));
    }
    /**
     * Set a scene as the default for a project
     */
    async setDefaultScene(projectId, sceneId) {
        // First, unset all existing defaults for the project
        await db_1.db
            .update(db_1.scenes)
            .set({ isDefault: false })
            .where((0, db_1.eq)(db_1.scenes.projectId, projectId));
        // Then set the specified scene as default
        await db_1.db
            .update(db_1.scenes)
            .set({ isDefault: true })
            .where((0, db_1.and)((0, db_1.eq)(db_1.scenes.id, sceneId), (0, db_1.eq)(db_1.scenes.projectId, projectId)));
    }
    /**
     * Validate image dimensions (≥1500×1000px as mentioned in requirements)
     */
    validateImageDimensions(width, height) {
        return width >= 1500 && height >= 1000;
    }
}
exports.SceneService = SceneService;
exports.sceneService = new SceneService();
