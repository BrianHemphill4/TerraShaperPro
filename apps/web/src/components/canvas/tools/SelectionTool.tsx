'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Square, Group, Ungroup, AlignLeft, AlignCenter, AlignRight, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSelectionStore } from '@/stores/canvas/useSelectionStore';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SelectionToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onSelectionChange?: (objects: fabric.Object[]) => void;
}

export function SelectionTool({ canvas, isActive, onSelectionChange }: SelectionToolProps) {
  const rubberBandRef = useRef<fabric.Rect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    selectedObjects,
    rubberBandStart,
    rubberBandEnd,
    isSelecting,
    selectionMode,
    startRubberBand,
    updateRubberBand,
    endRubberBand,
    handleClick,
    selectAll,
    clearSelection,
    createGroup,
    ungroupSelection,
    deleteSelected,
    duplicateSelected,
    alignSelected,
    distributeSelected,
    getSelectedCount,
    hasSelection
  } = useSelectionStore();

  // Handle canvas selection events
  useEffect(() => {
    if (!canvas || !isActive) return;

    const handleSelectionCreated = (e: fabric.IEvent) => {
      const activeObjects = canvas.getActiveObjects();
      useSelectionStore.getState().setSelectedObjects(activeObjects);
      onSelectionChange?.(activeObjects);
    };

    const handleSelectionUpdated = (e: fabric.IEvent) => {
      const activeObjects = canvas.getActiveObjects();
      useSelectionStore.getState().setSelectedObjects(activeObjects);
      onSelectionChange?.(activeObjects);
    };

    const handleSelectionCleared = () => {
      useSelectionStore.getState().clearSelection();
      onSelectionChange?.([]);
    };

    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionUpdated);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionUpdated);
      canvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [canvas, isActive, onSelectionChange]);

  // Handle mouse events for rubber band selection
  useEffect(() => {
    if (!canvas || !isActive) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!e.pointer) return;

      const pointer = new fabric.Point(e.pointer.x, e.pointer.y);
      
      // If clicking on empty space, start rubber band selection
      if (!e.target && selectionMode === 'multi') {
        setIsDragging(true);
        startRubberBand(pointer);
        canvas.selection = false; // Disable default selection
      } else if (e.target) {
        // Handle object selection
        handleClick(e.target, e);
      } else if (!e.target) {
        // Clear selection when clicking empty space
        handleClick(null, e);
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!e.pointer || !isDragging || !isSelecting) return;

      const pointer = new fabric.Point(e.pointer.x, e.pointer.y);
      updateRubberBand(pointer);
      updateRubberBandVisual();
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (isDragging && isSelecting) {
        completeRubberBandSelection();
        setIsDragging(false);
        canvas.selection = true; // Re-enable default selection
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, isActive, isDragging, isSelecting, selectionMode, handleClick, startRubberBand, updateRubberBand]);

  // Update rubber band visual
  const updateRubberBandVisual = useCallback(() => {
    if (!canvas || !rubberBandStart || !rubberBandEnd) return;

    // Remove existing rubber band
    if (rubberBandRef.current) {
      canvas.remove(rubberBandRef.current);
    }

    // Create new rubber band rectangle
    const left = Math.min(rubberBandStart.x, rubberBandEnd.x);
    const top = Math.min(rubberBandStart.y, rubberBandEnd.y);
    const width = Math.abs(rubberBandEnd.x - rubberBandStart.x);
    const height = Math.abs(rubberBandEnd.y - rubberBandStart.y);

    if (width > 5 && height > 5) { // Only show if drag is significant
      const rubberBand = new fabric.Rect({
        left,
        top,
        width,
        height,
        fill: 'rgba(59, 130, 246, 0.1)',
        stroke: '#3b82f6',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true
      });

      rubberBandRef.current = rubberBand;
      canvas.add(rubberBand);
      canvas.renderAll();
    }
  }, [canvas, rubberBandStart, rubberBandEnd]);

  // Complete rubber band selection
  const completeRubberBandSelection = useCallback(() => {
    if (!canvas || !rubberBandStart || !rubberBandEnd) return;

    // Calculate selection bounds
    const left = Math.min(rubberBandStart.x, rubberBandEnd.x);
    const top = Math.min(rubberBandStart.y, rubberBandEnd.y);
    const right = Math.max(rubberBandStart.x, rubberBandEnd.x);
    const bottom = Math.max(rubberBandStart.y, rubberBandEnd.y);

    // Find objects within selection bounds
    const objectsInSelection = canvas.getObjects().filter(obj => {
      if (!obj.selectable || obj === rubberBandRef.current) return false;
      
      const bounds = obj.getBoundingRect();
      return bounds.left >= left &&
             bounds.top >= top &&
             bounds.left + bounds.width <= right &&
             bounds.top + bounds.height <= bottom;
    });

    // Remove rubber band visual
    if (rubberBandRef.current) {
      canvas.remove(rubberBandRef.current);
      rubberBandRef.current = null;
    }

    // Update selection
    if (objectsInSelection.length > 0) {
      useSelectionStore.getState().setSelectedObjects(objectsInSelection);
      
      if (objectsInSelection.length === 1) {
        canvas.setActiveObject(objectsInSelection[0]);
      } else {
        const selection = new fabric.ActiveSelection(objectsInSelection, { canvas });
        canvas.setActiveObject(selection);
      }
    }

    endRubberBand();
    canvas.renderAll();
  }, [canvas, rubberBandStart, rubberBandEnd, endRubberBand]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canvas) selectAll(canvas);
          }
          break;
        case 'escape':
          e.preventDefault();
          clearSelection();
          if (canvas) canvas.discardActiveObject();
          break;
        case 'delete':
        case 'backspace':
          if (!e.ctrlKey && !e.metaKey && canvas) {
            e.preventDefault();
            deleteSelected(canvas);
          }
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canvas) duplicateSelected(canvas);
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (canvas) createGroup(canvas);
          }
          break;
        case 'u':
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault();
            if (canvas) ungroupSelection(canvas);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, canvas, selectAll, clearSelection, deleteSelected, duplicateSelected, createGroup, ungroupSelection]);

  // Selection toolbar component
  const SelectionToolbar = () => {
    if (!hasSelection() || !isActive) return null;

    const count = getSelectedCount();
    const canGroup = count > 1;
    const canUngroup = selectedObjects.some(obj => obj.type === 'group');
    const canAlign = count > 1;
    const canDistribute = count > 2;

    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-2 flex items-center gap-1">
        <div className="text-xs font-medium text-gray-700 px-2 py-1 bg-gray-50 rounded">
          {count} selected
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Group/Ungroup */}
        {canGroup && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => canvas && createGroup(canvas)}
                className="h-8 w-8 p-0"
              >
                <Group className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Group (Ctrl+G)</TooltipContent>
          </Tooltip>
        )}
        
        {canUngroup && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => canvas && ungroupSelection(canvas)}
                className="h-8 w-8 p-0"
              >
                <Ungroup className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ungroup (Ctrl+Shift+U)</TooltipContent>
          </Tooltip>
        )}
        
        {canAlign && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Alignment */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvas && alignSelected(canvas, 'left')}
                  className="h-8 w-8 p-0"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvas && alignSelected(canvas, 'center')}
                  className="h-8 w-8 p-0"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => canvas && alignSelected(canvas, 'right')}
                  className="h-8 w-8 p-0"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>
          </>
        )}
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => canvas && duplicateSelected(canvas)}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => canvas && deleteSelected(canvas)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    );
  };

  // Status indicator
  const StatusIndicator = () => {
    if (!isActive) return null;

    if (isSelecting) {
      return (
        <div className="absolute bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
          <div className="text-sm font-medium text-blue-900">Rubber Band Selection</div>
          <div className="text-xs text-blue-700 mt-1">
            Drag to select multiple objects
          </div>
        </div>
      );
    }

    if (hasSelection()) {
      const count = getSelectedCount();
      return (
        <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-sm">
          <div className="text-sm font-medium text-gray-900">
            {count} object{count !== 1 ? 's' : ''} selected
          </div>
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div>Ctrl+A: Select All • Esc: Clear • Del: Delete</div>
            <div>Ctrl+D: Duplicate • Ctrl+G: Group</div>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-900">Selection Tool Active</div>
        <div className="text-xs text-gray-600 mt-1 space-y-1">
          <div>Click objects to select • Shift+Click: Multi-select</div>
          <div>Drag on empty space for rubber band selection</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SelectionToolbar />
      <StatusIndicator />
    </>
  );
}

export default SelectionTool;