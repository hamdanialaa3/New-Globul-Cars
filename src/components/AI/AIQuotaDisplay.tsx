import { logger } from '../../services/logger-service';
// AI Quota Display Component
// عرض حصة الذكاء الاصطناعي

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { aiQuotaService } from '../../services/ai/ai-quota.service';
import { AI_TIER_CONFIGS } from '../../config/ai-tiers.config';
import { useAuth } from '../../contexts/AuthProvider';

export const AIQuotaDisplay: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await aiQuotaService.getUsageStats(user!.uid);
      setStats(data);
    } catch (error) {
      logger.error('Failed to load AI stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return null;

  const tierConfig = AI_TIER_CONFIGS[stats.tier];
  const isUnlimited = tierConfig.limits.dailyImageAnalysis === -1;

  return (
    <Container>
      <Header>
        <TierBadge tier={stats.tier}>{tierConfig.name.en}</TierBadge>
        <Cost>€{stats.totalCost.toFixed(2)}</Cost>
      </Header>

      <UsageGrid>
        <UsageItem>
          <Label>🖼️ Image Analysis</Label>
          <Progress>
            {isUnlimited ? '∞ Unlimited' : stats.currentUsage.imageAnalysis}
          </Progress>
        </UsageItem>

        <UsageItem>
          <Label>💰 Price Suggestions</Label>
          <Progress>
            {isUnlimited ? '∞ Unlimited' : stats.currentUsage.priceSuggestions}
          </Progress>
        </UsageItem>

        <UsageItem>
          <Label>💬 Chat Messages</Label>
          <Progress>
            {isUnlimited ? '∞ Unlimited' : stats.currentUsage.chatMessages}
          </Progress>
        </UsageItem>

        <UsageItem>
          <Label>📊 Profile Analysis</Label>
          <Progress>
            {isUnlimited ? '∞ Unlimited' : stats.currentUsage.profileAnalysis}
          </Progress>
        </UsageItem>
      </UsageGrid>

      {stats.tier === 'free' && (
        <UpgradePrompt>
          <span>Need more? Upgrade to unlock unlimited AI features</span>
          <UpgradeButton href="/pricing">Upgrade</UpgradeButton>
        </UpgradePrompt>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TierBadge = styled.span<{ tier: string }>`
  background: ${p => p.tier === 'free' ? '#10b981' : 
                     p.tier === 'basic' ? '#3b82f6' :
                     p.tier === 'premium' ? '#f59e0b' : '#8b5cf6'};
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
`;

const Cost = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const UsageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const UsageItem = styled.div`
  background: rgba(255,255,255,0.1);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const Label = styled.div`
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
`;

const Progress = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const UpgradePrompt = styled.div`
  background: rgba(255,255,255,0.15);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const UpgradeButton = styled.a`
  background: white;
  color: #667eea;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;
