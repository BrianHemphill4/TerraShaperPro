'use client';

import React, { useState } from 'react';
import { fabric } from 'fabric';
import { 
  Clipboard, 
  X, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClipboardStore, type ClipboardItem } from '@/stores/canvas/useClipboardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface ClipboardPanelProps {
  canvas: fabric.Canvas | null;
  className?: string;
}

export function ClipboardPanel({ canvas, className }: ClipboardPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');

  const {
    clipboardItems,
    isClipboardVisible,
    setClipboardVisible,
    pasteFromClipboard,
    removeClipboardItem,
    clearClipboard,
    exportClipboard,
    importClipboard,
    hasClipboardItems
  } = useClipboardStore();

  // Handle paste from clipboard
  const handlePaste = async (index: number) => {
    if (!canvas) return;
    
    try {
      const pastedObjects = await pasteFromClipboard(canvas, index);
      if (pastedObjects.length > 0) {
        console.log(`Pasted ${pastedObjects.length} object(s)`);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  // Handle export clipboard
  const handleExport = () => {
    const data = exportClipboard();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipboard_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle import clipboard
  const handleImport = () => {
    if (!importData.trim()) return;
    
    try {
      importClipboard(importData);
      setImportData('');
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Failed to import clipboard:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get object type display name
  const getObjectTypeDisplayName = (type: string): string => {
    switch (type) {
      case 'AreaObject': return 'Area';
      case 'LineObject': return 'Line';
      case 'MaskLayer': return 'Mask';
      case 'circle': return 'Circle';
      case 'rect': return 'Rectangle';
      case 'polygon': return 'Polygon';
      case 'line': return 'Line';
      case 'text': return 'Text';
      case 'image': return 'Image';
      case 'group': return 'Group';
      default: return type;
    }
  };

  // Get object type color
  const getObjectTypeColor = (type: string): string => {
    switch (type) {
      case 'AreaObject': return 'bg-green-100 text-green-800';
      case 'LineObject': return 'bg-blue-100 text-blue-800';
      case 'MaskLayer': return 'bg-yellow-100 text-yellow-800';
      case 'circle': return 'bg-purple-100 text-purple-800';
      case 'rect': return 'bg-indigo-100 text-indigo-800';
      case 'polygon': return 'bg-pink-100 text-pink-800';
      case 'line': return 'bg-gray-100 text-gray-800';
      case 'text': return 'bg-orange-100 text-orange-800';
      case 'image': return 'bg-teal-100 text-teal-800';
      case 'group': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ClipboardItemComponent = ({ item, index }: { item: ClipboardItem; index: number }) => (
    <div className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      {/* Preview */}
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {item.preview ? (
          <img
            src={item.preview}
            alt="Object preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <Clipboard className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-xs", getObjectTypeColor(item.type))}>
            {getObjectTypeDisplayName(item.type)}
          </Badge>
          <span className="text-xs text-gray-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {formatTime(item.timestamp)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePaste(index)}
              className="h-7 w-7 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Paste</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeClipboardItem(item.id)}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  if (!hasClipboardItems()) {
    return (
      <div className={cn('p-4 bg-gray-50 border rounded-lg', className)}>
        <div className="text-center text-gray-500">
          <Clipboard className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm font-medium mb-1">Clipboard Empty</div>
          <div className="text-xs">Copy objects to see them here</div>
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
            <Clipboard className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Clipboard</span>
            <Badge variant="secondary" className="text-xs">
              {clipboardItems.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  className="h-7 w-7 p-0"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Clipboard</TooltipContent>
            </Tooltip>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Import Clipboard</TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Clipboard Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Clipboard JSON Data</label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste clipboard JSON data here..."
                      className="w-full mt-1 p-2 border rounded-md h-32 text-xs font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsImportDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImport}
                      disabled={!importData.trim()}
                      className="flex-1"
                    >
                      Import
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearClipboard}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear All</TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {clipboardItems.map((item, index) => (
              <ClipboardItemComponent key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Quick access (collapsed view) */}
      {!isExpanded && clipboardItems.length > 0 && (
        <div className="p-3">
          <ClipboardItemComponent item={clipboardItems[0]} index={0} />
          {clipboardItems.length > 1 && (
            <div className="text-xs text-gray-500 text-center mt-2">
              +{clipboardItems.length - 1} more items
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClipboardPanel;