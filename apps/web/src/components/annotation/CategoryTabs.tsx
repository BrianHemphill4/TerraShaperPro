'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { 
  ANNOTATION_CATEGORIES, 
  CATEGORY_COLORS, 
  CATEGORY_SHORTCUTS,
  type AnnotationCategory 
} from '@terrashaper/shared';
import { 
  MoreVertical, 
  Palette, 
  Eye, 
  EyeOff,
  Merge
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CategoryTabsProps {
  className?: string;
  onCategoryChange?: (category: AnnotationCategory) => void;
}

export function CategoryTabs({ className, onCategoryChange }: CategoryTabsProps) {
  const { selectedSceneId } = useSceneStore();
  const { 
    drawingCategory, 
    setDrawingCategory,
    getMasksByCategory 
  } = useMaskStore();
  
  const [hiddenCategories, setHiddenCategories] = useState<Set<AnnotationCategory>>(new Set());
  const [categoryColors, setCategoryColors] = useState(CATEGORY_COLORS);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressCategory, setLongPressCategory] = useState<AnnotationCategory | null>(null);

  // Calculate mask counts per category
  const getCategoryCount = (category: AnnotationCategory): number => {
    if (!selectedSceneId) return 0;
    return getMasksByCategory(selectedSceneId, category).length;
  };

  const handleCategoryChange = (category: AnnotationCategory) => {
    setDrawingCategory(category);
    onCategoryChange?.(category);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check for Alt/Option + Arrow keys
      if (e.altKey) {
        const currentIndex = ANNOTATION_CATEGORIES.indexOf(drawingCategory as AnnotationCategory);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          e.preventDefault();
          const newCategory = ANNOTATION_CATEGORIES[currentIndex - 1];
          handleCategoryChange(newCategory);
        } else if (e.key === 'ArrowRight' && currentIndex < ANNOTATION_CATEGORIES.length - 1) {
          e.preventDefault();
          const newCategory = ANNOTATION_CATEGORIES[currentIndex + 1];
          handleCategoryChange(newCategory);
        }
      }
      
      // Check for Alt/Option + Number keys
      if (e.altKey && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const category = ANNOTATION_CATEGORIES.find(
          cat => CATEGORY_SHORTCUTS[cat] === e.key
        );
        if (category) {
          handleCategoryChange(category);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [drawingCategory, handleCategoryChange]);

  const toggleCategoryVisibility = (category: AnnotationCategory) => {
    setHiddenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleLongPressStart = (category: AnnotationCategory) => {
    const timer = setTimeout(() => {
      setLongPressCategory(category);
    }, 600);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleColorChange = (category: AnnotationCategory, color: string) => {
    setCategoryColors(prev => ({
      ...prev,
      [category]: color
    }));
    // In a real app, this would persist to user preferences
    setLongPressCategory(null);
  };

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted/50 rounded-lg', className)}>
      {ANNOTATION_CATEGORIES.map((category) => {
        const count = getCategoryCount(category);
        const isActive = drawingCategory === category;
        const isHidden = hiddenCategories.has(category);
        const color = categoryColors[category];
        
        return (
          <div key={category} className="relative group">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  onMouseDown={() => handleLongPressStart(category)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(category)}
                  onTouchEnd={handleLongPressEnd}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2 rounded-md transition-all',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isActive && 'bg-background shadow-sm ring-1 ring-border',
                    isHidden && 'opacity-50'
                  )}
                  style={{
                    borderBottomColor: isActive ? color : 'transparent',
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid'
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium">{category}</span>
                  {count > 0 && (
                    <span 
                      className={cn(
                        'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                        'bg-muted text-muted-foreground font-medium',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {category}</p>
                <p className="text-xs text-muted-foreground">
                  Alt+{CATEGORY_SHORTCUTS[category]} or Alt+←/→
                </p>
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'absolute -top-1 -right-1 w-5 h-5 rounded-full',
                    'bg-background border shadow-sm',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleCategoryVisibility(category)}>
                  {isHidden ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show {category}
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide {category}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLongPressCategory(category)}
                  disabled={count === 0}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Change Color
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Merge className="w-4 h-4 mr-2" />
                  Merge into...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
      
      {/* Color Picker Modal - Simplified for now */}
      {longPressCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            <h3 className="text-sm font-medium mb-3">
              Choose color for {longPressCategory}
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {[
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
                '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#64748b'
              ].map(color => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-md border-2 border-transparent hover:border-primary"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(longPressCategory, color)}
                />
              ))}
            </div>
            <button
              type="button"
              className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setLongPressCategory(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}