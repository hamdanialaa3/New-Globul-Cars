/**
 * Stripe Payment Page for Koli One Marketplace
 * صفحة الدفع بالبطاقة عبر Stripe
 * 
 * ✅ PRODUCTION READY: Handles Stripe card payment confirmation
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Lock, AlertCircle, Loader } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import styledImport from 'styled-components';

import { useLanguage } from '@/contexts/LanguageContext';
import { orderService } from '@/services/marketplace/order.service';
import { paymentService } from '@/services/payment-service';
import { cartService } from '@/services/marketplace/cart.service';
import { logger } from '@/services/logger-service';

const styled = styledImport;

interface LocationState {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  amount: number;
}

// Stripe promise - loaded once
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    try {
      const key = paymentService.getStripePublicKey();
      stripePromise = loadStripe(key);
    } catch (error) {
      logger.error('Failed to load Stripe', error as Error);
      return null;
    }
  }
  return stripePromise;
};

// Payment Form Component
const PaymentForm: React.FC<{
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ clientSecret, orderId, orderNumber: _orderNumber, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const isProcessing = useRef(false);

  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const texts = {
    bg: {
      payNow: 'Плати сега',
      processing: 'Обработка...',
      bgn: 'лв',
      cardDetails: 'Данни на картата',
      securePayment: 'Сигурно плащане',
    },
    en: {
      payNow: 'Pay Now',
      processing: 'Processing...',
      bgn: 'BGN',
      cardDetails: 'Card Details',
      securePayment: 'Secure Payment',
    },
  };

  const t = texts[language] || texts.bg;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prevent double submission
    if (isProcessing.current || processing || !stripe || !elements) {
      return;
    }

    isProcessing.current = true;
    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Complete order
        await orderService.completeOrder(orderId, paymentIntent.id);
        await cartService.clearCart();
        onSuccess();
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      logger.error('Payment failed', err as Error);
      onError((err as Error).message);
    } finally {
      setProcessing(false);
      isProcessing.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardSection>
        <CardLabel>
          <CreditCard size={20} />
          {t.cardDetails}
        </CardLabel>
        <CardElementWrapper>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                },
                invalid: {
                  color: '#dc2626',
                },
              },
              hidePostalCode: true,
            }}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </CardElementWrapper>
      </CardSection>

      <TotalSection>
        <TotalLabel>Total:</TotalLabel>
        <TotalAmount>{amount.toFixed(2)} {t.bgn}</TotalAmount>
      </TotalSection>

      <PayButton 
        type="submit" 
        disabled={!stripe || !cardComplete || processing}
      >
        {processing ? (
          <>
            <Loader size={20} className="spinner" />
            {t.processing}
          </>
        ) : (
          <>
            <Lock size={20} />
            {t.payNow} - {amount.toFixed(2)} {t.bgn}
          </>
        )}
      </PayButton>

      <SecureBadge>
        <Lock size={14} />
        {t.securePayment}
      </SecureBadge>
    </form>
  );
};

// Main Page Component
const StripePaymentPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [error, setError] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  const texts = {
    bg: {
      title: 'Плащане с карта',
      subtitle: 'Сигурно плащане чрез Stripe',
      orderNumber: 'Поръчка',
      invalidSession: 'Невалидна сесия за плащане',
      returnToCheckout: 'Върни се към Checkout',
      paymentError: 'Грешка при плащането',
      stripeNotConfigured: 'Stripe не е конфигуриран',
    },
    en: {
      title: 'Card Payment',
      subtitle: 'Secure payment via Stripe',
      orderNumber: 'Order',
      invalidSession: 'Invalid payment session',
      returnToCheckout: 'Return to Checkout',
      paymentError: 'Payment Error',
      stripeNotConfigured: 'Stripe is not configured',
    },
  };

  const t = texts[language] || texts.bg;

  useEffect(() => {
    // Check if we have required state
    if (!state?.clientSecret || !state?.orderId) {
      setError(t.invalidSession);
      return;
    }

    // Check Stripe configuration
    const stripe = getStripe();
    if (!stripe) {
      setError(t.stripeNotConfigured);
      return;
    }

    setStripeLoaded(true);
  }, [state, t.invalidSession, t.stripeNotConfigured]);

  const handleSuccess = () => {
    navigate('/marketplace/order-success', {
      state: {
        orderId: state?.orderId,
        orderNumber: state?.orderNumber,
        paymentMethod: 'stripe_card',
      },
    });
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Invalid session
  if (!state?.clientSecret || !state?.orderId) {
    return (
      <PageContainer>
        <ContentWrapper>
          <ErrorCard>
            <AlertCircle size={48} />
            <ErrorTitle>{t.invalidSession}</ErrorTitle>
            <ReturnButton onClick={() => navigate('/marketplace/checkout')}>
              {t.returnToCheckout}
            </ReturnButton>
          </ErrorCard>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Stripe not loaded
  if (!stripeLoaded) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingState>
            <Loader size={48} className="spinner" />
          </LoadingState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <PaymentCard>
          <Header>
            <IconWrapper>
              <CreditCard size={32} />
            </IconWrapper>
            <Title>{t.title}</Title>
            <Subtitle>{t.subtitle}</Subtitle>
            <OrderBadge>
              {t.orderNumber}: <strong>{state.orderNumber}</strong>
            </OrderBadge>
          </Header>

          {error && (
            <ErrorBanner onClick={() => setError(null)}>
              <AlertCircle size={20} />
              {error}
            </ErrorBanner>
          )}

          <Elements stripe={getStripe()}>
            <PaymentForm
              clientSecret={state.clientSecret}
              orderId={state.orderId}
              orderNumber={state.orderNumber}
              amount={state.amount}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </Elements>
        </PaymentCard>

        <StripeFooter>
          <StripeText>Powered by</StripeText>
          <StripeLogo>Stripe</StripeLogo>
        </StripeFooter>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  max-width: 480px;
  width: 100%;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const PaymentCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  color: #dc2626;
`;

const ErrorTitle = styled.h2`
  margin: 1rem 0 2rem;
  color: #333;
`;

const ReturnButton = styled.button`
  padding: 1rem 2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const OrderBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.9rem;
  
  strong {
    color: #667eea;
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  
  &:hover {
    background: #fecaca;
  }
`;

const CardSection = styled.div`
  margin-bottom: 1.5rem;
`;

const CardLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
`;

const CardElementWrapper = styled.div`
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s;
  
  &:focus-within {
    border-color: #667eea;
  }
`;

const TotalSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const TotalLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const TotalAmount = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const PayButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SecureBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #22c55e;
`;

const StripeFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

const StripeText = styled.span`
  font-size: 0.85rem;
`;

const StripeLogo = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
`;

export default StripePaymentPage;
