'use client';

import { useState, useEffect } from 'react';
import DesignCanvas from '@/components/canvas/DesignCanvas';
import AssetPalette from '@/components/canvas/AssetPalette';
import styles from './design.module.css';
// @ts-ignore
import { fabric } from 'fabric';

const DesignPage = () => {
  const [elements, setElements] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>('test-project-1'); // For demo purposes
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [canvas, setCanvas] = useState<any>(null);

  // Load design elements when canvas is ready
  useEffect(() => {
    if (canvas) {
      loadDesign();
    }
  }, [canvas, projectId]);

  const handleElementsChange = (newElements: any[]) => {
    setElements(newElements);
  };

  const handleCanvasReady = (fabricCanvas: any) => {
    setCanvas(fabricCanvas);
  };

  const saveDesign = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/design-elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          elements,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save design');
      }

      setLastSaved(new Date());
      alert('Design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadDesign = async () => {
    if (!canvas) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/design-elements?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load design');
      }

      const data = await response.json();
      const savedElements = data.data || [];

      // Clear existing canvas elements (except grid lines)
      const objects = canvas.getObjects();
      objects.forEach((obj: any) => {
        if (obj.evented !== false) { // Keep grid lines
          canvas.remove(obj);
        }
      });

      // Recreate elements on canvas
      savedElements.forEach((element: any) => {
        const properties = element.properties || {};
        
        if (element.elementType === 'plant') {
          if (properties.imageUrl) {
            // @ts-ignore
            fabric.Image.fromURL(properties.imageUrl, (img: any) => {
              img.set({
                left: parseFloat(element.positionX),
                top: parseFloat(element.positionY),
                width: element.width || 50,
                height: element.height || 50,
                angle: parseFloat(element.rotation || '0'),
                scaleX: properties.scaleX || 1,
                scaleY: properties.scaleY || 1,
                id: properties.id,
                plantId: properties.plantId,
                plantName: properties.plantName,
              });
              canvas.add(img);
            });
          } else {
            // @ts-ignore
            const circle = new fabric.Circle({
              radius: 25,
              fill: '#10b981',
              stroke: '#059669',
              strokeWidth: 2,
            });
            
            // @ts-ignore
            const text = new fabric.Text(element.name.charAt(0), {
              fontSize: 20,
              fill: 'white',
              originX: 'center',
              originY: 'center',
            });

            // @ts-ignore
            const group = new fabric.Group([circle, text], {
              left: parseFloat(element.positionX),
              top: parseFloat(element.positionY),
              angle: parseFloat(element.rotation || '0'),
              scaleX: properties.scaleX || 1,
              scaleY: properties.scaleY || 1,
              id: properties.id,
              plantId: properties.plantId,
              plantName: properties.plantName,
            });

            canvas.add(group);
          }
        } else if (element.elementType === 'polygon') {
          // @ts-ignore
          const polygon = new fabric.Polygon(properties.points || [], {
            left: parseFloat(element.positionX),
            top: parseFloat(element.positionY),
            fill: properties.fill || 'rgba(16, 185, 129, 0.3)',
            stroke: properties.stroke || '#10b981',
            strokeWidth: properties.strokeWidth || 2,
            angle: parseFloat(element.rotation || '0'),
            scaleX: properties.scaleX || 1,
            scaleY: properties.scaleY || 1,
            id: properties.id,
          });
          canvas.add(polygon);
        } else if (element.elementType === 'polyline') {
          // @ts-ignore
          const polyline = new fabric.Polyline(properties.points || [], {
            left: parseFloat(element.positionX),
            top: parseFloat(element.positionY),
            fill: 'transparent',
            stroke: properties.stroke || '#10b981',
            strokeWidth: properties.strokeWidth || 2,
            angle: parseFloat(element.rotation || '0'),
            scaleX: properties.scaleX || 1,
            scaleY: properties.scaleY || 1,
            id: properties.id,
          });
          canvas.add(polyline);
        }
      });

      canvas.renderAll();
    } catch (error) {
      console.error('Error loading design:', error);
      // Only show error if we have a canvas ready
      if (canvas) {
        alert('Failed to load design. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    
    if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      const objects = canvas.getObjects();
      objects.forEach((obj: any) => {
        if (obj.evented !== false) { // Keep grid lines
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
      setElements([]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Landscape Design Tool</h1>
        <div className={styles.actions}>
          <span className={styles.projectInfo}>Project: {projectId}</span>
          {lastSaved && (
            <span className={styles.savedInfo}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button 
            className={styles.button}
            onClick={loadDesign}
            disabled={isLoading || !canvas}
          >
            {isLoading ? 'Loading...' : 'Load Design'}
          </button>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={saveDesign}
            disabled={isSaving || elements.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Design'}
          </button>
          <button 
            className={`${styles.button} ${styles.dangerButton}`}
            onClick={clearCanvas}
            disabled={!canvas || elements.length === 0}
          >
            Clear Canvas
          </button>
        </div>
      </div>
      <div className={styles.workspace}>
        <AssetPalette />
        <div className={styles.canvasContainer}>
          <DesignCanvas 
            onReady={handleCanvasReady}
            onElementsChange={handleElementsChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default DesignPage;