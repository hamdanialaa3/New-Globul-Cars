// Global Error Boundary
// حد الأخطاء العام - يلتقط جميع الأخطاء غير المتوقعة

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '@globul-cars/services';

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

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ErrorCard = styled.div`
  background: white;
  color: #2c3e50;
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #e74c3c;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
  color: #7f8c8d;
`;

const ErrorDetails = styled.details`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  font-family: monospace;
  font-size: 0.9rem;
  
  summary {
    cursor: pointer;
    font-weight: 600;
    color: #3498db;
    margin-bottom: 0.5rem;
    
    &:hover {
      color: #2980b9;
    }
  }
  
  pre {
    margin-top: 1rem;
    overflow-x: auto;
    color: #e74c3c;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #ecf0f1;
    color: #2c3e50;
    
    &:hover {
      background: #bdc3c7;
    }
  `}
`;

class GlobalErrorBoundary extends Component<Props, State> {
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
    // Log to logger service
    logger.fatal('Uncaught error in component tree', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary'
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>😔</ErrorIcon>
            <ErrorTitle>Нещо се обърка</ErrorTitle>
            <ErrorTitle style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>
              Something went wrong
            </ErrorTitle>
            
            <ErrorMessage>
              Възникна неочаквана грешка. Моля, опитайте отново или се свържете с поддръжката.
            </ErrorMessage>
            
            <ErrorMessage style={{ fontSize: '0.95rem' }}>
              An unexpected error occurred. Please try again or contact support.
            </ErrorMessage>

            <ButtonGroup>
              <Button variant="primary" onClick={this.handleReload}>
                🔄 Презареди / Reload
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome}>
                🏠 Начало / Home
              </Button>
            </ButtonGroup>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <summary>🔍 Technical Details (Development Only)</summary>
                <pre>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {'\n\n'}
                  <strong>Stack:</strong>{'\n'}
                  {this.state.error.stack}
                  {'\n\n'}
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>{'\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </ErrorDetails>
            )}
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

