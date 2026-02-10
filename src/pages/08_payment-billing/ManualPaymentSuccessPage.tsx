/**
 * Manual Payment Success Page
 * Shows confirmation and next steps after manual payment submission
 * Theme: "Royal Night" integration
 * 
 * @since January 9, 2026
 * Updated: February 10, 2026
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, Home, Receipt, Clock, Mail, Phone, Copy, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { manualPaymentService } from '../../services/payment/manual-payment-service';
import { BANK_DETAILS } from '../../config/bank-details';
import { subscriptionTheme } from '../../components/subscription/subscription-theme';
import type { ManualPaymentTransaction } from '../../types/payment.types';
import { logger } from '../../services/logger-service';

const ManualPaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transaction, setTransaction] = useState<ManualPaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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
      if (data?.receiptUrl) {
        setUploadedUrl(data.receiptUrl);
      }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !transaction) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(language === 'bg' ? 'Файлът е твърде голям (макс 5MB)' : 'File too large (max 5MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? 'Моля качете снимка' : 'Please upload an image');
      return;
    }

    setUploading(true);
    try {
      const url = await manualPaymentService.uploadReceipt(file, transaction.id);
      setUploadedUrl(url);
      toast.success(language === 'bg' ? '✅ Разписката е качена успешно!' : '✅ Receipt uploaded successfully!');

      // Refresh transaction data
      loadTransaction();
    } catch (error) {
      logger.error('Failed to upload receipt', error as Error);
      toast.error(language === 'bg' ? 'Грешка при качване' : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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

        {/* Upload Proof Section - NEW */}
        {transaction && transaction.status === 'pending_manual_verification' && (
          <UploadCard $highlight={!uploadedUrl}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={20} />
              {language === 'bg' ? 'Качете платежно нареждане' : 'Upload Proof of Payment'}
            </CardTitle>

            <UploadDescription>
              {language === 'bg'
                ? 'За да ускорите обработката, моля прикачете снимка на платежното нареждане или скрийншот от банкирането.'
                : 'To speed up processing, please attach a photo of the payment receipt or a screenshot from your banking app.'}
            </UploadDescription>

            {uploadedUrl ? (
              <UploadedPreview>
                <ImageIcon size={48} color="#00A651" />
                <UploadedInfo>
                  <UploadedText>
                    {language === 'bg' ? '✅ Разписката е качена' : '✅ Receipt uploaded'}
                  </UploadedText>
                  <ReUploadButton onClick={triggerFileUpload} disabled={uploading}>
                    {language === 'bg' ? 'Качи друга' : 'Upload another'}
                  </ReUploadButton>
                </UploadedInfo>
              </UploadedPreview>
            ) : (
              <UploadArea onClick={triggerFileUpload}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                {uploading ? (
                  <UploadText>{language === 'bg' ? 'Качване...' : 'Uploading...'}</UploadText>
                ) : (
                  <>
                    <UploadIconWrapper>
                      <Upload size={24} />
                    </UploadIconWrapper>
                    <UploadText>
                      {language === 'bg' ? 'Натиснете тук за избор на файл' : 'Click here to select file'}
                    </UploadText>
                    <UploadSubtext>
                      {language === 'bg' ? '(Снимка, JPG, PNG - макс 5MB)' : '(Image, JPG, PNG - max 5MB)'}
                    </UploadSubtext>
                  </>
                )}
              </UploadArea>
            )}
          </UploadCard>
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
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${subscriptionTheme.colors.bg.primary};
  background-image: 
    radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 700px;
  width: 100%;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const LoadingText = styled.div`
  color: #fff;
  font-size: 1.1rem;
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
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin: 0 0 16px 0;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0 0 40px 0;
  line-height: 1.6;
`;

const DetailsCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
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
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
`;

const ReferenceValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReferenceText = styled.span`
  font-size: 1.1rem;
  color: ${subscriptionTheme.colors.text.accent};
  font-weight: 700;
  font-family: 'Courier New', monospace;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 6px;
  color: ${subscriptionTheme.colors.text.accent};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(168, 85, 247, 0.3);
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
  font-size: 0.9rem;
  font-weight: 600;
`;

/* New Upload Styles */
const UploadCard = styled(DetailsCard) <{ $highlight?: boolean }>`
    border: 2px dashed ${props => props.$highlight ? subscriptionTheme.colors.primary.main : 'rgba(255, 255, 255, 0.15)'};
    background: ${props => props.$highlight ? 'rgba(124, 58, 237, 0.05)' : 'rgba(30, 41, 59, 0.6)'};
`;

const UploadDescription = styled.p`
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 24px;
    line-height: 1.5;
`;

const UploadArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const UploadIconWrapper = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(168, 85, 247, 0.2);
    color: ${subscriptionTheme.colors.text.accent};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
`;

const UploadText = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
`;

const UploadedPreview = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(0, 166, 81, 0.1);
    border: 1px solid rgba(0, 166, 81, 0.3);
    border-radius: 12px;
`;

const UploadedInfo = styled.div`
    flex: 1;
`;

const UploadedText = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: #00A651;
    margin-bottom: 4px;
`;

const ReUploadButton = styled.button`
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;

    &:hover {
        color: #fff;
    }
`;

const StepsCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
`;

const StepsTitle = styled.h3`
  font-size: 1.25rem;
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
  background: ${subscriptionTheme.gradients.dealer};
  border-radius: 50%;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
`;

const StepDescription = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 16px;
  padding: 24px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  margin-bottom: 24px;
  color: ${subscriptionTheme.colors.text.accent};
  align-items: flex-start;
`;

const InfoText = styled.div`
  flex: 1;
`;

const InfoTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
`;

const InfoDescription = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
`;

const ContactCard = styled.div`
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-bottom: 32px;
`;

const ContactTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 12px 0;
`;

const ContactText = styled.p`
  font-size: 0.95rem;
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
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  color: ${subscriptionTheme.colors.text.accent};
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(168, 85, 247, 0.2);
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
  background: ${subscriptionTheme.gradients.dealer};
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${subscriptionTheme.shadows.glow};

  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
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
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;
