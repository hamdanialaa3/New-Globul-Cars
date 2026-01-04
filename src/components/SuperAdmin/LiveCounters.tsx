import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Users,
  Car,
  MessageSquare,
  Eye,
  DollarSign,
  Database,
  HardDrive,
  Download,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { liveFirebaseCountersService } from '../../services/live-firebase-counters-service';
import { logger } from '../../services/logger-service';

interface LiveCountersProps {
  stats: {
    totalCars: number;
    totalUsers: number;
    totalViews: number;
  };
}

const CountersContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 24px;
  margin: 0 20px 20px 20px;
  color: #1a1a1a;
`;

const SectionTitle = styled.h2`
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CountersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const CounterCard = styled.div<{ $interactive?: boolean }>`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;
  cursor: ${props => props.$interactive ? 'pointer' : 'default'};
  
  &:hover {
    border-color: ${props => props.$interactive ? '#1a1a1a' : '#999999'};
    transform: ${props => props.$interactive ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.$interactive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'};
  }
`;

const ActionButton = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 6px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${CounterCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover {
    background: #000;
  }
`;

const CounterIcon = styled.div`
  background: #f5f5f5;
  color: #1a1a1a;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 20px;
  border: 1px solid #e0e0e0;
`;

const CounterValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
`;

const CounterLabel = styled.div`
  font-size: 12px;
  color: #666666;
  font-weight: 500;
  margin-bottom: 8px;
`;

const CounterChange = styled.div<{ $positive: boolean; $neutral?: boolean }>`
  font-size: 11px;
  font-weight: 500;
  color: ${props => {
    if (props.$neutral) return '#666666';
    return props.$positive ? '#2d5a2d' : '#8b2d2d';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const StatusIndicator = styled.div<{ $status: 'online' | 'offline' | 'warning' }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'online': return '#2d5a2d';
      case 'warning': return '#8b5a2d';
      case 'offline': return '#8b2d2d';
      default: return '#666666';
    }
  }};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666666;
  font-size: 14px;
  gap: 8px;
`;

interface LiveCountersProps {
  stats: {
    totalCars: number;
    totalUsers: number;
    totalViews: number;
  };
  onAction?: (action: string) => void;
}

const LiveCounters: React.FC<LiveCountersProps> = ({ stats = { totalCars: 0, totalUsers: 0, totalViews: 0 }, onAction }) => {
  const [counters, setCounters] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalMessages: 0,
    totalViews: 0,
    totalRevenue: 0,
    firestoreReads: 0,
    firestoreWrites: 0,
    storageUsage: 0,
    functionInvocations: 0,
    activeSessions: 0,
    lastUpdated: new Date(),
    systemHealth: 'OK',
    alerts: 0
  });

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const data = await liveFirebaseCountersService.getLiveAnalytics();
        setCounters(data);
      } catch (error) {
        logger.error('Error fetching live counters', error as Error);
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <CountersContainer>
      <SectionTitle>
        <Activity />
        Live Platform Statistics
      </SectionTitle>
      <CountersGrid>
        <CounterCard $interactive onClick={() => onAction?.('users')}>
          <CounterIcon><Users /></CounterIcon>
          <CounterValue>{(stats?.totalUsers || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Users</CounterLabel>
          <ActionButton>Manage Users</ActionButton>
        </CounterCard>

        <CounterCard $interactive onClick={() => onAction?.('cars')}>
          <CounterIcon><Car /></CounterIcon>
          <CounterValue>{(stats?.totalCars || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Cars</CounterLabel>
          <ActionButton>Manage Fleet</ActionButton>
        </CounterCard>

        <CounterCard $interactive onClick={() => onAction?.('views')}>
          <CounterIcon><Eye /></CounterIcon>
          <CounterValue>{(stats?.totalViews || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Views</CounterLabel>
          <ActionButton>View Analytics</ActionButton>
        </CounterCard>

        <CounterCard $interactive onClick={() => onAction?.('messages')}>
          <CounterIcon><MessageSquare /></CounterIcon>
          <CounterValue>{(counters?.totalMessages || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Messages</CounterLabel>
          <ActionButton>Open Inbox</ActionButton>
        </CounterCard>

        <CounterCard $interactive onClick={() => onAction?.('revenue')}>
          <CounterIcon><DollarSign /></CounterIcon>
          <CounterValue>€{(counters?.totalRevenue || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Revenue</CounterLabel>
          <ActionButton>Details</ActionButton>
        </CounterCard>

        <CounterCard>
          <CounterIcon><HardDrive /></CounterIcon>
          <CounterValue>{(counters?.storageUsage || 0).toLocaleString()} MB</CounterValue>
          <CounterLabel>Storage Usage</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><Database /></CounterIcon>
          <CounterValue>{(counters?.firestoreReads || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Firestore Reads</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><Database /></CounterIcon>
          <CounterValue>{(counters?.firestoreWrites || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Firestore Writes</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><Download /></CounterIcon>
          <CounterValue>{(counters?.functionInvocations || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Function Invocations</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><Zap /></CounterIcon>
          <CounterValue>{(counters?.activeSessions || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Active Sessions</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><CheckCircle /></CounterIcon>
          <CounterValue>{counters?.systemHealth || 'OK'}</CounterValue>
          <CounterLabel>System Health</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><AlertCircle /></CounterIcon>
          <CounterValue>{(counters?.alerts || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Alerts</CounterLabel>
        </CounterCard>
      </CountersGrid>
    </CountersContainer>
  );
};

export default LiveCounters;
