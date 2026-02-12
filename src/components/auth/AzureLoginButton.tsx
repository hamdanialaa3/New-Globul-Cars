// src/components/auth/AzureLoginButton.tsx
// Azure (Microsoft) Login Button Component

import React, { useState } from 'react';
import styled from 'styled-components';
import { azureAuthService } from '@/services/auth/azure-auth.service';
import { AZURE_INTEGRATION } from '@/config/azure-config';
import { logger } from '@/services/logger-service';

interface AzureLoginButtonProps {
  /** Button display mode */
  mode?: 'popup' | 'redirect';
  /** Custom button text */
  text?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Full width button */
  fullWidth?: boolean;
  /** Callback after successful login */
  onSuccess?: (user: any) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

const AzureLoginButton: React.FC<AzureLoginButtonProps> = ({
  mode = 'popup',
  text,
  variant = 'outline',
  fullWidth = false,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  // Don't render if Azure is not enabled
  if (!AZURE_INTEGRATION.enabled) {
    return null;
  }

  const handleLogin = async () => {
    setLoading(true);

    try {
      logger.info('Azure login initiated', { mode });

      // Use the centralized Bulgarian Auth Service (Firebase)
      // This automatically handles Popup flow, User creation/update, and numeric ID assignment
      const { BulgarianAuthService } = await import('@/firebase/auth-service');
      const result = await BulgarianAuthService.getInstance().signInWithMicrosoft();

      if (result.user) {
        logger.info('Azure login successful', {
          uid: result.user.uid,
          email: result.user.email
        });

        onSuccess?.(result.user);
      } else {
        throw new Error('Login failed - no user returned');
      }

    } catch (error) {
      logger.error('Azure login failed', error as Error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Show setup message if not configured
  if (AZURE_INTEGRATION.requiresSetup) {
    return (
      <SetupMessage>
        Azure authentication requires setup. See AZURE_SETUP_GUIDE.md
      </SetupMessage>
    );
  }

  return (
    <StyledButton
      onClick={handleLogin}
      disabled={loading}
      $variant={variant}
      $fullWidth={fullWidth}
    >
      <IconWrapper>
        {loading ? (
          <Spinner />
        ) : (
          <MicrosoftIcon />
        )}
      </IconWrapper>

      <ButtonText>
        {loading
          ? 'Signing in...'
          : text || 'Sign in with Microsoft'
        }
      </ButtonText>
    </StyledButton>
  );
};

// ============================================================================
// Styled Components
// ============================================================================

const StyledButton = styled.button<{
  $variant: 'primary' | 'secondary' | 'outline';
  $fullWidth: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-width: 280px;
  padding: 12px 24px;
  
  font-size: 1rem;
  font-weight: 500;
  
  border: ${props => {
    if (props.$variant === 'outline') return '2px solid #0078d4';
    return 'none';
  }};
  
  border-radius: 8px;
  
  background: ${props => {
    if (props.$variant === 'primary') return '#0078d4';
    if (props.$variant === 'secondary') return '#f3f2f1';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.$variant === 'primary') return '#ffffff';
    if (props.$variant === 'secondary') return '#201f1e';
    return '#0078d4';
  }};
  
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => {
    if (props.$variant === 'primary') return '#106ebe';
    if (props.$variant === 'secondary') return '#e1dfdd';
    return 'rgba(0, 120, 212, 0.1)';
  }};
    
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 120, 212, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.span`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

// Microsoft Logo Icon (SVG)
const MicrosoftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="11" height="11" fill="#F25022" />
    <rect x="12" width="11" height="11" fill="#7FBA00" />
    <rect y="12" width="11" height="11" fill="#00A4EF" />
    <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
  </svg>
);

// Loading Spinner
const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SetupMessage = styled.div`
  padding: 12px 16px;
  background: #fff4ce;
  border: 1px solid #ffd335;
  border-radius: 8px;
  color: #8a6d3b;
  font-size: 0.9rem;
  text-align: center;
`;

export default AzureLoginButton;
