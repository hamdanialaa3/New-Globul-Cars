/**
 * Mobile Interactions Hook
 * Provides mobile-specific interactions: swipe, long-press, pull-to-refresh, tap feedback
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { logger } from '@/services/logger-service';

// ============================================================================
// TYPES
// ============================================================================

export interface SwipeConfig {
  threshold?: number; // px
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface LongPressConfig {
  duration?: number; // ms
  onLongPress: () => void;
  onLongPressEnd?: () => void;
}

export interface PullToRefreshConfig {
  threshold?: number; // px
  onRefresh: () => Promise<void>;
}

export interface TapFeedbackConfig {
  feedbackType?: 'light' | 'medium' | 'heavy';
  duration?: number; // ms
}

// ============================================================================
// SWIPE DETECTION HOOK
// ============================================================================

export const useSwipe = (elementRef: React.RefObject<HTMLElement>, config: SwipeConfig) => {
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!elementRef.current) return;

    const threshold = config.threshold || 50;
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStart.current = { x: touchStartX, y: touchStartY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            config.onSwipeRight?.();
          } else {
            config.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipes
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            config.onSwipeDown?.();
          } else {
            config.onSwipeUp?.();
          }
        }
      }
    };

    const element = elementRef.current;
    element.addEventListener('touchstart', handleTouchStart, false);
    element.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [config]);
};

// ============================================================================
// LONG PRESS DETECTION HOOK
// ============================================================================

export const useLongPress = (elementRef: React.RefObject<HTMLElement>, config: LongPressConfig) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const touchStartRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const duration = config.duration || 500;
    let touchX = 0;
    let touchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = true;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;

      timeoutRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          config.onLongPress();
          // Haptic feedback
          triggerHapticFeedback('impact');
        }
      }, duration);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // If finger moves more than 10px, cancel long press
      const deltaX = Math.abs(e.touches[0].clientX - touchX);
      const deltaY = Math.abs(e.touches[0].clientY - touchY);

      if (deltaX > 10 || deltaY > 10) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        touchStartRef.current = false;
      }
    };

    const handleTouchEnd = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      touchStartRef.current = false;
      config.onLongPressEnd?.();
    };

    const element = elementRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [config]);
};

// ============================================================================
// PULL TO REFRESH HOOK
// ============================================================================

export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const containerRef = useRef<HTMLElement>(null);
  const isRefreshingRef = useRef(false);
  const scrollStartRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const threshold = config.threshold || 60;

    const handleTouchStart = (e: TouchEvent) => {
      scrollStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;

      const element = containerRef.current;
      if (!element) return;

      // Only trigger if we're at the top of the scroll
      if (element.scrollTop > 0) return;

      const deltaY = e.touches[0].clientY - scrollStartRef.current;

      if (deltaY > threshold) {
        isRefreshingRef.current = true;

        // Trigger haptic feedback
        triggerHapticFeedback('impact');

        config.onRefresh()
          .catch(error => {
            logger.error('Pull to refresh failed', error instanceof Error ? error : new Error(String(error)));
          })
          .finally(() => {
            isRefreshingRef.current = false;
          });
      }
    };

    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart, false);
    element.addEventListener('touchmove', handleTouchMove, false);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [config]);

  return containerRef;
};

// ============================================================================
// DOUBLE TAP DETECTION HOOK
// ============================================================================

export const useDoubleTap = (elementRef: React.RefObject<HTMLElement>, onDoubleTap: () => void) => {
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!elementRef.current) return;

    const handleTap = () => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapRef.current;

      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        onDoubleTap();
        triggerHapticFeedback('light');
      }

      lastTapRef.current = currentTime;
    };

    const element = elementRef.current;
    element.addEventListener('touchstart', handleTap);

    return () => {
      element.removeEventListener('touchstart', handleTap);
    };
  }, [onDoubleTap]);
};

// ============================================================================
// TAP FEEDBACK HOOK
// ============================================================================

export const useTapFeedback = (elementRef: React.RefObject<HTMLElement>, config: TapFeedbackConfig = {}) => {
  const feedbackType = config.feedbackType || 'light';
  const duration = config.duration || 200;

  useEffect(() => {
    if (!elementRef.current) return;

    const handleTouchStart = () => {
      // Add visual feedback
      elementRef.current?.style.setProperty('opacity', '0.7');

      // Trigger haptic feedback
      triggerHapticFeedback(feedbackType);

      const timeout = setTimeout(() => {
        elementRef.current?.style.setProperty('opacity', '1');
      }, duration);

      return () => clearTimeout(timeout);
    };

    const handleTouchEnd = () => {
      elementRef.current?.style.setProperty('opacity', '1');
    };

    const element = elementRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [feedbackType, duration]);
};

// ============================================================================
// KEYBOARD HANDLING HOOK
// ============================================================================

export const useKeyboardHeight = () => {
  const keyboardHeightRef = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = (window as any).visualViewport;
      if (visualViewport) {
        const height = window.innerHeight - visualViewport.height;
        keyboardHeightRef.current = height;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return keyboardHeightRef.current;
};

export const useKeyboardDismiss = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const handleTouchOutside = (e: TouchEvent) => {
      if (!elementRef.current?.contains(e.target as Node)) {
        // Dismiss keyboard
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    document.addEventListener('touchstart', handleTouchOutside);
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, []);
};

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'impact' = 'light') => {
  if (!('vibrate' in navigator)) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    impact: [20, 10, 20]
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch (error) {
    logger.warn('Haptic feedback not available', { error: String(error) });
  }
};

// ============================================================================
// CONTEXT MENU HOOK
// ============================================================================

export const useContextMenu = (elementRef: React.RefObject<HTMLElement>, onContextMenu: (x: number, y: number) => void) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const handleContextMenu = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      let x = 0;
      let y = 0;

      if (e instanceof TouchEvent) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      onContextMenu(x, y);
    };

    const element = elementRef.current;
    element.addEventListener('contextmenu', handleContextMenu);
    element.addEventListener('touchstart', handleContextMenu);

    return () => {
      element.removeEventListener('contextmenu', handleContextMenu);
      element.removeEventListener('touchstart', handleContextMenu);
    };
  }, [onContextMenu]);
};

// ============================================================================
// SCROLL DETECTION HOOK
// ============================================================================

export const useScrollDetection = (
  elementRef: React.RefObject<HTMLElement>,
  callbacks: {
    onScrollTop?: () => void;
    onScrollBottom?: () => void;
    onScroll?: (position: number) => void;
  } = {}
) => {
  const lastScrollRef = useRef(0);

  useEffect(() => {
    if (!elementRef.current) return;

    const handleScroll = (e: Event) => {
      const element = e.target as HTMLElement;
      const { scrollTop, scrollHeight, clientHeight } = element;

      // Detect if at top
      if (scrollTop === 0 && lastScrollRef.current > 0) {
        callbacks.onScrollTop?.();
      }

      // Detect if at bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        callbacks.onScrollBottom?.();
      }

      callbacks.onScroll?.(scrollTop);
      lastScrollRef.current = scrollTop;
    };

    const element = elementRef.current;
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [callbacks]);
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. SWIPE DETECTION:
 *    const ref = useRef<HTMLDivElement>(null);
 *    useSwipe(ref, {
 *      onSwipeLeft: () => navigate('/next'),
 *      onSwipeRight: () => navigate('/prev')
 *    });
 * 
 * 2. LONG PRESS:
 *    const ref = useRef<HTMLDivElement>(null);
 *    useLongPress(ref, {
 *      onLongPress: () => showContextMenu()
 *    });
 * 
 * 3. PULL TO REFRESH:
 *    const ref = usePullToRefresh({
 *      onRefresh: async () => await fetchData()
 *    });
 * 
 * 4. DOUBLE TAP TO LIKE:
 *    const ref = useRef<HTMLDivElement>(null);
 *    useDoubleTap(ref, () => likeCar());
 * 
 * 5. TAP FEEDBACK:
 *    const ref = useRef<HTMLButtonElement>(null);
 *    useTapFeedback(ref, { feedbackType: 'impact' });
 */
