# TerraShaper Pro: Canvas to Photo Annotation System Migration Guide

## Overview

This document provides a comprehensive guide for migrating TerraShaper Pro from a design canvas system to a photo annotation system. It includes 120 detailed tasks organized in optimal sequence for implementation.

## Change Log Framework

Every change must be documented using this format:

```markdown
## [Task-XXX] Component/Feature Name
**Date**: YYYY-MM-DD
**Type**: Feature | Refactor | Migration | Removal
**Files Modified**: 
- path/to/file1.tsx
- path/to/file2.ts

**Description**: 
What was changed and how it was implemented.

**Rationale**: 
Why this change was necessary and what problem it solves.

**Breaking Changes**: 
List any breaking changes that affect other components.

**Testing**: 
How to verify this change works correctly.
```

---

## Implementation Tasks (Sequential Order)

### Phase 1: Database Schema & Models (Tasks 1-15)

#### Task 1: Create Database Migration for Scene Model
**Action**: Create a new migration file to add the `scenes` table.
```sql
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  image_url TEXT NOT NULL,
  order INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
**Rationale**: We need a table to store multiple photo scenes per project instead of a single canvas.

#### Task 2: Create Database Migration for Masks Model
**Action**: Create migration for the `masks` table.
```sql
CREATE TABLE masks (
  id UUID PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id),
  category VARCHAR(50) NOT NULL,
  path JSONB NOT NULL, -- GeoJSON format
  deleted BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```
**Rationale**: Masks replace canvas objects as the primary annotation method.

#### Task 3: Add Quota Fields to Users/Organizations
**Action**: Create migration to add quota tracking fields.
```sql
ALTER TABLE organizations ADD COLUMN render_quota INTEGER DEFAULT 20;
ALTER TABLE organizations ADD COLUMN render_quota_used INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN quota_refresh_date DATE;
```
**Rationale**: Track render usage and limits at the account level.

#### Task 4: Update Projects Table Schema
**Action**: Modify projects table to remove canvas and add address.
```sql
ALTER TABLE projects DROP COLUMN canvas_data;
ALTER TABLE projects ADD COLUMN address TEXT;
ALTER TABLE projects ADD COLUMN metadata JSONB DEFAULT '{}';
```
**Rationale**: Projects now represent address-specific jobs, not design canvases.

#### Task 5: Update Renders Table for Scene Association
**Action**: Modify renders to link to scenes instead of projects.
```sql
ALTER TABLE renders DROP COLUMN project_id;
ALTER TABLE renders ADD COLUMN scene_id UUID REFERENCES scenes(id);
ALTER TABLE renders ADD COLUMN resolution VARCHAR(20) DEFAULT '4K';
```
**Rationale**: Each render is now tied to a specific scene photo.

#### Task 6: Create Scene TypeScript Model
**Action**: Create `packages/db/src/schema/scene.ts`
```typescript
import { boolean, integer, pgTable, text, timestamp,uuid } from 'drizzle-orm/pg-core';

export const scenes = pgTable('scenes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  imageUrl: text('image_url').notNull(),
  order: integer('order').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
```
**Rationale**: TypeScript model ensures type safety throughout the application.

#### Task 7: Create Mask TypeScript Model
**Action**: Create `packages/db/src/schema/mask.ts`
```typescript
export const masks = pgTable('masks', {
  id: uuid('id').defaultRandom().primaryKey(),
  sceneId: uuid('scene_id').references(() => scenes.id),
  category: varchar('category', { length: 50 }).notNull(),
  path: jsonb('path').notNull(), // GeoJSON
  deleted: boolean('deleted').default(false),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
});
```
**Rationale**: Type-safe mask model for annotation data.

#### Task 8: Create Quota Service
**Action**: Create `packages/shared/src/services/quota.service.ts`
```typescript
export class QuotaService {
  async checkQuota(organizationId: string): Promise<{remaining: number, total: number}> {
    // Implementation
  }
  
  async consumeQuota(organizationId: string, amount: number = 1): Promise<boolean> {
    // Implementation
  }
  
  async refreshQuotaIfNeeded(organizationId: string): Promise<void> {
    // Check if quota_refresh_date has passed
  }
}
```
**Rationale**: Centralized quota management across the application.

#### Task 9: Remove Old Canvas Types
**Action**: Delete `apps/web/src/types/canvas.d.ts` and related canvas type definitions.
**Rationale**: Prevent confusion by removing obsolete type definitions.

#### Task 10: Update Project Types
**Action**: Modify `packages/shared/src/types/project.ts`
```typescript
export type Project = {
  id: string;
  name: string;
  address: string; // New field
  scenes: Scene[]; // Replaces canvas
  metadata: ProjectMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```
**Rationale**: Align TypeScript types with new database schema.

#### Task 11: Create Scene Service
**Action**: Create `packages/shared/src/services/scene.service.ts`
```typescript
export class SceneService {
  async createScene(projectId: string, imageFile: File): Promise<Scene> {
    // Validate image dimensions (≥1500×1000px)
    // Upload to storage
    // Create database record
  }
  
  async reorderScenes(projectId: string, sceneOrder: string[]): Promise<void> {
    // Update order field for all scenes
  }
  
  async deleteScene(sceneId: string): Promise<void> {
    // Soft delete scene and associated masks
  }
}
```
**Rationale**: Encapsulate scene management logic.

#### Task 12: Create Mask Service
**Action**: Create `packages/shared/src/services/mask.service.ts`
```typescript
export class MaskService {
  async saveMasks(sceneId: string, masks: MaskData[]): Promise<void> {
    // Batch save masks with diff tracking
  }
  
  async getMasksByCategory(sceneId: string, category: string): Promise<Mask[]> {
    // Retrieve filtered masks
  }
  
  async softDeleteMask(maskId: string): Promise<void> {
    // Set deleted flag to true
  }
}
```
**Rationale**: Handle mask CRUD operations.

#### Task 13: Create Migration Script for Existing Data
**Action**: Create `scripts/migrate-canvas-to-scenes.ts`
```typescript
// Script to convert existing canvas data to scenes
// 1. For each project with canvas data
// 2. Create a default scene
// 3. Convert canvas objects to masks
// 4. Preserve render associations
```
**Rationale**: Ensure existing user data is preserved during migration.

#### Task 14: Update Database Indexes
**Action**: Add performance indexes
```sql
CREATE INDEX idx_scenes_project_id ON scenes(project_id);
CREATE INDEX idx_masks_scene_id ON masks(scene_id);
CREATE INDEX idx_masks_category ON masks(category);
CREATE INDEX idx_renders_scene_id ON renders(scene_id);
```
**Rationale**: Optimize query performance for common operations.

#### Task 15: Create Database Seed Data
**Action**: Update `packages/db/src/seed.ts` with sample scenes and masks
**Rationale**: Provide test data for development.

---

### Phase 2: API Routes & Backend (Tasks 16-35)

#### Task 16: Create Scene Upload Endpoint
**Action**: Create `apps/api-gateway/src/routers/scene.router.ts`
```typescript
export const sceneRouter = router({
  upload: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      imageFile: z.any() // Handle file upload
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate file type and dimensions
      // Upload to storage
      // Create scene record
    })
});
```
**Rationale**: Handle scene photo uploads with validation.

#### Task 17: Create Scene Reorder Endpoint
**Action**: Add to scene router
```typescript
reorder: protectedProcedure
  .input(z.object({
    projectId: z.string(),
    sceneIds: z.array(z.string())
  }))
  .mutation(async ({ input }) => {
    // Update order field for each scene
  })
```
**Rationale**: Support drag-and-drop reordering in UI.

#### Task 18: Create Mask Save Endpoint
**Action**: Create `apps/api-gateway/src/routers/mask.router.ts`
```typescript
save: protectedProcedure
  .input(z.object({
    sceneId: z.string(),
    masks: z.array(maskSchema)
  }))
  .mutation(async ({ input, ctx }) => {
    // Generate diff from previous state
    // Save masks with author tracking
    // Trigger autosave notification
  })
```
**Rationale**: Handle mask persistence with diff tracking.

#### Task 19: Create Mask History Endpoint
**Action**: Add to mask router
```typescript
history: protectedProcedure
  .input(z.object({ sceneId: z.string() }))
  .query(async ({ input }) => {
    // Retrieve revision history
    // Generate diff thumbnails
  })
```
**Rationale**: Support visual history panel.

#### Task 20: Create Export Endpoints
**Action**: Add export functionality
```typescript
exportGeoJSON: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ input }) => {
    // Compile all masks as GeoJSON
    // Return as downloadable file
  }),

exportSprite: protectedProcedure
  .input(z.object({ sceneId: z.string() }))
  .query(async ({ input }) => {
    // Generate PNG sprite sheet
  })
```
**Rationale**: Support various export formats for renders.

#### Task 21: Update Render Creation Endpoint
**Action**: Modify `apps/api-gateway/src/routers/render.router.ts`
```typescript
create: protectedProcedure
  .input(z.object({
    sceneId: z.string(), // Changed from projectId
    // ... rest of input
  }))
```
**Rationale**: Renders now associate with scenes.

#### Task 22: Add Quota Check Middleware
**Action**: Create `apps/api-gateway/src/middleware/quota.ts`
```typescript
export async function checkRenderQuota(ctx: Context) {
  const quota = await quotaService.checkQuota(ctx.session.organizationId);
  if (quota.remaining <= 0) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Render quota exceeded'
    });
  }
}
```
**Rationale**: Enforce quota limits before render creation.

#### Task 23: Create WebSocket Events for Quota
**Action**: Add to WebSocket server
```typescript
// Emit quota updates
ws.emit('quota.updated', {
  organizationId,
  remaining: 17,
  total: 20
});
```
**Rationale**: Real-time quota sync across tabs.

#### Task 24: Remove Old Canvas Endpoints
**Action**: Delete canvas-related routes from API
- Remove `/api/canvas/save`
- Remove `/api/canvas/export`
- Remove canvas references in project router
**Rationale**: Clean up obsolete endpoints.

#### Task 25: Add File Upload Validation
**Action**: Create `apps/api-gateway/src/lib/upload-validation.ts`
```typescript
export function validateSceneImage(file: File) {
  // Check file type (JPEG/PNG)
  // Check file size (≤15MB)
  // Check dimensions (≥1500×1000px)
  return { valid: boolean, error?: string };
}
```
**Rationale**: Ensure uploaded images meet requirements.

#### Task 26: Implement Streaming ZIP Download
**Action**: Add to export router
```typescript
downloadAllRenders: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ input, ctx }) => {
    // Stream ZIP file creation
    // Include all scene renders
  })
```
**Rationale**: Efficient download of multiple large files.

#### Task 27: Add Mask Merge Endpoint
**Action**: Handle concurrent edits
```typescript
mergeMasks: protectedProcedure
  .input(z.object({
    sceneId: z.string(),
    localMasks: z.array(maskSchema),
    tabId: z.string()
  }))
  .mutation(async ({ input }) => {
    // Detect conflicts
    // Return merge strategy
  })
```
**Rationale**: Support multi-tab editing safety.

#### Task 28: Create Category Management Endpoints
**Action**: Add category operations
```typescript
renameCategory: protectedProcedure
  .input(z.object({
    oldName: z.string(),
    newName: z.string()
  }))
```
**Rationale**: Support category customization.

#### Task 29: Add Performance Metrics Endpoint
**Action**: Track rendering performance
```typescript
metrics: protectedProcedure
  .query(async () => {
    // Return performance data
    // Frame rates, render times
  })
```
**Rationale**: Monitor application performance.

#### Task 30: Update Authentication Middleware
**Action**: Add scene-level permissions
```typescript
export async function checkSceneAccess(sceneId: string, userId: string) {
  // Verify user has access to scene's project
}
```
**Rationale**: Secure scene access.

#### Task 31: Create Revision Storage System
**Action**: Implement diff storage
```typescript
export class RevisionService {
  async createRevision(sceneId: string, masks: Mask[], authorId: string) {
    // Generate diff from previous state
    // Store compressed diff
    // Create thumbnail preview
  }
}
```
**Rationale**: Efficient history storage.

#### Task 32: Add Image Processing Pipeline
**Action**: Create `apps/api-gateway/src/lib/image-processing.ts`
```typescript
export async function processSceneImage(file: File) {
  // Generate thumbnails
  // Create blur placeholder
  // Optimize for web
}
```
**Rationale**: Optimize images for performance.

#### Task 33: Implement Autosave Queue
**Action**: Create background job for autosaves
```typescript
export class AutosaveQueue {
  async addToQueue(sceneId: string, masks: Mask[]) {
    // Debounce saves
    // Batch operations
  }
}
```
**Rationale**: Prevent excessive database writes.

#### Task 34: Create Data Export Service
**Action**: Handle various export formats
```typescript
export class ExportService {
  async exportAsGeoJSON(masks: Mask[]): Promise<string> {}
  async exportAsPNG(scene: Scene, masks: Mask[]): Promise<Buffer> {}
  async exportAsSprite(masks: Mask[]): Promise<Buffer> {}
}
```
**Rationale**: Centralize export logic.

#### Task 35: Add Error Recovery Endpoints
**Action**: Handle failed operations
```typescript
recoverAutosave: protectedProcedure
  .input(z.object({ sceneId: z.string() }))
  .query(async ({ input }) => {
    // Retrieve last autosave
    // Return recovery data
  })
```
**Rationale**: Prevent data loss from crashes.

---

### Phase 3: Frontend Components - Core UI (Tasks 36-60)

#### Task 36: Create SceneBoard Layout Component
**Action**: Create `apps/web/src/components/scene/SceneBoard.tsx`
```typescript
export function SceneBoard({ projectId }: { projectId: string }) {
  return (
    <div className="flex h-full">
      <ThumbnailRail projectId={projectId} />
      <AnnotationWorkspace />
    </div>
  );
}
```
**Rationale**: Main container for new photo annotation interface.

#### Task 37: Create ThumbnailRail Component
**Action**: Create `apps/web/src/components/scene/ThumbnailRail.tsx`
```typescript
export function ThumbnailRail({ projectId }: { projectId: string }) {
  // Fixed 140px width
  // Vertical scrolling
  // Drag-and-drop reordering
}
```
**Rationale**: Scene navigation and management.

#### Task 38: Create SceneThumbnail Component
**Action**: Create `apps/web/src/components/scene/SceneThumbnail.tsx`
```typescript
export function SceneThumbnail({ scene, isActive }: Props) {
  // 112×80px rounded corners
  // 2px primary outline when active
  // Hover toolbar with actions
}
```
**Rationale**: Individual scene representation.

#### Task 39: Create SceneUploadZone Component
**Action**: Create `apps/web/src/components/scene/SceneUploadZone.tsx`
```typescript
export function SceneUploadZone({ onUpload }: Props) {
  // Drag-and-drop support
  // File validation
  // Progress indication
}
```
**Rationale**: Handle new scene uploads.

#### Task 40: Create QuotaBadge Component
**Action**: Create `apps/web/src/components/quota/QuotaBadge.tsx`
```typescript
export function QuotaBadge() {
  const { data } = trpc.quota.current.useQuery();
  // WebSocket subscription
  // Color states (normal/warning/critical)
  // WCAG compliant colors
}
```
**Rationale**: Display render quota status.

#### Task 41: Create CategoryTabs Component
**Action**: Create `apps/web/src/components/annotation/CategoryTabs.tsx`
```typescript
export function CategoryTabs({ activeCategory, onChange }: Props) {
  const categories = ['Plants & Trees', 'Mulch & Rocks', 'Hardscape', 'Other'];
  // Tab navigation
  // Pill counters
  // Keyboard shortcuts
}
```
**Rationale**: Organize masks by material type.

#### Task 42: Create ToolPalette Component
**Action**: Create `apps/web/src/components/annotation/ToolPalette.tsx`
```typescript
export function ToolPalette({ activeTool, onChange }: Props) {
  // Vertical layout
  // Icon-only on mobile
  // Tool descriptions
}
```
**Rationale**: Replace horizontal toolbar with vertical palette.

#### Task 43: Refactor Canvas for Photo Annotation
**Action**: Create `apps/web/src/components/annotation/AnnotationCanvas.tsx`
```typescript
export function AnnotationCanvas({ scene }: { scene: Scene }) {
  // Load scene image as background
  // Initialize at native resolution
  // Scale by devicePixelRatio
}
```
**Rationale**: Transform design canvas to photo annotation system.

#### Task 44: Create MaskLayer Class
**Action**: Create `apps/web/src/lib/canvas/MaskLayer.ts`
```typescript
export class MaskLayer extends fabric.Object {
  category: string;
  deleted: boolean;
  
  constructor(path: any, options: any) {
    // Custom mask implementation
  }
}
```
**Rationale**: Specialized Fabric.js object for masks.

#### Task 45: Create BrushTool Implementation
**Action**: Create `apps/web/src/lib/canvas/tools/BrushTool.ts`
```typescript
export class BrushTool {
  private pressure: number = 1;
  private smoothing: boolean = true;
  
  onMouseDown(e: fabric.IEvent) {
    // Start brush stroke
    // Apply pressure if available
  }
}
```
**Rationale**: Pressure-sensitive mask creation.

#### Task 46: Create HistoryPanel Component
**Action**: Create `apps/web/src/components/annotation/HistoryPanel.tsx`
```typescript
export function HistoryPanel({ sceneId }: Props) {
  // Chronological edit list
  // Diff thumbnails
  // Restore functionality
}
```
**Rationale**: Visual revision history.

#### Task 47: Remove Old DesignCanvas Component
**Action**: Delete `apps/web/src/components/canvas/DesignCanvas.tsx`
**Rationale**: Prevent confusion with obsolete component.

#### Task 48: Remove Old Canvas Support Files
**Action**: Delete these files:
- `AssetPalette.tsx` (replaced by category system)
- `MaterialSelector.tsx` (integrated into categories)
- `ExportPanel.tsx` (replaced by new export system)
**Rationale**: Clean up obsolete UI components.

#### Task 49: Create Breadcrumb Component
**Action**: Create `apps/web/src/components/ui/Breadcrumb.tsx`
```typescript
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  // Projects > ProjectName > Scene Board
  // Responsive truncation
}
```
**Rationale**: Improve navigation context.

#### Task 50: Create DiffThumbnail Component
**Action**: Create `apps/web/src/components/annotation/DiffThumbnail.tsx`
```typescript
export function DiffThumbnail({ before, after }: Props) {
  // 56×40px preview
  // Red/green overlay
  // Performant rendering
}
```
**Rationale**: Visualize changes in history.

#### Task 51: Update Project Card Component
**Action**: Modify `apps/web/src/components/projects/ProjectCard.tsx`
- Change CTA from "Edit Design" to "Open Project"
- Add scene count indicator
- Show primary scene thumbnail
**Rationale**: Reflect new project structure.

#### Task 52: Create Mobile Carousel Component
**Action**: Create `apps/web/src/components/scene/SceneCarousel.tsx`
```typescript
export function SceneCarousel({ scenes }: Props) {
  // Horizontal scrolling
  // Touch gestures
  // Current indicator
}
```
**Rationale**: Mobile-optimized scene navigation.

#### Task 53: Implement Responsive Layouts
**Action**: Create responsive container components
```typescript
// Create breakpoint-aware layouts
// CSS Grid for mobile
// Flexbox for desktop
```
**Rationale**: Optimal experience across devices.

#### Task 54: Create Loading States
**Action**: Create skeleton components
```typescript
export function SceneSkeleton() {
  // Shimmer effect
  // Accurate dimensions
}
```
**Rationale**: Perceived performance improvement.

#### Task 55: Create Empty States
**Action**: Design empty state components
```typescript
export function EmptySceneBoard() {
  // Illustration
  // Clear CTA
  // Help text
}
```
**Rationale**: Guide users when no content exists.

#### Task 56: Create Merge Conflict Dialog
**Action**: Create `apps/web/src/components/annotation/MergeDialog.tsx`
```typescript
export function MergeDialog({ localMasks, remoteMasks }: Props) {
  // Visual comparison
  // Resolution options
  // Merge/overwrite/cancel
}
```
**Rationale**: Handle concurrent edits gracefully.

#### Task 57: Create Keyboard Shortcut Overlay
**Action**: Create help overlay component
```typescript
export function ShortcutHelp() {
  // Tool shortcuts
  // Navigation keys
  // Dismissible
}
```
**Rationale**: Improve discoverability.

#### Task 58: Create Toast Notifications
**Action**: Implement toast system for feedback
```typescript
export function showToast(message: string, type: 'success' | 'error' | 'info') {
  // Auto-dismiss
  // Stacking behavior
  // Action buttons
}
```
**Rationale**: Consistent user feedback.

#### Task 59: Create Performance Monitor
**Action**: Add performance tracking UI
```typescript
export function PerformanceMonitor() {
  // FPS counter
  // Memory usage
  // Dev mode only
}
```
**Rationale**: Debug performance issues.

#### Task 60: Create Accessibility Announcer
**Action**: Implement screen reader announcements
```typescript
export function announce(message: string, priority: 'polite' | 'assertive') {
  // ARIA live region
  // Queue management
}
```
**Rationale**: Improve screen reader experience.

---

### Phase 4: State Management & Hooks (Tasks 61-75)

#### Task 61: Create Scene Store
**Action**: Create `apps/web/src/stores/scene.store.ts`
```typescript
export const useSceneStore = create((set) => ({
  scenes: [],
  activeSceneId: null,
  setActiveScene: (id: string) => set({ activeSceneId: id }),
  reorderScenes: (sceneIds: string[]) => set((state) => {
    // Reorder logic
  })
}));
```
**Rationale**: Manage scene state across components.

#### Task 62: Create Mask Store
**Action**: Create `apps/web/src/stores/mask.store.ts`
```typescript
export const useMaskStore = create((set) => ({
  masks: {},
  selectedMaskId: null,
  addMask: (sceneId: string, mask: Mask) => set((state) => {
    // Add mask to scene
  }),
  updateMask: (maskId: string, updates: Partial<Mask>) => set((state) => {
    // Update mask properties
  })
}));
```
**Rationale**: Centralized mask state management.

#### Task 63: Create History Store
**Action**: Create `apps/web/src/stores/history.store.ts`
```typescript
export const useHistoryStore = create((set) => ({
  history: [],
  currentIndex: -1,
  addRevision: (revision: Revision) => set((state) => {
    // Add to history
    // Limit to 20 entries
  }),
  undo: () => set((state) => {
    // Restore previous state
  }),
  redo: () => set((state) => {
    // Restore next state
  })
}));
```
**Rationale**: Manage undo/redo functionality.

#### Task 64: Create Autosave Hook
**Action**: Create `apps/web/src/hooks/useAutosave.ts`
```typescript
export function useAutosave(sceneId: string, masks: Mask[]) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Save masks
      // Show toast
    }, 60000); // 60 seconds
    
    return () => clearTimeout(timer);
  }, [masks]);
}
```
**Rationale**: Automatic draft saving.

#### Task 65: Create WebSocket Hook
**Action**: Create `apps/web/src/hooks/useQuotaSocket.ts`
```typescript
export function useQuotaSocket() {
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.on('quota.updated', (data) => {
      // Update quota store
    });
    
    return () => ws.close();
  }, []);
}
```
**Rationale**: Real-time quota updates.

#### Task 66: Create Scene Upload Hook
**Action**: Create `apps/web/src/hooks/useSceneUpload.ts`
```typescript
export function useSceneUpload(projectId: string) {
  const uploadMutation = trpc.scene.upload.useMutation();
  
  const upload = useCallback(async (file: File) => {
    // Validate file
    // Show progress
    // Handle errors
  }, []);
  
  return { upload, isUploading: uploadMutation.isLoading };
}
```
**Rationale**: Encapsulate upload logic.

#### Task 67: Create Keyboard Navigation Hook
**Action**: Create `apps/web/src/hooks/useKeyboardNav.ts`
```typescript
export function useKeyboardNav() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool switching (M, B, P, S)
      // Tab navigation (Alt + arrows)
      // Save (Cmd + S)
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```
**Rationale**: Centralize keyboard handling.

#### Task 68: Create Touch Gesture Hook
**Action**: Create `apps/web/src/hooks/useTouchGestures.ts`
```typescript
export function useTouchGestures(element: HTMLElement) {
  useEffect(() => {
    let touchStart: Touch;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Track start position
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Handle pan/zoom
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
  }, [element]);
}
```
**Rationale**: Mobile interaction support.

#### Task 69: Create Drag and Drop Hook
**Action**: Create `apps/web/src/hooks/useDragDrop.ts`
```typescript
export function useDragDrop(onReorder: (items: string[]) => void) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 600, // Long press
      }
    })
  );
  
  return { sensors };
}
```
**Rationale**: Unified drag-drop handling.

#### Task 70: Remove Old Canvas Hooks
**Action**: Delete obsolete hooks:
- `useCanvas.ts`
- `useCanvasObjects.ts`
- `useDrawingMode.ts`
**Rationale**: Clean up unused code.

#### Task 71: Create Performance Monitoring Hook
**Action**: Create `apps/web/src/hooks/usePerformance.ts`
```typescript
export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(frames);
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }, []);
  
  return { fps };
}
```
**Rationale**: Monitor rendering performance.

#### Task 72: Create Lazy Loading Hook
**Action**: Create `apps/web/src/hooks/useLazyLoad.ts`
```typescript
export function useLazyLoad(ref: RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [ref]);
  
  return isVisible;
}
```
**Rationale**: Optimize image loading.

#### Task 73: Create Tab Synchronization Hook
**Action**: Create `apps/web/src/hooks/useTabSync.ts`
```typescript
export function useTabSync(key: string, value: any) {
  useEffect(() => {
    const channel = new BroadcastChannel('tab-sync');
    
    channel.postMessage({ key, value });
    
    channel.onmessage = (event) => {
      if (event.data.key === key) {
        // Update local state
      }
    };
    
    return () => channel.close();
  }, [key, value]);
}
```
**Rationale**: Synchronize state across tabs.

#### Task 74: Create Revision Diff Hook
**Action**: Create `apps/web/src/hooks/useRevisionDiff.ts`
```typescript
export function useRevisionDiff(revision1: Revision, revision2: Revision) {
  return useMemo(() => {
    // Calculate additions
    // Calculate deletions
    // Generate visual diff
  }, [revision1, revision2]);
}
```
**Rationale**: Compare revision changes.

#### Task 75: Create Export Hook
**Action**: Create `apps/web/src/hooks/useExport.ts`
```typescript
export function useExport(projectId: string) {
  const exportGeoJSON = trpc.export.geoJSON.useMutation();
  const exportZip = trpc.export.allRenders.useMutation();
  
  return {
    exportMasks: () => exportGeoJSON.mutate({ projectId }),
    exportRenders: () => exportZip.mutate({ projectId })
  };
}
```
**Rationale**: Centralize export functionality.

---

### Phase 5: Canvas Tool Implementation (Tasks 76-90)

#### Task 76: Implement Polygon Mask Tool
**Action**: Create `apps/web/src/lib/canvas/tools/PolygonTool.ts`
```typescript
export class PolygonTool implements AnnotationTool {
  private points: fabric.Point[] = [];
  private tempLine: fabric.Polyline | null = null;
  
  activate(canvas: fabric.Canvas) {
    canvas.on('mouse:down', this.handleMouseDown);
    canvas.on('mouse:move', this.handleMouseMove);
    canvas.on('mouse:dblclick', this.complete);
  }
  
  handleMouseDown = (e: fabric.IEvent) => {
    const point = canvas.getPointer(e.e);
    this.points.push(point);
    this.updateTempLine();
  }
  
  complete = () => {
    if (this.points.length >= 3) {
      const mask = new MaskLayer(this.points, {
        category: currentCategory,
        fill: categoryColors[currentCategory]
      });
      canvas.add(mask);
    }
    this.reset();
  }
}
```
**Rationale**: Click-to-draw polygon masks.

#### Task 77: Implement Brush Mask Tool
**Action**: Create `apps/web/src/lib/canvas/tools/BrushTool.ts`
```typescript
export class BrushTool implements AnnotationTool {
  private isDrawing: boolean = false;
  private brush: fabric.PencilBrush;
  
  constructor() {
    this.brush = new fabric.PencilBrush();
    this.brush.width = 10;
  }
  
  activate(canvas: fabric.Canvas) {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = this.brush;
    
    // Add pressure sensitivity
    if (window.PointerEvent) {
      canvas.on('mouse:down', (e: any) => {
        const pressure = e.e.pressure || 1;
        this.brush.width = 10 * pressure;
      });
    }
  }
}
```
**Rationale**: Freehand drawing with pressure support.

#### Task 78: Implement Pen Tool
**Action**: Create `apps/web/src/lib/canvas/tools/PenTool.ts`
```typescript
export class PenTool implements AnnotationTool {
  private path: fabric.Path | null = null;
  private smoothingFactor: number = 0.35;
  
  activate(canvas: fabric.Canvas) {
    // Bézier curve drawing
    // Smoothing algorithm
  }
  
  toggleSmoothing() {
    this.smoothingFactor = this.smoothingFactor > 0 ? 0 : 0.35;
  }
}
```
**Rationale**: Smooth curve drawing.

#### Task 79: Implement Select/Move Tool
**Action**: Create `apps/web/src/lib/canvas/tools/SelectTool.ts`
```typescript
export class SelectTool implements AnnotationTool {
  activate(canvas: fabric.Canvas) {
    canvas.selection = true;
    canvas.isDrawingMode = false;
    
    // Enable snapping
    canvas.on('object:moving', this.handleSnapping);
  }
  
  handleSnapping = (e: fabric.IEvent) => {
    const target = e.target;
    const objects = canvas.getObjects();
    
    // Find nearby edges
    // Snap within 4px threshold
  }
}
```
**Rationale**: Object manipulation with snapping.

#### Task 80: Implement Grid Toggle System
**Action**: Create `apps/web/src/lib/canvas/GridOverlay.ts`
```typescript
export class GridOverlay {
  private gridSize: number = 20; // 20cm reference
  private opacity: number = 0.15;
  
  toggle(canvas: fabric.Canvas) {
    const existing = canvas.getObjects('line').filter(obj => obj.grid);
    
    if (existing.length > 0) {
      existing.forEach(line => canvas.remove(line));
    } else {
      this.drawGrid(canvas);
    }
  }
  
  drawGrid(canvas: fabric.Canvas) {
    // Calculate grid based on scene scale
    // Adapt opacity to scene luminance
  }
}
```
**Rationale**: Spatial reference system.

#### Task 81: Implement Snap-to-Edge Algorithm
**Action**: Create `apps/web/src/lib/canvas/SnapManager.ts`
```typescript
export class SnapManager {
  private threshold: number = 4; // pixels
  
  findSnapPoints(point: fabric.Point, objects: fabric.Object[]) {
    const snapPoints: fabric.Point[] = [];
    
    objects.forEach(obj => {
      if (obj instanceof MaskLayer) {
        // Get all vertices
        // Calculate distances
        // Return closest within threshold
      }
    });
    
    return snapPoints;
  }
}
```
**Rationale**: Precise mask alignment.

#### Task 82: Implement Dirty Rect Optimization
**Action**: Update canvas rendering
```typescript
export function optimizeCanvasRendering(canvas: fabric.Canvas) {
  let dirtyRects: fabric.Rect[] = [];
  
  canvas.on('object:modified', (e) => {
    const bounds = e.target.getBoundingRect();
    dirtyRects.push(bounds);
  });
  
  // Custom render method
  const originalRender = canvas.renderAll.bind(canvas);
  canvas.renderAll = () => {
    if (dirtyRects.length > 0) {
      // Render only dirty regions
      dirtyRects.forEach(rect => {
        canvas.renderCanvas(canvas.contextTop, [rect]);
      });
      dirtyRects = [];
    } else {
      originalRender();
    }
  };
}
```
**Rationale**: Improve rendering performance.

#### Task 83: Implement Path Simplification
**Action**: Create Douglas-Peucker implementation
```typescript
export function simplifyPath(points: fabric.Point[], epsilon: number = 0.8): fabric.Point[] {
  if (points.length <= 2) return points;
  
  // Find point with maximum distance
  let maxDist = 0;
  let maxIndex = 0;
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  
  // Recursively simplify
  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  
  return [points[0], points[points.length - 1]];
}
```
**Rationale**: Reduce complex paths for performance.

#### Task 84: Implement Jitter Smoothing
**Action**: Create pointer smoothing
```typescript
export class PointerSmoother {
  private history: fabric.Point[] = [];
  private maxHistory: number = 3;
  
  addPoint(point: fabric.Point): fabric.Point {
    this.history.push(point);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // Average last N points
    const avg = this.history.reduce((sum, p) => ({
      x: sum.x + p.x / this.history.length,
      y: sum.y + p.y / this.history.length
    }), { x: 0, y: 0 });
    
    return new fabric.Point(avg.x, avg.y);
  }
}
```
**Rationale**: Smooth brush strokes.

#### Task 85: Implement Category Color System
**Action**: Create color management
```typescript
export const CategoryColors = {
  'plants': 'rgba(34, 197, 94, 0.5)',
  'mulch': 'rgba(180, 83, 9, 0.5)',
  'hardscape': 'rgba(120, 113, 108, 0.5)',
  'other': 'rgba(156, 163, 175, 0.5)'
};

export class CategoryColorManager {
  private userColors: Map<string, string> = new Map();
  
  getColor(category: string): string {
    return this.userColors.get(category) || CategoryColors[category];
  }
  
  setColor(category: string, color: string) {
    this.userColors.set(category, color);
    localStorage.setItem('categoryColors', JSON.stringify([...this.userColors]));
  }
}
```
**Rationale**: Customizable category visualization.

#### Task 86: Implement High-DPI Canvas Scaling
**Action**: Add retina display support
```typescript
export function setupHighDPICanvas(canvas: fabric.Canvas, container: HTMLElement) {
  const scale = window.devicePixelRatio || 1;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  canvas.setWidth(width * scale);
  canvas.setHeight(height * scale);
  
  canvas.getElement().style.width = `${width  }px`;
  canvas.getElement().style.height = `${height  }px`;
  
  const ctx = canvas.getContext();
  ctx.scale(scale, scale);
}
```
**Rationale**: Crisp rendering on 4K displays.

#### Task 87: Implement Export Sprite Generator
**Action**: Create sprite sheet export
```typescript
export async function generateSpriteSheet(masks: MaskLayer[]): Promise<Buffer> {
  const canvas = new OffscreenCanvas(4096, 4096);
  const ctx = canvas.getContext('2d');
  
  let x = 0; let y = 0; let rowHeight = 0;
  
  for (const mask of masks) {
    const bounds = mask.getBoundingRect();
    
    // Check if mask fits in current row
    if (x + bounds.width > 4096) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    
    // Draw mask to sprite
    ctx.save();
    ctx.translate(x, y);
    mask.render(ctx);
    ctx.restore();
    
    x += bounds.width;
    rowHeight = Math.max(rowHeight, bounds.height);
  }
  
  return canvas.toBuffer('image/png');
}
```
**Rationale**: Efficient mask export for backend.

#### Task 88: Implement GeoJSON Export
**Action**: Create GeoJSON converter
```typescript
export function masksToGeoJSON(masks: MaskLayer[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: masks.map(mask => ({
      type: 'Feature',
      properties: {
        category: mask.category,
        id: mask.id,
        deleted: mask.deleted
      },
      geometry: {
        type: 'Polygon',
        coordinates: [mask.points.map(p => [p.x, p.y])]
      }
    }))
  };
}
```
**Rationale**: Standard geographic data format.

#### Task 89: Remove Old Canvas Tools
**Action**: Delete obsolete tool files:
- `DrawingTools.ts`
- `PlantPlacement.ts`
- `AreaDrawing.ts`
**Rationale**: Clean up replaced functionality.

#### Task 90: Create Tool Manager
**Action**: Centralize tool switching
```typescript
export class ToolManager {
  private currentTool: AnnotationTool | null = null;
  private tools: Map<string, AnnotationTool> = new Map();
  
  constructor(canvas: fabric.Canvas) {
    this.tools.set('polygon', new PolygonTool());
    this.tools.set('brush', new BrushTool());
    this.tools.set('pen', new PenTool());
    this.tools.set('select', new SelectTool());
  }
  
  activateTool(toolName: string) {
    if (this.currentTool) {
      this.currentTool.deactivate();
    }
    
    this.currentTool = this.tools.get(toolName);
    if (this.currentTool) {
      this.currentTool.activate(this.canvas);
    }
  }
}
```
**Rationale**: Manage tool lifecycle.

---

### Phase 6: Integration & Testing (Tasks 91-110)

#### Task 91: Create Scene Board Page
**Action**: Create `apps/web/src/app/[locale]/(auth)/projects/[id]/scenes/page.tsx`
```typescript
export default function SceneBoardPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen flex flex-col">
      <ProjectHeader projectId={params.id} />
      <SceneBoard projectId={params.id} />
    </div>
  );
}
```
**Rationale**: New main workspace page.

#### Task 92: Update Project Routes
**Action**: Modify routing structure
- Change `/projects/[id]/design` to `/projects/[id]/scenes`
- Update all navigation links
- Add redirects for old URLs
**Rationale**: Align routes with new architecture.

#### Task 93: Integrate Quota System
**Action**: Add quota checks to render flow
```typescript
// In RenderDialog component
const { data: quota } = trpc.quota.current.useQuery();

if (quota && quota.remaining === 0) {
  return <QuotaExceededMessage />;
}
```
**Rationale**: Enforce quota limits in UI.

#### Task 94: Connect WebSocket Updates
**Action**: Initialize WebSocket in app layout
```typescript
export function RootLayout({ children }: Props) {
  useQuotaSocket(); // Initialize WebSocket connection
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```
**Rationale**: Enable real-time updates.

#### Task 95: Implement Data Migration UI
**Action**: Create migration notification
```typescript
export function MigrationBanner() {
  const { data: hasPendingMigration } = trpc.migration.check.useQuery();
  
  if (hasPendingMigration) {
    return (
      <Alert>
        <AlertTitle>Project Update Available</AlertTitle>
        <AlertDescription>
          We've improved our design system. Click here to update your projects.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
```
**Rationale**: Guide users through migration.

#### Task 96: Add Performance Monitoring
**Action**: Integrate monitoring in production
```typescript
if (process.env.NODE_ENV === 'production') {
  // Initialize Sentry
  // Add performance tracking
  // Monitor canvas FPS
}
```
**Rationale**: Track real-world performance.

#### Task 97: Create E2E Tests for Scene Flow
**Action**: Add Playwright tests
```typescript
test('upload and annotate scene', async ({ page }) => {
  await page.goto('/projects/123/scenes');
  
  // Upload scene
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-scene.jpg');
  
  // Wait for upload
  await page.waitForSelector('[data-testid="scene-thumbnail"]');
  
  // Select polygon tool
  await page.click('[data-testid="tool-polygon"]');
  
  // Draw mask
  // Save
  // Verify
});
```
**Rationale**: Ensure core flows work.

#### Task 98: Create Unit Tests for Tools
**Action**: Test annotation tools
```typescript
describe('PolygonTool', () => {
  it('should create mask with at least 3 points', () => {
    const tool = new PolygonTool();
    const canvas = new fabric.Canvas();
    
    tool.activate(canvas);
    
    // Simulate clicks
    // Verify mask creation
  });
});
```
**Rationale**: Verify tool functionality.

#### Task 99: Test Migration Scripts
**Action**: Create migration tests
```typescript
describe('Canvas to Scene Migration', () => {
  it('should convert canvas objects to masks', async () => {
    // Create test project with canvas data
    // Run migration
    // Verify scene creation
    // Verify mask conversion
  });
});
```
**Rationale**: Ensure safe data migration.

#### Task 100: Add Storybook Stories
**Action**: Create component stories
```typescript
export default {
  title: 'Annotation/CategoryTabs',
  component: CategoryTabs,
};

export const Default = {
  args: {
    categories: ['Plants & Trees', 'Mulch & Rocks'],
    activeCategory: 'Plants & Trees'
  }
};

export const WithCounts = {
  args: {
    categories: ['Plants & Trees (3)', 'Mulch & Rocks (7)'],
  }
};
```
**Rationale**: Document component usage.

#### Task 101: Update Documentation
**Action**: Create new user guides
- Scene upload guide
- Annotation tool guide
- Export format documentation
- API migration guide
**Rationale**: Help users adapt to changes.

#### Task 102: Create Performance Benchmarks
**Action**: Add performance tests
```typescript
test('canvas handles 1000 masks', async () => {
  const startTime = performance.now();
  
  // Create 1000 masks
  // Measure render time
  // Verify < 16ms frame time
  
  const frameTime = performance.now() - startTime;

  expect(frameTime).toBeLessThan(16);
});
```
**Rationale**: Ensure performance targets met.

#### Task 103: Add Analytics Tracking
**Action**: Track feature usage
```typescript
// Track tool usage
analytics.track('tool_activated', {
  tool: 'polygon',
  category: 'plants'
});

// Track export usage
analytics.track('export_completed', {
  format: 'geoJSON',
  maskCount: 42
});
```
**Rationale**: Understand user behavior.

#### Task 104: Implement Feature Flags
**Action**: Add gradual rollout capability
```typescript
if (await featureFlags.isEnabled('new-annotation-system')) {
  return <SceneBoard />;
} else {
  return <DesignCanvas />; // Old system
}
```
**Rationale**: Safe production deployment.

#### Task 105: Create Rollback Plan
**Action**: Document rollback procedure
1. Feature flag to disable new system
2. Database migration rollback script
3. Revert deployment
4. Clear CDN cache
**Rationale**: Emergency response plan.

#### Task 106: Add Error Boundaries
**Action**: Wrap components in error boundaries
```typescript
export function AnnotationErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      fallback={<AnnotationErrorFallback />}
      onError={(error) => {
        // Log to Sentry
        // Show user-friendly message
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```
**Rationale**: Graceful error handling.

#### Task 107: Optimize Bundle Size
**Action**: Analyze and optimize
```bash
# Analyze bundle
npm run build:analyze

# Lazy load heavy components
const AnnotationCanvas = lazy(() => import('./AnnotationCanvas'));

# Tree shake unused code
```
**Rationale**: Improve load performance.

#### Task 108: Add Accessibility Testing
**Action**: Run automated a11y tests
```typescript
test('annotation tools are keyboard accessible', async () => {
  const { container } = render(<ToolPalette />);
  
  // Test keyboard navigation
  // Verify ARIA labels
  // Check focus management
});
```
**Rationale**: Ensure accessibility compliance.

#### Task 109: Create User Feedback System
**Action**: Add feedback collection
```typescript
export function FeedbackWidget() {
  return (
    <button onClick={() => {
      showFeedbackModal({
        feature: 'annotation-system',
        version: '2.0'
      });
    }}>
      Send Feedback
    </button>
  );
}
```
**Rationale**: Gather user input on changes.

#### Task 110: Final System Integration Test
**Action**: Complete end-to-end test
1. Create new project
2. Upload multiple scenes
3. Annotate with all tools
4. Test history/undo
5. Export masks
6. Trigger render
7. Download results
8. Verify quota updates
**Rationale**: Validate complete system.

---

### Phase 7: Cleanup & Optimization (Tasks 111-120)

#### Task 111: Remove All Canvas Design Code
**Action**: Delete obsolete files
```bash
rm -rf apps/web/src/components/canvas/DesignCanvas*
rm -rf apps/web/src/components/canvas/Asset*
rm -rf apps/web/src/components/canvas/Material*
rm -rf apps/web/src/lib/canvas/old-tools
```
**Rationale**: Eliminate confusion from old code.

#### Task 112: Remove Unused Dependencies
**Action**: Clean package.json
```bash
npm uninstall [unused-packages]
npm audit fix
npm dedupe
```
**Rationale**: Reduce bundle size.

#### Task 113: Archive Old Database Tables
**Action**: Create archive schema
```sql
CREATE SCHEMA archive;
ALTER TABLE canvas_data SET SCHEMA archive;
-- Move other obsolete tables
```
**Rationale**: Preserve data while cleaning schema.

#### Task 114: Update API Documentation
**Action**: Generate new API docs
```bash
npm run docs:generate
# Update API examples
# Remove old endpoint docs
```
**Rationale**: Accurate API reference.

#### Task 115: Clean Up Type Definitions
**Action**: Remove obsolete types
```typescript
// Delete from types/
// - Canvas types
// - Drawing types
// - Old project types
```
**Rationale**: Maintain type clarity.

#### Task 116: Optimize Database Queries
**Action**: Add missing indexes
```sql
CREATE INDEX idx_masks_scene_category ON masks(scene_id, category);
CREATE INDEX idx_scenes_project_order ON scenes(project_id, order);
```
**Rationale**: Improve query performance.

#### Task 117: Implement Caching Strategy
**Action**: Add Redis caching
```typescript
// Cache scene thumbnails
// Cache mask counts
// Cache quota values
```
**Rationale**: Reduce database load.

#### Task 118: Add System Health Checks
**Action**: Create health endpoints
```typescript
health: publicProcedure.query(async () => {
  return {
    database: await checkDatabase(),
    storage: await checkStorage(),
    redis: await checkRedis()
  };
})
```
**Rationale**: Monitor system status.

#### Task 119: Create Admin Dashboard
**Action**: Add admin tools
- User quota management
- System metrics
- Feature flag controls
- Migration status
**Rationale**: System administration.

#### Task 120: Final Code Review Checklist
**Action**: Review all changes
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No console.logs
- [ ] Error handling complete
- [ ] Performance benchmarks met
- [ ] Accessibility verified
- [ ] Security review done
- [ ] Migration tested
**Rationale**: Ensure production readiness.

---

## Summary

This comprehensive migration plan includes:
- **120 detailed tasks** with clear actions and rationales
- **Optimal sequencing** from database to UI to integration
- **Change log framework** for documentation
- **Cleanup tasks** to remove obsolete code
- **Testing and validation** at each phase

Each task is designed to be:
- **Self-contained** - Can be completed independently
- **Testable** - Clear success criteria
- **Documented** - With rationale for future reference
- **Junior-friendly** - Explicit instructions and examples

The migration maintains backward compatibility during transition and includes rollback procedures for safety.

## Implementation Notes

1. **Start with Phase 1** - Database schema changes are foundational
2. **Test migrations thoroughly** - Use staging environment first
3. **Implement feature flags early** - Allow gradual rollout
4. **Keep old code during transition** - Remove only after full migration
5. **Document everything** - Use the change log framework consistently

## Resources

- Fabric.js Documentation: https://fabricjs.com/docs/
- tRPC Documentation: https://trpc.io/docs
- Drizzle ORM Documentation: https://orm.drizzle.team/docs
- Next.js App Router: https://nextjs.org/docs/app
- Playwright Testing: https://playwright.dev/docs

---

## Appendix: Comprehensive Change Analysis Table

| **Feature Group** | **Component/Feature** | **Current State** | **Future State** | **Change Description** |
|-------------------|----------------------|-------------------|------------------|------------------------|
| **INFORMATION ARCHITECTURE** |
| Account Management | User/Organization Model | - Users belong to organizations<br>- No render quota tracking<br>- Subscription tied to organization | - Account-level render quota (e.g., 18/20)<br>- User → Plan → Quota hierarchy<br>- Monthly quota refresh tracking | - Add `quota`, `quotaLimit`, `quotaRefreshDate` to user/org schema<br>- Create `QuotaService` for tracking consumption<br>- Add quota webhook handlers for real-time updates |
| Project Structure | Project Model | - Projects contain single canvas<br>- Direct canvas → render relationship<br>- No address-specific metadata | - Projects tied to specific addresses<br>- Projects contain multiple scenes<br>- Project → Scene → Render hierarchy | - Add `address` field to project schema<br>- Remove `canvas` field, add `scenes[]` array<br>- Create `Scene` model with order tracking |
| Scene Management | (Not implemented) | - Single design canvas per project<br>- No photo upload capability<br>- No scene concept | - Multiple uploadable photo scenes<br>- Scene ordering and management<br>- Scene-specific renders | - Create new `Scene` model and table<br>- Add `sceneImage`, `order`, `isDefault` fields<br>- Implement scene CRUD operations |
| Render System | Render Model | - Renders tied to entire project<br>- Canvas export → AI render<br>- Single render per request | - Renders tied to individual scenes<br>- Photo + masks → AI render<br>- 4K resolution output | - Update render schema: add `sceneId` foreign key<br>- Remove `projectId` direct reference<br>- Add `resolution` field (default: 4K) |
| **UI/UX COMPONENTS** |
| Navigation | Project Dashboard | - Card layout for projects<br>- "Create New" → Canvas<br>- No breadcrumb navigation | - Card layout maintained<br>- "Open Project" → Scene Board<br>- Full breadcrumb trail | - Update CTA text and routing<br>- Implement `<Breadcrumb>` component<br>- Add "Back to Project View" link |
| Layout Structure | Main Workspace | - Full-screen canvas<br>- Horizontal toolbar<br>- Side panels for properties | - Split-view: thumbnail rail + workspace<br>- Fixed 140px left rail<br>- CSS Grid mobile, Flexbox desktop | - Redesign layout architecture<br>- Create `SceneBoard` component<br>- Implement responsive breakpoints |
| Thumbnail System | (Not implemented) | - No thumbnail navigation<br>- Single canvas view<br>- No scene switching | - Vertical thumbnail rail (112×80px)<br>- Lazy-loaded with blur placeholders<br>- Drag-and-drop reordering | - Create `ThumbnailRail` component<br>- Implement `@dnd-kit` for reordering<br>- Add keyboard navigation (↑/↓/Enter) |
| Scene Selection | (Not implemented) | - N/A | - Current scene: 2px primary outline<br>- Elevated shadow on active<br>- Mini-toolbar on hover | - Create `SceneThumbnail` component<br>- Add hover state with action icons<br>- Implement selection state management |
| Upload System | Image Upload | - Basic file upload for assets<br>- No resolution validation<br>- Generic file handling | - Dedicated scene upload dropzone<br>- JPEG/PNG ≤15MB, ≥1500×1000px<br>- Validation with toast feedback | - Create `SceneUploadZone` component<br>- Add file validation middleware<br>- Implement drag-over visual states |
| Quota Display | (Not implemented) | - No quota tracking UI<br>- No usage limits shown | - Global `QuotaBadge` in header<br>- Shows X/Y renders remaining<br>- Color states: normal/warning/critical | - Create `QuotaBadge.tsx` component<br>- Add WebSocket subscription for updates<br>- Implement WCAG color compliance |
| Category System | Material Selector | - Dropdown material selector<br>- Static material list<br>- No categorization | - Tab-based categories<br>- Plants, Mulch, Hardscape, Other<br>- Dynamic custom categories | - Create `CategoryTabs` component<br>- Add pill counters for active masks<br>- Implement tab keyboard navigation |
| **CANVAS & ANNOTATION** |
| Canvas Core | DesignCanvas | - Fabric.js for vector drawing<br>- Fixed canvas size<br>- Design element focus | - Fabric.js for mask annotation<br>- Native scene resolution<br>- Photo overlay architecture | - Refactor canvas initialization<br>- Add devicePixelRatio scaling<br>- Implement photo underlay system |
| Drawing Tools | Tool System | - Select, polygon, polyline, area, line<br>- Horizontal toolbar<br>- Material-specific areas | - Polygon, brush, pen, select/move<br>- Vertical tool palette<br>- Category-specific masks | - Redesign tool architecture<br>- Create `ToolPalette` component<br>- Add pressure sensitivity support |
| Grid System | Grid Overlay | - 20px fixed grid<br>- Always visible<br>- Static appearance | - 20cm spatial reference grid<br>- Toggle with 'G' key<br>- Adaptive opacity (15%) | - Update grid calculation logic<br>- Add luminance adaptation<br>- Implement toggle functionality |
| Mask Management | (Not implemented) | - Object-based elements<br>- No mask concept<br>- Direct manipulation | - Layer-based masks<br>- Category organization<br>- Soft-delete capability | - Create `MaskLayer` class<br>- Implement mask collections<br>- Add deleted flag system |
| Brush Tool | (Not implemented) | - No brush tool<br>- Polygon drawing only | - Pressure-sensitive brush<br>- 2-50px width range<br>- Jitter smoothing | - Implement `BrushTool` class<br>- Add stylus/pencil support<br>- Create smoothing algorithm |
| Snap Features | (Not implemented) | - No snapping<br>- Manual alignment only | - Snap-to-edge (4px threshold)<br>- Magnetic vertex alignment<br>- Reduce micro-gaps | - Implement snap detection<br>- Add magnetic pull algorithm<br>- Create visual snap indicators |
| Performance | Rendering | - Full canvas redraws<br>- Basic optimization | - Dirty-rect optimization<br>- RequestAnimationFrame<br>- Path simplification | - Implement dirty region tracking<br>- Add Douglas-Peucker algorithm<br>- Create performance monitoring |
| **STATE MANAGEMENT** |
| Canvas State | State Tracking | - Track all canvas objects<br>- Single state tree<br>- No categorization | - Track masks by category<br>- Scene-isolated state<br>- Revision history | - Redesign state structure<br>- Add category-based organization<br>- Implement state isolation |
| History System | Undo/Redo | - Basic undo/redo<br>- Canvas snapshots<br>- Limited history | - Comprehensive history panel<br>- Visual diff thumbnails<br>- Non-destructive restore | - Create `HistoryPanel` component<br>- Add diff visualization<br>- Implement revision storage |
| Autosave | (Not implemented) | - Manual save only<br>- No draft system | - 60s autosave intervals<br>- Diff patch system<br>- Visual confirmation | - Implement autosave timer<br>- Create diff generation<br>- Add save status indicator |
| Multi-tab Safety | (Not implemented) | - No multi-tab handling<br>- Potential conflicts | - TabId tracking<br>- Merge conflict dialogs<br>- Concurrent edit handling | - Add tab identification system<br>- Create merge UI components<br>- Implement conflict resolution |
| **DATA MODELS** |
| Project Schema | Database Model | ```typescript<br>interface Project {<br>  id: string<br>  name: string<br>  canvas: CanvasData<br>  renders: Render[]<br>}``` | ```typescript<br>interface Project {<br>  id: string<br>  name: string<br>  address: string<br>  scenes: Scene[]<br>  metadata: ProjectMeta<br>}``` | - Migration to remove canvas field<br>- Add address and scenes array<br>- Update all project queries |
| Scene Model | (Not implemented) | - No scene concept | ```typescript<br>interface Scene {<br>  id: string<br>  projectId: string<br>  imageUrl: string<br>  masks: MaskCollection<br>  renders: Render[]<br>  order: number<br>}``` | - Create new Scene table<br>- Add image upload handling<br>- Implement ordering system |
| Mask Model | (Not implemented) | - Canvas objects only | ```typescript<br>interface Mask {<br>  id: string<br>  sceneId: string<br>  category: Category<br>  path: GeoJSON<br>  deleted: boolean<br>  authorId: string<br>}``` | - Create Mask schema<br>- Add GeoJSON storage<br>- Implement soft-delete |
| **API ENDPOINTS** |
| Scene APIs | (Not implemented) | - No scene endpoints | - POST /api/scene/upload<br>- POST /api/scene/reorder<br>- DELETE /api/scene/:id<br>- PUT /api/scene/:id/default | - Create scene router<br>- Add upload middleware<br>- Implement reordering logic |
| Mask APIs | (Not implemented) | - Canvas save endpoint only | - POST /api/mask/save<br>- GET /api/mask/history<br>- POST /api/mask/restore<br>- GET /api/mask/export | - Create mask router<br>- Add diff generation<br>- Implement export formats |
| Export APIs | Export Functionality | - Canvas to PNG/JPEG<br>- Single format export | - GeoJSON mask export<br>- PNG sprite sheet (4096²)<br>- Streaming ZIP downloads | - Add GeoJSON serializer<br>- Create sprite generator<br>- Implement stream handling |
| **RESPONSIVE DESIGN** |
| Mobile Layout | Responsive Behavior | - Canvas scales down<br>- Horizontal toolbar persists<br>- Limited mobile support | - Thumbnail rail → carousel<br>- Tool palette → slide-out<br>- Touch-optimized | - Create mobile-specific layouts<br>- Add gesture handling<br>- Implement carousel component |
| Touch Interactions | Gesture Support | - Basic touch events<br>- Pinch zoom only | - Long-press for drag<br>- Pressure-sensitive drawing<br>- Multi-touch masks | - Add gesture recognizers<br>- Implement touch handlers<br>- Create haptic feedback |
| **ACCESSIBILITY** |
| ARIA Support | Accessibility | - Basic ARIA labels<br>- Limited keyboard nav | - Comprehensive ARIA<br>- Full keyboard support<br>- Screen reader optimization | - Add role attributes<br>- Implement focus management<br>- Create announcements |
| Keyboard Shortcuts | Shortcuts | - Basic shortcuts<br>- Copy/paste/delete | - Extended shortcuts<br>- M/B/P/S tool switching<br>- Alt+arrow navigation | - Expand shortcut system<br>- Add aria-keyshortcuts<br>- Create help overlay |
| **PERFORMANCE OPTIMIZATIONS** |
| Image Handling | (Not implemented) | - No image optimization | - Lazy loading<br>- Blur-up placeholders<br>- Progressive enhancement | - Implement lazy loading<br>- Add placeholder system<br>- Create loading states |
| Rendering Pipeline | Canvas Rendering | - Full redraws<br>- Basic caching | - Dirty-rect tracking<br>- RAF scheduling<br>- Path optimization | - Implement render queue<br>- Add optimization passes<br>- Create metrics tracking |
| **REAL-TIME FEATURES** |
| WebSocket Integration | (Not implemented) | - No real-time updates | - Quota updates<br>- Multi-tab sync<br>- Collaborative hints | - Add WebSocket server<br>- Create event system<br>- Implement subscriptions |
| **MIGRATION REQUIREMENTS** |
| Data Migration | Database | - Existing canvas data<br>- Current projects | - Convert to scenes<br>- Preserve project data<br>- Maintain renders | - Write migration scripts<br>- Create fallback handlers<br>- Test data integrity |