'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useRef } from 'react';

import type { Command } from '@/lib/commands';

interface ToolCleanupProps {
  canvas: fabric.Canvas | null;
  activeTool: string;
  executeCommand?: (command: Command) => Promise<boolean>;
  cleanupDelay?: number;
  onCleanup?: (objects: fabric.Object[]) => void;
}

export const ToolCleanup = ({
  canvas,
  activeTool,
  executeCommand,
  cleanupDelay = 5000, // 5 seconds default
  onCleanup,
}: ToolCleanupProps) => {
  const cleanupTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const abandonedObjectsRef = useRef<Map<string, fabric.Object>>(new Map());
  const previousToolRef = useRef<string>(activeTool);

  // Mark object as potentially abandoned
  const markAsAbandoned = useCallback((object: fabric.Object) => {
    if (!object.data?.id) return;
    
    const objectId = object.data.id;
    abandonedObjectsRef.current.set(objectId, object);
    
    // Set cleanup timer
    const timer = setTimeout(() => {
      cleanupAbandonedObject(objectId);
    }, cleanupDelay);
    
    cleanupTimersRef.current.set(objectId, timer);
  }, [cleanupDelay]);

  // Clean up abandoned object
  const cleanupAbandonedObject = useCallback(async (objectId: string) => {
    if (!canvas) return;
    
    const object = abandonedObjectsRef.current.get(objectId);
    if (!object) return;
    
    // Check if object is still incomplete
    if (isIncompleteObject(object)) {
      if (executeCommand) {
        // Use command system for undoable cleanup
        const command: Command = {
          id: `cleanup-${objectId}`,
          type: 'object_remove',
          description: `Clean up abandoned ${object.type}`,
          execute: async () => {
            canvas.remove(object);
            canvas.requestRenderAll();
          },
          undo: async () => {
            canvas.add(object);
            canvas.requestRenderAll();
          },
          data: { objectId, objectType: object.type },
        };
        
        await executeCommand(command);
      } else {
        // Direct cleanup without undo
        canvas.remove(object);
        canvas.requestRenderAll();
      }
      
      // Notify about cleanup
      onCleanup?.([object]);
    }
    
    // Clean up references
    abandonedObjectsRef.current.delete(objectId);
    cleanupTimersRef.current.delete(objectId);
  }, [canvas, executeCommand, onCleanup]);

  // Check if object is incomplete
  const isIncompleteObject = (object: fabric.Object): boolean => {
    // Check for common incomplete states
    if (object.type === 'path' || object.type === 'polyline' || object.type === 'polygon') {
      const points = (object as any).points || (object as any).path;
      if (!points || points.length < 2) return true;
    }
    
    if (object.type === 'line') {
      const line = object as fabric.Line;
      if (line.width === 0 && line.height === 0) return true;
    }
    
    if (object.type === 'rect' || object.type === 'circle' || object.type === 'ellipse') {
      if (object.width === 0 || object.height === 0) return true;
    }
    
    // Check custom incomplete flag
    if (object.data?.incomplete === true) return true;
    
    return false;
  };

  // Cancel cleanup for object
  const cancelCleanup = useCallback((objectId: string) => {
    const timer = cleanupTimersRef.current.get(objectId);
    if (timer) {
      clearTimeout(timer);
      cleanupTimersRef.current.delete(objectId);
    }
    abandonedObjectsRef.current.delete(objectId);
  }, []);

  // Handle tool change
  useEffect(() => {
    if (!canvas || activeTool === previousToolRef.current) return;
    
    // Tool changed - check for abandoned objects
    const objects = canvas.getObjects();
    objects.forEach(object => {
      if (isIncompleteObject(object) && !object.data?.finalized) {
        markAsAbandoned(object);
      }
    });
    
    previousToolRef.current = activeTool;
  }, [canvas, activeTool, markAsAbandoned]);

  // Monitor canvas for new objects
  useEffect(() => {
    if (!canvas) return;
    
    const handleObjectAdded = (e: any) => {
      const object = e.target;
      if (!object || !object.data?.id) return;
      
      // Set up monitoring for potentially incomplete objects
      if (object.data?.temporary || object.data?.preview) {
        markAsAbandoned(object);
      }
    };
    
    const handleObjectModified = (e: any) => {
      const object = e.target;
      if (!object || !object.data?.id) return;
      
      const objectId = object.data.id;
      
      // If object was modified, it's being actively edited
      if (abandonedObjectsRef.current.has(objectId)) {
        cancelCleanup(objectId);
        
        // Re-mark if still incomplete
        if (isIncompleteObject(object) && !object.data?.finalized) {
          markAsAbandoned(object);
        }
      }
    };
    
    const handleObjectFinalized = (e: any) => {
      const object = e.target;
      if (!object || !object.data?.id) return;
      
      // Mark object as finalized
      object.data.finalized = true;
      cancelCleanup(object.data.id);
    };
    
    // Canvas event listeners
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('path:created', handleObjectFinalized);
    canvas.on('selection:created', handleObjectFinalized);
    
    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('path:created', handleObjectFinalized);
      canvas.off('selection:created', handleObjectFinalized);
      
      // Clean up all timers
      cleanupTimersRef.current.forEach(timer => clearTimeout(timer));
      cleanupTimersRef.current.clear();
      abandonedObjectsRef.current.clear();
    };
  }, [canvas, markAsAbandoned, cancelCleanup]);

  // Clean up all abandoned objects immediately
  const cleanupAll = useCallback(() => {
    const objectIds = Array.from(abandonedObjectsRef.current.keys());
    objectIds.forEach(objectId => {
      cleanupAbandonedObject(objectId);
    });
  }, [cleanupAbandonedObject]);

  // Expose cleanup function via ref if needed
  useEffect(() => {
    if (canvas && typeof canvas.cleanupAbandoned === 'undefined') {
      (canvas as any).cleanupAbandoned = cleanupAll;
    }
  }, [canvas, cleanupAll]);

  return null; // This is a utility component with no UI
};

export default ToolCleanup;