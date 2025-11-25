// ProfileConversionFunnel Component
// Visual representation of Views → Messages → Sold conversion pipeline
// Professional data visualization with WorkflowAnalyticsService integration
// English/Bulgarian bilingual. No emojis. <250 lines.

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import WorkflowAnalyticsService from '@/services/workflow-analytics-service';
import { logger } from '@/services/logger-service';
import styled from 'styled-components';

interface ConversionData {
  sessions: number;
  published: number;
  conversionRate: number;
}

interface FunnelStage {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export const ProfileConversionFunnel: React.FC<{ ownerProfileId: string }> = ({ ownerProfileId }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConversionData | null>(null);
  const [listingKpis, setListingKpis] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [conversionSummary, kpis] = await Promise.all([
          WorkflowAnalyticsService.getConversionSummary(),
          WorkflowAnalyticsService.getListingKpis(ownerProfileId)
        ]);
        if (mounted) {
          setData(conversionSummary);
          setListingKpis(kpis);
        }
      } catch (e) {
        logger.warn('ConversionFunnel fetch failed', { error: (e as Error).message });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [ownerProfileId]);

  if (loading) {
    return <Container><LoadingText>{t('common.loading')}</LoadingText></Container>;
  }

  if (!data || !listingKpis) {
    return <Container><ErrorText>{t('profileDashboard.error')}</ErrorText></Container>;
  }

  // Build funnel stages
  const stages: FunnelStage[] = [
    {
      label: t('funnel.views'),
      value: listingKpis.views30d,
      percentage: 100,
      color: '#4A90E2'
    },
    {
      label: t('funnel.messages'),
      value: listingKpis.messages30d,
      percentage: listingKpis.views30d > 0 ? (listingKpis.messages30d / listingKpis.views30d) * 100 : 0,
      color: '#7ED321'
    },
    {
      label: t('funnel.published'),
      value: data.published,
      percentage: data.sessions > 0 ? (data.published / data.sessions) * 100 : 0,
      color: '#F5A623'
    }
  ];

  return (
    <Container>
      <Header>
        <Title>{t('funnel.title')}</Title>
        <ConversionBadge rate={listingKpis.conversionRate30d}>
          {listingKpis.conversionRate30d.toFixed(1)}% {t('funnel.conversionRate')}
        </ConversionBadge>
      </Header>

      <FunnelContainer>
        {stages.map((stage, idx) => (
          <Stage key={idx} width={stage.percentage} color={stage.color}>
            <StageLabel>{stage.label}</StageLabel>
            <StageValue>{stage.value.toLocaleString()}</StageValue>
            <StagePercentage>{stage.percentage.toFixed(1)}%</StagePercentage>
          </Stage>
        ))}
      </FunnelContainer>

      <MetricsRow>
        <Metric>
          <MetricLabel>{t('funnel.totalSessions')}</MetricLabel>
          <MetricValue>{data.sessions}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{t('funnel.favorites')}</MetricLabel>
          <MetricValue>{listingKpis.favorites7d}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{t('funnel.workflowConversion')}</MetricLabel>
          <MetricValue>{data.conversionRate.toFixed(1)}%</MetricValue>
        </Metric>
      </MetricsRow>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const ConversionBadge = styled.div<{ rate: number }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${({ rate }) => rate > 5 ? '#d4edda' : rate > 2 ? '#fff3cd' : '#f8d7da'};
  color: ${({ rate }) => rate > 5 ? '#155724' : rate > 2 ? '#856404' : '#721c24'};
  font-weight: 600;
  font-size: 0.875rem;
`;

const FunnelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Stage = styled.div<{ width: number; color: string }>`
  position: relative;
  background: ${({ color }) => color};
  color: white;
  padding: 1rem;
  border-radius: 4px;
  width: ${({ width }) => Math.max(width, 20)}%;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StageLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const StageValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StagePercentage = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
`;

export default ProfileConversionFunnel;
