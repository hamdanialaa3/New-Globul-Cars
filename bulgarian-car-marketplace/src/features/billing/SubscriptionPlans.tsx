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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const PlanCard = styled.div<{ popular?: boolean; current?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
  border: 3px solid ${p => p.current ? '#16a34a' : 'transparent'};
  
  ${p => p.popular && `
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const Badge = styled.div<{ type: 'popular' | 'current' }>`
  position: absolute;
  top: -12px;
  right: 20px;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${p => p.type === 'popular' ? `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
  ` : `
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
  `}
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1d4ed8;
  margin: 1rem 0;
  
  .currency {
    font-size: 1.5rem;
    color: #6c757d;
  }
  
  .period {
    font-size: 1rem;
    color: #9ca3af;
    font-weight: normal;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #4b5563;
  font-size: 0.9rem;
  
  svg {
    width: 18px;
    height: 18px;
    color: #16a34a;
    flex-shrink: 0;
  }
`;

const SelectButton = styled.button<{ selected?: boolean }>`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${p => p.selected ? `
    background: #e5e7eb;
    color: #6c757d;
    cursor: default;
  ` : `
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
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

