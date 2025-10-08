import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users, 
  Car, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  MapPin, 
  Smartphone, 
  Globe,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import { advancedRealDataService } from '../services/advanced-real-data-service';

// Styled Components
const RealDataContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
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

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const StatusIndicator = styled.div<{ $isReal: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$isReal ? '#4ade80' : '#fbbf24'};
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const DataIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
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

const RealTimeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4ade80;
  font-weight: 600;
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

// Real Data Display Component
const RealDataDisplay: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<any>(null);

  const loadRealData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading real data...');
      
      const [analytics, userActivity, contentModeration, users, cars, messages, liveStatsData, engagementData, revenueData] = await Promise.all([
        advancedRealDataService.getRealTimeAnalytics(),
        advancedRealDataService.getRealUserActivity(),
        advancedRealDataService.getRealContentModeration(),
        advancedRealDataService.getRealUsers(),
        advancedRealDataService.getRealCars(),
        advancedRealDataService.getRealMessages(),
        advancedRealDataService.getLiveStatistics(),
        advancedRealDataService.getUserEngagementMetrics(),
        advancedRealDataService.getRevenueAnalytics()
      ]);

      setData({
        analytics,
        userActivity,
        contentModeration,
        users,
        cars,
        messages
      });
      
      setLiveStats(liveStatsData);
      setEngagementMetrics(engagementData);
      setRevenueAnalytics(revenueData);
      
      setIsRealData(true);
      setLastUpdated(new Date());
      console.log('✅ Real data loaded successfully');
    } catch (error) {
      console.error('Error loading real data:', error);
      setIsRealData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  if (loading) {
    return (
      <RealDataContainer>
        <Header>
          <Title>
            <RefreshCw size={24} />
            Real Data Dashboard
          </Title>
          <StatusIndicator $isReal={false}>
            <LoadingSpinner />
            Loading...
          </StatusIndicator>
        </Header>
      </RealDataContainer>
    );
  }

  if (!data) {
    return (
      <RealDataContainer>
        <Header>
          <Title>
            <AlertCircle size={24} />
            Real Data Dashboard
          </Title>
          <StatusIndicator $isReal={false}>
            <AlertCircle size={16} />
            No Data Available
          </StatusIndicator>
        </Header>
      </RealDataContainer>
    );
  }

  return (
    <RealDataContainer>
      <Header>
        <Title>
          <CheckCircle size={24} />
          Real Data Dashboard
        </Title>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <StatusIndicator $isReal={isRealData}>
            {isRealData ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {isRealData ? 'Real Data' : 'Mock Data'}
          </StatusIndicator>
          <RefreshButton onClick={loadRealData}>
            <RefreshCw size={16} />
            Refresh
          </RefreshButton>
        </div>
      </Header>

      {isRealData && (
        <RealTimeIndicator>
          <CheckCircle size={16} />
          Last updated: {lastUpdated?.toLocaleTimeString()}
        </RealTimeIndicator>
      )}

      <DataGrid>
        <DataCard>
          <DataIcon>
            <Users size={20} />
            Total Users
          </DataIcon>
          <DataValue>{data.analytics?.totalUsers || 0}</DataValue>
          <DataLabel>Registered Users</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <Car size={20} />
            Total Cars
          </DataIcon>
          <DataValue>{data.analytics?.totalCars || 0}</DataValue>
          <DataLabel>Listed Vehicles</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <MessageSquare size={20} />
            Messages
          </DataIcon>
          <DataValue>{data.analytics?.totalMessages || 0}</DataValue>
          <DataLabel>Total Conversations</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <Eye size={20} />
            Views
          </DataIcon>
          <DataValue>{data.analytics?.totalViews || 0}</DataValue>
          <DataLabel>Total Page Views</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <TrendingUp size={20} />
            Revenue
          </DataIcon>
          <DataValue>€{data.analytics?.revenue?.toLocaleString() || 0}</DataValue>
          <DataLabel>Total Revenue</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <MapPin size={20} />
            Top City
          </DataIcon>
          <DataValue>{data.analytics?.topCities?.[0]?.city || 'N/A'}</DataValue>
          <DataLabel>{data.analytics?.topCities?.[0]?.count || 0} users</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <Smartphone size={20} />
            Mobile Users
          </DataIcon>
          <DataValue>{Math.round((data.analytics?.deviceUsage?.mobile || 0) * (data.analytics?.totalUsers || 0) / 100)}</DataValue>
          <DataLabel>Mobile Traffic</DataLabel>
        </DataCard>

        <DataCard>
          <DataIcon>
            <Globe size={20} />
            Traffic Source
          </DataIcon>
          <DataValue>{Object.keys(data.analytics?.trafficSources || {}).length}</DataValue>
          <DataLabel>Different Sources</DataLabel>
        </DataCard>
      </DataGrid>

      {/* Live Statistics Section */}
      {liveStats && (
        <>
          <Title style={{ marginTop: '32px', marginBottom: '16px' }}>
            <Activity size={24} />
            Live Statistics
          </Title>
          <DataGrid>
            <DataCard>
              <DataIcon>
                <Users size={20} />
                New Users Today
              </DataIcon>
              <DataValue>{liveStats.newUsersToday || 0}</DataValue>
              <DataLabel>Registered Today</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <Car size={20} />
                New Cars Today
              </DataIcon>
              <DataValue>{liveStats.newCarsToday || 0}</DataValue>
              <DataLabel>Listed Today</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <MessageSquare size={20} />
                Messages Today
              </DataIcon>
              <DataValue>{liveStats.messagesToday || 0}</DataValue>
              <DataLabel>Sent Today</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <Clock size={20} />
                Last Updated
              </DataIcon>
              <DataValue>{liveStats.lastUpdated?.toLocaleTimeString() || 'N/A'}</DataValue>
              <DataLabel>Live Data</DataLabel>
            </DataCard>
          </DataGrid>
        </>
      )}

      {/* Revenue Analytics Section */}
      {revenueAnalytics && (
        <>
          <Title style={{ marginTop: '32px', marginBottom: '16px' }}>
            <DollarSign size={24} />
            Revenue Analytics
          </Title>
          <DataGrid>
            <DataCard>
              <DataIcon>
                <DollarSign size={20} />
                Total Revenue
              </DataIcon>
              <DataValue>€{revenueAnalytics.totalRevenue?.toLocaleString() || 0}</DataValue>
              <DataLabel>All Time</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <TrendingUp size={20} />
                Revenue Today
              </DataIcon>
              <DataValue>€{revenueAnalytics.revenueToday?.toLocaleString() || 0}</DataValue>
              <DataLabel>Today's Earnings</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <BarChart3 size={20} />
                Avg Car Price
              </DataIcon>
              <DataValue>€{Math.round(revenueAnalytics.averageCarPrice || 0).toLocaleString()}</DataValue>
              <DataLabel>Average Price</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <PieChart size={20} />
                Conversion Rate
              </DataIcon>
              <DataValue>{revenueAnalytics.conversionRate?.toFixed(1) || 0}%</DataValue>
              <DataLabel>Sales Rate</DataLabel>
            </DataCard>
          </DataGrid>
        </>
      )}

      {/* Engagement Metrics Section */}
      {engagementMetrics && (
        <>
          <Title style={{ marginTop: '32px', marginBottom: '16px' }}>
            <Activity size={24} />
            User Engagement
          </Title>
          <DataGrid>
            <DataCard>
              <DataIcon>
                <Users size={20} />
                Avg Logins
              </DataIcon>
              <DataValue>{Math.round(engagementMetrics.averageLoginCount || 0)}</DataValue>
              <DataLabel>Per User</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <Smartphone size={20} />
                Mobile Users
              </DataIcon>
              <DataValue>{engagementMetrics.deviceDistribution?.Mobile || 0}</DataValue>
              <DataLabel>Mobile Traffic</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <Globe size={20} />
                Browser Usage
              </DataIcon>
              <DataValue>{Object.keys(engagementMetrics.browserDistribution || {}).length}</DataValue>
              <DataLabel>Different Browsers</DataLabel>
            </DataCard>
            <DataCard>
              <DataIcon>
                <Activity size={20} />
                Activity Types
              </DataIcon>
              <DataValue>{Object.keys(engagementMetrics.activityTypes || {}).length}</DataValue>
              <DataLabel>User Actions</DataLabel>
            </DataCard>
          </DataGrid>
        </>
      )}
    </RealDataContainer>
  );
};

export default RealDataDisplay;
