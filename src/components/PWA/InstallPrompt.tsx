// src/components/PWA/InstallPrompt.tsx
// PWA Install Prompt Component

import React from 'react';
import styled from 'styled-components';
import { Download, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { useLanguage } from '../../contexts/LanguageContext';

const PromptContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FF7900, #ff8c1a);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10000;
  max-width: 90%;
  width: min(720px, 94vw);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    bottom: 10px;
    padding: 12px 16px;
    font-size: 14px;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 10px;
  }
`;

const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: clamp(14px, 2.8vw, 16px);
  margin-bottom: 4px;
  line-height: 1.3;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const Description = styled.div`
  font-size: clamp(12px, 2.6vw, 13px);
  opacity: 0.9;
  line-height: 1.3;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? 'rgba(255, 255, 255, 0.2)' : 'white'};
  color: ${props => props.variant === 'secondary' ? 'white' : '#FF7900'};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  @media (max-width: 768px) {
    flex: 1;
    min-width: 120px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const { language } = useLanguage();
  const [dismissed, setDismissed] = React.useState(false);

  // ✅ FIX: Check if previously dismissed within 7 days - MUST be before early return
  React.useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        setDismissed(true);
      }
    }
  }, []);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <PromptContainer>
      <IconWrapper>
        <Download size={24} />
      </IconWrapper>
      <Content>
        <Title>
          {language === 'bg' ? 'Инсталирайте приложението' : 'Install App'}
        </Title>
        <Description>
          {language === 'bg' 
            ? 'Използвайте Globul Cars като приложение за по-бързо зареждане'
            : 'Use Globul Cars as an app for faster loading'}
        </Description>
      </Content>
      <Actions>
        <Button onClick={handleInstall}>
          {language === 'bg' ? 'Инсталирай' : 'Install'}
        </Button>
        <Button variant="secondary" onClick={handleDismiss}>
          {language === 'bg' ? 'По-късно' : 'Later'}
        </Button>
      </Actions>
      <CloseButton onClick={handleDismiss}>
        <X size={20} />
      </CloseButton>
    </PromptContainer>
  );
};

export default InstallPrompt;
