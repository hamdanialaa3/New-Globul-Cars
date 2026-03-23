// src/components/subscription/SubscriptionManager.tsx
// Refactored for "Royal Night" Theme & Glassmorphism

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscriptionTheme } from './subscription-theme';
import { SUBSCRIPTION_PLANS, PlanTier } from '../../config/subscription-plans';
import { activateFreePlan } from '../../services/billing/free-plan-activation.service';
import { toast } from 'react-toastify';
import { Check, Sparkles, Zap, Award, ShieldCheck } from 'lucide-react';

// ==================== ANIMATIONS ====================

const glowPulse = keyframes`
  0% { box-shadow: 0 0 20px rgba(230, 81, 0, 0.2); }
  50% { box-shadow: 0 0 40px rgba(230, 81, 0, 0.5); }
  100% { box-shadow: 0 0 20px rgba(230, 81, 0, 0.2); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

// ==================== STYLED COMPONENTS ====================

const ManagerContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

// Toggle Switch
const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4rem;
  gap: 1rem;
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${p => p.$active ? 'white' : subscriptionTheme.colors.text.secondary};
  transition: color 0.3s;
`;

const ToggleSwitch = styled.button<{ $isAnnual: boolean }>`
  width: 64px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: ${p => p.$isAnnual ? '36px' : '4px'};
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const DiscountBadge = styled.span`
  background: ${subscriptionTheme.gradients.dealer};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.5rem;
`;

// Cards Grid
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1.1fr 1fr; // Middle card slightly wider
    align-items: center; // Center vertically
  }
`;

// Plan Card
const PlanCard = styled.div<{ $tier: PlanTier; $highlight?: boolean }>`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  
  /* LED Strip (Thin glowing border) */
  border: 1px solid ${p => {
    if (p.$tier === 'free') return '#f97316';
    if (p.$tier === 'dealer') return '#22c55e';
    return '#3b82f6';
  }};
  box-shadow: 0 0 15px -5px ${p => {
    if (p.$tier === 'free') return 'rgba(249, 115, 22, 0.5)';
    if (p.$tier === 'dealer') return 'rgba(34, 197, 94, 0.5)';
    return 'rgba(59, 130, 246, 0.5)';
  }};
  
  /* Highlight Styles (Dealer Plan) */
  ${p => p.$highlight && css`
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    transform: scale(1.05);
    z-index: 10;

    @media (max-width: 1024px) {
      transform: none;
      order: -1;
    }
  `}

  &:hover {
    transform: ${p => p.$highlight ? 'scale(1.08)' : 'translateY(-10px)'};
    background: rgba(40, 51, 69, 0.8);
    box-shadow: 0 0 25px -5px ${p => {
    if (p.$tier === 'free') return 'rgba(249, 115, 22, 0.8)';
    if (p.$tier === 'dealer') return 'rgba(34, 197, 94, 0.8)';
    return 'rgba(59, 130, 246, 0.8)';
  }};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: ${subscriptionTheme.gradients.dealer};
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 12px rgba(230, 81, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  svg { width: 14px; height: 14px; fill: white; }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PlanIcon = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const PlanDesc = styled.p`
  color: ${subscriptionTheme.colors.text.secondary};
  font-size: 0.95rem;
  line-height: 1.5;
`;

const PriceTag = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  
  .amount {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    line-height: 1;
    letter-spacing: -0.05em;
  }
  
  .currency {
    font-size: 1.5rem;
    vertical-align: top;
    opacity: 0.6;
    margin-right: 0.2rem;
  }

  .period {
    color: ${subscriptionTheme.colors.text.secondary};
    font-size: 1rem;
    font-weight: 500;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2.5rem;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: ${subscriptionTheme.colors.text.primary};
  font-size: 0.95rem;
  line-height: 1.4;

  svg {
    width: 18px;
    height: 18px;
    color: ${subscriptionTheme.colors.text.accent}; // Purple accent for ticks
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const CTAButton = styled.button<{ $tier: PlanTier }>`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  position: relative;
  overflow: hidden;
  color: white;

  /* Tier-specific styling */
  ${p => {
    switch (p.$tier) {
      case 'free':
        return css`
          background: #f97316;
          box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
          &:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.6); }
        `;
      case 'dealer':
        return css`
          background: #22c55e;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
          &:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6); }
        `;
      case 'company':
        return css`
          background: #3b82f6;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          &:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6); }
        `;
      default:
        return css`
          background: rgba(255, 255, 255, 0.1);
          &:hover { background: rgba(255, 255, 255, 0.15); }
        `;
    }
  }}
`;

// ==================== COMPONENT LOGIC ====================

const SubscriptionManager: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currentUser, userProfile } = useAuth();
  const isBg = language === 'bg';
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscribe = async (planId: PlanTier) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    if (planId === 'free') {
      try {
        const result = await activateFreePlan({
          userId: currentUser.uid,
          userEmail: currentUser.email || '',
          userName: userProfile?.displayName || currentUser.displayName || 'Unknown',
          planTier: 'free',
        });
        if (result.success) {
          toast.success(isBg ? 'Безплатният план е активиран!' : 'Free plan activated!');
          navigate('/profile');
        } else {
          toast.error(isBg ? 'Грешка при активиране.' : 'Activation failed.');
        }
      } catch (error) {
        toast.error('Unexpected error.');
      }
    } else {
      // Paid Plan -> Checkout
      // Using manual checkout for now as per previous implementation logic
      navigate(`/billing/manual-checkout?plan=${planId}&interval=${interval}&type=subscription`);
    }
  };

  const getPrice = (tier: PlanTier) => {
    const plan = SUBSCRIPTION_PLANS[tier];
    if (interval === 'monthly') return plan.price.monthly;
    // Annual price is usually total per year, divide by 12 for "per month" display or show full.
    // Let's show "per month" equivalent for annual to make it look cheaper.
    return Math.round(plan.price.annual / 12);
  };

  return (
    <ManagerContainer>
      {/* Interval Toggle */}
      <ToggleContainer>
        <ToggleLabel $active={interval === 'monthly'}>
          {isBg ? 'Месечно' : 'Monthly'}
        </ToggleLabel>

        <ToggleSwitch
          $isAnnual={interval === 'annual'}
          onClick={() => setInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
        />

        <ToggleLabel $active={interval === 'annual'}>
          {isBg ? 'Годишно' : 'Yearly'}
        </ToggleLabel>

        {interval === 'annual' && (
          <DiscountBadge>-20%</DiscountBadge>
        )}
      </ToggleContainer>

      {/* Cards */}
      <CardsGrid>
        {/* FREE PLAN */}
        <PlanCard $tier="free">
          <CardHeader>
            <PlanIcon><Zap /></PlanIcon>
            <PlanName>{isBg ? 'Безплатен' : 'Starter'}</PlanName>
            <PlanDesc>{isBg ? 'За частни лица' : 'For private sellers'}</PlanDesc>
          </CardHeader>
          <PriceTag>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', color: '#ef4444', textDecoration: 'line-through', marginBottom: '-5px', fontWeight: 'bold' }}>€9.99</span>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span className="currency">€</span>
                <span className="amount">0</span>
              </div>
            </div>
            <span className="period">{isBg ? '/винаги' : '/forever'}</span>
          </PriceTag>
          <FeaturesList>
            <FeatureItem><Check /> {isBg ? '3 безплатни обяви' : '3 Free Listings'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? '10 снимки на кола' : '10 Photos per Car'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'Базова поддръжка' : 'Basic Support'}</FeatureItem>
          </FeaturesList>
          <CTAButton $tier="free" onClick={() => handleSubscribe('free')}>
            {isBg ? 'Старт Безплатно' : 'Start for Free'}
          </CTAButton>
        </PlanCard>

        {/* DEALER PLAN (Popular) */}
        <PlanCard $tier="dealer" $highlight>
          <PopularBadge>
            <Sparkles size={14} fill="white" /> {isBg ? 'Най-популярен' : 'Most Popular'}
          </PopularBadge>
          <CardHeader>
            <PlanIcon style={{ background: subscriptionTheme.gradients.dealer }}>
              <Award />
            </PlanIcon>
            <PlanName>{isBg ? 'Дилър' : 'Pro Dealer'}</PlanName>
            <PlanDesc>{isBg ? 'За автокъщи' : 'For growing dealerships'}</PlanDesc>
          </CardHeader>
          <PriceTag>
            <span className="currency">€</span>
            <span className="amount">{getPrice('dealer')}</span>
            <span className="period">{isBg ? '/месец' : '/month'}</span>
          </PriceTag>
          <FeaturesList>
            <FeatureItem><Check /> {isBg ? '100 обяви' : '100 Listings'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'VIP значка' : 'VIP Badge'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'AI Анализи' : 'AI Analytics'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'Приоритетна поддръжка' : 'Priority Support'}</FeatureItem>
          </FeaturesList>
          <CTAButton $tier="dealer" onClick={() => handleSubscribe('dealer')}>
            {isBg ? 'Избери Дилър' : 'Get Started'}
          </CTAButton>
        </PlanCard>

        {/* COMPANY PLAN */}
        <PlanCard $tier="company">
          <CardHeader>
            <PlanIcon><ShieldCheck /></PlanIcon>
            <PlanName>{isBg ? 'Компания' : 'Enterprise'}</PlanName>
            <PlanDesc>{isBg ? 'За големи фирми' : 'For large organizations'}</PlanDesc>
          </CardHeader>
          <PriceTag>
            <span className="currency">€</span>
            <span className="amount">{getPrice('company')}</span>
            <span className="period">{isBg ? '/месец' : '/month'}</span>
          </PriceTag>
          <FeaturesList>
            <FeatureItem><Check /> {isBg ? 'Неограничени обяви' : 'Unlimited Listings'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'API Достъп' : 'API Access'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'Личен акаунт мениджър' : 'Dedicated Manager'}</FeatureItem>
            <FeatureItem><Check /> {isBg ? 'Всички екстри' : 'All Features Included'}</FeatureItem>
          </FeaturesList>
          <CTAButton $tier="company" onClick={() => handleSubscribe('company')}>
            {isBg ? 'Свържете се с нас' : 'Contact Sales'}
          </CTAButton>
        </PlanCard>
      </CardsGrid>
    </ManagerContainer>
  );
};

export default SubscriptionManager;
