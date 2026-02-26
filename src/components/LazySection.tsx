// LazySection.tsx
// IntersectionObserver wrapper للتحميل الذكي للأقسام

import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: string;
}

/**
 * Lazy loading wrapper using IntersectionObserver
 * Only renders children when section becomes visible in viewport
 */
// Memoize LazySection to prevent unnecessary re-renders
const LazySection: React.FC<LazySectionProps> = React.memo(({
  children,
  rootMargin = '200px',
  threshold = 0.1,
  minHeight = '400px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Cleanup previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, disconnect observer to prevent unnecessary checks
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      {
        root: null, // viewport
        rootMargin, // Start loading before visible (e.g., '200px' before)
        threshold // 0.1 = 10% visible triggers load
      }
    );

    const currentObserver = observerRef.current;
    if (sectionRef.current) {
      currentObserver.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current && currentObserver) {
        currentObserver.unobserve(sectionRef.current);
      }
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [rootMargin, threshold]);

  return (
    <div
      ref={sectionRef}
      style={{
        minHeight: isVisible ? undefined : minHeight,
        position: 'relative',
        contain: isVisible ? undefined : 'layout size',
      }}
    >
      {isVisible ? (
        children
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight,
            color: '#6c757d',
            fontSize: '0.9rem'
          }}
        >
          {/* Optional: Loading placeholder */}
        </div>
      )}
    </div>
  );
});

LazySection.displayName = 'LazySection';

export default LazySection;

