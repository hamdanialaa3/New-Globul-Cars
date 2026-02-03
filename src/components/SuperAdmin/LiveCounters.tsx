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
  background: #0f1419;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 24px;
  margin: 0 20px 20px 20px;
  color: #f8fafc;
`;

const SectionTitle = styled.h2`
  color: #ff8c61;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CountersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const CounterCard = styled.div<{ $interactive?: boolean }>`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.2s ease;
  position: relative;
  cursor: ${props => props.$interactive ? 'pointer' : 'default'};
  overflow: hidden;
  
  &:hover {
    border-color: #ff8c61;
    transform: ${props => props.$interactive ? 'translateY(-4px)' : 'none'};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    background: #252b3a;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 8px;
  background: #ff8c61;
  color: #0f1419;
  border: none;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 1px;

  ${CounterCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover {
    background: #ffa885;
  }
`;

const CounterIcon = styled.div`
  background: #252b3a;
  color: #ff8c61;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 20px;
  border: 1px solid #2d3748;
`;

const CounterValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
`;

const CounterLabel = styled.div`
  font-size: 11px;
  color: #cbd5e1;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  top: 12px;
  right: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 10px ${props => {
    switch (props.$status) {
      case 'online': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'offline': return '#f87171';
      default: return '#64748b';
    }
  }};
  background: ${props => {
    switch (props.$status) {
      case 'online': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'offline': return '#f87171';
      default: return '#64748b';
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
