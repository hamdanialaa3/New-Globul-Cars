// src/components/navigation/ScrollToTop.tsx
// Automatic scroll to top on route change - React Router v6 compatible
// Koli One - Bulgarian Car Marketplace

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '../../services/logger-service';

/**
 * ScrollToTop Component
 * Automatically scrolls to top of page on route change
 * Handles both standard navigation and modal/popup scenarios
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, let browser handle scroll to element
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Otherwise, scroll to top
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Also scroll main content area if exists
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }

      logger.debug('[ScrollToTop] Scrolled to top for route:', pathname);
    } catch (error) {
      // Fallback for browsers that don't support smooth scroll
      window.scrollTo(0, 0);
      logger.warn('[ScrollToTop] Smooth scroll not supported, using instant scroll');
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
