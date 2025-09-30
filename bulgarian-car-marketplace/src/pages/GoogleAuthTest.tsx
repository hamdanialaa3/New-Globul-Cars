// src/pages/GoogleAuthTest.tsx
// Simple Google Authentication Test Page

import React, { useState } from 'react';
import styled from 'styled-components';
import { SocialAuthService } from '../firebase/social-auth-service';
import { FirebaseDebug } from '../utils/firebase-debug';
import { testNewFirebaseConfig } from '../utils/test-new-config';
import { useAuth } from '../hooks/useAuth';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  color: #555;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin: 0.5rem;
  font-size: 16px;
  
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
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const SuccessBox = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const InfoBox = styled.div`
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const Code = styled.code`
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
`;

const GoogleAuthTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🧪 Testing Google Sign-In...');
      const result = await SocialAuthService.signInWithGoogle();
      setSuccess(`✅ Success! Signed in as: ${result.user.email}`);
      console.log('Test result:', result);
    } catch (err: any) {
      setError(`❌ Error: ${err.message}`);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostic = () => {
    setDebugInfo('Running diagnostic... Check console for details.');
    
    // اختبار التكوين الجديد
    console.log('🧪 اختبار التكوين الجديد...');
    const configTest = testNewFirebaseConfig();
    
    FirebaseDebug.runDiagnostic();
    
    setTimeout(() => {
      const issues = FirebaseDebug.checkCommonIssues();
      if (!configTest.configMatches) {
        setDebugInfo('❌ تكوين Firebase غير صحيح! تحقق من Console للتفاصيل.');
      } else if (issues.length > 0) {
        setDebugInfo(`Found ${issues.length} potential issues. Check console for details.`);
      } else {
        setDebugInfo('✅ No obvious configuration issues detected.');
      }
    }, 1000);
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    setSuccess('✅ Browser storage cleared. Try signing in again.');
  };

  return (
    <TestContainer>
      <Title>🔧 Google Authentication Test</Title>
      
      <Section>
        <SectionTitle>Current Status</SectionTitle>
        {user ? (
          <SuccessBox>
            ✅ Signed in as: <strong>{user.email}</strong>
            <br />
            Display Name: {user.displayName || 'Not set'}
            <br />
            UID: <Code>{user.uid}</Code>
          </SuccessBox>
        ) : (
          <InfoBox>
            ℹ️ Not signed in
          </InfoBox>
        )}
      </Section>

      <Section>
        <SectionTitle>Quick Tests</SectionTitle>
        <Button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
        >
          {loading ? '⏳ Testing...' : '🧪 Test Google Sign-In'}
        </Button>
        
        <DebugButton onClick={runDiagnostic}>
          🔍 Run Diagnostic
        </DebugButton>
        
        <DebugButton onClick={() => {
          const result = testNewFirebaseConfig();
          setDebugInfo(result.configMatches ? 
            '✅ تكوين Firebase صحيح!' : 
            '❌ تكوين Firebase غير صحيح! تحقق من Console'
          );
        }}>
          🧪 اختبر التكوين الجديد
        </DebugButton>
        
        <DebugButton onClick={clearStorage}>
          🗑️ Clear Storage
        </DebugButton>
      </Section>

      {error && (
        <Section>
          <SectionTitle>Error Details</SectionTitle>
          <ErrorBox>{error}</ErrorBox>
          <InfoBox>
            <strong>Common Solutions:</strong>
            <ul>
              <li>Check if popups are blocked in your browser</li>
              <li>Ensure Google sign-in is enabled in Firebase Console</li>
              <li>Verify authorized domains include <Code>localhost</Code></li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </InfoBox>
        </Section>
      )}

      {success && (
        <Section>
          <SectionTitle>Success!</SectionTitle>
          <SuccessBox>{success}</SuccessBox>
        </Section>
      )}

      {debugInfo && (
        <Section>
          <SectionTitle>Diagnostic Results</SectionTitle>
          <InfoBox>{debugInfo}</InfoBox>
        </Section>
      )}

      <Section>
        <SectionTitle>Manual Steps to Fix</SectionTitle>
        <InfoBox>
          <ol>
            <li>Open <strong>Firebase Console</strong> → Authentication → Sign-in method</li>
            <li>Enable <strong>Google</strong> provider</li>
            <li>Add authorized domains: <Code>localhost</Code>, <Code>127.0.0.1</Code></li>
            <li>Check <strong>Google Cloud Console</strong> → OAuth consent screen</li>
            <li>Verify redirect URIs in OAuth 2.0 Client IDs</li>
            <li>Clear browser cache and try again</li>
          </ol>
        </InfoBox>
      </Section>
    </TestContainer>
  );
};

export default GoogleAuthTest;