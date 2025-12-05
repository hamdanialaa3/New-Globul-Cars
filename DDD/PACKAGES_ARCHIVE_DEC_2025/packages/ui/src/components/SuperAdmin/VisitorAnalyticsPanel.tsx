import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Users,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  Eye,
  ExternalLink
} from 'lucide-react';
import { visitorAnalyticsService, VisitorMetrics } from '@globul-cars/services/visitor-analytics-service';
import { logger } from '@globul-cars/services';

const PanelContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 15px;
  padding: 30px;
  margin: 20px;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
  color: #ffd700;
`;

const SectionTitle = styled.h2`
  color: #ffd700;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 25px 0;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
  }
`;

const MetricIcon = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000000;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border: 3px solid #ffd700;
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #ffd700;
  margin-bottom: 6px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #ffd700;
  font-weight: 600;
  text-transform: uppercase;
`;

const ChartSection = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
`;

const ChartTitle = styled.h3`
  color: #ffd700;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DataRow = styled.div`
  margin-bottom: 15px;
`;

const DataLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #ffd700;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ffd700;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: ${props => props.$color};
  transition: width 0.5s ease;
`;

const ListSection = styled.div`
  background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #ffd700;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 3px solid #ffd700;
  font-size: 13px;
  color: #ffd700;

  &:hover {
    background: #2d2d2d;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #ffd700;
  font-size: 18px;
`;

const VisitorAnalyticsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<VisitorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await visitorAnalyticsService.getVisitorMetrics();
        setMetrics(data);
      } catch (error) {
        logger.error('Failed to load visitor metrics', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <PanelContainer>
        <LoadingState>Loading visitor analytics...</LoadingState>
      </PanelContainer>
    );
  }

  if (!metrics) {
    return (
      <PanelContainer>
        <SectionTitle>Error loading visitor metrics</SectionTitle>
      </PanelContainer>
    );
  }

  const getDeviceColor = (type: string): string => {
    switch (type) {
      case 'mobile': return '#3b82f6';
      case 'desktop': return '#8b5cf6';
      case 'tablet': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <PanelContainer>
      <SectionTitle>
        <Users />
        Visitor Analytics
      </SectionTitle>

      <MetricsGrid>
        <MetricCard>
          <MetricIcon>
            <Eye />
          </MetricIcon>
          <MetricValue>{metrics.realTimeVisitors}</MetricValue>
          <MetricLabel>Online Now</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Users />
          </MetricIcon>
          <MetricValue>{metrics.totalVisitorsToday}</MetricValue>
          <MetricLabel>Today Total</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Smartphone />
          </MetricIcon>
          <MetricValue>{metrics.deviceStats.mobile}</MetricValue>
          <MetricLabel>Mobile Users</MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Monitor />
          </MetricIcon>
          <MetricValue>{metrics.deviceStats.desktop}</MetricValue>
          <MetricLabel>Desktop Users</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <ChartSection>
        <ChartTitle>
          <Globe />
          Geographic Distribution
        </ChartTitle>
        {metrics.geographicDistribution.length > 0 ? (
          metrics.geographicDistribution.map((geo, index) => (
            <DataRow key={index}>
              <DataLabel>
                <span>{geo.country}</span>
                <span>{geo.visitors} visitors ({geo.percentage}%)</span>
              </DataLabel>
              <ProgressBar>
                <ProgressFill $percentage={geo.percentage} $color="#3b82f6" />
              </ProgressBar>
            </DataRow>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#ffd700', opacity: 0.7 }}>
            No geographic data available yet
          </div>
        )}
      </ChartSection>

      <ChartSection>
        <ChartTitle>
          <Smartphone />
          Device Breakdown
        </ChartTitle>
        <DataRow>
          <DataLabel>
            <span>Mobile</span>
            <span>{metrics.deviceStats.mobile} users</span>
          </DataLabel>
          <ProgressBar>
            <ProgressFill 
              $percentage={metrics.totalVisitorsToday > 0 ? Math.round((metrics.deviceStats.mobile / metrics.totalVisitorsToday) * 100) : 0} 
              $color={getDeviceColor('mobile')} 
            />
          </ProgressBar>
        </DataRow>
        <DataRow>
          <DataLabel>
            <span>Desktop</span>
            <span>{metrics.deviceStats.desktop} users</span>
          </DataLabel>
          <ProgressBar>
            <ProgressFill 
              $percentage={metrics.totalVisitorsToday > 0 ? Math.round((metrics.deviceStats.desktop / metrics.totalVisitorsToday) * 100) : 0} 
              $color={getDeviceColor('desktop')} 
            />
          </ProgressBar>
        </DataRow>
        <DataRow>
          <DataLabel>
            <span>Tablet</span>
            <span>{metrics.deviceStats.tablet} users</span>
          </DataLabel>
          <ProgressBar>
            <ProgressFill 
              $percentage={metrics.totalVisitorsToday > 0 ? Math.round((metrics.deviceStats.tablet / metrics.totalVisitorsToday) * 100) : 0} 
              $color={getDeviceColor('tablet')} 
            />
          </ProgressBar>
        </DataRow>
      </ChartSection>

      <ListSection>
        <ChartTitle>
          <TrendingUp />
          Top Pages
        </ChartTitle>
        {metrics.topPages.length > 0 ? (
          metrics.topPages.map((page, index) => (
            <ListItem key={index}>
              <span>{page.path}</span>
              <span>{page.views} views ({page.percentage}%)</span>
            </ListItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#ffd700', opacity: 0.7 }}>
            No page data available yet
          </div>
        )}
      </ListSection>

      <ListSection>
        <ChartTitle>
          <ExternalLink />
          Traffic Sources
        </ChartTitle>
        {metrics.trafficSources.length > 0 ? (
          metrics.trafficSources.map((source, index) => (
            <ListItem key={index}>
              <span>{source.source}</span>
              <span>{source.visitors} visitors ({source.percentage}%)</span>
            </ListItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#ffd700', opacity: 0.7 }}>
            No traffic source data available yet
          </div>
        )}
      </ListSection>
    </PanelContainer>
  );
};

export default VisitorAnalyticsPanel;

