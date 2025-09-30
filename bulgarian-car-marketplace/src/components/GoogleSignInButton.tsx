// src/components/GoogleSignInButton.tsx
// (Comment removed - was in Arabic)

import React, { useState } from 'react';
import styled from 'styled-components';
import { SocialAuthService } from '../firebase/social-auth-service';

const Button = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  transition: background 0.3s;
  
  &:hover {
    background: #3367d6;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const PopupWarning = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  font-size: 14px;
`;

const Instructions = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196f3;
  color: #1976d2;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  font-size: 14px;
`;

const RedirectNotice = styled.div`
  background: #f3e5f5;
  border: 1px solid #9c27b0;
  color: #7b1fa2;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  font-size: 14px;
  text-align: center;
`;

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [showPopupWarning, setShowPopupWarning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setShowPopupWarning(false);
    setShowInstructions(false);
    setRedirecting(false);

    try {
      const result = await SocialAuthService.signInWithGoogle();
      
      console.log('✅ تم تسجيل الدخول بنجاح:', result.user.email);
      onSuccess?.(result.user);
      
    } catch (error: any) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      
      if (error.message === 'REDIRECT_INITIATED') {
        setRedirecting(true);
        // Don't call onError for redirect, as it's not really an error
        return;
      }
      
      if (error.code === 'auth/popup-blocked') {
        setShowPopupWarning(true);
        setShowInstructions(true);
      }
      
      onError?.(error.message || 'فشل تسجيل الدخول مع Google');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div>
      <Button onClick={handleGoogleSignIn} disabled={loading || redirecting}>
        {loading ? (
          <>⏳ جاري تسجيل الدخول...</>
        ) : redirecting ? (
          <>🔄 جاري التوجيه...</>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            تسجيل الدخول مع Google
          </>
        )}
      </Button>

      {redirecting && (
        <RedirectNotice>
          🔄 جاري توجيهك إلى Google للمصادقة...
          <br />
          إذا لم يحدث شيء، يرجى إعادة تحميل الصفحة.
        </RedirectNotice>
      )}

      {showPopupWarning && (
        <PopupWarning>
          ⚠️ تم حجب النافذة المنبثقة! يتم الآن استخدام طريقة التوجيه البديلة.
        </PopupWarning>
      )}

      {showInstructions && (
        <Instructions>
          <strong>💡 لتجنب هذه المشكلة في المستقبل:</strong>
          <br />
          1. في Chrome: انقر على أيقونة النافذة المنبثقة في شريط العنوان
          <br />
          2. اختر "السماح بالنوافذ المنبثقة لهذا الموقع"
          <br />
          3. أعد تحميل الصفحة وجرب مرة أخرى
          <br />
          <br />
          <strong>أو</strong> يمكنك الاستمرار مع طريقة التوجيه البديلة.
        </Instructions>
      )}
    </div>
  );
};

export default GoogleSignInButton;