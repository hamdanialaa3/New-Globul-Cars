import React, { useState } from 'react';
import styled from 'styled-components';
import { FirebaseStatus } from '../components/FirebaseStatusSimple';
import { runAuthenticationTests } from '../utils/auth-test';
import { SocialAuthService } from '../firebase/social-auth-service';

const DiagnosticsPage = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Title = styled.h1`
  color: #2c5aa0;
  text-align: center;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Button = styled.button`
  background: #2c5aa0;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.5rem;
  
  &:hover {
    background: #1e3d6f;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TestResult = styled.div<{ success?: boolean }>`
  padding: 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
`;

const AuthDiagnosticsPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runFullTests = async () => {
    setIsRunningTests(true);
    setTestResults(null);
    
    try {
      console.log('بدء اختبارات المصادقة الشاملة...');
      const results = await runAuthenticationTests();
      setTestResults(results);
    } catch (error) {
      console.error('خطأ في اختبارات المصادقة:', error);
      setTestResults({
        error: 'فشل في تشغيل الاختبارات: ' + (error as Error).message
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const testGoogleAuth = async () => {
    try {
      console.log('اختبار تسجيل الدخول عبر Google...');
      const result = await SocialAuthService.signInWithGoogle();
      console.log('نتيجة Google Auth:', result);
    } catch (error) {
      console.error('خطأ في Google Auth:', error);
    }
  };

  const testFacebookAuth = async () => {
    try {
      console.log('اختبار تسجيل الدخول عبر Facebook...');
      const result = await SocialAuthService.signInWithFacebook();
      console.log('نتيجة Facebook Auth:', result);
    } catch (error) {
      console.error('خطأ في Facebook Auth:', error);
    }
  };

  const testAnonymousAuth = async () => {
    try {
      console.log('اختبار تسجيل الدخول المجهول...');
      const result = await SocialAuthService.signInAnonymously();
      console.log('نتيجة Anonymous Auth:', result);
    } catch (error) {
      console.error('خطأ في Anonymous Auth:', error);
    }
  };

  return (
    <DiagnosticsPage>
      <Title>تشخيص أنظمة المصادقة - Globul Cars</Title>
      
      <Section>
        <h2>حالة Firebase</h2>
        <FirebaseStatus />
      </Section>

      <Section>
        <h2>اختبارات المصادقة التلقائية</h2>
        <Button 
          onClick={runFullTests} 
          disabled={isRunningTests}
        >
          {isRunningTests ? 'جاري تشغيل الاختبارات...' : 'تشغيل جميع الاختبارات'}
        </Button>
        
        {testResults && (
          <div>
            {testResults.error ? (
              <TestResult success={false}>
                <strong>خطأ:</strong> {testResults.error}
              </TestResult>
            ) : (
              <>
                <TestResult success={testResults.anonymous?.success}>
                  <strong>التسجيل المجهول:</strong> {
                    testResults.anonymous?.success 
                      ? 'نجح الاختبار' 
                      : `فشل: ${testResults.anonymous?.error}`
                  }
                </TestResult>
                <TestResult success={testResults.google?.success}>
                  <strong>Google Authentication:</strong> {
                    testResults.google?.success 
                      ? 'نجح الاختبار' 
                      : `فشل: ${testResults.google?.error}`
                  }
                </TestResult>
              </>
            )}
          </div>
        )}
      </Section>

      <Section>
        <h2>اختبارات المصادقة اليدوية</h2>
        <Button onClick={testAnonymousAuth}>
          اختبار التسجيل المجهول
        </Button>
        <Button onClick={testGoogleAuth}>
          اختبار Google
        </Button>
        <Button onClick={testFacebookAuth}>
          اختبار Facebook
        </Button>
      </Section>

      <Section>
        <h2>تعليمات الاستخدام</h2>
        <p>1. افتح Developer Tools (F12)</p>
        <p>2. انتقل إلى Console</p>
        <p>3. قم بتشغيل الاختبارات ولاحظ النتائج</p>
        <p>4. تحقق من رسائل الخطأ لتحديد السبب</p>
      </Section>
    </DiagnosticsPage>
  );
};

export default AuthDiagnosticsPage;