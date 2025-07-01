import { create } from 'zustand';
import { fabric } from 'fabric';

export interface ClipboardItem {
  id: string;
  objectData: any;
  timestamp: number;
  type: string;
  preview?: string; // base64 image preview
}

export interface ClipboardState {
  clipboardItems: ClipboardItem[];
  maxItems: number;
  isClipboardVisible: boolean;
  lastCopyPosition: fabric.Point | null;
  pasteOffset: { x: number; y: number };
}

export interface ClipboardStore extends ClipboardState {
  // Copy operations
  copyObjects: (objects: fabric.Object[], canvas: fabric.Canvas) => void;
  copyObject: (object: fabric.Object, canvas: fabric.Canvas) => void;
  
  // Paste operations
  pasteObjects: (canvas: fabric.Canvas, position?: fabric.Point) => Promise<fabric.Object[]>;
  pasteFromClipboard: (canvas: fabric.Canvas, index?: number) => Promise<fabric.Object[]>;
  
  // Clipboard management
  clearClipboard: () => void;
  removeClipboardItem: (id: string) => void;
  setClipboardVisible: (visible: boolean) => void;
  
  // Cross-canvas support
  exportClipboard: () => string;
  importClipboard: (data: string) => void;
  
  // Utilities
  generatePreview: (object: fabric.Object, canvas: fabric.Canvas) => Promise<string>;
  createObjectFromData: (data: any) => Promise<fabric.Object>;
  
  // Getters
  getLatestClipboardItem: () => ClipboardItem | null;
  hasClipboardItems: () => boolean;
  getClipboardItemById: (id: string) => ClipboardItem | null;
}

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  // Initial state
  clipboardItems: [],
  maxItems: 10,
  isClipboardVisible: false,
  lastCopyPosition: null,
  pasteOffset: { x: 20, y: 20 },

  // Copy operations
  copyObjects: async (objects, canvas) => {
    if (!objects.length) return;

    const clipboardItems = [];
    
    for (const object of objects) {
      const objectData = object.toObject();
      const preview = await get().generatePreview(object, canvas);
      
      clipboardItems.push({
        id: `clipboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        objectData,
        timestamp: Date.now(),
        type: object.type || 'object',
        preview
      });
    }

    set((state) => {
      const newItems = [...clipboardItems, ...state.clipboardItems].slice(0, state.maxItems);
      return {
        clipboardItems: newItems,
        lastCopyPosition: objects[0] ? new fabric.Point(objects[0].left || 0, objects[0].top || 0) : null
      };
    });
  },

  copyObject: async (object, canvas) => {
    get().copyObjects([object], canvas);
  },

  // Paste operations
  pasteObjects: async (canvas, position) => {
    const latestItem = get().getLatestClipboardItem();
    if (!latestItem) return [];

    return get().pasteFromClipboard(canvas, 0);
  },

  pasteFromClipboard: async (canvas, index = 0) => {
    const { clipboardItems, pasteOffset } = get();
    if (!clipboardItems[index]) return [];

    const item = clipboardItems[index];
    const pastedObjects: fabric.Object[] = [];

    try {
      const newObject = await get().createObjectFromData(item.objectData);
      
      // Calculate paste position
      const currentObjects = canvas.getObjects();
      const offsetMultiplier = currentObjects.filter(obj => 
        obj.left === newObject.left && obj.top === newObject.top
      ).length;

      newObject.set({
        left: (newObject.left || 0) + (pasteOffset.x * (offsetMultiplier + 1)),
        top: (newObject.top || 0) + (pasteOffset.y * (offsetMultiplier + 1))
      });

      canvas.add(newObject);
      canvas.setActiveObject(newObject);
      pastedObjects.push(newObject);
      
      canvas.renderAll();
    } catch (error) {
      console.error('Failed to paste object:', error);
    }

    return pastedObjects;
  },

  // Clipboard management
  clearClipboard: () => set({ clipboardItems: [] }),

  removeClipboardItem: (id) => set((state) => ({
    clipboardItems: state.clipboardItems.filter(item => item.id !== id)
  })),

  setClipboardVisible: (visible) => set({ isClipboardVisible: visible }),

  // Cross-canvas support
  exportClipboard: () => {
    const { clipboardItems } = get();
    return JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      items: clipboardItems
    });
  },

  importClipboard: (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.version === '1.0' && Array.isArray(parsed.items)) {
        set((state) => ({
          clipboardItems: [...parsed.items, ...state.clipboardItems].slice(0, state.maxItems)
        }));
      }
    } catch (error) {
      console.error('Failed to import clipboard data:', error);
    }
  },

  // Utilities
  generatePreview: async (object, canvas) => {
    try {
      // Create a temporary canvas for preview
      const previewCanvas = new fabric.Canvas(document.createElement('canvas'), {
        width: 100,
        height: 100,
        backgroundColor: '#ffffff'
      });

      // Clone the object for preview
      const clonedObject = await new Promise<fabric.Object>((resolve) => {
        object.clone((cloned: fabric.Object) => resolve(cloned));
      });

      // Scale object to fit preview canvas
      const objectBounds = clonedObject.getBoundingRect();
      const scale = Math.min(80 / objectBounds.width, 80 / objectBounds.height);
      
      clonedObject.set({
        left: 50,
        top: 50,
        scaleX: (clonedObject.scaleX || 1) * scale,
        scaleY: (clonedObject.scaleY || 1) * scale,
        originX: 'center',
        originY: 'center'
      });

      previewCanvas.add(clonedObject);
      previewCanvas.renderAll();

      const dataURL = previewCanvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 1
      });

      previewCanvas.dispose();
      return dataURL;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return '';
    }
  },

  createObjectFromData: async (data) => {
    return new Promise<fabric.Object>((resolve, reject) => {
      // Determine object type and create appropriate object
      if (data.type === 'AreaObject') {
        // Import AreaObject if available
        try {
          const { AreaObject } = require('@/lib/canvas/objects/AreaObject');
          AreaObject.fromObject(data, resolve);
        } catch {
          fabric.Polygon.fromObject(data, resolve);
        }
      } else if (data.type === 'LineObject') {
        // Import LineObject if available
        try {
          const { LineObject } = require('@/lib/canvas/objects/LineObject');
          LineObject.fromObject(data, resolve);
        } catch {
          fabric.Line.fromObject(data, resolve);
        }
      } else if (data.type === 'MaskLayer') {
        // Import MaskLayer if available
        try {
          const { MaskLayer } = require('@/lib/canvas/MaskLayer');
          MaskLayer.fromObject(data, resolve);
        } catch {
          fabric.Polygon.fromObject(data, resolve);
        }
      } else {
        // Use fabric's built-in fromObject method
        const fabricClass = (fabric as any)[data.type];
        if (fabricClass && fabricClass.fromObject) {
          fabricClass.fromObject(data, resolve);
        } else {
          reject(new Error(`Unknown object type: ${data.type}`));
        }
      }
    });
  },

  // Getters
  getLatestClipboardItem: () => {
    const { clipboardItems } = get();
    return clipboardItems.length > 0 ? clipboardItems[0] : null;
  },

  hasClipboardItems: () => {
    return get().clipboardItems.length > 0;
  },

  getClipboardItemById: (id) => {
    const { clipboardItems } = get();
    return clipboardItems.find(item => item.id === id) || null;
  }
}));