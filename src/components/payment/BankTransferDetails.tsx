/**
 * Bank Transfer Details Component
 * Premium Glassmorphism UI for Manual Payment System
 * 
 * Features:
 * - Copy to clipboard functionality
 * - Tab switching between Revolut/iCard
 * - Deep link to Revolut app
 * - Reference number generation
 * - Payment instructions
 * 
 * @since January 9, 2026
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Copy, Check, ExternalLink, CreditCard, Building2, Smartphone, Clock, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import { BANK_DETAILS, generatePaymentReference, PAYMENT_INSTRUCTIONS } from '../../config/bank-details';
import type { BankAccountType } from '../../types/payment.types';

// ─── Official Payment Provider Brand Assets ───────────────────────────────────
// Logos via Clearbit Logo API — serves each company's canonical registered logo
const REVOLUT_LOGO_URL = 'https://logo.clearbit.com/revolut.com';
const ICARD_LOGO_URL   = 'https://logo.clearbit.com/icard.com';

interface BankTransferDetailsProps {
  amount: number;
  currency?: 'EUR' | 'BGN';
  paymentType: 'subscription' | 'promotion' | 'listing';
  itemId: string;
  onBankSelected?: (bank: BankAccountType) => void;
  showInstructions?: boolean;
}

const BankTransferDetails: React.FC<BankTransferDetailsProps> = ({
  amount,
  currency = 'EUR',
  paymentType,
  itemId,
  onBankSelected,
  showInstructions = true
}) => {
  const { language } = useLanguage();
  const [selectedBank, setSelectedBank] = useState<BankAccountType>('revolut');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});

  const referenceNumber = generatePaymentReference(paymentType, itemId);
  const bankDetails = selectedBank === 'revolut' ? BANK_DETAILS.revolut : BANK_DETAILS.icard;
  const instructions = language === 'bg' ? PAYMENT_INSTRUCTIONS.bg : PAYMENT_INSTRUCTIONS.en;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(language === 'bg' ? 'Копирано!' : 'Copied!', {
        autoClose: 2000,
        position: 'top-center'
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error(language === 'bg' ? 'Грешка при копиране' : 'Failed to copy');
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

  return (
    <Container>
      {/* Bank Selection Tabs */}
      <BankTabs>
        <BankTab
          $active={selectedBank === 'revolut'}
          $bank="revolut"
          onClick={() => handleBankSwitch('revolut')}
        >
          {logoError['revolut-tab'] ? (
            <CreditCard size={22} />
          ) : (
            <BankTabLogo
              src={REVOLUT_LOGO_URL}
              alt="Revolut"
              onError={() => setLogoError(prev => ({ ...prev, 'revolut-tab': true }))}
            />
          )}
          <span>Revolut</span>
          <Badge $color="#0075EB">{language === 'bg' ? 'Моментален' : 'Instant'}</Badge>
        </BankTab>
        <BankTab
          $active={selectedBank === 'icard'}
          $bank="icard"
          onClick={() => handleBankSwitch('icard')}
        >
          {logoError['icard-tab'] ? (
            <Building2 size={22} />
          ) : (
            <BankTabLogo
              src={ICARD_LOGO_URL}
              alt="iCard"
              onError={() => setLogoError(prev => ({ ...prev, 'icard-tab': true }))}
            />
          )}
          <span>iCard</span>
          <Badge $color="#00A651">{language === 'bg' ? 'Местен' : 'Local'}</Badge>
        </BankTab>
      </BankTabs>

      {/* Bank Details Card */}
      <BankCard $bank={selectedBank}>
        <CardHeader>
          <BankLogo $bank={selectedBank}>
            {logoError[`${selectedBank}-card`] ? (
              selectedBank === 'revolut' ? <CreditCard size={32} color="#0075EB" /> : <Building2 size={32} color="#00A651" />
            ) : (
              <img
                src={selectedBank === 'revolut' ? REVOLUT_LOGO_URL : ICARD_LOGO_URL}
                alt={selectedBank === 'revolut' ? 'Revolut' : 'iCard'}
                onError={() => setLogoError(prev => ({ ...prev, [`${selectedBank}-card`]: true }))}
              />
            )}
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
            <ValueText $selectable>{bankDetails.iban}</ValueText>
            <CopyButton onClick={() => handleCopy(bankDetails.iban, 'iban')}>
              {copiedField === 'iban' ? <Check size={16} /> : <Copy size={16} />}
            </CopyButton>
          </DetailValue>
        </DetailRow>

        {/* BIC/SWIFT */}
        <DetailRow>
          <DetailLabel>BIC/SWIFT</DetailLabel>
          <DetailValue>
            <ValueText $selectable>{bankDetails.bic}</ValueText>
            <CopyButton onClick={() => handleCopy(bankDetails.bic, 'bic')}>
              {copiedField === 'bic' ? <Check size={16} /> : <Copy size={16} />}
            </CopyButton>
          </DetailValue>
        </DetailRow>

        {/* Beneficiary */}
        <DetailRow>
          <DetailLabel>{language === 'bg' ? 'Получател' : 'Beneficiary'}</DetailLabel>
          <DetailValue>
            <ValueText $selectable>{bankDetails.beneficiary}</ValueText>
            <CopyButton onClick={() => handleCopy(bankDetails.beneficiary, 'beneficiary')}>
              {copiedField === 'beneficiary' ? <Check size={16} /> : <Copy size={16} />}
            </CopyButton>
          </DetailValue>
        </DetailRow>

        {/* Reference Number (CRITICAL) */}
        <ReferenceSection>
          <ReferenceLabel>
            <Info size={16} />
            {language === 'bg' ? 'Референтен номер (ЗАДЪЛЖИТЕЛНО)' : 'Reference Number (REQUIRED)'}
          </ReferenceLabel>
          <ReferenceValue>
            <ReferenceText $selectable>{referenceNumber}</ReferenceText>
            <CopyButton $primary onClick={() => handleCopy(referenceNumber, 'reference')}>
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
      </ContactInfo>
    </Container>
  );
};

export default BankTransferDetails;

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

const BankTab = styled.button<{ $active: boolean; $bank: 'revolut' | 'icard' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  background: ${({ $active, $bank }) =>
    !$active
      ? 'rgba(255,255,255,0.04)'
      : $bank === 'revolut'
      ? 'linear-gradient(135deg, rgba(0,117,235,0.28) 0%, rgba(0,40,110,0.22) 100%)'
      : 'linear-gradient(135deg, rgba(0,166,81,0.28) 0%, rgba(0,70,36,0.22) 100%)'};
  border: 2px solid ${({ $active, $bank }) =>
    !$active
      ? 'rgba(255,255,255,0.1)'
      : $bank === 'revolut'
      ? '#0075EB'
      : '#00A651'};
  border-radius: 12px;
  color: ${({ $active }) => ($active ? '#fff' : 'rgba(255,255,255,0.65)')};
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.07), transparent);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.25s ease;
  }

  &:hover {
    border-color: ${({ $bank }) =>
      $bank === 'revolut' ? 'rgba(0,117,235,0.8)' : 'rgba(0,166,81,0.8)'};
    transform: translateY(-2px);
    background: ${({ $bank }) =>
      $bank === 'revolut'
        ? 'linear-gradient(135deg, rgba(0,117,235,0.35) 0%, rgba(0,40,110,0.28) 100%)'
        : 'linear-gradient(135deg, rgba(0,166,81,0.35) 0%, rgba(0,70,36,0.28) 100%)'};
  }

  span {
    flex: 1;
    text-align: left;
  }
`;

const BankTabLogo = styled.img`
  height: 28px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 6px;
`;

const Badge = styled.span<{ $color: string }>`
  padding: 4px 12px;
  background: ${props => props.$color}22;
  border: 1px solid ${props => props.$color};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$color};
  white-space: nowrap;
`;

const BankCard = styled.div<{ $bank: 'revolut' | 'icard' }>`
  background: ${({ $bank }) =>
    $bank === 'revolut'
      ? 'linear-gradient(145deg, rgba(0, 7, 24, 0.94) 0%, rgba(0, 117, 235, 0.18) 55%, rgba(0, 5, 20, 0.96) 100%)'
      : 'linear-gradient(145deg, rgba(0, 12, 6, 0.92) 0%, rgba(0, 166, 81, 0.20) 55%, rgba(0, 10, 5, 0.96) 100%)'};
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid ${({ $bank }) =>
    $bank === 'revolut' ? 'rgba(0, 117, 235, 0.30)' : 'rgba(0, 166, 81, 0.30)'};
  border-radius: 24px;
  padding: 32px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 0 1px ${({ $bank }) =>
      $bank === 'revolut' ? 'rgba(0, 117, 235, 0.15)' : 'rgba(0, 166, 81, 0.15)'};
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BankLogo = styled.div<{ $bank: 'revolut' | 'icard' }>`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bank }) =>
    $bank === 'revolut'
      ? 'rgba(0,117,235,0.18)'
      : 'rgba(0,166,81,0.18)'};
  border-radius: 16px;
  border: 2px solid ${({ $bank }) =>
    $bank === 'revolut' ? 'rgba(0,117,235,0.55)' : 'rgba(0,166,81,0.55)'};
  box-shadow: 0 0 16px ${({ $bank }) =>
    $bank === 'revolut' ? 'rgba(0,117,235,0.25)' : 'rgba(0,166,81,0.25)'};
  overflow: hidden;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: 8px;
  }
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

const ValueText = styled.span<{ $selectable?: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  font-family: 'Courier New', monospace;
  user-select: ${props => props.$selectable ? 'all' : 'none'};
  cursor: ${props => props.$selectable ? 'text' : 'default'};
  flex: 1;
`;

const CopyButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #0075EB, #00A651)'
    : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$primary 
    ? 'rgba(0, 117, 235, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.$primary 
      ? 'linear-gradient(135deg, #0085FF, #00B65E)'
      : 'rgba(255, 255, 255, 0.2)'};
  }

  &:active {
    transform: scale(0.95);
  }
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

const ReferenceText = styled.span<{ $selectable?: boolean }>`
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
