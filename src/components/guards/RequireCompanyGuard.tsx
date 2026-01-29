import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import { useAuth } from '../../contexts/AuthProvider';
import LoadingSpinner from '../LoadingSpinner';

interface RequireCompanyGuardProps {
    children: ReactNode;
}

export const RequireCompanyGuard: React.FC<RequireCompanyGuardProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const { isCompany, loading: profileLoading } = useProfileType();
    const location = useLocation();

    if (loading || profileLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isCompany) {
        // Redirect non-company users to upgrade or home
        return <Navigate to="/profile/upgrade" replace />;
    }

    return <>{children}</>;
};
