"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskService = exports.MaskService = void 0;
const db_1 = require("@terrasherper/db");
class MaskService {
    /**
     * Save masks for a scene with diff tracking
     */
    async saveMasks(sceneId, maskData, authorId) {
        // Get existing masks for comparison
        const existingMasks = await db_1.db
            .select()
            .from(db_1.masks)
            .where((0, db_1.and)((0, db_1.eq)(db_1.masks.sceneId, sceneId), (0, db_1.eq)(db_1.masks.deleted, false)));
        const existingMaskIds = existingMasks.map(m => m.id);
        const incomingMaskIds = maskData.filter(m => m.id).map(m => m.id);
        // Soft delete masks that are no longer present
        const masksToDelete = existingMaskIds.filter(id => !incomingMaskIds.includes(id));
        for (const maskId of masksToDelete) {
            await db_1.db
                .update(db_1.masks)
                .set({ deleted: true })
                .where((0, db_1.eq)(db_1.masks.id, maskId));
        }
        // Insert or update masks
        for (const maskItem of maskData) {
            if (maskItem.id) {
                // Update existing mask
                await db_1.db
                    .update(db_1.masks)
                    .set({
                    category: maskItem.category,
                    path: maskItem.path,
                    deleted: false,
                })
                    .where((0, db_1.eq)(db_1.masks.id, maskItem.id));
            }
            else {
                // Insert new mask
                const newMask = {
                    sceneId,
                    category: maskItem.category,
                    path: maskItem.path,
                    authorId: authorId || maskItem.authorId || null,
                    deleted: false,
                };
                await db_1.db.insert(db_1.masks).values(newMask);
            }
        }
    }
    /**
     * Get masks by category for a scene
     */
    async getMasksByCategory(sceneId, category) {
        return await db_1.db
            .select()
            .from(db_1.masks)
            .where((0, db_1.and)((0, db_1.eq)(db_1.masks.sceneId, sceneId), (0, db_1.eq)(db_1.masks.category, category), (0, db_1.eq)(db_1.masks.deleted, false)));
    }
    /**
     * Get all masks for a scene
     */
    async getMasksByScene(sceneId) {
        return await db_1.db
            .select()
            .from(db_1.masks)
            .where((0, db_1.and)((0, db_1.eq)(db_1.masks.sceneId, sceneId), (0, db_1.eq)(db_1.masks.deleted, false)));
    }
    /**
     * Soft delete a specific mask
     */
    async softDeleteMask(maskId) {
        await db_1.db
            .update(db_1.masks)
            .set({ deleted: true })
            .where((0, db_1.eq)(db_1.masks.id, maskId));
    }
    /**
     * Get mask history for a scene (simplified version)
     * In a full implementation, this would track changes over time
     */
    async getMaskHistory(sceneId) {
        const sceneMasks = await db_1.db
            .select()
            .from(db_1.masks)
            .where((0, db_1.eq)(db_1.masks.sceneId, sceneId));
        // Group by creation date (simplified history)
        const historyMap = new Map();
        sceneMasks.forEach(mask => {
            const dateKey = mask.createdAt.toISOString().split('T')[0];
            if (!historyMap.has(dateKey)) {
                historyMap.set(dateKey, []);
            }
            historyMap.get(dateKey).push(mask);
        });
        return Array.from(historyMap.entries()).map(([date, masks]) => ({
            id: `${sceneId}-${date}`,
            masks,
            createdAt: new Date(date),
            authorId: masks[0]?.authorId || null,
        }));
    }
    /**
     * Export masks as GeoJSON format
     */
    async exportMasksAsGeoJSON(sceneId) {
        const sceneMasks = await this.getMasksByScene(sceneId);
        const features = sceneMasks.map(mask => ({
            type: 'Feature',
            properties: {
                id: mask.id,
                category: mask.category,
                authorId: mask.authorId,
                createdAt: mask.createdAt,
            },
            geometry: mask.path,
        }));
        return {
            type: 'FeatureCollection',
            features,
        };
    }
    /**
     * Get available mask categories
     */
    async getCategories(sceneId) {
        let result;
        if (sceneId) {
            result = await db_1.db
                .selectDistinct({ category: db_1.masks.category })
                .from(db_1.masks)
                .where((0, db_1.and)((0, db_1.eq)(db_1.masks.sceneId, sceneId), (0, db_1.eq)(db_1.masks.deleted, false)));
        }
        else {
            result = await db_1.db
                .selectDistinct({ category: db_1.masks.category })
                .from(db_1.masks)
                .where((0, db_1.eq)(db_1.masks.deleted, false));
        }
        return result.map(r => r.category);
    }
}
exports.MaskService = MaskService;
exports.maskService = new MaskService();
