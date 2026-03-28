// src/pages/home/HomePage/SubscriptionBanner.tsx
// Subscription Banner for HomePage - Promote Plans
// ✅ Card design copied from /subscription page

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { Crown, TrendingUp, Building2, ChevronRight, Zap, CheckCircle, Sparkles, Car, MessageSquare, Upload, BarChart3, Plug, Link2, Target, Headphones, UserCog, Palette, Award, Gem, Rocket, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/contexts/ThemeContext';
// ✅ CRITICAL: Import subscription plans for accurate pricing
import { SUBSCRIPTION_PLANS } from '../../../../config/subscription-plans';
// ✅ Import centralized settings file
import subscriptionTheme from '@/components/subscription/subscription-theme';
// ✅ FREE OFFER: Import promotional offer hook
import { usePromotionalOffer } from '@/hooks/usePromotionalOffer';

// SVG icon removal - replaced with Lucide icons for professional look

// ==================== ANIMATIONS ====================
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const rotateIn = keyframes`
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
`;

const Banner = styled.section`
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    margin: 20px auto;
  }
`;

const Container = styled.div<{ $isDark: boolean }>`
  background: ${p => p.$isDark
    ? 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.9) 50%, rgba(15,23,42,0.88) 100%)'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%)'};
  border-radius: 24px;
  padding: 30px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: ${p => p.$isDark ? '0 20px 60px rgba(0,0,0,0.35)' : '0 20px 60px rgba(139, 92, 246, 0.3)'};

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 16px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 3rem;
  font-weight: 800;
  color: ${p => p.$isDark ? '#f8fbff' : 'white'};
  margin: 0 0 16px 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.25rem;
  color: ${p => p.$isDark ? 'rgba(229, 236, 246, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  margin: 0 auto;
  max-width: 700px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div<{ $highlight?: boolean; $isDark: boolean; $free?: boolean; $planId?: string }>`
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.75rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: ${p => p.$highlight ? '3px solid var(--accent-primary)' : '2px solid var(--border-primary)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out;
  transform-origin: center;
  overflow: hidden;
  color: var(--text-primary);
  cursor: pointer;

  /* Light border outline effect - thin light thread using box-shadow */
  box-shadow: ${p => {
    const baseShadow = p.$highlight
      ? `0 20px 60px ${() => subscriptionTheme.shadows.small}`
      : 'var(--shadow-lg)';
    const lightBorder = p.$highlight
      ? 'inset 0 0 0 1px rgba(139, 92, 246, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.4)'
      : 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)';
    return `${baseShadow}, ${lightBorder}`;
  }};

  /* Background images based on plan type */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: ${p => {
    if (p.$planId === 'free' || p.$planId === 'private') {
      return 'url(/assets/images/seller-cards/private.png)';
    } else if (p.$planId === 'dealer') {
      return 'url(/assets/images/seller-cards/dealer.png)';
    } else if (p.$planId === 'company') {
      return 'url(/assets/images/seller-cards/company.png)';
    }
    return 'none';
  }};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
    border-radius: 16px;
  }

  /* Shimmer effect for popular plan */
  ${p => p.$highlight && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: var(--btn-primary-bg);
      animation: ${shimmer} 3s infinite;
      z-index: 2;
      pointer-events: none;
      border-radius: 16px;
    }
  `}

  /* Content should be above background */
  > * {
    position: relative;
    z-index: 1;
  }

  ${p => p.$highlight && `
    transform: scale(1.05);
    z-index: 10;
  `}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: ${p => p.$highlight ? 'scale(1.08)' : 'scale(1.03)'};
      box-shadow: ${p => {
    const baseShadow = p.$highlight
      ? `0 25px 70px ${() => subscriptionTheme.shadows.small}`
      : 'var(--shadow-xl)';
    const lightBorder = p.$highlight
      ? 'inset 0 0 0 1px rgba(139, 92, 246, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.4)'
      : 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)';
    return `${baseShadow}, ${lightBorder}`;
  }};
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    transform: none !important;

    &:hover {
      transform: translateY(-4px) !important;
    }
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 20px;
  right: -35px;
  background: var(--btn-primary-bg);
  color: white;
  padding: 0.5rem 3rem;
  font-weight: 700;
  font-size: 0.85rem;
  transform: rotate(45deg);
  box-shadow: 0 4px 15px ${() => subscriptionTheme.shadows.medium};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PopularityIndicator = styled.div`
  display: none; /* Removed as per request for cleaner professional look */
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 
    0 8px 25px ${() => subscriptionTheme.shadows.small},
    0 0 20px rgba(139, 92, 246, 0.3);
  animation: ${rotateIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5)) blur(0.5px);
    opacity: 0.95;
  }

  &:hover {
    animation: ${float} 2s ease-in-out infinite;
    box-shadow: 
      0 12px 35px ${() => subscriptionTheme.shadows.medium},
      0 0 30px rgba(139, 92, 246, 0.5);
    transform: scale(1.05);
    
    svg {
      filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.7)) blur(0.3px);
      opacity: 1;
    }
  }
`;

const PlanName = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.5rem;
`;

// ─── FREE OFFER: Red strikethrough + badge ───

const FreeOfferBanner = styled.div`
  background: var(--btn-primary-bg);
  color: #fff;
  padding: 0.5rem 1.25rem;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
`;

const PriceStrikeWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const StrikethroughPrice = styled.div`
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 0.15rem;
  opacity: 0.6;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -6px;
    right: -6px;
    height: 4px;
    background: #dc2626;
    transform: rotate(-8deg);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(220, 38, 38, 0.6);
  }
`;

const FreeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--btn-primary-bg);
  color: #fff;
  padding: 0.4rem 1.25rem;
  border-radius: 20px;
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4);
  animation: ${float} 3s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.35rem 1rem;
  }
`;

const Price = styled.div<{ $free?: boolean }>`
  text-align: center;
  margin: 1.5rem 0;
  
  .amount {
    font-size: ${p => p.$free ? '2rem' : '2.75rem'};
    font-weight: 700;
    width: 100%;
    height: 100%;
    background: ${p => p.$free
    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
    : `linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%) 0%, var(--accent-secondary) 100%)`
  };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-color: transparent;
    border: none;
    border-image: none;
    border-color: transparent;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.15rem;
    color: transparent;
    line-height: 1;
  }
  
  .currency {
    font-size: 0.9rem;
    opacity: 0.7;
    font-weight: 600;
    align-self: flex-start;
    margin-top: 0.3rem;
  }

  .euro-amount {
    font-size: 1.5rem;
    font-weight: 600;
    background: ${p => p.$free
    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
    : `linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%) 0%, var(--accent-secondary) 100%)`
  };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cents-amount {
    font-size: 3.8rem;
    font-weight: 900;
    background: ${p => p.$free
    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
    : `linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%)`
  };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    animation: ${pulse} 3s ease-in-out infinite;
    letter-spacing: -2px;
  }
  
  .period {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
    display: block;
    margin-top: 0.5rem;
  }
`;

const FeaturesList = styled.ul<{ $free?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  min-height: 200px;
  ${p => p.$free && `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  `}
`;

const LastDigitSpan = styled.span`
  font-size: 4.5rem;
  font-weight: 900;
  background: var(--btn-primary-bg);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  animation: ${pulse} 2s ease-in-out infinite;
`;

const FeatureItem = styled.li<{ $highlight?: boolean; $free?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
  transition: all 0.3s ease;
  
  ${p => p.$free && `
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
  
  svg {
    width: 18px;
    height: 18px;
    color: ${p => p.$highlight ? 'var(--accent-primary)' : 'var(--accent-secondary)'};
    flex-shrink: 0;
    margin-top: 1px;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4)) blur(0.5px);
    opacity: 0.85;
  }

  &:hover svg {
    filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.6)) blur(0.3px);
    opacity: 1;
    transform: scale(1.1);
  }
`;

const CTAButton = styled.button<{ $variant: 'primary' | 'secondary' | 'premium'; $isDark: boolean }>`
  width: 100%;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;

  ${p => {
    switch (p.$variant) {
      case 'premium':
        return `
          background: var(--btn-primary-bg);
          color: white;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);

          &:hover {
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.5);
            transform: translateY(-2px);
          }
        `;
      case 'primary':
        return `
          background: var(--btn-primary-bg);
          color: white;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);

          &:hover {
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: ${p.$isDark ? 'rgba(255,255,255,0.06)' : 'white'};
          color: ${p.$isDark ? '#f8fbff' : 'var(--accent-primary)'};
          border: 2px solid ${p.$isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(139, 92, 246, 0.3)'};

          &:hover {
            background: ${p.$isDark ? 'rgba(255,255,255,0.12)' : '#f8fafc'};
            border-color: ${p.$isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'};
            transform: translateY(-2px);
          }
        `;
    }
  }}

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SubscriptionBanner: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { isFreeOffer, config: promoConfig } = usePromotionalOffer();

  const isBg = language === 'bg';

  const plans = [
    {
      id: 'private',
      icon: User, // Changed from Crown to User for "Private/Individual"
      iconColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%)',
      name: isBg ? 'Личен' : 'Private',
      price: isBg ? 'Безплатно' : 'Free',
      originalPrice: '€9.99', // Added for strikethrough effect
      features: [
        isBg ? '✓ 3 активни обяви' : '✓ 3 Active Listings',
        isBg ? '✓ 15 снимки на кола' : '✓ 15 Photos per Car',
        isBg ? '✓ Валидност 60 дни' : '✓ 60 Days Validity',
        isBg ? '✓ Базова статистика' : '✓ Basic Stats',
      ],
      cta: isBg ? 'Започнете' : 'Get Started',
      variant: 'secondary' as const,
    },
    {
      id: 'dealer',
      icon: TrendingUp,
      iconColor: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      name: isBg ? 'Търговец' : 'Dealer',
      price: SUBSCRIPTION_PLANS.dealer.price.monthly.toString(), // ✅ 27.78
      currency: '€',
      period: isBg ? '/месец' : '/month',
      popular: true,
      features: [
        isBg ? `✓ ${SUBSCRIPTION_PLANS.dealer.features.maxListings} обяви` : `✓ ${SUBSCRIPTION_PLANS.dealer.features.maxListings} listings`,
        isBg ? '✓ Анализи' : '✓ Analytics',
        isBg ? '✓ Екип' : '✓ Team management',
        isBg ? '✓ Приоритет' : '✓ Priority support',
      ],
      cta: isBg ? 'Надстройте' : 'Upgrade Now',
      variant: 'premium' as const,
    },
    {
      id: 'company',
      icon: Building2,
      iconColor: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      name: isBg ? 'Компания' : 'Company',
      price: SUBSCRIPTION_PLANS.company.price.monthly.toString(), // ✅ 137.88
      currency: '€',
      period: isBg ? '/месец' : '/month',
      features: [
        isBg ? `✓ ${SUBSCRIPTION_PLANS.company.features.maxListings === -1 ? 'Неограничени' : SUBSCRIPTION_PLANS.company.features.maxListings} обяви` : `✓ ${SUBSCRIPTION_PLANS.company.features.maxListings === -1 ? 'Unlimited' : SUBSCRIPTION_PLANS.company.features.maxListings} listings`,
        isBg ? '✓ Множество локации' : '✓ Multi-location',
        isBg ? '✓ API достъп' : '✓ API access',
        isBg ? '✓ Enterprise поддръжка' : '✓ Enterprise support',
      ],
      cta: isBg ? 'Свържете се' : 'Contact Sales',
      variant: 'primary' as const,
    },
  ];

  const handlePlanClick = (planId: string) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    // If free offer is active, navigate directly to free activation
    if (isFreeOffer) {
      navigate(`/subscription?plan=${planId}&promo=free`);
    } else {
      navigate(`/subscription?plan=${planId}`);
    }
  };

  return (
    <Banner>
      <Container $isDark={isDark}>
        <Content>
          <Title $isDark={isDark}>
            <Rocket size={32} className="text-orange-500" />
            {isBg ? 'Избери плана, който ти подхожда' : 'Choose Your Perfect Plan'}
          </Title>
          <Subtitle $isDark={isDark}>
            {isBg
              ? 'Продавай повече автомобили с професионалните ни инструменти и анализи'
              : 'Sell more cars with our professional tools and analytics'
            }
          </Subtitle>

          {/* ✅ FREE OFFER BANNER — Professional and clean */}
          {isFreeOffer && (
            <FreeOfferBanner>
              <Sparkles size={16} style={{marginRight: 6}} />
              {isBg ? 'Специална оферта — Всички планове са отключени' : 'Special Offer — All Plans Unlocked'}
            </FreeOfferBanner>
          )}
        </Content>

        <PlansGrid>
          {plans.map((plan) => {
            const isFree = plan.id === 'private';
            const priceNum = isFree ? 0 : parseFloat(plan.price);

            return (
              <PlanCard
                key={plan.id}
                $highlight={plan.popular}
                $isDark={isDark}
                $free={isFree}
                $planId={plan.id}
                onClick={() => handlePlanClick(plan.id)}
              >
                {plan.popular && (
                  <PopularBadge>
                    <Sparkles fill="white" size={14} />
                    {isBg ? 'ПОПУЛЯРЕН' : 'POPULAR'}
                  </PopularBadge>
                )}

                <IconWrapper $color={plan.iconColor}>
                  <plan.icon />
                </IconWrapper>

                <PlanName>{plan.name}</PlanName>

                <Price $free={isFree}>
                  {isFree ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <StrikethroughPrice style={{ fontSize: '1.2rem', color: '#ef4444', textDecoration: 'line-through', marginBottom: '-5px' }}>
                        €9.99
                      </StrikethroughPrice>
                      <div className="amount" style={{ color: '#22c55e' }}>{plan.price}</div>
                    </div>
                  ) : isFreeOffer ? (
                    /* ✅ FREE OFFER ACTIVE: Red strikethrough on price + FREE badge */
                    <PriceStrikeWrapper>
                      <StrikethroughPrice>
                        <span className="currency" style={{ fontSize: '0.9rem', opacity: 0.7 }}>€</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{priceNum.toFixed(2)}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{plan.period}</span>
                      </StrikethroughPrice>
                      <FreeBadge>
                        {isBg ? 'БЕЗПЛАТНО' : 'FREE'}
                      </FreeBadge>
                    </PriceStrikeWrapper>
                  ) : (
                    <>
                      <div className="amount">
                        {(() => {
                          const priceStr = priceNum.toFixed(2);
                          const parts = priceStr.split('.');
                          const euroPart = parts[0];
                          const centsPart = parts[1] || '00';
                          const lastDigit = centsPart[centsPart.length - 1];
                          const restCents = centsPart.slice(0, -1);
                          return (
                            <>
                              <span className="currency">€</span>
                              <span className="euro-amount">{euroPart}</span>
                              <span className="cents-amount">
                                .{restCents}
                                <LastDigitSpan>{lastDigit}</LastDigitSpan>
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      {plan.period && <div className="period">{plan.period}</div>}
                    </>
                  )}
                </Price>

                <FeaturesList $free={isFree}>
                  {plan.features.map((feature, idx) => (
                    <FeatureItem key={idx} $free={isFree} $highlight={plan.popular}>
                      <CheckCircle size={18} />
                      <span>{feature.replace('✓ ', '')}</span>
                    </FeatureItem>
                  ))}
                </FeaturesList>

                <CTAButton $variant={plan.variant} $isDark={isDark}>
                  {isFreeOffer && !isFree
                    ? (isBg ? 'Активирайте безплатно' : 'Activate Free')
                    : plan.cta
                  }
                  <ChevronRight />
                </CTAButton>
              </PlanCard>
            );
          })}
        </PlansGrid>
      </Container>
    </Banner>
  );
};

export default SubscriptionBanner;

