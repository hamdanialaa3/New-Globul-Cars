import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  MessageSquare, 
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react';

// Styled Components
const AnalyticsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const AnalyticsTitle = styled.h2`
  color: #1c1e21;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AnalyticsTabs = styled.div`
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 12px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#007bff' : '#65676b'};
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0, 123, 255, 0.15)' : 'none'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  color: #1c1e21;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const ChartContent = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
`;

const MockChart = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
  justify-content: space-around;
  padding: 20px;
  gap: 8px;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  width: 20px;
  height: ${props => props.$height}%;
  background: ${props => props.$color};
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '${props => props.$height}';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    font-weight: 600;
    color: #65676b;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #65676b;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  color: ${props => props.$positive ? '#28a745' : '#dc3545'};
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const MapContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  margin-bottom: 30px;
`;

const MapTitle = styled.h3`
  color: #1c1e21;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MapContent = styled.div`
  height: 300px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
`;

const MapPin = styled.div<{ $x: number; $y: number; $size: number }>`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: #ff6b6b;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const TimelineContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const TimelineTitle = styled.h3`
  color: #1c1e21;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TimelineIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  margin-right: 16px;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1c1e21;
  margin-bottom: 4px;
`;

const TimelineDescription = styled.div`
  font-size: 12px;
  color: #65676b;
  margin-bottom: 4px;
`;

const TimelineTime = styled.div`
  font-size: 11px;
  color: #adb5bd;
`;

interface AdvancedAnalyticsProps {
  analytics: any;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ analytics }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // محاكاة بيانات الرسوم البيانية
    const mockData = {
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 180 },
        { month: 'Mar', users: 250 },
        { month: 'Apr', users: 320 },
        { month: 'May', users: 400 },
        { month: 'Jun', users: 480 }
      ],
      carListings: [
        { month: 'Jan', cars: 80 },
        { month: 'Feb', cars: 120 },
        { month: 'Mar', cars: 180 },
        { month: 'Apr', cars: 220 },
        { month: 'May', cars: 280 },
        { month: 'Jun', cars: 350 }
      ],
      revenue: [
        { month: 'Jan', amount: 1200 },
        { month: 'Feb', amount: 1800 },
        { month: 'Mar', amount: 2500 },
        { month: 'Apr', amount: 3200 },
        { month: 'May', amount: 4000 },
        { month: 'Jun', amount: 4800 }
      ]
    };
    setChartData(mockData);
  }, []);

  const timelineEvents = [
    {
      icon: '👤',
      color: '#007bff',
      title: 'New User Registration',
      description: 'User registered from Sofia, Bulgaria',
      time: '2 minutes ago'
    },
    {
      icon: '📝',
      color: '#28a745',
      title: 'Car Listing Added',
      description: 'BMW X5 2020 added to marketplace',
      time: '5 minutes ago'
    },
    {
      icon: '💬',
      color: '#ffc107',
      title: 'New Message',
      description: 'Message sent between users',
      time: '8 minutes ago'
    },
    {
      icon: '👁️',
      color: '#17a2b8',
      title: 'Car Viewed',
      description: 'Audi A4 2019 viewed 5 times',
      time: '12 minutes ago'
    }
  ];

  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <AnalyticsTitle>
          <BarChart3 size={24} />
          Advanced Analytics
        </AnalyticsTitle>
        <AnalyticsTabs>
          <TabButton 
            $active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton 
            $active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </TabButton>
          <TabButton 
            $active={activeTab === 'cars'} 
            onClick={() => setActiveTab('cars')}
          >
            Cars
          </TabButton>
          <TabButton 
            $active={activeTab === 'revenue'} 
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </TabButton>
        </AnalyticsTabs>
      </AnalyticsHeader>

      {/* إحصائيات سريعة */}
      <StatsGrid>
        <StatCard>
          <StatValue>{analytics?.totalUsers || 0}</StatValue>
          <StatLabel>Total Users</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={12} />
            +12.5%
          </StatChange>
        </StatCard>
        <StatCard>
          <StatValue>{analytics?.totalCars || 0}</StatValue>
          <StatLabel>Total Cars</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={12} />
            +8.3%
          </StatChange>
        </StatCard>
        <StatCard>
          <StatValue>{analytics?.totalMessages || 0}</StatValue>
          <StatLabel>Messages</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={12} />
            +15.2%
          </StatChange>
        </StatCard>
        <StatCard>
          <StatValue>${analytics?.revenue || 0}</StatValue>
          <StatLabel>Revenue</StatLabel>
          <StatChange $positive={true}>
            <TrendingUp size={12} />
            +22.1%
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* الرسوم البيانية */}
      <ChartsGrid>
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <ChartIcon $color="#007bff">
                <Users size={16} />
              </ChartIcon>
              User Growth
            </ChartTitle>
          </ChartHeader>
          <ChartContent>
            <MockChart>
              {chartData?.userGrowth.map((item: any, index: number) => (
                <Bar 
                  key={index}
                  $height={item.users / 10}
                  $color="#007bff"
                />
              ))}
            </MockChart>
          </ChartContent>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <ChartIcon $color="#28a745">
                <Car size={16} />
              </ChartIcon>
              Car Listings
            </ChartTitle>
          </ChartHeader>
          <ChartContent>
            <MockChart>
              {chartData?.carListings.map((item: any, index: number) => (
                <Bar 
                  key={index}
                  $height={item.cars / 10}
                  $color="#28a745"
                />
              ))}
            </MockChart>
          </ChartContent>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <ChartIcon $color="#ffc107">
                <DollarSign size={16} />
              </ChartIcon>
              Revenue Growth
            </ChartTitle>
          </ChartHeader>
          <ChartContent>
            <MockChart>
              {chartData?.revenue.map((item: any, index: number) => (
                <Bar 
                  key={index}
                  $height={item.amount / 100}
                  $color="#ffc107"
                />
              ))}
            </MockChart>
          </ChartContent>
        </ChartCard>

        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <ChartIcon $color="#17a2b8">
                <PieChart size={16} />
              </ChartIcon>
              User Distribution
            </ChartTitle>
          </ChartHeader>
          <ChartContent>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%',
                background: 'conic-gradient(#007bff 0deg 120deg, #28a745 120deg 240deg, #ffc107 240deg 360deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                100%
              </div>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#65676b' }}>
                <div>Active: 60%</div>
                <div>Inactive: 40%</div>
              </div>
            </div>
          </ChartContent>
        </ChartCard>
      </ChartsGrid>

      {/* خريطة المستخدمين */}
      <MapContainer>
        <MapTitle>
          <Globe size={20} />
          User Distribution Map
        </MapTitle>
        <MapContent>
          <div style={{ textAlign: 'center' }}>
            <Globe size={48} style={{ marginBottom: '16px' }} />
            <div>Interactive World Map</div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
              Showing user locations worldwide
            </div>
          </div>
          <MapPin $x={20} $y={30} $size={12} />
          <MapPin $x={60} $y={40} $size={16} />
          <MapPin $x={80} $y={25} $size={10} />
          <MapPin $x={30} $y={60} $size={14} />
        </MapContent>
      </MapContainer>

      {/* الجدول الزمني للنشاط */}
      <TimelineContainer>
        <TimelineTitle>
          <Activity size={20} />
          Recent Activity Timeline
        </TimelineTitle>
        {timelineEvents.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineIcon $color={event.color}>
              {event.icon}
            </TimelineIcon>
            <TimelineContent>
              <TimelineItemTitle>{event.title}</TimelineItemTitle>
              <TimelineDescription>{event.description}</TimelineDescription>
              <TimelineTime>{event.time}</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        ))}
      </TimelineContainer>
    </AnalyticsContainer>
  );
};

export default AdvancedAnalytics;
