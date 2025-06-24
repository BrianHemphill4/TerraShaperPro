import { db, masks, type Mask, type NewMask, eq, and } from '@terrashaper/db';

export interface MaskData {
  id?: string;
  category: string;
  path: any; // GeoJSON format
  authorId?: string;
}

export interface MaskHistory {
  id: string;
  masks: Mask[];
  createdAt: Date;
  authorId: string | null;
}

export class MaskService {
  /**
   * Save masks for a scene with diff tracking
   */
  async saveMasks(sceneId: string, maskData: MaskData[], authorId?: string): Promise<void> {
    // Get existing masks for comparison
    const existingMasks = await db
      .select()
      .from(masks)
      .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));

    const existingMaskIds = existingMasks.map(m => m.id);
    const incomingMaskIds = maskData.filter(m => m.id).map(m => m.id!);

    // Soft delete masks that are no longer present
    const masksToDelete = existingMaskIds.filter(id => !incomingMaskIds.includes(id));
    for (const maskId of masksToDelete) {
      await db
        .update(masks)
        .set({ deleted: true })
        .where(eq(masks.id, maskId));
    }

    // Insert or update masks
    for (const maskItem of maskData) {
      if (maskItem.id) {
        // Update existing mask
        await db
          .update(masks)
          .set({
            category: maskItem.category,
            path: maskItem.path,
            deleted: false,
          })
          .where(eq(masks.id, maskItem.id));
      } else {
        // Insert new mask
        const newMask: NewMask = {
          sceneId,
          category: maskItem.category,
          path: maskItem.path,
          authorId: authorId || maskItem.authorId || null,
          deleted: false,
        };
        await db.insert(masks).values(newMask);
      }
    }
  }

  /**
   * Get masks by category for a scene
   */
  async getMasksByCategory(sceneId: string, category: string): Promise<Mask[]> {
    return await db
      .select()
      .from(masks)
      .where(and(
        eq(masks.sceneId, sceneId),
        eq(masks.category, category),
        eq(masks.deleted, false)
      ));
  }

  /**
   * Get all masks for a scene
   */
  async getMasksByScene(sceneId: string): Promise<Mask[]> {
    return await db
      .select()
      .from(masks)
      .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));
  }

  /**
   * Soft delete a specific mask
   */
  async softDeleteMask(maskId: string): Promise<void> {
    await db
      .update(masks)
      .set({ deleted: true })
      .where(eq(masks.id, maskId));
  }

  /**
   * Get mask history for a scene (simplified version)
   * In a full implementation, this would track changes over time
   */
  async getMaskHistory(sceneId: string): Promise<MaskHistory[]> {
    const sceneMasks = await db
      .select()
      .from(masks)
      .where(eq(masks.sceneId, sceneId))
;

    // Group by creation date (simplified history)
    const historyMap = new Map<string, Mask[]>();
    
    sceneMasks.forEach(mask => {
      const dateKey = mask.createdAt.toISOString().split('T')[0];
      if (!historyMap.has(dateKey)) {
        historyMap.set(dateKey, []);
      }
      historyMap.get(dateKey)!.push(mask);
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
  async exportMasksAsGeoJSON(sceneId: string): Promise<any> {
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
  async getCategories(sceneId?: string): Promise<string[]> {
    let result;
    
    if (sceneId) {
      result = await db
        .selectDistinct({ category: masks.category })
        .from(masks)
        .where(and(eq(masks.sceneId, sceneId), eq(masks.deleted, false)));
    } else {
      result = await db
        .selectDistinct({ category: masks.category })
        .from(masks)
        .where(eq(masks.deleted, false));
    }

    return result.map(r => r.category);
  }
}

export const maskService = new MaskService();