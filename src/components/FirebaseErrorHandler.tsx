// Firebase Error Handler Component
// Display clear error messages to the user

import React from 'react';
import { logger } from '../services/logger-service';

interface FirebaseErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const FirebaseErrorHandler: React.FC<FirebaseErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  showRetry = true 
}) => {
  if (!error) return null;

  const getErrorMessage = (error: Error): string => {
    const errorCode = (error as any).code;
    
    switch (errorCode) {
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/user-not-found':
        return 'User not found. Please verify your details or create a new account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/operation-not-allowed':
        return 'This operation is not currently allowed.';
      case 'permission-denied':
        return 'You do not have permission to access this data.';
      case 'unavailable':
        return 'Service is currently unavailable. Please try again later.';
      default:
        logger.warn('Unknown Firebase error', { code: errorCode, message: (error as Error).message });
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry: reload the page
      window.location.reload();
    }
  };

  return (
    <div style={{
      padding: '16px',
      margin: '16px 0',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      color: '#c33'
    }}>
      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
        ⚠️ Connection Error
      </div>
      <div style={{ marginBottom: '12px' }}>
        {getErrorMessage(error)}
      </div>
      {showRetry && (
        <button
          onClick={handleRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default FirebaseErrorHandler;