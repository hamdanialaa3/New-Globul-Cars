// src/pages/EmailVerificationPage.tsx
// Email Verification Landing Page

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { EmailVerificationService } from '@globul-cars/services/email-verification';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const VerificationCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  text-align: center;
`;

const IconContainer = styled.div<{ $status: 'success' | 'error' | 'loading' }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'success': return 'linear-gradient(135deg, #4caf50, #66bb6a)';
      case 'error': return 'linear-gradient(135deg, #f44336, #ef5350)';
      default: return 'linear-gradient(135deg, #FF7900, #ff8c1a)';
    }
  }};
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h1`
  color: #1a237e;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 16px;
`;

const Message = styled.p`
  color: #424242;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 8px;
  
  ${props => props.$variant === 'secondary' ? `
    background: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
    &:hover:not(:disabled) {
      background: #eeeeee;
      border-color: #ccc;
    }
  ` : `
    background: linear-gradient(135deg, #FF7900, #ff8c1a);
    color: white;
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 121, 0, 0.3);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #ffffff40;
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      if (!oobCode || mode !== 'verifyEmail') {
        setStatus('error');
        setMessage(t('emailVerification.invalidLink'));
        return;
      }

      try {
        const result = await EmailVerificationService.verifyEmailWithCode(oobCode);
        
        if (result.success) {
          setStatus('success');
          setMessage(t('emailVerification.successMessage'));
          
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('emailVerification.errorMessage'));
      }
    };

    verifyEmail();
  }, [searchParams, t, navigate]);

  const getTitle = () => {
    switch (status) {
      case 'success':
        return t('emailVerification.successTitle');
      case 'error':
        return t('emailVerification.errorTitle');
      default:
        return t('emailVerification.verifyingTitle');
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={40} />;
      case 'error':
        return <AlertCircle size={40} />;
      default:
        return <LoadingSpinner />;
    }
  };

  return (
    <PageContainer>
      <VerificationCard>
        <IconContainer $status={status}>
          {getIcon()}
        </IconContainer>

        <Title>{getTitle()}</Title>

        <Message>{message}</Message>

        {status !== 'loading' && (
          <div>
            <ActionButton onClick={() => navigate('/')}>
              <ArrowLeft size={20} />
              {t('emailVerification.goToHome')}
            </ActionButton>
            
            {status === 'error' && (
              <ActionButton 
                $variant="secondary"
                onClick={() => navigate('/login')}
              >
                <Mail size={20} />
                {t('emailVerification.goToLogin')}
              </ActionButton>
            )}
          </div>
        )}

        {status === 'success' && (
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '16px' }}>
            {t('emailVerification.autoRedirect')}
          </p>
        )}
      </VerificationCard>
    </PageContainer>
  );
};

export default EmailVerificationPage;