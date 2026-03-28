import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, getIdTokenResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';

interface RoleGuardProps {
    children: React.ReactNode;
    requiredRole?: string; // 'super_admin', 'admin', etc.
    requireSuperAdmin?: boolean; // If true, checks admin claim or Firestore role
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    requiredRole = 'super_admin',
    requireSuperAdmin = true
}) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (loading) return;

        const checkAuthorization = async () => {
            // Path 1: Firebase Auth user exists — check claims / Firestore role
            if (currentUser) {
                try {
                    const tokenResult = await getIdTokenResult(currentUser, true);
                    if (tokenResult.claims.admin === true || tokenResult.claims.role === 'super_admin') {
                        setIsAuthorized(true);
                        return;
                    }

                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData?.role === 'super_admin' || userData?.role === 'admin') {
                            setIsAuthorized(true);
                            return;
                        }
                    }

                    logger.warn('RoleGuard: User lacks admin privileges', {
                        uid: currentUser.uid,
                        email: currentUser.email
                    });
                    setIsAuthorized(false);
                } catch (error) {
                    logger.error('RoleGuard: Authorization check failed', { error });
                    setIsAuthorized(false);
                }
                return;
            }

            // Path 2: No Firebase Auth user — check local super admin session
            // and try to establish Firebase Auth in the background
            try {
                const { uniqueOwnerService } = await import('@/services/unique-owner-service');
                const hasLocalSession = await uniqueOwnerService.validateCurrentSession();
                if (hasLocalSession && !uniqueOwnerService.isSessionTimedOut()) {
                    // Authorize immediately so the dashboard renders
                    setIsAuthorized(true);
                    // Establish Firebase Auth in background for Firestore writes
                    uniqueOwnerService.connectFirebaseAuth().catch(() => {});
                    return;
                }
            } catch {
                // Local session check failed — fall through to unauthorized
            }

            logger.warn('RoleGuard: No user logged in', { path: location.pathname });
            setIsAuthorized(false);
        };

        if (requireSuperAdmin) {
            checkAuthorization();
        } else {
            setIsAuthorized(true);
        }

    }, [currentUser, loading, requireSuperAdmin, location.pathname]);

    if (loading || isAuthorized === null) {
        return <div className="p-10 text-center">Verifying permissions...</div>;
    }

    if (!isAuthorized) {
        return <Navigate to="/super-admin-login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
