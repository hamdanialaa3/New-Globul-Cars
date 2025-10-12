// src/components/AuthTestComponent.tsx
// مكون اختبار المصادقة المباشر

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, onAuthStateChanged } from 'firebase/auth';
import { SocialAuthService } from '../firebase/social-auth-service';
import { auth } from '../firebase/firebase-config';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const TestSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  backdrop-filter: blur(10px);
`;

const TestButton = styled.button`
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 12px 24px;
  margin: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorDisplay = styled.div`
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid #dc3545;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  color: #fff;
`;

const SuccessDisplay = styled.div`
  background: rgba(40, 167, 69, 0.2);
  border: 1px solid #28a745;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  color: #fff;
`;

const LogDisplay = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  color: #fff;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

export const AuthTestComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // مراقبة حالة المصادقة
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        addLog(`✅ المستخدم مسجل دخول: ${currentUser.email || currentUser.displayName || 'مجهول'}`);
      } else {
        addLog('❌ المستخدم غير مسجل دخول');
      }
    }, (error) => {
      setAuthError(error.message);
      setLoading(false);
      addLog(`❌ خطأ في مراقبة المصادقة: ${error.message}`);
    });

    return () => unsubscribe();
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setTestResults([]);
    setLastError(null);
  };

  const testGoogleSignIn = async () => {
    setIsLoading(true);
    setLastError(null);
    addLog('🚀 بدء اختبار Google Sign-in...');
    
    try {
      const result = await SocialAuthService.signInWithGoogle();
      addLog(`✅ نجح تسجيل الدخول مع Google: ${result.user.email}`);
      addLog(`📧 البريد الإلكتروني: ${result.user.email}`);
      addLog(`👤 الاسم: ${result.user.displayName}`);
      addLog(`🆔 UID: ${result.user.uid}`);
    } catch (error: any) {
      addLog(`❌ فشل Google Sign-in: ${error.message}`);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testFacebookSignIn = async () => {
    setIsLoading(true);
    setLastError(null);
    addLog('🚀 بدء اختبار Facebook Sign-in...');
    
    try {
      const result = await SocialAuthService.signInWithFacebook();
      addLog(`✅ نجح تسجيل الدخول مع Facebook: ${result.user.email}`);
      addLog(`📧 البريد الإلكتروني: ${result.user.email}`);
      addLog(`👤 الاسم: ${result.user.displayName}`);
      addLog(`🆔 UID: ${result.user.uid}`);
    } catch (error: any) {
      addLog(`❌ فشل Facebook Sign-in: ${error.message}`);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAppleSignIn = async () => {
    setIsLoading(true);
    setLastError(null);
    addLog('🚀 بدء اختبار Apple Sign-in...');
    
    try {
      const result = await SocialAuthService.signInWithApple();
      addLog(`✅ نجح تسجيل الدخول مع Apple: ${result.user.email}`);
      addLog(`📧 البريد الإلكتروني: ${result.user.email}`);
      addLog(`👤 الاسم: ${result.user.displayName}`);
      addLog(`🆔 UID: ${result.user.uid}`);
    } catch (error: any) {
      addLog(`❌ فشل Apple Sign-in: ${error.message}`);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testAnonymousSignIn = async () => {
    setIsLoading(true);
    setLastError(null);
    addLog('🚀 بدء اختبار Anonymous Sign-in...');
    
    try {
      const result = await SocialAuthService.signInAnonymously();
      addLog(`✅ نجح الدخول كضيف`);
      addLog(`🆔 UID: ${result.user.uid}`);
      addLog(`👤 Anonymous: ${result.user.isAnonymous}`);
    } catch (error: any) {
      addLog(`❌ فشل الدخول كضيف: ${error.message}`);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    addLog('🚀 بدء تسجيل الخروج...');
    
    try {
      await auth.signOut();
      addLog(`✅ تم تسجيل الخروج بنجاح`);
    } catch (error: any) {
      addLog(`❌ فشل في تسجيل الخروج: ${error.message}`);
      setLastError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TestContainer>
      <h1>🧪 اختبار نظام المصادقة</h1>
      
      <TestSection>
        <h3>📊 الحالة الحالية</h3>
        {loading && <p>⏳ جارٍ التحقق من حالة المصادقة...</p>}
        {authError && <ErrorDisplay>❌ خطأ: {authError}</ErrorDisplay>}
        {user ? (
          <SuccessDisplay>
            ✅ مسجل الدخول<br/>
            📧 البريد: {user.email}<br/>
            👤 الاسم: {user.displayName}<br/>
            🆔 UID: {user.uid}<br/>
            👻 ضيف: {user.isAnonymous ? 'نعم' : 'لا'}
          </SuccessDisplay>
        ) : (
          <p>❌ غير مسجل الدخول</p>
        )}
      </TestSection>

      <TestSection>
        <h3>🔐 اختبار طرق تسجيل الدخول</h3>
        
        <TestButton 
          onClick={testGoogleSignIn} 
          disabled={isLoading}
        >
          🔍 اختبار Google Sign-in
        </TestButton>
        
        <TestButton 
          onClick={testFacebookSignIn} 
          disabled={isLoading}
        >
          📘 اختبار Facebook Sign-in
        </TestButton>
        
        <TestButton 
          onClick={testAppleSignIn} 
          disabled={isLoading}
        >
          🍎 اختبار Apple Sign-in
        </TestButton>
        
        <TestButton 
          onClick={testAnonymousSignIn} 
          disabled={isLoading}
        >
          👻 اختبار الدخول كضيف
        </TestButton>
        
        {user && (
          <TestButton 
            onClick={signOut} 
            disabled={isLoading}
            style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)' }}
          >
            🚪 تسجيل الخروج
          </TestButton>
        )}
      </TestSection>

      {lastError && (
        <ErrorDisplay>
          <h4>❌ آخر خطأ:</h4>
          <p>{lastError}</p>
        </ErrorDisplay>
      )}

      <TestSection>
        <h3>📝 سجل الاختبار</h3>
        <TestButton onClick={clearLogs}>🧹 مسح السجل</TestButton>
        <LogDisplay>
          {testResults.length === 0 
            ? 'لا توجد سجلات بعد. ابدأ بتجربة إحدى طرق تسجيل الدخول أعلاه.' 
            : testResults.join('\n')}
        </LogDisplay>
      </TestSection>

      <TestSection style={{ textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
        <p>💡 <strong>نصائح الاستخدام:</strong></p>
        <p>• تأكد من تفعيل popup windows في المتصفح</p>
        <p>• تحقق من console للمزيد من التفاصيل</p>
        <p>• إذا فشل popup، سيتم التحويل تلقائياً لـ redirect</p>
      </TestSection>
    </TestContainer>
  );
};

export default AuthTestComponent;