'use client';

import React, { useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { Ruler, DollarSign, Eye, EyeOff, Tag, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineObject } from '@/lib/canvas/objects/LineObject';
import { useMaterialStore, type Material } from '@/stores/canvas/useMaterialStore';
import { MaterialPicker } from '@/components/canvas/tools/MaterialPicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface LinePropertiesProps {
  line: LineObject;
  canvas: fabric.Canvas | null;
  onUpdate?: (line: LineObject) => void;
}

const LINE_TYPE_OPTIONS = [
  { value: 'edge', label: 'Edging', icon: Minus, color: '#8B4513' },
  { value: 'border', label: 'Border', icon: Minus, color: '#228B22' },
  { value: 'path', label: 'Path', icon: Minus, color: '#696969' },
  { value: 'utility', label: 'Utility', icon: Minus, color: '#FF6347' }
] as const;

export function LineProperties({ line, canvas, onUpdate }: LinePropertiesProps) {
  const [name, setName] = useState(line.metadata.name || '');
  const [notes, setNotes] = useState(line.metadata.notes || '');
  const [tags, setTags] = useState(line.metadata.tags?.join(', ') || '');
  const [showDimensions, setShowDimensions] = useState(line.showDimensions);
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);

  // Calculate line metrics
  const length = line.getLength();
  const angle = line.getAngle();
  const materialCost = line.getMaterialCost();

  // Update line when properties change
  const updateLine = useCallback((updates: Partial<typeof line>) => {
    Object.assign(line, updates);
    if (canvas) {
      canvas.renderAll();
    }
    onUpdate?.(line);
  }, [line, canvas, onUpdate]);

  // Handle name change
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    updateLine({
      metadata: { ...line.metadata, name: value }
    });
  }, [line.metadata, updateLine]);

  // Handle notes change
  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
    updateLine({
      metadata: { ...line.metadata, notes: value }
    });
  }, [line.metadata, updateLine]);

  // Handle tags change
  const handleTagsChange = useCallback((value: string) => {
    setTags(value);
    const tagArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
    updateLine({
      metadata: { ...line.metadata, tags: tagArray }
    });
  }, [line.metadata, updateLine]);

  // Handle line type change
  const handleLineTypeChange = useCallback((newType: 'edge' | 'border' | 'path' | 'utility') => {
    line.setLineType(newType);
    if (canvas) {
      canvas.renderAll();
    }
    onUpdate?.(line);
  }, [line, canvas, onUpdate]);

  // Handle show dimensions toggle
  const handleShowDimensionsToggle = useCallback(() => {
    const newValue = !showDimensions;
    setShowDimensions(newValue);
    updateLine({ showDimensions: newValue });
  }, [showDimensions, updateLine]);

  // Handle material selection
  const handleMaterialSelect = useCallback((material: Material) => {
    line.setMaterial(material);
    if (canvas) {
      canvas.renderAll();
    }
    onUpdate?.(line);
    setIsMaterialPickerOpen(false);
  }, [line, canvas, onUpdate]);

  // Format length value for display
  const formatLength = (value: number): string => {
    if (value < 12) return `${value.toFixed(1)} in`;
    if (value < 5280) return `${value.toFixed(1)} ft`;
    return `${(value / 5280).toFixed(2)} miles`;
  };

  // Format angle for display
  const formatAngle = (value: number): string => {
    const normalized = ((value % 360) + 360) % 360;
    return `${normalized.toFixed(1)}°`;
  };

  // Format cost for display
  const formatCost = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Get line type display info
  const currentLineType = LINE_TYPE_OPTIONS.find(option => option.value === line.lineType);

  return (
    <div className="space-y-4">
      {/* Line Info */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Line Information</Label>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Length:</span>
            <span className="text-xs font-medium">{formatLength(length)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Angle:</span>
            <span className="text-xs font-medium">{formatAngle(angle)}</span>
          </div>
          {line.material && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Material Cost:</span>
              <span className="text-xs font-medium text-green-600">{formatCost(materialCost)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Line Type */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Line Type</Label>
        <Select value={line.lineType} onValueChange={handleLineTypeChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {currentLineType && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: currentLineType.color }}
                  />
                  {currentLineType.label}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LINE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material Assignment */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">Material</Label>
        {line.material ? (
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: line.material.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{line.material.name}</div>
                <div className="text-xs text-gray-500">
                  {formatCost(line.material.costPerUnit)}/{line.material.unit}
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

      {/* Line Name */}
      <div>
        <Label htmlFor="line-name" className="text-xs font-medium text-gray-700 mb-2 block">
          Name
        </Label>
        <Input
          id="line-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter line name..."
          className="h-8 text-xs"
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="line-notes" className="text-xs font-medium text-gray-700 mb-2 block">
          Notes
        </Label>
        <Textarea
          id="line-notes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add notes about this line..."
          className="text-xs min-h-[60px] resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="line-tags" className="text-xs font-medium text-gray-700 mb-2 block">
          Tags
        </Label>
        <Input
          id="line-tags"
          value={tags}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="edging, border, pathway..."
          className="h-8 text-xs"
        />
        {line.metadata.tags && line.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {line.metadata.tags.map((tag, index) => (
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
      {line.material && (
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-2 block">Cost Breakdown</Label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700">Length:</span>
              <span className="font-medium">{formatLength(length)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700">Rate:</span>
              <span className="font-medium">{formatCost(line.material.costPerUnit)}/{line.material.unit}</span>
            </div>
            <div className="border-t border-blue-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Total Cost:</span>
                <span className="text-sm font-bold text-blue-800">{formatCost(materialCost)}</span>
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
              // Calculate and show line measurements
              console.log('Line calculation:', {
                length,
                angle,
                cost: materialCost,
                startPoint: line.getStartPoint(),
                endPoint: line.getEndPoint()
              });
            }}
            className="h-8 text-xs"
          >
            <Ruler className="w-3 h-3 mr-1" />
            Measure
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Export line data
              const data = {
                id: line.lineId,
                name: line.metadata.name,
                type: line.lineType,
                length,
                angle,
                material: line.material,
                cost: materialCost,
                notes: line.metadata.notes,
                tags: line.metadata.tags
              };
              console.log('Line data:', data);
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

export default LineProperties;