import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Scene {
  id: string;
  projectId: string;
  imageUrl: string;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SceneStore {
  scenes: Scene[];
  currentSceneId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setScenes: (scenes: Scene[]) => void;
  addScene: (scene: Scene) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  setCurrentScene: (id: string) => void;
  reorderScenes: (sceneIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getCurrentScene: () => Scene | null;
  getScenesByProject: (projectId: string) => Scene[];
}

export const useSceneStore = create<SceneStore>()(
  persist(
    (set, get) => ({
      scenes: [],
      currentSceneId: null,
      isLoading: false,
      error: null,

      // Actions
      setScenes: (scenes) => set({ scenes }),
      
      addScene: (scene) => 
        set((state) => ({ 
          scenes: [...state.scenes, scene] 
        })),
      
      updateScene: (id, updates) => 
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === id ? { ...scene, ...updates } : scene
          )
        })),
      
      removeScene: (id) => 
        set((state) => ({
          scenes: state.scenes.filter((scene) => scene.id !== id),
          currentSceneId: state.currentSceneId === id ? null : state.currentSceneId
        })),
      
      setCurrentScene: (id) => set({ currentSceneId: id }),
      
      reorderScenes: (sceneIds) => 
        set((state) => {
          const sceneMap = new Map(state.scenes.map(scene => [scene.id, scene]));
          const reorderedScenes = sceneIds
            .map(id => sceneMap.get(id))
            .filter(Boolean) as Scene[];
          return { scenes: reorderedScenes };
        }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),

      // Getters
      getCurrentScene: () => {
        const { scenes, currentSceneId } = get();
        return scenes.find(scene => scene.id === currentSceneId) || null;
      },
      
      getScenesByProject: (projectId) => {
        const { scenes } = get();
        return scenes
          .filter(scene => scene.projectId === projectId)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'terrashaper-scenes',
      partialize: (state) => ({ 
        scenes: state.scenes, 
        currentSceneId: state.currentSceneId 
      }),
    }
  )
);