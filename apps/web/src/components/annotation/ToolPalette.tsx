'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Move,
  MousePointer2,
  PaintBucket,
  Brush,
  PenTool,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type ToolType = 'select' | 'mask-polygon' | 'mask-brush' | 'pen-freehand' | 'move';

export type ToolPaletteProps = {
  className?: string;
  activeTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;
  onSave?: () => void;
  hasUnsavedChanges?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const tools = [
  {
    id: 'select' as const,
    name: 'Select / Move',
    icon: MousePointer2,
    shortcut: 'S',
    description: 'Select and move existing masks'
  },
  {
    id: 'mask-polygon' as const,
    name: 'Polygon Mask',
    icon: PaintBucket,
    shortcut: 'M',
    description: 'Click to create polygon mask'
  },
  {
    id: 'mask-brush' as const,
    name: 'Brush Mask',
    icon: Brush,
    shortcut: 'B',
    description: 'Paint with pressure-sensitive brush'
  },
  {
    id: 'pen-freehand' as const,
    name: 'Freehand Pen',
    icon: PenTool,
    shortcut: 'P',
    description: 'Draw smooth curves with Bézier smoothing'
  },
  {
    id: 'move' as const,
    name: 'Move Tool',
    icon: Move,
    shortcut: 'V',
    description: 'Pan and zoom the canvas'
  }
];

export function ToolPalette({ 
  className,
  activeTool = 'select',
  onToolChange,
  onSave,
  hasUnsavedChanges = false,
  isCollapsed = false,
  onToggleCollapse
}: ToolPaletteProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const tool = tools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onToolChange?.(tool.id);
      }

      // Handle Escape key to cancel drawing
      if (e.key === 'Escape') {
        e.preventDefault();
        onToolChange?.('select');
      }

      // Handle Cmd/Ctrl+S for save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToolChange, onSave]);

  const toggleCollapse = () => {
    const newState = !localCollapsed;
    setLocalCollapsed(newState);
    onToggleCollapse?.();
  };

  return (
    <div className={cn(
      'flex flex-col bg-background border border-border rounded-lg shadow-sm',
      'transition-all duration-200 ease-in-out',
      localCollapsed ? 'w-12' : 'w-64',
      'lg:w-64 lg:static', // Always expanded on large screens
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!localCollapsed && (
          <h3 className="text-sm font-medium text-foreground">Tools</h3>
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            'p-1 rounded-md hover:bg-accent transition-colors',
            'lg:hidden', // Hide collapse button on large screens
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
          aria-label={localCollapsed ? 'Expand tool palette' : 'Collapse tool palette'}
        >
          {localCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Tools */}
      <div className="flex-1 p-2 space-y-1">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          const Icon = tool.icon;
          
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onToolChange?.(tool.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-md transition-all',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isActive && 'bg-primary text-primary-foreground shadow-sm',
                    localCollapsed && 'justify-center'
                  )}
                  aria-label={`${tool.name} (${tool.shortcut})`}
                  data-testid={`tool-${tool.id}`}
                >
                  <Icon className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive && 'text-primary-foreground'
                  )} />
                  {!localCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">
                        {tool.name}
                      </span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground',
                        isActive && 'bg-primary-foreground/20 text-primary-foreground'
                      )}>
                        {tool.shortcut}
                      </span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side={localCollapsed ? 'right' : 'bottom'}>
                <div>
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                  <p className="text-xs text-muted-foreground">Press {tool.shortcut}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Save button */}
      <div className="p-2 border-t border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onSave}
              disabled={!hasUnsavedChanges}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-md transition-all',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                hasUnsavedChanges 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
                localCollapsed && 'justify-center'
              )}
              aria-label={hasUnsavedChanges ? 'Save changes (Cmd+S)' : 'No changes to save'}
              data-testid="save-button"
            >
              <Save className="w-4 h-4 flex-shrink-0" />
              {!localCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    {hasUnsavedChanges ? 'Save' : 'Saved'}
                  </span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    hasUnsavedChanges 
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  )}>
                    ⌘S
                  </span>
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side={localCollapsed ? 'right' : 'bottom'}>
            <div>
              <p className="font-medium">Save Masks</p>
              <p className="text-xs text-muted-foreground">
                {hasUnsavedChanges ? 'Save your changes' : 'No changes to save'}
              </p>
              <p className="text-xs text-muted-foreground">Press Cmd+S</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Context help */}
      {!localCollapsed && (
        <div className="p-3 bg-muted/50 text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Modifier Keys:</p>
          <ul className="space-y-0.5">
            <li>• Shift = Constrain angle</li>
            <li>• Alt = Subtract region</li>
            <li>• Shift+Click = Add vertex</li>
            <li>• Esc = Cancel current tool</li>
          </ul>
        </div>
      )}
    </div>
  );
}