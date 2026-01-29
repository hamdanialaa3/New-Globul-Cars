// src/components/ErrorBoundary/ErrorBoundary.tsx
// Professional Error Boundary with Bulgarian bilingual support

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../services/logger-service';
import * as S from './styles';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logger.error('ErrorBoundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary'
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default professional error UI
      return (
        <S.ErrorContainer>
          <S.ErrorIcon>⚠️</S.ErrorIcon>
          <S.ErrorTitle>Възникна грешка / An Error Occurred</S.ErrorTitle>
          <S.ErrorMessage>
            Нещо се обърка. Моля, опитайте отново.
            <br />
            Something went wrong. Please try again.
          </S.ErrorMessage>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <S.ErrorDetails>
              <S.ErrorDetailsTitle>Development Error Details:</S.ErrorDetailsTitle>
              <S.ErrorDetailsContent>
                <strong>Error:</strong> {this.state.error.toString()}
                {this.state.errorInfo && (
                  <>
                    <br />
                    <strong>Component Stack:</strong>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </>
                )}
              </S.ErrorDetailsContent>
            </S.ErrorDetails>
          )}

          <S.ButtonGroup>
            <S.PrimaryButton onClick={this.handleReload}>
              🔄 Презареди страницата / Reload Page
            </S.PrimaryButton>
            <S.SecondaryButton onClick={this.handleGoHome}>
              🏠 Към началната страница / Go Home
            </S.SecondaryButton>
          </S.ButtonGroup>
        </S.ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
