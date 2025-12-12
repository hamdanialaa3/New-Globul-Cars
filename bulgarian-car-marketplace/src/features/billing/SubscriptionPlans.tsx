// src/features/billing/SubscriptionPlans.tsx
// Subscription Plans Display Component

import React from 'react';
import styled from 'styled-components';
import { Check, Star, Crown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plan, BillingInterval } from './types';
import billingService from './BillingService';

// Props
interface SubscriptionPlansProps {
  currentPlan?: string;
  onSelectPlan: (planId: string, interval: BillingInterval) => void;
}

// Styled Components
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const PlanCard = styled.div<{ popular?: boolean; current?: boolean }>`
  background: ${({ theme }) => theme.colors?.cardBackground || '#ffffff'};
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid ${p => p.current ? '#16a34a' : '#e2e8f0'};
  
  ${p => p.popular && `
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(255, 143, 16, 0.15);
    border: 2px solid #FF8F10;
  `}
  
  &:hover {
    transform: translateY(-8px) ${p => p.popular ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: 0 16px 40px rgba(255, 143, 16, 0.15);
    border-color: ${p => p.current ? '#16a34a' : '#FF8F10'};
  }

  @media (prefers-color-scheme: dark) {
    background: ${({ theme }) => theme.colors?.cardBackgroundDark || '#1e293b'};
    border-color: ${p => p.current ? '#16a34a' : '#334155'};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    
    ${p => p.popular && `
      border-color: #FF8F10;
      box-shadow: 0 12px 32px rgba(255, 143, 16, 0.25);
    `}
    
    &:hover {
      box-shadow: 0 16px 40px rgba(255, 143, 16, 0.2);
    }
  }
`;

const Badge = styled.div<{ type: 'popular' | 'current' }>`
  position: absolute;
  top: -12px;
  right: 24px;
  padding: 0.5rem 1.25rem;
  border-radius: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${p => p.type === 'popular' ? `
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
  ` : `
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
  `}
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PlanName = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors?.text || '#0f172a'};
  margin: 0 0 0.75rem 0;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#f1f5f9'};
  }
`;

const PlanPrice = styled.div`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 1.5rem 0;
  
  .currency {
    font-size: 1.75rem;
    opacity: 0.8;
  }
  
  .period {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors?.textSecondary || '#9ca3af'};
    font-weight: 600;
    -webkit-text-fill-color: currentColor;

    @media (prefers-color-scheme: dark) {
      color: ${({ theme }) => theme.colors?.textSecondaryDark || '#d1d5db'};
    }
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  color: ${({ theme }) => theme.colors?.text || '#475569'};
  font-size: 1rem;
  line-height: 1.5;
  
  svg {
    width: 20px;
    height: 20px;
    color: #16a34a;
    flex-shrink: 0;
    margin-top: 2px;
  }

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#cbd5e1'};
    
    svg {
      color: #22c55e;
    }
  }
`;

const SelectButton = styled.button<{ selected?: boolean }>`
  width: 100%;
  padding: 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  ${p => p.selected ? `
    background: #f1f5f9;
    color: #64748b;
    cursor: default;
    border: 2px solid #cbd5e1;
    
    @media (prefers-color-scheme: dark) {
      background: #334155;
      color: #94a3b8;
      border-color: #475569;
    }
  ` : `
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(255, 143, 16, 0.25);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 143, 16, 0.35);
      background: linear-gradient(135deg, #fb923c 0%, #FF8F10 100%);
    }

    &:active {
      transform: translateY(0);
    }
    
    @media (prefers-color-scheme: dark) {
      box-shadow: 0 4px 16px rgba(255, 143, 16, 0.4);
      
      &:hover {
        box-shadow: 0 8px 24px rgba(255, 143, 16, 0.5);
      }
    }
  `}
`;

/**
 * Subscription Plans Component
 * Displays all available plans with pricing
 */
export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlan,
  onSelectPlan
}) => {
  const { language } = useLanguage();
  const [interval, setInterval] = React.useState<BillingInterval>('monthly');
  
  const plans = billingService.getAvailablePlans();

  return (
    <>
      <Grid>
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id;
          const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
          
          return (
            <PlanCard key={plan.id} popular={plan.popular} current={isCurrent}>
              {plan.popular && (
                <Badge type="popular">
                  <Star fill="white" />
                  {language === 'bg' ? 'Популярен' : 'Popular'}
                </Badge>
              )}
              
              {isCurrent && (
                <Badge type="current">
                  <Check />
                  {language === 'bg' ? 'Текущ план' : 'Current Plan'}
                </Badge>
              )}
              
              <PlanName>
                {language === 'bg' ? plan.name.bg : plan.name.en}
              </PlanName>
              
              <PlanPrice>
                <span className="currency">€</span>
                {price}
                <span className="period">
                  /{language === 'bg' ? 'месец' : 'month'}
                </span>
              </PlanPrice>
              
              <FeaturesList>
                <FeatureItem>
                  <Check />
                  {plan.listingCap === -1 
                    ? (language === 'bg' ? 'Неограничени обяви' : 'Unlimited listings')
                    : `${plan.listingCap} ${language === 'bg' ? 'обяви' : 'listings'}`
                  }
                </FeatureItem>
                
                {plan.features.map(feature => (
                  <FeatureItem key={feature}>
                    <Check />
                    {feature}
                  </FeatureItem>
                ))}
              </FeaturesList>
              
              <SelectButton 
                selected={isCurrent}
                onClick={() => !isCurrent && onSelectPlan(plan.id, interval)}
              >
                {isCurrent 
                  ? (language === 'bg' ? 'Текущ план' : 'Current Plan')
                  : (language === 'bg' ? 'Избери' : 'Select Plan')}
              </SelectButton>
            </PlanCard>
          );
        })}
      </Grid>
    </>
  );
};

export default SubscriptionPlans;

