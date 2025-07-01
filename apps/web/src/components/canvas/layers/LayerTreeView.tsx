'use client';

import { useCallback, useState } from 'react';

import type { LayerData } from '@/lib/commands/LayerCommands';

import styles from './LayerTreeView.module.css';

interface LayerTreeNode {
  layer: LayerData;
  level: number;
  expanded: boolean;
  selected: boolean;
  dragging: boolean;
  children: LayerTreeNode[];
}

interface LayerDragState {
  draggedLayer: string | null;
  dropTarget: string | null;
  dropPosition: 'above' | 'below' | 'inside' | null;
}

interface LayerTreeViewProps {
  layers: LayerData[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerRename: (layerId: string, newName: string) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerReorder: (layerId: string, newParentId: string | null, newIndex: number) => void;
  onLayerGroup: (layerIds: string[], groupName: string) => void;
  onLayerUngroup: (groupId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerBlendModeChange: (layerId: string, blendMode: string) => void;
}

const LayerTreeView = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerRename,
  onLayerDelete,
  onLayerReorder,
  onLayerGroup,
  onLayerUngroup,
  onLayerDuplicate,
  onLayerOpacityChange,
  onLayerBlendModeChange,
}: LayerTreeViewProps) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(['default']));
  const [editingLayer, setEditingLayer] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [dragState, setDragState] = useState<LayerDragState>({
    draggedLayer: null,
    dropTarget: null,
    dropPosition: null,
  });
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    layerId: string;
    x: number;
    y: number;
  } | null>(null);

  // Build hierarchical tree structure
  const buildLayerTree = useCallback((parentId: string | null = null, level: number = 0): LayerTreeNode[] => {
    return layers
      .filter(layer => layer.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(layer => {
        const children = buildLayerTree(layer.id, level + 1);
        return {
          layer,
          level,
          expanded: expandedLayers.has(layer.id),
          selected: selectedLayers.has(layer.id),
          dragging: dragState.draggedLayer === layer.id,
          children,
        };
      });
  }, [layers, expandedLayers, selectedLayers, dragState.draggedLayer]);

  const toggleExpanded = useCallback((layerId: string) => {
    setExpandedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  }, []);

  const handleLayerSelect = useCallback((layerId: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedLayers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(layerId)) {
          newSet.delete(layerId);
        } else {
          newSet.add(layerId);
        }
        return newSet;
      });
    } else {
      setSelectedLayers(new Set([layerId]));
      onLayerSelect(layerId);
    }
  }, [onLayerSelect]);

  const startRename = useCallback((layerId: string, currentName: string) => {
    setEditingLayer(layerId);
    setEditingName(currentName);
  }, []);

  const finishRename = useCallback(() => {
    if (editingLayer && editingName.trim()) {
      onLayerRename(editingLayer, editingName.trim());
    }
    setEditingLayer(null);
    setEditingName('');
  }, [editingLayer, editingName, onLayerRename]);

  const handleDragStart = useCallback((e: React.DragEvent, layerId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layerId);
    
    setDragState(prev => ({ ...prev, draggedLayer: layerId }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let dropPosition: 'above' | 'below' | 'inside';
    if (y < height * 0.25) {
      dropPosition = 'above';
    } else if (y > height * 0.75) {
      dropPosition = 'below';
    } else {
      dropPosition = 'inside';
    }

    setDragState(prev => ({
      ...prev,
      dropTarget: layerId,
      dropPosition,
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      dropTarget: null,
      dropPosition: null,
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    
    const draggedLayerId = dragState.draggedLayer;
    if (!draggedLayerId || draggedLayerId === targetLayerId) {
      setDragState({ draggedLayer: null, dropTarget: null, dropPosition: null });
      return;
    }

    const targetLayer = layers.find(l => l.id === targetLayerId);
    if (!targetLayer) return;

    let newParentId: string | null = null;
    let newIndex = 0;

    switch (dragState.dropPosition) {
      case 'above':
        newParentId = targetLayer.parentId;
        newIndex = targetLayer.order;
        break;
      case 'below':
        newParentId = targetLayer.parentId;
        newIndex = targetLayer.order + 1;
        break;
      case 'inside':
        if (targetLayer.type === 'group') {
          newParentId = targetLayer.id;
          const childLayers = layers.filter(l => l.parentId === targetLayer.id);
          newIndex = childLayers.length;
        } else {
          newParentId = targetLayer.parentId;
          newIndex = targetLayer.order + 1;
        }
        break;
    }

    onLayerReorder(draggedLayerId, newParentId, newIndex);
    setDragState({ draggedLayer: null, dropTarget: null, dropPosition: null });
  }, [dragState, layers, onLayerReorder]);

  const handleContextMenu = useCallback((e: React.MouseEvent, layerId: string) => {
    e.preventDefault();
    setContextMenu({
      layerId,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleGroupSelected = useCallback(() => {
    if (selectedLayers.size > 1) {
      onLayerGroup(Array.from(selectedLayers), `Group ${Date.now()}`);
      setSelectedLayers(new Set());
    }
    closeContextMenu();
  }, [selectedLayers, onLayerGroup, closeContextMenu]);

  const getDropIndicatorStyle = (node: LayerTreeNode): React.CSSProperties => {
    if (dragState.dropTarget !== node.layer.id) return {};

    const baseStyle: React.CSSProperties = {
      position: 'relative',
    };

    switch (dragState.dropPosition) {
      case 'above':
        return {
          ...baseStyle,
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'var(--color-primary)',
            zIndex: 10,
          },
        };
      case 'below':
        return {
          ...baseStyle,
          '::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'var(--color-primary)',
            zIndex: 10,
          },
        };
      case 'inside':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-primary-surface)',
          borderRadius: '4px',
        };
      default:
        return baseStyle;
    }
  };

  const renderLayerNode = (node: LayerTreeNode): React.JSX.Element => {
    const { layer, level, expanded, selected, dragging, children } = node;
    const hasChildren = children.length > 0;
    const isActive = layer.id === activeLayerId;
    const isEditing = editingLayer === layer.id;

    return (
      <div key={layer.id} className={styles.layerNode}>
        <div
          className={`${styles.layerItem} ${isActive ? styles.active : ''} ${selected ? styles.selected : ''} ${dragging ? styles.dragging : ''}`}
          style={{ 
            ...getDropIndicatorStyle(node),
            paddingLeft: `${level * 20 + 12}px`,
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, layer.id)}
          onDragOver={(e) => handleDragOver(e, layer.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, layer.id)}
          onClick={(e) => handleLayerSelect(layer.id, e.ctrlKey || e.metaKey)}
          onContextMenu={(e) => handleContextMenu(e, layer.id)}
        >
          {hasChildren && (
            <button
              type="button"
              className={styles.expandButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(layer.id);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className={styles.layerIcon}>
            {layer.type === 'group' ? '📁' : '📄'}
          </div>

          <button
            type="button"
            className={styles.visibilityButton}
            onClick={(e) => {
              e.stopPropagation();
              onLayerToggleVisibility(layer.id);
            }}
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={styles.lockButton}
            onClick={(e) => {
              e.stopPropagation();
              onLayerToggleLock(layer.id);
            }}
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" strokeWidth="2" />
              </svg>
            )}
          </button>

          <div className={styles.layerName}>
            {isEditing ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRename();
                  if (e.key === 'Escape') {
                    setEditingLayer(null);
                    setEditingName('');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startRename(layer.id, layer.name);
                }}
              >
                {layer.name}
              </span>
            )}
            <span className={styles.objectCount}>({layer.objects.length})</span>
          </div>

          <div className={styles.opacityControl}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              onChange={(e) => {
                e.stopPropagation();
                onLayerOpacityChange(layer.id, parseFloat(e.target.value));
              }}
              className={styles.opacitySlider}
              title={`Opacity: ${Math.round(layer.opacity * 100)}%`}
            />
          </div>
        </div>

        {expanded && children.length > 0 && (
          <div className={styles.layerChildren}>
            {children.map(renderLayerNode)}
          </div>
        )}
      </div>
    );
  };

  const layerTree = buildLayerTree();

  return (
    <div className={styles.layerTreeView} onClick={closeContextMenu}>
      <div className={styles.layerList}>
        {layerTree.map(renderLayerNode)}
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={() => onLayerDuplicate(contextMenu.layerId)}>
            Duplicate Layer
          </button>
          {selectedLayers.size > 1 && (
            <button type="button" onClick={handleGroupSelected}>
              Group Selected
            </button>
          )}
          {layers.find(l => l.id === contextMenu.layerId)?.type === 'group' && (
            <button type="button" onClick={() => onLayerUngroup(contextMenu.layerId)}>
              Ungroup
            </button>
          )}
          <button type="button" onClick={() => startRename(contextMenu.layerId, layers.find(l => l.id === contextMenu.layerId)?.name || '')}>
            Rename
          </button>
          <hr />
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onLayerDelete(contextMenu.layerId)}
          >
            Delete Layer
          </button>
        </div>
      )}
    </div>
  );
};

export default LayerTreeView;