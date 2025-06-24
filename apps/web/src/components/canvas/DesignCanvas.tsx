'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useUndoRedo } from '../../hooks/useUndoRedo';
import styles from './DesignCanvas.module.css';
import ExportPanel from './ExportPanel';
import LayerPanel from './LayerPanel';
import MaterialSelector from './MaterialSelector';
import MeasurementTools from './MeasurementTools';
import PropertyPanel from './PropertyPanel';
import UndoRedoControls from './UndoRedoControls';

type DesignCanvasProps = {
  onReady?: (canvas: fabric.Canvas) => void;
  onElementsChange?: (elements: any[]) => void;
};

type DrawingMode = 'select' | 'polygon' | 'polyline' | 'area' | 'line';

const getMaterialFill = (material: string): string => {
  const fills: Record<string, string> = {
    grass: 'rgba(34, 197, 94, 0.3)',
    mulch: 'rgba(180, 83, 9, 0.3)',
    gravel: 'rgba(156, 163, 175, 0.3)',
    decomposedGranite: 'rgba(251, 191, 36, 0.3)',
    pavers: 'rgba(120, 113, 108, 0.3)',
    concrete: 'rgba(229, 231, 235, 0.3)',
  };
  return fills[material] || 'rgba(156, 163, 175, 0.3)';
};

const getMaterialStroke = (material: string): string => {
  const strokes: Record<string, string> = {
    grass: '#22c55e',
    mulch: '#b45309',
    gravel: '#6b7280',
    decomposedGranite: '#fbbf24',
    pavers: '#78716c',
    concrete: '#9ca3af',
  };
  return strokes[material] || '#6b7280';
};

const DesignCanvas = ({ onReady, onElementsChange }: DesignCanvasProps) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [tempLine, setTempLine] = useState<fabric.Polyline | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('grass');
  const [clipboard, setClipboard] = useState<fabric.Object | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Initialize undo/redo system
  const undoRedo = useUndoRedo(canvas, {
    excludeFromHistory: (obj) =>
      (obj as any).evented === false || (obj as any).isMeasurement === true,
  });

  const notifyElementsChange = useCallback(() => {
    if (canvas && onElementsChange) {
      const elements = canvas
        .getObjects()
        .filter((obj: any) => obj.id && !obj.evented === false) // Filter out grid lines
        .map((obj: any) => ({
          id: obj.id,
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          angle: obj.angle,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          plantId: obj.plantId,
          plantName: obj.plantName,
          points: obj.points,
          fill: obj.fill,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          material: obj.material,
        }));
      onElementsChange(elements);
    }
  }, [canvas, onElementsChange]);

  useEffect(() => {
    if (!canvasEl.current || !containerRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasEl.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#f8f9fa',
      selection: true,
      selectionBorderColor: '#10b981',
      selectionColor: 'rgba(16, 185, 129, 0.1)',
      selectionLineWidth: 2,
    });

    // Add grid
    const gridSize = 20;
    for (let i = 0; i < fabricCanvas.width! / gridSize; i++) {
      const line = new fabric.Line([i * gridSize, 0, i * gridSize, fabricCanvas.height!], {
        stroke: '#e5e7eb',
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(line);
    }
    for (let i = 0; i < fabricCanvas.height! / gridSize; i++) {
      const line = new fabric.Line([0, i * gridSize, fabricCanvas.width!, i * gridSize], {
        stroke: '#e5e7eb',
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(line);
    }

    setCanvas(fabricCanvas);

    if (onReady) {
      onReady(fabricCanvas);
    }

    // Handle window resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        fabricCanvas.setWidth(width).setHeight(height).renderAll();
      }
    });
    resizeObserver.observe(containerRef.current);

    // Handle drop events
    const canvasElement = canvasEl.current;
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const plantData = e.dataTransfer?.getData('plant');
      if (plantData) {
        const plant = JSON.parse(plantData);
        const rect = canvasElement!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create a plant representation
        if (plant.imageUrl) {
          fabric.Image.fromURL(plant.imageUrl, (img) => {
            img.set({
              left: x - 25,
              top: y - 25,
              width: 50,
              height: 50,
              originX: 'left',
              originY: 'top',
              id: `plant-${Date.now()}`,
              plantId: plant.id,
              plantName: plant.commonName,
            } as any);
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            notifyElementsChange();
          });
        } else {
          // Create a circle placeholder if no image
          const circle = new fabric.Circle({
            left: x - 25,
            top: y - 25,
            radius: 25,
            fill: '#10b981',
            stroke: '#059669',
            strokeWidth: 2,
            id: `plant-${Date.now()}`,
            plantId: plant.id,
            plantName: plant.commonName,
          } as any);

          const text = new fabric.Text(plant.commonName.charAt(0), {
            left: x - 8,
            top: y - 10,
            fontSize: 20,
            fill: 'white',
            selectable: false,
            evented: false,
          });

          const group = new fabric.Group([circle, text], {
            left: x - 25,
            top: y - 25,
            id: `plant-${Date.now()}`,
            plantId: plant.id,
            plantName: plant.commonName,
          } as any);

          fabricCanvas.add(group);
          fabricCanvas.setActiveObject(group);
          fabricCanvas.renderAll();
          notifyElementsChange();
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    };

    canvasElement.addEventListener('drop', handleDrop);
    canvasElement.addEventListener('dragover', handleDragOver);

    // Handle object changes
    fabricCanvas.on('object:modified', notifyElementsChange);
    fabricCanvas.on('object:removed', notifyElementsChange);

    return () => {
      resizeObserver.disconnect();
      canvasElement?.removeEventListener('drop', handleDrop);
      canvasElement?.removeEventListener('dragover', handleDragOver);
      fabricCanvas.dispose();
    };
  }, [onReady, notifyElementsChange]);

  // Drawing mode handlers
  useEffect(() => {
    if (!canvas) return;

    canvas.selection = drawingMode === 'select';
    canvas.defaultCursor = drawingMode === 'select' ? 'default' : 'crosshair';

    const handleMouseDown = (e: fabric.IEvent) => {
      if (drawingMode === 'select') return;

      const pointer = canvas.getPointer(e.e);
      const point = { x: pointer.x, y: pointer.y };

      if (
        drawingMode === 'polygon' ||
        drawingMode === 'polyline' ||
        drawingMode === 'area' ||
        drawingMode === 'line'
      ) {
        if (!isDrawing) {
          setIsDrawing(true);
          setCurrentPoints([point]);

          const fillColor =
            drawingMode === 'polygon'
              ? 'rgba(16, 185, 129, 0.3)'
              : drawingMode === 'area'
                ? getMaterialFill(selectedMaterial)
                : 'transparent';
          const strokeColor =
            drawingMode === 'area'
              ? getMaterialStroke(selectedMaterial)
              : drawingMode === 'line'
                ? '#374151'
                : '#10b981';

          const line = new fabric.Polyline([point], {
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: drawingMode === 'line' ? 3 : 2,
            selectable: false,
            evented: false,
          });
          setTempLine(line);
          canvas.add(line);
        } else {
          setCurrentPoints([...currentPoints, point]);

          if (tempLine) {
            (tempLine as any).points = [...currentPoints, point];
            canvas.renderAll();
          }
        }
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isDrawing || !tempLine) return;

      const pointer = canvas.getPointer(e.e);
      const points = [...currentPoints, { x: pointer.x, y: pointer.y }];
      (tempLine as any).points = points;
      canvas.renderAll();
    };

    const handleMouseDblClick = () => {
      if (!isDrawing || !tempLine || currentPoints.length < 2) return;

      canvas.remove(tempLine);

      const shape =
        drawingMode === 'polygon'
          ? new fabric.Polygon(currentPoints, {
              fill: 'rgba(16, 185, 129, 0.3)',
              stroke: '#10b981',
              strokeWidth: 2,
              id: `${drawingMode}-${Date.now()}`,
            } as any)
          : drawingMode === 'area'
            ? new fabric.Polygon(currentPoints, {
                fill: getMaterialFill(selectedMaterial),
                stroke: getMaterialStroke(selectedMaterial),
                strokeWidth: 2,
                id: `area-${Date.now()}`,
                material: selectedMaterial,
              } as any)
            : new fabric.Polyline(currentPoints, {
                fill: 'transparent',
                stroke: drawingMode === 'line' ? '#374151' : '#10b981',
                strokeWidth: drawingMode === 'line' ? 3 : 2,
                id: `${drawingMode}-${Date.now()}`,
                material: drawingMode === 'line' ? 'edging' : undefined,
              } as any);

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      notifyElementsChange();

      // Reset drawing state
      setIsDrawing(false);
      setCurrentPoints([]);
      setTempLine(null);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:dblclick', handleMouseDblClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:dblclick', handleMouseDblClick);
    };
  }, [
    canvas,
    drawingMode,
    isDrawing,
    currentPoints,
    tempLine,
    notifyElementsChange,
    selectedMaterial,
  ]);

  const handleModeChange = useCallback(
    (mode: DrawingMode) => {
      setDrawingMode(mode);

      // Cancel any ongoing drawing
      if (isDrawing && tempLine && canvas) {
        canvas.remove(tempLine);
        setIsDrawing(false);
        setCurrentPoints([]);
        setTempLine(null);
      }
    },
    [isDrawing, tempLine, canvas]
  );

  const handleDelete = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'activeSelection') {
        (activeObject as fabric.ActiveSelection).forEachObject((obj) => {
          canvas.remove(obj);
        });
      } else {
        canvas.remove(activeObject);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
      notifyElementsChange();
    }
  }, [canvas, notifyElementsChange]);

  const handleGroup = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const activeSelection = activeObject as fabric.ActiveSelection;
    const group = activeSelection.toGroup();
    (group as any).id = `group-${Date.now()}`;
    canvas.requestRenderAll();
    notifyElementsChange();
  }, [canvas, notifyElementsChange]);

  const handleUngroup = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    const items = (activeObject as fabric.Group).getObjects();
    (activeObject as fabric.Group).destroy();
    canvas.remove(activeObject);

    const newSelection = new fabric.ActiveSelection(items, {
      canvas,
    });

    items.forEach((item) => {
      canvas.add(item);
    });

    canvas.setActiveObject(newSelection);
    canvas.requestRenderAll();
    notifyElementsChange();
  }, [canvas, notifyElementsChange]);

  const handleCopy = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned: fabric.Object) => {
      setClipboard(cloned);
    });
  }, [canvas]);

  const handlePaste = useCallback(() => {
    if (!canvas || !clipboard) return;

    clipboard.clone((clonedObj: fabric.Object) => {
      canvas.discardActiveObject();

      clonedObj.set({
        left: (clonedObj.left || 0) + 20,
        top: (clonedObj.top || 0) + 20,
        evented: true,
        id: `${(clonedObj as any).id || 'object'}-copy-${Date.now()}`,
      } as any);

      if (clonedObj.type === 'activeSelection') {
        // Handle pasting multiple objects
        (clonedObj as fabric.ActiveSelection).forEachObject((obj) => {
          canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }

      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
      notifyElementsChange();
    });
  }, [canvas, clipboard, notifyElementsChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas) return;

      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if (ctrl && key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (ctrl && key === 'x') {
        e.preventDefault();
        handleCopy();
        handleDelete();
      } else if (ctrl && key === 'a') {
        e.preventDefault();
        canvas.discardActiveObject();
        const allObjects = canvas.getObjects().filter((obj) => obj.evented !== false);
        const selection = new fabric.ActiveSelection(allObjects, { canvas });
        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
      } else if (ctrl && key === 'g') {
        e.preventDefault();
        handleGroup();
      } else if (ctrl && key === 'u') {
        e.preventDefault();
        handleUngroup();
      } else if (key === 'delete' || key === 'backspace') {
        e.preventDefault();
        handleDelete();
      } else if (key === 'escape') {
        e.preventDefault();
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        if (drawingMode !== 'select') {
          handleModeChange('select');
        }
      } else if (key === 's' && !ctrl) {
        e.preventDefault();
        handleModeChange('select');
      } else if (key === 'p' && !ctrl) {
        e.preventDefault();
        handleModeChange('polygon');
      } else if (key === 'a' && !ctrl) {
        e.preventDefault();
        handleModeChange('area');
      } else if (key === 'l' && !ctrl) {
        e.preventDefault();
        handleModeChange('line');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    canvas,
    drawingMode,
    handleCopy,
    handlePaste,
    handleDelete,
    handleGroup,
    handleUngroup,
    handleModeChange,
  ]);

  return (
    <div className={styles.container} ref={containerRef}>
      <MaterialSelector
        selectedMaterial={selectedMaterial}
        onMaterialChange={setSelectedMaterial}
        visible={drawingMode === 'area'}
      />
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'select' ? styles.active : ''}`}
          onClick={() => handleModeChange('select')}
          title="Select"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'polygon' ? styles.active : ''}`}
          onClick={() => handleModeChange('polygon')}
          title="Draw Polygon (double-click to finish)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon
              points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'polyline' ? styles.active : ''}`}
          onClick={() => handleModeChange('polyline')}
          title="Draw Polyline (double-click to finish)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline
              points="22 12 18 12 15 21 9 3 6 12 2 12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'area' ? styles.active : ''}`}
          onClick={() => handleModeChange('area')}
          title="Draw Area (beds/turf)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.3"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'line' ? styles.active : ''}`}
          onClick={() => handleModeChange('line')}
          title="Draw Line (edging)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        <div className={styles.separator}></div>
        <button
          type="button"
          className={styles.toolButton}
          onClick={handleGroup}
          title="Group selected objects (G)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={handleUngroup}
          title="Ungroup selected group (U)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="5" y="5" width="5" height="5" strokeWidth="2" strokeDasharray="2 2" />
            <rect x="14" y="5" width="5" height="5" strokeWidth="2" strokeDasharray="2 2" />
            <rect x="5" y="14" width="5" height="5" strokeWidth="2" strokeDasharray="2 2" />
            <rect x="14" y="14" width="5" height="5" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </button>
        <div className={styles.separator}></div>
        <button
          type="button"
          className={styles.toolButton}
          onClick={handleCopy}
          title="Copy selected (Ctrl+C)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={handlePaste}
          title="Paste (Ctrl+V)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
              strokeWidth="2"
            />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" strokeWidth="2" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={handleDelete}
          title="Delete selected (Delete)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline
              points="3 6 5 6 21 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.separator}></div>
        <UndoRedoControls
          onUndo={undoRedo.undo}
          onRedo={undoRedo.redo}
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          historySize={undoRedo.historySize}
          currentIndex={undoRedo.currentHistoryIndex}
        />
        <div className={styles.separator}></div>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => setShowExportPanel(!showExportPanel)}
          title="Export"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="7 10 12 15 17 10"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <PropertyPanel canvas={canvas} />
      <LayerPanel canvas={canvas} />
      <MeasurementTools canvas={canvas} />
      {showExportPanel && <ExportPanel canvas={canvas} />}
      <canvas ref={canvasEl} />
      {isDrawing && <div className={styles.hint}>Click to add points, double-click to finish</div>}
    </div>
  );
};

export default DesignCanvas;
