// GoogleAuthDebug.tsx - Debug page that shows ALL errors on screen
import React, { useState } from 'react';
import styled from 'styled-components';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase/firebase-config';

const DebugContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  color: white;
  font-family: 'Courier New', monospace;
`;

const DebugBox = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  color: #00ff88;
  font-size: 32px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
`;

const Section = styled.div`
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #00ff88;
`;

const SectionTitle = styled.h3`
  color: #00ff88;
  font-size: 18px;
  margin-bottom: 10px;
`;

const InfoLine = styled.div<{ $type?: 'success' | 'error' | 'warning' | 'info' }>`
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 4px;
  background: ${props => {
    switch (props.$type) {
      case 'success': return 'rgba(0, 255, 136, 0.2)';
      case 'error': return 'rgba(255, 68, 68, 0.2)';
      case 'warning': return 'rgba(255, 200, 0, 0.2)';
      default: return 'rgba(100, 200, 255, 0.2)';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.$type) {
      case 'success': return '#00ff88';
      case 'error': return '#ff4444';
      case 'warning': return '#ffc800';
      default: return '#64c8ff';
    }
  }};
  font-size: 14px;
  word-break: break-all;
`;

const TestButton = styled.button`
  background: linear-gradient(135deg, #00ff88, #00d4ff);
  color: #000;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  margin: 10px 10px 10px 0;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 255, 136, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorBox = styled.div`
  background: rgba(255, 68, 68, 0.2);
  border: 2px solid #ff4444;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const SuccessBox = styled.div`
  background: rgba(0, 255, 136, 0.2);
  border: 2px solid #00ff88;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const GoogleAuthDebug: React.FC = () => {
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'success' | 'error' | 'warning'; message: string }>>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string) => {
    setLogs(prev => [...prev, { type, message }]);
    console.log(`[${type.toUpperCase()}]`, message);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testGooglePopup = async () => {
    setTesting(true);
    clearLogs();
    addLog('info', '🚀 Starting Google Sign-In TEST (Popup Method)...');

    try {
      // Step 1: Check Firebase config
      addLog('info', '📋 Step 1: Checking Firebase configuration...');
      addLog('info', `Auth domain: ${auth.config.authDomain}`);
      addLog('info', `API Key: ${auth.config.apiKey?.substring(0, 20)}...`);
      addLog('info', `Project ID: ${auth.app.options.projectId}`);

      // Step 2: Check current URL
      addLog('info', '🌐 Step 2: Checking current URL...');
      addLog('info', `Current URL: ${window.location.href}`);
      addLog('info', `Origin: ${window.location.origin}`);
      addLog('info', `Hostname: ${window.location.hostname}`);

      // Step 3: Create Google provider
      addLog('info', '🔧 Step 3: Creating Google Auth Provider...');
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      addLog('success', 'Google provider created successfully!');

      // Step 4: Attempt sign-in
      addLog('info', '🔐 Step 4: Attempting popup sign-in...');
      addLog('warning', 'A popup window should appear now. Please allow it!');
      
      const result = await signInWithPopup(auth, googleProvider);

      // Success!
      addLog('success', '✅ SUCCESS! Google Sign-In worked!');
      addLog('success', `User email: ${result.user.email}`);
      addLog('success', `User name: ${result.user.displayName}`);
      addLog('success', `User ID: ${result.user.uid}`);
      addLog('success', `Email verified: ${result.user.emailVerified}`);

    } catch (error: any) {
      // Error handling with MAXIMUM detail
      addLog('error', '❌ ERROR OCCURRED!');
      addLog('error', `Error code: ${error.code || 'NO CODE'}`);
      addLog('error', `Error message: ${error.message || 'NO MESSAGE'}`);
      
      if (error.customData) {
        addLog('error', `Custom data: ${JSON.stringify(error.customData)}`);
      }

      // Specific error explanations
      if (error.code === 'auth/popup-blocked') {
        addLog('error', '🚫 POPUP BLOCKED by browser!');
        addLog('warning', 'Solution: Allow popups for this site or use redirect method.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        addLog('error', '🚫 Popup was CLOSED by user!');
      } else if (error.code === 'auth/unauthorized-domain') {
        addLog('error', '🚫 UNAUTHORIZED DOMAIN!');
        addLog('error', `Domain "${window.location.hostname}" is NOT in Firebase Authorized Domains!`);
        addLog('warning', 'Solution: Add this domain in Firebase Console → Authentication → Settings → Authorized domains');
      } else if (error.code === 'auth/operation-not-allowed') {
        addLog('error', '🚫 Google Sign-In is NOT ENABLED!');
        addLog('warning', 'Solution: Enable Google in Firebase Console → Authentication → Sign-in method');
      } else if (error.code === 'auth/invalid-api-key') {
        addLog('error', '🚫 INVALID API KEY!');
        addLog('warning', 'Solution: Check firebase-config.ts API key');
      } else if (error.code === 'auth/network-request-failed') {
        addLog('error', '🚫 NETWORK ERROR!');
        addLog('warning', 'Solution: Check internet connection');
      } else if (error.code === 'auth/internal-error') {
        addLog('error', '🚫 INTERNAL ERROR!');
        addLog('error', 'This usually means OAuth is not properly configured in Google Cloud Console');
        addLog('warning', 'Check: Authorized JavaScript origins and Authorized redirect URIs');
      } else {
        addLog('error', '🚫 UNKNOWN ERROR!');
        addLog('error', 'Full error object:');
        addLog('error', JSON.stringify(error, null, 2));
      }
    } finally {
      setTesting(false);
    }
  };

  const testGoogleRedirect = async () => {
    setTesting(true);
    clearLogs();
    addLog('info', '🚀 Starting Google Sign-In TEST (Redirect Method)...');

    try {
      addLog('info', 'Creating Google provider...');
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');

      addLog('warning', '⚠️ Page will redirect to Google. You will come back here after sign-in.');
      addLog('info', 'Redirecting in 2 seconds...');

      setTimeout(async () => {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (error: any) {
          addLog('error', `Redirect error: ${error.message}`);
          setTesting(false);
        }
      }, 2000);

    } catch (error: any) {
      addLog('error', `Error: ${error.message}`);
      setTesting(false);
    }
  };

  const checkRedirectResult = async () => {
    clearLogs();
    addLog('info', '🔍 Checking for redirect result...');

    try {
      const result = await getRedirectResult(auth);
      
      if (result && result.user) {
        addLog('success', '✅ Redirect sign-in SUCCESS!');
        addLog('success', `User email: ${result.user.email}`);
        addLog('success', `User name: ${result.user.displayName}`);
      } else {
        addLog('info', 'ℹ️ No redirect result (normal if you did not just redirect)');
      }
    } catch (error: any) {
      addLog('error', `Redirect result error: ${error.code} - ${error.message}`);
    }
  };

  React.useEffect(() => {
    checkRedirectResult();
  }, []);

  return (
    <DebugContainer>
      <DebugBox>
        <Title>🔍 Google Authentication Debug Tool</Title>
        
        <Section>
          <SectionTitle>📊 System Information</SectionTitle>
          <InfoLine $type="info">Current URL: {window.location.href}</InfoLine>
          <InfoLine $type="info">Origin: {window.location.origin}</InfoLine>
          <InfoLine $type="info">Auth Domain: {auth.config.authDomain}</InfoLine>
          <InfoLine $type="info">Project ID: {auth.app.options.projectId}</InfoLine>
          <InfoLine $type="info">User Agent: {navigator.userAgent}</InfoLine>
        </Section>

        <Section>
          <SectionTitle>🧪 Test Methods</SectionTitle>
          <TestButton onClick={testGooglePopup} disabled={testing}>
            Test Google Sign-In (Popup)
          </TestButton>
          <TestButton onClick={testGoogleRedirect} disabled={testing}>
            Test Google Sign-In (Redirect)
          </TestButton>
          <TestButton onClick={clearLogs} disabled={testing}>
            Clear Logs
          </TestButton>
        </Section>

        {logs.length > 0 && (
          <Section>
            <SectionTitle>📋 Test Logs</SectionTitle>
            {logs.map((log, index) => (
              <InfoLine key={index} $type={log.type}>
                {log.message}
              </InfoLine>
            ))}
          </Section>
        )}

        <Section>
          <SectionTitle>📝 Instructions</SectionTitle>
          <InfoLine $type="warning">
            1. Click "Test Google Sign-In (Popup)" to test popup method
          </InfoLine>
          <InfoLine $type="warning">
            2. If popup is blocked, try "Test Google Sign-In (Redirect)"
          </InfoLine>
          <InfoLine $type="warning">
            3. All errors will be shown here with explanations
          </InfoLine>
          <InfoLine $type="info">
            4. Take a screenshot of any errors and send to developer
          </InfoLine>
        </Section>

        <Section>
          <SectionTitle>✅ Expected Setup</SectionTitle>
          <InfoLine $type="success">
            ✓ Firebase Auth Domain: studio-448742006-a3493.firebaseapp.com
          </InfoLine>
          <InfoLine $type="success">
            ✓ Google Cloud Console → Authorized JavaScript origins should include:
          </InfoLine>
          <InfoLine>• http://localhost</InfoLine>
          <InfoLine>• http://localhost:3000</InfoLine>
          <InfoLine>• https://studio-448742006-a3493.firebaseapp.com</InfoLine>
          <InfoLine>• https://studio-448742006-a3493.web.app</InfoLine>
          <InfoLine>• https://globul.net</InfoLine>
          <InfoLine $type="success">
            ✓ Google Cloud Console → Authorized redirect URIs should include:
          </InfoLine>
          <InfoLine>• https://studio-448742006-a3493.firebaseapp.com/__/auth/handler</InfoLine>
          <InfoLine>• https://studio-448742006-a3493.web.app/__/auth/handler</InfoLine>
          <InfoLine>• https://globul.net/__/auth/handler</InfoLine>
        </Section>
      </DebugBox>
    </DebugContainer>
  );
};

export default GoogleAuthDebug;

