'use client';

import type { fabric } from 'fabric';
import { useCallback, useEffect, useState } from 'react';

import styles from './LayerPanel.module.css';

type Layer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  objects: fabric.Object[];
};

type LayerPanelProps = {
  canvas: fabric.Canvas | null;
};

const LayerPanel = ({ canvas }: LayerPanelProps) => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'default',
      name: 'Default Layer',
      visible: true,
      locked: false,
      objects: [],
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('default');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Initialize objects in default layer
  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      const objects = canvas.getObjects().filter((obj) => (obj as any).evented !== false);
      
      setLayers((prevLayers) => {
        const newLayers = [...prevLayers];
        const defaultLayer = newLayers.find((l) => l.id === 'default');
        
        if (defaultLayer) {
          // Assign objects without a layer to default layer
          objects.forEach((obj) => {
            if (!(obj as any).layerId) {
              (obj as any).layerId = 'default';
            }
          });
          
          // Update layer objects
          newLayers.forEach((layer) => {
            layer.objects = objects.filter((obj) => (obj as any).layerId === layer.id);
          });
        }
        
        return newLayers;
      });
    };

    updateLayers();

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const createLayer = useCallback(() => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      objects: [],
    };
    
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [layers]);

  const deleteLayer = useCallback((layerId: string) => {
    if (layerId === 'default' || layers.length === 1) return;
    
    const layerToDelete = layers.find((l) => l.id === layerId);
    if (!layerToDelete || !canvas) return;
    
    // Move objects to default layer
    layerToDelete.objects.forEach((obj) => {
      (obj as any).layerId = 'default';
    });
    
    setLayers(layers.filter((l) => l.id !== layerId));
    
    if (activeLayerId === layerId) {
      setActiveLayerId('default');
    }
    
    canvas.renderAll();
  }, [layers, activeLayerId, canvas]);

  const toggleVisibility = useCallback((layerId: string) => {
    if (!canvas) return;
    
    setLayers((prevLayers) => {
      const newLayers = prevLayers.map((layer) => {
        if (layer.id === layerId) {
          const newVisibility = !layer.visible;
          
          // Update fabric objects visibility
          layer.objects.forEach((obj) => {
            obj.set('visible', newVisibility);
          });
          
          return { ...layer, visible: newVisibility };
        }
        return layer;
      });
      
      canvas.renderAll();
      return newLayers;
    });
  }, [canvas]);

  const toggleLock = useCallback((layerId: string) => {
    if (!canvas) return;
    
    setLayers((prevLayers) => {
      const newLayers = prevLayers.map((layer) => {
        if (layer.id === layerId) {
          const newLocked = !layer.locked;
          
          // Update fabric objects selectability
          layer.objects.forEach((obj) => {
            obj.set({
              selectable: !newLocked,
              evented: !newLocked,
            });
          });
          
          return { ...layer, locked: newLocked };
        }
        return layer;
      });
      
      canvas.renderAll();
      return newLayers;
    });
  }, [canvas]);

  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    const index = layers.findIndex((l) => l.id === layerId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;
    
    const newLayers = [...layers];
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    
    // Reorder objects on canvas
    if (canvas) {
      const _allObjects = canvas.getObjects().filter((obj) => (obj as any).evented !== false);
      
      // Clear canvas (except grid)
      canvas.getObjects().forEach((obj) => {
        if ((obj as any).evented !== false) {
          canvas.remove(obj);
        }
      });
      
      // Add objects back in layer order
      newLayers.forEach((layer) => {
        layer.objects.forEach((obj) => {
          canvas.add(obj);
        });
      });
      
      canvas.renderAll();
    }
    
    setLayers(newLayers);
  }, [layers, canvas]);

  const selectLayer = useCallback((layerId: string) => {
    setActiveLayerId(layerId);
    
    // When selecting a layer, assign new objects to that layer
    if (canvas) {
      canvas.on('object:added', (e) => {
        if (!(e.target as any).layerId) {
          (e.target as any).layerId = layerId;
        }
      });
    }
  }, [canvas]);

  const startEditingName = useCallback((layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditingName(currentName);
  }, []);

  const saveLayerName = useCallback(() => {
    if (!editingLayerId || !editingName.trim()) {
      setEditingLayerId(null);
      return;
    }
    
    setLayers((prevLayers) =>
      prevLayers.map((layer) =>
        layer.id === editingLayerId ? { ...layer, name: editingName.trim() } : layer
      )
    );
    
    setEditingLayerId(null);
  }, [editingLayerId, editingName]);

  return (
    <div className={styles.layerPanel}>
      <div className={styles.header}>
        <h3>Layers</h3>
        <button
          type="button"
          className={styles.addButton}
          onClick={createLayer}
          title="Add new layer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      
      <div className={styles.layerList}>
        {[...layers].reverse().map((layer, index) => (
          <div
            key={layer.id}
            className={`${styles.layerItem} ${activeLayerId === layer.id ? styles.active : ''}`}
            onClick={() => selectLayer(layer.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                selectLayer(layer.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <button
              type="button"
              className={styles.visibilityButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer.id);
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
                toggleLock(layer.id);
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
              {editingLayerId === layer.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveLayerName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveLayerName();
                    } else if (e.key === 'Escape') {
                      setEditingLayerId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditingName(layer.id, layer.name);
                  }}
                >
                  {layer.name}
                </span>
              )}
              <span className={styles.objectCount}>({layer.objects.length})</span>
            </div>
            
            <div className={styles.layerActions}>
              <button
                type="button"
                className={styles.moveButton}
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayer(layer.id, 'up');
                }}
                disabled={index === layers.length - 1}
                title="Move layer up"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="18 15 12 9 6 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              <button
                type="button"
                className={styles.moveButton}
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayer(layer.id, 'down');
                }}
                disabled={index === 0}
                title="Move layer down"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              {layer.id !== 'default' && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layer.id);
                  }}
                  title="Delete layer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerPanel;