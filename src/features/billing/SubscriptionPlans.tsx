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
  background: var(--bg-card);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid ${p => p.current ? '#16a34a' : 'var(--border-primary)'};
  
  ${p => p.popular && `
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(139, 92, 246, 0.15);
    border: 2px solid #3B82F6;
  `}
  
  &:hover {
    transform: translateY(-8px) ${p => p.popular ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: 0 16px 40px rgba(139, 92, 246, 0.15);
    border-color: ${p => p.current ? '#16a34a' : '#3B82F6'};
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
    background: linear-gradient(135deg, #3B82F6 0%, #fb923c 100%);
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
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#f1f5f9'};
  }
`;

const PlanDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#64748b'};
  margin-bottom: 1.5rem;
  line-height: 1.5;
  opacity: 0.9;
  min-height: 3rem;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textSecondaryDark || '#94a3b8'};
  }
`;

const PlanPrice = styled.div`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3B82F6 0%, #fb923c 100%);
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
    background: linear-gradient(135deg, #3B82F6 0%, #fb923c 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
      background: linear-gradient(135deg, #fb923c 0%, #3B82F6 100%);
    }

    &:active {
      transform: translateY(0);
    }
    
    @media (prefers-color-scheme: dark) {
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
      
      &:hover {
        box-shadow: 0 8px 24px rgba(139, 92, 246, 0.5);
      }
    }
  `}
`;


const FEATURE_LABELS: Record<string, { bg: string; en: string }> = {
  // Limits
  limit_3_cars: { bg: 'До 3 автомобила месечно', en: 'Up to 3 cars monthly' },
  limit_25_cars: { bg: 'До 25 автомобила месечно', en: 'Up to 25 cars monthly' },
  limit_100_cars: { bg: 'До 100 автомобила месечно', en: 'Up to 100 cars monthly' },

  // Brand Editing
  no_brand_edit: { bg: 'Без редакция на Марка/Модел', en: 'No Brand/Model editing' },
  limit_10_brand_edits: { bg: 'Редакция на Марка/Модел (10/месец)', en: 'Brand/Model editing (10/month)' },
  unlimited_brand_edits: { bg: 'Неограничена редакция на Марка/Модел', en: 'Unlimited Brand/Model editing' },

  // General
  basic_support: { bg: 'Базова поддръжка', en: 'Basic Support' },
  priority_support: { bg: 'Приоритетна поддръжка', en: 'Priority Support' },
  dedicated_manager: { bg: 'Личен акаунт мениджър', en: 'Dedicated Account Manager' },

  // AI & Analytics
  ai_valuation_30: { bg: 'AI Оценка (30/месец)', en: 'AI Valuation (30/month)' },
  ai_unlimited: { bg: 'Неограничен AI', en: 'Unlimited AI' },
  car_valuation: { bg: 'Оценка на автомобили', en: 'Car Valuation' },
  analytics_dashboard: { bg: 'Аналитичен дашборд', en: 'Analytics Dashboard' },

  // Visibility
  search_visibility: { bg: 'Видимост в търсенето', en: 'Search Visibility' },
  featured_badge: { bg: 'Значка "Препоръчан"', en: 'Featured Badge' },
  standard_photos: { bg: 'Стандартни снимки', en: 'Standard Photos' },
  custom_branding: { bg: 'Собствено брандиране', en: 'Custom Branding' },

  // Advanced
  api_access: { bg: 'API Достъп', en: 'API Access' },
  team_management: { bg: 'Управление на екип', en: 'Team Management' }
};

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

  const getFeatureLabel = (key: string) => {
    const label = FEATURE_LABELS[key];
    if (!label) return key.replace(/_/g, ' '); // Fallback to formatted key
    return language === 'bg' ? label.bg : label.en;
  };

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

              <PlanDescription>
                {language === 'bg' ? plan.description.bg : plan.description.en}
              </PlanDescription>

              <PlanPrice>
                <span className="currency">€</span>
                {price}
                <span className="period">
                  /{language === 'bg' ? 'месец' : 'month'}
                </span>
              </PlanPrice>

              <FeaturesList>
                {/* Removed separate listing cap check since it's now a feature key */}
                {plan.features.map(feature => (
                  <FeatureItem key={feature}>
                    <Check />
                    {getFeatureLabel(feature)}
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



