// AccountStatusLED.tsx
// LED indicator for guest/registered account status
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { UserCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AccountStatusLEDProps {
  isGuest: boolean;
  isVerified: boolean;
  className?: string;
}

const pulseOrange = keyframes`
  0%, 100% {
    opacity: 0.6;
    box-shadow: 0 0 8px rgba(255, 121, 0, 0.4);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 16px rgba(255, 121, 0, 0.8), 0 0 24px rgba(255, 121, 0, 0.4);
  }
`;

const pulseGreen = keyframes`
  0%, 100% {
    opacity: 0.8;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.9), 0 0 32px rgba(34, 197, 94, 0.6);
  }
`;

const LEDContainer = styled.div<{ $isGuest: boolean; $isVerified: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${props => 
    props.$isGuest 
      ? 'rgba(255, 121, 0, 0.08)' 
      : 'rgba(34, 197, 94, 0.08)'};
  border: 2px solid ${props => 
    props.$isGuest 
      ? 'rgba(255, 121, 0, 0.3)' 
      : 'rgba(34, 197, 94, 0.3)'};
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
`;

const LEDIndicator = styled.div<{ $isGuest: boolean; $isVerified: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => 
    props.$isGuest 
      ? '#FF7900' 
      : '#22C55E'};
  box-shadow: ${props => 
    props.$isGuest 
      ? '0 0 12px rgba(255, 121, 0, 0.6)' 
      : '0 0 12px rgba(34, 197, 94, 0.6)'};
  animation: ${props => 
    props.$isGuest 
      ? pulseOrange 
      : pulseGreen} 2s ease-in-out infinite;
  flex-shrink: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => 
      props.$isGuest 
        ? 'rgba(255, 255, 255, 0.8)' 
        : 'rgba(255, 255, 255, 0.9)'};
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
  }
`;

const StatusContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusTitle = styled.div<{ $isGuest: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => 
    props.$isGuest 
      ? '#FF7900' 
      : '#22C55E'};
`;

const StatusDescription = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin: 0;
  line-height: 1.4;
`;

const AccountStatusLED: React.FC<AccountStatusLEDProps> = ({ 
  isGuest, 
  isVerified,
  className 
}) => {
  const { language } = useLanguage();
  const isBg = language === 'bg';

  return (
    <LEDContainer 
      $isGuest={isGuest} 
      $isVerified={isVerified}
      className={className}
    >
      <LEDIndicator $isGuest={isGuest} $isVerified={isVerified} />
      <StatusContent>
        <StatusTitle $isGuest={isGuest}>
          {isGuest ? (
            <>
              <AlertCircle size={16} />
              {isBg ? 'Гост акаунт' : 'Guest Account'}
            </>
          ) : (
            <>
              <UserCheck size={16} />
              {isBg ? 'Потвърден акаунт' : 'Verified Account'}
            </>
          )}
        </StatusTitle>
        <StatusDescription>
          {isGuest 
            ? (isBg 
                ? 'Добавете имейл или телефон, за да активирате акаунта си' 
                : 'Add email or phone to activate your account')
            : (isBg 
                ? 'Вашият акаунт е потвърден и активиран' 
                : 'Your account is verified and active')
          }
        </StatusDescription>
      </StatusContent>
    </LEDContainer>
  );
};

export default AccountStatusLED;

