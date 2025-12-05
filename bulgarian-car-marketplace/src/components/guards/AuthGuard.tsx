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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
`;

const MessageCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const IconWrapper = styled.div<{ $variant?: 'error' | 'warning' | 'info' }>`
  margin-bottom: 1.5rem;
  color: ${({ $variant }) => {
        switch ($variant) {
            case 'error': return '#ff6b6b';
            case 'warning': return '#ffa500';
            case 'info': return '#4a90e2';
            default: return '#ff6b6b';
        }
    }};
  display: flex;
  justify-content: center;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ $variant }) =>
        $variant === 'secondary'
            ? '#6c757d'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    background: ${({ $variant }) =>
        $variant === 'secondary' ? '#5a6268' : undefined
    };
  }
  
  &:active {
    transform: translateY(0);
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
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 1rem;
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
    // Authentication Check
    // ==========================================
    if (requireAuth && !currentUser) {
        if (showMessage) {
            return <LoginRequiredMessage />;
        }
        const redirect = redirectTo || '/login';
        return <Navigate to={redirect} state={{ from: location }} replace />;
    }

    // ==========================================
    // Admin Role Check
    // ==========================================
    if (requireAdmin && (!currentUser || (currentUser as any).role !== 'admin')) {
        if (showMessage) {
            return <AdminRequiredMessage />;
        }
        const redirect = redirectTo || '/';
        return <Navigate to={redirect} replace />;
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
