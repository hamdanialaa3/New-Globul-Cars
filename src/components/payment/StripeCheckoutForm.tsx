/**
 * StripeCheckoutForm Component
 * Complete Stripe checkout form with Elements integration
 */

import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { logger } from '../../services/logger-service';
import { PaymentErrorHandler, PaymentRetryManager } from '../../../services/payment/payment-error-handler';

interface StripeCheckoutFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  planName: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  clientSecret,
  amount,
  currency,
  planName,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retryManager = new PaymentRetryManager(3);

  useEffect(() => {
    if (!stripe || !elements) {
      logger.warn('💳 Stripe not loaded yet');
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      logger.error('💳 Stripe not loaded');
      return;
    }

    if (processing) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setPaymentError(null);

    try {
      logger.info('💳 Starting payment confirmation...');

      // Execute payment with retry
      const result = await retryManager.executeWithRetry(
        async () => {
          const { error: submitError } = await elements.submit();
          if (submitError) {
            throw submitError;
          }

          const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/payment-success`,
              receipt_email: currentUser?.email || undefined
            },
            redirect: 'if_required'
          });

          if (confirmError) {
            throw confirmError;
          }

          return paymentIntent;
        },
        (error) => {
          // Handle retry errors
          setRetryCount(retryManager.getRetryCount());
          logger.warn(`💳 Retry ${retryManager.getRetryCount()}/3`, error);
        }
      );

      // Success
      logger.info('✅ Payment confirmed successfully');
      
      // Track success
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          value: amount / 100,
          currency: currency,
          content_name: planName
        });
      }

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: unknown) {
      logger.error('❌ Payment failed:', error);

      // Handle error
      const parsedError = error.type 
        ? PaymentErrorHandler.handleStripeError(error)
        : PaymentErrorHandler.handleGenericError(error);

      setPaymentError(parsedError);
      setErrorMessage(parsedError.userMessage[language as 'bg' | 'en']);

      PaymentErrorHandler.logError(parsedError, {
        userId: currentUser?.uid,
        planName,
        amount,
        currency
      });

      if (onError) {
        onError(parsedError);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setPaymentError(null);
    setRetryCount(0);
    retryManager.reset();
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Plan Summary */}
      <SummaryCard>
        <SummaryTitle>{t('payment.orderSummary')}</SummaryTitle>
        <SummaryRow>
          <SummaryLabel>{t('payment.plan')}</SummaryLabel>
          <SummaryValue>{planName}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>{t('payment.amount')}</SummaryLabel>
          <SummaryValue style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {(amount / 100).toFixed(2)} {currency.toUpperCase()}
          </SummaryValue>
        </SummaryRow>
      </SummaryCard>

      {/* Payment Element */}
      <PaymentElementWrapper>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'google_pay', 'apple_pay']
          }}
        />
      </PaymentElementWrapper>

      {/* Error Message */}
      {errorMessage && (
        <ErrorBox>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorContent>
            <ErrorTitle>{t('payment.errorOccurred')}</ErrorTitle>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            {paymentError?.action && (
              <ErrorAction>
                {PaymentErrorHandler.getActionMessage(
                  paymentError,
                  language as 'bg' | 'en'
                )}
              </ErrorAction>
            )}
            {retryCount > 0 && (
              <RetryInfo>
                {t('payment.retryAttempt')}: {retryCount}/3
              </RetryInfo>
            )}
          </ErrorContent>
        </ErrorBox>
      )}

      {/* Action Buttons */}
      <ButtonGroup>
        {errorMessage && PaymentErrorHandler.isRetryable(paymentError) && (
          <SecondaryButton type="button" onClick={handleRetry} disabled={processing}>
            🔄 {t('payment.tryAgain')}
          </SecondaryButton>
        )}
        <SubmitButton type="submit" disabled={!stripe || !elements || processing}>
          {processing ? (
            <>
              <Spinner />
              {t('payment.processing')}
            </>
          ) : (
            <>
              💳 {t('payment.confirmAndPay')}
            </>
          )}
        </SubmitButton>
      </ButtonGroup>

      {/* Security Notice */}
      <SecurityNotice>
        <LockIcon>🔒</LockIcon>
        <SecurityText>{t('payment.securePayment')}</SecurityText>
      </SecurityNotice>
    </Form>
  );
};

// Styled Components
const Form = styled.form`
  max-width: 500px;
  margin: 0 auto;
`;

const SummaryCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
    padding-top: 16px;
  }
`;

const SummaryLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const SummaryValue = styled.span`
  color: #111827;
  font-weight: 600;
`;

const PaymentElementWrapper = styled.div`
  margin-bottom: 24px;
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
`;

const ErrorIcon = styled.span`
  font-size: 24px;
  flex-shrink: 0;
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.h4`
  color: #991b1b;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 8px;
`;

const ErrorAction = styled.p`
  color: #b91c1c;
  font-size: 13px;
  font-style: italic;
`;

const RetryInfo = styled.p`
  color: #9ca3af;
  font-size: 12px;
  margin-top: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const SubmitButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #374151;
  padding: 16px 24px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #10b981;
    color: #10b981;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SecurityNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
`;

const LockIcon = styled.span`
  font-size: 16px;
`;

const SecurityText = styled.span`
  color: #059669;
  font-size: 13px;
  font-weight: 500;
`;

export default StripeCheckoutForm;
