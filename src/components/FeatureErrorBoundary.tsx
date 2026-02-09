/**
 * Feature-Level Error Boundaries
 * 
 * Wraps critical feature areas with isolated error boundaries
 * so a crash in one feature doesn't take down the entire app.
 * 
 * Usage:
 *   <MessagingErrorBoundary>
 *     <MessagingComponent />
 *   </MessagingErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '@/services/logger-service';

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic feature-level error boundary.
 * Logs errors with feature context and shows a compact, non-disruptive fallback.
 */
class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, FeatureErrorBoundaryState> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error(`[${this.props.featureName}] Error caught by boundary:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <FeatureErrorContainer>
          <FeatureErrorIcon>⚠️</FeatureErrorIcon>
          <FeatureErrorText>
            Нещо се обърка в {this.props.featureName}.
          </FeatureErrorText>
          <FeatureRetryButton onClick={this.handleRetry}>
            Опитайте отново
          </FeatureRetryButton>
        </FeatureErrorContainer>
      );
    }

    return this.props.children;
  }
}

// Pre-configured boundaries for critical features
export const MessagingErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Съобщения">
    {children}
  </FeatureErrorBoundary>
);

export const CarDetailsErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Детайли за автомобил">
    {children}
  </FeatureErrorBoundary>
);

export const SellWorkflowErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Продажба">
    {children}
  </FeatureErrorBoundary>
);

export const SearchErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Търсене">
    {children}
  </FeatureErrorBoundary>
);

export const PaymentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Плащане">
    {children}
  </FeatureErrorBoundary>
);

export const ProfileErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Профил">
    {children}
  </FeatureErrorBoundary>
);

export const MapErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureErrorBoundary featureName="Карта">
    {children}
  </FeatureErrorBoundary>
);

export default FeatureErrorBoundary;

// Styled components
const FeatureErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 1rem 0;
  text-align: center;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e5e7eb);
  min-height: 120px;
`;

const FeatureErrorIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const FeatureErrorText = styled.p`
  color: var(--text-secondary, #6b7280);
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const FeatureRetryButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #FF7900, #FF8F10);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid #FF7900;
    outline-offset: 2px;
  }
`;
