'use client';

import { useState, useCallback } from 'react';

import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useSceneStore } from '@/stores/useSceneStore';
import { useMaskStore } from '@/stores/useMaskStore';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { useResponsive } from '@/hooks/useResponsive';

import { AnnotationCanvas } from './AnnotationCanvas';
import { CategoryTabs } from './CategoryTabs';
import { QuotaBadge } from './QuotaBadge';
import { SceneUploadZone } from './SceneUploadZone';
import { ThumbnailRail } from './ThumbnailRail';
import { ToolPalette, type ToolType } from './ToolPalette';
import { MaterialPicker } from '@/components/canvas/tools/MaterialPicker';
import { PropertyPanel } from '@/components/canvas/properties/PropertyPanel';
import { ClipboardPanel } from '@/components/canvas/tools/ClipboardPanel';
import { MeasurementPanel } from '@/components/canvas/measurement/MeasurementPanel';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { useSelectionStore } from '@/stores/canvas/useSelectionStore';
import ActionHistoryPanel from '@/components/canvas/ActionHistoryPanel';
import { useAdvancedUndoRedo } from '@/hooks/useAdvancedUndoRedo';
import { ToolCleanup } from '@/components/canvas/tools/ToolCleanup';
import { AnnotationExport } from './AnnotationExport';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { MobileAnnotationView } from './MobileAnnotationView';

export type AnnotationWorkspaceProps = {
  projectId: string;
};

export function AnnotationWorkspace({ projectId }: AnnotationWorkspaceProps) {
  const { hasFeature } = useFeatureGate();
  const { getCurrentScene } = useSceneStore();
  const { selectedObjects } = useSelectionStore();
  const { masks, setLoading: setMaskLoading, setError: setMaskError } = useMaskStore();
  const { toast } = useToast();
  const { mobile, tablet } = useResponsive();
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeCategory, setActiveCategory] = useState<string>('vegetation');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canvasInstance, setCanvasInstance] = useState<any>(null);
  
  // Get current scene
  const currentScene = getCurrentScene();
  
  // Initialize undo/redo system
  const {
    executeCommand,
    undo,
    redo,
    jumpToHistory,
    clearHistory,
    markSaved,
    getHistory,
    canUndo,
    canRedo,
    historyInfo,
    createBranch,
    switchBranch,
    deleteBranch,
    getBranches,
  } = useAdvancedUndoRedo(canvasInstance, {
    maxHistorySize: 100,
    enableBranching: true,
    enablePersistence: true,
    persistenceKey: `terrashaper-history-${projectId}`,
    onHistoryChange: (info) => {
      setHasUnsavedChanges(info.hasUnsavedChanges);
    },
  });
  
  // tRPC mutation for saving masks
  const saveMasksMutation = trpc.mask.save.useMutation({
    onSuccess: () => {
      setHasUnsavedChanges(false);
      markSaved(); // Mark history as saved
      toast({
        title: 'Masks saved',
        description: 'Your annotation masks have been saved successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      setMaskError(error.message);
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save masks. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Save masks callback
  const handleSave = useCallback(async () => {
    if (!currentScene?.id || masks.length === 0) {
      toast({
        title: 'Nothing to save',
        description: 'No masks found to save.',
        variant: 'default',
      });
      return;
    }

    try {
      setMaskLoading(true);
      
      // Filter masks for current scene and prepare for API
      const sceneMasks = masks
        .filter(mask => mask.sceneId === currentScene.id && !mask.deleted)
        .map(mask => ({
          id: mask.id,
          category: mask.category,
          path: mask.path,
          authorId: mask.authorId,
        }));

      await saveMasksMutation.mutateAsync({
        sceneId: currentScene.id,
        masks: sceneMasks,
      });
    } catch (error) {
      // Error handling is done in mutation
    } finally {
      setMaskLoading(false);
    }
  }, [currentScene?.id, masks, saveMasksMutation, setMaskLoading, toast]);
  
  // Check if new annotation system is enabled
  const hasNewAnnotationSystem = hasFeature('newAnnotationSystem');
  
  if (!hasNewAnnotationSystem) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Photo Annotation System
        </h3>
        <p className="text-yellow-700 mb-4">
          The new photo annotation system is available with Professional plans and above.
        </p>
        <button 
          type="button"
          className="rounded-md bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
          onClick={() => window.location.href = '/settings/billing'}
        >
          Upgrade to Access
        </button>
      </div>
    );
  }

  const currentScene = getCurrentScene();

  // Use mobile view for mobile and tablet devices
  if (mobile || tablet) {
    return (
      <MobileAnnotationView
        projectId={projectId}
        sceneId={currentScene?.id || ''}
        canvas={canvasInstance}
        onCanvasReady={setCanvasInstance}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation
        projectId={projectId}
        activeTool={activeTool}
        activeCategory={activeCategory}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Photo Annotation</h1>
            <p className="text-sm text-gray-500">
              Draw and categorize landscape elements
            </p>
          </div>
          <QuotaBadge showDetails={false} />
        </div>
        
        {/* Category Tabs */}
        <div className="mt-4">
          <CategoryTabs 
            onCategoryChange={(category) => {
              setActiveCategory(category);
            }}
          />
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Left sidebar */}
        <div className="w-80 space-y-4">
          {/* Upload zone */}
          <SceneUploadZone 
            projectId={projectId}
            onSceneUploaded={(_scene) => {
              // Scene upload handled by the component
            }}
          />
          
          {/* Scene thumbnails */}
          <ThumbnailRail 
            projectId={projectId}
            onSceneSelect={(_scene) => {
              // Scene selection handled by the component
            }}
          />
          
          {/* Tool Palette */}
          <ToolPalette
            activeTool={activeTool}
            onToolChange={setActiveTool}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
          />
          
          {/* Material Picker - Show when area or line tool is active */}
          {(activeTool === 'area' || activeTool === 'line') && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <MaterialPicker 
                compact={true}
                onMaterialSelect={(material) => {
                  console.log('Material selected:', material);
                  // Material is automatically set in the store
                }}
              />
            </div>
          )}
          
          {/* Measurement Panel - Show when measurement tools are active */}
          {(activeTool === 'distance' || activeTool === 'area-measure') && currentScene && (
            <MeasurementPanel
              canvas={canvasInstance}
              sceneId={currentScene.id}
            />
          )}
          
          {/* Property Panel - Show when objects are selected */}
          {selectedObjects.length > 0 && (
            <PropertyPanel
              canvas={canvasInstance}
              selectedObjects={selectedObjects}
              onObjectUpdate={(object) => {
                console.log('Object updated:', object);
                setHasUnsavedChanges(true);
              }}
              onObjectDelete={(object) => {
                console.log('Object deleted:', object);
                setHasUnsavedChanges(true);
              }}
              onObjectDuplicate={(object) => {
                console.log('Object duplicated:', object);
                setHasUnsavedChanges(true);
              }}
            />
          )}
          
          {/* Clipboard Panel */}
          <ClipboardPanel canvas={canvasInstance} />
          
          {/* Quota details */}
          <QuotaBadge showDetails={true} />
        </div>

        {/* Main canvas area */}
        <div className="flex-1">
          {currentScene ? (
            <CanvasErrorBoundary 
              sceneName={currentScene.filename}
              onReset={() => {
                // Reset canvas state
                setCanvasInstance(null);
                setHasUnsavedChanges(false);
                setActiveTool('select');
              }}
            >
              <AnnotationCanvas 
                activeTool={activeTool}
                onMaskCreated={(_mask) => {
                  // Mask creation handled by the component
                  setHasUnsavedChanges(true);
                }}
                onMaskSelected={(_maskIds) => {
                  // Mask selection handled by the component
                }}
                onCanvasReady={(canvas) => {
                  // Canvas ready for tool interactions
                  setCanvasInstance(canvas);
                }}
                executeCommand={executeCommand}
              />
              
              {/* Tool Cleanup Utility */}
              <ToolCleanup
                canvas={canvasInstance}
                activeTool={activeTool}
                executeCommand={executeCommand}
                cleanupDelay={3000} // 3 seconds for faster cleanup
                onCleanup={(objects) => {
                  console.log('Cleaned up abandoned objects:', objects);
                }}
              />
            </CanvasErrorBoundary>
          ) : (
            <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Scene Selected
                </h3>
                <p className="text-gray-500">
                  Upload your first photo or select an existing scene to start annotating
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right sidebar - History Panel */}
        <div className="w-80 space-y-4">
          {/* Export Annotation */}
          {canvasInstance && currentScene && (
            <AnnotationExport
              canvas={canvasInstance}
              projectId={projectId}
              onExportComplete={(format, url) => {
                console.log(`Exported as ${format}:`, url);
              }}
            />
          )}
          
          {/* Action History Panel */}
          {canvasInstance && (
            <ActionHistoryPanel
              history={getHistory()}
              currentIndex={historyInfo.currentIndex}
              canUndo={canUndo}
              canRedo={canRedo}
              hasUnsavedChanges={hasUnsavedChanges}
              onJumpToIndex={jumpToHistory}
              onUndo={undo}
              onRedo={redo}
              onClearHistory={clearHistory}
              onMarkSaved={markSaved}
              currentBranch={historyInfo.currentBranch}
              branches={getBranches ? getBranches().map(branch => ({
                id: branch.id,
                name: branch.name,
                entries: branch.entries,
              })) : undefined}
              onCreateBranch={createBranch}
              onSwitchBranch={switchBranch}
              onDeleteBranch={deleteBranch}
            />
          )}
        </div>
      </div>
    </div>
  );
}