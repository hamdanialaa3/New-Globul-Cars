import React, { useState } from 'react';
import styled from 'styled-components';
import { CheckCircle, CreditCard, TrendingUp } from 'lucide-react';
import { useTranslation } from '@globul-cars/coreuseTranslation';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1f2937;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 3rem;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Card = styled.div<{ $highlight?: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: ${props => props.$highlight ? '2px solid #3b82f6' : '1px solid #e5e7eb'};
  overflow: hidden;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #3b82f6;
  margin: 1rem 0;
`;

const PriceUnit = styled.span`
  font-size: 1rem;
  color: #6b7280;
  font-weight: normal;
`;

const CardContent = styled.div`
  padding: 2rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #374151;
`;

const Button = styled.button<{ variant?: 'primary' | 'outline' }>`
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'outline' ? `
    background: transparent;
    border-color: #d1d5db;
    color: #374151;
    &:hover {
      background: #f9fafb;
      border-color: #3b82f6;
      color: #3b82f6;
    }
  ` : `
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const BenefitsSection = styled.div`
  margin-top: 4rem;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const BenefitCard = styled.div`
  text-align: center;
  padding: 2rem;
`;

const BenefitIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const BenefitTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const BenefitDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
`;

// Subscription plans data
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    planKey: 'basic',
    price: 29.99,
    popular: false
  },
  {
    id: 'premium',
    planKey: 'premium',
    price: 89.99,
    popular: true
  },
  {
    id: 'enterprise',
    planKey: 'enterprise',
    price: 299.99,
    popular: false
  }
];

const SubscriptionManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { t, language } = useTranslation();

  // Get features based on current language
  const getPlanFeatures = (planKey: string) => {
    if (language === 'bg') {
      switch (planKey) {
        case 'basic':
          return [
            'До 100 API заявки месечно',
            'Основна пазарна аналитика',
            'Поддръжка чрез имейл',
            'Стандартен достъп до данни',
            'Месечни отчети'
          ];
        case 'premium':
          return [
            'До 1,000 API заявки месечно',
            'Разширена аналитика и прозрения',
            'Приоритетна поддръжка чрез имейл',
            'Пазарни данни в реално време',
            'Персонализирани отчети и табла',
            'Достъп до исторически данни'
          ];
        case 'enterprise':
          return [
            'Неограничени API заявки',
            'Пълен пакет за аналитика',
            'Отговорник за клиентски акаунт',
            'Поддръжка по телефон и имейл',
            'Персонализирани интеграции',
            'Възможности за собствена марка',
            'Разширени функции за сигурност'
          ];
        default:
          return [];
      }
    } else {
      switch (planKey) {
        case 'basic':
          return [
            'Up to 100 API requests per month',
            'Basic market analytics',
            'Email support',
            'Standard data access',
            'Monthly reports'
          ];
        case 'premium':
          return [
            'Up to 1,000 API requests per month',
            'Advanced analytics & insights',
            'Priority email support',
            'Real-time market data',
            'Custom reports & dashboards',
            'Historical data access'
          ];
        case 'enterprise':
          return [
            'Unlimited API requests',
            'Complete analytics suite',
            'Dedicated account manager',
            'Phone & email support',
            'Custom integrations',
            'White-label options',
            'Advanced security features'
          ];
        default:
          return [];
      }
    }
  };

  const handleSubscribe = (planId: string, planName: string, price: number) => {
    setLoading(true);
    // Mock subscription process
    setTimeout(() => {
      if (language === 'bg') {
        alert(`Записване за ${planName} план за €${price}/месец`);
      } else {
        alert(`Subscribing to ${planName} plan for €${price}/month`);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Container>
      <Title>{t('subscription.title')}</Title>
      <Subtitle>
        {t('subscription.subtitle')}
      </Subtitle>

      <Grid>
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.id} $highlight={plan.popular} style={{ position: 'relative' }}>
            {plan.popular && <Badge>{t('subscription.mostPopular')}</Badge>}
            
            <CardHeader>
              <PlanName>{t(`subscription.${plan.planKey}.name`)}</PlanName>
              <Price>
                €{plan.price}
                <PriceUnit>{language === 'bg' ? '/месец' : '/month'}</PriceUnit>
              </Price>
            </CardHeader>

            <CardContent>
              <FeatureList>
                {getPlanFeatures(plan.planKey).map((feature, index) => (
                  <FeatureItem key={index}>
                    <CheckCircle size={20} color="#10b981" />
                    <span>{feature}</span>
                  </FeatureItem>
                ))}
              </FeatureList>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                onClick={() => handleSubscribe(plan.id, t(`subscription.${plan.planKey}.name`), plan.price)}
                disabled={loading}
              >
                {loading ? t('subscription.processing') : `${t('subscription.choose')} ${t(`subscription.${plan.planKey}.name`)}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <BenefitsSection>
        <Card>
          <CardHeader>
            <PlanName style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} />
              {t('subscription.benefits.title')}
            </PlanName>
          </CardHeader>
          <CardContent>
            <BenefitsGrid>
              <BenefitCard>
                <BenefitIcon>
                  <CreditCard size={48} color="#3b82f6" />
                </BenefitIcon>
                <BenefitTitle>{t('subscription.benefits.marketInsights.title')}</BenefitTitle>
                <BenefitDescription>
                  {t('subscription.benefits.marketInsights.description')}
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>
                  <TrendingUp size={48} color="#10b981" />
                </BenefitIcon>
                <BenefitTitle>{t('subscription.benefits.competitiveEdge.title')}</BenefitTitle>
                <BenefitDescription>
                  {t('subscription.benefits.competitiveEdge.description')}
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>
                  <CheckCircle size={48} color="#ef4444" />
                </BenefitIcon>
                <BenefitTitle>{t('subscription.benefits.reliableSupport.title')}</BenefitTitle>
                <BenefitDescription>
                  {t('subscription.benefits.reliableSupport.description')}
                </BenefitDescription>
              </BenefitCard>
            </BenefitsGrid>
          </CardContent>
        </Card>
      </BenefitsSection>
    </Container>
  );
};

export default SubscriptionManager;
