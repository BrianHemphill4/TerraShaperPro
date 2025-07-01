'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import { MobileToolbar, FloatingToolbar } from './MobileToolbar';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface ResponsiveAnnotationLayoutProps {
  children: React.ReactNode;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  layers?: any[];
  onLayerToggle?: (layerId: string) => void;
  onLayerLock?: (layerId: string) => void;
  onLayerOpacity?: (layerId: string, opacity: number) => void;
  onLayerDelete?: (layerId: string) => void;
  projectName?: string;
  className?: string;
  toolbarPosition?: 'bottom' | 'top';
  toolbarVariant?: 'full' | 'floating';
}

export function ResponsiveAnnotationLayout({
  children,
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onExport,
  canUndo,
  canRedo,
  layers,
  onLayerToggle,
  onLayerLock,
  onLayerOpacity,
  onLayerDelete,
  projectName,
  className,
  toolbarPosition = 'bottom',
  toolbarVariant = 'full'
}: ResponsiveAnnotationLayoutProps) {
  const { mobile, tablet, orientation } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!mobile);
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (mobile) {
      setSidebarOpen(false);
    }
  }, [mobile]);

  // Handle orientation changes
  useEffect(() => {
    if (mobile && orientation === 'landscape') {
      // Suggest fullscreen mode in landscape
      setFullscreenMode(true);
    }
  }, [mobile, orientation]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreenMode(true);
    } else {
      document.exitFullscreen();
      setFullscreenMode(false);
    }
  };

  const isMobileLayout = mobile || (tablet && orientation === 'portrait');

  return (
    <div className={cn(
      'relative flex h-screen overflow-hidden',
      'bg-gray-100 dark:bg-gray-950',
      className
    )}>
      {/* Desktop Sidebar */}
      {!isMobileLayout && (
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30 }}
              className={cn(
                'w-80 bg-white dark:bg-gray-900',
                'border-r border-gray-200 dark:border-gray-700',
                'flex flex-col'
              )}
            >
              {/* Sidebar content */}
              <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-lg font-semibold mb-4">{projectName}</h2>
                {/* Add desktop sidebar content here */}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar (Mobile/Tablet) */}
        {isMobileLayout && (
          <div className={cn(
            'flex items-center justify-between px-4 py-2',
            'bg-white dark:bg-gray-900',
            'border-b border-gray-200 dark:border-gray-700',
            toolbarPosition === 'top' && toolbarVariant === 'full' && 'pb-0'
          )}>
            <h1 className="text-lg font-semibold truncate flex-1">
              {projectName}
            </h1>
            
            <div className="flex items-center gap-2">
              {mobile && orientation === 'portrait' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="h-8 px-2 text-xs"
                >
                  Fullscreen
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Canvas Container */}
        <div className={cn(
          'flex-1 relative overflow-hidden',
          isMobileLayout && toolbarVariant === 'full' && toolbarPosition === 'bottom' && 'pb-16',
          isMobileLayout && toolbarVariant === 'full' && toolbarPosition === 'top' && 'pt-16'
        )}>
          {children}
        </div>

        {/* Mobile Toolbar */}
        {isMobileLayout && (
          <>
            {toolbarVariant === 'full' ? (
              <MobileToolbar
                selectedTool={selectedTool}
                onToolSelect={onToolSelect}
                onUndo={onUndo}
                onRedo={onRedo}
                onSave={onSave}
                onExport={onExport}
                canUndo={canUndo}
                canRedo={canRedo}
                className={cn(
                  toolbarPosition === 'top' && 'bottom-auto top-14 border-t-0 border-b'
                )}
              />
            ) : (
              <FloatingToolbar
                selectedTool={selectedTool}
                onToolSelect={onToolSelect}
                onToggleMenu={() => setMenuOpen(true)}
              />
            )}
          </>
        )}

        {/* Desktop Toolbar */}
        {!isMobileLayout && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {!sidebarOpen && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Show Sidebar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        layers={layers}
        onLayerToggle={onLayerToggle}
        onLayerLock={onLayerLock}
        onLayerOpacity={onLayerOpacity}
        onLayerDelete={onLayerDelete}
        onExport={onExport}
        onImport={() => {}}
        onShare={() => {}}
        onSettings={() => {}}
        onHelp={() => {}}
        projectName={projectName}
      />

      {/* Orientation Warning */}
      {mobile && orientation === 'portrait' && !fullscreenMode && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className={cn(
            'fixed bottom-20 left-4 right-4 z-30',
            'bg-blue-600 text-white rounded-lg p-3',
            'flex items-center justify-between'
          )}
        >
          <p className="text-sm">
            Rotate device for better experience
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setFullscreenMode(true)}
            className="text-white hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// Simplified layout for embedding
export function MinimalAnnotationLayout({
  children,
  selectedTool,
  onToolSelect,
  className
}: {
  children: React.ReactNode;
  selectedTool: string;
  onToolSelect: (toolId: string) => void;
  className?: string;
}) {
  const { mobile } = useResponsive();

  return (
    <div className={cn('relative h-full', className)}>
      {children}
      
      {mobile && (
        <FloatingToolbar
          selectedTool={selectedTool}
          onToolSelect={onToolSelect}
          onToggleMenu={() => {}}
          className="bottom-4 right-4"
        />
      )}
    </div>
  );
}