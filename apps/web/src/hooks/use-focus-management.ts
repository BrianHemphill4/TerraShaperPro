import { useCallback, useEffect, useRef, useState } from 'react';

type FocusTrapOptions = {
  initialFocus?: HTMLElement | null;
  restoreFocus?: boolean;
  allowOutsideClick?: boolean;
}

export function useFocusTrap(isActive: boolean, options: FocusTrapOptions = {}) {
  const {
    initialFocus,
    restoreFocus = true,
    allowOutsideClick = false,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isActive, getFocusableElements]
  );

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (!isActive || allowOutsideClick) return;

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        event.preventDefault();
        event.stopPropagation();

        // Return focus to the container
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    },
    [isActive, allowOutsideClick, getFocusableElements]
  );

  useEffect(() => {
    if (!isActive) return;

    // Store current active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    if (initialFocus) {
      initialFocus.focus();
    } else {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);

      // Restore focus
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, initialFocus, restoreFocus, handleKeyDown, handleOutsideClick, getFocusableElements]);

  return containerRef;
}

// Hook for managing focus within lists
export function useArrowKeyNavigation(
  itemsRef: React.MutableRefObject<(HTMLElement | null)[]>,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const items = itemsRef.current.filter(Boolean) as HTMLElement[];
      if (items.length === 0) return;

      let newIndex = focusedIndex;
      let handled = false;

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = focusedIndex - 1;
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = focusedIndex + 1;
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = focusedIndex - 1;
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = focusedIndex + 1;
            handled = true;
          }
          break;
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = items.length - 1;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          if (onSelect) {
            event.preventDefault();
            onSelect(focusedIndex);
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();

        if (loop) {
          if (newIndex < 0) newIndex = items.length - 1;
          if (newIndex >= items.length) newIndex = 0;
        } else {
          newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
        }

        setFocusedIndex(newIndex);
        items[newIndex]?.focus();
      }
    },
    [focusedIndex, itemsRef, orientation, loop, onSelect]
  );

  useEffect(() => {
    const container = itemsRef.current[0]?.parentElement;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, itemsRef]);

  return { focusedIndex, setFocusedIndex };
}

// Hook for skip links
export function useSkipLinks() {
  const skipToMain = useCallback(() => {
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main instanceof HTMLElement) {
      main.tabIndex = -1;
      main.focus();
      main.scrollIntoView();
    }
  }, []);

  const skipToNav = useCallback(() => {
    const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (nav instanceof HTMLElement) {
      nav.tabIndex = -1;
      nav.focus();
    }
  }, []);

  return { skipToMain, skipToNav };
}

// Live region announcements for screen readers
export function useLiveAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      document.body.removeChild(announcer);
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return announce;
}