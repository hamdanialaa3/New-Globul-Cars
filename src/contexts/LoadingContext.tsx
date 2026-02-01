// src/contexts/LoadingContext.tsx
// Enhanced Loading Context with Professional Overlay
// Koli One - Bulgarian Car Marketplace
// Supports: Bulgarian (bg) and English (en)

import React, { createContext, useContext, useState, useCallback } from 'react';

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
      
      {/* Professional Loading Overlay */}
      {isLoading && (
        <div
          className="
            fixed inset-0 z-[9999] 
            bg-black/40 backdrop-blur-sm 
            flex flex-col items-center justify-center
            pointer-events-none
            transition-opacity duration-200
          "
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          {/* Loading Message */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
            {loadingMessage && (
              <p className="text-white text-sm md:text-base tracking-wide text-center px-4 font-medium">
                {loadingMessage}
              </p>
            )}
          </div>

          {/* Animated Gear and Progress */}
          <div className="flex flex-col items-center gap-4">
            {/* Mechanical Gear */}
            <div className="relative w-20 h-20">
              <div
                className="
                  absolute inset-0
                  border-4 border-gray-300/30 rounded-full
                  border-t-orange-500 border-r-orange-500
                  animate-spin
                "
                style={{ animationDuration: '1.5s' }}
              />
              <div
                className="
                  absolute inset-2
                  border-3 border-gray-400/40 rounded-full
                  border-b-orange-400 border-l-orange-400
                  animate-spin
                "
                style={{ animationDuration: '2s', animationDirection: 'reverse' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg" />
              </div>
            </div>

            {/* Progress Counter */}
            {progress > 0 && (
              <span 
                className="
                  text-white text-3xl md:text-4xl font-bold 
                  tabular-nums tracking-wider
                  drop-shadow-lg
                "
              >
                {Math.round(progress)}%
              </span>
            )}

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="w-48 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
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
