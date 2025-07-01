'use client';

import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Settings, Eye, EyeOff, Trash2, Copy, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaObject } from '@/lib/canvas/objects/AreaObject';
import { LineObject } from '@/lib/canvas/objects/LineObject';
import { MaskLayer } from '@/lib/canvas/MaskLayer';
import { ObjectProperties } from './ObjectProperties';
import { AreaProperties } from './AreaProperties';
import { LineProperties } from './LineProperties';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PropertyPanelProps {
  canvas: fabric.Canvas | null;
  selectedObjects: fabric.Object[];
  onObjectUpdate?: (object: fabric.Object) => void;
  onObjectDelete?: (object: fabric.Object) => void;
  onObjectDuplicate?: (object: fabric.Object) => void;
  className?: string;
}

export function PropertyPanel({ 
  canvas, 
  selectedObjects, 
  onObjectUpdate,
  onObjectDelete,
  onObjectDuplicate,
  className 
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState('properties');
  const [isExpanded, setIsExpanded] = useState(true);

  // Get the primary selected object
  const primaryObject = selectedObjects[0] || null;
  const hasMultipleObjects = selectedObjects.length > 1;

  // Handle object visibility toggle
  const handleVisibilityToggle = (object: fabric.Object) => {
    object.set('visible', !object.visible);
    canvas?.renderAll();
    onObjectUpdate?.(object);
  };

  // Handle object deletion
  const handleDelete = (object: fabric.Object) => {
    if (canvas) {
      canvas.remove(object);
      canvas.renderAll();
      onObjectDelete?.(object);
    }
  };

  // Handle object duplication
  const handleDuplicate = (object: fabric.Object) => {
    if (canvas) {
      object.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        onObjectDuplicate?.(cloned);
      });
    }
  };

  // Get object type display name
  const getObjectTypeName = (object: fabric.Object): string => {
    if (object instanceof AreaObject) return 'Landscape Area';
    if (object instanceof LineObject) return 'Line';
    if (object instanceof MaskLayer) return 'Mask Layer';
    if (object.type === 'circle') return 'Circle';
    if (object.type === 'rect') return 'Rectangle';
    if (object.type === 'polygon') return 'Polygon';
    if (object.type === 'line') return 'Line';
    if (object.type === 'text') return 'Text';
    return object.type || 'Object';
  };

  // Get object type color
  const getObjectTypeColor = (object: fabric.Object): string => {
    if (object instanceof AreaObject) return '#22c55e';
    if (object instanceof LineObject) return '#3b82f6';
    if (object instanceof MaskLayer) return '#f59e0b';
    return '#6b7280';
  };

  if (!primaryObject) {
    return (
      <div className={cn('p-4 bg-gray-50 border rounded-lg', className)}>
        <div className="text-center text-gray-500">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-medium mb-1">No Selection</div>
          <div className="text-xs">Select an object to view its properties</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getObjectTypeColor(primaryObject) }}
            />
            <div>
              <div className="text-sm font-medium">
                {getObjectTypeName(primaryObject)}
              </div>
              {hasMultipleObjects && (
                <div className="text-xs text-gray-500">
                  +{selectedObjects.length - 1} more selected
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Object actions */}
        {isExpanded && (
          <div className="flex gap-1 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVisibilityToggle(primaryObject)}
              className="h-7 px-2"
            >
              {primaryObject.visible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDuplicate(primaryObject)}
              className="h-7 px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(primaryObject)}
              className="h-7 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
              <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-3 space-y-3">
              {/* Generic object properties */}
              <ObjectProperties 
                objects={selectedObjects}
                canvas={canvas}
                onUpdate={onObjectUpdate}
              />

              {/* Specific object properties */}
              {primaryObject instanceof AreaObject && (
                <AreaProperties 
                  area={primaryObject}
                  canvas={canvas}
                  onUpdate={onObjectUpdate}
                />
              )}

              {primaryObject instanceof LineObject && (
                <LineProperties 
                  line={primaryObject}
                  canvas={canvas}
                  onUpdate={onObjectUpdate}
                />
              )}
            </TabsContent>

            <TabsContent value="style" className="mt-3 space-y-3">
              {/* Style properties - colors, strokes, etc. */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Fill Color</label>
                <input
                  type="color"
                  value={(primaryObject.fill as string) || '#ffffff'}
                  onChange={(e) => {
                    primaryObject.set('fill', e.target.value);
                    canvas?.renderAll();
                    onObjectUpdate?.(primaryObject);
                  }}
                  className="w-full h-8 rounded border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Stroke Color</label>
                <input
                  type="color"
                  value={(primaryObject.stroke as string) || '#000000'}
                  onChange={(e) => {
                    primaryObject.set('stroke', e.target.value);
                    canvas?.renderAll();
                    onObjectUpdate?.(primaryObject);
                  }}
                  className="w-full h-8 rounded border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Stroke Width</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={primaryObject.strokeWidth || 1}
                  onChange={(e) => {
                    primaryObject.set('strokeWidth', parseFloat(e.target.value));
                    canvas?.renderAll();
                    onObjectUpdate?.(primaryObject);
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {primaryObject.strokeWidth || 1}px
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={primaryObject.opacity || 1}
                  onChange={(e) => {
                    primaryObject.set('opacity', parseFloat(e.target.value));
                    canvas?.renderAll();
                    onObjectUpdate?.(primaryObject);
                  }}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {Math.round((primaryObject.opacity || 1) * 100)}%
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Multi-selection info */}
          {hasMultipleObjects && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="font-medium text-blue-800 mb-1">
                Multiple Objects Selected ({selectedObjects.length})
              </div>
              <div className="text-blue-600">
                Changes will apply to all selected objects
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyPanel;