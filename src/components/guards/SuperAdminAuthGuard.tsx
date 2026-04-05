// src/components/guards/SuperAdminAuthGuard.tsx
/**
 * SuperAdminAuthGuard — Protects all /super-admin/* routes.
 *
 * Uses uniqueOwnerService.validateCurrentSession() which checks the
 * encrypted session token in sessionStorage, falling back to a
 * Firebase Firestore read for the owner's uid list. Redirects to
 * /super-admin-login when the session is invalid or expired.
 *
 * @example
 * <SuperAdminAuthGuard>
 *   <CarModerationPage />
 * </SuperAdminAuthGuard>
 */

import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { uniqueOwnerService } from '@/services/unique-owner-service';
import { logger } from '@/services/logger-service';

type GuardStatus = 'checking' | 'authorized' | 'unauthorized';

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

export const SuperAdminAuthGuard: React.FC<SuperAdminAuthGuardProps> = ({ children }) => {
  const [status, setStatus] = useState<GuardStatus>('checking');
  const isActive = useRef(true);

  useEffect(() => {
    isActive.current = true;

    uniqueOwnerService.validateCurrentSession()
      .then((valid) => {
        if (!isActive.current) return;
        setStatus(valid ? 'authorized' : 'unauthorized');
      })
      .catch((err) => {
        logger.error('[SuperAdminAuthGuard] Session validation error', err as Error);
        if (!isActive.current) return;
        setStatus('unauthorized');
      });

    return () => {
      isActive.current = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--admin-bg-primary, #0f172a)',
        color: 'var(--admin-text-secondary, #94a3b8)',
        fontSize: '15px',
        gap: '12px',
      }}>
        <span style={{ fontSize: '22px' }}>🔐</span>
        Verifying session…
      </div>
    );
  }

  if (status === 'unauthorized') {
    return <Navigate to="/super-admin-login" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminAuthGuard;
