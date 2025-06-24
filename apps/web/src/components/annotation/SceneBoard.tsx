'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';

export interface SceneBoardProps {
  projectId: string;
  width?: number;
  height?: number;
  onMaskCreated?: (mask: any) => void;
  onMaskSelected?: (maskIds: string[]) => void;
}

export function SceneBoard({ 
  projectId, 
  width = 800, 
  height = 600,
  onMaskCreated,
  onMaskSelected 
}: SceneBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  
  const { getCurrentScene } = useSceneStore();
  const { 
    getMasksByScene, 
    addMask, 
    drawingCategory, 
    setSelectedMasks,
    selectedMaskIds 
  } = useMaskStore();
  
  const currentScene = getCurrentScene();
  const masks = currentScene ? getMasksByScene(currentScene.id) : [];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = width;
    canvas.height = height;
    setCtx(context);
  }, [width, height]);

  // Draw scene image and masks
  useEffect(() => {
    if (!ctx || !currentScene) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw scene image as background
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      drawMasks();
    };
    img.src = currentScene.imageUrl;
  }, [ctx, currentScene, masks, width, height]);

  const drawMasks = useCallback(() => {
    if (!ctx) return;

    masks.forEach((mask) => {
      const isSelected = selectedMaskIds.includes(mask.id);
      
      ctx.save();
      
      // Set style based on category
      const categoryColors = {
        'Plants & Trees': { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#22c55e' },
        'Mulch & Rocks': { fill: 'rgba(180, 83, 9, 0.3)', stroke: '#b45309' },
        'Hardscape': { fill: 'rgba(120, 113, 108, 0.3)', stroke: '#78716c' },
        'Other': { fill: 'rgba(156, 163, 175, 0.3)', stroke: '#6b7280' },
      };
      
      const colors = categoryColors[mask.category as keyof typeof categoryColors] || categoryColors['Other'];
      
      if (mask.path.type === 'Polygon' && Array.isArray(mask.path.coordinates[0])) {
        ctx.beginPath();
        const coords = mask.path.coordinates[0] as number[][];
        coords.forEach((coord, index) => {
          const [x, y] = coord;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        
        ctx.fillStyle = colors.fill;
        ctx.fill();
        
        ctx.strokeStyle = isSelected ? '#3b82f6' : colors.stroke;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }, [ctx, masks, selectedMaskIds]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing mask
    const clickedMask = masks.find((mask) => {
      if (mask.path.type === 'Polygon' && Array.isArray(mask.path.coordinates[0])) {
        const coords = mask.path.coordinates[0] as number[][];
        return isPointInPolygon({ x, y }, coords);
      }
      return false;
    });

    if (clickedMask) {
      setSelectedMasks([clickedMask.id]);
      onMaskSelected?.(selectedMaskIds);
    } else {
      // Start drawing new mask
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
      setSelectedMasks([]);
    }
  }, [currentScene, masks, onMaskSelected, setSelectedMasks, selectedMaskIds]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath(prev => [...prev, { x, y }]);
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentPath.length < 3 || !currentScene) return;

    // Create new mask
    const newMask = {
      id: `mask-${Date.now()}`,
      sceneId: currentScene.id,
      category: drawingCategory,
      path: {
        type: 'Polygon' as const,
        coordinates: [currentPath.map(point => [point.x, point.y])]
      },
      deleted: false,
      authorId: 'current-user', // TODO: Get from auth context
      createdAt: new Date(),
    };

    addMask(newMask);
    onMaskCreated?.(newMask);

    // Reset drawing state
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentPath, currentScene, drawingCategory, addMask, onMaskCreated]);

  // Helper function to check if point is inside polygon
  const isPointInPolygon = (point: { x: number; y: number }, polygon: number[][]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      if (((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  if (!currentScene) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No scene selected</p>
          <p className="text-gray-400 text-sm">Upload a photo to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false);
          setCurrentPath([]);
        }}
      />
      
      {/* Drawing indicator */}
      {isDrawing && (
        <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Drawing {drawingCategory}...
        </div>
      )}
      
      {/* Mask count indicator */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {masks.length} annotation{masks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}