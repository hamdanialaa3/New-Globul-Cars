// OAuth Callback Handler - Receives auth codes from social platforms
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import socialMediaService from '@/services/social/social-media.service';
import { SocialPlatform } from '@/types/social-media.types';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  const t = {
    bg: {
      processing: 'Обработка на връзката...',
      success: 'Успешно свързан!',
      error: 'Грешка при свързването',
      redirecting: 'Пренасочване...',
      errors: {
        noCode: 'Липсва код за оторизация',
        noState: 'Липсва state параметър',
        stateMismatch: 'State несъответствие - възможна CSRF атака',
        noPlatform: 'Неизвестна платформа',
        userDenied: 'Отказано от потребителя',
        noUser: 'Не сте влезли в системата',
        exchangeFailed: 'Грешка при обмяна на токен'
      }
    },
    en: {
      processing: 'Processing connection...',
      success: 'Successfully connected!',
      error: 'Connection error',
      redirecting: 'Redirecting...',
      errors: {
        noCode: 'Authorization code missing',
        noState: 'State parameter missing',
        stateMismatch: 'State mismatch - possible CSRF attack',
        noPlatform: 'Unknown platform',
        userDenied: 'Access denied by user',
        noUser: 'Not logged in',
        exchangeFailed: 'Token exchange failed'
      }
    }
  };

  const text = t[language];

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for user denial
      if (error === 'access_denied') {
        setStatus('error');
        setMessage(text.errors.userDenied);
        setTimeout(() => navigate('/profile?tab=settings'), 3000);
        return;
      }

      // Validate required parameters
      if (!code) {
        throw new Error(text.errors.noCode);
      }

      if (!state) {
        throw new Error(text.errors.noState);
      }

      // Verify state
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error(text.errors.stateMismatch);
      }

      // Get platform
      const platform = sessionStorage.getItem('oauth_platform') as SocialPlatform;
      if (!platform) {
        throw new Error(text.errors.noPlatform);
      }

      // Verify user is logged in
      if (!user?.uid) {
        throw new Error(text.errors.noUser);
      }

      // Exchange code for token (via backend)
      await socialMediaService.exchangeCodeForToken(
        user.uid,
        platform,
        code,
        `${window.location.origin}/oauth/callback`
      );

      // Success
      setStatus('success');
      setMessage(text.success);

      // Clean up
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_platform');

      // Redirect back to settings
      setTimeout(() => {
        navigate('/profile?tab=settings');
      }, 2000);

    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || text.error);

      // Redirect after error
      setTimeout(() => {
        navigate('/profile?tab=settings');
      }, 3000);
    }
  };

  return (
    <Container>
      <Card $status={status}>
        {status === 'processing' && (
          <>
            <IconWrapper>
              <Loader size={64} className="spin" />
            </IconWrapper>
            <Title>{text.processing}</Title>
          </>
        )}

        {status === 'success' && (
          <>
            <IconWrapper $success>
              <CheckCircle size={64} />
            </IconWrapper>
            <Title>{text.success}</Title>
            <Message>{text.redirecting}</Message>
          </>
        )}

        {status === 'error' && (
          <>
            <IconWrapper $error>
              <XCircle size={64} />
            </IconWrapper>
            <Title>{text.error}</Title>
            <Message>{message}</Message>
          </>
        )}
      </Card>
    </Container>
  );
};

export default OAuthCallback;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Card = styled.div<{ $status: string }>`
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IconWrapper = styled.div<{ $success?: boolean; $error?: boolean }>`
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => 
    p.$success ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
    p.$error ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  
  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c2c2c;
  margin: 0 0 12px 0;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
  line-height: 1.6;
`;

