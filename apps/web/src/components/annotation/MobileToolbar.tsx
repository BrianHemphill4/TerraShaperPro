'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  Square,
  Circle,
  Hexagon,
  MousePointer,
  Pencil,
  Type,
  Ruler,
  Eraser,
  Undo,
  Redo,
  Save,
  Download,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface Tool {
  id: string;
  name: string;
  icon: React.ElementType;
  group?: string;
}

interface MobileToolbarProps {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

const TOOLS: Tool[] = [
  { id: 'select', name: 'Select', icon: MousePointer, group: 'basic' },
  { id: 'rectangle', name: 'Rectangle', icon: Square, group: 'shapes' },
  { id: 'circle', name: 'Circle', icon: Circle, group: 'shapes' },
  { id: 'polygon', name: 'Polygon', icon: Hexagon, group: 'shapes' },
  { id: 'brush', name: 'Brush', icon: Pencil, group: 'draw' },
  { id: 'text', name: 'Text', icon: Type, group: 'draw' },
  { id: 'measure', name: 'Measure', icon: Ruler, group: 'measure' },
  { id: 'eraser', name: 'Eraser', icon: Eraser, group: 'edit' }
];

export function MobileToolbar({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onExport,
  canUndo = false,
  canRedo = false,
  className
}: MobileToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { mobile, tablet } = useResponsive();

  // Auto-collapse on tool selection
  useEffect(() => {
    if (mobile) {
      setIsExpanded(false);
    }
  }, [selectedTool, mobile]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowMoreTools(false);
      }
    };

    if (isExpanded || showMoreTools) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, showMoreTools]);

  const primaryTools = TOOLS.slice(0, mobile ? 4 : 6);
  const secondaryTools = TOOLS.slice(mobile ? 4 : 6);

  const selectedToolData = TOOLS.find(t => t.id === selectedTool);

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-700',
        'safe-area-bottom', // For iPhone notch
        className
      )}
    >
      {/* Main Toolbar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Tool Selection Area */}
          <div className="flex items-center gap-1 flex-1">
            {/* Current Tool / Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'flex items-center gap-2 px-3 h-10',
                'touch-manipulation', // Better touch handling
                selectedTool && 'bg-primary/10'
              )}
            >
              {selectedToolData && (
                <>
                  <selectedToolData.icon className="h-5 w-5" />
                  {!mobile && <span className="text-sm">{selectedToolData.name}</span>}
                </>
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 ml-1" />
              ) : (
                <ChevronUp className="h-4 w-4 ml-1" />
              )}
            </Button>

            {/* Quick Access Tools */}
            {!isExpanded && (
              <div className="flex items-center gap-1">
                {primaryTools.map(tool => (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onToolSelect(tool.id)}
                    className="h-10 w-10 p-0 touch-manipulation"
                    title={tool.name}
                  >
                    <tool.icon className="h-5 w-5" />
                  </Button>
                ))}
                
                {secondaryTools.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreTools(!showMoreTools)}
                    className="h-10 w-10 p-0 touch-manipulation"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {onUndo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-10 w-10 p-0 touch-manipulation"
                title="Undo"
              >
                <Undo className="h-5 w-5" />
              </Button>
            )}
            
            {onRedo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-10 w-10 p-0 touch-manipulation"
                title="Redo"
              >
                <Redo className="h-5 w-5" />
              </Button>
            )}
            
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="h-10 w-10 p-0 touch-manipulation"
                title="Save"
              >
                <Save className="h-5 w-5" />
              </Button>
            )}
            
            {onExport && !mobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-10 w-10 p-0 touch-manipulation"
                title="Export"
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Tool Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TOOLS.map(tool => (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? 'default' : 'outline'}
                    onClick={() => {
                      onToolSelect(tool.id);
                      if (mobile) setIsExpanded(false);
                    }}
                    className={cn(
                      'h-16 flex flex-col items-center justify-center gap-1',
                      'touch-manipulation'
                    )}
                  >
                    <tool.icon className="h-6 w-6" />
                    <span className="text-xs">{tool.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Tools Popover */}
      <AnimatePresence>
        {showMoreTools && !isExpanded && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="absolute bottom-full right-4 mb-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2"
          >
            <div className="flex flex-col gap-1">
              {secondaryTools.map(tool => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    onToolSelect(tool.id);
                    setShowMoreTools(false);
                  }}
                  className="justify-start"
                >
                  <tool.icon className="h-4 w-4 mr-2" />
                  {tool.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating Action Button variant for minimal UI
export function FloatingToolbar({
  selectedTool,
  onToolSelect,
  onToggleMenu,
  className
}: {
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onToggleMenu: () => void;
  className?: string;
}) {
  const [showQuickTools, setShowQuickTools] = useState(false);
  const selectedToolData = TOOLS.find(t => t.id === selectedTool);

  return (
    <>
      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowQuickTools(!showQuickTools)}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'h-14 w-14 rounded-full bg-primary text-white',
          'shadow-lg hover:shadow-xl transition-shadow',
          'flex items-center justify-center',
          'touch-manipulation',
          className
        )}
      >
        {selectedToolData ? (
          <selectedToolData.icon className="h-6 w-6" />
        ) : (
          <MousePointer className="h-6 w-6" />
        )}
      </motion.button>

      {/* Quick Tools */}
      <AnimatePresence>
        {showQuickTools && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-6 z-40 flex flex-col gap-2"
          >
            {TOOLS.slice(0, 4).map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onToolSelect(tool.id);
                  setShowQuickTools(false);
                }}
                className={cn(
                  'h-12 w-12 rounded-full bg-white dark:bg-gray-800',
                  'shadow-md hover:shadow-lg transition-shadow',
                  'flex items-center justify-center',
                  'touch-manipulation',
                  selectedTool === tool.id && 'ring-2 ring-primary'
                )}
              >
                <tool.icon className="h-5 w-5" />
              </motion.button>
            ))}
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onToggleMenu}
              className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center touch-manipulation"
            >
              <Settings className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}