import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { LayerData } from '@/lib/commands/LayerCommands';

interface LayerStore {
  // State
  layers: LayerData[];
  activeLayerId: string;
  selectedLayerIds: Set<string>;
  
  // Actions
  setLayers: (layers: LayerData[]) => void;
  addLayer: (layer: LayerData) => void;
  updateLayer: (layerId: string, updates: Partial<LayerData>) => void;
  removeLayer: (layerId: string) => void;
  reorderLayers: (layerId: string, newParentId: string | null, newIndex: number) => void;
  setActiveLayer: (layerId: string) => void;
  setSelectedLayers: (layerIds: string[]) => void;
  toggleLayerSelection: (layerId: string) => void;
  clearSelection: () => void;
  
  // Layer operations
  createLayer: (name: string, parentId?: string) => LayerData;
  createGroup: (name: string, parentId?: string) => LayerData;
  groupLayers: (layerIds: string[], groupName: string) => LayerData;
  ungroupLayer: (groupId: string) => LayerData[];
  duplicateLayer: (layerId: string) => LayerData | null;
  
  // Bulk operations
  bulkToggleVisibility: (layerIds: string[], visible: boolean) => void;
  bulkToggleLock: (layerIds: string[], locked: boolean) => void;
  bulkSetOpacity: (layerIds: string[], opacity: number) => void;
  bulkDelete: (layerIds: string[]) => void;
  
  // Utilities
  getLayer: (layerId: string) => LayerData | undefined;
  getLayerTree: (parentId?: string | null) => LayerData[];
  getLayerPath: (layerId: string) => LayerData[];
  getChildLayers: (parentId: string) => LayerData[];
  getAllDescendants: (layerId: string) => LayerData[];
  getLayerDepth: (layerId: string) => number;
  canDropLayer: (dragLayerId: string, dropLayerId: string) => boolean;
  findAvailableOrder: (parentId: string | null) => number;
}

export const useLayerStore = create<LayerStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        layers: [
          {
            id: 'default',
            name: 'Default Layer',
            type: 'layer',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            objects: [],
            order: 0,
          },
        ],
        activeLayerId: 'default',
        selectedLayerIds: new Set(),

        // Actions
        setLayers: (layers) => {
          set({ layers }, false, 'setLayers');
        },

        addLayer: (layer) => {
          set((state) => ({
            layers: [...state.layers, layer],
          }), false, 'addLayer');
        },

        updateLayer: (layerId, updates) => {
          set((state) => ({
            layers: state.layers.map(layer =>
              layer.id === layerId ? { ...layer, ...updates } : layer
            ),
          }), false, 'updateLayer');
        },

        removeLayer: (layerId) => {
          set((state) => {
            // Get all descendants that need to be removed
            const getAllDescendants = (id: string): string[] => {
              const children = state.layers.filter(l => l.parentId === id);
              return [id, ...children.flatMap(child => getAllDescendants(child.id))];
            };

            const toRemove = getAllDescendants(layerId);
            const remainingLayers = state.layers.filter(l => !toRemove.includes(l.id));

            // If removing active layer, switch to default
            const newActiveLayerId = toRemove.includes(state.activeLayerId) 
              ? 'default' 
              : state.activeLayerId;

            // Clear selection of removed layers
            const newSelection = new Set(
              Array.from(state.selectedLayerIds).filter(id => !toRemove.includes(id))
            );

            return {
              layers: remainingLayers,
              activeLayerId: newActiveLayerId,
              selectedLayerIds: newSelection,
            };
          }, false, 'removeLayer');
        },

        reorderLayers: (layerId, newParentId, newIndex) => {
          set((state) => {
            const layer = state.layers.find(l => l.id === layerId);
            if (!layer) return state;

            // Validate the move (prevent circular dependencies)
            if (newParentId && get().getAllDescendants(layerId).some(d => d.id === newParentId)) {
              return state; // Invalid move
            }

            // Update the moved layer
            const updatedLayer = { ...layer, parentId: newParentId };

            // Get siblings in the new parent
            const siblings = state.layers.filter(l => 
              l.parentId === newParentId && l.id !== layerId
            ).sort((a, b) => a.order - b.order);

            // Insert at new position and reorder
            siblings.splice(newIndex, 0, updatedLayer);

            const reorderedLayers = state.layers.map(l => {
              if (l.id === layerId) {
                return { ...updatedLayer, order: newIndex };
              }
              
              const siblingIndex = siblings.findIndex(s => s.id === l.id);
              if (siblingIndex !== -1 && l.parentId === newParentId) {
                return { ...l, order: siblingIndex };
              }
              
              return l;
            });

            return { layers: reorderedLayers };
          }, false, 'reorderLayers');
        },

        setActiveLayer: (layerId) => {
          set({ activeLayerId: layerId }, false, 'setActiveLayer');
        },

        setSelectedLayers: (layerIds) => {
          set({ selectedLayerIds: new Set(layerIds) }, false, 'setSelectedLayers');
        },

        toggleLayerSelection: (layerId) => {
          set((state) => {
            const newSelection = new Set(state.selectedLayerIds);
            if (newSelection.has(layerId)) {
              newSelection.delete(layerId);
            } else {
              newSelection.add(layerId);
            }
            return { selectedLayerIds: newSelection };
          }, false, 'toggleLayerSelection');
        },

        clearSelection: () => {
          set({ selectedLayerIds: new Set() }, false, 'clearSelection');
        },

        // Layer operations
        createLayer: (name, parentId) => {
          const layer: LayerData = {
            id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            type: 'layer',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            objects: [],
            order: get().findAvailableOrder(parentId || null),
            parentId,
          };

          get().addLayer(layer);
          return layer;
        },

        createGroup: (name, parentId) => {
          const group: LayerData = {
            id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            type: 'group',
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            objects: [],
            order: get().findAvailableOrder(parentId || null),
            parentId,
          };

          get().addLayer(group);
          return group;
        },

        groupLayers: (layerIds, groupName) => {
          const state = get();
          const layersToGroup = layerIds.map(id => state.getLayer(id)).filter(Boolean) as LayerData[];
          
          if (layersToGroup.length === 0) {
            throw new Error('No valid layers to group');
          }

          // Create group at the position of the first layer
          const firstLayer = layersToGroup[0];
          const group = state.createGroup(groupName, firstLayer.parentId);

          // Move layers into the group
          layersToGroup.forEach((layer, index) => {
            state.updateLayer(layer.id, {
              parentId: group.id,
              order: index,
            });
          });

          return group;
        },

        ungroupLayer: (groupId) => {
          const state = get();
          const group = state.getLayer(groupId);
          if (!group || group.type !== 'group') {
            throw new Error('Invalid group layer');
          }

          const childLayers = state.getChildLayers(groupId);
          
          // Move children to group's parent
          childLayers.forEach((child, index) => {
            state.updateLayer(child.id, {
              parentId: group.parentId,
              order: group.order + index + 1,
            });
          });

          // Remove the group
          state.removeLayer(groupId);

          return childLayers;
        },

        duplicateLayer: (layerId) => {
          const state = get();
          const layer = state.getLayer(layerId);
          if (!layer) return null;

          const duplicate: LayerData = {
            ...layer,
            id: `${layer.id}_copy_${Date.now()}`,
            name: `${layer.name} Copy`,
            order: layer.order + 1,
            objects: [], // Objects would be duplicated separately
          };

          state.addLayer(duplicate);
          return duplicate;
        },

        // Bulk operations
        bulkToggleVisibility: (layerIds, visible) => {
          set((state) => ({
            layers: state.layers.map(layer =>
              layerIds.includes(layer.id) ? { ...layer, visible } : layer
            ),
          }), false, 'bulkToggleVisibility');
        },

        bulkToggleLock: (layerIds, locked) => {
          set((state) => ({
            layers: state.layers.map(layer =>
              layerIds.includes(layer.id) ? { ...layer, locked } : layer
            ),
          }), false, 'bulkToggleLock');
        },

        bulkSetOpacity: (layerIds, opacity) => {
          set((state) => ({
            layers: state.layers.map(layer =>
              layerIds.includes(layer.id) ? { ...layer, opacity } : layer
            ),
          }), false, 'bulkSetOpacity');
        },

        bulkDelete: (layerIds) => {
          layerIds.forEach(layerId => {
            if (layerId !== 'default') { // Protect default layer
              get().removeLayer(layerId);
            }
          });
        },

        // Utilities
        getLayer: (layerId) => {
          return get().layers.find(layer => layer.id === layerId);
        },

        getLayerTree: (parentId = null) => {
          return get().layers
            .filter(layer => layer.parentId === parentId)
            .sort((a, b) => a.order - b.order);
        },

        getLayerPath: (layerId) => {
          const state = get();
          const path: LayerData[] = [];
          let currentLayer = state.getLayer(layerId);

          while (currentLayer) {
            path.unshift(currentLayer);
            currentLayer = currentLayer.parentId 
              ? state.getLayer(currentLayer.parentId) 
              : undefined;
          }

          return path;
        },

        getChildLayers: (parentId) => {
          return get().layers
            .filter(layer => layer.parentId === parentId)
            .sort((a, b) => a.order - b.order);
        },

        getAllDescendants: (layerId) => {
          const state = get();
          const descendants: LayerData[] = [];
          const children = state.getChildLayers(layerId);

          children.forEach(child => {
            descendants.push(child);
            descendants.push(...state.getAllDescendants(child.id));
          });

          return descendants;
        },

        getLayerDepth: (layerId) => {
          const state = get();
          let depth = 0;
          let currentLayer = state.getLayer(layerId);

          while (currentLayer?.parentId) {
            depth++;
            currentLayer = state.getLayer(currentLayer.parentId);
          }

          return depth;
        },

        canDropLayer: (dragLayerId, dropLayerId) => {
          const state = get();
          
          // Can't drop on self
          if (dragLayerId === dropLayerId) return false;
          
          // Can't drop on descendants (would create circular dependency)
          const descendants = state.getAllDescendants(dragLayerId);
          return !descendants.some(d => d.id === dropLayerId);
        },

        findAvailableOrder: (parentId) => {
          const siblings = get().getLayerTree(parentId);
          return siblings.length > 0 
            ? Math.max(...siblings.map(s => s.order)) + 1 
            : 0;
        },
      }),
      {
        name: 'terrashaper-layers',
        partialize: (state) => ({
          layers: state.layers,
          activeLayerId: state.activeLayerId,
        }),
      }
    ),
    { name: 'LayerStore' }
  )
);