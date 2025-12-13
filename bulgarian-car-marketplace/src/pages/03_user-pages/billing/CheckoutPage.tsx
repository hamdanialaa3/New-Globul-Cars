// src/pages/03_user-pages/billing/CheckoutPage.tsx
// Stripe checkout page for car purchases

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../components/Toast';
import { logger } from '../../../services/logger-service';
import { subscriptionService } from '../../../services/billing/subscription-service';
import { stripeClientService } from '../../../services/stripe-client-service';

const Container = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  background: white;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  margin-top: 16px;
  font-size: 18px;
  font-weight: 700;
  border-top: 2px solid #e5e7eb;
`;

const Button = styled.button`
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorBox = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid #c33;
`;

const SuccessBox = styled.div`
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid #3c3;
`;

interface CheckoutPageProps {
  carId?: string;
  sellerId?: string;
  amount?: number;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  // Get checkout context from URL params or session
  const sessionId = searchParams.get('session_id');
  const returnUrl = searchParams.get('return_url');

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    // If returning from Stripe with session ID, verify it
    if (sessionId) {
      verifyCheckoutSession(sessionId);
    }
  }, [currentUser, sessionId, navigate]);

  const verifyCheckoutSession = async (sId: string) => {
    try {
      setLoading(true);
      setError('');

      const result = await subscriptionService.verifyCheckoutSession(sId);

      if (result.success) {
        setSuccess('Payment successful! Your subscription is now active.');
        showToast('success', t('checkout.paymentSuccess') || 'Payment successful!');
        
        setTimeout(() => {
          navigate('/billing');
        }, 2000);
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err: any) {
      logger.error('Checkout session verification failed', err);
      setError(err.message || 'Failed to verify payment');
      showToast('error', err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // For car purchases or subscriptions - context should be passed
      const carId = searchParams.get('car_id');
      const planId = searchParams.get('plan_id') as 'dealer' | 'company' | undefined;
      const amount = searchParams.get('amount');

      if (carId) {
        // Car purchase flow
        logger.info('Processing car purchase', { carId });
        // Call create-payment function from backend
      } else if (planId) {
        // Subscription flow (handled by BillingPage)
        logger.info('Processing subscription', { planId });
      }

      // Redirect to Stripe checkout would happen here
      // This is a placeholder - actual redirect handled by subscription-service
    } catch (err: any) {
      logger.error('Payment processing failed', err);
      setError(err.message || 'Payment processing failed');
      showToast('error', err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>{t('checkout.title') || 'Checkout'}</Title>
        <Subtitle>{t('checkout.subtitle') || 'Review your order and complete payment'}</Subtitle>

        {error && <ErrorBox>{error}</ErrorBox>}
        {success && <SuccessBox>{success}</SuccessBox>}

        <div>
          <SummaryItem>
            <span>{t('checkout.subtotal') || 'Subtotal'}</span>
            <span>€0.00</span>
          </SummaryItem>
          <SummaryItem>
            <span>{t('checkout.tax') || 'Tax'}</span>
            <span>€0.00</span>
          </SummaryItem>
          <Total>
            <span>{t('checkout.total') || 'Total'}</span>
            <span>€0.00</span>
          </Total>
        </div>

        <Button disabled={loading} onClick={handlePayment}>
          {loading ? t('common.processing') || 'Processing...' : (t('checkout.pay') || 'Pay Now')}
        </Button>

        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px', fontSize: '12px' }}>
          {t('checkout.securePayment') || 'Your payment is secure and encrypted'}
        </p>
      </Card>
    </Container>
  );
};

export default CheckoutPage;
