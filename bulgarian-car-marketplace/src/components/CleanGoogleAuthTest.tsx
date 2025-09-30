import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
`;

const Button = styled.button<{ danger?: boolean; success?: boolean }>`
  background: ${props => props.danger ? '#ff4757' : props.success ? '#2ed573' : '#5352ed'};
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin: 10px;
  width: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusBox = styled.div<{ type?: 'success' | 'error' | 'info' }>`
  background: ${props => props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#d1ecf1'};
  color: ${props => props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0c5460'};
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : props.type === 'error' ? '#f5c6cb' : '#bee5eb'};
`;

const LogBox = styled.pre`
  background: #1a1a1a;
  color: #00ff00;
  padding: 20px;
  border-radius: 8px;
  margin: 15px 0;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  white-space: pre-wrap;
`;

interface StatusType {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UserType {
  email: string;
  displayName?: string;
  uid: string;
}

const CleanGoogleAuthTest = () => {
  const [status, setStatus] = useState<StatusType | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState('');
  const [user, setUser] = useState<UserType | null>(null);

  // (Comment removed - was in Arabic)
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => prev + new Date().toLocaleTimeString() + ': ' + message + '\n');
      originalLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => prev + new Date().toLocaleTimeString() + ' ERROR: ' + message + '\n');
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  // (Comment removed - was in Arabic)
  useEffect(() => {
    const checkAuthResult = async () => {
      try {
        // (Comment removed - was in Arabic)
        const { checkCleanAuthResult } = await import('../utils/clean-google-auth');
        const result = await checkCleanAuthResult();
        
        if (result) {
          if (result.success) {
            setStatus({
              type: 'success',
              message: result.message || 'Login successful!'
            });
            if (result.user) {
              setUser({
                email: result.user.email || '',
                displayName: result.user.displayName || undefined,
                uid: result.user.uid
              });
            }
          } else {
            setStatus({
              type: 'error',
              message: result.message || 'Login failed'
            });
          }
        }
      } catch (error) {
        console.error('[AUTH] Error checking authentication:', error);
      }
    };

    checkAuthResult();
  }, []);

  const handleCleanAuth = async () => {
    setLoading(true);
    setStatus(null);
    setLogs('');
    
    try {
      // (Comment removed - was in Arabic)
      const { cleanGoogleAuth } = await import('../utils/clean-google-auth');
      
      setStatus({
        type: 'info',
        message: 'Cleaning system and restarting...'
      });
      
      const result = await cleanGoogleAuth();
      
      if (result.redirected) {
        setStatus({
          type: 'info',
          message: 'Redirecting to Google...'
        });
      } else if (result.success) {
        setStatus({
          type: 'success',
          message: 'System cleaned successfully!'
        });
      } else {
        setStatus({
          type: 'error',
          message: result.message || 'Failed to clean system'
        });
      }
      
    } catch (error) {
      console.error('[AUTH] Error:', error);
      setStatus({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs('');
    console.clear();
  };

  return (
    <Container>
      <Card>
        <Title>🧹 Google Authentication Cleanup & Repair</Title>
        
        {user && (
          <StatusBox type="success">
            <h3>✅ Welcome!</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.displayName || 'Not specified'}</p>
            <p><strong>User ID:</strong> {user.uid}</p>
          </StatusBox>
        )}

        {status && (
          <StatusBox type={status.type}>
            {status.message}
          </StatusBox>
        )}

        <div style={{ textAlign: 'center' }}>
          <Button 
            onClick={handleCleanAuth}
            disabled={loading}
            style={{ fontSize: '18px', padding: '20px 40px' }}
          >
            {loading ? '⏳ Processing...' : '🧹 Clean & Restart Google Sign-in'}
          </Button>
          
          <Button onClick={clearLogs}>
            🗑️ Clear Logs
          </Button>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>📋 Process Details:</h3>
          <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <li>Clear all cached data (localStorage & sessionStorage)</li>
            <li>Clear Firebase cookies</li>
            <li>Create new Firebase app with correct configuration</li>
            <li>Use Redirect instead of Popup to avoid browser blocking</li>
            <li>Check result when returning from Google</li>
          </ul>
        </div>

        {logs && (
          <div>
            <h3>📊 Operation Log:</h3>
            <LogBox>{logs}</LogBox>
          </div>
        )}
      </Card>

      <Card>
        <h3>🔧 Current Configuration:</h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p><strong>Project ID:</strong> studio-448742006-a3493</p>
          <p><strong>Auth Domain:</strong> studio-448742006-a3493.firebaseapp.com</p>
          <p><strong>API Key:</strong> AIzaSyCYxOoD-tViZHLh3XhdbwQo8rRA5Q56NVs</p>
          <p><strong>Approach:</strong> Redirect with comprehensive cleanup</p>
        </div>
      </Card>
    </Container>
  );
};

export default CleanGoogleAuthTest;