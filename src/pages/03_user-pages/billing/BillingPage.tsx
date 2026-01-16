// src/pages/03_user-pages/billing/BillingPage.tsx
// Plans page with manual bank transfer payment (iCard + Revolut)
// ✅ Updated January 16, 2026: Stripe disabled, using manual payment system

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { useToast } from '../../../components/Toast';
import { BANK_DETAILS } from '../../../config/bank-details';
import { analyticsService } from '../../../services/analytics/UnifiedAnalyticsService';
import { logger } from '../../../services/logger-service';

const Container = styled.div`
  max-width: 960px;
  margin: 40px auto;
  padding: 16px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 28px;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 14px;
  }
`;

const InfoBanner = styled.div`
  background: #f0f9ff;
  border: 1px solid #0284c7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  svg {
    color: #0284c7;
    flex-shrink: 0;
    margin-top: 2px;
  }

  div {
    font-size: 14px;
    color: #333;

    strong {
      display: block;
      color: #0284c7;
      margin-bottom: 4px;
    }
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  background: white;
  transition: all 0.2s;

  &:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  }
`;

const BadgeFree = styled.span`
  background: #d1d5db;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  margin: 8px 0;
  font-size: 20px;
  color: #111827;
`;

const Price = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
  margin: 12px 0;

  span {
    font-size: 14px;
    color: #666;
    font-weight: normal;
  }
`;

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;

  li {
    padding: 6px 0;
    font-size: 14px;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 8px;

    &:before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
    }
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'disabled' }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;

  background: ${(p) => {
    switch (p.variant) {
      case 'primary':
        return '#2563eb';
      case 'secondary':
        return '#e5e7eb';
      case 'disabled':
        return '#d1d5db';
      default:
        return '#f3f4f6';
    }
  }};

  color: ${(p) => {
    switch (p.variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return '#111827';
      case 'disabled':
        return '#9ca3af';
      default:
        return '#111827';
    }
  }};

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const BankSelector = styled.div`
  margin: 20px 0;
  display: flex;
  gap: 12px;
`;

const BankOption = styled.button<{ selected?: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${(p) => (p.selected ? '#2563eb' : '#e5e7eb')};
  border-radius: 8px;
  background: ${(p) => (p.selected ? '#dbeafe' : 'white')};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: #2563eb;
  }
`;

const ManageSection = styled.section`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
  }

  p {
    color: #666;
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

const ContactInfo = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  font-size: 14px;

  strong {
    display: block;
    margin-bottom: 8px;
  }

  a {
    color: #2563eb;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface PlanConfig {
  id: 'free' | 'dealer' | 'company';
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  listings: number | string;
  teamMembers: number;
  features: string[];
  isFree?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    listings: 3,
    teamMembers: 0,
    features: [
      'Basic listings',
      'Standard support',
      'Search & filter',
    ],
    isFree: true,
  },
  {
    id: 'dealer',
    name: 'Dealer',
    price: { monthly: 20.11, annual: 193 },
    listings: 30,
    teamMembers: 3,
    features: [
      'Featured ads',
      'Priority search',
      'Team management',
      'Advanced analytics',
      'Bulk operations',
    ],
  },
  {
    id: 'company',
    name: 'Company',
    price: { monthly: 100.11, annual: 961 },
    listings: '∞',
    teamMembers: 10,
    features: [
      'Unlimited ads',
      'Enterprise support',
      'Advanced features',
      'API access',
      'White-label options',
    ],
  },
];

const BillingPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedBank, setSelectedBank] = useState<'icard' | 'revolut'>('icard');
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: 'free' | 'dealer' | 'company') => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    // Free plan - no payment needed
    if (planId === 'free') {
      showToast('info', t('billing.alreadyFree') || 'You are already on the free plan');
      return;
    }

    try {
      setLoading(true);
      analyticsService.trackEvent('billing_plan_selected', { planId, bank: selectedBank });

      // Redirect to manual payment page
      navigate('/billing/manual-payment', {
        state: {
          planId,
          bankAccount: selectedBank,
        },
      });
    } catch (err: any) {
      logger.error('Plan selection failed', err);
      showToast('error', t('billing.error') || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>{t('billing.title') || 'Choose Your Plan'}</h1>
        <p>{t('billing.subtitle') || 'Select the perfect plan for your needs'}</p>
      </Header>

      <InfoBanner>
        <AlertCircle size={20} />
        <div>
          <strong>💳 {t('billing.paymentMethod') || 'Payment Method'}</strong>
          {t('billing.manualPaymentInfo') ||
            'We accept bank transfers via iCard (Bulgaria) and Revolut (International). Payment is processed within 1-2 hours.'}
        </div>
      </InfoBanner>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>
          {t('billing.selectBank') || 'Select Payment Method:'}
        </h3>
        <BankSelector>
          <BankOption
            selected={selectedBank === 'icard'}
            onClick={() => setSelectedBank('icard')}
          >
            💳 iCard (Bulgaria)
          </BankOption>
          <BankOption
            selected={selectedBank === 'revolut'}
            onClick={() => setSelectedBank('revolut')}
          >
            🌐 Revolut (Int'l)
          </BankOption>
        </BankSelector>
      </div>

      <Row>
        {PLANS.map((plan) => (
          <Card key={plan.id}>
            {plan.isFree && <BadgeFree>ALWAYS FREE</BadgeFree>}
            <Title>{plan.name}</Title>

            {!plan.isFree ? (
              <Price>
                €{plan.price.monthly}
                <span>/month or €{plan.price.annual}/year</span>
              </Price>
            ) : (
              <Price>€0/month</Price>
            )}

            <Features>
              <li>
                <strong>{plan.listings}</strong> listings
              </li>
              <li>
                <strong>{plan.teamMembers}</strong> team member{plan.teamMembers !== 1 ? 's' : ''}
              </li>
              {plan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </Features>

            {!plan.isFree && (
              <Button
                variant="primary"
                onClick={() => handleSelectPlan(plan.id as 'dealer' | 'company')}
                disabled={loading}
              >
                {loading ? 'Loading...' : t('billing.selectPlan') || 'Select Plan'}
              </Button>
            )}

            {plan.isFree && (
              <Button variant="secondary" disabled>
                {t('billing.currentPlan') || 'Current Plan'}
              </Button>
            )}
          </Card>
        ))}
      </Row>

      <ManageSection>
        <h3>{t('billing.needHelp') || 'Need Help?'}</h3>
        <p>
          {t('billing.supportText') ||
            'Contact our support team for assistance with subscriptions and payments:'}
        </p>

        <ContactInfo>
          <strong>📧 {t('billing.email') || 'Email'}:</strong>
          <a href="mailto:support@mobilebg.eu">support@mobilebg.eu</a>

          <strong style={{ marginTop: '12px' }}>💬 {t('billing.whatsapp') || 'WhatsApp'}:</strong>
          <a href="https://wa.me/359879839671" target="_blank" rel="noopener noreferrer">
            +359 87 983 9671
          </a>

          <strong style={{ marginTop: '12px' }}>📍 {t('billing.office') || 'Office'}:</strong>
          <div>Bulgaria, Sofia, Tsar Simeon 77</div>
        </ContactInfo>
      </ManageSection>
    </Container>
  );
};

export default BillingPage;
