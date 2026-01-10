/**
 * Manual Bank Transfer Checkout Page
 * Complete payment flow for manual bank transfers
 * 
 * @since January 9, 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import BankTransferDetails from '../../components/payment/BankTransferDetails';
import { manualPaymentService } from '../../services/payment/manual-payment-service';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-plans';
import type { BankAccountType, PaymentType } from '../../types/payment.types';
import { logger } from '../../services/logger-service';

const ManualCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
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

  const plan = SUBSCRIPTION_PLANS[planTier];
  const amount = interval === 'monthly' ? plan.price.monthly : plan.price.annual;

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
        userName: user.displayName || 'Unknown User',
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
        <BankTransferDetails
          amount={amount}
          currency="EUR"
          paymentType={paymentType}
          itemId={planTier}
          onBankSelected={setSelectedBank}
          showInstructions={true}
        />

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

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 20px;
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
  border-radius: 8px;
  color: #fff;
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
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0;
`;

const OrderSummary = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const SummaryLabel = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const SummaryValue = styled.span`
  font-size: 14px;
  color: #fff;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin: 12px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 0 0 0;
`;

const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`;

const TotalValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #0075EB;
`;

const ConfirmationForm = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 32px;
  margin-top: 24px;
`;

const FormTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 24px 0;
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #0075EB;
`;

const CheckboxLabel = styled.label`
  margin-left: 12px;
  font-size: 15px;
  color: #fff;
  cursor: pointer;
  user-select: none;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0075EB;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0075EB;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 117, 235, 0.1);
  border: 1px solid rgba(0, 117, 235, 0.3);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #0075EB;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #0075EB, #00A651);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 117, 235, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 117, 235, 0.5);
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
