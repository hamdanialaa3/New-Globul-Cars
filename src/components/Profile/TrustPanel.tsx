// TrustPanel - Trust score display with verification status and review metrics
// Shows seller credibility signals at a glance

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfileTheme } from './ProfileShell';
import ProfileBadges from './ProfileBadges';
import type { TrustPanelProps } from '@/types/profile.types';

/**
 * Trust score levels and visual representations
 */
const TRUST_LEVELS = {
  CRITICAL: { min: 0, max: 19, label: 'Critical', labelBg: 'Критично', color: '#E74C3C' },
  LOW: { min: 20, max: 39, label: 'Low', labelBg: 'Ниско', color: '#E67E22' },
  MEDIUM: { min: 40, max: 59, label: 'Medium', labelBg: 'Средно', color: '#F39C12' },
  HIGH: { min: 60, max: 79, label: 'High', labelBg: 'Високо', color: '#27AE60' },
  EXCELLENT: { min: 80, max: 100, label: 'Excellent', labelBg: 'Отлично', color: '#16A085' },
};

/**
 * Get trust level by score
 */
const getTrustLevel = (score: number) => {
  if (score < 20) return TRUST_LEVELS.CRITICAL;
  if (score < 40) return TRUST_LEVELS.LOW;
  if (score < 60) return TRUST_LEVELS.MEDIUM;
  if (score < 80) return TRUST_LEVELS.HIGH;
  return TRUST_LEVELS.EXCELLENT;
};

/**
 * Container for entire trust panel
 */
const PanelContainer = styled.section`
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

/**
 * Title section
 */
const PanelTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
`;

/**
 * Trust icon
 */
const TrustIcon = styled.span`
  font-size: 1.5rem;
`;

/**
 * Main trust score display
 */
const ScoreSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

/**
 * Score circle visual
 */
const ScoreCircle = styled.div<{ score: number; color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${(props) => props.color}20 0%, ${(props) => props.color}08 100%);
  border: 3px solid ${(props) => props.color};
  margin: 0 auto;
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    border-width: 2px;
  }
`;

/**
 * Score number
 */
const ScoreNumber = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

/**
 * Score label (out of 100)
 */
const ScoreLabel = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Score info section (text explanation)
 */
const ScoreInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

/**
 * Score level badge
 */
const LevelBadge = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(props) => props.color}20;
  border: 1px solid ${(props) => props.color}40;
  border-radius: 8px;
  width: fit-content;

  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) => props.color};
  }
`;

/**
 * Score level text
 */
const LevelText = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textPrimary};
`;

/**
 * Score description
 */
const ScoreDescription = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0;
`;

/**
 * Metrics grid
 */
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

/**
 * Individual metric card
 */
const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

/**
 * Metric value
 */
const MetricValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.accent};
  margin-bottom: 0.25rem;
`;

/**
 * Metric label
 */
const MetricLabel = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Badges section
 */
const BadgesSection = styled.div`
  border-top: 1px solid ${(props) => props.theme.colors.borderLight};
  padding-top: 1.5rem;
`;

/**
 * Badges section title
 */
const BadgesSectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
`;

/**
 * TrustPanel Component
 * Displays trust metrics in an engaging card format
 * 
 * Features:
 * - Trust score with visual indicator
 * - Metric cards (reviews, response time, etc.)
 * - Badge integration
 * - Responsive design
 * - i18n support
 */
const TrustPanel: React.FC<TrustPanelProps> = ({
  profile,
  expandedBadges,
  onBadgeClick,
  showFullMetrics = true,
}) => {
  const { language } = useLanguage();
  const { accentColor } = useProfileTheme();

  const stats = useMemo(() => profile?.stats || {
    totalListings: 0,
    avgResponseTime: 0,
    responseRate: 0,
    trustScore: 0,
    totalReviews: 0,
    averageRating: 0,
  }, [profile?.stats]);

  const trustLevel = useMemo(() => getTrustLevel(stats.trustScore || 0), [stats.trustScore]);

  const trustDescriptions = useMemo(() => ({
    bg: {
      CRITICAL: 'Нов профил. Проверете репутацията внимателно.',
      LOW: 'Ограничена история. Препоръчва се внимание.',
      MEDIUM: 'Средна репутация. Нормално交易',
      HIGH: 'Добра репутация. Препоръчано.',
      EXCELLENT: 'Отличен рейтинг. Високо препоръчано!',
    },
    en: {
      CRITICAL: 'New profile. Review reputation carefully.',
      LOW: 'Limited history. Caution recommended.',
      MEDIUM: 'Average reputation. Normal trading.',
      HIGH: 'Good reputation. Recommended.',
      EXCELLENT: 'Excellent rating. Highly recommended!',
    },
  }), []);

  const trustDescriptionKey = Object.keys(TRUST_LEVELS).find(
    (key) => TRUST_LEVELS[key as keyof typeof TRUST_LEVELS].color === trustLevel.color
  ) as keyof typeof TRUST_LEVELS || 'MEDIUM';

  const formatResponseTime = (minutes: number | undefined): string => {
    if (!minutes || minutes === 0) return language === 'bg' ? 'Неизвестно' : 'Unknown';
    if (minutes < 60) return language === 'bg' ? `${minutes} мин` : `${minutes} min`;
    const hours = Math.round(minutes / 60);
    return language === 'bg' ? `${hours} ч` : `${hours}h`;
  };

  return (
    <PanelContainer>
      <PanelTitle>
        <TrustIcon>🛡️</TrustIcon>
        {language === 'bg' ? 'Сигурност и репутация' : 'Trust & Reputation'}
      </PanelTitle>

      <ScoreSection>
        <ScoreCircle score={stats.trustScore || 0} color={trustLevel.color}>
          <ScoreNumber>{stats.trustScore || 0}</ScoreNumber>
          <ScoreLabel>{language === 'bg' ? 'от 100' : 'of 100'}</ScoreLabel>
        </ScoreCircle>

        <ScoreInfo>
          <LevelBadge color={trustLevel.color}>
            <LevelText>
              {language === 'bg' ? trustLevel.labelBg : trustLevel.label}
            </LevelText>
          </LevelBadge>
          <ScoreDescription>
            {language === 'bg'
              ? trustDescriptions.bg[trustDescriptionKey as keyof typeof TRUST_LEVELS]
              : trustDescriptions.en[trustDescriptionKey as keyof typeof TRUST_LEVELS]}
          </ScoreDescription>
        </ScoreInfo>
      </ScoreSection>

      {showFullMetrics && (
        <MetricsGrid>
          <MetricCard>
            <MetricValue>{stats.totalListings || 0}</MetricValue>
            <MetricLabel>{language === 'bg' ? 'Обяви' : 'Listings'}</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{stats.totalReviews || 0}</MetricValue>
            <MetricLabel>{language === 'bg' ? 'Отзиви' : 'Reviews'}</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>
              {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
            </MetricValue>
            <MetricLabel>{language === 'bg' ? 'Рейтинг' : 'Rating'}</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{stats.responseRate || 0}%</MetricValue>
            <MetricLabel>{language === 'bg' ? 'Отговор' : 'Response'}</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{formatResponseTime(stats.avgResponseTime)}</MetricValue>
            <MetricLabel>{language === 'bg' ? 'Время отговор' : 'Response Time'}</MetricLabel>
          </MetricCard>
        </MetricsGrid>
      )}

      {profile?.badges && profile.badges.length > 0 && (
        <BadgesSection>
          <BadgesSectionTitle>
            {language === 'bg' ? 'Потвърждения' : 'Verifications'}
          </BadgesSectionTitle>
          <ProfileBadges
            badges={profile.badges}
            compact={!expandedBadges}
            maxDisplay={4}
            onBadgeClick={onBadgeClick}
            isHorizontal={true}
          />
        </BadgesSection>
      )}
    </PanelContainer>
  );
};

TrustPanel.displayName = 'TrustPanel';

export default TrustPanel;
