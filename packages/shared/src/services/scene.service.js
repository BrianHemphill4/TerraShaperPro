var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { db, scenes, masks, eq, and } from '@terrashaper/db';
export class SceneService {
    /**
     * Create a new scene for a project
     */
    createScene(projectId, imageUrl, order) {
        return __awaiter(this, void 0, void 0, function* () {
            // If order is not provided, get the next available order
            if (order === undefined) {
                const existingScenes = yield db
                    .select()
                    .from(scenes)
                    .where(eq(scenes.projectId, projectId));
                order = existingScenes.length + 1;
            }
            const newScene = {
                projectId,
                imageUrl,
                order,
                isDefault: false,
            };
            const [scene] = yield db.insert(scenes).values(newScene).returning();
            return scene;
        });
    }
    /**
     * Get all scenes for a project
     */
    getScenesByProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db
                .select()
                .from(scenes)
                .where(eq(scenes.projectId, projectId))
                .orderBy(scenes.order);
        });
    }
    /**
     * Get a scene with its masks
     */
    getSceneWithMasks(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [scene] = yield db
                .select()
                .from(scenes)
                .where(eq(scenes.id, sceneId));
            if (!scene) {
                return null;
            }
            const sceneMasks = yield db
                .select()
                .from(masks)
                .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));
            return Object.assign(Object.assign({}, scene), { masks: sceneMasks });
        });
    }
    /**
     * Reorder scenes within a project
     */
    reorderScenes(projectId, sceneOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update each scene with its new order
            const updates = sceneOrder.map((sceneId, index) => db
                .update(scenes)
                .set({ order: index + 1 })
                .where(and(eq(scenes.id, sceneId), eq(scenes.projectId, projectId))));
            yield Promise.all(updates);
        });
    }
    /**
     * Delete a scene (soft delete)
     */
    deleteScene(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, soft delete all masks associated with this scene
            yield db
                .update(masks)
                .set({ deleted: true })
                .where(eq(masks.sceneId, sceneId));
            // Then delete the scene
            yield db.delete(scenes).where(eq(scenes.id, sceneId));
        });
    }
    /**
     * Set a scene as the default for a project
     */
    setDefaultScene(projectId, sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, unset all existing defaults for the project
            yield db
                .update(scenes)
                .set({ isDefault: false })
                .where(eq(scenes.projectId, projectId));
            // Then set the specified scene as default
            yield db
                .update(scenes)
                .set({ isDefault: true })
                .where(and(eq(scenes.id, sceneId), eq(scenes.projectId, projectId)));
        });
    }
    /**
     * Validate image dimensions (≥1500×1000px as mentioned in requirements)
     */
    validateImageDimensions(width, height) {
        return width >= 1500 && height >= 1000;
    }
}
export const sceneService = new SceneService();
