/**
 * Test Guest Alert Component
 * This component is for testing only - always shows the Alert
 */

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface AlertData {
  title: string;
  description: string;
  button: string;
  subtext: string;
}

const translations: Record<string, AlertData> = {
  en: {
    title: 'Complete Your Profile',
    description: 'Your account is currently unverified. Complete your profile information to build trust with other users.',
    button: 'Complete Profile',
    subtext: 'Guest accounts may not be trusted by other users.'
  },
  bg: {
    title: 'Попълнете профила си',
    description: 'Вашият акаунт е в момента непроверен. Попълнете информацията на профила си, за да изградите доверие с други потребители.',
    button: 'Попълнете профила',
    subtext: 'Гост акаунтите може да не бъдат доверявани от други потребители.'
  },

};

const AlertContainer = styled.div<{ $theme: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, 
    ${props => props.$theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)'} 0%,
    ${props => props.$theme === 'dark' ? 'rgba(255, 193, 7, 0.12)' : 'rgba(255, 193, 7, 0.08)'} 100%
  );
  border-left: 4px solid #FF9800;
  border-radius: 0 8px 8px 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$theme === 'dark' 
    ? 'rgba(255, 152, 0, 0.3)' 
    : 'rgba(255, 152, 0, 0.2)'};
  box-shadow: 0 4px 12px ${props => props.$theme === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 152, 0, 0.1)'};

  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 12px;
    border-radius: 0 6px 6px 0;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #FF9800;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  font-weight: bold;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AlertTitle = styled.h3<{ $theme: string }>`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$theme === 'dark' ? '#F0F0F0' : '#1A1A1B'};
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const AlertDescription = styled.p<{ $theme: string }>`
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: ${props => props.$theme === 'dark' ? '#D0D0D0' : '#555555'};
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const AlertSubtext = styled.p<{ $theme: string }>`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: ${props => props.$theme === 'dark' ? '#A0A0A0' : '#888888'};
  line-height: 1.4;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const CompleteButton = styled.button`
  padding: 8px 16px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;

  &:hover {
    background: #F57C00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 7px 14px;
    font-size: 13px;
  }
`;

export const TestGuestAlert: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    // For testing, navigate to profile 90
    navigate('/profile/90/settings');
  };

  const lang = (language as 'en' | 'bg' | 'ar') || 'en';
  const strings = translations[lang] || translations.en;
  const currentTheme = theme as 'dark' | 'light';

  return (
    <AlertContainer $theme={currentTheme}>
      <IconWrapper>
        ⓘ
      </IconWrapper>
      <ContentWrapper>
        <AlertTitle $theme={currentTheme}>
          {strings.title}
        </AlertTitle>
        <AlertDescription $theme={currentTheme}>
          {strings.description}
        </AlertDescription>
        <AlertSubtext $theme={currentTheme}>
          {strings.subtext}
        </AlertSubtext>
      </ContentWrapper>
      <ActionWrapper>
        <CompleteButton onClick={handleCompleteProfile}>
          {strings.button}
        </CompleteButton>
      </ActionWrapper>
    </AlertContainer>
  );
};

export default TestGuestAlert;
