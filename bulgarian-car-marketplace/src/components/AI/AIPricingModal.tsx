// AI Pricing Modal - Upgrade Plans
// نافذة أسعار الذكاء الاصطناعي

import React from 'react';
import styled from 'styled-components';
import { AI_TIER_CONFIGS } from '@/config/ai-tiers.config';
import { aiQuotaService } from '@/services/ai/ai-quota.service';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/components/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

export const AIPricingModal: React.FC<Props> = ({ isOpen, onClose, currentTier = 'free' }) => {
  const { user } = useAuth();
  const toast = useToast();

  if (!isOpen) return null;

  const handleUpgrade = async (tier: string) => {
    if (!user?.uid) {
      toast.error('Please login first');
      return;
    }

    try {
      await aiQuotaService.upgradeTier(user.uid, tier as any);
      toast.success(`Upgraded to ${tier} plan!`);
      onClose();
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        
        <Title>Choose Your AI Plan</Title>
        <Subtitle>Unlock powerful AI features for your car marketplace</Subtitle>

        <PlansGrid>
          {Object.values(AI_TIER_CONFIGS).map(config => (
            <PlanCard 
              key={config.tier} 
              isActive={currentTier === config.tier}
              isPremium={config.tier === 'premium'}
            >
              <PlanHeader>
                <PlanName>{config.name.en}</PlanName>
                <PlanPrice>
                  {config.price.monthly === 0 ? (
                    <span>Free</span>
                  ) : (
                    <>
                      <Currency>€</Currency>
                      <Amount>{config.price.monthly}</Amount>
                      <Period>/month</Period>
                    </>
                  )}
                </PlanPrice>
              </PlanHeader>

              <FeaturesList>
                <Feature>
                  <Icon>🖼️</Icon>
                  <Text>
                    {config.limits.dailyImageAnalysis === -1 
                      ? 'Unlimited' 
                      : config.limits.dailyImageAnalysis} image analysis/day
                  </Text>
                </Feature>
                <Feature>
                  <Icon>💰</Icon>
                  <Text>
                    {config.limits.dailyPriceSuggestions === -1 
                      ? 'Unlimited' 
                      : config.limits.dailyPriceSuggestions} price suggestions/day
                  </Text>
                </Feature>
                <Feature>
                  <Icon>💬</Icon>
                  <Text>
                    {config.limits.dailyChatMessages === -1 
                      ? 'Unlimited' 
                      : config.limits.dailyChatMessages} chat messages/day
                  </Text>
                </Feature>
                <Feature>
                  <Icon>📊</Icon>
                  <Text>
                    {config.limits.dailyProfileAnalysis === -1 
                      ? 'Unlimited' 
                      : config.limits.dailyProfileAnalysis} profile analysis/day
                  </Text>
                </Feature>
              </FeaturesList>

              {config.tier !== 'free' && (
                <PayAsYouGo>
                  Or pay €{config.price.perUse.toFixed(3)} per request
                </PayAsYouGo>
              )}

              <ActionButton
                disabled={currentTier === config.tier}
                onClick={() => handleUpgrade(config.tier)}
                isPremium={config.tier === 'premium'}
              >
                {currentTier === config.tier ? 'Current Plan' : 
                 config.tier === 'free' ? 'Downgrade' : 'Upgrade'}
              </ActionButton>
            </PlanCard>
          ))}
        </PlansGrid>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 40px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #000;
  }
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  color: #1a1a1a;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 16px;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

const PlanCard = styled.div<{ isActive: boolean; isPremium: boolean }>`
  border: 2px solid ${p => p.isActive ? '#667eea' : p.isPremium ? '#f59e0b' : '#e5e7eb'};
  border-radius: 12px;
  padding: 24px;
  background: ${p => p.isPremium ? 'linear-gradient(135deg, #fff5e6 0%, #ffe4cc 100%)' : 'white'};
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
`;

const PlanHeader = styled.div`
  margin-bottom: 24px;
`;

const PlanName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a1a;
`;

const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const Currency = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: #667eea;
`;

const Amount = styled.span`
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
`;

const Period = styled.span`
  font-size: 14px;
  color: #666;
`;

const FeaturesList = styled.div`
  margin-bottom: 20px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const Icon = styled.span`
  font-size: 18px;
`;

const Text = styled.span`
  font-size: 14px;
  color: #4b5563;
`;

const PayAsYouGo = styled.div`
  background: rgba(102, 126, 234, 0.1);
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
  color: #667eea;
  margin-bottom: 20px;
  font-weight: 500;
`;

const ActionButton = styled.button<{ isPremium?: boolean }>`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.isPremium ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#667eea'};
  color: white;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;
