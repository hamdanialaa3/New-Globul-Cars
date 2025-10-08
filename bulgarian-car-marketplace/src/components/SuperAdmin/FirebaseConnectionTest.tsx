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
  RefreshCw
} from 'lucide-react';
import { firebaseConnectionTestService } from '../../services/firebase-connection-test';

const TestContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 30px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  color: #ffd700;
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ffd700;
`;

const TestTitle = styled.h2`
  color: #ffd700;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TestButton = styled.button<{ $variant: 'primary' | 'success' | 'danger' }>`
  padding: 10px 20px;
  border: 2px solid #ffd700;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          color: #000000;
          &:hover { 
            background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(74, 222, 128, 0.4);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          color: #ffffff;
          &:hover { 
            background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(248, 113, 113, 0.4);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #000000;
          &:hover { 
            background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
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
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid ${props => props.$success ? '#4ade80' : '#f87171'};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
`;

const TestIcon = styled.div<{ $success: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$success 
    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
    : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
  };
  color: ${props => props.$success ? '#000000' : '#ffffff'};
  font-size: 20px;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 5px;
`;

const TestMessage = styled.div`
  font-size: 14px;
  color: #ffed4e;
  opacity: 0.9;
`;

const TestData = styled.div`
  font-size: 12px;
  color: #ffd700;
  margin-top: 5px;
  opacity: 0.8;
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
      console.log('🔄 Starting Firebase connection test...');
      
      const result = await firebaseConnectionTestService.runCompleteTest();
      
      setTestResults(result.results);
      setLastTestTime(new Date());
      
      console.log('✅ Firebase connection test completed!');
      console.log('📊 Results:', result);
      
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runQuickTest = async () => {
    setLoading(true);
    try {
      console.log('🔄 Running quick Firebase test...');
      
      const result = await firebaseConnectionTestService.testConnection();
      
      setTestResults([{ test: 'Quick Connection', ...result }]);
      setLastTestTime(new Date());
      
    } catch (error) {
      console.error('❌ Quick Firebase test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runUsersTest = async () => {
    setLoading(true);
    try {
      console.log('🔄 Testing real users data...');
      
      const result = await firebaseConnectionTestService.getRealUsersData();
      
      setTestResults([{ test: 'Real Users Data', ...result }]);
      setLastTestTime(new Date());
      
    } catch (error) {
      console.error('❌ Real users test failed:', error);
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
