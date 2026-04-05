// src/components/navigation/PageLoader.tsx
// Glass Sphere Page Transition Loader
// Koli One - Bulgarian Car Marketplace

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { logger } from '../../services/logger-service';
import { KoliSphereLoader } from '../KoliSphereLoader';

const PageLoader: React.FC = () => {
  const location = useLocation();
  const { language } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Loading messages in both languages
  const loadingMessages = {
    bg: 'Подготвяме вашето автомобилно изживяване...',
    en: 'Preparing your automotive experience...'
  };

  useEffect(() => {
    // Start loader on route change
    setVisible(true);
    setProgress(0);

    logger.debug('[PageLoader] Started for route', { pathname: location.pathname });

    let currentProgress = 0;
    const interval = setInterval(() => {
      // Random increments for natural feel (10-25% jumps)
      const increment = Math.floor(Math.random() * 15) + 10;
      currentProgress += increment;

      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        
        // Hide loader with slight delay for smooth transition
        setTimeout(() => {
          setVisible(false);
          logger.debug('[PageLoader] Completed for route', { pathname: location.pathname });
        }, 200);
      } else {
        setProgress(currentProgress);
      }
    }, 120); // Update every 120ms for smooth animation

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <KoliSphereLoader
      fullscreen
      progress={progress}
      message={loadingMessages[language]}
      showPercentage
    />
  );
};

export default PageLoader;
