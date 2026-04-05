// Firebase Status Component - Koli One
// Development diagnostic tool

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 10000;
  max-width: 300px;
  border: 1px solid #333;
`;

const StatusTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffd700;
`;

const StatusItem = styled.div<{ status: 'good' | 'warn' | 'error' }>`
  margin: 5px 0;
  color: ${props => 
    props.status === 'good' ? '#22c55e' :
    props.status === 'warn' ? '#f59e0b' :
    '#ef4444'
  };
`;

const TestButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
  font-size: 11px;
  
  &:hover {
    background: #2563eb;
  }
`;

interface FirebaseStatusState {
  config: 'good' | 'warn' | 'error';
  domain: 'good' | 'warn' | 'error';
  auth: 'good' | 'warn' | 'error';
  testResult?: string;
}

export const FirebaseStatus: React.FC = () => {
  const [status, setStatus] = useState<FirebaseStatusState>({
    config: 'warn',
    domain: 'warn', 
    auth: 'warn'
  });
  const [testing, setTesting] = useState(false);

  const checkFirebaseStatus = useCallback(() => {
    const newStatus = { ...status };

    // Check environment variables
    const requiredEnvs = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID'
    ];
    
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    newStatus.config = missingEnvs.length === 0 ? 'good' : 'error';

    // Check domain
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    newStatus.domain = isSecure ? 'good' : 'warn';

    // Check auth initialization
    try {
      import('../firebase/firebase-config').then(({ auth }) => {
        newStatus.auth = auth.app ? 'good' : 'error';
        setStatus(newStatus);
      });
    } catch (error) {
      newStatus.auth = 'error';
      setStatus(newStatus);
    }
  }, [status]);

  useEffect(() => {
    checkFirebaseStatus();
  }, [checkFirebaseStatus]);

  const runQuickTest = async () => {
    setTesting(true);
    try {
      const { signInAnonymously } = await import('firebase/auth');
      const { auth } = await import('../firebase/firebase-config');
      
      const result = await signInAnonymously(auth);
      
      setStatus(prev => ({
        ...prev,
        testResult: result.user ? 'Anonymous: PASS' : 'Anonymous: FAIL'
      }));
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: string }).code || 'Unknown error')
          : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        testResult: `Test failed: ${code}`
      }));
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: 'good' | 'warn' | 'error') => {
    switch (status) {
      case 'good': return 'PASS';
      case 'warn': return 'WARN';
      case 'error': return 'FAIL';
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <StatusContainer>
      <StatusTitle>Firebase Status</StatusTitle>
      
      <StatusItem status={status.config}>
        {getStatusIcon(status.config)} Config: {status.config.toUpperCase()}
      </StatusItem>
      
      <StatusItem status={status.domain}>
        {getStatusIcon(status.domain)} Domain: {status.domain.toUpperCase()}
      </StatusItem>
      
      <StatusItem status={status.auth}>
        {getStatusIcon(status.auth)} Auth: {status.auth.toUpperCase()}
      </StatusItem>

      {status.testResult && (
        <StatusItem status={status.testResult.includes('PASS') ? 'good' : 'error'}>
          {status.testResult}
        </StatusItem>
      )}

      <div style={{ marginTop: '10px' }}>
        <TestButton onClick={runQuickTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test Auth'}
        </TestButton>
        
        <TestButton onClick={checkFirebaseStatus}>
          Refresh
        </TestButton>
      </div>

      <div style={{ fontSize: '10px', marginTop: '8px', color: '#9ca3af' }}>
        Domain: {window.location.hostname}
        <br />
        Protocol: {window.location.protocol}
      </div>
    </StatusContainer>
  );
};
