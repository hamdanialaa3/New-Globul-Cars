// Firebase Auth Diagnostics Component
// src/components/AuthDiagnostics.tsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AuthConfigChecker } from '../utils/auth-config-checker';

const DiagnosticsContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  color: white;
  font-size: 14px;
`;

const DiagnosticsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  cursor: pointer;
`;

const DiagnosticsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #ffd700;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
`;

const DiagnosticsContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const StatusItem = styled.div<{ status: 'success' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  margin: 8px 0;
  padding: 8px;
  border-radius: 6px;
  background: ${props => 
    props.status === 'success' ? 'rgba(34, 197, 94, 0.2)' :
    props.status === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
    'rgba(239, 68, 68, 0.2)'
  };
  border-left: 4px solid ${props => 
    props.status === 'success' ? '#22c55e' :
    props.status === 'warning' ? '#f59e0b' :
    '#ef4444'
  };
`;

const StatusIcon = styled.span`
  margin-right: 10px;
  font-size: 16px;
`;

const QuickFixList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;
  
  li {
    margin: 5px 0;
    color: #e5e7eb;
  }
`;

interface AuthDiagnosticsProps {
  onConfigCheck?: (isValid: boolean) => void;
}

export const AuthDiagnostics: React.FC<AuthDiagnosticsProps> = ({ onConfigCheck }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AuthConfigChecker.checkConfiguration();
      setDiagnostics(result);
      onConfigCheck?.(result.isValid);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setLoading(false);
    }
  }, [onConfigCheck]);

  useEffect(() => {
    // Auto-run diagnostics if development mode
    if (process.env.NODE_ENV === 'development') {
      runDiagnostics();
    }
  }, [runDiagnostics]);

  const getStatusItems = (): Array<{ status: 'success' | 'warning' | 'error'; message: string }> => {
    if (!diagnostics) return [];

    const items: Array<{ status: 'success' | 'warning' | 'error'; message: string }> = [];
    
    // Environment variables check
    const envVars = ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_PROJECT_ID'];
    const missingEnvVars = envVars.filter(env => !process.env[env]);
    
    if (missingEnvVars.length === 0) {
      items.push({ status: 'success', message: 'جميع متغيرات البيئة موجودة' });
    } else {
      items.push({ status: 'error', message: `متغيرات بيئة مفقودة: ${missingEnvVars.length}` });
    }

    // Domain check
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    items.push({ 
      status: isSecure ? 'success' : 'warning', 
      message: isSecure ? 'البروتوكول آمن' : 'يُنصح باستخدام HTTPS' 
    });

    // Overall status
    items.push({ 
      status: diagnostics.isValid ? 'success' : 'error', 
      message: diagnostics.isValid ? 'التكوين صحيح' : `مشاكل مكتشفة: ${diagnostics.issues.length}` 
    });

    return items;
  };

  return (
    <DiagnosticsContainer>
      <DiagnosticsHeader onClick={() => setIsOpen(!isOpen)}>
        <DiagnosticsTitle>🔧 تشخيص Firebase</DiagnosticsTitle>
        <ToggleButton>
          {isOpen ? '▼' : '▶'}
        </ToggleButton>
      </DiagnosticsHeader>
      
      <DiagnosticsContent isOpen={isOpen}>
        {loading ? (
          <div>⏳ جاري فحص التكوين...</div>
        ) : (
          <>
            <div style={{ marginBottom: '15px' }}>
              {getStatusItems().map((item, index) => (
                <StatusItem key={index} status={item.status}>
                  <StatusIcon>
                    {item.status === 'success' ? '✅' : 
                     item.status === 'warning' ? '⚠️' : '❌'}
                  </StatusIcon>
                  {item.message}
                </StatusItem>
              ))}
            </div>

            {diagnostics && diagnostics.recommendations.length > 0 && (
              <>
                <h4 style={{ color: '#ffd700', margin: '15px 0 10px 0' }}>توصيات الإصلاح:</h4>
                <QuickFixList>
                  {AuthConfigChecker.getQuickFixes().slice(0, 5).map((fix, index) => (
                    <li key={index}>{fix}</li>
                  ))}
                </QuickFixList>
              </>
            )}

            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
              <small>
                💡 <strong>نصيحة:</strong> تأكد من تفعيل جميع مزودي المصادقة في Firebase Console
                <br />
                🔗 <a 
                  href={`https://console.firebase.google.com/project/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/authentication/providers`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#60a5fa' }}
                >
                  فتح Firebase Console
                </a>
              </small>
            </div>
          </>
        )}
      </DiagnosticsContent>
    </DiagnosticsContainer>
  );
};