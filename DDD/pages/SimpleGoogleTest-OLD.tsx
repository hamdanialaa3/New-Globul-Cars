// src/pages/SimpleGoogleTest.tsx
// (Comment removed - was in Arabic)

import React, { useState } from 'react';
import styled from 'styled-components';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { advancedGoogleAuthDebug, detailedGoogleSignInTest } from '../utils/advanced-google-auth-debug';
import { quickGoogleTest } from '../utils/quick-google-test';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.5rem;
  font-size: 16px;
  width: 100%;
  
  &:hover {
    background: #3367d6;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DebugButton = styled(Button)`
  background: #ff9800;
  &:hover {
    background: #f57c00;
  }
`;

const ErrorBox = styled.div`
  background: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  white-space: pre-wrap;
`;

const SuccessBox = styled.div`
  background: #e8f5e8;
  border: 1px solid #4caf50;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196f3;
  color: #1976d2;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
`;

const SimpleGoogleTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const runDiagnostic = async () => {
    setError('');
    setSuccess('');
    setDebugInfo('جاري التشخيص... تحقق من Console (F12)');

    try {
      const { debugGoogleAuth } = await import('../utils/google-auth-debugger');
      await debugGoogleAuth();
      setDebugInfo('✅ تم التشخيص. تحقق من Console للتفاصيل.');
    } catch (err: any) {
      setError(`خطأ في التشخيص: ${err.message}`);
    }
  };

  const testDirectSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 بدء اختبار مباشر لـ Google Sign-in...');
      
      // (Comment removed - was in Arabic)
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      
      console.log('Auth تم تهيئته:', !!auth);
      console.log('Provider تم إنشاؤه:', !!provider);
      console.log('Auth Domain:', auth.config.authDomain);
      
      // (Comment removed - was in Arabic)
      console.log('محاولة signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ نجح تسجيل الدخول:', result.user.email);
      setSuccess(`✅ نجح تسجيل الدخول!
البريد الإلكتروني: ${result.user.email}
الاسم: ${result.user.displayName}
UID: ${result.user.uid}`);

    } catch (err: any) {
      console.error('❌ فشل تسجيل الدخول:', err);
      
      let errorMessage = `❌ فشل تسجيل الدخول:
كود الخطأ: ${err.code || 'غير محدد'}
رسالة الخطأ: ${err.message || 'غير محددة'}`;

      // (Comment removed - was in Arabic)
      if (err.code === 'auth/popup-blocked') {
        errorMessage += '\n\n💡 الحل: فعّل النوافذ المنبثقة لهذا الموقع';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage += '\n\n💡 الحل: أضف localhost إلى Firebase Console > Authentication > Settings > Authorized domains';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage += '\n\n💡 الحل: فعّل Google provider في Firebase Console > Authentication > Sign-in method';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setError('');
    setSuccess('');
    setDebugInfo('');
    localStorage.clear();
    sessionStorage.clear();
    console.clear();
  };

  return (
    <Container>
      <Title>🔧 اختبار Google Sign-in البسيط</Title>
      
      <InfoBox>
        هذه صفحة اختبار مبسطة لتشخيص مشاكل Google Authentication.
        استخدم الأزرار أدناه لاختبار تسجيل الدخول والحصول على معلومات التشخيص.
      </InfoBox>

      <GoogleSignInButton
        onSuccess={(user) => {
          setSuccess(`✅ نجح تسجيل الدخول!
البريد الإلكتروني: ${user.email}
الاسم: ${user.displayName}
UID: ${user.uid}`);
          setError('');
        }}
        onError={(errorMessage) => {
          setError(errorMessage);
          setSuccess('');
        }}
      />

      <Button 
        onClick={testDirectSignIn} 
        disabled={loading}
      >
        {loading ? '⏳ جاري الاختبار...' : '🧪 اختبار Google Sign-in المباشر (بديل)'}
      </Button>

      <Button 
        onClick={async () => {
          setLoading(true);
          setError('');
          setSuccess('');
          try {
            const result = await quickGoogleTest();
            if (result.success && result.user) {
              setSuccess(`✅ ${result.message}
البريد: ${result.user.email}
الاسم: ${result.user.displayName}
UID: ${result.user.uid}`);
            } else {
              setError(result.message || 'فشل الاختبار السريع');
            }
          } catch (err: any) {
            setError(`خطأ في الاختبار السريع: ${err.message}`);
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
      >
        {loading ? '⏳ جاري الاختبار...' : '⚡ اختبار سريع'}
      </Button>

      <DebugButton onClick={runDiagnostic}>
        🔍 تشغيل التشخيص الكامل
      </DebugButton>

      <DebugButton onClick={async () => {
        setDebugInfo('جاري التشخيص المتقدم... تحقق من Console');
        try {
          await advancedGoogleAuthDebug();
          setDebugInfo('✅ تم التشخيص المتقدم. تحقق من Console للتفاصيل الكاملة.');
        } catch (err: any) {
          setError(`خطأ في التشخيص: ${err.message}`);
        }
      }}>
        🔬 تشخيص متقدم
      </DebugButton>
      
      <DebugButton onClick={async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
          const result = await detailedGoogleSignInTest();
          if (result.success && result.user) {
            setSuccess(`✅ نجح الاختبار المفصل!
البريد: ${result.user.email}
الاسم: ${result.user.displayName}`);
          } else {
            setError(`❌ فشل الاختبار المفصل. تحقق من Console للتفاصيل.`);
          }
        } catch (err: any) {
          setError(`خطأ في الاختبار: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }}>
        🧪 اختبار مفصل
      </DebugButton>

      <DebugButton onClick={clearAll}>
        🗑️ مسح جميع البيانات
      </DebugButton>

      {error && <ErrorBox>{error}</ErrorBox>}
      {success && <SuccessBox>{success}</SuccessBox>}
      {debugInfo && <InfoBox>{debugInfo}</InfoBox>}

      <InfoBox>
        <strong>كيفية الاستخدام:</strong>
        <br />1. افتح Console المتصفح (F12)
        <br />2. انقر على "اختبار Google Sign-in المباشر"
        <br />3. تحقق من رسائل الخطأ المفصلة
        <br />4. استخدم "تشغيل التشخيص الكامل" للمزيد من المعلومات
      </InfoBox>
    </Container>
  );
};

export default SimpleGoogleTest;