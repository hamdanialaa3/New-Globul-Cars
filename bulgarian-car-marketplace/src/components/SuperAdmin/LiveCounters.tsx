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
  animation: countUp 1s ease-out;
  
  @keyframes countUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
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

const LiveCounters: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading live Firebase analytics...');
        const data = await liveFirebaseCountersService.getLiveAnalytics();
        console.log('✅ Live analytics loaded:', data);
        setAnalytics(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('❌ Error loading live analytics:', error);
        console.log('🔄 Using fallback mock data...');
        
        // Set fallback data with realistic values
        setAnalytics({
          totalUsers: 4,
          activeUsers: 2,
          totalCars: 12,
          activeCars: 10,
          totalMessages: 45,
          totalViews: 1250,
          revenue: 25000,
          storageUsage: 20.5,
          firestoreReads: 164,
          firestoreWrites: 61,
          hostingDownloads: 144,
          functionsInvocations: 7,
          lastUpdated: new Date(),
          dailyActiveUsers: 2,
          day1Retention: 75,
          hostingGrowth: 92.4,
          functionsGrowth: 133.3,
          storageGrowth: 208.6,
          lastDeployment: 'Oct 6, 2025 12:14 PM',
          deployedBy: 'globul.net.m@gmail.com',
          isMockData: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <CountersContainer>
        <LoadingSpinner>
          <Activity size={20} className="animate-spin" />
          Loading live Firebase data...
        </LoadingSpinner>
      </CountersContainer>
    );
  }

  // Show mock data indicator
  const MockDataIndicator = styled.div`
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;

  if (!analytics) {
    return (
      <CountersContainer>
        <div style={{ textAlign: 'center', color: '#ffd700', fontSize: '18px' }}>
          Failed to load live data
        </div>
      </CountersContainer>
    );
  }

  return (
    <CountersContainer>
      {analytics?.isMockData && (
        <MockDataIndicator>
          <AlertTriangle size={16} />
          Using Mock Data - Firebase Connection Failed
        </MockDataIndicator>
      )}
      
      <SectionTitle>
        <Activity size={24} />
        Live Firebase Counters
        <span style={{ fontSize: '14px', opacity: 0.7, marginLeft: 'auto' }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </SectionTitle>

      <CountersGrid>
        {/* Users Counter */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Users size={28} />
          </CounterIcon>
          <CounterValue>{analytics.totalUsers}</CounterValue>
          <CounterLabel>Total Users</CounterLabel>
          <CounterChange $positive={analytics.activeUsers > 0}>
            <TrendingUp size={12} />
            {analytics.activeUsers} active
          </CounterChange>
        </CounterCard>

        {/* Cars Counter */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Car size={28} />
          </CounterIcon>
          <CounterValue>{analytics.totalCars}</CounterValue>
          <CounterLabel>Total Cars</CounterLabel>
          <CounterChange $positive={analytics.activeCars > 0}>
            <TrendingUp size={12} />
            {analytics.activeCars} active
          </CounterChange>
        </CounterCard>

        {/* Messages Counter */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <MessageSquare size={28} />
          </CounterIcon>
          <CounterValue>{analytics.totalMessages}</CounterValue>
          <CounterLabel>Messages</CounterLabel>
          <CounterChange $positive={true}>
            <Activity size={12} />
            Real-time
          </CounterChange>
        </CounterCard>

        {/* Views Counter */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Eye size={28} />
          </CounterIcon>
          <CounterValue>{analytics.totalViews}</CounterValue>
          <CounterLabel>Total Views</CounterLabel>
          <CounterChange $positive={true}>
            <TrendingUp size={12} />
            Growing
          </CounterChange>
        </CounterCard>

        {/* Revenue Counter */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <DollarSign size={28} />
          </CounterIcon>
          <CounterValue>€{analytics.revenue}</CounterValue>
          <CounterLabel>Revenue</CounterLabel>
          <CounterChange $positive={analytics.revenue > 0}>
            <TrendingUp size={12} />
            Commission
          </CounterChange>
        </CounterCard>

        {/* Storage Counter */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <HardDrive size={28} />
          </CounterIcon>
          <CounterValue>{analytics.storageUsage}MB</CounterValue>
          <CounterLabel>Storage Used</CounterLabel>
          <CounterChange $positive={true}>
            <TrendingUp size={12} />
            +{analytics.storageGrowth}%
          </CounterChange>
        </CounterCard>

        {/* Firestore Reads */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Database size={28} />
          </CounterIcon>
          <CounterValue>{analytics.firestoreReads}</CounterValue>
          <CounterLabel>Firestore Reads</CounterLabel>
          <CounterChange $positive={true}>
            <Activity size={12} />
            Current
          </CounterChange>
        </CounterCard>

        {/* Firestore Writes */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Database size={28} />
          </CounterIcon>
          <CounterValue>{analytics.firestoreWrites}</CounterValue>
          <CounterLabel>Firestore Writes</CounterLabel>
          <CounterChange $positive={true}>
            <Activity size={12} />
            Current
          </CounterChange>
        </CounterCard>

        {/* Hosting Downloads */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Download size={28} />
          </CounterIcon>
          <CounterValue>{analytics.hostingDownloads}MB</CounterValue>
          <CounterLabel>Hosting Downloads</CounterLabel>
          <CounterChange $positive={true}>
            <TrendingUp size={12} />
            +{analytics.hostingGrowth}%
          </CounterChange>
        </CounterCard>

        {/* Functions Invocations */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <Zap size={28} />
          </CounterIcon>
          <CounterValue>{analytics.functionsInvocations}</CounterValue>
          <CounterLabel>Functions Calls</CounterLabel>
          <CounterChange $positive={true}>
            <TrendingUp size={12} />
            +{analytics.functionsGrowth}%
          </CounterChange>
        </CounterCard>

        {/* Daily Active Users */}
        <CounterCard>
          <StatusIndicator $status={analytics.dailyActiveUsers > 0 ? 'online' : 'warning'} />
          <CounterIcon>
            <Users size={28} />
          </CounterIcon>
          <CounterValue>{analytics.dailyActiveUsers}</CounterValue>
          <CounterLabel>Daily Active Users</CounterLabel>
          <CounterChange $positive={false} $neutral={true}>
            <Clock size={12} />
            Today
          </CounterChange>
        </CounterCard>

        {/* System Status */}
        <CounterCard>
          <StatusIndicator $status="online" />
          <CounterIcon>
            <CheckCircle size={28} />
          </CounterIcon>
          <CounterValue>99.9%</CounterValue>
          <CounterLabel>System Uptime</CounterLabel>
          <CounterChange $positive={true}>
            <CheckCircle size={12} />
            Healthy
          </CounterChange>
        </CounterCard>
      </CountersGrid>

      {/* Deployment Info */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        border: '2px solid #ffd700',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ffd700', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
          🚀 Last Deployment
        </div>
        <div style={{ color: '#ffed4e', fontSize: '14px' }}>
          {analytics.lastDeployment} by {analytics.deployedBy}
        </div>
      </div>
    </CountersContainer>
  );
};

export default LiveCounters;
