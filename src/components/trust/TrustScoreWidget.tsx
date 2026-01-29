// src/components/trust/TrustScoreWidget.tsx
// Trust Score Widget - مكون عرض درجة الثقة الشاملة
// النظام: Bulgarian Trust Matrix
// الموقع: بلغاريا | اللغات: BG/EN

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { BulgarianTrustService } from '../../services/trust/bulgarian-trust-service';
import { TrustSystem, TrustLevel } from '../../types/trust.types';
import { Shield, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import styled from 'styled-components';

// ==================== STYLED COMPONENTS ====================

const WidgetContainer = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScoreSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ScoreDisplay = styled.div<{ $score: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ScoreValue = styled.div<{ $score: number }>`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    ${props => {
      if (props.$score >= 80) return '#10b981, #059669';
      if (props.$score >= 50) return '#f59e0b, #d97706';
      return '#ef4444, #dc2626';
    }}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const LevelBadge = styled.div<{ $level: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    if (props.$level === 'premium') return 'linear-gradient(135deg, #10b981, #059669)';
    if (props.$level === 'verified') return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    return 'linear-gradient(135deg, #6b7280, #4b5563)';
  }};
  color: white;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'};
  border-radius: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const MetricIcon = styled.div`
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  align-items: center;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const BadgesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(59, 130, 246, 0.2)'};
  border-radius: 8px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.primary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.error};
`;

// ==================== COMPONENT ====================

interface TrustScoreWidgetProps {
  userId: string;
  compact?: boolean;
}

const TrustScoreWidget: React.FC<TrustScoreWidgetProps> = ({ userId, compact = false }) => {
  const { language } = useLanguage();
  const [trustSystem, setTrustSystem] = useState<TrustSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trustService = BulgarianTrustService.getInstance();

  useEffect(() => {
    const loadTrustSystem = async () => {
      try {
        setLoading(true);
        setError(null);
        const system = await trustService.getTrustSystem(userId);
        setTrustSystem(system);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trust system');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadTrustSystem();
    }
  }, [userId]);

  if (loading) {
    return (
      <WidgetContainer>
        <LoadingState>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingState>
      </WidgetContainer>
    );
  }

  if (error) {
    return (
      <WidgetContainer>
        <ErrorState>
          <AlertCircle size={24} />
          <p>{error}</p>
        </ErrorState>
      </WidgetContainer>
    );
  }

  if (!trustSystem) {
    return null;
  }

  const { sellerScore, verificationLevel, badges, reviews, responseMetrics } = trustSystem;

  const getLevelName = (level: string): string => {
    const names = {
      premium: { bg: 'Премиум', en: 'Premium' },
      verified: { bg: 'Потвърден', en: 'Verified' },
      basic: { bg: 'Основен', en: 'Basic' }
    };
    return names[level as keyof typeof names]?.[language] || level;
  };

  const formatResponseTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} ${language === 'bg' ? 'мин' : 'min'}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} ${language === 'bg' ? 'ч' : 'hr'}`;
  };

  return (
    <WidgetContainer>
      <Header>
        <Title>
          <Shield size={20} />
          {language === 'bg' ? 'Ниво на Доверие' : 'Trust Level'}
        </Title>
        <LevelBadge $level={verificationLevel}>
          {getLevelName(verificationLevel)}
        </LevelBadge>
      </Header>

      <ScoreSection>
        <ScoreDisplay $score={sellerScore}>
          <ScoreValue $score={sellerScore}>{sellerScore}</ScoreValue>
          <ScoreLabel>
            {language === 'bg' ? 'Доверие' : 'Trust Score'} / 100
          </ScoreLabel>
        </ScoreDisplay>
      </ScoreSection>

      {!compact && (
        <>
          <MetricsGrid>
            <MetricCard>
              <MetricHeader>
                <MetricIcon>
                  <MessageSquare size={16} />
                </MetricIcon>
                <MetricLabel>
                  {language === 'bg' ? 'Отзиви' : 'Reviews'}
                </MetricLabel>
              </MetricHeader>
              <MetricValue>
                {reviews.count}
                {reviews.count > 0 && (
                  <span style={{ fontSize: '0.875rem', marginLeft: '4px', opacity: 0.7 }}>
                    ({reviews.average.toFixed(1)}★)
                  </span>
                )}
              </MetricValue>
            </MetricCard>

            <MetricCard>
              <MetricHeader>
                <MetricIcon>
                  <Clock size={16} />
                </MetricIcon>
                <MetricLabel>
                  {language === 'bg' ? 'Време за отговор' : 'Response Time'}
                </MetricLabel>
              </MetricHeader>
              <MetricValue>
                {responseMetrics.avgResponseTime > 0
                  ? formatResponseTime(responseMetrics.avgResponseTime)
                  : language === 'bg' ? 'N/A' : 'N/A'}
              </MetricValue>
            </MetricCard>

            <MetricCard>
              <MetricHeader>
                <MetricIcon>
                  <CheckCircle size={16} />
                </MetricIcon>
                <MetricLabel>
                  {language === 'bg' ? 'Процент отговори' : 'Response Rate'}
                </MetricLabel>
              </MetricHeader>
              <MetricValue>
                {Math.round(responseMetrics.responseRate)}%
              </MetricValue>
            </MetricCard>
          </MetricsGrid>

          {badges.length > 0 && (
            <BadgesList>
              {badges
                .sort((a, b) => (a.priority || 99) - (b.priority || 99))
                .map((badge, index) => (
                  <Badge key={index}>
                    <CheckCircle size={14} />
                    <span>{language === 'bg' ? badge.nameBg : badge.nameEn}</span>
                  </Badge>
                ))}
            </BadgesList>
          )}
        </>
      )}
    </WidgetContainer>
  );
};

export default TrustScoreWidget;

