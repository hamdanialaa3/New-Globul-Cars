import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const breakpoints = {
  xs: 375,   // Small phones
  sm: 640,   // Large phones
  md: 768,   // Tablets
  lg: 1024,  // Small laptops
  xl: 1280,  // Laptops
  '2xl': 1536 // Desktop
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xl');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.sm) {
        setBreakpoint('xs');
      } else if (width < breakpoints.md) {
        setBreakpoint('sm');
      } else if (width < breakpoints.lg) {
        setBreakpoint('md');
      } else if (width < breakpoints.xl) {
        setBreakpoint('lg');
      } else if (width < breakpoints['2xl']) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('2xl');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
};

export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
};
