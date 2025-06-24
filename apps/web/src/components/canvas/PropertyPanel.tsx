'use client';

import type { fabric } from 'fabric';
import { useEffect, useState } from 'react';

import styles from './PropertyPanel.module.css';

type PropertyPanelProps = {
  canvas: fabric.Canvas | null;
};

const PropertyPanel = ({ canvas }: PropertyPanelProps) => {
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [properties, setProperties] = useState<any>({});

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedObject(active);

      if (active) {
        setProperties({
          type: active.type,
          id: (active as any).id,
          left: Math.round(active.left || 0),
          top: Math.round(active.top || 0),
          width: Math.round(active.width || 0),
          height: Math.round(active.height || 0),
          angle: Math.round(active.angle || 0),
          opacity: active.opacity || 1,
          fill: active.fill || '',
          stroke: active.stroke || '',
          strokeWidth: active.strokeWidth || 0,
          material: (active as any).material || '',
          plantName: (active as any).plantName || '',
        });
      } else {
        setProperties({});
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setProperties({});
    });
    canvas.on('object:modified', handleSelection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
      canvas.off('object:modified', handleSelection);
    };
  }, [canvas]);

  const updateProperty = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;

    const updates: any = { [key]: value };

    if (key === 'opacity') {
      updates.opacity = Number.parseFloat(value);
    } else if (key === 'strokeWidth') {
      updates.strokeWidth = Number.parseInt(value);
    } else if (key === 'left' || key === 'top' || key === 'angle') {
      updates[key] = Number.parseInt(value);
    }

    selectedObject.set(updates);
    canvas.renderAll();

    setProperties({ ...properties, [key]: value });
  };

  if (!selectedObject) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>Properties</div>
        <div className={styles.empty}>No object selected</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>Properties</div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>General</div>
        <div className={styles.property}>
          <label htmlFor="prop-type">Type</label>
          <span id="prop-type" className={styles.value}>
            {properties.type}
          </span>
        </div>
        {properties.plantName && (
          <div className={styles.property}>
            <label htmlFor="prop-plant">Plant</label>
            <span id="prop-plant" className={styles.value}>
              {properties.plantName}
            </span>
          </div>
        )}
        {properties.material && (
          <div className={styles.property}>
            <label htmlFor="prop-material">Material</label>
            <span id="prop-material" className={styles.value}>
              {properties.material}
            </span>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Transform</div>
        <div className={styles.property}>
          <label htmlFor="prop-x">X</label>
          <input
            id="prop-x"
            type="number"
            value={properties.left}
            onChange={(e) => updateProperty('left', e.target.value)}
          />
        </div>
        <div className={styles.property}>
          <label htmlFor="prop-y">Y</label>
          <input
            id="prop-y"
            type="number"
            value={properties.top}
            onChange={(e) => updateProperty('top', e.target.value)}
          />
        </div>
        <div className={styles.property}>
          <label htmlFor="prop-rotation">Rotation</label>
          <input
            id="prop-rotation"
            type="number"
            value={properties.angle}
            onChange={(e) => updateProperty('angle', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Appearance</div>
        <div className={styles.property}>
          <label htmlFor="prop-opacity">Opacity</label>
          <input
            id="prop-opacity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={properties.opacity}
            onChange={(e) => updateProperty('opacity', e.target.value)}
          />
          <span className={styles.rangeValue}>{Math.round(properties.opacity * 100)}%</span>
        </div>
        {properties.fill && (
          <div className={styles.property}>
            <label htmlFor="prop-fill">Fill</label>
            <input
              id="prop-fill"
              type="color"
              value={properties.fill}
              onChange={(e) => updateProperty('fill', e.target.value)}
            />
          </div>
        )}
        {properties.stroke && (
          <>
            <div className={styles.property}>
              <label htmlFor="prop-stroke">Stroke</label>
              <input
                id="prop-stroke"
                type="color"
                value={properties.stroke}
                onChange={(e) => updateProperty('stroke', e.target.value)}
              />
            </div>
            <div className={styles.property}>
              <label htmlFor="prop-stroke-width">Stroke Width</label>
              <input
                id="prop-stroke-width"
                type="number"
                min="0"
                max="10"
                value={properties.strokeWidth}
                onChange={(e) => updateProperty('strokeWidth', e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
