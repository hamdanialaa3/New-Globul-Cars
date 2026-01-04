import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { StripeService, StripeSubscription } from '../../services/stripe-service';
import { CreditCard, Check, Shield, Star, Crown, Zap, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../services/logger-service';

// --- Styled Components (Premium Professional) ---

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 60px;
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 80px 20px 100px;
  text-align: center;
  margin-bottom: -60px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(to right, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
`;

const PlanCard = styled.div<{ $featured?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: ${props => props.$featured
    ? '0 20px 40px -12px rgba(79, 70, 229, 0.3)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'};
  border: 2px solid ${props => props.$featured ? '#4f46e5' : 'transparent'};
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #4f46e5;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
`;

const PlanIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 8px;
  font-weight: 700;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: baseline;
  margin-bottom: 24px;
  
  span {
    font-size: 1rem;
    font-weight: 500;
    color: #64748b;
    margin-left: 8px;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  color: #475569;
  font-size: 0.95rem;

  svg {
    color: #10b981;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#4f46e5' : '#f1f5f9'};
  color: ${props => props.$primary ? 'white' : '#1e293b'};
  border: none;

  &:hover {
    background: ${props => props.$primary ? '#4338ca' : '#e2e8f0'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CurrentPlanCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #10b981;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StripeSetupPage: React.FC = () => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<StripeSubscription | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Subscribe to subscription status
    const unsubscribe = StripeService.subscribeToSubscriptions((subscriptions) => {
      if (subscriptions && subscriptions.length > 0) {
        // Get the most relevant subscription
        // Priority: active > trialing
        const active = subscriptions.find(s => s.status === 'active') || subscriptions[0];
        setActiveSubscription(active);
      } else {
        setActiveSubscription(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleSubscribe = async (priceId: string) => {
    setActionLoading(true);
    try {
      await StripeService.createCheckoutSession({
        price: priceId,
        success_url: window.location.origin + '/billing/success',
        cancel_url: window.location.origin + '/dealer/stripe-setup',
        mode: 'subscription'
      }, (url) => {
        window.location.assign(url);
      }, (err) => {
        logger.error('Stripe Checkout Error', err);
        alert('Connection to payment gateway failed. Please try again.');
        setActionLoading(false);
      });
    } catch (e) {
      logger.error('Subscription Error', e);
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      await StripeService.redirectToCustomerPortal(window.location.href);
    } catch (e) {
      logger.error('Portal Error', e);
      setActionLoading(false);
      alert('Could not redirect to billing portal.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
          <Loader size={40} className="animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>{language === 'bg' ? 'Професионални Планове' : 'Pro Dealer Plans'}</Title>
        <Subtitle>
          {language === 'bg'
            ? 'Отключете пълния потенциал на платформата с нашите премиум инструменти за търговци.'
            : 'Unlock the full potential of the platform with our premium dealer tools.'}
        </Subtitle>
      </HeaderSection>

      <ContentContainer>
        {activeSubscription && (
          <CurrentPlanCard>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>
                {language === 'bg' ? 'Активен Абонамент' : 'Active Subscription'}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
                {activeSubscription.role === 'dealer' ? 'Dealer Pro' : 'Enterprise'} • {activeSubscription.status.toUpperCase()}
              </p>
            </div>
            <ActionButton
              $primary
              style={{ width: 'auto' }}
              onClick={handleManageBilling}
              disabled={actionLoading}
            >
              {actionLoading ? 'Loading...' : (language === 'bg' ? 'Управление' : 'Manage Billing')}
            </ActionButton>
          </CurrentPlanCard>
        )}

        <PlansGrid>
          {/* Free Plan */}
          <PlanCard>
            <PlanIcon $color="#64748b">
              <Shield size={28} />
            </PlanIcon>
            <PlanName>Starter</PlanName>
            <PlanPrice>0€ <span>/mo</span></PlanPrice>
            <FeaturesList>
              <FeatureItem><Check size={18} /> Up to 3 car listings</FeatureItem>
              <FeatureItem><Check size={18} /> Basic analytics</FeatureItem>
              <FeatureItem><Check size={18} /> Standard support</FeatureItem>
            </FeaturesList>
            <ActionButton onClick={() => navigate('/sell')}>
              {language === 'bg' ? 'Започни Безплатно' : 'Get Started'}
            </ActionButton>
          </PlanCard>

          {/* Dealer Plan */}
          <PlanCard $featured>
            <FeaturedBadge><Star size={12} /> POPULAR</FeaturedBadge>
            <PlanIcon $color="#4f46e5">
              <Zap size={28} />
            </PlanIcon>
            <PlanName>Dealer Pro</PlanName>
            <PlanPrice>29€ <span>/mo</span></PlanPrice>
            <FeaturesList>
              <FeatureItem><Check size={18} /> Up to 50 car listings</FeatureItem>
              <FeatureItem><Check size={18} /> <strong>Priority</strong> placement in search</FeatureItem>
              <FeatureItem><Check size={18} /> Advanced AI Analytics</FeatureItem>
              <FeatureItem><Check size={18} /> Verified Dealer Badge</FeatureItem>
              <FeatureItem><Check size={18} /> Lead Scoring System</FeatureItem>
            </FeaturesList>
            <ActionButton
              $primary
              disabled={activeSubscription?.role === 'dealer' || actionLoading}
              onClick={() => handleSubscribe('price_dealer_monthly')}
            >
              {activeSubscription?.role === 'dealer'
                ? 'Active Plan'
                : (language === 'bg' ? 'Избери Dealer Pro' : 'Choose Dealer Pro')}
            </ActionButton>
          </PlanCard>

          {/* Company Plan */}
          <PlanCard>
            <PlanIcon $color="#0f172a">
              <Crown size={28} />
            </PlanIcon>
            <PlanName>Enterprise</PlanName>
            <PlanPrice>99€ <span>/mo</span></PlanPrice>
            <FeaturesList>
              <FeatureItem><Check size={18} /> <strong>Unlimited</strong> car listings</FeatureItem>
              <FeatureItem><Check size={18} /> Top of search results</FeatureItem>
              <FeatureItem><Check size={18} /> API Access to Inventory</FeatureItem>
              <FeatureItem><Check size={18} /> Dedicated Account Manager</FeatureItem>
              <FeatureItem><Check size={18} /> AI Price Valuation Tool</FeatureItem>
            </FeaturesList>
            <ActionButton
              disabled={activeSubscription?.role === 'company' || actionLoading}
              onClick={() => handleSubscribe('price_company_monthly')}
            >
              {activeSubscription?.role === 'company'
                ? 'Active Plan'
                : (language === 'bg' ? 'Свържи се с нас' : 'Contact Sales')}
            </ActionButton>
          </PlanCard>
        </PlansGrid>
      </ContentContainer>
    </PageContainer>
  );
};

export default StripeSetupPage;
