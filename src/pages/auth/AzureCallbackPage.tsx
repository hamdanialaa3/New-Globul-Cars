// src/pages/auth/AzureCallbackPage.tsx
// Azure OAuth Callback Handler Page

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { azureAuthService } from '@/services/auth/azure-auth.service';
import { logger } from '@/services/logger-service';

/**
 * Azure Callback Page
 * 
 * This page handles the OAuth redirect callback from Azure AD.
 * It processes the authentication result and redirects to appropriate page.
 * 
 * Route: /auth/azure/callback
 */
const AzureCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        logger.info('Processing Azure callback');

        // Handle the redirect response from Azure
        const result = await azureAuthService.handleRedirectCallback();

        if (result && result.success && result.account) {
          logger.info('Azure authentication successful', {
            username: result.account.username,
          });

          setStatus('success');

          // TODO: Save user to Firebase or your backend
          // Example:
          // await saveAzureUserToFirebase(result.account, result.idToken);

          // Redirect to dashboard or home page after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);

        } else if (result && !result.success) {
          // Login failed
          throw new Error(result.error || 'Authentication failed');
        } else {
          // No result - user might have navigated directly to this page
          logger.warn('No Azure callback result found');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }

      } catch (error) {
        logger.error('Azure callback processing failed', error as Error);
        setStatus('error');
        setErrorMessage((error as Error).message);

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Container>
      <Card>
        {status === 'loading' && (
          <>
            <Spinner />
            <Title>جارٍ تسجيل الدخول...</Title>
            <Description>الرجاء الانتظار بينما نتحقق من بيانات الاعتماد</Description>
          </>
        )}

        {status === 'success' && (
          <>
            <SuccessIcon>✓</SuccessIcon>
            <Title>تم تسجيل الدخول بنجاح!</Title>
            <Description>سيتم تحويلك إلى الصفحة الرئيسية...</Description>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon>✕</ErrorIcon>
            <Title>فشل تسجيل الدخول</Title>
            <Description>{errorMessage || 'حدث خطأ أثناء تسجيل الدخول'}</Description>
            <Description>سيتم تحويلك إلى صفحة تسجيل الدخول...</Description>
          </>
        )}
      </Card>
    </Container>
  );
};

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  border: 4px solid rgba(103, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4caf50;
  border-radius: 50%;
  color: white;
  font-size: 48px;
  font-weight: bold;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f44336;
  border-radius: 50%;
  color: white;
  font-size: 48px;
  font-weight: bold;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
`;

export default AzureCallbackPage;
