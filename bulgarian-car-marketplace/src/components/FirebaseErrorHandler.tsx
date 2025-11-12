// Firebase Error Handler Component
// لعرض رسائل خطأ واضحة للمستخدم

import React from 'react';
import { logger } from '../services/logger-service';

interface FirebaseErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const FirebaseErrorHandler: React.FC<FirebaseErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  showRetry = true 
}) => {
  if (!error) return null;

  const getErrorMessage = (error: Error): string => {
    const errorCode = (error as any).code;
    
    switch (errorCode) {
      case 'auth/network-request-failed':
        return 'مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
      case 'auth/too-many-requests':
        return 'تم إجراء محاولات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى.';
      case 'auth/user-not-found':
        return 'المستخدم غير موجود. يرجى التحقق من البيانات أو إنشاء حساب جديد.';
      case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.';
      case 'auth/invalid-email':
        return 'عنوان البريد الإلكتروني غير صحيح.';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني.';
      case 'auth/operation-not-allowed':
        return 'هذه العملية غير مسموحة حالياً.';
      case 'permission-denied':
        return 'ليس لديك صلاحية للوصول إلى هذه البيانات.';
      case 'unavailable':
        return 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.';
      default:
        logger.warn('Unknown Firebase error', { code: errorCode, message: error.message });
        return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry: reload the page
      window.location.reload();
    }
  };

  return (
    <div style={{
      padding: '16px',
      margin: '16px 0',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      color: '#c33'
    }}>
      <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
        ⚠️ خطأ في الاتصال
      </div>
      <div style={{ marginBottom: '12px' }}>
        {getErrorMessage(error)}
      </div>
      {showRetry && (
        <button
          onClick={handleRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
};

export default FirebaseErrorHandler;