/**
 * Route Error Boundary
 * Phase 1 (P1.8): Wrap routes to catch errors
 * 
 * Usage:
 * <Route path="/profile" element={
 *   <RouteErrorBoundary>
 *     <ProfilePage />
 *   </RouteErrorBoundary>
 * } />
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '@globul-cars/services';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to service
    logger.error('Route Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'RouteErrorBoundary'
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload page
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
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
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Нещо се обърка / Something went wrong</ErrorTitle>
          <ErrorMessage>
            {process.env.NODE_ENV === 'development' && this.state.error
              ? this.state.error.message
              : 'Възникна грешка при зареждане на страницата.'}
          </ErrorMessage>
          
          <ButtonGroup>
            <Button onClick={this.handleReset} primary>
              🔄 Опитай отново / Retry
            </Button>
            <Button onClick={this.handleGoHome}>
              🏠 Начална страница / Home
            </Button>
          </ButtonGroup>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <DebugInfo>
              <DebugTitle>Stack trace (development only):</DebugTitle>
              <DebugContent>
                {this.state.errorInfo.componentStack}
              </DebugContent>
            </DebugInfo>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Styled Components
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h1`
  font-size: 1.5rem;
  color: #dc2626;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: #6b7280;
  max-width: 500px;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  background: ${props => props.primary ? '#FF8F10' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#374151'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? '#e67e00' : '#f3f4f6'};
    transform: translateY(-1px);
  }
`;

const DebugInfo = styled.div`
  margin-top: 3rem;
  max-width: 800px;
  text-align: left;
`;

const DebugTitle = styled.h3`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const DebugContent = styled.pre`
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.75rem;
  color: #374151;
`;

export default RouteErrorBoundary;

