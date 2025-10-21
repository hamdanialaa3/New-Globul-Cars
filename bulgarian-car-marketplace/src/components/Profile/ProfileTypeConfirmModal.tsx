// src/components/Profile/ProfileTypeConfirmModal.tsx
// Profile Type Confirmation Modal with Terms & Conditions
// ⚡ Shows requirements and limits for each profile type

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { X, AlertCircle, Check, User, Building2, Store } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ProfileType } from '../../contexts/ProfileTypeContext';

interface ProfileTypeConfirmModalProps {
  isOpen: boolean;
  newType: ProfileType;
  onConfirm: () => void;
  onCancel: () => void;
}

// Terms data for each profile type
const PROFILE_TERMS = {
  private: {
    icon: User,
    titleBg: 'Частно лице - Условия',
    titleEn: 'Private Individual - Terms',
    descriptionBg: 'Продажба на лични превозни средства като частно лице',
    descriptionEn: 'Selling personal vehicles as a private individual',
    limitsBg: [
      '✓ Максимум 3 активни обяви едновременно',
      '✓ До 5 продажби на превозни средства годишно',
      '✓ Само лични превозни средства (не търговски)',
      '✓ Без необходимост от регистрация на фирма',
      '✓ Без ДДС задължения',
      '✓ Продажбата не трябва да е основна дейност',
    ],
    limitsEn: [
      '✓ Maximum 3 active listings simultaneously',
      '✓ Up to 5 vehicle sales per year',
      '✓ Personal vehicles only (not commercial)',
      '✓ No business registration required',
      '✓ No VAT obligations',
      '✓ Sales must not be primary activity',
    ],
    warningBg: '⚠️ ВАЖНО: Ако продавате повече от 5 коли годишно или продажбата е основна дейност, трябва да се регистрирате като търговец.',
    warningEn: '⚠️ IMPORTANT: If selling more than 5 cars annually or sales is primary activity, you must register as a dealer.',
    requirementsBg: [
      'Валидна лична карта или паспорт',
      'Документи за собственост на превозното средство',
      'Валиден номер на мобилен телефон',
      'Валиден имейл адрес',
    ],
    requirementsEn: [
      'Valid ID card or passport',
      'Vehicle ownership documents',
      'Valid mobile phone number',
      'Valid email address',
    ],
  },
  dealer: {
    icon: Store,
    titleBg: 'Автокъща / Търговец - Условия',
    titleEn: 'Car Dealership / Trader - Terms',
    descriptionBg: 'Търговска дейност по продажба на автомобили',
    descriptionEn: 'Commercial vehicle sales activity',
    limitsBg: [
      '✓ Неограничен брой обяви',
      '✓ Търговска регистрация задължителна',
      '✓ БУЛСТАТ номер задължителен',
      '✓ ДДС регистрация (при оборот > 50,000 лв.)',
      '✓ Застраховка "Отговорност" задължителна',
      '✓ Търговски адрес и работно време',
      '✓ Гаранция на продадени автомобили (12 месеца)',
    ],
    limitsEn: [
      '✓ Unlimited listings',
      '✓ Business registration mandatory',
      '✓ BULSTAT number required',
      '✓ VAT registration (if turnover > BGN 50,000)',
      '✓ Liability insurance mandatory',
      '✓ Business address and working hours',
      '✓ Warranty on sold vehicles (12 months)',
    ],
    warningBg: '⚠️ ВАЖНО: Необходима е регистрация в Търговския регистър и спазване на Закона за защита на потребителите.',
    warningEn: '⚠️ IMPORTANT: Commercial Register registration and Consumer Protection Act compliance required.',
    requirementsBg: [
      'Регистрация в Търговския регистър',
      'БУЛСТАТ номер',
      'ДДС номер (при необходимост)',
      'Застраховка "Отговорност"',
      'Търговски адрес',
      'Банкова сметка на фирмата',
      'Документи за собственост на автомобилите',
    ],
    requirementsEn: [
      'Commercial Register registration',
      'BULSTAT number',
      'VAT number (if applicable)',
      'Liability insurance',
      'Business address',
      'Company bank account',
      'Vehicle ownership documents',
    ],
  },
  company: {
    icon: Building2,
    titleBg: 'Корпоративна компания - Условия',
    titleEn: 'Corporate Company - Terms',
    descriptionBg: 'Продажба на корпоративен автопарк или търговска дейност',
    descriptionEn: 'Corporate fleet sales or commercial activity',
    limitsBg: [
      '✓ Неограничен брой обяви',
      '✓ Регистрация като търговско дружество (ООД/ЕООД/АД)',
      '✓ БУЛСТАТ и ДДС номер задължителни',
      '✓ Корпоративна застраховка задължителна',
      '✓ Счетоводна отчетност по ЗСч',
      '✓ Данък печалба 10% върху реализирания доход',
      '✓ Възможност за екипно управление',
      '✓ API достъп за интеграции',
    ],
    limitsEn: [
      '✓ Unlimited listings',
      '✓ Registration as commercial company (OOD/EOOD/AD)',
      '✓ BULSTAT and VAT numbers mandatory',
      '✓ Corporate insurance mandatory',
      '✓ Accounting reports per Accounting Act',
      '✓ 10% corporate tax on realized income',
      '✓ Team management capabilities',
      '✓ API access for integrations',
    ],
    warningBg: '⚠️ ВАЖНО: Пълно спазване на Търговския закон, ЗСч и данъчното законодателство на Република България.',
    warningEn: '⚠️ IMPORTANT: Full compliance with Commercial Law, Accounting Act and Bulgarian tax legislation required.',
    requirementsBg: [
      'Регистрация в Търговския регистър',
      'БУЛСТАТ номер',
      'ДДС номер',
      'Корпоративна застраховка',
      'Одит и счетоводна отчетност',
      'Юридически адрес на дружеството',
      'Представител на дружеството',
      'Корпоративна банкова сметка',
    ],
    requirementsEn: [
      'Commercial Register registration',
      'BULSTAT number',
      'VAT number',
      'Corporate insurance',
      'Audit and accounting reports',
      'Legal company address',
      'Company representative',
      'Corporate bank account',
    ],
  },
};

const ProfileTypeConfirmModal: React.FC<ProfileTypeConfirmModalProps> = ({
  isOpen,
  newType,
  onConfirm,
  onCancel,
}) => {
  const { language } = useLanguage();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  if (!isOpen) return null;

  const terms = PROFILE_TERMS[newType];
  const Icon = terms.icon;
  const isBulgarian = language === 'bg';

  const title = isBulgarian ? terms.titleBg : terms.titleEn;
  const description = isBulgarian ? terms.descriptionBg : terms.descriptionEn;
  const limits = isBulgarian ? terms.limitsBg : terms.limitsEn;
  const warning = isBulgarian ? terms.warningBg : terms.warningEn;
  const requirements = isBulgarian ? terms.requirementsBg : terms.requirementsEn;

  const handleConfirm = () => {
    if (!agreedToTerms) {
      alert(isBulgarian 
        ? 'Моля, потвърдете, че сте съгласни с условията.' 
        : 'Please confirm that you agree to the terms.');
      return;
    }
    onConfirm();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the dark overlay background
    // NOT when clicking on the modal container or its children
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const modalContent = (
    <Overlay onClick={handleOverlayClick} data-modal="profile-type-confirm">
      <ModalContainer onClick={(e) => e.stopPropagation()} data-modal="profile-type-confirm">
        <CloseButton onClick={onCancel}>
          <X size={24} />
        </CloseButton>

        <Header>
          <IconWrapper>
            <Icon size={40} />
          </IconWrapper>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </Header>

        <Content>
          {/* Limits Section */}
          <Section>
            <SectionTitle>
              <Check size={20} />
              {isBulgarian ? 'Права и ограничения' : 'Rights & Limitations'}
            </SectionTitle>
            <List>
              {limits.map((limit, index) => (
                <ListItem key={index}>{limit}</ListItem>
              ))}
            </List>
          </Section>

          {/* Warning Box */}
          <WarningBox>
            <AlertCircle size={20} />
            <WarningText>{warning}</WarningText>
          </WarningBox>

          {/* Requirements Section */}
          <Section>
            <SectionTitle>
              <AlertCircle size={20} />
              {isBulgarian ? 'Изисквания за регистрация' : 'Registration Requirements'}
            </SectionTitle>
            <List>
              {requirements.map((req, index) => (
                <ListItem key={index}>• {req}</ListItem>
              ))}
            </List>
          </Section>

          {/* Agreement Checkbox - Neumorphism Toggle */}
          <AgreementBox>
            <SwitchContainer 
              className={agreedToTerms ? 'on' : ''} 
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              <SwitchOuter>
                <SwitchInner>
                  <SwitchKnobContainer>
                    <SwitchKnob />
                    <SwitchKnobNeon />
                  </SwitchKnobContainer>
                </SwitchInner>
              </SwitchOuter>
            </SwitchContainer>
            <AgreementLabel onClick={() => setAgreedToTerms(!agreedToTerms)}>
              {isBulgarian 
                ? 'Прочетох и съм съгласен/на с горните условия и изисквания'
                : 'I have read and agree to the above terms and requirements'}
            </AgreementLabel>
          </AgreementBox>
        </Content>

        <Footer>
          <CancelButton onClick={onCancel}>
            {isBulgarian ? 'Отказ' : 'Cancel'}
          </CancelButton>
          <ConfirmButton 
            onClick={handleConfirm}
            disabled={!agreedToTerms}
          >
            {isBulgarian ? 'Потвърди и продължи' : 'Confirm & Continue'}
          </ConfirmButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
  
  return createPortal(modalContent, document.body);
};

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  max-width: 850px; /* ✅ Increased from 750px for better readability */
  width: 95%;
  max-height: 90vh; /* ✅ Increased from 85vh for more content space */
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 10px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 143, 16, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    max-width: 95%;
    max-height: 95vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #495057;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    color: #dc3545;
    transform: rotate(90deg);
  }
`;

const Header = styled.div`
  text-align: center;
  padding: 40px 50px 35px; /* ✅ Increased padding for spacious feel */
  border-bottom: 2px solid rgba(255, 143, 16, 0.1);
`;

const IconWrapper = styled.div`
  width: 90px; /* ✅ Increased from 80px */
  height: 90px; /* ✅ Increased from 80px */
  margin: 0 auto 24px; /* ✅ More space below icon */
  background: linear-gradient(135deg, #FF8F10 0%, #FFDF00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(255, 143, 16, 0.3);
`;

const Title = styled.h2`
  font-size: 2rem; /* ✅ Increased from 1.75rem for better visibility */
  font-weight: 700;
  color: #212529;
  margin: 0 0 12px 0; /* ✅ More space below title */
`;

const Description = styled.p`
  font-size: 1.125rem; /* ✅ Increased from 1rem */
  color: #6c757d;
  margin: 0;
  line-height: 1.7; /* ✅ Added line-height */
`;

const Content = styled.div`
  padding: 35px 50px; /* ✅ Increased from 30px 40px */

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem; /* ✅ Increased from 1.1rem */
  font-weight: 700; /* ✅ Increased from 600 */
  color: #212529;
  margin: 0 0 18px 0; /* ✅ Increased margin */
  display: flex;
  align-items: center;
  gap: 12px; /* ✅ Increased gap */

  svg {
    color: #FF8F10;
    width: 22px; /* ✅ Larger icon */
    height: 22px;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 12px 0; /* ✅ Increased from 8px */
  padding-left: 32px; /* ✅ Added left padding */
  color: #495057;
  font-size: 1.05rem; /* ✅ Increased from 0.95rem */
  line-height: 1.7; /* ✅ Increased from 1.6 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative; /* ✅ For bullet positioning */

  &:last-child {
    border-bottom: none;
  }
  
  /* ✅ Better bullet points */
  &::before {
    content: '•';
    position: absolute;
    left: 12px;
    color: #FF8F10;
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

const WarningBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%);
  border: 2px solid rgba(255, 193, 7, 0.4);
  border-radius: 16px;
  padding: 20px;
  margin: 25px 0;
  display: flex;
  gap: 15px;
  align-items: flex-start;

  svg {
    color: #ff9800;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const WarningText = styled.p`
  margin: 0;
  color: #f57c00;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.6;
`;

const AgreementBox = styled.div`
  background: rgba(255, 143, 16, 0.05);
  border: 2px solid rgba(255, 143, 16, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-top: 25px;
  display: flex;
  gap: 15px;
  align-items: center;
`;

// ==================== NEUMORPHISM TOGGLE SWITCH ====================

const SwitchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 60px;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
`;

const SwitchOuter = styled.div`
  position: relative;
  width: 100%;
  height: 35px;
  background: #3e3e3e;
  border-radius: 17.5px;
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.4), 
    -6px -6px 12px rgba(255, 255, 255, 0.1);
`;

const SwitchInner = styled.div`
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  background-color: #3e3e3e;
  border-radius: 14.5px;
  box-shadow: 
    inset 4px 4px 8px rgba(0, 0, 0, 0.4), 
    inset -4px -4px 8px rgba(255, 255, 255, 0.1);
  transition: background-color 0.4s ease;
`;

const SwitchKnobContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${SwitchContainer}.on & {
    transform: translateX(100%);
  }
`;

const SwitchKnob = styled.div`
  position: relative;
  width: 28px;
  height: 28px;
  top: 3.5px;
  left: 3.5px;
  background-color: #3e3e3e;
  border-radius: 50%;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.5), 
    -4px -4px 8px rgba(255, 255, 255, 0.1);
  transition: background-color 0.4s ease;
`;

const neonGlowAnimation = keyframes`
  0%, 100% { 
    box-shadow: 0 0 8px #0f0, 0 0 16px #0f0, 0 0 24px #0f0;
  }
  50% { 
    box-shadow: 0 0 12px #0f0, 0 0 20px #0f0, 0 0 30px #0f0, 0 0 40px #0f0;
  }
`;

const neonOffAnimation = keyframes`
  0%, 100% { 
    box-shadow: 0 0 8px #ff8c00, 0 0 16px #ff8c00;
  }
  50% { 
    box-shadow: 0 0 12px #ff8c00, 0 0 20px #ff8c00, 0 0 28px #ff8c00;
  }
`;

const SwitchKnobNeon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: box-shadow 0.4s ease;
  
  /* OFF state - Orange neon */
  ${SwitchContainer}:not(.on) & {
    display: block;
    animation: ${neonOffAnimation} 2s ease-in-out infinite;
  }
  
  /* ON state - Green neon */
  ${SwitchContainer}.on & {
    display: block;
    animation: ${neonGlowAnimation} 1.5s ease-in-out infinite;
  }
`;

const AgreementLabel = styled.label`
  font-size: 0.95rem;
  color: #212529;
  font-weight: 500;
  line-height: 1.6;
  cursor: pointer;
  user-select: none;
`;

const Footer = styled.div`
  padding: 20px 40px 30px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  border-top: 2px solid rgba(255, 143, 16, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 140px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CancelButton = styled(Button)`
  background: rgba(0, 0, 0, 0.05);
  color: #495057;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ConfirmButton = styled(Button)`
  background: linear-gradient(135deg, #FF8F10 0%, #FF7900 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default ProfileTypeConfirmModal;

