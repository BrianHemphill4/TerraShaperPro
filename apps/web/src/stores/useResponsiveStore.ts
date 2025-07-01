import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deviceDetector } from '@/lib/deviceCapabilities';

interface ViewportState {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  scale: number;
}

interface LayoutPreferences {
  toolbarPosition: 'top' | 'bottom';
  toolbarVariant: 'full' | 'floating';
  sidebarCollapsed: boolean;
  panelPositions: Record<string, { x: number; y: number }>;
  touchMode: boolean;
  gesturesEnabled: boolean;
  hapticFeedback: boolean;
}

interface ResponsiveState {
  // Device info
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isTouch: boolean;
  viewport: ViewportState;
  
  // Layout preferences
  layoutPreferences: LayoutPreferences;
  
  // UI state
  fullscreenMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Performance
  performanceMode: 'high' | 'medium' | 'low';
  
  // Actions
  updateViewport: (viewport: Partial<ViewportState>) => void;
  updateLayoutPreference: <K extends keyof LayoutPreferences>(
    key: K,
    value: LayoutPreferences[K]
  ) => void;
  setFullscreenMode: (enabled: boolean) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
  detectDevice: () => void;
  resetLayoutPreferences: () => void;
  
  // Layout helpers
  getOptimalLayout: () => {
    showSidebar: boolean;
    showToolbar: boolean;
    toolbarPosition: 'top' | 'bottom';
    toolbarVariant: 'full' | 'floating';
  };
}

const defaultLayoutPreferences: LayoutPreferences = {
  toolbarPosition: 'bottom',
  toolbarVariant: 'full',
  sidebarCollapsed: false,
  panelPositions: {},
  touchMode: false,
  gesturesEnabled: true,
  hapticFeedback: true
};

export const useResponsiveStore = create<ResponsiveState>()(
  persist(
    (set, get) => ({
      // Initial state
      deviceType: 'desktop',
      isTouch: false,
      viewport: {
        width: 1920,
        height: 1080,
        orientation: 'landscape',
        scale: 1
      },
      layoutPreferences: defaultLayoutPreferences,
      fullscreenMode: false,
      reducedMotion: false,
      highContrast: false,
      performanceMode: 'high',

      // Actions
      updateViewport: (viewport) => set((state) => ({
        viewport: { ...state.viewport, ...viewport }
      })),

      updateLayoutPreference: (key, value) => set((state) => ({
        layoutPreferences: {
          ...state.layoutPreferences,
          [key]: value
        }
      })),

      setFullscreenMode: (enabled) => {
        set({ fullscreenMode: enabled });
        
        if (enabled) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },

      setPerformanceMode: (mode) => set({ performanceMode: mode }),

      detectDevice: () => {
        const caps = deviceDetector.getCapabilities();
        const profile = deviceDetector.getPerformanceProfile();
        
        let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
        
        if (deviceDetector.isMobile()) {
          deviceType = 'mobile';
        } else if (deviceDetector.isTablet()) {
          deviceType = 'tablet';
        }

        set({
          deviceType,
          isTouch: caps.touch,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            scale: window.devicePixelRatio || 1
          },
          performanceMode: profile.name,
          reducedMotion: caps.performance.reducedMotion,
          layoutPreferences: {
            ...get().layoutPreferences,
            touchMode: caps.touch,
            // Auto-adjust layout for mobile
            ...(deviceType === 'mobile' ? {
              toolbarVariant: 'floating',
              sidebarCollapsed: true
            } : {}),
            // Auto-adjust for tablet
            ...(deviceType === 'tablet' ? {
              toolbarVariant: 'full',
              sidebarCollapsed: get().viewport.orientation === 'portrait'
            } : {})
          }
        });
      },

      resetLayoutPreferences: () => set({
        layoutPreferences: defaultLayoutPreferences
      }),

      getOptimalLayout: () => {
        const state = get();
        const { deviceType, viewport, layoutPreferences } = state;

        // Mobile layout
        if (deviceType === 'mobile') {
          return {
            showSidebar: false,
            showToolbar: true,
            toolbarPosition: layoutPreferences.toolbarPosition,
            toolbarVariant: viewport.orientation === 'landscape' ? 'floating' : 'full'
          };
        }

        // Tablet layout
        if (deviceType === 'tablet') {
          return {
            showSidebar: viewport.orientation === 'landscape' && !layoutPreferences.sidebarCollapsed,
            showToolbar: true,
            toolbarPosition: layoutPreferences.toolbarPosition,
            toolbarVariant: layoutPreferences.toolbarVariant
          };
        }

        // Desktop layout
        return {
          showSidebar: !layoutPreferences.sidebarCollapsed,
          showToolbar: true,
          toolbarPosition: 'top',
          toolbarVariant: 'full'
        };
      }
    }),
    {
      name: 'responsive-layout',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        layoutPreferences: state.layoutPreferences,
        performanceMode: state.performanceMode
      })
    }
  )
);

// Helper hooks
export function useDeviceType() {
  return useResponsiveStore((state) => state.deviceType);
}

export function useIsTouch() {
  return useResponsiveStore((state) => state.isTouch);
}

export function useViewport() {
  return useResponsiveStore((state) => state.viewport);
}

export function useLayoutPreferences() {
  return useResponsiveStore((state) => state.layoutPreferences);
}

export function useOptimalLayout() {
  return useResponsiveStore((state) => state.getOptimalLayout());
}

// Auto-detect device on mount and window resize
if (typeof window !== 'undefined') {
  // Initial detection
  useResponsiveStore.getState().detectDevice();

  // Update on resize
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      useResponsiveStore.getState().updateViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      });
    }, 100);
  });

  // Update on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      useResponsiveStore.getState().detectDevice();
    }, 100);
  });

  // Update on fullscreen change
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    useResponsiveStore.setState({ fullscreenMode: isFullscreen });
  });
}