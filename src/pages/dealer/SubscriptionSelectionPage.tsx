/**
 * Subscription Selection Page - Plan comparison and payment initiation
 * Dealer can upgrade from Free to Dealer/Enterprise
 * Location: Bulgaria
 * Currency: EUR
 * 
 * File: src/pages/dealer/SubscriptionSelectionPage.tsx
 * Created: February 8, 2026
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Check, X, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION_PLANS, type PlanTier } from '../../config/subscription-plans';
import { bulgarianPaymentService } from '../../services/payment/bulgarian-payment.service';
import { subscriptionService } from '../../services/billing/subscription-service';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { serviceLogger } from '../../services/logger-service';

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
    return <div>Please log in to view subscription plans.</div>;
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
    <Container>
      <Header>
        <Title>Choose Your Plan</Title>
        <Subtitle>Upgrade to unlock unlimited listings and advanced features</Subtitle>
      </Header>

      <PlansGrid>
        {Object.entries(SUBSCRIPTION_PLANS).map(([tier, plan]) => (
          <PlanCard key={tier} selected={selectedPlan === tier} onClick={() => handleSelectPlan(tier as PlanTier)}>
            <PlanName>{plan.name}</PlanName>
            
            <PriceSection>
              <Price>€{plan.price.monthly}</Price>
              <Period>/month</Period>
              <AnnualOffer>Save 20% → €{plan.price.annual}/year</AnnualOffer>
            </PriceSection>

            <FeaturesList>
              <FeatureItem included={tier !== 'free'}>
                <Check size={18} />
                {plan.maxListings === -1 ? 'Unlimited listings' : `${plan.maxListings} active listings`}
              </FeatureItem>

              <FeatureItem included={plan.maxCampaigns !== undefined && plan.maxCampaigns > 0}>
                <Check size={18} />
                {plan.maxCampaigns ? `${plan.maxCampaigns} campaigns/month` : 'Limited campaigns'}
              </FeatureItem>

              <FeatureItem included={plan.maxTeamMembers !== undefined && plan.maxTeamMembers > 1}>
                <Check size={18} />
                {plan.maxTeamMembers && plan.maxTeamMembers > 1 ? `${plan.maxTeamMembers} team members` : 'Single user'}
              </FeatureItem>

              <FeatureItem included={plan.apiRateLimitPerHour !== undefined}>
                <Check size={18} />
                {plan.apiRateLimitPerHour ? `${plan.apiRateLimitPerHour.toLocaleString()} API calls/hour` : 'Limited API access'}
              </FeatureItem>

              <FeatureItem included={tier === 'company'}>
                <Check size={18} />
                {tier === 'company' ? 'Priority support' : 'Standard support'}
              </FeatureItem>

              <FeatureItem included={tier === 'company'}>
                <Check size={18} />
                {tier === 'company' ? 'Auto-renewal available' : 'No auto-renewal'}
              </FeatureItem>
            </FeaturesList>

            {tier === 'free' ? (
              <CurrentPlanButton>Your Current Plan</CurrentPlanButton>
            ) : (
              <SelectButton 
                selected={selectedPlan === tier}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(tier as PlanTier);
                }}
              >
                {selectedPlan === tier ? 'Selected' : 'Select Plan'}
              </SelectButton>
            )}
          </PlanCard>
        ))}
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
                selected={selectedPayment === method.id}
                onClick={() => setSelectedPayment(method.id)}
              >
                <RadioButton checked={selectedPayment === method.id} />
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
            <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and processed securely through ePay.bg or EasyPay. No card details are stored on our servers.
          </SecurityNote>
        </PaymentSection>
      )}

      <ComparisonTable>
        <h3>Feature Comparison</h3>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>{SUBSCRIPTION_PLANS.free.name}</th>
              <th>{SUBSCRIPTION_PLANS.dealer.name}</th>
              <th>{SUBSCRIPTION_PLANS.company.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Active Listings</td>
              <td>{SUBSCRIPTION_PLANS.free.maxListings}</td>
              <td>{SUBSCRIPTION_PLANS.dealer.maxListings}</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Campaigns/Month</td>
              <td>{SUBSCRIPTION_PLANS.free.maxCampaigns || 0}</td>
              <td>{SUBSCRIPTION_PLANS.dealer.maxCampaigns || 0}</td>
              <td>{SUBSCRIPTION_PLANS.company.maxCampaigns || 'Unlimited'}</td>
            </tr>
            <tr>
              <td>Bulk Upload</td>
              <td><X size={18} /></td>
              <td><Check size={18} /></td>
              <td><Check size={18} /></td>
            </tr>
            <tr>
              <td>Auto-Renewal</td>
              <td><X size={18} /></td>
              <td><Check size={18} /></td>
              <td><Check size={18} /></td>
            </tr>
            <tr>
              <td>Team Members</td>
              <td>1</td>
              <td>1</td>
              <td>{SUBSCRIPTION_PLANS.company.maxTeamMembers}</td>
            </tr>
            <tr>
              <td>API Rate Limit</td>
              <td>Limited</td>
              <td>{SUBSCRIPTION_PLANS.dealer.apiRateLimitPerHour?.toLocaleString()}/hour</td>
              <td>{SUBSCRIPTION_PLANS.company.apiRateLimitPerHour?.toLocaleString()}/hour</td>
            </tr>
            <tr>
              <td>Support</td>
              <td>Email</td>
              <td>Email + Chat</td>
              <td>Priority 24/7</td>
            </tr>
          </tbody>
        </table>
      </ComparisonTable>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 50px;
`;

const PlanCard = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? '#0066cc' : '#e0e0e0'};
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};

  &:hover {
    border-color: #0066cc;
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
  }
`;

const PlanName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const PriceSection = styled.div`
  margin-bottom: 24px;
`;

const Price = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin: 0;
`;

const Period = styled.span`
  color: #666;
  font-size: 14px;
`;

const AnnualOffer = styled.div`
  font-size: 13px;
  color: #28a745;
  margin-top: 8px;
  font-weight: 500;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const FeatureItem = styled.div<{ included: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${props => props.included ? '#333' : '#999'};
  
  svg {
    color: ${props => props.included ? '#28a745' : '#ccc'};
    flex-shrink: 0;
  }
`;

const SelectButton = styled.button<{ selected: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.selected ? '#0066cc' : '#f0f0f0'};
  color: ${props => props.selected ? 'white' : '#333'};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? '#0052a3' : '#e0e0e0'};
  }
`;

const CurrentPlanButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: not-allowed;
  font-weight: 500;
`;

const PaymentSection = styled.div`
  background: #f9f9f9;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 50px;
`;

const PaymentHeader = styled.div`
  margin-bottom: 24px;

  h3 {
    font-size: 20px;
    margin: 0 0 8px 0;
  }
`;

const Description = styled.p`
  color: #666;
  margin: 0;
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PaymentOption = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#0066cc' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};
  transition: all 0.2s ease;

  &:hover {
    border-color: #0066cc;
  }
`;

const RadioButton = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.checked ? '#0066cc' : '#ccc'};
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.checked && `
    background: #0066cc;
    &::after {
      content: '';
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
    }
  `}
`;

const MethodInfo = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const MethodDescription = styled.div`
  font-size: 13px;
  color: #666;
`;

const PaymentActions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  color: #333;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

const UpgradeButton = styled.button`
  flex: 2;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  background: #0066cc;
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #0052a3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #f5c6cb;
`;

const SecurityNote = styled.div`
  background: #d1ecf1;
  color: #0c5460;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #bee5eb;
  font-size: 13px;
`;

const ComparisonTable = styled.div`
  h3 {
    font-size: 24px;
    margin: 0 0 20px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f0f0f0;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  td:first-child {
    font-weight: 500;
  }

  svg {
    margin: 0 auto;
    display: block;
  }
`;
