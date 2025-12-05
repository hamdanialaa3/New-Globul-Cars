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
const LazySection: React.FC<LazySectionProps> = ({
  children,
  rootMargin = '200px',
  threshold = 0.1,
  minHeight = '400px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, disconnect observer to prevent unnecessary checks
          observer.disconnect();
        }
      },
      {
        root: null, // viewport
        rootMargin, // Start loading before visible (e.g., '200px' before)
        threshold // 0.1 = 10% visible triggers load
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return (
    <div
      ref={sectionRef}
      style={{
        minHeight: isVisible ? 'auto' : minHeight,
        position: 'relative'
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
};

export default LazySection;

