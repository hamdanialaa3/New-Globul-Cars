import { logger } from '../services/logger-service';
// src/components/SocialLogin.tsx
// Social Login Component for Bulgarian Car Marketplace

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { Chrome, Facebook, Apple } from 'lucide-react';
import PopupBlockerWarning from './PopupBlockerWarning';

// Styled Components
const SocialLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.grey[300]};
  }
  
  span {
    padding: 0 1rem;
    color: ${({ theme }) => theme.colors.grey[600]};
    font-size: 0.875rem;
  }
`;

const SocialButton = styled.button<{ $provider: 'google' | 'facebook' | 'apple' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: white;
  color: ${({ theme }) => theme.colors.grey[700]};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    border-color: ${({ theme, $provider: provider }) => {
      switch (provider) {
        case 'google': return '#4285f4';
        case 'facebook': return '#1877f2';
        case 'apple': return '#000';
        default: return theme.colors.primary.main;
      }
    }};
  background: ${({ theme, $provider: provider }) => {
      switch (provider) {
        case 'google': return '#f8f9ff';
        case 'facebook': return '#f0f2ff';
        case 'apple': return '#f8f9fa';
        default: return theme.colors.grey[50];
      }
    }};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const IconWrapper = styled.div<{ $provider: 'google' | 'facebook' | 'apple' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${({ $provider: provider }) => {
    switch (provider) {
      case 'google': return '#4285f4';
      case 'facebook': return '#1877f2';
      case 'apple': return '#000';
      default: return '#666';
    }
  }};
`;

interface SocialLoginProps {
  onGoogleLogin?: () => Promise<void>;
  onFacebookLogin?: () => Promise<void>;
  onAppleLogin?: () => Promise<void>;
  onError?: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleLogin,
  onFacebookLogin,
  onAppleLogin,
  onError,
  loading = false,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [popupError, setPopupError] = useState<{
    provider: 'Google' | 'Facebook' | 'Apple';
    show: boolean;
  } | null>(null);

  const handleGoogleLogin = async () => {
    if (onGoogleLogin && !loading && !disabled) {
      try {
        setPopupError(null);
        await onGoogleLogin();
      } catch (error: unknown) {
        logger.error('Google login error:', error);
        if (error.message?.includes('popup') || error.message?.includes('blocked')) {
          setPopupError({ provider: 'Google', show: true });
        } else if (onError) {
          onError(error.message || 'Google login failed');
        }
      }
    }
  };

  const handleFacebookLogin = async () => {
    if (onFacebookLogin && !loading && !disabled) {
      try {
        setPopupError(null);
        await onFacebookLogin();
      } catch (error: unknown) {
        logger.error('Facebook login error:', error);
        if (error.message?.includes('popup') || error.message?.includes('blocked')) {
          setPopupError({ provider: 'Facebook', show: true });
        } else if (onError) {
          onError(error.message || 'Facebook login failed');
        }
      }
    }
  };

  const handleAppleLogin = async () => {
    if (onAppleLogin && !loading && !disabled) {
      try {
        setPopupError(null);
        await onAppleLogin();
      } catch (error: unknown) {
        logger.error('Apple login error:', error);
        if (error.message?.includes('popup') || error.message?.includes('blocked')) {
          setPopupError({ provider: 'Apple', show: true });
        } else if (onError) {
          onError(error.message || 'Apple login failed');
        }
      }
    }
  };

  const handleRetry = () => {
    setPopupError(null);
    if (popupError?.provider === 'Google') {
      handleGoogleLogin();
    } else if (popupError?.provider === 'Facebook') {
      handleFacebookLogin();
    } else if (popupError?.provider === 'Apple') {
      handleAppleLogin();
    }
  };

  return (
    <SocialLoginContainer>
      <Divider>
        <span>{t('auth.orContinueWith', 'Or continue with')}</span>
      </Divider>

      {onGoogleLogin && (
        <SocialButton
          $provider="google"
          onClick={handleGoogleLogin}
          disabled={loading || disabled}
          type="button"
        >
          <IconWrapper $provider="google">
            <Chrome size={20} />
          </IconWrapper>
          {t('auth.continueWithGoogle', 'Continue with Google')}
        </SocialButton>
      )}

      {onFacebookLogin && (
        <SocialButton
          $provider="facebook"
          onClick={handleFacebookLogin}
          disabled={loading || disabled}
          type="button"
        >
          <IconWrapper $provider="facebook">
            <Facebook size={20} />
          </IconWrapper>
          {t('auth.continueWithFacebook', 'Continue with Facebook')}
        </SocialButton>
      )}

      {onAppleLogin && (
        <SocialButton
          $provider="apple"
          onClick={handleAppleLogin}
          disabled={loading || disabled}
          type="button"
        >
          <IconWrapper $provider="apple">
            <Apple size={20} />
          </IconWrapper>
          {t('auth.continueWithApple', 'Continue with Apple')}
        </SocialButton>
      )}

      {popupError?.show && (
        <PopupBlockerWarning
          provider={popupError.provider}
          onRetry={handleRetry}
        />
      )}
    </SocialLoginContainer>
  );
};

export default SocialLogin;
