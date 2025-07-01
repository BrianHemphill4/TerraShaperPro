'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { X, ChevronUp, ChevronDown, Menu, Layers, History, Share, Settings } from 'lucide-react';
import { useResponsive, useBreakpoint } from '@/hooks/useResponsive';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { Button } from '@/components/ui/button';
import { ToolPalette } from './ToolPalette';
import { ActionHistoryPanel } from '../canvas/ActionHistoryPanel';
import { ExportPanel } from '../canvas/ExportPanel';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { useAnnotationStore } from '@/stores/canvas/annotation.store';
import { useMaskStore } from '@/stores/canvas/mask.store';
import { useHistoryStore } from '@/stores/canvas/history.store';
import type { Tool } from '@/lib/canvas/tools';

interface BottomSheet {
  id: 'tools' | 'history' | 'layers' | 'export' | 'properties';
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  height?: 'small' | 'medium' | 'large' | 'full';
}

interface MobileAnnotationViewProps {
  projectId: string;
  sceneId: string;
  canvas: fabric.Canvas | null;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
}

export function MobileAnnotationView({
  projectId,
  sceneId,
  canvas,
  onCanvasReady,
}: MobileAnnotationViewProps) {
  const { mobile, tablet, orientation } = useResponsive();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickToolbar, setShowQuickToolbar] = useState(true);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { currentTool, setCurrentTool } = useAnnotationStore();
  const { masks } = useMaskStore();
  const { history, currentIndex } = useHistoryStore();

  const isMobile = useBreakpoint('mobile');
  const isTablet = useBreakpoint('tablet');

  // Touch gesture handlers
  const handlePinch = useCallback((scale: number) => {
    if (!canvas) return;
    const zoom = canvas.getZoom() * scale;
    canvas.setZoom(Math.max(0.1, Math.min(5, zoom)));
    canvas.renderAll();
  }, [canvas]);

  const handlePan = useCallback((delta: { x: number; y: number }) => {
    if (!canvas) return;
    const vpt = canvas.viewportTransform;
    if (vpt) {
      vpt[4] += delta.x;
      vpt[5] += delta.y;
      canvas.renderAll();
    }
  }, [canvas]);

  const handleRotate = useCallback((angle: number) => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + angle);
      canvas?.renderAll();
    }
  }, [canvas]);

  const touchRef = useTouchGestures<HTMLDivElement>({
    onPinch: handlePinch,
    onPan: handlePan,
    onRotate: handleRotate,
  });

  // Bottom sheet configurations
  const bottomSheets: BottomSheet[] = [
    {
      id: 'tools',
      title: 'Tools',
      icon: <Menu className="w-5 h-5" />,
      content: (
        <ToolPalette
          currentTool={currentTool}
          onToolChange={(tool) => {
            setCurrentTool(tool);
            setActiveSheet(null);
          }}
        />
      ),
      height: 'medium',
    },
    {
      id: 'history',
      title: 'History',
      icon: <History className="w-5 h-5" />,
      content: (
        <ActionHistoryPanel
          history={history}
          currentIndex={currentIndex}
          canUndo={currentIndex > 0}
          canRedo={currentIndex < history.length - 1}
          hasUnsavedChanges={false}
          onJumpToIndex={async (index) => {
            // Handle history jump
            return true;
          }}
          onUndo={async () => {
            // Handle undo
            return true;
          }}
          onRedo={async () => {
            // Handle redo
            return true;
          }}
          onClearHistory={() => {
            // Handle clear
          }}
          onMarkSaved={() => {
            // Handle save
          }}
        />
      ),
      height: 'large',
    },
    {
      id: 'layers',
      title: 'Layers',
      icon: <Layers className="w-5 h-5" />,
      content: (
        <div className="p-4">
          <p className="text-sm text-gray-500">Layers panel coming soon...</p>
        </div>
      ),
      height: 'medium',
    },
    {
      id: 'export',
      title: 'Export',
      icon: <Share className="w-5 h-5" />,
      content: (
        <ExportPanel
          projectId={projectId}
          sceneId={sceneId}
          masks={masks}
          layers={[]}
          measurements={[]}
        />
      ),
      height: 'full',
    },
  ];

  // Sheet height configurations
  const sheetHeights = {
    small: 'h-48',
    medium: 'h-96',
    large: 'h-[70vh]',
    full: 'h-[90vh]',
  };

  // Initialize canvas for mobile
  useEffect(() => {
    if (!canvasRef.current || canvas) return;

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 120, // Account for header and toolbar
      backgroundColor: '#f5f5f5',
      selection: true,
      preserveObjectStacking: true,
    });

    // Enable touch events
    newCanvas.allowTouchScrolling = true;
    newCanvas.enableRetinaScaling = true;

    onCanvasReady?.(newCanvas);
  }, [canvas, onCanvasReady]);

  // Handle orientation changes
  useEffect(() => {
    const handleResize = () => {
      if (!canvas) return;
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 120,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [canvas]);

  // Quick access toolbar for common tools
  const quickTools: Array<{ tool: Tool; icon: React.ReactNode }> = [
    { tool: 'select', icon: <span>👆</span> },
    { tool: 'area', icon: <span>📐</span> },
    { tool: 'line', icon: <span>📏</span> },
    { tool: 'polygon', icon: <span>⬟</span> },
    { tool: 'brush', icon: <span>🖌️</span> },
  ];

  if (!isMobile && !isTablet) {
    return null; // Render nothing on desktop, let the regular view handle it
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex-none border-b bg-white z-10">
        <BreadcrumbNavigation
          projectId={projectId}
          projectName="Project"
          sceneId={sceneId}
          sceneName="Scene"
        />
      </div>

      {/* Canvas Container */}
      <div
        ref={touchRef}
        className="flex-1 relative overflow-hidden bg-gray-100"
      >
        <div ref={canvasContainerRef} className="absolute inset-0">
          <canvas ref={canvasRef} />
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="shadow-lg"
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick Access Toolbar */}
        {showQuickToolbar && !activeSheet && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-2 py-1 flex gap-1">
            {quickTools.map(({ tool, icon }) => (
              <Button
                key={tool}
                size="icon"
                variant={currentTool === tool ? 'default' : 'ghost'}
                onClick={() => setCurrentTool(tool)}
                className="w-10 h-10 rounded-full"
              >
                {icon}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex-none border-t bg-white">
        <div className="flex justify-around py-2">
          {bottomSheets.map((sheet) => (
            <Button
              key={sheet.id}
              variant={activeSheet === sheet.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSheet(activeSheet === sheet.id ? null : sheet.id)}
              className="flex flex-col gap-1 h-auto py-2"
            >
              {sheet.icon}
              <span className="text-xs">{sheet.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {activeSheet && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl transform transition-transform duration-300 ${
            activeSheet ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">
              {bottomSheets.find(s => s.id === activeSheet)?.title}
            </h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setActiveSheet(null)}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <div
            className={`overflow-y-auto ${
              sheetHeights[bottomSheets.find(s => s.id === activeSheet)?.height || 'medium']
            }`}
          >
            {bottomSheets.find(s => s.id === activeSheet)?.content}
          </div>
        </div>
      )}

      {/* Gesture Hints */}
      {isMobile && !localStorage.getItem('hideGestureHints') && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
          <p>👆 Tap to select • ✌️ Pinch to zoom • 👆👆 Pan to move</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => localStorage.setItem('hideGestureHints', 'true')}
            className="text-white mt-1"
          >
            Got it
          </Button>
        </div>
      )}
    </div>
  );
}