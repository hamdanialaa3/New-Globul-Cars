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
import { visitorAnalyticsService, VisitorMetrics } from '../../services/visitor-analytics-service';
import { logger } from '../../services/logger-service';

const PanelContainer = styled.div`
  background: #0f1419;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 32px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #f8fafc;
`;

const SectionTitle = styled.h2`
  color: #ff8c61;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ff8c61;
    transform: translateY(-4px);
    background: #252b3a;
  }
`;

const MetricIcon = styled.div`
  background: #252b3a;
  color: #ff8c61;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 1px solid #2d3748;
`;

const MetricValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #cbd5e1;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartSection = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  color: #ff8c61;
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DataRow = styled.div`
  margin-bottom: 15px;
`;

const DataLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #141a21;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #2d3748;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: ${props => props.$color};
  transition: width 0.5s ease;
`;

const ListSection = styled.div`
  background: #1e2432;
  border: 1px solid #2d3748;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #141a21;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid #ff8c61;
  font-size: 13px;
  color: #cbd5e1;
  transition: all 0.2s ease;

  &:hover {
    background: #1e2432;
    color: #f8fafc;
    transform: translateX(4px);
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

