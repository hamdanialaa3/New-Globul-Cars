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
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 30px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  color: #ffd700;
`;

const SectionTitle = styled.h2`
  color: #ffd700;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 30px 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CountersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const CounterCard = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const CounterIcon = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 28px;
  border: 3px solid #ffd700;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const CounterValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #ffd700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
`;

const CounterLabel = styled.div`
  font-size: 14px;
  color: #ffd700;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CounterChange = styled.div<{ $positive: boolean; $neutral?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => {
    if (props.$neutral) return '#ffd700';
    return props.$positive ? '#4ade80' : '#f87171';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
`;

const StatusIndicator = styled.div<{ $status: 'online' | 'offline' | 'warning' }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'online': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'offline': return '#f87171';
      default: return '#6b7280';
    }
  }};
  box-shadow: 0 0 10px ${props => {
    switch (props.$status) {
      case 'online': return 'rgba(74, 222, 128, 0.5)';
      case 'warning': return 'rgba(251, 191, 36, 0.5)';
      case 'offline': return 'rgba(248, 113, 113, 0.5)';
      default: return 'rgba(107, 114, 128, 0.5)';
    }
  }};
  animation: ${props => props.$status === 'online' ? 'pulse 2s infinite' : 'none'};
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

const LiveCounters: React.FC<LiveCountersProps> = ({ stats = { totalCars: 0, totalUsers: 0, totalViews: 0 } }) => {
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
        <CounterCard>
          <CounterIcon><Users /></CounterIcon>
          <CounterValue>{(stats?.totalUsers || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Users</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><Car /></CounterIcon>
          <CounterValue>{(stats?.totalCars || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Cars</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><Eye /></CounterIcon>
          <CounterValue>{(stats?.totalViews || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Views</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><MessageSquare /></CounterIcon>
          <CounterValue>{(counters?.totalMessages || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Messages</CounterLabel>
        </CounterCard>
        <CounterCard>
          <CounterIcon><DollarSign /></CounterIcon>
          <CounterValue>€{(counters?.totalRevenue || 0).toLocaleString()}</CounterValue>
          <CounterLabel>Total Revenue</CounterLabel>
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
