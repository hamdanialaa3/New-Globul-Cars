// src/components/guards/AuthGuard.tsx
/**
 * Unified Authentication Guard Component
 * 
 * Consolidates all auth protection logic into a single, flexible component
 * Replaces: ProtectedRoute, AdminRoute, and legacy AuthGuard
 * 
 * Features:
 * - Flexible permission system (auth, admin, verified)
 * - Beautiful UI for unauthorized access
 * - Translation support (BG/EN)
 * - Loading states
 * - Customizable redirects
 * 
 * @example Basic auth protection
 * <AuthGuard requireAuth={true}>
 *   <DashboardPage />
 * </AuthGuard>
 * 
 * @example Admin-only protection
 * <AuthGuard requireAuth={true} requireAdmin={true}>
 *   <AdminPanel />
 * </AuthGuard>
 * 
 * @example Email verification required
 * <AuthGuard requireAuth={true} requireVerified={true}>
 *   <SellCarPage />
 * </AuthGuard>
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import { Lock, LogIn, Home, Shield, Mail } from 'lucide-react';

// ==========================================
// Styled Components
// ==========================================

const GuardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  background: linear-gradient(135deg, var(--accent-primary, #FF6B35) 0%, var(--accent-secondary, #FF8C61) 100%);
  padding: 2rem;
  text-align: center;
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    background: linear-gradient(135deg, rgba(26, 29, 46, 0.95) 0%, rgba(45, 49, 66, 0.98) 100%);
  }
`;

const MessageCard = styled.div`
  background: var(--bg-card, #FFFFFF);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: var(--shadow-xl, 0 20px 50px rgba(0, 0, 0, 0.15));
  max-width: 500px;
  width: 100%;
  border: 1px solid var(--border-primary, #E2E8F0);
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    background: var(--bg-card, rgba(26, 29, 46, 0.95));
    border-color: var(--border-primary, rgba(255, 255, 255, 0.1));
    box-shadow: var(--shadow-xl, 0 20px 50px rgba(0, 0, 0, 0.4));
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const IconWrapper = styled.div<{ $variant?: 'error' | 'warning' | 'info' }>`
  margin-bottom: 1.5rem;
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'error': return 'var(--error, #EF4444)';
      case 'warning': return 'var(--warning, #F59E0B)';
      case 'info': return 'var(--info, #3B82F6)';
      default: return 'var(--accent-primary, #FF6B35)';
    }
  }};
  display: flex;
  justify-content: center;
`;

const Title = styled.h2`
  color: var(--text-primary, #1A1D2E);
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    color: var(--text-primary, #FFFFFF);
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Message = styled.p`
  color: var(--text-secondary, #4A5568);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    color: var(--text-secondary, rgba(255, 255, 255, 0.8));
  }
  
  strong {
    color: var(--accent-primary, #FF6B35);
    font-weight: 600;
    
    [data-theme="dark"] &, .dark-theme & {
      color: var(--accent-primary, #FF6B35);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'var(--btn-secondary-bg, #FFFFFF)'
      : 'var(--btn-primary-bg, #FF6B35)'
  };
  color: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'var(--btn-secondary-text, #1A1D2E)'
      : 'var(--btn-primary-text, #FFFFFF)'
  };
  border: ${({ $variant }) =>
    $variant === 'secondary'
      ? '2px solid var(--btn-secondary-border, #E2E8F0)'
      : 'none'
  };
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ $variant }) =>
    $variant === 'primary'
      ? 'var(--shadow-button, 0 2px 6px rgba(255, 107, 53, 0.25))'
      : 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08))'
  };
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $variant }) =>
    $variant === 'primary'
      ? 'var(--shadow-hover, 0 4px 16px rgba(0, 0, 0, 0.12))'
      : 'var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1))'
  };
    background: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'var(--btn-secondary-hover, #F8F9FA)'
      : 'var(--btn-primary-hover, #FF8C61)'
  };
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    ${({ $variant }) =>
    $variant === 'secondary' && `
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary, #FFFFFF);
      border-color: rgba(255, 255, 255, 0.2);
    `}
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 107, 53, 0.2);
  border-top-color: var(--accent-primary, #FF6B35);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: var(--text-secondary, #4A5568);
  font-size: 1rem;
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    color: var(--text-secondary, rgba(255, 255, 255, 0.8));
  }
`;

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface AuthGuardProps {
  children: React.ReactNode;

  /**
   * Require user to be authenticated
   * @default true
   */
  requireAuth?: boolean;

  /**
   * Require user to have admin role
   * @default false
   */
  requireAdmin?: boolean;

  /**
   * Require user to have verified email
   * @default false
   */
  requireVerified?: boolean;

  /**
   * Custom redirect path for unauthorized access
   * @default '/login' for auth, '/' for admin/verified
   */
  redirectTo?: string;

  /**
   * Show UI message instead of redirecting
   * @default true
   */
  showMessage?: boolean;
}

// ==========================================
// Message Components
// ==========================================

/**
 * Login Required Message
 * Shown when user needs to authenticate
 */
const LoginRequiredMessage: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const handleLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  const getPageName = (pathname: string): string => {
    const pageMap: { [key: string]: string } = {
      '/advanced-search': t('auth.pageNames.advancedSearch'),
      '/sell': t('auth.pageNames.sell'),
      '/sell/auto': t('auth.pageNames.sellCar'),
      '/sell-car': t('auth.pageNames.sellCar'),
      '/brand-gallery': t('auth.pageNames.brandGallery'),
      '/dealers': t('auth.pageNames.dealers'),
      '/finance': t('auth.pageNames.finance'),
      '/profile': t('auth.pageNames.profile'),
      '/dashboard': t('auth.pageNames.dashboard'),
    };
    return pageMap[pathname] || t('auth.pageNames.thisPage');
  };

  return (
    <GuardContainer>
      <MessageCard>
        <IconWrapper $variant="error">
          <Lock size={64} />
        </IconWrapper>
        <Title>{t('auth.required.title')}</Title>
        <Message>
          {t('auth.required.message')}
          <br /><br />
          <strong>{getPageName(location.pathname)}</strong>
          <br /><br />
          {t('auth.required.enjoyFeatures')}
        </Message>
        <ButtonGroup>
          <Button onClick={handleLogin}>
            <LogIn size={20} />
            {t('auth.required.loginButton')}
          </Button>
          <Button $variant="secondary" onClick={handleBack}>
            <Home size={20} />
            {t('auth.required.backButton')}
          </Button>
        </ButtonGroup>
      </MessageCard>
    </GuardContainer>
  );
};

/**
 * Admin Required Message
 * Shown when user needs admin privileges
 */
const AdminRequiredMessage: React.FC = () => {
  const { t } = useLanguage();

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <GuardContainer>
      <MessageCard>
        <IconWrapper $variant="warning">
          <Shield size={64} />
        </IconWrapper>
        <Title>{t('auth.adminRequired.title') || 'Admin Access Required'}</Title>
        <Message>
          {t('auth.adminRequired.message') || 'This page is only accessible to administrators. Please contact support if you believe this is an error.'}
        </Message>
        <ButtonGroup>
          <Button $variant="secondary" onClick={handleBack}>
            <Home size={20} />
            {t('auth.required.backButton')}
          </Button>
        </ButtonGroup>
      </MessageCard>
    </GuardContainer>
  );
};

/**
 * Email Verification Required Message
 * Shown when user needs to verify their email
 */
const VerificationRequiredMessage: React.FC = () => {
  const { t } = useLanguage();

  const handleVerify = () => {
    window.location.href = '/verification';
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <GuardContainer>
      <MessageCard>
        <IconWrapper $variant="info">
          <Mail size={64} />
        </IconWrapper>
        <Title>{t('auth.verificationRequired.title') || 'Email Verification Required'}</Title>
        <Message>
          {t('auth.verificationRequired.message') || 'Please verify your email address to access this feature. Check your inbox for the verification link.'}
        </Message>
        <ButtonGroup>
          <Button onClick={handleVerify}>
            <Mail size={20} />
            {t('auth.verificationRequired.verifyButton') || 'Verify Email'}
          </Button>
          <Button $variant="secondary" onClick={handleBack}>
            <Home size={20} />
            {t('auth.required.backButton')}
          </Button>
        </ButtonGroup>
      </MessageCard>
    </GuardContainer>
  );
};

// ==========================================
// Main AuthGuard Component
// ==========================================

/**
 * Unified Authentication Guard
 * 
 * Handles all authentication and authorization checks
 * Replaces ProtectedRoute, AdminRoute, and legacy AuthGuard
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireVerified = false,
  redirectTo,
  showMessage = true,
}) => {
  const { currentUser, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // ==========================================
  // Loading State
  // ==========================================
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>{t('common.loading')}</LoadingText>
      </LoadingContainer>
    );
  }

  // ==========================================
  // Local Admin Check (Bypass)
  // ==========================================
  const localAdminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;
  let isLocalAdmin = false;
  if (localAdminStr) {
    try {
      const adminData = JSON.parse(localAdminStr);
      if (adminData.role === 'super_admin') {
        isLocalAdmin = true;
      }
    } catch (e) {
      logger.error('Failed to parse adminUser from localStorage', e as Error);
    }
  }

  // ==========================================
  // Authentication Check
  // ==========================================
  if (requireAuth && !currentUser && !isLocalAdmin) {
    if (showMessage) {
      return <LoginRequiredMessage />;
    }
    const redirect = redirectTo || '/login';
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  // ==========================================
  // Admin Role Check
  // ==========================================
  if (requireAdmin) {
    const isFirebaseAdmin = currentUser && (currentUser as any).role === 'admin';
    if (!isFirebaseAdmin && !isLocalAdmin) {
      if (showMessage) {
        return <AdminRequiredMessage />;
      }
      const redirect = redirectTo || '/';
      return <Navigate to={redirect} replace />;
    }
  }

  // ==========================================
  // Email Verification Check
  // ==========================================
  if (requireVerified && currentUser && !(currentUser as any).emailVerified) {
    if (showMessage) {
      return <VerificationRequiredMessage />;
    }
    const redirect = redirectTo || '/verification';
    return <Navigate to={redirect} replace />;
  }

  // ==========================================
  // All Checks Passed - Render Children
  // ==========================================
  return <>{children}</>;
};

export default AuthGuard;
