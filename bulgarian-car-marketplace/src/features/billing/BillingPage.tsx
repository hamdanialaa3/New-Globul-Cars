import { logger } from '../../services/logger-service';
// src/features/billing/BillingPage.tsx
// Billing Page - Subscription Management

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';  // FIXED: Correct path
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';
import { CreditCard, Download, Settings } from 'lucide-react';
import SubscriptionPlans from './SubscriptionPlans';
import billingService from './BillingService';
import { BillingInterval } from './types';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  background: var(--bg-primary);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
`;

const CurrentPlanCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
    border-color: #334155;
  }
`;

/**
 * Billing Page Component
 * Manages subscriptions and billing
 */
export const BillingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentPlan();
  }, [currentUser]);

  const loadCurrentPlan = async () => {
    if (!currentUser) return;

    try {
      const subscription = await billingService.getCurrentSubscription(currentUser.uid);
      setCurrentPlan(subscription?.planId || 'free');
    } catch (error) {
      logger.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string, interval: BillingInterval) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Call Cloud Function to create Stripe checkout
      const { url, sessionId } = await billingService.createCheckoutSession(
        currentUser.uid,
        planId as any,
        interval
      );
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create checkout session');
      setLoading(false);
    }
  };

  if (loading) {
    return <Container><div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div></Container>;
  }

  return (
    <Container>
      <Header>
        <Title>
          {language === 'bg' ? 'Планове и ценообразуване' : 'Plans & Pricing'}
        </Title>
        <Subtitle>
          {language === 'bg' 
            ? 'Изберете подходящия план за вашия бизнес'
            : 'Choose the right plan for your business'}
        </Subtitle>
      </Header>

      <SubscriptionPlans
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
      />
    </Container>
  );
};

export default BillingPage;

