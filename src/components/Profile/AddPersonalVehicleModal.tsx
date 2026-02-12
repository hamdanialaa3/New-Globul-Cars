// Add Personal Vehicle Modal Component
// نافذة منبثقة لإضافة مركبة شخصية - مشابهة لـ mobile.de

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Bell, Database, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { PersonalVehicle } from '../../types/personal-vehicle.types';
import PersonalVehicleWizard from './PersonalVehicleWizard';

interface AddPersonalVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vehicle: PersonalVehicle) => void;
  userId: string;
}

// Animations
const modalEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const modalExit = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
  overflow-y: auto;
`;

const ModalContainer = styled.div<{ $isClosing: boolean }>`
  position: relative;
  background: var(--bg-primary);
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${props => props.$isClosing ? modalExit : modalEnter} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-hover);
    transform: rotate(90deg);
  }
  
  &:active {
    transform: rotate(90deg) scale(0.9);
  }
`;

const ModalHeader = styled.div`
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-bottom: 1px solid var(--border);
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

const BenefitsSection = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  animation: ${slideUp} 0.5s ease-out 0.2s both;
`;

const BenefitCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 16px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-primary);
  }
`;

const BenefitIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 0.5rem;
`;

const BenefitTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const BenefitDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const PrivacyNotice = styled.div`
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
`;

const PrivacyIcon = styled(Shield)`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  margin-top: 2px;
`;

const PrivacyLink = styled.a`
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const WizardContainer = styled.div`
  padding: 2rem;
`;

export const AddPersonalVehicleModal: React.FC<AddPersonalVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const { language } = useLanguage();
  const [showWizard, setShowWizard] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowWizard(false);
      onClose();
    }, 300);
  };

  const handleStart = () => {
    setShowWizard(true);
  };

  const handleSuccess = (vehicle: PersonalVehicle) => {
    onSuccess(vehicle);
    handleClose();
  };

  if (!isOpen) return null;

  const benefits = [
    {
      icon: Bell,
      title: language === 'bg' 
        ? 'Не забравяйте повече срещи' 
        : 'Never miss an appointment',
      description: language === 'bg'
        ? 'Напомняме ви за следващия преглед или смяна на гуми.'
        : 'We remind you of the next inspection or tire change.',
    },
    {
      icon: Database,
      title: language === 'bg'
        ? 'Всички данни за превозното средство на едно място'
        : 'All vehicle data in one place',
      description: language === 'bg'
        ? 'Тук винаги намирате всички ваши важни данни!'
        : 'Here you always find all your important data!',
    },
    {
      icon: TrendingUp,
      title: language === 'bg'
        ? 'Текущата пазарна стойност'
        : 'Current market value',
      description: language === 'bg'
        ? 'Струва ли си продажба? Тук получавате бързо пазарната стойност!'
        : 'Is a sale worth it? Here you get the market value quickly!',
    },
  ];

  const privacyText = language === 'bg'
    ? 'Информираме ви за промени и новини относно вашето превозно средство по имейл или приложение. Ако не искате тази услуга, можете да я деактивирате по всяко време в потребителския акаунт или в имейла.'
    : 'We inform you about changes and news about your vehicle by email or app. If you do not want this service, you can deactivate it at any time in the user account or in the email.';

  return (
    <Overlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContainer $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} aria-label={language === 'bg' ? 'Затвори' : 'Close'}>
          <X size={20} />
        </CloseButton>

        {!showWizard ? (
          <>
            <ModalHeader>
              <Title>
                {language === 'bg' ? 'Добавете моето превозно средство' : 'Add my vehicle'}
              </Title>
              <Subtitle>
                {language === 'bg' 
                  ? 'Следвайте и управлявайте вашето превозно средство'
                  : 'Track and manage your vehicle'}
              </Subtitle>
            </ModalHeader>

            <BenefitsSection>
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BenefitIcon>
                    <benefit.icon size={24} />
                  </BenefitIcon>
                  <BenefitTitle>{benefit.title}</BenefitTitle>
                  <BenefitDescription>{benefit.description}</BenefitDescription>
                </BenefitCard>
              ))}
            </BenefitsSection>

            <PrivacyNotice>
              <PrivacyIcon />
              <div>
                {privacyText}{' '}
                <PrivacyLink href="/profile/settings">
                  {language === 'bg' ? 'Настройки за поверителност' : 'Privacy settings'}
                </PrivacyLink>
              </div>
            </PrivacyNotice>

            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <button
                onClick={handleStart}
                style={{
                  padding: '1rem 2rem',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {language === 'bg' ? 'Започнете сега' : 'Start now'}
              </button>
            </div>
          </>
        ) : (
          <WizardContainer>
            <PersonalVehicleWizard
              userId={userId}
              onComplete={handleSuccess}
              onCancel={handleClose}
            />
          </WizardContainer>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default AddPersonalVehicleModal;
