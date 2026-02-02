// ProtectedRoute - يحمي المسارات التي تحتاج تسجيل دخول
// يحفظ النية (Intent) ويعيد التوجيه للـ Login

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
 * يحمي المسارات من الدخول غير المصرح به
 * 
 * الاستخدام:
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 * 
 * @param children - المكونات المحمية
 * @param requireAuth - يتطلب تسجيل دخول (افتراضي: true)
 * @param redirectTo - مسار إعادة التوجيه (افتراضي: /auth/login)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { saveIntent } = useProfileIntent();

  // انتظار تحميل حالة المصادقة
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#666'
      }}>
        جاري التحميل...
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل الدخول
  if (requireAuth && !user) {
    // حفظ النية (المسار الحالي + البيانات)
    saveIntent({
      action: 'view_profile',
      returnUrl: location.pathname + location.search,
      metadata: {
        timestamp: Date.now(),
        referrer: document.referrer,
      },
    });

    logger.info('[ProtectedRoute] User not authenticated, redirecting to login', {
      intendedPath: location.pathname,
      redirectTo,
    });

    // إعادة التوجيه لصفحة Login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // إذا كان المستخدم مسجل الدخول - عرض المحتوى
  return <>{children}</>;
};

export default ProtectedRoute;
