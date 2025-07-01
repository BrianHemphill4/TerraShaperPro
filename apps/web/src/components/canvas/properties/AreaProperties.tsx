'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { Calculator, DollarSign, Eye, EyeOff, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaObject } from '@/lib/canvas/objects/AreaObject';
import { useMaterialStore, type Material } from '@/stores/canvas/useMaterialStore';
import { MaterialPicker } from '@/components/canvas/tools/MaterialPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface AreaPropertiesProps {
  area: AreaObject;
  canvas: fabric.Canvas | null;
  onUpdate?: (area: AreaObject) => void;
}

export function AreaProperties({ area, canvas, onUpdate }: AreaPropertiesProps) {
  const [name, setName] = useState(area.metadata.name || '');
  const [notes, setNotes] = useState(area.metadata.notes || '');
  const [tags, setTags] = useState(area.metadata.tags?.join(', ') || '');
  const [showDimensions, setShowDimensions] = useState(area.showDimensions);
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);

  const { getSelectedMaterial } = useMaterialStore();

  // Calculate area metrics
  const areaValue = area.getArea();
  const perimeter = area.getPerimeter();
  const materialCost = area.getMaterialCost();

  // Update area when properties change
  const updateArea = useCallback((updates: Partial<typeof area>) => {
    Object.assign(area, updates);
    if (canvas) {
      canvas.renderAll();
    }
    onUpdate?.(area);
  }, [area, canvas, onUpdate]);

  // Handle name change
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    updateArea({
      metadata: { ...area.metadata, name: value }
    });
  }, [area.metadata, updateArea]);

  // Handle notes change
  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    updateArea({
      metadata: { ...area.metadata, notes: value }
    });
  }, [area.metadata, updateArea]);

  // Handle tags change
  const handleTagsChange = useCallback((value: string) => {
    setTags(value);
    const tagArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
    updateArea({
      metadata: { ...area.metadata, tags: tagArray }
    });
  }, [area.metadata, updateArea]);

  // Handle show dimensions toggle
  const handleShowDimensionsToggle = useCallback(() => {
    const newValue = !showDimensions;
    setShowDimensions(newValue);
    updateArea({ showDimensions: newValue });
  }, [showDimensions, updateArea]);

  // Handle material selection
  const handleMaterialSelect = useCallback((material: Material) => {
    area.setMaterial(material);
    if (canvas) {
      canvas.renderAll();
    }
    onUpdate?.(area);
    setIsMaterialPickerOpen(false);
  }, [area, canvas, onUpdate]);

  // Format area value for display
  const formatArea = (value: number): string => {
    if (value < 1) return `${(value * 144).toFixed(1)} sq in`; // Convert to square inches for small areas
    if (value < 1000) return `${value.toFixed(1)} sq ft`;
    return `${(value / 43560).toFixed(2)} acres`; // Convert to acres for large areas
  };

  // Format perimeter value for display
  const formatPerimeter = (value: number): string => {
    if (value < 12) return `${value.toFixed(1)} in`;
    if (value < 5280) return `${value.toFixed(1)} ft`;
    return `${(value / 5280).toFixed(2)} miles`;
  };

  // Format cost for display
  const formatCost = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Area Info */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Area Information</Label>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Area:</span>
            <span className="text-xs font-medium">{formatArea(areaValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Perimeter:</span>
            <span className="text-xs font-medium">{formatPerimeter(perimeter)}</span>
          </div>
          {area.material && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Material Cost:</span>
              <span className="text-xs font-medium text-green-600">{formatCost(materialCost)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Material Assignment */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Material</Label>
        {area.material ? (
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: area.material.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{area.material.name}</div>
                <div className="text-xs text-gray-500">
                  {formatCost(area.material.costPerUnit)}/{area.material.unit}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMaterialPickerOpen(true)}
                className="h-7 px-2 text-xs"
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsMaterialPickerOpen(true)}
            className="w-full h-9 text-sm"
          >
            <Tag className="w-4 h-4 mr-2" />
            Assign Material
          </Button>
        )}
      </div>

      {/* Material Picker Dialog */}
      <Dialog open={isMaterialPickerOpen} onOpenChange={setIsMaterialPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Material</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            <MaterialPicker
              onMaterialSelect={handleMaterialSelect}
              showCreateButton={true}
              compact={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Area Name */}
      <div>
        <Label htmlFor="area-name" className="text-xs font-medium text-gray-700 mb-2 block">
          Name
        </Label>
        <Input
          id="area-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter area name..."
          className="h-8 text-xs"
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="area-notes" className="text-xs font-medium text-gray-700 mb-2 block">
          Notes
        </Label>
        <Textarea
          id="area-notes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add notes about this area..."
          className="text-xs min-h-[60px] resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="area-tags" className="text-xs font-medium text-gray-700 mb-2 block">
          Tags
        </Label>
        <Input
          id="area-tags"
          value={tags}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="landscape-bed, mulch, front-yard..."
          className="h-8 text-xs"
        />
        {area.metadata.tags && area.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {area.metadata.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Display Options */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Display Options</Label>
        <div className="space-y-2">
          <Button
            variant={showDimensions ? "default" : "outline"}
            size="sm"
            onClick={handleShowDimensionsToggle}
            className="w-full h-8 text-xs"
          >
            {showDimensions ? (
              <>
                <Eye className="w-3 h-3 mr-2" />
                Dimensions Visible
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-2" />
                Dimensions Hidden
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Cost Calculator */}
      {area.material && (
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Cost Breakdown</Label>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-700">Area:</span>
              <span className="font-medium">{formatArea(areaValue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-700">Rate:</span>
              <span className="font-medium">{formatCost(area.material.costPerUnit)}/{area.material.unit}</span>
            </div>
            <div className="border-t border-green-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Total Cost:</span>
                <span className="text-sm font-bold text-green-800">{formatCost(materialCost)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Quick Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Calculate and show total area
              console.log('Area calculation:', {
                area: areaValue,
                perimeter,
                cost: materialCost
              });
            }}
            className="h-8 text-xs"
          >
            <Calculator className="w-3 h-3 mr-1" />
            Calculate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Export area data
              const data = {
                id: area.areaId,
                name: area.metadata.name,
                area: areaValue,
                perimeter,
                material: area.material,
                cost: materialCost,
                notes: area.metadata.notes,
                tags: area.metadata.tags
              };
              console.log('Area data:', data);
            }}
            className="h-8 text-xs"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Estimate
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AreaProperties;