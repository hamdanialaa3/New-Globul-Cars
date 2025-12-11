// src/components/Toast/ToastContainer.tsx
// Toast Container & Manager - مدير الإشعارات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from './Toast';

// ==================== TYPES ====================

interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// ==================== CONTEXT ====================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// ==================== PROVIDER ====================

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    title?: string,
    duration?: number
  ) => {
    // ⚡ FIX: Prevent duplicate toasts with the same message
    setToasts(prev => {
      // Check if a toast with the same message already exists
      const isDuplicate = prev.some(
        toast => toast.message === message && toast.type === type
      );
      
      if (isDuplicate) {
        // If duplicate exists, don't add a new one
        return prev;
      }
      
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastData = {
        id,
        type,
        title,
        message,
        duration
      };
      
      return [...prev, newToast];
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showToast('success', message, title, 5000);
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast('error', message, title, 7000);
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast('warning', message, title, 6000);
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast('info', message, title, 5000);
  }, [showToast]);

  const value = {
    showToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ marginBottom: index > 0 ? '12px' : '0' }}>
            <Toast
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

