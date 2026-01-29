// Feature Error Boundary
// حد الأخطاء للميزات - يلتقط أخطاء feature معينة دون تعطيل التطبيق بأكمله

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '../../services/logger-service';

interface Props {
  children: ReactNode;
  featureName: string;
  fallbackUI?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  padding: 2rem;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 10px;
  margin: 1rem 0;
`;

const ErrorTitle = styled.h3`
  color: #856404;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.p`
  color: #856404;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ffca2c;
    transform: translateY(-1px);
  }
`;

class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to logger service
    logger.error(
      `Error in feature: ${this.props.featureName}`,
      error,
      {
        feature: this.props.featureName,
        componentStack: errorInfo.componentStack
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorTitle>
            ⚠️ {this.props.featureName} не може да се зареди
          </ErrorTitle>
          <ErrorMessage>
            Имаше проблем при зареждането на тази функционалност.
            Моля, опитайте отново.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            🔄 Опитай отново
          </RetryButton>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', color: '#856404' }}>
                Technical Details
              </summary>
              <pre style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#721c24' }}>
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;

