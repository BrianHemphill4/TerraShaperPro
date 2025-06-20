'use client';

import { fabric } from 'fabric';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import AssetPalette from '@/components/canvas/AssetPalette';
import DesignCanvas from '@/components/canvas/DesignCanvas';
import { AlertModal, ConfirmModal } from '@/components/ui/modal';
import { trpc } from '@/lib/trpc';

import styles from './design.module.css';

const DesignPage = () => {
  const params = useParams();
  // Design route currently has no dynamic param; fall back to a temporary id
  const projectId = (params as any)?.projectId ?? (params as any)?.id ?? 'local-design';

  // tRPC mutation for autosaving versions
  const createVersion = (trpc as any).project.createVersion.useMutation();

  const [elements, setElements] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'info'>('info');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Define loadDesign with useCallback to avoid dependency issues
  const loadDesign = useCallback(async () => {
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
        if (obj.evented !== false) {
          // Keep grid lines
          canvas.remove(obj);
        }
      });

      // Recreate elements on canvas
      savedElements.forEach((element: any) => {
        const properties = element.properties || {};

        if (element.elementType === 'plant') {
          if (properties.imageUrl) {
            fabric.Image.fromURL(properties.imageUrl, (img: any) => {
              img.set({
                left: Number.parseFloat(element.positionX),
                top: Number.parseFloat(element.positionY),
                width: element.width || 50,
                height: element.height || 50,
                angle: Number.parseFloat(element.rotation || '0'),
                scaleX: properties.scaleX || 1,
                scaleY: properties.scaleY || 1,
                id: properties.id,
                plantId: properties.plantId,
                plantName: properties.plantName,
              });
              canvas.add(img);
            });
          } else {
            const circle = new fabric.Circle({
              radius: 25,
              fill: '#10b981',
              stroke: '#059669',
              strokeWidth: 2,
            });

            const text = new fabric.Text(element.name.charAt(0), {
              fontSize: 20,
              fill: 'white',
              originX: 'center',
              originY: 'center',
            });

            const group = new fabric.Group([circle, text], {
              left: Number.parseFloat(element.positionX),
              top: Number.parseFloat(element.positionY),
              angle: Number.parseFloat(element.rotation || '0'),
              scaleX: properties.scaleX || 1,
              scaleY: properties.scaleY || 1,
              id: properties.id,
              plantId: properties.plantId,
              plantName: properties.plantName,
            } as fabric.IGroupOptions);

            canvas.add(group);
          }
        } else if (element.elementType === 'polygon') {
          const polygon = new fabric.Polygon(properties.points || [], {
            left: Number.parseFloat(element.positionX),
            top: Number.parseFloat(element.positionY),
            fill: properties.fill || 'rgba(16, 185, 129, 0.3)',
            stroke: properties.stroke || '#10b981',
            strokeWidth: properties.strokeWidth || 2,
            angle: Number.parseFloat(element.rotation || '0'),
            scaleX: properties.scaleX || 1,
            scaleY: properties.scaleY || 1,
            id: properties.id,
          } as fabric.IPolylineOptions);
          canvas.add(polygon);
        } else if (element.elementType === 'polyline') {
          const polyline = new fabric.Polyline(properties.points || [], {
            left: Number.parseFloat(element.positionX),
            top: Number.parseFloat(element.positionY),
            fill: 'transparent',
            stroke: properties.stroke || '#10b981',
            strokeWidth: properties.strokeWidth || 2,
            angle: Number.parseFloat(element.rotation || '0'),
            scaleX: properties.scaleX || 1,
            scaleY: properties.scaleY || 1,
            id: properties.id,
          } as fabric.IPolylineOptions);
          canvas.add(polyline);
        }
      });

      canvas.renderAll();
    } catch (error) {
      console.error('Error loading design:', error);
      // Only show error if we have a canvas ready
      if (canvas) {
        setAlertMessage('Failed to load design. Please try again.');
        setAlertVariant('error');
        setShowAlert(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [canvas, projectId, setAlertMessage, setAlertVariant, setShowAlert]);

  // Load design elements when canvas is ready
  useEffect(() => {
    if (canvas) {
      loadDesign();
    }
  }, [canvas, projectId, loadDesign]);

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
      setAlertMessage('Design saved successfully!');
      setAlertVariant('success');
      setShowAlert(true);
    } catch (error) {
      console.error('Error saving design:', error);
      setAlertMessage('Failed to save design. Please try again.');
      setAlertVariant('error');
      setShowAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;

    setConfirmMessage('Are you sure you want to clear the canvas? This cannot be undone.');
    setConfirmAction(() => () => {
      const objects = canvas.getObjects();
      objects.forEach((obj: any) => {
        if (obj.evented !== false) {
          // Keep grid lines
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
      setElements([]);
    });
    setShowConfirm(true);
  };

  // -------------------------------------------------
  // Auto-create a project version whenever elements
  // array changes (or other meta in future). Debounced
  // so rapid edits don't spam requests.
  // -------------------------------------------------
  useEffect(() => {
    // Only autosave for valid UUID project IDs (backend constraint)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!projectId || !uuidRegex.test(projectId)) return;

    // Debounce timer – 3 seconds after the last change
    const timer = setTimeout(() => {
      if (elements.length === 0) return;

      const snapshot = {
        elements,
        // Extend with meta fields as needed
      };

      createVersion.mutate({
        projectId,
        snapshot,
        comment: 'Auto-snapshot',
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [elements, projectId]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Landscape Design Tool</h1>
        <div className={styles.actions}>
          <span className={styles.projectInfo}>Project: {projectId}</span>
          {lastSaved && (
            <span className={styles.savedInfo}>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          <button
            type="button"
            className={styles.button}
            onClick={loadDesign}
            disabled={isLoading || !canvas}
          >
            {isLoading ? 'Loading...' : 'Load Design'}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={saveDesign}
            disabled={isSaving || elements.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Design'}
          </button>
          <button
            type="button"
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
          <DesignCanvas onReady={handleCanvasReady} onElementsChange={handleElementsChange} />
        </div>
      </div>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
        variant={alertVariant}
      />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        message={confirmMessage}
        variant="danger"
      />
    </div>
  );
};

export default DesignPage;
