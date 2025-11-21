// src/components/AuthGuard.tsx
// Authentication Guard Component with Translation Support

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@globul-cars/core/contextsAuthProvider';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import styled from 'styled-components';
import { Lock, LogIn, Home } from 'lucide-react';

const LoginRequiredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
`;

const MessageCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
`;

const LockIcon = styled.div`
  margin-bottom: 1.5rem;
  color: #ff6b6b;
  display: flex;
  justify-content: center;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LoginButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
`;

const BackButton = styled(LoginButton)`
  background: #6c757d;
  
  &:hover {
    background: #5a6268;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`;

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const LoginRequiredMessage: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  const getPageName = (pathname: string): string => {
    const pageMap: { [key: string]: string } = {
      '/advanced-search': t('auth.pageNames.advancedSearch'),
      '/sell': t('auth.pageNames.sell'),
      '/sell-car': t('auth.pageNames.sellCar'),
      '/brand-gallery': t('auth.pageNames.brandGallery'),
      '/dealers': t('auth.pageNames.dealers'),
      '/finance': t('auth.pageNames.finance')
    };
    return pageMap[pathname] || t('auth.pageNames.thisPage');
  };

  return (
    <LoginRequiredContainer>
      <MessageCard>
        <LockIcon>
          <Lock size={64} />
        </LockIcon>
        <Title>{t('auth.required.title')}</Title>
        <Message>
          {t('auth.required.message')}
          <br /><br />
          <strong>{getPageName(location.pathname)}</strong>
          <br /><br />
          {t('auth.required.enjoyFeatures')}
        </Message>
        <div>
          <LoginButton onClick={handleLogin}>
            <LogIn size={20} />
            {t('auth.required.loginButton')}
          </LoginButton>
          <BackButton onClick={handleBack}>
            <Home size={20} />
            {t('auth.required.backButton')}
          </BackButton>
        </div>
      </MessageCard>
    </LoginRequiredContainer>
  );
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  // Loading state
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>{t('common.loading')}</LoadingText>
      </LoadingContainer>
    );
  }

  // Authentication required but user not logged in
  if (requireAuth && !user) {
    return <LoginRequiredMessage />;
  }

  // All good, render children
  return <>{children}</>;
};

export default AuthGuard;