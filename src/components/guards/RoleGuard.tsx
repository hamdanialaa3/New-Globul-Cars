import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';

// Hardcoded Super Admin emails for strict security
const SUPER_ADMIN_EMAILS = [
    'alaa.hamdani@yahoo.com',
    'hamdanialaa@yahoo.com',
    'globul.net.m@gmail.com'
];

interface RoleGuardProps {
    children: React.ReactNode;
    requiredRole?: string; // 'super_admin', 'admin', etc.
    requireSuperAdmin?: boolean; // If true, checks against the hardcoded email list
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

        let authorized = false;

        if (requireSuperAdmin) {
            // Strict check against hardcoded emails
            if (currentUser.email && SUPER_ADMIN_EMAILS.includes(currentUser.email)) {
                authorized = true;
            } else {
                logger.warn('RoleGuard: User is not in Super Admin email list', {
                    uid: currentUser.uid,
                    email: currentUser.email
                });
            }
        } else {
            // Future-proofing: Check against custom claims or Firestore role
            // For now, we assume if it's not requiring Super Admin, we might check other logic
            // But since we only have Super Admin context currently, default to false if not matching above
            // or implement custom logic here if needed.
            // For this implementation, we focus on Super Admin.
            authorized = false;
        }

        setIsAuthorized(authorized);

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
