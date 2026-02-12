/**
 * 🔴 CRITICAL: Update Payment Method Page
 * صفحة تحديث طريقة الدفع
 * 
 * @description Allows users to update their payment method after payment failure
 * يسمح للمستخدمين بتحديث طريقة الدفع بعد فشل الدفع
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses PascalCase for component name (CONSTITUTION Section 2.2)
 * - Proper error handling and logging (CONSTITUTION Section 4.4)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import { useToast } from '@/components/Toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (using public key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CardElementWrapper = styled.div`
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  
  &:focus-within {
    border-color: #FF8F10;
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
`;

const Button = styled.button<{ $primary?: boolean; $disabled?: boolean }>`
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  
  ${props => {
    if (props.$primary) {
      return `
        background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
        }
      `;
    } else {
      return `
        background: white;
        color: #6b7280;
        border: 2px solid #e5e7eb;
        
        &:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }
      `;
    }
  }}
`;

// ==================== PAYMENT FORM COMPONENT ====================

const PaymentMethodForm: React.FC<{ onSuccess: () => void; onError: (error: string) => void }> = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const isBg = language === 'bg';

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !currentUser) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        throw new Error(pmError.message || 'Failed to create payment method');
      }

      if (!paymentMethod) {
        throw new Error('Payment method creation failed');
      }

      // Update payment method in Stripe (via Cloud Function or direct API)
      // For now, we'll save payment method ID to Firestore
      // The actual Stripe update should be done via Cloud Function
      const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/firebase');

      await updateDoc(doc(db, 'users', currentUser.uid), {
        paymentMethodId: paymentMethod.id,
        paymentMethodUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      logger.info('Payment method updated successfully', {
        userId: currentUser.uid,
        paymentMethodId: paymentMethod.id,
      });

      toast.success(
        isBg
          ? '✅ Методът на плащане е обновен успешно'
          : '✅ Payment method updated successfully',
        { duration: 3000 }
      );

      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError(errorMessage);
      logger.error('Failed to update payment method', err as Error, {
        userId: currentUser?.uid,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
          {isBg ? 'Данни за карта' : 'Card Details'}:
        </label>
        <CardElementWrapper>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1F2937',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
              },
            }}
          />
        </CardElementWrapper>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button
          type="submit"
          $primary
          disabled={!stripe || isProcessing}
          $disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              {isBg ? 'Обработване...' : 'Processing...'}
            </>
          ) : (
            <>
              <Check size={18} />
              {isBg ? 'Обнови метод на плащане' : 'Update Payment Method'}
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

// ==================== MAIN COMPONENT ====================

const UpdatePaymentMethodPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const isBg = language === 'bg';

  const returnUrl = searchParams.get('returnUrl') || '/billing';
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=/billing/update-payment-method');
    }
  }, [currentUser, navigate]);

  const handleSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      navigate(returnUrl);
    }, 2000);
  };

  const handleError = (error: string) => {
    logger.error('Payment method update error', new Error(error), {
      userId: currentUser?.uid,
    });
  };

  if (!currentUser) {
    return null;
  }

  if (isSuccess) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Check size={64} color="#10B981" style={{ marginBottom: '1rem' }} />
            <Title style={{ color: '#10B981' }}>
              {isBg ? '✅ Успешно обновен' : '✅ Successfully Updated'}
            </Title>
            <Message>
              {isBg
                ? 'Методът на плащане е обновен успешно. Пренасочване...'
                : 'Payment method has been updated successfully. Redirecting...'}
            </Message>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <div style={{ marginBottom: '2rem' }}>
          <Button
            onClick={() => navigate(-1)}
            style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
          >
            <ArrowLeft size={18} />
            {isBg ? 'Назад' : 'Back'}
          </Button>
          <Title>
            {isBg ? 'Обнови метод на плащане' : 'Update Payment Method'}
          </Title>
          <Message>
            {isBg
              ? 'Добавете нова карта или обновете данните на съществуваща карта за продължаване на плащанията.'
              : 'Add a new card or update existing card details to continue with payments.'}
          </Message>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentMethodForm onSuccess={handleSuccess} onError={handleError} />
        </Elements>
      </Card>
    </Container>
  );
};

export default UpdatePaymentMethodPage;
