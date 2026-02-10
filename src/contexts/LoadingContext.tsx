// src/contexts/LoadingContext.tsx
// Enhanced Loading Context with Glass Sphere Loader
// Koli One - Bulgarian Car Marketplace
// Supports: Bulgarian (bg) and English (en)

import React, { createContext, useContext, useState, useCallback } from 'react';
import { KoliSphereLoader } from '../components/KoliSphereLoader';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  progress: number;
  setLoading: (isLoading: boolean, message?: string) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgressState] = useState(0);

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setIsLoadingState(isLoading);
    if (message) {
      setLoadingMessage(message);
    }
    if (!isLoading) {
      setProgressState(0);
    }
  }, []);

  const showLoading = useCallback((message?: string) => {
    setLoadingMessage(message || '');
    setIsLoadingState(true);
    setProgressState(0);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoadingState(false);
    setProgressState(0);
  }, []);

  const setProgress = useCallback((newProgress: number) => {
    setProgressState(Math.min(100, Math.max(0, newProgress)));
  }, []);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        loadingMessage, 
        progress,
        setLoading, 
        showLoading, 
        hideLoading,
        setProgress
      }}
    >
      {children}
      
      {/* Glass Sphere Loading Overlay */}
      {isLoading && (
        <KoliSphereLoader
          fullscreen
          progress={progress > 0 ? progress : undefined}
          message={loadingMessage}
          showPercentage={progress > 0}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};
