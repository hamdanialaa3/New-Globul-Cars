/**
 * AI Usage Analytics Dashboard
 * لوحة تحكم إحصائيات استخدام AI
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Zap, TrendingUp, DollarSign, Activity } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';

interface UsageData {
  textGeneration: number;
  priceAnalysis: number;
  totalCost: number;
  monthlyQuota: number;
  quotaUsed: number;
}

const Container = styled.div`
  padding: 24px;
  background: var(--bg-card, #1a1a1a);
  border-radius: 12px;
  border: 1px solid var(--border-primary, #333);
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: var(--bg-primary, #0a0a0a);
  border: 1px solid var(--border-primary, #333);
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--accent-primary, #ff6b35);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 12px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary, #aaa);
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #fff);
`;

const ProgressBar = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-primary, #0a0a0a);
  border-radius: 12px;
  border: 1px solid var(--border-primary, #333);
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary, #aaa);
`;

const ProgressTrack = styled.div`
  height: 8px;
  background: var(--bg-hover, #2a2a2a);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #ff6b35 0%, #f7931e 100%);
  transition: width 0.3s ease;
`;

export const AIUsageAnalytics: React.FC = () => {
  const { language } = useLanguage();
  const [usage] = useState<UsageData>({
    textGeneration: 15,
    priceAnalysis: 5,
    totalCost: 0.12,
    monthlyQuota: 30,
    quotaUsed: 20
  });

  const isBg = language === 'bg';
  const quotaPercentage = (usage.quotaUsed / usage.monthlyQuota) * 100;

  return (
    <Container>
      <Title>
        {isBg ? '📊 AI Използване' : '📊 AI Usage'}
      </Title>

      <Grid>
        <StatCard>
          <StatIcon $color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <Zap size={20} />
          </StatIcon>
          <StatLabel>{isBg ? 'Генерирани текстове' : 'Generated Texts'}</StatLabel>
          <StatValue>{usage.textGeneration}</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon $color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
            <TrendingUp size={20} />
          </StatIcon>
          <StatLabel>{isBg ? 'Анализи на цени' : 'Price Analyses'}</StatLabel>
          <StatValue>{usage.priceAnalysis}</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon $color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
            <DollarSign size={20} />
          </StatIcon>
          <StatLabel>{isBg ? 'Обща цена' : 'Total Cost'}</StatLabel>
          <StatValue>${usage.totalCost}</StatValue>
        </StatCard>

        <StatCard>
          <StatIcon $color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
            <Activity size={20} />
          </StatIcon>
          <StatLabel>{isBg ? 'Използвана квота' : 'Quota Used'}</StatLabel>
          <StatValue>{usage.quotaUsed}/{usage.monthlyQuota}</StatValue>
        </StatCard>
      </Grid>

      <ProgressBar>
        <ProgressLabel>
          <span>{isBg ? 'Месечна квота' : 'Monthly Quota'}</span>
          <span>{quotaPercentage.toFixed(0)}%</span>
        </ProgressLabel>
        <ProgressTrack>
          <ProgressFill $percentage={quotaPercentage} />
        </ProgressTrack>
      </ProgressBar>
    </Container>
  );
};

export default AIUsageAnalytics;
