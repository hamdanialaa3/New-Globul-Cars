/**
 * FormFeedbackWrapper Component
 * Provides unified form submission feedback (loading, error, success states)
 * Prevents form re-submission during async operations
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React, { ReactNode, useState, useCallback } from 'react';
import styled from 'styled-components';
import { logger } from '@/services/logger-service';
import { Toast } from '@/components/Toast';

// ============================================================================
// TYPES
// ============================================================================

export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormFeedbackConfig {
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  successDuration?: number; // ms
  autoReset?: boolean;
}

export interface FormFeedbackContextType {
  status: FormStatus;
  error: Error | null;
  isLoading: boolean;
  handleSubmit: (fn: () => Promise<void>) => Promise<void>;
  setError: (error: Error | null) => void;
  reset: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

export const FormFeedbackContext = React.createContext<FormFeedbackContextType | undefined>(undefined);

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const FormContainer = styled.div`
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 100;
  pointer-events: none;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #1e40af;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #7f1d1d;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const FieldError = styled.span<{ visible: boolean }>`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  display: ${p => p.visible ? 'block' : 'none'};
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SuccessBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #dbeafe;
  color: #0c4a6e;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// ============================================================================
// HOOKS
// ============================================================================

export const useFormFeedback = (): FormFeedbackContextType => {
  const context = React.useContext(FormFeedbackContext);
  if (!context) {
    throw new Error('useFormFeedback must be used within FormFeedbackWrapper');
  }
  return context;
};

// ============================================================================
// COMPONENT
// ============================================================================

interface FormFeedbackWrapperProps {
  children: ReactNode;
  config?: FormFeedbackConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const FormFeedbackWrapper: React.FC<FormFeedbackWrapperProps> = ({
  children,
  config = {},
  onSuccess,
  onError
}) => {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const {
    successMessage = 'Operation completed successfully',
    errorMessage = 'Something went wrong. Please try again.',
    loadingMessage = 'Processing...',
    successDuration = 3000,
    autoReset = true
  } = config;

  const isLoading = status === 'loading';

  const handleSubmit = useCallback(
    async (fn: () => Promise<void>) => {
      try {
        setStatus('loading');
        setError(null);

        await fn();

        setStatus('success');
        logger.info('Form submitted successfully', { duration: successDuration });

        // Show success toast
        Toast.success(successMessage);
        onSuccess?.();

        // Auto-reset after duration
        if (autoReset) {
          setTimeout(() => {
            setStatus('idle');
          }, successDuration);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        
        setStatus('error');
        setError(error);
        
        logger.error('Form submission failed', error, {
          errorMessage: error.message,
          stack: error.stack
        });

        // Show error toast
        Toast.error(errorMessage);
        onError?.(error);
      }
    },
    [successMessage, errorMessage, successDuration, autoReset, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const contextValue: FormFeedbackContextType = {
    status,
    error,
    isLoading,
    handleSubmit,
    setError,
    reset
  };

  return (
    <FormFeedbackContext.Provider value={contextValue}>
      <FormContainer>
        {isLoading && (
          <LoadingOverlay>
            <div>
              <Spinner />
              <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                {loadingMessage}
              </p>
            </div>
          </LoadingOverlay>
        )}

        {error && status === 'error' && (
          <ErrorMessage>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error.message || errorMessage}</span>
          </ErrorMessage>
        )}

        {status === 'success' && (
          <SuccessBadge>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </SuccessBadge>
        )}

        {children}
      </FormContainer>
    </FormFeedbackContext.Provider>
  );
};

// ============================================================================
// EXPORT COMPONENTS
// ============================================================================

export default FormFeedbackWrapper;

/**
 * USAGE EXAMPLE:
 * 
 * <FormFeedbackWrapper
 *   config={{
 *     successMessage: 'Listing created successfully!',
 *     errorMessage: 'Failed to create listing',
 *     successDuration: 2000
 *   }}
 *   onSuccess={() => navigate('/my-listings')}
 * >
 *   <form onSubmit={(e) => {
 *     e.preventDefault();
 *     const { handleSubmit } = useFormFeedback();
 *     handleSubmit(async () => {
 *       await createListing(data);
 *     });
 *   }}>
 *     <input type="text" placeholder="Title" />
 *     <button type="submit" disabled={isLoading}>
 *       Create Listing
 *     </button>
 *   </form>
 * </FormFeedbackWrapper>
 */
