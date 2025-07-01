import { useEffect, useRef, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface TouchGestureHandlers {
  onPinch?: (scale: number, center: Point) => void;
  onPan?: (delta: Point) => void;
  onRotate?: (angle: number, center: Point) => void;
  onTap?: (point: Point) => void;
  onLongPress?: (point: Point) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
}

interface TouchState {
  startTouches: Touch[];
  startTime: number;
  lastCenter: Point | null;
  lastDistance: number | null;
  lastAngle: number | null;
  longPressTimer: NodeJS.Timeout | null;
}

const LONG_PRESS_DURATION = 500;
const TAP_THRESHOLD = 10;
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export function useTouchGestures<T extends HTMLElement>(
  handlers: TouchGestureHandlers
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const stateRef = useRef<TouchState>({
    startTouches: [],
    startTime: 0,
    lastCenter: null,
    lastDistance: null,
    lastAngle: null,
    longPressTimer: null,
  });

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenter = useCallback((touches: TouchList): Point => {
    let sumX = 0;
    let sumY = 0;
    
    for (let i = 0; i < touches.length; i++) {
      sumX += touches[i].clientX;
      sumY += touches[i].clientY;
    }
    
    return {
      x: sumX / touches.length,
      y: sumY / touches.length,
    };
  }, []);

  const getAngle = useCallback((touch1: Touch, touch2: Touch): number => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const state = stateRef.current;
    state.startTouches = Array.from(e.touches);
    state.startTime = Date.now();

    if (e.touches.length === 1 && handlers.onLongPress) {
      const touch = e.touches[0];
      state.longPressTimer = setTimeout(() => {
        handlers.onLongPress?.({ x: touch.clientX, y: touch.clientY });
      }, LONG_PRESS_DURATION);
    }

    if (e.touches.length === 2) {
      state.lastDistance = getDistance(e.touches[0], e.touches[1]);
      state.lastAngle = getAngle(e.touches[0], e.touches[1]);
      state.lastCenter = getCenter(e.touches);
    }
  }, [handlers, getDistance, getAngle, getCenter]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const state = stateRef.current;

    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }

    if (e.touches.length === 1 && handlers.onPan && state.startTouches.length === 1) {
      const touch = e.touches[0];
      const startTouch = state.startTouches[0];
      
      handlers.onPan({
        x: touch.clientX - startTouch.clientX,
        y: touch.clientY - startTouch.clientY,
      });
    }

    if (e.touches.length === 2 && state.startTouches.length === 2) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const currentAngle = getAngle(e.touches[0], e.touches[1]);
      const currentCenter = getCenter(e.touches);

      if (handlers.onPinch && state.lastDistance !== null) {
        const scale = currentDistance / state.lastDistance;
        handlers.onPinch(scale, currentCenter);
      }

      if (handlers.onRotate && state.lastAngle !== null) {
        const rotation = currentAngle - state.lastAngle;
        handlers.onRotate(rotation, currentCenter);
      }

      state.lastDistance = currentDistance;
      state.lastAngle = currentAngle;
      state.lastCenter = currentCenter;
    }
  }, [handlers, getDistance, getAngle, getCenter]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const state = stateRef.current;

    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }

    if (state.startTouches.length === 1 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const startTouch = state.startTouches[0];
      const duration = Date.now() - state.startTime;
      
      const dx = touch.clientX - startTouch.clientX;
      const dy = touch.clientY - startTouch.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < TAP_THRESHOLD && duration < 300 && handlers.onTap) {
        handlers.onTap({ x: touch.clientX, y: touch.clientY });
      }

      if (distance > SWIPE_THRESHOLD && handlers.onSwipe) {
        const velocity = distance / duration;
        
        if (velocity > SWIPE_VELOCITY_THRESHOLD) {
          const absX = Math.abs(dx);
          const absY = Math.abs(dy);
          
          if (absX > absY) {
            handlers.onSwipe(dx > 0 ? 'right' : 'left', velocity);
          } else {
            handlers.onSwipe(dy > 0 ? 'down' : 'up', velocity);
          }
        }
      }
    }

    state.startTouches = [];
    state.lastCenter = null;
    state.lastDistance = null;
    state.lastAngle = null;
  }, [handlers]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      
      if (stateRef.current.longPressTimer) {
        clearTimeout(stateRef.current.longPressTimer);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return ref;
}