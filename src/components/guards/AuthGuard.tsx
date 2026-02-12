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
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import styled from 'styled-components';
import { Lock, LogIn, Home, Shield, Mail } from 'lucide-react';

// ==========================================
// Styled Components - Modern Design
// ==========================================

const GuardContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
    : 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(255, 140, 97, 0.08) 100%)'
  };
  backdrop-filter: blur(10px);
  padding: 2rem;
  text-align: center;
  z-index: 10000;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  
  /* Ensure content is visible */
  & > * {
    position: relative;
    z-index: 1;
  }
  
  /* Decorative gradient overlay */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: radial-gradient(circle at 50% 0%, rgba(255, 107, 53, 0.15) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MessageCard = styled.div`
  position: relative;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(30, 41, 59, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(148, 163, 184, 0.2)'
    : 'rgba(255, 255, 255, 0.5)'
  };
  padding: 3rem 2rem;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: scaleInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  margin: 2rem;
  overflow: visible;
  
  /* Decorative glow effect on hover */
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(255, 140, 97, 0.3));
    border-radius: 32px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
    filter: blur(20px);
  }
  
  &:hover::after {
    opacity: 0.5;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin: 1rem;
    max-width: calc(100% - 2rem);
    border-radius: 20px;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }

  @keyframes scaleInBounce {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 3rem 2rem;
    border-radius: 24px;
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
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(255, 107, 53, 0.3));
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h2`
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  
  [data-theme="dark"] &, .dark-theme & {
    background: linear-gradient(135deg, #FF8C61 0%, #FFA07A 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Message = styled.p`
  color: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.85)' 
    : 'var(--text-secondary, #4A5568)'
  };
  margin-bottom: 2rem;
  font-size: 1.125rem;
  line-height: 1.8;
  
  strong {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)'
  };
  color: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'var(--text-primary, #1A1D2E)'
      : '#FFFFFF'
  };
  border: ${({ $variant }) =>
    $variant === 'secondary'
      ? '2px solid rgba(255, 107, 53, 0.2)'
      : 'none'
  };
  padding: 1rem 2rem;
  border-radius: 14px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $variant }) =>
    $variant === 'primary'
      ? '0 4px 12px rgba(255, 107, 53, 0.25), 0 2px 6px rgba(255, 107, 53, 0.15)'
      : '0 2px 6px rgba(0, 0, 0, 0.08)'
  };
  overflow: hidden;
  
  /* Ripple effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    transform: scale(0);
    transition: transform 0.5s ease;
    opacity: 0;
  }
  
  &:active::before {
    transform: scale(2.5);
    opacity: 1;
    transition: transform 0s;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${({ $variant }) =>
    $variant === 'primary'
      ? '0 8px 24px rgba(255, 107, 53, 0.35), 0 4px 12px rgba(255, 107, 53, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.12)'
  };
    background: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'rgba(255, 107, 53, 0.1)'
      : 'linear-gradient(135deg, #FF8C61 0%, #FFA07A 100%)'
  };
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
  
  &:active {
    transform: translateY(-1px) scale(0.98);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  /* Dark mode support */
  [data-theme="dark"] &, .dark-theme & {
    ${({ $variant }) =>
    $variant === 'secondary' && `
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.15);
      
      &:hover {
        background: rgba(255, 255, 255, 0.12);
      }
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
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = () => {
    // ✅ Preserve current location using state (better than query params)
    navigate('/login', { 
      state: { from: location },
      replace: false 
    });
  };

  const handleBack = () => {
    navigate('/', { replace: true });
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
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/', { replace: true });
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
  const navigate = useNavigate();

  const handleVerify = () => {
    navigate('/verification', { replace: false });
  };

  const handleBack = () => {
    navigate('/', { replace: true });
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
