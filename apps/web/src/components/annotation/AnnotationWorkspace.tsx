'use client';

import { useState } from 'react';

import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useSceneStore } from '@/stores/useSceneStore';

import { CategoryTabs } from './CategoryTabs';
import { QuotaBadge } from './QuotaBadge';
import { SceneBoard } from './SceneBoard';
import { SceneUploadZone } from './SceneUploadZone';
import { ThumbnailRail } from './ThumbnailRail';
import { ToolPalette, type ToolType } from './ToolPalette';

export type AnnotationWorkspaceProps = {
  projectId: string;
};

export function AnnotationWorkspace({ projectId }: AnnotationWorkspaceProps) {
  const { hasFeature } = useFeatureGate();
  const { getCurrentScene } = useSceneStore();
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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

  return (
    <div className="h-full flex flex-col bg-gray-50">
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
            onCategoryChange={(_category) => {
              // Category change handled by the component itself
              // Additional logic can be added here if needed
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
            onSave={() => {
              // TODO: Implement save functionality
              setHasUnsavedChanges(false);
            }}
          />
          
          {/* Quota details */}
          <QuotaBadge showDetails={true} />
        </div>

        {/* Main canvas area */}
        <div className="flex-1">
          {currentScene ? (
            <SceneBoard 
              projectId={projectId}
              width={800}
              height={600}
              onMaskCreated={(_mask) => {
                // Mask creation handled by the component
                setHasUnsavedChanges(true);
              }}
              onMaskSelected={(_maskIds) => {
                // Mask selection handled by the component
              }}
            />
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
      </div>
    </div>
  );
}