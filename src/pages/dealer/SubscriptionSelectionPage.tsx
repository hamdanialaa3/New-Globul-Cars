/**
 * Subscription Selection Page - Plan comparison and payment initiation
 * Dealer can upgrade from Free to Dealer/Enterprise
 * Location: Bulgaria
 * Currency: EUR
 * Theme: "Royal Night" (Deep Blue + Aurora)
 * 
 * File: src/pages/dealer/SubscriptionSelectionPage.tsx
 * Updated: February 10, 2026
 */

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Check, X, ArrowRight, Zap, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PLANS, type PlanTier } from '../../config/subscription-plans';
import { bulgarianPaymentService } from '../../services/payment/bulgarian-payment.service';
import { subscriptionTheme } from '../../components/subscription/subscription-theme';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { serviceLogger } from '../../services/logger-service';

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
  50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5); }
  100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
`;

// ==================== COMPONENT ====================

interface PaymentMethod {
  id: 'epay' | 'easypay';
  name: string;
  description: string;
  logo: string;
}

export const SubscriptionSelectionPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'epay' | 'easypay'>('epay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <PageContainer>Please log in to view subscription plans.</PageContainer>;
  }

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'epay',
      name: 'ePay.bg',
      description: 'Bulgarian payment gateway - HMAC-SHA1 secure',
      logo: 'https://www.epay.bg/logo.png'
    },
    {
      id: 'easypay',
      name: 'EasyPay',
      description: 'Bulgarian payment API - SHA256 secure',
      logo: 'https://www.easypay.bg/logo.png'
    }
  ];

  const handleSelectPlan = (plan: PlanTier) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan || selectedPlan === 'free') {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const planConfig = SUBSCRIPTION_PLANS[selectedPlan];

      const paymentRequest = {
        orderId: `order_${user.uid}_${Date.now()}`,
        amount: planConfig.price.monthly,
        currency: 'EUR',
        description: `${selectedPlan} subscription - Koli One Auction`,
        userId: user.uid,
        email: user.email || '',
        planTier: selectedPlan,
        billingPeriod: 'monthly'
      };

      const paymentUrl = await bulgarianPaymentService.createPayment(
        selectedPayment,
        paymentRequest
      );

      window.location.href = paymentUrl;
    } catch (err) {
      serviceLogger.error('Payment initiation failed', err as Error);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Choose Your Plan</Title>
          <Subtitle>Upgrade to unlock unlimited listings and advanced features</Subtitle>
        </Header>

        <PlansGrid>
          {/* FREE PLAN */}
          <PlanCard
            $tier="free"
            $selected={selectedPlan === 'free'}
            onClick={() => handleSelectPlan('free')}
            style={{ opacity: 0.7 }}
          >
            <CardHeader>
              <PlanIcon><Zap /></PlanIcon>
              <PlanName>Free</PlanName>
              <Price>
                <span style={{ fontSize: '1.2rem', color: '#ef4444', textDecoration: 'line-through', display: 'block' }}>€9.99</span>
                €0<Period>/mo</Period>
              </Price>
            </CardHeader>
            <FeaturesList>
              <FeatureItem $included><Check /> 3 Active Listings</FeatureItem>
              <FeatureItem $included><Check /> Basic Support</FeatureItem>
            </FeaturesList>
            <SelectButton $tier="free" $selected={selectedPlan === 'free'} disabled>Current Plan</SelectButton>
          </PlanCard>

          {/* DEALER PLAN */}
          <PlanCard
            $tier="dealer"
            $selected={selectedPlan === 'dealer'}
            $highlight
            onClick={() => handleSelectPlan('dealer')}
          >
            <PopularBadge><Sparkles size={14} fill="white" /> Most Popular</PopularBadge>
            <CardHeader>
              <PlanIcon style={{ background: subscriptionTheme.gradients.dealer }}>
                <Award />
              </PlanIcon>
              <PlanName>Dealer</PlanName>
              <Price>€{SUBSCRIPTION_PLANS.dealer.price.monthly}<Period>/mo</Period></Price>
            </CardHeader>
            <FeaturesList>
              <FeatureItem $included><Check /> {SUBSCRIPTION_PLANS.dealer.maxListings} Listings</FeatureItem>
              <FeatureItem $included><Check /> Priority Support</FeatureItem>
              <FeatureItem $included><Check /> AI Analytics</FeatureItem>
            </FeaturesList>
            <SelectButton $tier="dealer" $selected={selectedPlan === 'dealer'}>
              {selectedPlan === 'dealer' ? 'Selected' : 'Select Dealer'}
            </SelectButton>
          </PlanCard>

          {/* COMPANY PLAN */}
          <PlanCard
            $tier="company"
            $selected={selectedPlan === 'company'}
            onClick={() => handleSelectPlan('company')}
          >
            <CardHeader>
              <PlanIcon><ShieldCheck /></PlanIcon>
              <PlanName>Enterprise</PlanName>
              <Price>€{SUBSCRIPTION_PLANS.company.price.monthly}<Period>/mo</Period></Price>
            </CardHeader>
            <FeaturesList>
              <FeatureItem $included><Check /> Unlimited Listings</FeatureItem>
              <FeatureItem $included><Check /> Dedicated Manager</FeatureItem>
              <FeatureItem $included><Check /> API Access</FeatureItem>
            </FeaturesList>
            <SelectButton $tier="company" $selected={selectedPlan === 'company'}>
              {selectedPlan === 'company' ? 'Selected' : 'Select Enterprise'}
            </SelectButton>
          </PlanCard>
        </PlansGrid>

        {selectedPlan && selectedPlan !== 'free' && (
          <PaymentSection>
            <PaymentHeader>
              <h3>Select Payment Method</h3>
              <Description>Secure payment through Bulgarian payment gateways</Description>
            </PaymentHeader>

            <PaymentMethods>
              {paymentMethods.map((method) => (
                <PaymentOption
                  key={method.id}
                  $selected={selectedPayment === method.id}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <RadioButton $checked={selectedPayment === method.id} />
                  <MethodInfo>
                    <MethodName>{method.name}</MethodName>
                    <MethodDescription>{method.description}</MethodDescription>
                  </MethodInfo>
                </PaymentOption>
              ))}
            </PaymentMethods>

            {error && (
              <ErrorMessage>
                {error}
              </ErrorMessage>
            )}

            <PaymentActions>
              <CancelButton onClick={() => setSelectedPlan(null)}>
                Cancel
              </CancelButton>
              <UpgradeButton onClick={handleUpgrade} disabled={loading}>
                {loading ? 'Processing...' : `Upgrade to ${selectedPlan} (€${SUBSCRIPTION_PLANS[selectedPlan].price.monthly})`}
                {!loading && <ArrowRight size={18} />}
              </UpgradeButton>
            </PaymentActions>

            <SecurityNote>
              <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and processed securely.
            </SecurityNote>
          </PaymentSection>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default SubscriptionSelectionPage;

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${subscriptionTheme.colors.bg.primary};
  background-image: 
    radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%);
  color: ${subscriptionTheme.colors.text.primary};
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${subscriptionTheme.colors.text.secondary};
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  align-items: start;
`;

const PlanCard = styled.div<{ $tier: PlanTier; $selected?: boolean; $highlight?: boolean }>`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;

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

  ${p => p.$highlight && css`
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    transform: scale(1.05);
    z-index: 10;
  `}

  &:hover {
    transform: ${p => p.$highlight ? 'scale(1.08)' : 'translateY(-5px)'};
    box-shadow: 0 0 25px -5px ${p => {
    if (p.$tier === 'free') return 'rgba(249, 115, 22, 0.8)';
    if (p.$tier === 'dealer') return 'rgba(34, 197, 94, 0.8)';
    return 'rgba(59, 130, 246, 0.8)';
  }};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${subscriptionTheme.gradients.dealer};
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PlanIcon = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const PlanName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
`;

const Period = styled.span`
  font-size: 1rem;
  color: ${subscriptionTheme.colors.text.secondary};
  font-weight: 500;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.div<{ $included?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: ${p => p.$included ? 'white' : 'rgba(255,255,255,0.4)'};
  
  svg {
    width: 18px;
    height: 18px;
    color: ${p => p.$included ? subscriptionTheme.colors.text.accent : 'rgba(255,255,255,0.2)'};
  }
`;

const SelectButton = styled.button<{ $tier: PlanTier; $selected?: boolean }>`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  
  ${p => {
    let color = '';
    if (p.$tier === 'free') color = '#f97316';
    else if (p.$tier === 'dealer') color = '#22c55e';
    else color = '#3b82f6';

    if (p.$selected) {
      return css`
            background: ${color};
            box-shadow: 0 4px 20px ${color}66;
        `;
    }
    return css`
        background: rgba(255, 255, 255, 0.1);
        &:hover { background: rgba(255, 255, 255, 0.15); border: 1px solid ${color}; }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const PaymentSection = styled.div`
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  animation: ${glowPulse} 2s infinite alternate;
`;

const PaymentHeader = styled.div`
  margin-bottom: 2rem;
  h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: white; }
`;

const Description = styled.p`
  color: ${subscriptionTheme.colors.text.secondary};
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PaymentOption = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${p => p.$selected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${p => p.$selected ? '#a855f7' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #a855f7;
    background: rgba(168, 85, 247, 0.05);
  }
`;

const RadioButton = styled.div<{ $checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${p => p.$checked ? '#a855f7' : 'rgba(255, 255, 255, 0.4)'};
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #a855f7;
    opacity: ${p => p.$checked ? 1 : 0};
    transition: opacity 0.2s;
  }
`;

const MethodInfo = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 600;
  color: white;
  margin-bottom: 0.2rem;
`;

const MethodDescription = styled.div`
  font-size: 0.9rem;
  color: ${subscriptionTheme.colors.text.secondary};
`;

const PaymentActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: rgba(255, 255, 255, 0.05); }
`;

const UpgradeButton = styled.button`
  flex: 2;
  padding: 1rem;
  background: ${subscriptionTheme.gradients.dealer};
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: ${subscriptionTheme.shadows.glow};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }
  
  &:disabled { opacity: 0.7; cursor: wait; }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const SecurityNote = styled.div`
  padding: 1rem;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 12px;
  color: #7dd3fc;
  font-size: 0.9rem;
  text-align: center;
`;
