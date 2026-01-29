/**
 * Manual Payment Success Page
 * Shows confirmation and next steps after manual payment submission
 * 
 * @since January 9, 2026
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, Home, Receipt, Clock, Mail, Phone, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { manualPaymentService } from '../../services/payment/manual-payment-service';
import { BANK_DETAILS } from '../../config/bank-details';
import type { ManualPaymentTransaction } from '../../types/payment.types';
import { logger } from '../../services/logger-service';

const ManualPaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<ManualPaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const transactionId = searchParams.get('transactionId');
  const referenceNumber = searchParams.get('reference');

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    } else {
      setLoading(false);
    }
  }, [transactionId]);

  const loadTransaction = async () => {
    if (!transactionId) return;

    try {
      const data = await manualPaymentService.getTransaction(transactionId);
      setTransaction(data);
    } catch (error) {
      logger.error('Failed to load transaction', error, { transactionId, userId: user?.uid });
      toast.error(language === 'bg' ? 'Грешка при зареждане на плащането' : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReference = async () => {
    if (!referenceNumber) return;

    try {
      await navigator.clipboard.writeText(referenceNumber);
      setCopied(true);
      toast.success(language === 'bg' ? 'Копирано!' : 'Copied!', {
        autoClose: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(language === 'bg' ? 'Грешка при копиране' : 'Failed to copy');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingText>{language === 'bg' ? 'Зареждане...' : 'Loading...'}</LoadingText>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <SuccessIcon>
          <CheckCircle size={64} strokeWidth={2} />
        </SuccessIcon>

        <Title>
          {language === 'bg' 
            ? '🎉 Заявката е получена успешно!'
            : '🎉 Payment Request Received!'}
        </Title>

        <Subtitle>
          {language === 'bg'
            ? 'Благодарим ви! Ще обработим вашето плащане в най-кратък срок.'
            : 'Thank you! We will process your payment as soon as possible.'}
        </Subtitle>

        {/* Transaction Details Card */}
        {transaction && (
          <DetailsCard>
            <CardTitle>{language === 'bg' ? 'Детайли на транзакцията' : 'Transaction Details'}</CardTitle>
            
            <DetailRow>
              <DetailLabel>{language === 'bg' ? 'Референтен номер:' : 'Reference Number:'}</DetailLabel>
              <ReferenceValue>
                <ReferenceText>{referenceNumber || transaction.referenceNumber}</ReferenceText>
                <CopyButton onClick={handleCopyReference}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </CopyButton>
              </ReferenceValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>{language === 'bg' ? 'Сума:' : 'Amount:'}</DetailLabel>
              <DetailValue>{transaction.amount.toFixed(2)} {transaction.currency}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>{language === 'bg' ? 'Описание:' : 'Description:'}</DetailLabel>
              <DetailValue>{transaction.itemDescription}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>{language === 'bg' ? 'Избрана банка:' : 'Selected Bank:'}</DetailLabel>
              <DetailValue>
                {transaction.selectedBankAccount === 'revolut' ? 'Revolut' : 'iCard'}
              </DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>{language === 'bg' ? 'Статус:' : 'Status:'}</DetailLabel>
              <StatusBadge status={transaction.status}>
                {language === 'bg' ? 'В обработка' : 'Processing'}
              </StatusBadge>
            </DetailRow>
          </DetailsCard>
        )}

        {/* Next Steps */}
        <StepsCard>
          <StepsTitle>
            {language === 'bg' ? '📋 Какво следва?' : '📋 What happens next?'}
          </StepsTitle>

          <StepsList>
            <StepItem>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>
                  {language === 'bg' ? 'Потвърждение на превода' : 'Transfer Confirmation'}
                </StepTitle>
                <StepDescription>
                  {language === 'bg'
                    ? 'Нашият екип ще провери вашия банков превод в рамките на 1-2 часа'
                    : 'Our team will verify your bank transfer within 1-2 hours'}
                </StepDescription>
              </StepContent>
            </StepItem>

            <StepItem>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>
                  {language === 'bg' ? 'Имейл потвърждение' : 'Email Confirmation'}
                </StepTitle>
                <StepDescription>
                  {language === 'bg'
                    ? 'Ще получите имейл с потвърждение след като преводът бъде проверен'
                    : 'You will receive an email confirmation once the transfer is verified'}
                </StepDescription>
              </StepContent>
            </StepItem>

            <StepItem>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>
                  {language === 'bg' ? 'Активиране на абонамент' : 'Subscription Activation'}
                </StepTitle>
                <StepDescription>
                  {language === 'bg'
                    ? 'Вашият абонамент ще бъде активиран автоматично след потвърждение'
                    : 'Your subscription will be activated automatically after confirmation'}
                </StepDescription>
              </StepContent>
            </StepItem>
          </StepsList>
        </StepsCard>

        {/* Processing Time Info */}
        <InfoBox>
          <Clock size={20} />
          <InfoText>
            <InfoTitle>
              {language === 'bg' ? 'Време за обработка' : 'Processing Time'}
            </InfoTitle>
            <InfoDescription>
              {language === 'bg'
                ? 'Обикновено обработваме плащанията в рамките на 1-2 часа. В работни дни (понеделник-петък) времето може да е още по-кратко.'
                : 'We typically process payments within 1-2 hours. On business days (Monday-Friday), processing may be even faster.'}
            </InfoDescription>
          </InfoText>
        </InfoBox>

        {/* Contact Support */}
        <ContactCard>
          <ContactTitle>
            {language === 'bg' ? '💬 Нуждаете се от помощ?' : '💬 Need Help?'}
          </ContactTitle>
          <ContactText>
            {language === 'bg'
              ? 'Ако имате въпроси или проблеми, моля свържете се с нас:'
              : 'If you have any questions or issues, please contact us:'}
          </ContactText>
          <ContactButtons>
            <ContactButton href={`tel:${BANK_DETAILS.contact.phone}`}>
              <Phone size={18} />
              {BANK_DETAILS.contact.phone}
            </ContactButton>
            <ContactButton href={`mailto:${BANK_DETAILS.contact.email}`}>
              <Mail size={18} />
              {BANK_DETAILS.contact.email}
            </ContactButton>
          </ContactButtons>
        </ContactCard>

        {/* Action Buttons */}
        <ButtonGroup>
          <PrimaryButton onClick={() => navigate('/')}>
            <Home size={20} />
            {language === 'bg' ? 'Към начална страница' : 'Go to Home'}
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/profile')}>
            <Receipt size={20} />
            {language === 'bg' ? 'Моят профил' : 'My Profile'}
          </SecondaryButton>
        </ButtonGroup>
      </ContentWrapper>
    </PageContainer>
  );
};

export default ManualPaymentSuccessPage;

// ============================================================================
// ANIMATIONS
// ============================================================================

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  max-width: 700px;
  width: 100%;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const LoadingText = styled.div`
  color: #fff;
  font-size: 18px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00A651, #00B65E);
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 166, 81, 0.4);
  animation: ${scaleIn} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin: 0 0 16px 0;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 40px 0;
  line-height: 1.6;
`;

const DetailsCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 24px 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 16px;
  color: #fff;
  font-weight: 600;
`;

const ReferenceValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReferenceText = styled.span`
  font-size: 16px;
  color: #FFC107;
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  border-radius: 6px;
  color: #FFC107;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 193, 7, 0.3);
    transform: scale(1.1);
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 6px 16px;
  background: ${props => props.status === 'pending_manual_verification' 
    ? 'rgba(255, 193, 7, 0.2)'
    : 'rgba(0, 166, 81, 0.2)'};
  border: 1px solid ${props => props.status === 'pending_manual_verification'
    ? 'rgba(255, 193, 7, 0.5)'
    : 'rgba(0, 166, 81, 0.5)'};
  border-radius: 20px;
  color: ${props => props.status === 'pending_manual_verification' ? '#FFC107' : '#00A651'};
  font-size: 14px;
  font-weight: 600;
`;

const StepsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
`;

const StepsTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 24px 0;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StepItem = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const StepNumber = styled.div`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0075EB, #00A651);
  border-radius: 50%;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
`;

const StepDescription = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(0, 117, 235, 0.1);
  border: 1px solid rgba(0, 117, 235, 0.3);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #0075EB;
`;

const InfoText = styled.div`
  flex: 1;
`;

const InfoTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
`;

const InfoDescription = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const ContactCard = styled.div`
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 32px;
`;

const ContactTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
`;

const ContactText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
`;

const ContactButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 117, 235, 0.2);
  border: 1px solid rgba(0, 117, 235, 0.4);
  border-radius: 8px;
  color: #0075EB;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 117, 235, 0.3);
    border-color: rgba(0, 117, 235, 0.6);
    transform: translateY(-2px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #0075EB, #00A651);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 117, 235, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 117, 235, 0.5);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;
