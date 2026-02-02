// ProtectedRoute - مكون لحماية الصفحات التي تتطلب تسجيل دخول
// يوجه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مسجل دخول

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfileIntent } from '@/hooks/useProfileIntent';
import { logger } from '@/services/logger-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'dealer' | 'corporate';
}

/**
 * ProtectedRoute Component
 * 
 * يتحقق من:
 * 1. هل المستخدم مسجل دخول؟
 * 2. هل لديه الصلاحيات المطلوبة؟
 * 
 * إذا لم يكن مسجل دخول:
 * - يحفظ الـ URL الحالي
 * - يوجهه إلى صفحة تسجيل الدخول
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const { saveIntent } = useProfileIntent();
  const location = useLocation();

  // انتظار تحميل حالة المصادقة
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

  // إذا كان المستخدم غير مسجل دخول
  if (!user) {
    logger.info(`[ProtectedRoute] Unauthenticated access attempt to: ${location.pathname}`);
    
    // احفظ الـ URL الحالي لنعود إليه بعد Login
    saveIntent(location.pathname + location.search);
    
    // وجهه إلى صفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  // تحقق من الصلاحيات إذا كانت مطلوبة
  if (requiredRole) {
    // Get role from user claims or custom properties
    const userRole = (user as unknown as { role?: string })?.role;
    if (userRole !== requiredRole) {
      logger.warn(
        `[ProtectedRoute] Insufficient permissions. Required: ${requiredRole}, Got: ${userRole}`
      );
      return <Navigate to="/" replace />;
    }
  }

  // المستخدم مسجل دخول وله الصلاحيات - اعرض المحتوى
  return <>{children}</>;
};

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
