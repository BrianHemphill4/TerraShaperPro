import { useEffect, useState } from 'react';

interface Breakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export function useResponsive(): Breakpoints {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>(() => {
    if (typeof window === 'undefined') {
      return {
        mobile: false,
        tablet: false,
        desktop: true,
        width: 1920,
        height: 1080,
        orientation: 'landscape',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      mobile: width < BREAKPOINTS.mobile,
      tablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      desktop: width >= BREAKPOINTS.tablet,
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBreakpoints({
        mobile: width < BREAKPOINTS.mobile,
        tablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        desktop: width >= BREAKPOINTS.tablet,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return breakpoints;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
  const responsive = useResponsive();
  return responsive[breakpoint];
}