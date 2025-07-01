'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useProjectStore } from '@/stores/useProjectStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { useLayerStore } from '@/stores/useLayerStore';

interface BreadcrumbNavigationProps {
  projectId: string;
  activeTool?: string;
  activeCategory?: string;
}

export const BreadcrumbNavigation = ({
  projectId,
  activeTool,
  activeCategory,
}: BreadcrumbNavigationProps) => {
  const router = useRouter();
  const { projects } = useProjectStore();
  const { getCurrentScene } = useSceneStore();
  const { activeLayer, layers } = useLayerStore();

  const currentProject = useMemo(
    () => projects.find(p => p.id === projectId),
    [projects, projectId]
  );

  const currentScene = getCurrentScene();
  const currentLayer = useMemo(
    () => layers.find(l => l.id === activeLayer),
    [layers, activeLayer]
  );

  // Build breadcrumb items
  const breadcrumbs = useMemo(() => {
    const items = [];

    // Home/Projects link
    items.push({
      label: 'Projects',
      href: '/projects',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" />
          <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" />
        </svg>
      ),
    });

    // Current project
    if (currentProject) {
      items.push({
        label: currentProject.name,
        href: `/project/${projectId}`,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeWidth="2" />
          </svg>
        ),
      });
    }

    // Current scene
    if (currentScene) {
      items.push({
        label: currentScene.filename || 'Untitled Scene',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <polyline points="21 15 16 10 5 21" strokeWidth="2" />
          </svg>
        ),
      });
    }

    // Current layer
    if (currentLayer) {
      items.push({
        label: currentLayer.name,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" />
          </svg>
        ),
      });
    }

    return items;
  }, [currentProject, currentScene, currentLayer, projectId]);

  // Tool and category info
  const toolInfo = useMemo(() => {
    if (!activeTool) return null;

    const toolIcons: Record<string, JSX.Element> = {
      select: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" strokeWidth="2" />
        </svg>
      ),
      area: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
        </svg>
      ),
      line: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
        </svg>
      ),
      polygon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="12 2 2 7 2 17 12 22 22 17 22 7" strokeWidth="2" />
        </svg>
      ),
      brush: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11l6-6m-5.5.5l5 5" strokeWidth="2" strokeLinecap="round" />
          <path d="M14.5 14.5L19 19" strokeWidth="2" strokeLinecap="round" />
          <circle cx="5" cy="19" r="2" strokeWidth="2" />
        </svg>
      ),
      distance: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
          <line x1="4" y1="8" x2="4" y2="16" strokeWidth="2" />
          <line x1="20" y1="8" x2="20" y2="16" strokeWidth="2" />
        </svg>
      ),
      'area-measure': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="5" y="5" width="14" height="14" strokeWidth="2" />
          <line x1="9" y1="5" x2="9" y2="19" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="15" y1="5" x2="15" y2="19" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      ),
    };

    return {
      icon: toolIcons[activeTool] || toolIcons.select,
      label: activeTool.charAt(0).toUpperCase() + activeTool.slice(1).replace('-', ' '),
    };
  }, [activeTool]);

  return (
    <nav className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 text-sm">
      {/* Breadcrumb Items */}
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-gray-400"
            >
              <polyline points="9 18 15 12 9 6" strokeWidth="2" />
            </svg>
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-gray-400">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-900 font-medium">
              <span className="text-gray-600">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )}
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Active Tool & Category */}
      {toolInfo && (
        <div className="flex items-center gap-3">
          {activeCategory && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs">
              <span className="font-medium">Category:</span>
              <span className="text-gray-600">{activeCategory}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <span className="text-blue-600">{toolInfo.icon}</span>
            <span className="font-medium">{toolInfo.label}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" />
            <polyline points="12 19 5 12 12 5" strokeWidth="2" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="All projects"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default BreadcrumbNavigation;