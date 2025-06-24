'use client';

// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Image from 'next/image';
import { useSceneStore, type Scene } from '@/stores/useSceneStore';
import { useMaskStore } from '@/stores/useMaskStore';

export interface ThumbnailRailProps {
  projectId: string;
  onSceneSelect?: (scene: Scene) => void;
  onSceneReorder?: (sceneIds: string[]) => void;
}

export function ThumbnailRail({ projectId, onSceneSelect, onSceneReorder }: ThumbnailRailProps) {
  const { 
    getScenesByProject, 
    currentSceneId, 
    setCurrentScene,
    reorderScenes 
  } = useSceneStore();
  
  const { getMasksByScene } = useMaskStore();
  
  const scenes = getScenesByProject(projectId);

  const handleSceneClick = (scene: Scene) => {
    setCurrentScene(scene.id);
    onSceneSelect?.(scene);
  };

  // TODO: Add drag-and-drop reordering when @hello-pangea/dnd is available
  // const handleDragEnd = (result: any) => {
  //   if (!result.destination) return;
  //   const items = Array.from(scenes);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
  //   const sceneIds = items.map(scene => scene.id);
  //   reorderScenes(sceneIds);
  //   onSceneReorder?.(sceneIds);
  // };

  if (scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-500 text-sm">No scenes yet. Upload your first photo to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Scenes</h3>
        <span className="text-xs text-gray-500">{scenes.length} photo{scenes.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="relative flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => handleSceneClick(scene)}
          >
            <div
              className={`
                relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors
                ${
                  currentSceneId === scene.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Image
                src={scene.imageUrl}
                alt={`Scene ${scene.order}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              
              {/* Default scene indicator */}
              {scene.isDefault && (
                <div className="absolute top-1 left-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
              
              {/* Mask count badge */}
              {(() => {
                const maskCount = getMasksByScene(scene.id).length;
                return maskCount > 0 ? (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {maskCount}
                  </div>
                ) : null;
              })()}
            </div>
            
            {/* Scene number/order */}
            <div className="absolute -top-2 -left-2 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
              {scene.order}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}