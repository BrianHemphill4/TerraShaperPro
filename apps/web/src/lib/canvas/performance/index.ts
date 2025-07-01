/**
 * Performance Optimization Module
 * Central export for all performance-related utilities
 */

// Object pooling
export {
  ObjectPool,
  Point,
  Rectangle,
  Transform,
  pointPool,
  rectanglePool,
  transformPool,
  withPooledObject,
  poolMonitor,
  type Poolable
} from './objectPool';

// Viewport culling
export {
  ViewportCuller,
  createViewportCuller,
  CullingMetrics,
  type Cullable,
  type Viewport
} from './viewportCuller';

// Dirty rectangle tracking
export {
  DirtyRectangleTracker,
  CanvasRenderOptimizer,
  type DirtyRegion
} from './dirtyRectangleTracker';

// Level of Detail
export {
  LODManager,
  DetailLevel,
  createLODObject,
  SimpleLODRenderer,
  type LODObject,
  type LODConfig
} from './lodManager';

// State optimization
export {
  useDebouncedState,
  StateUpdateBatcher,
  useShallowStore,
  useStoreSubscription,
  createMemoizedSelector,
  StateCompressor,
  memoizeComponent,
  useSelectiveUpdate,
  createStateDiff,
  immutableUpdate
} from './stateOptimizer';

// Memory management
export {
  MemoryManager,
  memoryManager,
  useMemoryMonitor,
  MemoryAwareImageLoader,
  type MemoryStats,
  type MemoryConfig
} from './memoryManager';

// Re-export performance monitor hook
export { usePerformanceMonitor, PerformanceMonitor } from '../../../hooks/usePerformanceMonitor';
export type { PerformanceMetrics, PerformanceThresholds } from '../../../hooks/usePerformanceMonitor';

/**
 * Performance optimization presets
 */
export const PerformancePresets = {
  // High performance mode - maximum quality
  high: {
    viewport: { cullPadding: 100 },
    dirtyRect: { mergeThreshold: 0.2, maxRegions: 15 },
    lod: {
      highDetailThreshold: 1.2,
      mediumDetailThreshold: 0.4,
      lowDetailThreshold: 0.05,
      performanceMode: false
    },
    memory: {
      warningThreshold: 80,
      criticalThreshold: 90,
      maxTextureSize: 100 * 1024 * 1024,
      maxCacheSize: 200 * 1024 * 1024
    }
  },

  // Balanced mode - good quality with performance
  balanced: {
    viewport: { cullPadding: 50 },
    dirtyRect: { mergeThreshold: 0.3, maxRegions: 10 },
    lod: {
      highDetailThreshold: 1.5,
      mediumDetailThreshold: 0.5,
      lowDetailThreshold: 0.1,
      performanceMode: false
    },
    memory: {
      warningThreshold: 70,
      criticalThreshold: 85,
      maxTextureSize: 50 * 1024 * 1024,
      maxCacheSize: 100 * 1024 * 1024
    }
  },

  // Low performance mode - prioritize speed
  low: {
    viewport: { cullPadding: 20 },
    dirtyRect: { mergeThreshold: 0.5, maxRegions: 5 },
    lod: {
      highDetailThreshold: 2.0,
      mediumDetailThreshold: 0.8,
      lowDetailThreshold: 0.2,
      performanceMode: true
    },
    memory: {
      warningThreshold: 60,
      criticalThreshold: 75,
      maxTextureSize: 20 * 1024 * 1024,
      maxCacheSize: 50 * 1024 * 1024
    }
  },

  // Mobile preset
  mobile: {
    viewport: { cullPadding: 30 },
    dirtyRect: { mergeThreshold: 0.4, maxRegions: 7 },
    lod: {
      highDetailThreshold: 1.8,
      mediumDetailThreshold: 0.6,
      lowDetailThreshold: 0.15,
      performanceMode: true
    },
    memory: {
      warningThreshold: 65,
      criticalThreshold: 80,
      maxTextureSize: 30 * 1024 * 1024,
      maxCacheSize: 75 * 1024 * 1024
    }
  }
};