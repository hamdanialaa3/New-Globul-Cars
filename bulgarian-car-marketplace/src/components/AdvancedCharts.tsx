import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Globe,
  Smartphone,
  MapPin
} from 'lucide-react';
import { advancedRealDataService } from '@/services/advanced-real-data-service';

// Styled Components
const ChartsContainer = styled.div`
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

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ChartTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SimpleBarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BarItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 4px;
`;

const BarLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const BarValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #4ade80;
`;

const Bar = styled.div<{ $width: number; $color?: string }>`
  height: 8px;
  background: ${props => props.$color || '#4ade80'};
  border-radius: 4px;
  width: ${props => props.$width}%;
  margin-top: 4px;
  transition: width 0.3s ease;
`;

const PieChartContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const PieItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.$color}20;
  border: 1px solid ${props => props.$color};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
`;

const PieColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Advanced Charts Component
const AdvancedCharts: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadChartData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading chart data...');
      
      const [analytics, liveStats, engagementMetrics, revenueAnalytics] = await Promise.all([
        advancedRealDataService.getRealTimeAnalytics(),
        advancedRealDataService.getLiveStatistics(),
        advancedRealDataService.getUserEngagementMetrics(),
        advancedRealDataService.getRevenueAnalytics()
      ]);

      setData({
        analytics,
        liveStats,
        engagementMetrics,
        revenueAnalytics
      });
      
      console.log('✅ Chart data loaded successfully');
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  if (loading) {
    return (
      <ChartsContainer>
        <Header>
          <Title>
            <BarChart3 size={24} />
            Advanced Analytics Charts
          </Title>
          <LoadingSpinner />
        </Header>
      </ChartsContainer>
    );
  }

  if (!data) {
    return (
      <ChartsContainer>
        <Header>
          <Title>
            <BarChart3 size={24} />
            Advanced Analytics Charts
          </Title>
        </Header>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Activity size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p>No chart data available</p>
        </div>
      </ChartsContainer>
    );
  }

  const colors = ['#4ade80', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  return (
    <ChartsContainer>
      <Header>
        <Title>
          <BarChart3 size={24} />
          Advanced Analytics Charts
        </Title>
      </Header>

      <ChartGrid>
        {/* Traffic Sources Chart */}
        <ChartCard>
          <ChartTitle>
            <Globe size={18} />
            Traffic Sources
          </ChartTitle>
          <SimpleBarChart>
            {data.analytics?.trafficSources && Object.entries(data.analytics.trafficSources).map(([source, count], index) => (
              <div key={source}>
                <BarItem>
                  <BarLabel>{source}</BarLabel>
                  <BarValue>{count as number}</BarValue>
                </BarItem>
                <Bar 
                  $width={Math.min((count as number / Math.max(...Object.values(data.analytics.trafficSources) as number[])) * 100, 100)}
                  $color={colors[index % colors.length]}
                />
              </div>
            ))}
          </SimpleBarChart>
        </ChartCard>

        {/* Device Usage Chart */}
        <ChartCard>
          <ChartTitle>
            <Smartphone size={18} />
            Device Usage
          </ChartTitle>
          <SimpleBarChart>
            {data.analytics?.deviceUsage && Object.entries(data.analytics.deviceUsage).map(([device, percentage], index) => (
              <div key={device}>
                <BarItem>
                  <BarLabel>{device}</BarLabel>
                  <BarValue>{percentage as number}%</BarValue>
                </BarItem>
                <Bar 
                  $width={percentage as number}
                  $color={colors[index % colors.length]}
                />
              </div>
            ))}
          </SimpleBarChart>
        </ChartCard>

        {/* Top Countries Chart */}
        <ChartCard>
          <ChartTitle>
            <MapPin size={18} />
            Top Countries
          </ChartTitle>
          <SimpleBarChart>
            {data.analytics?.topCountries?.slice(0, 5).map((country: any, index: number) => (
              <div key={country.country}>
                <BarItem>
                  <BarLabel>{country.country}</BarLabel>
                  <BarValue>{country.count}</BarValue>
                </BarItem>
                <Bar 
                  $width={Math.min((country.count / Math.max(...data.analytics.topCountries.map((c: any) => c.count))) * 100, 100)}
                  $color={colors[index % colors.length]}
                />
              </div>
            ))}
          </SimpleBarChart>
        </ChartCard>

        {/* Top Cities Chart */}
        <ChartCard>
          <ChartTitle>
            <MapPin size={18} />
            Top Cities
          </ChartTitle>
          <SimpleBarChart>
            {data.analytics?.topCities?.slice(0, 5).map((city: any, index: number) => (
              <div key={city.city}>
                <BarItem>
                  <BarLabel>{city.city}</BarLabel>
                  <BarValue>{city.count}</BarValue>
                </BarItem>
                <Bar 
                  $width={Math.min((city.count / Math.max(...data.analytics.topCities.map((c: any) => c.count))) * 100, 100)}
                  $color={colors[index % colors.length]}
                />
              </div>
            ))}
          </SimpleBarChart>
        </ChartCard>

        {/* Activity Types Chart */}
        <ChartCard>
          <ChartTitle>
            <Activity size={18} />
            User Activity Types
          </ChartTitle>
          <PieChartContainer>
            {data.engagementMetrics?.activityTypes && Object.entries(data.engagementMetrics.activityTypes).map(([type, count], index) => (
              <PieItem key={type} $color={colors[index % colors.length]}>
                <PieColor $color={colors[index % colors.length]} />
                <span>{type}: {count as number}</span>
              </PieItem>
            ))}
          </PieChartContainer>
        </ChartCard>

        {/* Browser Distribution Chart */}
        <ChartCard>
          <ChartTitle>
            <Globe size={18} />
            Browser Distribution
          </ChartTitle>
          <PieChartContainer>
            {data.engagementMetrics?.browserDistribution && Object.entries(data.engagementMetrics.browserDistribution).map(([browser, count], index) => (
              <PieItem key={browser} $color={colors[index % colors.length]}>
                <PieColor $color={colors[index % colors.length]} />
                <span>{browser}: {count as number}</span>
              </PieItem>
            ))}
          </PieChartContainer>
        </ChartCard>
      </ChartGrid>

      {/* Key Metrics */}
      <div style={{ marginTop: '24px' }}>
        <Title style={{ marginBottom: '16px' }}>
          <TrendingUp size={20} />
          Key Performance Indicators
        </Title>
        <ChartGrid>
          <MetricCard>
            <MetricValue>€{data.revenueAnalytics?.totalRevenue?.toLocaleString() || 0}</MetricValue>
            <MetricLabel>Total Revenue</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{data.revenueAnalytics?.conversionRate?.toFixed(1) || 0}%</MetricValue>
            <MetricLabel>Conversion Rate</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{Math.round(data.engagementMetrics?.averageLoginCount || 0)}</MetricValue>
            <MetricLabel>Avg Logins/User</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{data.liveStats?.newUsersToday || 0}</MetricValue>
            <MetricLabel>New Users Today</MetricLabel>
          </MetricCard>
        </ChartGrid>
      </div>
    </ChartsContainer>
  );
};

export default AdvancedCharts;
