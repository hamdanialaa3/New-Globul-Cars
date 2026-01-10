/**
 * Enhanced Bank Transfer Details Component
 * Premium Glassmorphism UI with Trust & Verification Features
 * 
 * ✅ NEW FEATURES:
 * - Receipt Upload (Screenshot/Photo)
 * - WhatsApp Instant Proof
 * - BLINK Badge for iCard
 * - Privacy-aware address display
 * 
 * @since January 9, 2026
 */

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { 
  Copy, Check, ExternalLink, CreditCard, Building2, Smartphone, Clock, Info,
  Upload, Image, MessageCircle, Zap, Eye, EyeOff, Camera
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import { BANK_DETAILS, generatePaymentReference, PAYMENT_INSTRUCTIONS, PAYMENT_METHODS } from '../../config/bank-details';
import type { BankAccountType } from '../../types/payment.types';

interface EnhancedBankTransferDetailsProps {
  amount: number;
  currency?: 'EUR' | 'BGN';
  paymentType: 'subscription' | 'promotion' | 'listing';
  itemId: string;
  onBankSelected?: (bank: BankAccountType) => void;
  onReceiptUpload?: (file: File) => void;
  onWhatsAppSend?: () => void;
  showInstructions?: boolean;
}

const EnhancedBankTransferDetails: React.FC<EnhancedBankTransferDetailsProps> = ({
  amount,
  currency = 'EUR',
  paymentType,
  itemId,
  onBankSelected,
  onReceiptUpload,
  onWhatsAppSend,
  showInstructions = true
}) => {
  const { language } = useLanguage();
  const [selectedBank, setSelectedBank] = useState<BankAccountType>('revolut');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAddress, setShowAddress] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const referenceNumber = generatePaymentReference(paymentType, itemId);
  const bankDetails = selectedBank === 'revolut' ? BANK_DETAILS.revolut : BANK_DETAILS.icard;
  const instructions = language === 'bg' ? PAYMENT_INSTRUCTIONS.bg : PAYMENT_INSTRUCTIONS.en;
  const whatsappMethod = PAYMENT_METHODS.whatsapp_proof;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(language === 'bg' ? '✅ Копирано!' : '✅ Copied!', {
        autoClose: 2000,
        position: 'top-center'
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error(language === 'bg' ? '❌ Грешка при копиране' : '❌ Failed to copy');
    }
  };

  const handleBankSwitch = (bank: BankAccountType) => {
    setSelectedBank(bank);
    onBankSelected?.(bank);
  };

  const handleRevolutDeepLink = () => {
    const revtag = BANK_DETAILS.revolut.revtag?.replace('@', '');
    window.open(`https://revolut.me/${revtag}`, '_blank');
  };

  const handleWhatsAppProof = () => {
    const whatsappLink = whatsappMethod.whatsappLink(referenceNumber);
    window.open(whatsappLink, '_blank');
    onWhatsAppSend?.();
    toast.success(
      language === 'bg' 
        ? '📱 WhatsApp отворен! Изпратете вашето доказателство за плащане.'
        : '📱 WhatsApp opened! Send your payment proof.',
      { autoClose: 5000 }
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? '❌ Моля, качете изображение' : '❌ Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bg' ? '❌ Файлът е твърде голям (макс. 5MB)' : '❌ File too large (max 5MB)');
      return;
    }

    setUploadedReceipt(file);
    onReceiptUpload?.(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast.success(
      language === 'bg' 
        ? '✅ Разписката е качена! Това ще ускори проверката.'
        : '✅ Receipt uploaded! This will speed up verification.',
      { autoClose: 3000 }
    );
  };

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment' as any; // Mobile camera
      fileInputRef.current.click();
    }
  };

  return (
    <Container>
      {/* Bank Selection Tabs */}
      <BankTabs>
        <BankTab
          active={selectedBank === 'revolut'}
          onClick={() => handleBankSwitch('revolut')}
        >
          <CreditCard size={20} />
          <span>Revolut</span>
          <Badge color="#0075EB">{language === 'bg' ? 'Моментален' : 'Instant'}</Badge>
        </BankTab>
        <BankTab
          active={selectedBank === 'icard'}
          onClick={() => handleBankSwitch('icard')}
        >
          <Building2 size={20} />
          <span>iCard</span>
          <Badge color="#00A651">{language === 'bg' ? 'Местен' : 'Local'}</Badge>
          {bankDetails.supportsInstant && (
            <BlinkBadge>
              <Zap size={12} />
              BLINK
            </BlinkBadge>
          )}
        </BankTab>
      </BankTabs>

      {/* BLINK Instant Badge for iCard */}
      {selectedBank === 'icard' && bankDetails.supportsInstant && (
        <BlinkNotice>
          <Zap size={18} color="#FFC107" />
          <BlinkText>
            <strong>{bankDetails.instantBadge?.[language]}</strong>
            <br />
            {language === 'bg' 
              ? 'Превод в рамките на 10 секунди за бързо активиране!' 
              : 'Transfer within 10 seconds for quick activation!'}
          </BlinkText>
        </BlinkNotice>
      )}

      {/* Bank Details Card */}
      <BankCard>
        <CardHeader>
          <BankLogo>
            {selectedBank === 'revolut' ? <CreditCard size={32} /> : <Building2 size={32} />}
          </BankLogo>
          <BankInfo>
            <BankName>{bankDetails.bankName}</BankName>
            <BankLabel>{bankDetails.label[language]}</BankLabel>
          </BankInfo>
        </CardHeader>

        <Divider />

        {/* Amount to Transfer */}
        <AmountSection>
          <AmountLabel>{language === 'bg' ? 'Сума за превод:' : 'Amount to transfer:'}</AmountLabel>
          <Amount>
            {amount.toFixed(2)} {currency}
          </Amount>
        </AmountSection>

        <Divider />

        {/* IBAN */}
        <DetailRow>
          <DetailLabel>IBAN</DetailLabel>
          <DetailValue>
            <ValueText selectable>{bankDetails.iban}</ValueText>
            <CopyButton onClick={() => handleCopy(bankDetails.iban, 'iban')}>
              {copiedField === 'iban' ? <Check size={16} /> : <Copy size={16} />}
            </CopyButton>
          </DetailValue>
        </DetailRow>

        {/* BIC/SWIFT */}
        <DetailRow>
          <DetailLabel>BIC/SWIFT</DetailLabel>
          <DetailValue>
            <ValueText selectable>{bankDetails.bic}</ValueText>
            <CopyButton onClick={() => handleCopy(bankDetails.bic, 'bic')}>
              {copiedField === 'bic' ? <Check size={16} /> : <Copy size={16} />}
            </CopyButton>
          </DetailValue>
        </DetailRow>

        {/* Beneficiary */}
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Получател' : 'Beneficiary'}</DetailLabel>
          <DetailValue>
            <ValueText selectable>{bankDetails.beneficiary}</ValueText>
            <CopyButton onClick={() => handleCopy(bankDetails.beneficiary, 'beneficiary')}>
              {copiedField === 'beneficiary' ? <Check size={16} /> : <Copy size={16} />}
            </CopyButton>
          </DetailValue>
        </DetailRow>

        {/* Beneficiary Address (Toggleable for Privacy) */}
        <AddressToggle onClick={() => setShowAddress(!showAddress)}>
          {showAddress ? <EyeOff size={16} /> : <Eye size={16} />}
          {language === 'bg' ? 'Адрес на получателя' : 'Beneficiary Address'}
          {!showAddress && (
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              {language === 'bg' ? '(Кликнете за показване)' : '(Click to show)'}
            </span>
          )}
        </AddressToggle>
        {showAddress && (
          <AddressText>
            {bankDetails.address}
          </AddressText>
        )}

        {/* Reference Number (CRITICAL) */}
        <ReferenceSection>
          <ReferenceLabel>
            <Info size={16} />
            {language === 'bg' ? 'Референтен номер (ЗАДЪЛЖИТЕЛНО)' : 'Reference Number (REQUIRED)'}
          </ReferenceLabel>
          <ReferenceValue>
            <ReferenceText selectable>{referenceNumber}</ReferenceText>
            <CopyButton primary onClick={() => handleCopy(referenceNumber, 'reference')}>
              {copiedField === 'reference' ? <Check size={18} /> : <Copy size={18} />}
            </CopyButton>
          </ReferenceValue>
          <ReferenceNote>
            {language === 'bg' 
              ? '⚠️ Моля, включете този номер в описанието на превода!'
              : '⚠️ Please include this number in the transfer description!'}
          </ReferenceNote>
        </ReferenceSection>

        {/* Processing Time */}
        <ProcessingTime>
          <Clock size={16} />
          <span>{bankDetails.processingTime[language]}</span>
        </ProcessingTime>

        {/* Revolut Deep Link */}
        {selectedBank === 'revolut' && (
          <RevolutButton onClick={handleRevolutDeepLink}>
            <Smartphone size={20} />
            {language === 'bg' ? 'Плати с Revolut приложение' : 'Pay with Revolut App'}
            <ExternalLink size={16} />
          </RevolutButton>
        )}
      </BankCard>

      {/* 🆕 TRUST ENHANCEMENTS SECTION */}
      <TrustSection>
        <TrustTitle>
          {language === 'bg' ? '🛡️ Ускорете вашата проверка' : '🛡️ Speed Up Your Verification'}
        </TrustTitle>

        {/* Receipt Upload */}
        <UploadCard>
          <UploadHeader>
            <Upload size={20} />
            <UploadLabel>
              {language === 'bg' 
                ? 'Качете разписка за плащане (незадължително)'
                : 'Upload Payment Receipt (Optional)'}
            </UploadLabel>
          </UploadHeader>
          <UploadDescription>
            {language === 'bg'
              ? 'Качете снимка или screenshot на вашия банков превод за моментална проверка'
              : 'Upload a photo or screenshot of your bank transfer for instant verification'}
          </UploadDescription>
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          <UploadButtons>
            <UploadButton onClick={() => fileInputRef.current?.click()}>
              <Image size={18} />
              {language === 'bg' ? 'Изберете файл' : 'Choose File'}
            </UploadButton>
            <UploadButton mobile onClick={handleCapture}>
              <Camera size={18} />
              {language === 'bg' ? 'Направете снимка' : 'Take Photo'}
            </UploadButton>
          </UploadButtons>

          {uploadedReceipt && receiptPreview && (
            <ReceiptPreview>
              <PreviewImage src={receiptPreview} alt="Receipt preview" />
              <PreviewInfo>
                <Check size={16} color="#00A651" />
                {uploadedReceipt.name} ({(uploadedReceipt.size / 1024).toFixed(1)} KB)
              </PreviewInfo>
            </ReceiptPreview>
          )}
        </UploadCard>

        {/* WhatsApp Instant Proof */}
        <WhatsAppCard>
          <WhatsAppHeader>
            <MessageCircle size={24} color="#25D366" />
            <WhatsAppTitle>
              {language === 'bg' 
                ? 'WhatsApp Моментално Активиране'
                : 'WhatsApp Instant Activation'}
            </WhatsAppTitle>
          </WhatsAppHeader>
          <WhatsAppDescription>
            {language === 'bg'
              ? 'Изпратете доказателство за плащане директно по WhatsApp за активиране в рамките на минути!'
              : 'Send payment proof directly via WhatsApp for activation within minutes!'}
          </WhatsAppDescription>
          <WhatsAppButton onClick={handleWhatsAppProof}>
            <MessageCircle size={20} />
            {language === 'bg' ? 'Изпрати по WhatsApp' : 'Send via WhatsApp'}
            <ExternalLink size={16} />
          </WhatsAppButton>
          <WhatsAppPhone>
            📞 {BANK_DETAILS.contact.phone}
          </WhatsAppPhone>
        </WhatsAppCard>
      </TrustSection>

      {/* Instructions */}
      {showInstructions && (
        <Instructions>
          <InstructionsTitle>{instructions.title}</InstructionsTitle>
          <InstructionsList>
            {instructions.steps.map((step, index) => (
              <InstructionItem key={index}>
                <StepNumber>{index + 1}</StepNumber>
                <StepText>{step}</StepText>
              </InstructionItem>
            ))}
          </InstructionsList>
          <InstructionsNote>{instructions.note}</InstructionsNote>
        </Instructions>
      )}

      {/* Contact Info */}
      <ContactInfo>
        <ContactLabel>{language === 'bg' ? 'Нужна помощ?' : 'Need help?'}</ContactLabel>
        <ContactDetails>
          <ContactItem href={`tel:${BANK_DETAILS.contact.phone}`}>
            📞 {BANK_DETAILS.contact.phone}
          </ContactItem>
          <ContactItem href={`mailto:${BANK_DETAILS.contact.email}`}>
            📧 {BANK_DETAILS.contact.email}
          </ContactItem>
        </ContactDetails>
        <ContactAddress>
          <strong>{language === 'bg' ? 'Офис:' : 'Office:'}</strong> {BANK_DETAILS.contact.workAddress[language]}
        </ContactAddress>
      </ContactInfo>
    </Container>
  );
};

export default EnhancedBankTransferDetails;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const BankTabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const BankTab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(0, 117, 235, 0.2), rgba(0, 166, 81, 0.2))'
    : 'transparent'};
  border: 2px solid ${props => props.active 
    ? 'rgba(0, 117, 235, 0.5)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    opacity: ${props => props.active ? 1 : 0};
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: rgba(0, 117, 235, 0.7);
    transform: translateY(-2px);
  }

  svg {
    flex-shrink: 0;
  }

  span {
    flex: 1;
    text-align: left;
  }
`;

const Badge = styled.span<{ color: string }>`
  padding: 4px 12px;
  background: ${props => props.color}22;
  border: 1px solid ${props => props.color};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
  white-space: nowrap;
`;

const BlinkBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #FFC107, #FF9800);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.5px;
`;

const BlinkNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.15));
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 193, 7, 0.5);
  border-radius: 12px;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { border-color: rgba(255, 193, 7, 0.5); }
    50% { border-color: rgba(255, 193, 7, 0.8); }
  }
`;

const BlinkText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
`;

const BankCard = styled.div`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.08) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BankLogo = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 117, 235, 0.2), rgba(0, 166, 81, 0.2));
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
`;

const BankInfo = styled.div`
  flex: 1;
`;

const BankName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
`;

const BankLabel = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  margin: 24px 0;
`;

const AmountSection = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(0, 117, 235, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(0, 117, 235, 0.3);
`;

const AmountLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
`;

const Amount = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -1px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-of-type {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
`;

const DetailValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ValueText = styled.span<{ selectable?: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  font-family: 'Courier New', monospace;
  user-select: ${props => props.selectable ? 'all' : 'none'};
  cursor: ${props => props.selectable ? 'text' : 'default'};
  flex: 1;
`;

const CopyButton = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #0075EB, #00A651)'
    : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.primary 
    ? 'rgba(0, 117, 235, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.primary 
      ? 'linear-gradient(135deg, #0085FF, #00B65E)'
      : 'rgba(255, 255, 255, 0.2)'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AddressToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  margin: 16px 0 8px 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const AddressText = styled.div`
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
  line-height: 1.6;
`;

const ReferenceSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.15));
  border: 2px solid rgba(255, 193, 7, 0.5);
  border-radius: 16px;
`;

const ReferenceLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #FFC107;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReferenceValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ReferenceText = styled.span<{ selectable?: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  font-family: 'Courier New', monospace;
  user-select: all;
  cursor: text;
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

const ReferenceNote = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-weight: 500;
`;

const ProcessingTime = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px;
  background: rgba(0, 166, 81, 0.1);
  border: 1px solid rgba(0, 166, 81, 0.3);
  border-radius: 12px;
  font-size: 14px;
  color: #00A651;
  font-weight: 500;
`;

const RevolutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  margin-top: 20px;
  background: linear-gradient(135deg, #0075EB, #0095FF);
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

  &:active {
    transform: translateY(0);
  }
`;

// 🆕 TRUST ENHANCEMENTS STYLES
const TrustSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TrustTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
`;

const UploadCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 166, 81, 0.1), rgba(0, 117, 235, 0.1));
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(0, 166, 81, 0.4);
  border-radius: 16px;
  padding: 24px;
`;

const UploadHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const UploadLabel = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const UploadDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const UploadButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const UploadButton = styled.button<{ mobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.mobile 
    ? 'linear-gradient(135deg, #0075EB, #00A651)'
    : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.mobile 
    ? 'rgba(0, 117, 235, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.mobile 
      ? 'linear-gradient(135deg, #0085FF, #00B65E)'
      : 'rgba(255, 255, 255, 0.15)'};
  }

  @media (min-width: 768px) {
    ${props => props.mobile && `display: none;`}
  }
`;

const ReceiptPreview = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const PreviewInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
`;

const WhatsAppCard = styled.div`
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(37, 211, 102, 0.05));
  backdrop-filter: blur(10px);
  border: 2px solid rgba(37, 211, 102, 0.3);
  border-radius: 16px;
  padding: 24px;
`;

const WhatsAppHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const WhatsAppTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const WhatsAppDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const WhatsAppButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const WhatsAppPhone = styled.div`
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const Instructions = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
`;

const InstructionsTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`;

const InstructionsList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InstructionItem = styled.li`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const StepNumber = styled.div`
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0075EB, #00A651);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const StepText = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  flex: 1;
`;

const InstructionsNote = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #FFC107;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const ContactInfo = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ContactLabel = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
`;

const ContactDetails = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ContactItem = styled.a`
  font-size: 14px;
  color: #0075EB;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #00A651;
    text-decoration: underline;
  }
`;

const ContactAddress = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
`;
