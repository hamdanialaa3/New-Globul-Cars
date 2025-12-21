/**
 * Fullscreen AI Loader Page
 * Shows loading overlay initially, then main content
 * Updated: Using lightweight loader for better performance
 */

import React, { useState, useEffect } from 'react';
import LightweightLoadingOverlay from '@/components/LoadingOverlay/LightweightLoadingOverlay';
import MainContent from '@/components/MainContent/MainContent';

interface FullscreenAILoaderPageProps {
  autoLoadDuration?: number; // Duration before auto-transitioning (default: 10000ms)
}

const FullscreenAILoaderPage: React.FC<FullscreenAILoaderPageProps> = ({ autoLoadDuration = 10000 }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-hide loader after specified duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, autoLoadDuration);

    return () => clearTimeout(timer);
  }, [autoLoadDuration]);

  return (
    <>
      <LightweightLoadingOverlay isVisible={isLoading} />
      <MainContent isVisible={!isLoading} />
    </>
  );
};

export default FullscreenAILoaderPage;
