import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Database,
  Users,
  Activity,
  Zap,
  AlertTriangle,

} from 'lucide-react';
import { firebaseConnectionTestService } from '../../services/firebase-connection-test';
import { logger } from '../../services/logger-service';

const TestContainer = styled.div`
  background: #0f1419;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 32px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #f8fafc;
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #2d3748;
`;

const TestTitle = styled.h2`
  color: #ff8c61;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TestButton = styled.button<{ $variant: 'primary' | 'success' | 'danger' }>`
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: #10b981;
          color: #ffffff;
          &:hover { 
            background: #059669;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: #ffffff;
          &:hover { 
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #ff8c61;
          color: #0f1419;
          &:hover { 
            background: #ffa885;
            transform: translateY(-1px);
          }
        `;
    }
  }}
`;

const TestResults = styled.div`
  display: grid;
  gap: 15px;
`;

const TestResult = styled.div<{ $success: boolean }>`
  background: #1e2432;
  border: 1px solid ${props => props.$success ? '#10b981' : '#ef4444'};
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const TestIcon = styled.div<{ $success: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$success ? '#10b981' : '#ef4444'};
  color: #ffffff;
  font-size: 20px;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 4px;
`;

const TestMessage = styled.div`
  font-size: 13px;
  color: #cbd5e1;
  opacity: 0.9;
`;

const TestData = styled.div`
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #ffd700;
  font-size: 18px;
  gap: 10px;
`;

const FirebaseConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      logger.info('Starting Firebase connection test...');

      const result = await firebaseConnectionTestService.runCompleteTest();

      setTestResults(result.results);
      setLastTestTime(new Date());

      logger.info('Firebase connection test completed');
      logger.debug('Firebase connection test results', { result });

    } catch (error) {
      logger.error('Firebase connection test failed', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const runQuickTest = async () => {
    setLoading(true);
    try {
      logger.info('Running quick Firebase test...');

      const result = await firebaseConnectionTestService.testConnection();

      setTestResults([{ test: 'Quick Connection', ...result }]);
      setLastTestTime(new Date());

    } catch (error) {
      logger.error('Quick Firebase test failed', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const runUsersTest = async () => {
    setLoading(true);
    try {
      logger.info('Testing real users data...');

      const result = await firebaseConnectionTestService.getRealUsersData();

      setTestResults([{ test: 'Real Users Data', ...result }]);
      setLastTestTime(new Date());

    } catch (error) {
      logger.error('Real users test failed', error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run initial test
    runQuickTest();
  }, []);

  return (
    <TestContainer>
      <TestHeader>
        <TestTitle>
          <Database size={24} />
          Firebase Connection Test
        </TestTitle>
        <div style={{ display: 'flex', gap: '10px' }}>
          <TestButton $variant="primary" onClick={runQuickTest} disabled={loading}>
            <Activity size={16} />
            Quick Test
          </TestButton>
          <TestButton $variant="success" onClick={runUsersTest} disabled={loading}>
            <Users size={16} />
            Test Users
          </TestButton>
          <TestButton $variant="primary" onClick={runConnectionTest} disabled={loading}>
            <Zap size={16} />
            Full Test
          </TestButton>
        </div>
      </TestHeader>

      {loading ? (
        <LoadingSpinner>
          <Loader2 size={20} className="animate-spin" />
          Testing Firebase connection...
        </LoadingSpinner>
      ) : (
        <>
          {lastTestTime && (
            <div style={{
              color: '#ffd700',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center',
              opacity: 0.8
            }}>
              Last test: {lastTestTime.toLocaleTimeString()}
            </div>
          )}

          <TestResults>
            {testResults.map((result, index) => (
              <TestResult key={index} $success={result.success}>
                <TestIcon $success={result.success}>
                  {result.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </TestIcon>
                <TestInfo>
                  <TestName>{result.test}</TestName>
                  <TestMessage>{result.message}</TestMessage>
                  {result.data && (
                    <TestData>
                      {result.data.usersCount && `Users: ${result.data.usersCount}`}
                      {result.data.recentUsers && `Active: ${result.data.recentUsers}`}
                      {result.data.documentId && `Document: ${result.data.documentId}`}
                    </TestData>
                  )}
                </TestInfo>
              </TestResult>
            ))}
          </TestResults>

          {testResults.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#ffd700',
              fontSize: '18px',
              padding: '40px'
            }}>
              <AlertTriangle size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <div>No test results yet. Click a test button to start!</div>
            </div>
          )}
        </>
      )}
    </TestContainer>
  );
};

export default FirebaseConnectionTest;
