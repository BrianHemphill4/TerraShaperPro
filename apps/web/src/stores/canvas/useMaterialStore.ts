import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MaterialCategory = 'mulch' | 'stone' | 'hardscape' | 'grass' | 'plant' | 'water';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  color: string;
  texture?: string;
  costPerUnit: number;
  unit: 'sqft' | 'sqm' | 'lf' | 'lm';
  description?: string;
  imageUrl?: string;
  density?: number; // for bulk materials
  coverage?: number; // coverage per unit
}

export interface MaterialStore {
  materials: Material[];
  selectedMaterialId: string | null;
  recentMaterials: string[];
  customMaterials: Material[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;
  setSelectedMaterial: (id: string | null) => void;
  addToRecentMaterials: (id: string) => void;
  addCustomMaterial: (material: Material) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  getSelectedMaterial: () => Material | null;
  getMaterialsByCategory: (category: MaterialCategory) => Material[];
  getRecentMaterials: () => Material[];
  searchMaterials: (query: string) => Material[];
}

// Default material library
const DEFAULT_MATERIALS: Material[] = [
  // Mulch materials
  {
    id: 'mulch-bark-brown',
    name: 'Brown Bark Mulch',
    category: 'mulch',
    color: '#8B4513',
    costPerUnit: 3.50,
    unit: 'sqft',
    description: 'Natural brown bark mulch for landscaping beds',
    coverage: 3 // 3 sqft per cubic yard at 2" depth
  },
  {
    id: 'mulch-bark-red',
    name: 'Red Bark Mulch',
    category: 'mulch',
    color: '#A0522D',
    costPerUnit: 4.00,
    unit: 'sqft',
    description: 'Decorative red-dyed bark mulch',
    coverage: 3
  },
  {
    id: 'mulch-rubber-black',
    name: 'Black Rubber Mulch',
    category: 'mulch',
    color: '#2F2F2F',
    costPerUnit: 5.50,
    unit: 'sqft',
    description: 'Recycled rubber mulch, long-lasting',
    coverage: 4
  },

  // Stone materials
  {
    id: 'stone-pea-gravel',
    name: 'Pea Gravel',
    category: 'stone',
    color: '#D3D3D3',
    costPerUnit: 2.75,
    unit: 'sqft',
    description: 'Small rounded gravel stones',
    coverage: 2
  },
  {
    id: 'stone-river-rock',
    name: 'River Rock',
    category: 'stone',
    color: '#778899',
    costPerUnit: 4.25,
    unit: 'sqft',
    description: 'Smooth river rocks for decorative areas',
    coverage: 1.5
  },
  {
    id: 'stone-lava-rock',
    name: 'Lava Rock',
    category: 'stone',
    color: '#800000',
    costPerUnit: 6.00,
    unit: 'sqft',
    description: 'Volcanic rock with unique texture',
    coverage: 2.5
  },

  // Hardscape materials
  {
    id: 'hardscape-concrete-pavers',
    name: 'Concrete Pavers',
    category: 'hardscape',
    color: '#C0C0C0',
    costPerUnit: 8.50,
    unit: 'sqft',
    description: 'Interlocking concrete pavers',
    coverage: 1
  },
  {
    id: 'hardscape-brick-pavers',
    name: 'Brick Pavers',
    category: 'hardscape',
    color: '#CD853F',
    costPerUnit: 12.00,
    unit: 'sqft',
    description: 'Traditional clay brick pavers',
    coverage: 1
  },
  {
    id: 'hardscape-flagstone',
    name: 'Natural Flagstone',
    category: 'hardscape',
    color: '#696969',
    costPerUnit: 15.50,
    unit: 'sqft',
    description: 'Natural stone flagging',
    coverage: 1
  },

  // Grass materials
  {
    id: 'grass-bermuda',
    name: 'Bermuda Grass',
    category: 'grass',
    color: '#228B22',
    costPerUnit: 1.25,
    unit: 'sqft',
    description: 'Warm-season grass, drought tolerant',
    coverage: 1
  },
  {
    id: 'grass-fescue',
    name: 'Tall Fescue',
    category: 'grass',
    color: '#32CD32',
    costPerUnit: 1.50,
    unit: 'sqft',
    description: 'Cool-season grass, shade tolerant',
    coverage: 1
  },
  {
    id: 'grass-zoysia',
    name: 'Zoysia Grass',
    category: 'grass',
    color: '#9ACD32',
    costPerUnit: 2.25,
    unit: 'sqft',
    description: 'Premium grass with dense growth',
    coverage: 1
  }
];

export const useMaterialStore = create<MaterialStore>()(
  persist(
    (set, get) => ({
      materials: DEFAULT_MATERIALS,
      selectedMaterialId: null,
      recentMaterials: [],
      customMaterials: [],
      isLoading: false,
      error: null,

      // Actions
      setMaterials: (materials) => set({ materials }),

      addMaterial: (material) =>
        set((state) => ({
          materials: [...state.materials, material]
        })),

      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((material) =>
            material.id === id ? { ...material, ...updates } : material
          )
        })),

      removeMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((material) => material.id !== id),
          selectedMaterialId: state.selectedMaterialId === id ? null : state.selectedMaterialId,
          recentMaterials: state.recentMaterials.filter((materialId) => materialId !== id)
        })),

      setSelectedMaterial: (id) => {
        set({ selectedMaterialId: id });
        if (id) {
          get().addToRecentMaterials(id);
        }
      },

      addToRecentMaterials: (id) =>
        set((state) => {
          const filtered = state.recentMaterials.filter((materialId) => materialId !== id);
          return {
            recentMaterials: [id, ...filtered].slice(0, 10) // Keep last 10
          };
        }),

      addCustomMaterial: (material) =>
        set((state) => ({
          customMaterials: [...state.customMaterials, material],
          materials: [...state.materials, material]
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Getters
      getSelectedMaterial: () => {
        const { materials, selectedMaterialId } = get();
        return materials.find(material => material.id === selectedMaterialId) || null;
      },

      getMaterialsByCategory: (category) => {
        const { materials } = get();
        return materials.filter(material => material.category === category);
      },

      getRecentMaterials: () => {
        const { materials, recentMaterials } = get();
        return recentMaterials
          .map(id => materials.find(material => material.id === id))
          .filter(Boolean) as Material[];
      },

      searchMaterials: (query) => {
        const { materials } = get();
        const lowercaseQuery = query.toLowerCase();
        return materials.filter(material =>
          material.name.toLowerCase().includes(lowercaseQuery) ||
          material.description?.toLowerCase().includes(lowercaseQuery) ||
          material.category.toLowerCase().includes(lowercaseQuery)
        );
      }
    }),
    {
      name: 'terrashaper-materials',
      partialize: (state) => ({
        selectedMaterialId: state.selectedMaterialId,
        recentMaterials: state.recentMaterials,
        customMaterials: state.customMaterials
      })
    }
  )
);