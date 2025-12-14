import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Crown, TrendingUp, Building2, CheckCircle, Zap, Shield, Sparkles, Star } from 'lucide-react';
import billingService, { BillingInterval, Plan } from '../../services/billing/BillingService';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';


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

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const rotateIn = keyframes`
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
`;

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(135deg, #fb923c 0%, #fdba74 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textSecondaryDark || '#d1d5db'};
  }
`;

const IntervalToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const IntervalButton = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  border: 2px solid ${p => p.$active ? '#FF8F10' : '#e5e7eb'};
  background: ${p => p.$active 
    ? 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)' 
    : 'transparent'
  };
  color: ${p => p.$active ? 'white' : '#6b7280'};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${p => p.$active ? '0 4px 20px rgba(255, 143, 16, 0.3)' : 'none'};

  &:hover {
    transform: ${p => p.$active ? 'translateY(-2px)' : 'translateY(-1px)'};
    box-shadow: ${p => p.$active 
      ? '0 6px 25px rgba(255, 143, 16, 0.4)' 
      : '0 2px 10px rgba(0, 0, 0, 0.1)'
    };
  }

  @media (prefers-color-scheme: dark) {
    border-color: ${p => p.$active ? '#fb923c' : '#4b5563'};
    color: ${p => p.$active ? 'white' : '#d1d5db'};
  }
`;

const SavingsBadge = styled.span`
  position: absolute;
  top: -12px;
  right: -12px;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 2px 10px rgba(22, 163, 74, 0.3);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $highlight?: boolean; $free?: boolean }>`
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: ${p => p.$highlight 
    ? '0 20px 60px rgba(255, 143, 16, 0.25)' 
    : '0 10px 40px rgba(0, 0, 0, 0.08)'
  };
  border: ${p => p.$highlight ? '3px solid #FF8F10' : '2px solid #f3f4f6'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out;
  transform-origin: center;
  overflow: hidden;

  ${p => p.$highlight && `
    transform: scale(1.05);
    z-index: 10;
  `}

  &:hover {
    transform: ${p => p.$highlight ? 'scale(1.08)' : 'scale(1.03)'};
    box-shadow: ${p => p.$highlight 
      ? '0 25px 70px rgba(255, 143, 16, 0.35)' 
      : '0 15px 50px rgba(0, 0, 0, 0.12)'
    };
  }

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: ${p => p.$highlight ? '#fb923c' : '#374151'};
  }

  /* Shimmer effect for popular plan */
  ${p => p.$highlight && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.15),
        transparent
      );
      animation: ${shimmer} 3s infinite;
    }
  `}
`;

const Badge = styled.div`
  position: absolute;
  top: 20px;
  right: -35px;
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  color: white;
  padding: 0.5rem 3rem;
  font-weight: 700;
  font-size: 0.85rem;
  transform: rotate(45deg);
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.4);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;

  svg {
    width: 14px;
    height: 14px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 25px rgba(255, 143, 16, 0.25);
  animation: ${rotateIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }

  &:hover {
    animation: ${float} 2s ease-in-out infinite;
  }
`;

const PlanName = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  text-align: center;
  margin-bottom: 0.75rem;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#f9fafb'};
  }
`;

const PlanDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
  min-height: 48px;

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textSecondaryDark || '#d1d5db'};
  }
`;

const Price = styled.div<{ $free?: boolean }>`
  text-align: center;
  margin: 1.5rem 0;
  
  .amount {
    font-size: ${p => p.$free ? '2.5rem' : '3.5rem'};
    font-weight: 800;
    background: ${p => p.$free 
      ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
      : 'linear-gradient(135deg, #FF8F10 0%, #fb923c 100%)'
    };
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
  
  .currency {
    font-size: 2rem;
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

  .original-price {
    font-size: 1rem;
    color: #9ca3af;
    text-decoration: line-through;
    margin-top: 0.25rem;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  min-height: 320px;
`;

const FeatureItem = styled.li<{ $highlight?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  color: ${({ theme }) => theme.colors?.text || '#4b5563'};
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.3s ease;
  
  svg {
    width: 22px;
    height: 22px;
    color: ${p => p.$highlight ? '#FF8F10' : '#16a34a'};
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.3s ease;
  }

  &:hover {
    padding-left: 0.5rem;
    
    svg {
      transform: scale(1.2);
    }
  }

  ${p => p.$highlight && `
    font-weight: 600;
    color: #FF8F10;
  `}

  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors?.textDark || '#e5e7eb'};
    
    ${p => p.$highlight && `
      color: #fb923c;
    `}
  }
`;

const Button = styled.button<{ $selected?: boolean; $free?: boolean }>`
  width: 100%;
  padding: 1.25rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
  
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
    
    &:active {
      transform: translateY(0);
    }
  ` : `
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(255, 143, 16, 0.35);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(255, 143, 16, 0.45);
    }

    &:active {
      transform: translateY(-1px);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::after {
    width: 300px;
    height: 300px;
  }
`;

const MoneyBackGuarantee = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(22, 163, 74, 0.1);
  border-radius: 12px;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 600;
  
  svg {
    width: 18px;
    height: 18px;
  }

  @media (prefers-color-scheme: dark) {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }
`;

const PopularityIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: #fbbf24;
    animation: ${scaleIn} 0.3s ease-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.1s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.3s; }
    &:nth-child(5) { animation-delay: 0.4s; }
  }
`;

// ==================== COMPONENT ====================
const SubscriptionManagerEnhanced: React.FC = () => {
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
    } catch (error: unknown) {
      logger.error('Subscription error:', error);
      alert(isBg 
        ? 'Грешка при създаване на сесия. Опитайте отново.' 
        : 'Error creating checkout session. Please try again.'
      );
      setLoading(false);
    }
  };

  const getFeaturesList = (plan: Plan): Array<{ text: string; highlight?: boolean }> => {
    const features: Array<{ text: string; highlight?: boolean }> = [];
    
    // Car listing limit (highlighted)
    if (plan.id === 'free') {
      features.push({ 
        text: isBg ? '🚗 5 سيارات شهرياً' : '🚗 5 cars per month',
        highlight: true 
      });
    } else if (plan.id === 'dealer') {
      features.push({ 
        text: isBg ? '🚗 15 سيارة شهرياً' : '🚗 15 cars per month',
        highlight: true 
      });
    } else if (plan.id === 'company') {
      features.push({ 
        text: isBg ? '🚗 سيارات غير محدودة' : '🚗 Unlimited cars',
        highlight: true 
      });
    }

    // AI Features (highlighted)
    if (plan.id === 'free') {
      features.push({ text: isBg ? '🤖 بدون ذكاء اصطناعي' : '🤖 No AI features' });
    } else if (plan.id === 'dealer') {
      features.push({ 
        text: isBg ? '🤖 30 تقييم AI شهرياً' : '🤖 30 AI valuations/month',
        highlight: true 
      });
      features.push({ text: isBg ? '📊 تحليل أسعار السوق' : '📊 Market price analysis' });
      features.push({ text: isBg ? '🎯 توصيات التسعير الذكية' : '🎯 Smart pricing recommendations' });
    } else if (plan.id === 'company') {
      features.push({ 
        text: isBg ? '🤖 ذكاء اصطناعي غير محدود' : '🤖 Unlimited AI usage',
        highlight: true 
      });
      features.push({ text: isBg ? '📈 تحليلات متقدمة بالAI' : '📈 Advanced AI analytics' });
      features.push({ text: isBg ? '🎯 توقعات السوق التلقائية' : '🎯 Automated market predictions' });
      features.push({ text: isBg ? '💡 اقتراحات تحسين الإعلانات' : '💡 Listing optimization suggestions' });
    }

    // Standard features based on plan
    if (plan.id === 'free') {
      features.push({ text: isBg ? '📸 حتى 10 صور لكل سيارة' : '📸 Up to 10 photos per car' });
      features.push({ text: isBg ? '💬 رسائل مباشرة' : '💬 Direct messaging' });
      features.push({ text: isBg ? '⭐ نقاط الثقة' : '⭐ Trust score' });
      features.push({ text: isBg ? '🔍 ظهور في البحث' : '🔍 Search visibility' });
    } else if (plan.id === 'dealer') {
      features.push({ text: isBg ? '📸 صور غير محدودة' : '📸 Unlimited photos' });
      features.push({ text: isBg ? '⚡ ردود تلقائية سريعة' : '⚡ Quick auto-replies' });
      features.push({ text: isBg ? '⭐ شارة "مميز"' : '⭐ Featured badge' });
      features.push({ text: isBg ? '📊 لوحة تحكم التحليلات' : '📊 Analytics dashboard' });
      features.push({ text: isBg ? '✏️ تعديل جماعي' : '✏️ Bulk editing' });
      features.push({ text: isBg ? '🎯 دعم ذو أولوية' : '🎯 Priority support' });
    } else if (plan.id === 'company') {
      features.push({ text: isBg ? '👥 إدارة فريق كاملة' : '👥 Full team management' });
      features.push({ text: isBg ? '📍 مواقع متعددة' : '📍 Multiple locations' });
      features.push({ text: isBg ? '🔌 وصول API كامل' : '🔌 Full API access' });
      features.push({ text: isBg ? '🎨 علامة تجارية مخصصة' : '🎨 Custom branding' });
      features.push({ text: isBg ? '👤 مدير حساب مخصص' : '👤 Dedicated account manager' });
      features.push({ text: isBg ? '🔗 تكامل CRM' : '🔗 CRM integration' });
      features.push({ text: isBg ? '📋 تقارير مخصصة' : '📋 Custom reports' });
      features.push({ text: isBg ? '📞 دعم هاتفي 24/7' : '📞 24/7 phone support' });
      features.push({ text: isBg ? '✅ ضمان SLA' : '✅ SLA guarantee' });
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

  const getOriginalPrice = (planId: string, interval: BillingInterval) => {
    if (planId === 'free') return null;
    if (interval === 'monthly') return null;
    
    if (planId === 'dealer') {
      return '€348'; // 29 * 12 = 348, now 300 (save 48)
    }
    if (planId === 'company') {
      return '€2,388'; // 199 * 12 = 2388, now 1600 (save 788)
    }
    return null;
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

      {/* Plans Grid */}
      <Grid>
        {plans.map((plan, index) => {
          const isCurrent = currentPlan === plan.id;
          const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
          const features = getFeaturesList(plan);
          const Icon = getPlanIcon(plan.id);
          const originalPrice = getOriginalPrice(plan.id, interval);

          return (
            <Card 
              key={plan.id} 
              $highlight={plan.popular} 
              $free={plan.id === 'free'}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.popular && (
                <>
                  <Badge>
                    <Zap fill="white" />
                    {isBg ? 'الأكثر شعبية' : 'Most Popular'}
                  </Badge>
                  <PopularityIndicator>
                    <Star fill="#fbbf24" />
                    <Star fill="#fbbf24" />
                    <Star fill="#fbbf24" />
                    <Star fill="#fbbf24" />
                    <Star fill="#fbbf24" />
                  </PopularityIndicator>
                </>
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
                    {originalPrice && interval === 'annual' && (
                      <div className="original-price">
                        {isBg ? `Обикновено ${originalPrice}` : `Usually ${originalPrice}`}
                      </div>
                    )}
                  </>
                )}
              </Price>
              
              <FeatureList>
                {features.map((feature, idx) => (
                  <FeatureItem key={idx} $highlight={feature.highlight}>
                    {feature.highlight ? <Sparkles /> : <CheckCircle />}
                    <span>{feature.text}</span>
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

              {plan.id !== 'free' && (
                <MoneyBackGuarantee>
                  <Shield />
                  <span>{isBg ? '30-дневна гаранция за връщане на пари' : '30-Day Money-Back Guarantee'}</span>
                </MoneyBackGuarantee>
              )}
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default SubscriptionManagerEnhanced;
