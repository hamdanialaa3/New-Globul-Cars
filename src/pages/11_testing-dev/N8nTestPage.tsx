// N8N Test Page - صفحة اختبار n8n
import React, { useState } from 'react';
import styled from 'styled-components';
import { logger } from '../../services/logger-service';
import N8nIntegrationService from '../../services/n8n-integration';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Arial, sans-serif;
`;

const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
`;

const TestSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const TestButton = styled.button`
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin: 0.25rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusBadge = styled.span<{ $status: 'success' | 'error' | 'pending' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 0.5rem;
  
  ${props => {
    switch (props.$status) {
      case 'success':
        return 'background: #d4edda; color: #155724;';
      case 'error':
        return 'background: #f8d7da; color: #721c24;';
      case 'pending':
        return 'background: #fff3cd; color: #856404;';
    }
  }}
`;

const ResultBox = styled.pre`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  border-left: 4px solid #2196f3;
`;

const N8nTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunction();
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { status: 'success', data: result } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { status: 'error', data: error instanceof Error ? error.message : 'Unknown error' } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const getStatusBadge = (testName: string) => {
    if (loading[testName]) return <StatusBadge $status="pending">Testing...</StatusBadge>;
    if (!testResults[testName]) return null;
    return <StatusBadge $status={testResults[testName].status}>
      {testResults[testName].status === 'success' ? 'Success' : 'Error'}
    </StatusBadge>;
  };

  const testHealthCheck = async () => {
    return await N8nIntegrationService.healthCheck();
  };

  const testSellStarted = async () => {
    return await N8nIntegrationService.onSellStarted('test-user-123', {
      displayName: 'Test User',
      email: 'test@mobilebg.eu',
      language: 'bg'
    });
  };

  const testVehicleTypeSelection = async () => {
    return await N8nIntegrationService.onVehicleTypeSelected('test-user-123', 'car');
  };

  const testSellerTypeDetection = async () => {
    return await N8nIntegrationService.onSellerTypeDetected('test-user-123', 'private', false);
  };

  const testDirectWebhook = async () => {
    const response = await fetch('http://localhost:5678/webhook/sell-started', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'direct-test-123',
        timestamp: new Date().toISOString(),
        source: 'direct_test'
      })
    });
    return await response.json();
  };

  return (
    <Container>
      <Title>🧪 N8N Integration Test Center</Title>
      
      <InfoBox>
        <strong>🔗 N8N Status:</strong> Make sure n8n is running on port 5678<br/>
        <strong>🌐 Editor:</strong> <a href="http://localhost:5678" target="_blank" rel="noopener noreferrer">http://localhost:5678</a><br/>
        <strong>🔑 Login:</strong> globul_admin / globul2025!
      </InfoBox>

      <TestSection>
        <h3>1. Health Check Test</h3>
        <p>Test if n8n server is accessible</p>
        <TestButton 
          onClick={() => runTest('health', testHealthCheck)}
          disabled={loading.health}
        >
          Test Health Check
        </TestButton>
        {getStatusBadge('health')}
        {testResults.health && (
          <ResultBox>{JSON.stringify(testResults.health.data, null, 2)}</ResultBox>
        )}
      </TestSection>

      <TestSection>
        <h3>2. Sell Process Started</h3>
        <p>Test the sell workflow trigger</p>
        <TestButton 
          onClick={() => runTest('sellStarted', testSellStarted)}
          disabled={loading.sellStarted}
        >
          Test Sell Started
        </TestButton>
        {getStatusBadge('sellStarted')}
        {testResults.sellStarted && (
          <ResultBox>{JSON.stringify(testResults.sellStarted.data, null, 2)}</ResultBox>
        )}
      </TestSection>

      <TestSection>
        <h3>3. Vehicle Type Selection</h3>
        <p>Test vehicle type workflow</p>
        <TestButton 
          onClick={() => runTest('vehicleType', testVehicleTypeSelection)}
          disabled={loading.vehicleType}
        >
          Test Vehicle Type
        </TestButton>
        {getStatusBadge('vehicleType')}
        {testResults.vehicleType && (
          <ResultBox>{JSON.stringify(testResults.vehicleType.data, null, 2)}</ResultBox>
        )}
      </TestSection>

      <TestSection>
        <h3>4. Seller Type Detection</h3>
        <p>Test seller type detection workflow</p>
        <TestButton 
          onClick={() => runTest('sellerType', testSellerTypeDetection)}
          disabled={loading.sellerType}
        >
          Test Seller Type
        </TestButton>
        {getStatusBadge('sellerType')}
        {testResults.sellerType && (
          <ResultBox>{JSON.stringify(testResults.sellerType.data, null, 2)}</ResultBox>
        )}
      </TestSection>

      <TestSection>
        <h3>5. Direct Webhook Test</h3>
        <p>Direct webhook call without service wrapper</p>
        <TestButton 
          onClick={() => runTest('directWebhook', testDirectWebhook)}
          disabled={loading.directWebhook}
        >
          Test Direct Webhook
        </TestButton>
        {getStatusBadge('directWebhook')}
        {testResults.directWebhook && (
          <ResultBox>{JSON.stringify(testResults.directWebhook.data, null, 2)}</ResultBox>
        )}
      </TestSection>

      <TestSection>
        <h3>🎯 Quick Actions</h3>
        <TestButton onClick={() => window.open('http://localhost:5678', '_blank')}>
          Open n8n Editor
        </TestButton>
        <TestButton onClick={() => setTestResults({})}>
          Clear Results
        </TestButton>
        <TestButton onClick={() => {
          Object.keys(testResults).forEach(key => {
            if (process.env.NODE_ENV === 'development') {
              if (testResults[key].status === 'success') {
                logger.debug('n8n test success', { key, data: testResults[key].data });
              } else {
                logger.error('n8n test failure', new Error('Test failed'), { key, data: testResults[key].data });
              }
            }
          });
        }}>
          Log Results
        </TestButton>
      </TestSection>
    </Container>
  );
};

export default N8nTestPage;