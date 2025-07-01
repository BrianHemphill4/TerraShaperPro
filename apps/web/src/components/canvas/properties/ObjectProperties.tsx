'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { Lock, Unlock, RotateCw, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface ObjectPropertiesProps {
  objects: fabric.Object[];
  canvas: fabric.Canvas | null;
  onUpdate?: (object: fabric.Object) => void;
}

export function ObjectProperties({ objects, canvas, onUpdate }: ObjectPropertiesProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const primaryObject = objects[0];
  const hasMultipleObjects = objects.length > 1;

  // Update state when objects change
  useEffect(() => {
    if (!primaryObject) return;

    setPosition({
      x: Math.round(primaryObject.left || 0),
      y: Math.round(primaryObject.top || 0)
    });

    // Get scaled dimensions
    const width = (primaryObject.width || 0) * (primaryObject.scaleX || 1);
    const height = (primaryObject.height || 0) * (primaryObject.scaleY || 1);
    
    setDimensions({
      width: Math.round(width),
      height: Math.round(height)
    });

    setRotation(Math.round(primaryObject.angle || 0));
    setIsLocked(!primaryObject.selectable);
  }, [primaryObject]);

  // Handle position changes
  const handlePositionChange = useCallback((field: 'x' | 'y', value: number) => {
    if (!primaryObject || !canvas) return;

    const newPosition = { ...position, [field]: value };
    setPosition(newPosition);

    if (hasMultipleObjects) {
      // For multiple objects, maintain relative positions
      const deltaX = newPosition.x - (primaryObject.left || 0);
      const deltaY = newPosition.y - (primaryObject.top || 0);

      objects.forEach(obj => {
        obj.set({
          left: (obj.left || 0) + deltaX,
          top: (obj.top || 0) + deltaY
        });
        obj.setCoords();
        onUpdate?.(obj);
      });
    } else {
      primaryObject.set({
        left: newPosition.x,
        top: newPosition.y
      });
      primaryObject.setCoords();
      onUpdate?.(primaryObject);
    }

    canvas.renderAll();
  }, [position, primaryObject, canvas, objects, hasMultipleObjects, onUpdate]);

  // Handle dimension changes
  const handleDimensionChange = useCallback((field: 'width' | 'height', value: number) => {
    if (!primaryObject || !canvas) return;

    const newDimensions = { ...dimensions, [field]: value };
    setDimensions(newDimensions);

    // Calculate scale factors
    const originalWidth = primaryObject.width || 1;
    const originalHeight = primaryObject.height || 1;
    const scaleX = newDimensions.width / originalWidth;
    const scaleY = newDimensions.height / originalHeight;

    if (hasMultipleObjects) {
      // Apply scaling to all selected objects
      objects.forEach(obj => {
        if (field === 'width') {
          obj.set('scaleX', scaleX);
        } else {
          obj.set('scaleY', scaleY);
        }
        obj.setCoords();
        onUpdate?.(obj);
      });
    } else {
      if (field === 'width') {
        primaryObject.set('scaleX', scaleX);
      } else {
        primaryObject.set('scaleY', scaleY);
      }
      primaryObject.setCoords();
      onUpdate?.(primaryObject);
    }

    canvas.renderAll();
  }, [dimensions, primaryObject, canvas, objects, hasMultipleObjects, onUpdate]);

  // Handle rotation changes
  const handleRotationChange = useCallback((value: number) => {
    if (!primaryObject || !canvas) return;

    setRotation(value);

    if (hasMultipleObjects) {
      // Apply rotation to all selected objects
      objects.forEach(obj => {
        obj.set('angle', value);
        obj.setCoords();
        onUpdate?.(obj);
      });
    } else {
      primaryObject.set('angle', value);
      primaryObject.setCoords();
      onUpdate?.(primaryObject);
    }

    canvas.renderAll();
  }, [primaryObject, canvas, objects, hasMultipleObjects, onUpdate]);

  // Handle lock/unlock
  const handleLockToggle = useCallback(() => {
    if (!canvas) return;

    const newLocked = !isLocked;
    setIsLocked(newLocked);

    objects.forEach(obj => {
      obj.set({
        selectable: !newLocked,
        evented: !newLocked,
        lockMovementX: newLocked,
        lockMovementY: newLocked,
        lockRotation: newLocked,
        lockScalingX: newLocked,
        lockScalingY: newLocked
      });
      onUpdate?.(obj);
    });

    canvas.renderAll();
  }, [isLocked, objects, canvas, onUpdate]);

  // Quick alignment functions
  const alignLeft = useCallback(() => {
    if (!canvas || objects.length < 2) return;
    
    const leftmost = Math.min(...objects.map(obj => obj.left || 0));
    objects.forEach(obj => {
      obj.set('left', leftmost);
      obj.setCoords();
      onUpdate?.(obj);
    });
    canvas.renderAll();
  }, [objects, canvas, onUpdate]);

  const alignCenter = useCallback(() => {
    if (!canvas || objects.length < 2) return;
    
    const bounds = {
      left: Math.min(...objects.map(obj => obj.getBoundingRect().left)),
      right: Math.max(...objects.map(obj => obj.getBoundingRect().left + obj.getBoundingRect().width))
    };
    const centerX = (bounds.left + bounds.right) / 2;

    objects.forEach(obj => {
      const objBounds = obj.getBoundingRect();
      const objCenterX = objBounds.width / 2;
      obj.set('left', centerX - objCenterX);
      obj.setCoords();
      onUpdate?.(obj);
    });
    canvas.renderAll();
  }, [objects, canvas, onUpdate]);

  const alignRight = useCallback(() => {
    if (!canvas || objects.length < 2) return;
    
    const rightmost = Math.max(...objects.map(obj => (obj.left || 0) + obj.getBoundingRect().width));
    objects.forEach(obj => {
      const objWidth = obj.getBoundingRect().width;
      obj.set('left', rightmost - objWidth);
      obj.setCoords();
      onUpdate?.(obj);
    });
    canvas.renderAll();
  }, [objects, canvas, onUpdate]);

  if (!primaryObject) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Position */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="pos-x" className="text-xs text-gray-500">X</Label>
            <Input
              id="pos-x"
              type="number"
              value={position.x}
              onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="pos-y" className="text-xs text-gray-500">Y</Label>
            <Input
              id="pos-y"
              type="number"
              value={position.y}
              onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Dimensions</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="dim-w" className="text-xs text-gray-500">Width</Label>
            <Input
              id="dim-w"
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="dim-h" className="text-xs text-gray-500">Height</Label>
            <Input
              id="dim-h"
              type="number"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Rotation</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={rotation}
            onChange={(e) => handleRotationChange(parseFloat(e.target.value) || 0)}
            className="h-8 text-xs flex-1"
            min="-360"
            max="360"
          />
          <span className="text-xs text-gray-500">°</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotationChange(0)}
            className="h-8 px-2"
            title="Reset rotation"
          >
            <RotateCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Lock/Unlock */}
      <div>
        <Button
          variant={isLocked ? "default" : "outline"}
          size="sm"
          onClick={handleLockToggle}
          className="w-full h-8"
        >
          {isLocked ? (
            <>
              <Lock className="w-3 h-3 mr-2" />
              Locked
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 mr-2" />
              Unlocked
            </>
          )}
        </Button>
      </div>

      {/* Alignment (for multiple objects) */}
      {hasMultipleObjects && (
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Alignment</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={alignLeft}
              className="h-8 text-xs"
            >
              Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={alignCenter}
              className="h-8 text-xs"
            >
              Center
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={alignRight}
              className="h-8 text-xs"
            >
              Right
            </Button>
          </div>
        </div>
      )}

      {/* Object info */}
      <div className="pt-2 border-t">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Type: {primaryObject.type || 'Unknown'}</div>
          {hasMultipleObjects && (
            <div>Selection: {objects.length} objects</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ObjectProperties;