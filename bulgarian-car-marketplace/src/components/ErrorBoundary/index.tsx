import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { serviceLogger } from '../../services/logger-service';

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

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to service
    serviceLogger.error('ErrorBoundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Fallback component with language support
const ErrorBoundaryFallback: React.FC<{
  error: Error | null;
  onReset: () => void;
}> = ({ error, onReset }) => {
  const { t } = useLanguage();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <S.ErrorContainer>
      <S.ErrorCard>
        <S.ErrorIcon>⚠️</S.ErrorIcon>
        <S.ErrorTitle>{t('errors.unexpected_error')}</S.ErrorTitle>
        <S.ErrorMessage>
          {t('errors.something_went_wrong')}
        </S.ErrorMessage>
        
        {error && (
          <S.ErrorDetails>
            <S.ErrorDetailsTitle>{t('errors.technical_details')}</S.ErrorDetailsTitle>
            <S.ErrorCode>{error.message}</S.ErrorCode>
          </S.ErrorDetails>
        )}

        <S.ButtonGroup>
          <S.PrimaryButton onClick={onReset}>
            {t('errors.try_again')}
          </S.PrimaryButton>
          <S.SecondaryButton onClick={handleReload}>
            {t('errors.reload_page')}
          </S.SecondaryButton>
        </S.ButtonGroup>

        <S.HelpText>
          {t('errors.persist_contact_support')}
        </S.HelpText>
      </S.ErrorCard>
    </S.ErrorContainer>
  );
};

// Styled components
const S = {
  ErrorContainer: styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.colors.background};
    padding: 20px;
  `,

  ErrorCard: styled.div`
    background: ${({ theme }) => theme.colors.white};
    border-radius: 12px;
    padding: 40px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  `,

  ErrorIcon: styled.div`
    font-size: 64px;
    margin-bottom: 20px;
  `,

  ErrorTitle: styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 12px;
  `,

  ErrorMessage: styled.p`
    font-size: 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 24px;
    line-height: 1.5;
  `,

  ErrorDetails: styled.details`
    text-align: left;
    margin-bottom: 24px;
    padding: 16px;
    background: ${({ theme }) => theme.colors.background};
    border-radius: 8px;
    cursor: pointer;

    &[open] {
      cursor: default;
    }
  `,

  ErrorDetailsTitle: styled.summary`
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 8px;
    cursor: pointer;
  `,

  ErrorCode: styled.pre`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.error};
    white-space: pre-wrap;
    word-break: break-word;
    margin: 8px 0 0 0;
    font-family: 'Courier New', monospace;
  `,

  ButtonGroup: styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 16px;
  `,

  PrimaryButton: styled.button`
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
    }
  `,

  SecondaryButton: styled.button`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  `,

  HelpText: styled.p`
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
};

// Export wrapper component
export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

// Export HOC for wrapping components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;
