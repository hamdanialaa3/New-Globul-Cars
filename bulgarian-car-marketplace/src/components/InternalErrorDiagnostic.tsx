import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FirebaseInternalErrorDiagnostic, { AuthDiagnosticResult } from '../utils/firebase-internal-error-diagnostic';
import { SocialAuthService } from '../firebase/social-auth-service';

const DiagnosticContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Title = styled.h1`
  color: #dc3545;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const ErrorAlert = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: bold;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.5rem;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const TestButton = styled(Button)`
  background: #28a745;
  
  &:hover {
    background: #1e7e34;
  }
`;

const DiagnosticResult = styled.div<{ status: 'success' | 'warning' | 'error' }>`
  padding: 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  border-left: 4px solid ${props => 
    props.status === 'success' ? '#28a745' :
    props.status === 'warning' ? '#ffc107' :
    '#dc3545'
  };
  background: ${props => 
    props.status === 'success' ? '#d4edda' :
    props.status === 'warning' ? '#fff3cd' :
    '#f8d7da'
  };
  color: ${props => 
    props.status === 'success' ? '#155724' :
    props.status === 'warning' ? '#856404' :
    '#721c24'
  };
`;

const SolutionsList = styled.ul`
  background: #e7f3ff;
  border: 1px solid #b3d4fc;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  
  li {
    margin: 0.5rem 0;
    line-height: 1.5;
  }
`;

const DetailsBox = styled.pre`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre-wrap;
`;

const InternalErrorDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<AuthDiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastError, setLastError] = useState<string>('');

  const diagnostic = new FirebaseInternalErrorDiagnostic();

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults([]);
    setLastError('');
    
    try {
      const results = await diagnostic.runComprehensiveDiagnostic();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('خطأ في تشغيل التشخيص:', error);
      setLastError((error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 اختبار Google Authentication مباشرة...');
      const result = await SocialAuthService.signInWithGoogle();
      console.log('✅ نجح تسجيل الدخول:', result.user.email);
      alert('نجح تسجيل الدخول! تحقق من Console للتفاصيل.');
    } catch (error: any) {
      console.error('❌ فشل تسجيل الدخول:', error);
      setLastError(`خطأ: ${error.code} - ${error.message}`);
      
      // If it's internal-error, run diagnostic automatically
      if (error.code === 'auth/internal-error') {
        console.log('🔍 تم اكتشاف auth/internal-error، تشغيل التشخيص التلقائي...');
        await runDiagnostic();
      }
    }
  };

  useEffect(() => {
    // Run diagnostic on component mount
    const initDiagnostic = async () => {
      await runDiagnostic();
    };
    initDiagnostic();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔍';
    }
  };

  const solutions = diagnostic.getInternalErrorSolutions();

  return (
    <DiagnosticContainer>
      <Title>تشخيص خطأ Firebase: auth/internal-error</Title>
      
      {lastError && (
        <ErrorAlert>
          <strong>آخر خطأ:</strong> {lastError}
        </ErrorAlert>
      )}

      <Section>
        <h2>اختبار مباشر</h2>
        <p>اختبر Google Authentication مباشرة لإعادة إنتاج الخطأ:</p>
        <TestButton onClick={testGoogleAuth}>
          اختبار Google Sign-In
        </TestButton>
        <Button onClick={runDiagnostic} disabled={isRunning}>
          {isRunning ? 'جاري التشخيص...' : 'إعادة تشغيل التشخيص'}
        </Button>
      </Section>

      <Section>
        <h2>الحلول المقترحة لخطأ auth/internal-error</h2>
        <p>جرب هذه الحلول بالترتيب:</p>
        <SolutionsList>
          {solutions.map((solution, index) => (
            <li key={index}>{solution}</li>
          ))}
        </SolutionsList>
      </Section>

      {diagnosticResults.length > 0 && (
        <Section>
          <h2>نتائج التشخيص التفصيلي</h2>
          {diagnosticResults.map((result, index) => (
            <DiagnosticResult key={index} status={result.status}>
              <h4>
                {getStatusIcon(result.status)} {result.step}
              </h4>
              <p><strong>النتيجة:</strong> {result.message}</p>
              
              {result.details && (
                <details>
                  <summary>تفاصيل تقنية</summary>
                  <DetailsBox>
                    {JSON.stringify(result.details, null, 2)}
                  </DetailsBox>
                </details>
              )}
              
              {result.solution && (
                <p><strong>الحل المقترح:</strong> {result.solution}</p>
              )}
            </DiagnosticResult>
          ))}
        </Section>
      )}

      <Section>
        <h2>خطوات التشخيص اليدوي</h2>
        <ol>
          <li><strong>افتح Firebase Console:</strong> https://console.firebase.google.com</li>
          <li><strong>اختر مشروعك:</strong> studio-448742006-a3493</li>
          <li><strong>انتقل إلى Authentication:</strong> من القائمة الجانبية</li>
          <li><strong>Sign-in method:</strong> تحقق من تفعيل Google provider</li>
          <li><strong>Settings:</strong> تحقق من Authorized domains</li>
          <li><strong>Users:</strong> تحقق من عدم وجود مشاكل في المستخدمين</li>
        </ol>
      </Section>

      <Section>
        <h2>معلومات مفيدة</h2>
        <p><strong>نوع الخطأ:</strong> auth/internal-error</p>
        <p><strong>السبب الشائع:</strong> مشكلة في إعدادات Firebase Console أو تكوين المشروع</p>
        <p><strong>التأثير:</strong> منع تسجيل الدخول عبر جميع مزودي الخدمة</p>
        <p><strong>مستوى الخطورة:</strong> عالي - يمنع المصادقة كلياً</p>
      </Section>
    </DiagnosticContainer>
  );
};

export default InternalErrorDiagnostic;