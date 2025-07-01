import { fabric } from 'fabric';

interface GestureHandlers {
  onPinchZoom?: (scale: number, center: { x: number; y: number }) => void;
  onTwoFingerPan?: (delta: { x: number; y: number }) => void;
  onRotate?: (angle: number, center: { x: number; y: number }) => void;
  onTap?: (point: { x: number; y: number }) => void;
  onDoubleTap?: (point: { x: number; y: number }) => void;
  onLongPress?: (point: { x: number; y: number }) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onThreeFingerSwipe?: (direction: 'up' | 'down') => void;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  startTime: number;
}

export class TouchGestureManager {
  private canvas: fabric.Canvas;
  private handlers: GestureHandlers;
  private touches: Map<number, TouchPoint> = new Map();
  private lastTapTime: number = 0;
  private longPressTimer?: NodeJS.Timeout;
  private gestureInProgress: string | null = null;
  
  // Gesture thresholds
  private readonly TAP_THRESHOLD = 10;
  private readonly DOUBLE_TAP_THRESHOLD = 300;
  private readonly LONG_PRESS_DURATION = 500;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly SWIPE_VELOCITY_THRESHOLD = 0.3;
  private readonly ROTATION_THRESHOLD = 5; // degrees

  // Gesture state
  private initialPinchDistance: number = 0;
  private initialRotation: number = 0;
  private lastPinchDistance: number = 0;
  private lastRotation: number = 0;
  private lastCenter: { x: number; y: number } | null = null;

  constructor(canvas: fabric.Canvas, handlers: GestureHandlers = {}) {
    this.canvas = canvas;
    this.handlers = handlers;
    this.setupTouchHandlers();
  }

  private setupTouchHandlers(): void {
    const element = this.canvas.upperCanvasEl;

    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();

    // Clear any existing long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    // Add new touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now()
      });
    }

    const touchCount = this.touches.size;

    if (touchCount === 1) {
      // Single touch - check for long press
      const touch = Array.from(this.touches.values())[0];
      this.longPressTimer = setTimeout(() => {
        if (this.touches.size === 1 && !this.gestureInProgress) {
          const canvasPoint = this.getCanvasPoint(touch.x, touch.y);
          this.handlers.onLongPress?.(canvasPoint);
          this.gestureInProgress = 'longpress';
        }
      }, this.LONG_PRESS_DURATION);
    } else if (touchCount === 2) {
      // Two touches - prepare for pinch/rotate
      this.initializeTwoFingerGesture();
    } else if (touchCount === 3) {
      // Three touches - prepare for three-finger gestures
      this.gestureInProgress = 'three-finger';
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();

    // Clear long press timer on movement
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    // Update touch positions
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const storedTouch = this.touches.get(touch.identifier);
      if (storedTouch) {
        storedTouch.x = touch.clientX;
        storedTouch.y = touch.clientY;
      }
    }

    const touchCount = this.touches.size;

    if (touchCount === 2) {
      this.handleTwoFingerMove();
    } else if (touchCount === 3) {
      this.handleThreeFingerMove();
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }

    const touchCount = this.touches.size;
    const endedTouches: TouchPoint[] = [];

    // Collect ended touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const storedTouch = this.touches.get(touch.identifier);
      if (storedTouch) {
        endedTouches.push(storedTouch);
        this.touches.delete(touch.identifier);
      }
    }

    // Handle single touch end
    if (touchCount === 1 && endedTouches.length === 1) {
      this.handleSingleTouchEnd(endedTouches[0]);
    }

    // Reset gesture state when all touches end
    if (this.touches.size === 0) {
      this.gestureInProgress = null;
      this.lastCenter = null;
    }
  }

  private handleTouchCancel(e: TouchEvent): void {
    // Clear all touches
    this.touches.clear();
    this.gestureInProgress = null;
    this.lastCenter = null;

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  private initializeTwoFingerGesture(): void {
    const touches = Array.from(this.touches.values());
    if (touches.length !== 2) return;

    const [touch1, touch2] = touches;
    
    // Calculate initial distance
    this.initialPinchDistance = this.getDistance(touch1, touch2);
    this.lastPinchDistance = this.initialPinchDistance;
    
    // Calculate initial angle
    this.initialRotation = this.getAngle(touch1, touch2);
    this.lastRotation = this.initialRotation;
    
    // Calculate center
    this.lastCenter = this.getCenter(touches);
    
    this.gestureInProgress = 'two-finger';
  }

  private handleTwoFingerMove(): void {
    const touches = Array.from(this.touches.values());
    if (touches.length !== 2) return;

    const [touch1, touch2] = touches;
    const currentDistance = this.getDistance(touch1, touch2);
    const currentAngle = this.getAngle(touch1, touch2);
    const currentCenter = this.getCenter(touches);

    // Detect pinch zoom
    if (this.handlers.onPinchZoom && Math.abs(currentDistance - this.initialPinchDistance) > 10) {
      const scale = currentDistance / this.lastPinchDistance;
      const canvasCenter = this.getCanvasPoint(currentCenter.x, currentCenter.y);
      this.handlers.onPinchZoom(scale, canvasCenter);
      this.lastPinchDistance = currentDistance;
    }

    // Detect rotation
    if (this.handlers.onRotate) {
      const rotation = currentAngle - this.lastRotation;
      if (Math.abs(rotation) > this.ROTATION_THRESHOLD) {
        const canvasCenter = this.getCanvasPoint(currentCenter.x, currentCenter.y);
        this.handlers.onRotate(rotation, canvasCenter);
        this.lastRotation = currentAngle;
      }
    }

    // Detect two-finger pan
    if (this.handlers.onTwoFingerPan && this.lastCenter) {
      const delta = {
        x: currentCenter.x - this.lastCenter.x,
        y: currentCenter.y - this.lastCenter.y
      };
      
      if (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
        this.handlers.onTwoFingerPan(delta);
        this.lastCenter = currentCenter;
      }
    }
  }

  private handleThreeFingerMove(): void {
    const touches = Array.from(this.touches.values());
    if (touches.length !== 3) return;

    // Calculate average movement
    let totalDeltaY = 0;
    for (const touch of touches) {
      totalDeltaY += touch.y - touch.startY;
    }
    const avgDeltaY = totalDeltaY / 3;

    // Detect three-finger swipe
    if (Math.abs(avgDeltaY) > this.SWIPE_THRESHOLD) {
      this.handlers.onThreeFingerSwipe?.(avgDeltaY > 0 ? 'down' : 'up');
      
      // Reset start positions to prevent repeated triggers
      for (const touch of touches) {
        touch.startY = touch.y;
      }
    }
  }

  private handleSingleTouchEnd(touch: TouchPoint): void {
    const duration = Date.now() - touch.startTime;
    const deltaX = touch.x - touch.startX;
    const deltaY = touch.y - touch.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for tap
    if (distance < this.TAP_THRESHOLD && duration < 300 && !this.gestureInProgress) {
      const canvasPoint = this.getCanvasPoint(touch.x, touch.y);
      
      // Check for double tap
      const now = Date.now();
      if (now - this.lastTapTime < this.DOUBLE_TAP_THRESHOLD) {
        this.handlers.onDoubleTap?.(canvasPoint);
        this.lastTapTime = 0;
      } else {
        this.handlers.onTap?.(canvasPoint);
        this.lastTapTime = now;
      }
    }
    
    // Check for swipe
    else if (distance > this.SWIPE_THRESHOLD && duration < 500) {
      const velocity = distance / duration;
      
      if (velocity > this.SWIPE_VELOCITY_THRESHOLD) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
          this.handlers.onSwipe?.(deltaX > 0 ? 'right' : 'left', velocity);
        } else {
          this.handlers.onSwipe?.(deltaY > 0 ? 'down' : 'up', velocity);
        }
      }
    }
  }

  private getDistance(touch1: TouchPoint, touch2: TouchPoint): number {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngle(touch1: TouchPoint, touch2: TouchPoint): number {
    return Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x) * 180 / Math.PI;
  }

  private getCenter(touches: TouchPoint[]): { x: number; y: number } {
    const sumX = touches.reduce((sum, touch) => sum + touch.x, 0);
    const sumY = touches.reduce((sum, touch) => sum + touch.y, 0);
    return {
      x: sumX / touches.length,
      y: sumY / touches.length
    };
  }

  private getCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.upperCanvasEl.getBoundingClientRect();
    const point = new fabric.Point(
      clientX - rect.left,
      clientY - rect.top
    );
    
    // Transform to canvas coordinates considering viewport transform
    const transformed = fabric.util.transformPoint(
      point,
      fabric.util.invertTransform(this.canvas.viewportTransform!)
    );
    
    return { x: transformed.x, y: transformed.y };
  }

  // Update handlers
  public updateHandlers(handlers: Partial<GestureHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Enable/disable specific gestures
  public enableGesture(gesture: keyof GestureHandlers, enabled: boolean): void {
    if (!enabled) {
      delete this.handlers[gesture];
    }
  }

  // Get current gesture state
  public getGestureState(): {
    activeGesture: string | null;
    touchCount: number;
    touches: TouchPoint[];
  } {
    return {
      activeGesture: this.gestureInProgress,
      touchCount: this.touches.size,
      touches: Array.from(this.touches.values())
    };
  }

  // Cleanup
  public destroy(): void {
    const element = this.canvas.upperCanvasEl;
    
    element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    this.touches.clear();
  }
}