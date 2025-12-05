// src/pages/home/HomePage/SubscriptionBanner.tsx
// Subscription Banner for HomePage - Promote Plans

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Crown, TrendingUp, Building2, ChevronRight, Zap } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '../../../../contexts/AuthProvider';

const Banner = styled.section`
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
`;

const Container = styled.div`
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 50%, #FFA500 100%);
  border-radius: 24px;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(255, 143, 16, 0.3);

  @media (max-width: 768px) {
    padding: 40px 24px;
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
  margin-bottom: 50px;
`;

const Title = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
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

const PlanCard = styled.div<{ $highlight?: boolean }>`
  background: ${p => p.$highlight 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)'
    : 'rgba(255, 255, 255, 0.92)'
  };
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 32px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: ${p => p.$highlight ? '3px solid #FF8F10' : '2px solid rgba(255, 255, 255, 0.3)'};
  cursor: pointer;

  ${p => p.$highlight && `
    transform: scale(1.05);
    box-shadow: 0 25px 50px rgba(255, 143, 16, 0.4);
  `}

  &:hover {
    transform: ${p => p.$highlight ? 'scale(1.07)' : 'scale(1.03)'};
    box-shadow: 0 20px 40px rgba(255, 143, 16, 0.2);
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
    transform: none !important;

    &:hover {
      transform: translateY(-4px) !important;
    }
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  right: 24px;
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 20px ${p => p.$color}40;

  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const PlanName = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  text-align: center;
`;

const PlanPrice = styled.div`
  text-align: center;
  margin: 16px 0 24px;
`;

const Price = styled.span`
  font-size: 3rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Currency = styled.span`
  font-size: 1.5rem;
  color: #64748b;
  margin-right: 4px;
`;

const Period = styled.span`
  font-size: 1rem;
  color: #64748b;
  margin-left: 8px;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: #475569;
  font-size: 0.95rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);

  &:last-child {
    border-bottom: none;
  }

  svg {
    width: 18px;
    height: 18px;
    color: #22c55e;
    flex-shrink: 0;
  }
`;

const CTAButton = styled.button<{ $variant: 'primary' | 'secondary' | 'premium' }>`
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
          background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(255, 143, 16, 0.4);

          &:hover {
            box-shadow: 0 8px 24px rgba(255, 143, 16, 0.5);
            transform: translateY(-2px);
          }
        `;
      case 'primary':
        return `
          background: linear-gradient(135deg, #FF8F10 0%, #FFA500 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(255, 143, 16, 0.3);

          &:hover {
            box-shadow: 0 8px 24px rgba(255, 143, 16, 0.4);
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: #FF8F10;
          border: 2px solid rgba(255, 143, 16, 0.3);

          &:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
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
  const navigate = useNavigate();

  const isBg = language === 'bg';

  const plans = [
    {
      id: 'private',
      icon: Crown,
      iconColor: 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)',
      name: isBg ? 'Личен' : 'Private',
      price: isBg ? 'Безплатно' : 'Free',
      features: [
        isBg ? '✓ 3 обяви' : '✓ 3 listings',
        isBg ? '✓ Основно търсене' : '✓ Basic search',
        isBg ? '✓ Trust Score' : '✓ Trust Score',
        isBg ? '✓ Контакти' : '✓ Contact sellers',
      ],
      cta: isBg ? 'Започнете' : 'Get Started',
      variant: 'secondary' as const,
    },
    {
      id: 'dealer',
      icon: TrendingUp,
      iconColor: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      name: isBg ? 'Търговец' : 'Dealer',
      price: '49',
      currency: '€',
      period: isBg ? '/месец' : '/month',
      popular: true,
      features: [
        isBg ? '✓ 50 обяви' : '✓ 50 listings',
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
      price: '299',
      currency: '€',
      period: isBg ? '/месец' : '/month',
      features: [
        isBg ? '✓ 100 обяви' : '✓ 100 listings',
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

    // Always navigate to subscription page for all plans
    navigate('/subscription');
  };

  return (
    <Banner>
      <Container>
        <Content>
          <Title>
            {isBg ? '🚀 Избери плана, който ти подхожда' : '🚀 Choose Your Perfect Plan'}
          </Title>
          <Subtitle>
            {isBg 
              ? 'Продавай повече автомобили с професионалните ни инструменти и анализи'
              : 'Sell more cars with our professional tools and analytics'
            }
          </Subtitle>
        </Content>

        <PlansGrid>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              $highlight={plan.popular}
              onClick={() => handlePlanClick(plan.id)}
            >
              {plan.popular && (
                <PopularBadge>
                  <Zap />
                  {isBg ? 'Популярен' : 'Popular'}
                </PopularBadge>
              )}

              <IconWrapper $color={plan.iconColor}>
                <plan.icon />
              </IconWrapper>

              <PlanName>{plan.name}</PlanName>

              <PlanPrice>
                {plan.currency && <Currency>{plan.currency}</Currency>}
                <Price>{plan.price}</Price>
                {plan.period && <Period>{plan.period}</Period>}
              </PlanPrice>

              <FeaturesList>
                {plan.features.map((feature, idx) => (
                  <FeatureItem key={idx}>
                    <ChevronRight />
                    {feature}
                  </FeatureItem>
                ))}
              </FeaturesList>

              <CTAButton $variant={plan.variant}>
                {plan.cta}
                <ChevronRight />
              </CTAButton>
            </PlanCard>
          ))}
        </PlansGrid>
      </Container>
    </Banner>
  );
};

export default SubscriptionBanner;
