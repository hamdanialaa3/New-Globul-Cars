// PageTransition.tsx
// ⚡ High-performance page transitions with fade/slide animations
// Uses CSS transforms and opacity for GPU acceleration
// Duration: 200ms (ultra-fast, no performance impact)

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Fade out animation (page leaving) - Ultra fast
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) translateZ(0);
  }
`;

// Fade in animation (page entering) - Ultra fast
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
`;

const TransitionContainer = styled.div<{ $isExiting: boolean; $isVisible: boolean }>`
  width: 100%;
  min-height: 100%;
  opacity: ${props => props.$isVisible ? 1 : 0};
  animation: ${props => {
    if (!props.$isVisible) return 'none';
    return props.$isExiting ? fadeOut : fadeIn;
  }} 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
  
  /* GPU acceleration - critical for performance */
  will-change: opacity, transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  perspective: 1000px;
  
  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
`;

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'entering' | 'exiting'>('entering');
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only animate if pathname changed (not just search params)
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exiting');
      setIsVisible(true);
      
      // Short delay to allow exit animation to start (100ms = half of 200ms animation)
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('entering');
        setIsVisible(true);
      }, 100);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Same pathname, just update display location immediately
      setDisplayLocation(location);
      setIsVisible(true);
    }
  }, [location.pathname, displayLocation.pathname]); // Only depend on pathname

  const isExiting = transitionStage === 'exiting';

  return (
    <TransitionContainer $isExiting={isExiting} $isVisible={isVisible}>
      {children}
    </TransitionContainer>
  );
};

export default React.memo(PageTransition);
