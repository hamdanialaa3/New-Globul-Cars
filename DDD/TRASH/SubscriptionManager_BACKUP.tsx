import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, Crown, TrendingUp, Building2, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import billingService from '../../features/billing/BillingService';
import { Plan, BillingInterval } from '../../features/billing/types';

// Styled components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
`;

const IntervalToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  background: rgba(255, 143, 16, 0.1);
  padding: 0.5rem;
  border-radius: 12px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const IntervalButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${p => p.$active ? `
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
  ` : `
    background: transparent;
    color: #FF8F10;
    
    &:hover {
      background: rgba(255, 143, 16, 0.1);
    }
  `}
`;

const SavingsBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors?.text || '#1a1a1a'};
  margin: 0 0 1rem 0;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#f5f5f5'};
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textSecondaryDark || '#d1d5db'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const Card = styled.div<{ $highlight?: boolean; $free?: boolean }>`
  background: ${({ theme }) => theme.colors?.cardBackground || '#ffffff'};
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
  border: 3px solid ${p => p.$highlight ? '#FF8F10' : p.$free ? '#9ca3af' : 'rgba(255, 143, 16, 0.2)'};
  
  ${p => p.$highlight && `
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(255, 143, 16, 0.25);
  `}
  
  &:hover {
    transform: translateY(-8px) ${p => p.$highlight ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: 0 16px 40px rgba(255, 143, 16, 0.2);
  }

  @media (prefers-color-scheme: dark) {
    background: ${({ theme }) => theme.colors?.cardBackgroundDark || '#1a1a1a'};
  }

  @media (max-width: 1024px) {
    transform: none !important;
    
    &:hover {
      transform: translateY(-4px) !important;
    }
  }
`;

const Badge = styled.div`
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
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  color: white;
  
  svg {
    width: 16px;
    height: 16px;
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
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 20px ${p => p.$color}40;

  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const PlanName = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors?.text || '#1a1a1a'};
  margin: 0 0 0.75rem 0;
  text-align: center;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#f5f5f5'};
  }
`;

const PlanDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  text-align: center;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textSecondaryDark || '#d1d5db'};
  }
`;

const Price = styled.div<{ $free?: boolean }>`
  text-align: center;
  margin: 1.5rem 0;
  
  .amount {
    font-size: ${p => p.$free ? '2.5rem' : '3rem'};
    font-weight: 800;
    background: ${p => p.$free 
      ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
      : 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)'
    };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .currency {
    font-size: 1.75rem;
    opacity: 0.8;
  }
  
  .period {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors?.textSecondary || '#9ca3af'};
    font-weight: 600;
    display: block;
    margin-top: 0.5rem;

    @media (prefers-color-scheme: dark) {
      color: ${({ theme }) => theme.colors?.textSecondaryDark || '#d1d5db'};
    }
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  min-height: 300px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  color: ${({ theme }) => theme.colors?.text || '#4b5563'};
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
    color: ${({ theme }) => theme.colors?.textDark || '#e5e7eb'};
  }
`;

const Button = styled.button<{ $selected?: boolean; $free?: boolean }>`
  width: 100%;
  padding: 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  ${p => p.$selected ? `
    background: rgba(229, 231, 235, 0.5);
    color: #6c757d;
    cursor: default;
    border: 2px solid #e5e7eb;
  ` : p.$free ? `
    background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(107, 114, 128, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(107, 114, 128, 0.4);
    }
  ` : `
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(255, 143, 16, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 143, 16, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
  }
`;
const SubscriptionManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const isBg = language === 'bg';
  const plans = billingService.getAvailablePlans();

  // Load current subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (currentUser) {
        const subscription = await billingService.getCurrentSubscription(currentUser.uid);
        if (subscription) {
          setCurrentPlan(subscription.planId);
        }
      }
    };
    loadSubscription();
  }, [currentUser]);

  const handleSubscribe = async (plan: Plan) => {
    if (!currentUser) {
      alert(isBg ? 'Моля, влезте в профила си' : 'Please log in first');
      return;
    }

    if (plan.id === 'free') {
      alert(isBg ? 'Това е безплатният план' : 'This is the free plan');
      return;
    }

    setLoading(true);
    try {
      const { url } = await billingService.createCheckoutSession(
        currentUser.uid,
        plan.id as any,
        interval
      );
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(isBg 
        ? 'Грешка при създаване на сесия. Опитайте отново.' 
        : 'Error creating checkout session. Please try again.'
      );
      setLoading(false);
    }
  };

  const getFeaturesList = (plan: Plan): string[] => {
    const features: string[] = [];
    
    // Car listing limit
    if (plan.id === 'free') {
      features.push(isBg ? '🚗 5 سيارات شهرياً' : '🚗 5 cars per month');
    } else if (plan.id === 'dealer') {
      features.push(isBg ? '🚗 15 سيارة شهرياً' : '🚗 15 cars per month');
    } else if (plan.id === 'company') {
      features.push(isBg ? '🚗 سيارات غير محدودة' : '🚗 Unlimited cars');
    }

    // AI Features
    if (plan.id === 'free') {
      features.push(isBg ? '🤖 بدون ذكاء اصطناعي' : '🤖 No AI features');
    } else if (plan.id === 'dealer') {
      features.push(isBg ? '🤖 30 تقييم AI شهرياً' : '🤖 30 AI valuations/month');
      features.push(isBg ? '📊 تحليل أسعار السوق' : '📊 Market price analysis');
      features.push(isBg ? '🎯 توصيات التسعير الذكية' : '🎯 Smart pricing recommendations');
    } else if (plan.id === 'company') {
      features.push(isBg ? '🤖 ذكاء اصطناعي غير محدود' : '🤖 Unlimited AI usage');
      features.push(isBg ? '📈 تحليلات متقدمة بالAI' : '📈 Advanced AI analytics');
      features.push(isBg ? '🎯 توقعات السوق التلقائية' : '🎯 Automated market predictions');
      features.push(isBg ? '💡 اقتراحات تحسين الإعلانات' : '💡 Listing optimization suggestions');
    }

    // Standard features based on plan
    if (plan.id === 'free') {
      features.push(isBg ? '📸 حتى 10 صور لكل سيارة' : '📸 Up to 10 photos per car');
      features.push(isBg ? '💬 رسائل مباشرة' : '💬 Direct messaging');
      features.push(isBg ? '⭐ نقاط الثقة' : '⭐ Trust score');
      features.push(isBg ? '🔍 ظهور في البحث' : '🔍 Search visibility');
    } else if (plan.id === 'dealer') {
      features.push(isBg ? '📸 صور غير محدودة' : '📸 Unlimited photos');
      features.push(isBg ? '⚡ ردود تلقائية سريعة' : '⚡ Quick auto-replies');
      features.push(isBg ? '⭐ شارة "مميز"' : '⭐ Featured badge');
      features.push(isBg ? '📊 لوحة تحكم التحليلات' : '📊 Analytics dashboard');
      features.push(isBg ? '✏️ تعديل جماعي' : '✏️ Bulk editing');
      features.push(isBg ? '🎯 دعم ذو أولوية' : '🎯 Priority support');
    } else if (plan.id === 'company') {
      features.push(isBg ? '👥 إدارة فريق كاملة' : '👥 Full team management');
      features.push(isBg ? '📍 مواقع متعددة' : '📍 Multiple locations');
      features.push(isBg ? '🔌 وصول API كامل' : '🔌 Full API access');
      features.push(isBg ? '🎨 علامة تجارية مخصصة' : '🎨 Custom branding');
      features.push(isBg ? '👤 مدير حساب مخصص' : '👤 Dedicated account manager');
      features.push(isBg ? '🔗 تكامل CRM' : '🔗 CRM integration');
      features.push(isBg ? '📋 تقارير مخصصة' : '📋 Custom reports');
      features.push(isBg ? '📞 دعم هاتفي 24/7' : '📞 24/7 phone support');
      features.push(isBg ? '✅ ضمان SLA' : '✅ SLA guarantee');
    }

    return features;
  };

  const getPlanIcon = (planId: string) => {
    if (planId === 'free') return Crown;
    if (planId === 'dealer') return TrendingUp;
    return Building2;
  };

  const getPlanColor = (planId: string) => {
    if (planId === 'free') return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    if (planId === 'dealer') return 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)';
    return 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)';
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>
          {isBg ? '🚀 Изберете вашия план' : '🚀 Choose Your Plan'}
        </Title>
        <Subtitle>
          {isBg 
            ? 'Продавайте повече автомобили с нашите професионални инструменти и AI анализи'
            : 'Sell more cars with our professional tools and AI analytics'
          }
        </Subtitle>
      </Header>

      {/* Interval Toggle */}
      <IntervalToggle>
        <IntervalButton
          $active={interval === 'monthly'}
          onClick={() => setInterval('monthly')}
        >
          {isBg ? 'Месечно' : 'Monthly'}
        </IntervalButton>
        <IntervalButton
          $active={interval === 'annual'}
          onClick={() => setInterval('annual')}
        >
          {isBg ? 'Годишно' : 'Annual'}
          {interval === 'annual' && (
            <SavingsBadge>
              {isBg ? 'Спести до 33%' : 'Save up to 33%'}
            </SavingsBadge>
          )}
        </IntervalButton>
      </IntervalToggle>

      {/* Plans Grid - Simple 3-card layout */}
      <Grid>
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id;
          const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
          const features = getFeaturesList(plan);
          const Icon = getPlanIcon(plan.id);

          return (
            <Card 
              key={plan.id} 
              $highlight={plan.popular} 
              $free={plan.id === 'free'}
            >
              {plan.popular && (
                <Badge>
                  <Zap fill="white" />
                  {isBg ? 'الأكثر شعبية' : 'Most Popular'}
                </Badge>
              )}
              
              <IconWrapper $color={getPlanColor(plan.id)}>
                <Icon />
              </IconWrapper>
              
              <PlanName>
                {isBg ? plan.name.bg : plan.name.en}
              </PlanName>
              
              <PlanDescription>
                {isBg ? plan.description.bg : plan.description.en}
              </PlanDescription>
              
              <Price $free={plan.id === 'free'}>
                {plan.id === 'free' ? (
                  <div className="amount">
                    {isBg ? 'Безплатно' : 'Free'}
                  </div>
                ) : (
                  <>
                    <div className="amount">
                      <span className="currency">€</span>
                      {price}
                    </div>
                    <div className="period">
                      {isBg 
                        ? (interval === 'monthly' ? 'на месец' : 'на година') 
                        : (interval === 'monthly' ? 'per month' : 'per year')
                      }
                    </div>
                  </>
                )}
              </Price>
              
              <FeatureList>
                {features.map((feature, idx) => (
                  <FeatureItem key={idx}>
                    <CheckCircle />
                    <span>{feature}</span>
                  </FeatureItem>
                ))}
              </FeatureList>
              
              <Button
                $selected={isCurrent}
                $free={plan.id === 'free'}
                onClick={() => !isCurrent && handleSubscribe(plan)}
                disabled={loading || isCurrent || plan.id === 'free'}
              >
                {isCurrent 
                  ? (isBg ? '✓ Текущ план' : '✓ Current Plan')
                  : plan.id === 'free'
                  ? (isBg ? 'Започнете безплатно' : 'Start Free')
                  : loading
                  ? (isBg ? 'Зареждане...' : 'Loading...')
                  : (isBg ? 'Избери план' : 'Select Plan')}
              </Button>
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default SubscriptionManager;
