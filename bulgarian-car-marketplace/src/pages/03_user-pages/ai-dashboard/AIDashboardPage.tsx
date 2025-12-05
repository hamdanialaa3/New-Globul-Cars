// AI Dashboard Page
// لوحة تحكم الذكاء الاصطناعي

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../contexts/AuthProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { aiQuotaService } from '../../../services/ai/ai-quota.service';
import { AI_TIER_CONFIGS } from '../../../config/ai-tiers.config';
import { AIQuotaDisplay, AIPricingModal } from '../../../components/AI';
import { logger } from '../../../services/logger-service';
import imageAnalysisIcon from '../../../assets/icons/ai/image-analysis-ai.svg';
import priceSuggestionsIcon from '../../../assets/icons/ai/price-suggestions-ai.svg';
import chatMessagesIcon from '../../../assets/icons/ai/chat-messages-ai.svg';
import profileAnalysisIcon from '../../../assets/icons/ai/profile-analysis-ai.svg';

export const AIDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const data = await aiQuotaService.getUsageStats(user!.uid);
      setStats(data);
    } catch (error) {
      logger.error('Failed to load AI dashboard', error as Error);
      // Set default stats if error
      setStats({
        tier: 'free',
        totalCost: 0,
        currentUsage: {
          imageAnalysis: '0/10',
          priceSuggestions: '0/5',
          chatMessages: '0/20',
          profileAnalysis: '0/3'
        },
        lastReset: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading AI Dashboard...</LoadingSpinner>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <ErrorMessage>Failed to load AI dashboard</ErrorMessage>
      </Container>
    );
  }

  const tierConfig = AI_TIER_CONFIGS[stats.tier];

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>AI Dashboard</Title>
          <Subtitle>Manage your AI features and usage</Subtitle>
        </HeaderContent>
        <UpgradeButton onClick={() => setShowPricing(true)}>
          Upgrade Plan
        </UpgradeButton>
      </Header>

      <Grid>
        <QuotaSection>
          <AIQuotaDisplay />
        </QuotaSection>

        <FeaturesSection>
          <SectionTitle>Your AI Features</SectionTitle>
          <FeaturesList>
            {tierConfig.features.map((feature, idx) => (
              <FeatureItem key={idx}>
                <CheckIcon>✓</CheckIcon>
                <FeatureText>{feature}</FeatureText>
              </FeatureItem>
            ))}
          </FeaturesList>
        </FeaturesSection>

        <UsageSection>
          <SectionTitle>Daily Usage Limits</SectionTitle>
          <UsageGrid>
            <UsageCard>
              <UsageIcon src={ImageAnalysisAIIcon} alt="Image Analysis" />
              <UsageLabel>Image Analysis</UsageLabel>
              <UsageValue>{stats.currentUsage.imageAnalysis}</UsageValue>
            </UsageCard>
            <UsageCard>
              <UsageIcon src={PriceSuggestionsAIIcon} alt="Price Suggestions" />
              <UsageLabel>Price Suggestions</UsageLabel>
              <UsageValue>{stats.currentUsage.priceSuggestions}</UsageValue>
            </UsageCard>
            <UsageCard>
              <UsageIcon src={ChatMessagesAIIcon} alt="Chat Messages" />
              <UsageLabel>Chat Messages</UsageLabel>
              <UsageValue>{stats.currentUsage.chatMessages}</UsageValue>
            </UsageCard>
            <UsageCard>
              <UsageIcon src={ProfileAnalysisAIIcon} alt="Profile Analysis" />
              <UsageLabel>Profile Analysis</UsageLabel>
              <UsageValue>{stats.currentUsage.profileAnalysis}</UsageValue>
            </UsageCard>
          </UsageGrid>
        </UsageSection>

        <BillingSection>
          <SectionTitle>Billing Information</SectionTitle>
          <BillingCard>
            <BillingRow>
              <BillingLabel>Current Plan</BillingLabel>
              <BillingValue>{tierConfig.name.en}</BillingValue>
            </BillingRow>
            <BillingRow>
              <BillingLabel>Monthly Cost</BillingLabel>
              <BillingValue>€{tierConfig.price.monthly.toFixed(2)}</BillingValue>
            </BillingRow>
            <BillingRow>
              <BillingLabel>Total Spent</BillingLabel>
              <BillingValue highlight>€{stats.totalCost.toFixed(2)}</BillingValue>
            </BillingRow>
            <BillingRow>
              <BillingLabel>Last Reset</BillingLabel>
              <BillingValue>{stats.lastReset}</BillingValue>
            </BillingRow>
          </BillingCard>
        </BillingSection>
      </Grid>

      <AIPricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentTier={stats.tier}
      />
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const QuotaSection = styled.div`
  grid-column: 1 / -1;
`;

const FeaturesSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const UsageSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const BillingSection = styled.div`
  grid-column: 1 / -1;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 20px 0;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CheckIcon = styled.span`
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
`;

const FeatureText = styled.span`
  font-size: 15px;
  color: #4b5563;
`;

const UsageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UsageCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e5e7eb;
`;

const UsageIcon = styled.img`
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
`;

const UsageLabel = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
`;

const UsageValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
`;

const BillingCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
`;

const BillingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const BillingLabel = styled.span`
  font-size: 15px;
  color: #666;
`;

const BillingValue = styled.span<{ highlight?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.highlight ? '#667eea' : '#1a1a1a'};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: #ef4444;
`;

export default AIDashboardPage;
