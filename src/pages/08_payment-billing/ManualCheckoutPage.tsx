/**
 * Manual Bank Transfer Checkout Page
 * Complete payment flow for manual bank transfers
 * Theme: "Royal Night" integration
 * 
 * @since January 9, 2026
 * Updated: February 10, 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { ArrowLeft, CheckCircle, AlertCircle, Loader, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import BankTransferDetails from '../../components/payment/BankTransferDetails';
import { manualPaymentService } from '../../services/payment/manual-payment-service';
import { activateFreePlan } from '../../services/billing/free-plan-activation.service';
import { usePromotionalOffer } from '../../hooks/usePromotionalOffer';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';
import { subscriptionTheme } from '../../components/subscription/subscription-theme';
import type { BankAccountType, PaymentType } from '../../types/payment.types';
import { logger } from '../../services/logger-service';

const ManualCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userProfile } = useAuth();
  const { language } = useLanguage();

  const [selectedBank, setSelectedBank] = useState<BankAccountType>('revolut');
  const [confirmedTransfer, setConfirmedTransfer] = useState(false);
  const [userReference, setUserReference] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get payment details from URL params
  const planTier = (searchParams.get('plan') as 'dealer' | 'company') || 'dealer';
  const interval = (searchParams.get('interval') as 'monthly' | 'annual') || 'monthly';
  const paymentType = (searchParams.get('type') as PaymentType) || 'subscription';
  const isPromoFromUrl = searchParams.get('promo') === 'free';

  const plan = SUBSCRIPTION_PLANS[planTier];
  const amount = interval === 'monthly' ? plan.price.monthly : plan.price.annual;

  // ✅ Promotional free offer
  const { isFreeOffer, isLoaded: promoLoaded } = usePromotionalOffer();
  const effectiveFreeOffer = isFreeOffer || isPromoFromUrl;
  const [freeActivating, setFreeActivating] = useState(false);

  // ──── FREE OFFER: auto-activate plan without payment ────
  const handleFreeActivation = async () => {
    if (!user || freeActivating) return;

    setFreeActivating(true);
    try {
      const result = await activateFreePlan({
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.displayName || user.displayName || 'Unknown',
        planTier,
      });

      if (result.success) {
        toast.success(language === 'bg'
          ? `🎉 Планът ${plan.name[language]} е активиран безплатно!`
          : `🎉 ${plan.name[language]} plan activated for free!`
        );
        navigate('/profile');
      } else if (result.error === 'FREE_OFFER_EXPIRED') {
        toast.warning(language === 'bg'
          ? 'Безплатната оферта вече не е активна. Моля, довършете плащане.'
          : 'The free offer has expired. Please complete payment.'
        );
        // Remove promo param so user sees the normal payment form
        searchParams.delete('promo');
        navigate(`/billing/manual-checkout?${searchParams.toString()}`, { replace: true });
      } else {
        toast.error(language === 'bg'
          ? 'Грешка при активиране. Моля, опитайте отново.'
          : 'Activation error. Please try again.'
        );
      }
    } catch (error) {
      logger.error('Free activation failed from ManualCheckoutPage', error as Error);
      toast.error(language === 'bg'
        ? 'Неочаквана грешка при активиране'
        : 'Unexpected activation error'
      );
    } finally {
      setFreeActivating(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error(language === 'bg' ? 'Моля, влезте в профила си' : 'Please login first');
      navigate('/login');
    }
  }, [user, navigate, language]);

  const handleConfirmPayment = async () => {
    if (!confirmedTransfer) {
      toast.error(language === 'bg'
        ? 'Моля, потвърдете че сте извършили превода'
        : 'Please confirm that you have sent the transfer');
      return;
    }

    if (!user) return;

    setIsProcessing(true);

    try {
      const result = await manualPaymentService.createTransaction({
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.displayName || user.displayName || 'Unknown User',
        amount,
        currency: 'EUR',
        paymentType,
        itemId: planTier,
        itemDescription: `${plan.name[language]} - ${interval === 'monthly' ?
          (language === 'bg' ? 'Месечен' : 'Monthly') :
          (language === 'bg' ? 'Годишен' : 'Annual')}`,
        selectedBankAccount: selectedBank,
        userConfirmedTransfer: confirmedTransfer,
        userTransferDate: new Date(),
        userProvidedReference: userReference || undefined,
        userNotes: userNotes || undefined,
        metadata: {
          planTier,
          interval,
          originalRequest: {
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (result.success) {
        logger.info('Manual payment created', {
          transactionId: result.transactionId,
          userId: user.uid,
          amount
        });

        // Redirect to success page with transaction details
        navigate(`/billing/manual-success?transactionId=${result.transactionId}&reference=${result.referenceNumber}`);
      }
    } catch (error) {
      logger.error('Failed to create manual payment', error as Error, {
        userId: user?.uid,
        amount
      });

      toast.error(language === 'bg'
        ? 'Грешка при обработка на заявката'
        : 'Error processing payment request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  // ──── FREE OFFER UI ────
  if (effectiveFreeOffer && promoLoaded) {
    return (
      <PageContainer>
        <ContentWrapper>
          <Header>
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              {language === 'bg' ? 'Назад' : 'Back'}
            </BackButton>
            <Title>{language === 'bg' ? '🎉 Безплатна активация' : '🎉 Free Activation'}</Title>
          </Header>

          <OrderSummary>
            <SummaryTitle>{language === 'bg' ? 'Безплатна оферта' : 'Free Offer'}</SummaryTitle>
            <SummaryRow>
              <SummaryLabel>{language === 'bg' ? 'План:' : 'Plan:'}</SummaryLabel>
              <SummaryValue>{plan.name[language]}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>{language === 'bg' ? 'Цена:' : 'Price:'}</SummaryLabel>
              <SummaryValue style={{ textDecoration: 'line-through', color: '#999' }}>
                €{amount.toFixed(2)}
              </SummaryValue>
            </SummaryRow>
            <Divider />
            <TotalRow>
              <TotalLabel>{language === 'bg' ? 'Ваша цена:' : 'Your Price:'}</TotalLabel>
              <TotalValue style={{ color: '#27ae60' }}>
                {language === 'bg' ? 'БЕЗПЛАТНО' : 'FREE'} €0.00
              </TotalValue>
            </TotalRow>
          </OrderSummary>

          <FreeActivationBox>
            <Gift size={40} color="#27ae60" />
            <FreeActivationText>
              {language === 'bg'
                ? 'Специална промоционална оферта! Кликнете бутона по-долу, за да активирате планът си безплатно.'
                : 'Special promotional offer! Click the button below to activate your plan for free.'}
            </FreeActivationText>
            <FreeActivateButton
              onClick={handleFreeActivation}
              disabled={freeActivating}
            >
              {freeActivating ? (
                <>
                  <Loader size={20} className="spinner" />
                  {language === 'bg' ? 'Активиране...' : 'Activating...'}
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  {language === 'bg' ? 'Активирайте безплатно' : 'Activate for Free'}
                </>
              )}
            </FreeActivateButton>
          </FreeActivationBox>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            {language === 'bg' ? 'Назад' : 'Back'}
          </BackButton>
          <Title>{language === 'bg' ? 'Плащане с банков превод' : 'Bank Transfer Payment'}</Title>
        </Header>

        {/* Order Summary */}
        <OrderSummary>
          <SummaryTitle>{language === 'bg' ? 'Обобщение на поръчката' : 'Order Summary'}</SummaryTitle>
          <SummaryRow>
            <SummaryLabel>{language === 'bg' ? 'План:' : 'Plan:'}</SummaryLabel>
            <SummaryValue>{plan.name[language]}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>{language === 'bg' ? 'Период:' : 'Billing Period:'}</SummaryLabel>
            <SummaryValue>
              {interval === 'monthly'
                ? (language === 'bg' ? 'Месечен' : 'Monthly')
                : (language === 'bg' ? 'Годишен (20% отстъпка)' : 'Annual (20% discount)')}
            </SummaryValue>
          </SummaryRow>
          <Divider />
          <TotalRow>
            <TotalLabel>{language === 'bg' ? 'Обща сума:' : 'Total Amount:'}</TotalLabel>
            <TotalValue>{amount.toFixed(2)} EUR</TotalValue>
          </TotalRow>
        </OrderSummary>

        {/* Bank Transfer Details */}
        <BankTransferContainer>
          <BankTransferDetails
            amount={amount}
            currency="EUR"
            paymentType={paymentType}
            itemId={planTier}
            onBankSelected={setSelectedBank}
            showInstructions={true}
          />
        </BankTransferContainer>

        {/* User Confirmation Form */}
        <ConfirmationForm>
          <FormTitle>{language === 'bg' ? 'Потвърждение на превода' : 'Transfer Confirmation'}</FormTitle>

          <FormField>
            <Checkbox
              type="checkbox"
              id="confirm"
              checked={confirmedTransfer}
              onChange={(e) => setConfirmedTransfer(e.target.checked)}
            />
            <CheckboxLabel htmlFor="confirm">
              {language === 'bg'
                ? 'Потвърждавам, че извърших банков превод на посочената сума'
                : 'I confirm that I have sent a bank transfer for the specified amount'}
            </CheckboxLabel>
          </FormField>

          <FormField>
            <Label>{language === 'bg' ? 'Вашият референтен номер (ако е различен):' : 'Your reference number (if different):'}</Label>
            <Input
              type="text"
              placeholder={language === 'bg' ? 'По избор' : 'Optional'}
              value={userReference}
              onChange={(e) => setUserReference(e.target.value)}
            />
          </FormField>

          <FormField>
            <Label>{language === 'bg' ? 'Допълнителни бележки:' : 'Additional notes:'}</Label>
            <TextArea
              placeholder={language === 'bg'
                ? 'Напр: Превел съм на DD/MM/YYYY от банка XYZ'
                : 'E.g: Transfer made on DD/MM/YYYY from XYZ bank'}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={3}
            />
          </FormField>

          <InfoBox>
            <AlertCircle size={20} />
            <InfoText>
              {language === 'bg'
                ? 'Вашият абонамент ще бъде активиран до 1-2 часа след като потвърдим превода.'
                : 'Your subscription will be activated within 1-2 hours after we confirm the transfer.'}
            </InfoText>
          </InfoBox>

          <SubmitButton
            onClick={handleConfirmPayment}
            disabled={!confirmedTransfer || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader size={20} className="spinner" />
                {language === 'bg' ? 'Обработва се...' : 'Processing...'}
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                {language === 'bg' ? 'Потвърди и продължи' : 'Confirm and Continue'}
              </>
            )}
          </SubmitButton>
        </ConfirmationForm>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ManualCheckoutPage;

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
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 99px;
  color: ${subscriptionTheme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-4px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const OrderSummary = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const SummaryLabel = styled.span`
  font-size: 0.95rem;
  color: ${subscriptionTheme.colors.text.secondary};
`;

const SummaryValue = styled.span`
  font-size: 0.95rem;
  color: white;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 0 0 0;
`;

const TotalLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
`;

const TotalValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${subscriptionTheme.colors.primary.light};
`;

const BankTransferContainer = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 24px;
  /* Ensure children inherit white text */
  color: white;
  
  h3 { color: white; margin-bottom: 1rem; }
  p { color: ${subscriptionTheme.colors.text.secondary}; }
`;

const ConfirmationForm = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-top: 24px;
`;

const FormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 24px 0;
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${subscriptionTheme.colors.primary.main};
`;

const CheckboxLabel = styled.label`
  margin-left: 12px;
  font-size: 0.95rem;
  color: white;
  cursor: pointer;
  user-select: none;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${subscriptionTheme.colors.text.secondary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${subscriptionTheme.colors.primary.main};
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${subscriptionTheme.colors.primary.main};
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  margin-bottom: 24px;
  color: ${subscriptionTheme.colors.text.accent};
  align-items: center;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: white;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: ${subscriptionTheme.gradients.dealer};
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${subscriptionTheme.shadows.glow};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ── Free Offer Styled Components ──

const FreeActivationBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: rgba(39, 174, 96, 0.15);
  border: 1px solid rgba(39, 174, 96, 0.4);
  border-radius: 20px;
  padding: 40px 32px;
  margin-top: 24px;
  text-align: center;
`;

const FreeActivationText = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: white;
  line-height: 1.6;
  max-width: 500px;
`;

const FreeActivateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 48px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(39, 174, 96, 0.4);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(39, 174, 96, 0.6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }
`;
