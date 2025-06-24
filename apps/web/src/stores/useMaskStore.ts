import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GeoJSONGeometry {
  type: 'Point' | 'Polygon' | 'LineString';
  coordinates: number[] | number[][] | number[][][];
}

export interface Mask {
  id: string;
  sceneId: string;
  category: string;
  path: GeoJSONGeometry;
  deleted: boolean;
  authorId: string;
  createdAt: Date;
}

export interface MaskStore {
  masks: Mask[];
  selectedMaskIds: string[];
  isDrawing: boolean;
  drawingCategory: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMasks: (masks: Mask[]) => void;
  addMask: (mask: Mask) => void;
  updateMask: (id: string, updates: Partial<Mask>) => void;
  removeMask: (id: string) => void;
  setSelectedMasks: (ids: string[]) => void;
  toggleMaskSelection: (id: string) => void;
  setDrawing: (isDrawing: boolean) => void;
  setDrawingCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getMasksByScene: (sceneId: string) => Mask[];
  getSelectedMasks: () => Mask[];
  getMasksByCategory: (sceneId: string, category: string) => Mask[];
}

export const useMaskStore = create<MaskStore>()(
  persist(
    (set, get) => ({
      masks: [],
      selectedMaskIds: [],
      isDrawing: false,
      drawingCategory: 'Plants & Trees',
      isLoading: false,
      error: null,

      // Actions
      setMasks: (masks) => set({ masks }),
      
      addMask: (mask) => 
        set((state) => ({ 
          masks: [...state.masks, mask] 
        })),
      
      updateMask: (id, updates) => 
        set((state) => ({
          masks: state.masks.map((mask) =>
            mask.id === id ? { ...mask, ...updates } : mask
          )
        })),
      
      removeMask: (id) => 
        set((state) => ({
          masks: state.masks.filter((mask) => mask.id !== id),
          selectedMaskIds: state.selectedMaskIds.filter((maskId) => maskId !== id)
        })),
      
      setSelectedMasks: (ids) => set({ selectedMaskIds: ids }),
      
      toggleMaskSelection: (id) => 
        set((state) => ({
          selectedMaskIds: state.selectedMaskIds.includes(id)
            ? state.selectedMaskIds.filter((maskId) => maskId !== id)
            : [...state.selectedMaskIds, id]
        })),
      
      setDrawing: (isDrawing) => set({ isDrawing }),
      
      setDrawingCategory: (drawingCategory) => set({ drawingCategory }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),

      // Getters
      getMasksByScene: (sceneId) => {
        const { masks } = get();
        return masks
          .filter(mask => mask.sceneId === sceneId && !mask.deleted)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },
      
      getSelectedMasks: () => {
        const { masks, selectedMaskIds } = get();
        return masks.filter(mask => selectedMaskIds.includes(mask.id));
      },
      
      getMasksByCategory: (sceneId, category) => {
        const { masks } = get();
        return masks.filter(mask => 
          mask.sceneId === sceneId && 
          mask.category === category && 
          !mask.deleted
        );
      },
    }),
    {
      name: 'terrashaper-masks',
      partialize: (state) => ({ 
        masks: state.masks, 
        selectedMaskIds: state.selectedMaskIds,
        drawingCategory: state.drawingCategory
      }),
    }
  )
);