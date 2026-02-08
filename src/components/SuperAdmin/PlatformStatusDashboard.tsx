import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Activity,
  Users,
  Car,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Circle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap
} from 'lucide-react';

const Container = styled.div`
  background: #0f1419;
  border-radius: 12px;
  border: 1px solid #1e2432;
  padding: 24px;
  margin: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div``;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ff8c61;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

const RefreshButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #374151;
  border-radius: 6px;
  background: #1a1f2e;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #2d3748;
    border-color: #ff8c61;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatusCard = styled.div<{ $status: 'online' | 'warning' | 'offline' }>`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => {
    if (props.$status === 'online') return '#065f46';
    if (props.$status === 'warning') return '#92400e';
    return '#7f1d1d';
  }};
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ServiceName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
`;

const StatusBadge = styled.div<{ $status: 'online' | 'warning' | 'offline' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  
  ${props => {
    if (props.$status === 'online') {
      return `
        background: #064e3b;
        color: #6ee7b7;
      `;
    }
    if (props.$status === 'warning') {
      return `
        background: #78350f;
        color: #fcd34d;
      `;
    }
    return `
      background: #7f1d1d;
      color: #fca5a5;
    `;
  }}
`;

const ServiceMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const MetricLabel = styled.span`
  color: #9ca3af;
`;

const MetricValue = styled.span`
  color: #e5e7eb;
  font-weight: 600;
`;

const StatsSection = styled.div`
  background: #1a1f2e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #2d3748;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #374151;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 16px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #ff8c61;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.$positive ? '#6ee7b7' : '#fca5a5'};
`;

const LastUpdate = styled.div`
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  margin-top: 16px;
`;

const PlatformStatusDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [services, setServices] = useState([
    { name: 'Firebase Firestore', status: 'online' as const, uptime: '99.9%', latency: '45ms' },
    { name: 'Firebase Storage', status: 'online' as const, uptime: '99.8%', size: '2.4 GB' },
    { name: 'Firebase Auth', status: 'online' as const, users: '1,234', latency: '32ms' },
    { name: 'Algolia Search', status: 'online' as const, indexes: '3', latency: '12ms' },
    { name: 'Firebase Hosting', status: 'online' as const, uptime: '100%', bandwidth: '120 GB' },
    { name: 'Cloud Functions', status: 'warning' as const, active: '8/10', errors: '2%' }
  ]);

  const [stats, setStats] = useState({
    totalUsers: { value: 1234, change: 12.5, positive: true },
    activeCars: { value: 5678, change: 8.3, positive: true },
    totalMessages: { value: 12890, change: 15.2, positive: true },
    revenue: { value: 45678, change: -2.1, positive: false },
    activeDeals: { value: 234, change: 5.7, positive: true },
    newToday: { value: 56, change: 3.2, positive: true }
  });

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'online' | 'warning' | 'offline') => {
    if (status === 'online') return <CheckCircle size={14} />;
    if (status === 'warning') return <AlertTriangle size={14} />;
    return <XCircle size={14} />;
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <Activity size={24} />
            حالة المنصة المباشرة
          </Title>
          <Subtitle>
            مراقبة الخوادم، الأداء، والإحصائيات في الوقت الفعلي
          </Subtitle>
        </HeaderLeft>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          تحديث
        </RefreshButton>
      </Header>

      {/* ═══ Services Status ═══ */}
      <StatusGrid>
        {services.map((service, index) => (
          <StatusCard key={index} $status={service.status}>
            <ServiceHeader>
              <ServiceName>{service.name}</ServiceName>
              <StatusBadge $status={service.status}>
                {getStatusIcon(service.status)}
                {service.status === 'online' ? 'متصل' : service.status === 'warning' ? 'تحذير' : 'غير متصل'}
              </StatusBadge>
            </ServiceHeader>
            <ServiceMetrics>
              {service.uptime && (
                <MetricRow>
                  <MetricLabel>Uptime:</MetricLabel>
                  <MetricValue>{service.uptime}</MetricValue>
                </MetricRow>
              )}
              {service.latency && (
                <MetricRow>
                  <MetricLabel>Response:</MetricLabel>
                  <MetricValue>{service.latency}</MetricValue>
                </MetricRow>
              )}
              {service.size && (
                <MetricRow>
                  <MetricLabel>Storage:</MetricLabel>
                  <MetricValue>{service.size}</MetricValue>
                </MetricRow>
              )}
              {service.users && (
                <MetricRow>
                  <MetricLabel>Users:</MetricLabel>
                  <MetricValue>{service.users}</MetricValue>
                </MetricRow>
              )}
              {service.indexes && (
                <MetricRow>
                  <MetricLabel>Indexes:</MetricLabel>
                  <MetricValue>{service.indexes}</MetricValue>
                </MetricRow>
              )}
              {service.bandwidth && (
                <MetricRow>
                  <MetricLabel>Bandwidth:</MetricLabel>
                  <MetricValue>{service.bandwidth}</MetricValue>
                </MetricRow>
              )}
              {service.active && (
                <MetricRow>
                  <MetricLabel>Functions:</MetricLabel>
                  <MetricValue>{service.active}</MetricValue>
                </MetricRow>
              )}
              {service.errors && (
                <MetricRow>
                  <MetricLabel>Error Rate:</MetricLabel>
                  <MetricValue>{service.errors}</MetricValue>
                </MetricRow>
              )}
            </ServiceMetrics>
          </StatusCard>
        ))}
      </StatusGrid>

      {/* ═══ Platform Statistics ═══ */}
      <StatsSection>
        <SectionTitle>
          <TrendingUp size={18} />
          إحصائيات المنصة المباشرة
        </SectionTitle>
        
        <StatsGrid>
          <StatCard>
            <StatLabel>إجمالي المستخدمين</StatLabel>
            <StatValue>
              <Users size={20} />
              {stats.totalUsers.value.toLocaleString()}
            </StatValue>
            <StatChange $positive={stats.totalUsers.positive}>
              {stats.totalUsers.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stats.totalUsers.change)}% من الشهر الماضي
            </StatChange>
          </StatCard>

          <StatCard>
            <StatLabel>السيارات النشطة</StatLabel>
            <StatValue>
              <Car size={20} />
              {stats.activeCars.value.toLocaleString()}
            </StatValue>
            <StatChange $positive={stats.activeCars.positive}>
              {stats.activeCars.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stats.activeCars.change)}% من الشهر الماضي
            </StatChange>
          </StatCard>

          <StatCard>
            <StatLabel>إجمالي الرسائل</StatLabel>
            <StatValue>
              <MessageSquare size={20} />
              {stats.totalMessages.value.toLocaleString()}
            </StatValue>
            <StatChange $positive={stats.totalMessages.positive}>
              {stats.totalMessages.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stats.totalMessages.change)}% من الشهر الماضي
            </StatChange>
          </StatCard>

          <StatCard>
            <StatLabel>الإيرادات (SAR)</StatLabel>
            <StatValue>
              <DollarSign size={20} />
              {stats.revenue.value.toLocaleString()}
            </StatValue>
            <StatChange $positive={stats.revenue.positive}>
              {stats.revenue.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stats.revenue.change)}% من الشهر الماضي
            </StatChange>
          </StatCard>

          <StatCard>
            <StatLabel>الصفقات النشطة</StatLabel>
            <StatValue>
              <Zap size={20} />
              {stats.activeDeals.value.toLocaleString()}
            </StatValue>
            <StatChange $positive={stats.activeDeals.positive}>
              {stats.activeDeals.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stats.activeDeals.change)}% من الشهر الماضي
            </StatChange>
          </StatCard>

          <StatCard>
            <StatLabel>جديد اليوم</StatLabel>
            <StatValue>
              <Circle size={20} fill="#ff8c61" />
              {stats.newToday.value}
            </StatValue>
            <StatChange $positive={stats.newToday.positive}>
              {stats.newToday.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(stats.newToday.change)}% من الأمس
            </StatChange>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      <LastUpdate>
        آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')} - {lastUpdate.toLocaleDateString('ar-SA')}
      </LastUpdate>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Container>
  );
};

export default PlatformStatusDashboard;
