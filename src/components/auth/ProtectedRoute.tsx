// ProtectedRoute - Protects routes that require authentication
// Saves intent and redirects to Login

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfileIntent } from '@/hooks/useProfileIntent';
import { logger } from '@/services/logger-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * Protects routes from unauthorized access
 * 
 * Usage:
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 * 
 * @param children - Protected components
 * @param requireAuth - Requires authentication (default: true)
 * @param redirectTo - Redirect path (default: /auth/login)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { saveIntent } = useProfileIntent();

  // Wait for auth state to load
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#666'
      }}>
                Loading...
      </div>
    );
  }

  // If user is not logged in
  if (requireAuth && !user) {
    // Save intent (current path + data)
    saveIntent(location.pathname + location.search);

    logger.info('[ProtectedRoute] User not authenticated, redirecting to login', {
      intendedPath: location.pathname,
      redirectTo,
    });

    // Redirect to Login page
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is logged in - show content
  return <>{children}</>;
};

export default ProtectedRoute;
