var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { db, masks, eq, and } from '@terrashaper/db';
export class MaskService {
    /**
     * Save masks for a scene with diff tracking
     */
    saveMasks(sceneId, maskData, authorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get existing masks for comparison
            const existingMasks = yield db
                .select()
                .from(masks)
                .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));
            const existingMaskIds = existingMasks.map(m => m.id);
            const incomingMaskIds = maskData.filter(m => m.id).map(m => m.id);
            // Soft delete masks that are no longer present
            const masksToDelete = existingMaskIds.filter(id => !incomingMaskIds.includes(id));
            for (const maskId of masksToDelete) {
                yield db
                    .update(masks)
                    .set({ deleted: true })
                    .where(eq(masks.id, maskId));
            }
            // Insert or update masks
            for (const maskItem of maskData) {
                if (maskItem.id) {
                    // Update existing mask
                    yield db
                        .update(masks)
                        .set({
                        category: maskItem.category,
                        path: maskItem.path,
                        deleted: false,
                    })
                        .where(eq(masks.id, maskItem.id));
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
                    yield db.insert(masks).values(newMask);
                }
            }
        });
    }
    /**
     * Get masks by category for a scene
     */
    getMasksByCategory(sceneId, category) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db
                .select()
                .from(masks)
                .where(and(eq(masks.sceneId, sceneId), eq(masks.category, category), eq(masks.deleted, false)));
        });
    }
    /**
     * Get all masks for a scene
     */
    getMasksByScene(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db
                .select()
                .from(masks)
                .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));
        });
    }
    /**
     * Soft delete a specific mask
     */
    softDeleteMask(maskId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db
                .update(masks)
                .set({ deleted: true })
                .where(eq(masks.id, maskId));
        });
    }
    /**
     * Get mask history for a scene (simplified version)
     * In a full implementation, this would track changes over time
     */
    getMaskHistory(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sceneMasks = yield db
                .select()
                .from(masks)
                .where(eq(masks.sceneId, sceneId));
            // Group by creation date (simplified history)
            const historyMap = new Map();
            sceneMasks.forEach(mask => {
                const dateKey = mask.createdAt.toISOString().split('T')[0];
                if (!historyMap.has(dateKey)) {
                    historyMap.set(dateKey, []);
                }
                historyMap.get(dateKey).push(mask);
            });
            return Array.from(historyMap.entries()).map(([date, masks]) => {
                var _a;
                return ({
                    id: `${sceneId}-${date}`,
                    masks,
                    createdAt: new Date(date),
                    authorId: ((_a = masks[0]) === null || _a === void 0 ? void 0 : _a.authorId) || null,
                });
            });
        });
    }
    /**
     * Export masks as GeoJSON format
     */
    exportMasksAsGeoJSON(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sceneMasks = yield this.getMasksByScene(sceneId);
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
        });
    }
    /**
     * Get available mask categories
     */
    getCategories(sceneId) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (sceneId) {
                result = yield db
                    .selectDistinct({ category: masks.category })
                    .from(masks)
                    .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));
            }
            else {
                result = yield db
                    .selectDistinct({ category: masks.category })
                    .from(masks)
                    .where(eq(masks.deleted, false));
            }
            return result.map(r => r.category);
        });
    }
}
export const maskService = new MaskService();
