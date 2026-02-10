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

        if (!currentUser) {
            logger.warn('RoleGuard: No user logged in', { path: location.pathname });
            setIsAuthorized(false);
            return;
        }

        const checkAuthorization = async () => {
            try {
                // 1. Check Firebase custom claims first
                const tokenResult = await getIdTokenResult(currentUser, true);
                if (tokenResult.claims.admin === true || tokenResult.claims.role === 'super_admin') {
                    setIsAuthorized(true);
                    return;
                }

                // 2. Fallback: check Firestore user document role
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
        };

        if (requireSuperAdmin) {
            checkAuthorization();
        } else {
            // Non-admin roles: for now allow authenticated users
            setIsAuthorized(true);
        }

    }, [currentUser, loading, requireSuperAdmin, location.pathname]);

    if (loading || isAuthorized === null) {
        // You might want a better loading spinner here
        return <div className="p-10 text-center">Verifying permissions...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/super-admin-login" state={{ from: location }} replace />;
    }

    if (!isAuthorized) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
