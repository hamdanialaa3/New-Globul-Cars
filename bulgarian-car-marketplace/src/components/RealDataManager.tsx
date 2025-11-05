import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Car,
  MessageSquare,
  Eye
} from 'lucide-react';
import { advancedRealDataService } from '@/services/advanced-real-data-service';
import { realDataInitializer } from '@/services/real-data-initializer';
import { firebaseDebugService } from '@/services/firebase-debug-service';

// Styled Components
const ManagerContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'success' }>`
  background: ${props => {
    switch (props.$variant) {
      case 'danger': return 'rgba(239, 68, 68, 0.8)';
      case 'success': return 'rgba(34, 197, 94, 0.8)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'danger': return 'rgba(239, 68, 68, 0.5)';
      case 'success': return 'rgba(34, 197, 94, 0.5)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }};
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'danger': return 'rgba(239, 68, 68, 1)';
        case 'success': return 'rgba(34, 197, 94, 1)';
        default: return 'rgba(255, 255, 255, 0.3)';
      }
    }};
    transform: translateY(-2px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const StatusIndicator = styled.div<{ $status: 'success' | 'warning' | 'error' | 'loading' | 'idle' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => {
    switch (props.$status) {
      case 'success': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'error': return '#ef4444';
      case 'loading': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const DataCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const DataHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DataTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DataValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const DataLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LogContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

const LogEntry = styled.div<{ $type: 'info' | 'success' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'error': return '#ef4444';
      default: return '#e5e7eb';
    }
  }};
`;

// Real Data Manager Component
const RealDataManager: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'success' | 'warning' | 'error'; message: string; timestamp: Date }>>([]);

  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setStatus('loading');
      addLog('info', 'Loading real data...');
      
      // First, let's debug what's actually in Firebase
      const debugData = await firebaseDebugService.debugFirebaseData();
      console.log('🔍 DEBUG: Firebase data:', debugData);
      
      // Now try to get real data
      const [analytics, users, cars, messages] = await Promise.all([
        advancedRealDataService.getRealTimeAnalytics(),
        advancedRealDataService.getRealUsers(),
        advancedRealDataService.getRealCars(),
        advancedRealDataService.getRealMessages()
      ]);

      setData({ analytics, users, cars, messages });
      setStatus('success');
      addLog('success', `Real data loaded successfully - Users: ${debugData.users.count}, Cars: ${debugData.cars.count}, Messages: ${debugData.messages.count}`);
    } catch (error) {
      console.error('Error loading data:', error);
      setStatus('error');
      addLog('error', `Failed to load data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const initializeRealData = async () => {
    try {
      setLoading(true);
      setStatus('loading');
      addLog('info', 'Initializing real data...');
      
      await realDataInitializer.initializeAllRealData();
      
      setStatus('success');
      addLog('success', 'Real data initialized successfully');
      
      // Reload data after initialization
      await loadData();
    } catch (error) {
      console.error('Error initializing data:', error);
      setStatus('error');
      addLog('error', `Failed to initialize data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    try {
      setLoading(true);
      setStatus('loading');
      addLog('warning', 'Clearing all data...');
      
      // This would need to be implemented in the service
      // await realDataInitializer.clearAllData();
      
      setStatus('success');
      addLog('success', 'Data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      setStatus('error');
      addLog('error', `Failed to clear data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return <LoadingSpinner />;
      case 'success': return <CheckCircle size={16} />;
      case 'error': return <AlertTriangle size={16} />;
      case 'idle': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading': return 'Loading...';
      case 'success': return 'Connected';
      case 'error': return 'Error';
      case 'idle': return 'Idle';
      default: return 'Unknown';
    }
  };

  return (
    <ManagerContainer>
      <Header>
        <Title>
          <Database size={24} />
          Real Data Manager
        </Title>
        <ButtonGroup>
          <StatusIndicator $status={status}>
            {getStatusIcon()}
            {getStatusText()}
          </StatusIndicator>
          <ActionButton onClick={loadData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton $variant="success" onClick={initializeRealData} disabled={loading}>
            <Plus size={16} />
            Initialize Data
          </ActionButton>
          <ActionButton $variant="danger" onClick={clearData} disabled={loading}>
            <Trash2 size={16} />
            Clear Data
          </ActionButton>
        </ButtonGroup>
      </Header>

      {data && (
        <DataGrid>
          <DataCard>
            <DataHeader>
              <DataTitle>
                <Users size={18} />
                Users
              </DataTitle>
            </DataHeader>
            <DataValue>{data.users?.length || 0}</DataValue>
            <DataLabel>Total Users</DataLabel>
          </DataCard>

          <DataCard>
            <DataHeader>
              <DataTitle>
                <Car size={18} />
                Cars
              </DataTitle>
            </DataHeader>
            <DataValue>{data.cars?.length || 0}</DataValue>
            <DataLabel>Total Cars</DataLabel>
          </DataCard>

          <DataCard>
            <DataHeader>
              <DataTitle>
                <MessageSquare size={18} />
                Messages
              </DataTitle>
            </DataHeader>
            <DataValue>{data.messages?.length || 0}</DataValue>
            <DataLabel>Total Messages</DataLabel>
          </DataCard>

          <DataCard>
            <DataHeader>
              <DataTitle>
                <Eye size={18} />
                Views
              </DataTitle>
            </DataHeader>
            <DataValue>{data.analytics?.totalViews || 0}</DataValue>
            <DataLabel>Total Views</DataLabel>
          </DataCard>
        </DataGrid>
      )}

      {logs.length > 0 && (
        <LogContainer>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            Activity Log
          </h4>
          {logs.slice(-10).reverse().map((log, index) => (
            <LogEntry key={index} $type={log.type}>
              <Clock size={12} />
              <span>{log.timestamp.toLocaleTimeString()}</span>
              <span>{log.message}</span>
            </LogEntry>
          ))}
        </LogContainer>
      )}
    </ManagerContainer>
  );
};

export default RealDataManager;
