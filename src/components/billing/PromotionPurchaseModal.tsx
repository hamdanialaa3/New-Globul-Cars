/**
 * Promotion Purchase Modal
 * Allows users to purchase one-time promotions (VIP Badge, Top of Page, Instant Refresh)
 * 
 * File: src/components/billing/PromotionPurchaseModal.tsx
 * Created: January 8, 2026
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import { useLanguage } from '@/contexts/LanguageContext';

// Only initialise Stripe when a real key is configured – lazy to avoid loading on every page
let _stripePromise: ReturnType<typeof loadStripe> | null = null;
const getStripePromise = () => {
  if (!_stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    _stripePromise = stripeKey ? loadStripe(stripeKey) : Promise.resolve(null);
  }
  return _stripePromise;
};

interface PromotionProduct {
  type: 'vip_badge' | 'top_of_page' | 'instant_refresh';
  name: { bg: string; en: string };
  description: { bg: string; en: string };
  price: number;
  duration: string;
  benefits: string[];
  icon: string;
  color: string;
}

const PROMOTION_PRODUCTS: PromotionProduct[] = [
  {
    type: 'vip_badge',
    name: {
      bg: 'VIP Значка',
      en: 'VIP Badge'
    },
    description: {
      bg: 'Златна значка и 3x повече показвания',
      en: 'Gold badge and 3x more views'
    },
    price: 2,
    duration: '7 дни / 7 days',
    benefits: ['🏆 Златна VIP значка', '👀 3x повече показвания', '⭐ Приоритет в резултатите'],
    icon: '👑',
    color: '#FFD700'
  },
  {
    type: 'top_of_page',
    name: {
      bg: 'Върху Страницата',
      en: 'Top of Page'
    },
    description: {
      bg: 'Закачено в началото за 3 дни',
      en: 'Pinned at the top for 3 days'
    },
    price: 5,
    duration: '3 дни / 3 days',
    benefits: ['📌 Закачено в началото', '🚀 5x повече импресии', '⚡ Бърза продажба'],
    icon: '📌',
    color: '#FF6B6B'
  },
  {
    type: 'instant_refresh',
    name: {
      bg: 'Моментално Обновяване',
      en: 'Instant Refresh'
    },
    description: {
      bg: 'Скокни към началото веднага',
      en: 'Jump to the top instantly'
    },
    price: 1,
    duration: 'Веднага / Instant',
    benefits: ['⚡ Моментален ефект', '🔝 Скок в началото', '🕐 Обновена дата'],
    icon: '⚡',
    color: '#4ECDC4'
  }
];

interface PromotionPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  userId: string;
  onSuccess: () => void;
}

const PaymentForm: React.FC<{
  selectedPromotion: PromotionProduct;
  listingId: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ selectedPromotion, listingId, userId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const functions = getFunctions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent on backend
      const createIntent = httpsCallable(functions, 'createPromotionPaymentIntent');
      const intentResult = await createIntent({
        listingId,
        promotionType: selectedPromotion.type,
      });

      const { clientSecret, paymentIntentId, intentDocId } = intentResult.data as {
        clientSecret: string;
        paymentIntentId: string;
        intentDocId: string;
      };

      if (!clientSecret || !intentDocId) {
        throw new Error('Failed to initialize payment');
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: userId,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        logger.error('Stripe payment error', { error: stripeError });
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        try {
          // Mark intent as succeeded so backend trigger applies promotion
          const intentRef = doc(db, `users/${userId}/promotion_intents/${intentDocId}`);
          await updateDoc(intentRef, {
            status: 'succeeded',
            paymentIntentId: paymentIntent.id || paymentIntentId,
            updatedAt: new Date(),
          });
        } catch (updateErr) {
          logger.error('Failed to update promotion intent status', { updateErr });
        }

        logger.info('Promotion purchased successfully', {
          userId,
          listingId,
          type: selectedPromotion.type,
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      logger.error('Promotion purchase error', { error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentFormContainer onSubmit={handleSubmit}>
      <CardElementWrapper>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </CardElementWrapper>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ButtonGroup>
        <CancelButton type="button" onClick={onCancel} disabled={loading}>
          {language === 'bg' ? 'Отказ' : 'Cancel'}
        </CancelButton>
        <PayButton type="submit" disabled={!stripe || loading}>
          {loading
            ? language === 'bg'
              ? 'Обработка...'
              : 'Processing...'
            : language === 'bg'
            ? `Плати ${selectedPromotion.price}€`
            : `Pay ${selectedPromotion.price}€`}
        </PayButton>
      </ButtonGroup>
    </PaymentFormContainer>
  );
};

export const PromotionPurchaseModal: React.FC<PromotionPurchaseModalProps> = ({
  isOpen,
  onClose,
  listingId,
  userId,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionProduct | null>(null);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {language === 'bg' ? '🚀 Промоция на Обявата' : '🚀 Promote Your Listing'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {!selectedPromotion ? (
          // Product Selection
          <ProductGrid>
            {PROMOTION_PRODUCTS.map((product) => (
              <ProductCard
                key={product.type}
                color={product.color}
                onClick={() => setSelectedPromotion(product)}
              >
                <ProductIcon>{product.icon}</ProductIcon>
                <ProductName>{product.name[language]}</ProductName>
                <ProductPrice>{product.price}€</ProductPrice>
                <ProductDuration>{product.duration}</ProductDuration>
                <ProductDescription>{product.description[language]}</ProductDescription>
                <BenefitsList>
                  {product.benefits.map((benefit, idx) => (
                    <BenefitItem key={idx}>{benefit}</BenefitItem>
                  ))}
                </BenefitsList>
                <SelectButton>
                  {language === 'bg' ? 'Избери' : 'Select'}
                </SelectButton>
              </ProductCard>
            ))}
          </ProductGrid>
        ) : (
          // Payment Form
          <div>
            <BackButton onClick={() => setSelectedPromotion(null)}>
              ← {language === 'bg' ? 'Назад' : 'Back'}
            </BackButton>
            <SelectedProductSummary color={selectedPromotion.color}>
              <ProductIcon>{selectedPromotion.icon}</ProductIcon>
              <div>
                <h3>{selectedPromotion.name[language]}</h3>
                <p>{selectedPromotion.description[language]}</p>
                <strong>{selectedPromotion.price}€</strong>
              </div>
            </SelectedProductSummary>
            <Elements stripe={getStripePromise()}>
              <PaymentForm
                selectedPromotion={selectedPromotion}
                listingId={listingId}
                userId={userId}
                onSuccess={handleSuccess}
                onCancel={() => setSelectedPromotion(null)}
              />
            </Elements>
          </div>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;

  &:hover {
    color: #333;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 24px;
`;

const ProductCard = styled.div<{ color: string }>`
  border: 2px solid ${(props) => props.color};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: ${(props) => props.color};
    background: ${(props) => props.color}10;
  }
`;

const ProductIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`;

const ProductName = styled.h3`
  font-size: 20px;
  margin: 8px 0;
  color: #333;
`;

const ProductPrice = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #2ecc71;
  margin: 8px 0;
`;

const ProductDuration = styled.div`
  font-size: 14px;
  color: #777;
  margin-bottom: 12px;
`;

const ProductDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin: 12px 0;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;
`;

const BenefitItem = styled.li`
  font-size: 14px;
  color: #444;
  margin: 8px 0;
  text-align: left;
`;

const SelectButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 16px;
  cursor: pointer;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const SelectedProductSummary = styled.div<{ color: string }>`
  background: ${(props) => props.color}10;
  border: 2px solid ${(props) => props.color};
  border-radius: 12px;
  padding: 20px;
  margin: 0 24px 24px;
  display: flex;
  align-items: center;
  gap: 16px;

  h3 {
    margin: 0 0 4px;
    font-size: 20px;
  }

  p {
    margin: 0 0 8px;
    color: #666;
  }

  strong {
    color: #2ecc71;
    font-size: 24px;
  }
`;

const PaymentFormContainer = styled.form`
  padding: 0 24px 24px;
`;

const CardElementWrapper = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelButton = styled.button`
  flex: 1;
  background: #f5f5f5;
  color: #333;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #e5e5e5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PayButton = styled.button`
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
