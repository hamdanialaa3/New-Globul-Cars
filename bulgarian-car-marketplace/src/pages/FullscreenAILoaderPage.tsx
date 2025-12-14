/**
 * Fullscreen AI Loader Page
 * Shows loading overlay initially, then main content
 */

import React, { useState, useEffect } from 'react';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import MainContent from '@/components/MainContent/MainContent';

interface FullscreenAILoaderPageProps {
  autoLoadDuration?: number; // Duration before auto-transitioning (default: 10000ms)
}

const FullscreenAILoaderPage: React.FC<FullscreenAILoaderPageProps> = ({ autoLoadDuration = 10000 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || '');

  useEffect(() => {
    // Auto-hide loader after specified duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, autoLoadDuration);

    return () => clearTimeout(timer);
  }, [autoLoadDuration]);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} apiKey={apiKey} />
      <MainContent isVisible={!isLoading} apiKey={apiKey} />
    </>
  );
};

export default FullscreenAILoaderPage;
