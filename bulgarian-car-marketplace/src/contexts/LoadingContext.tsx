// src/contexts/LoadingContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (isLoading: boolean, message?: string) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('تحميل...');

  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    setIsLoadingState(isLoading);
    if (message) {
      setLoadingMessage(message);
    }
  }, []);

  const showLoading = useCallback((message?: string) => {
    setLoadingMessage(message || 'تحميل...');
    setIsLoadingState(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoadingState(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, setLoading, showLoading, hideLoading }}>
      {children}
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
