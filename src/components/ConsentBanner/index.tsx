// src/components/ConsentBanner/index.tsx
/**
 * GDPR Consent Banner Component
 * 
 * Displays cookie consent banner for EU users
 * Implements Google Consent Mode v2
 * 
 * Features:
 * - Minimal, non-intrusive design
 * - Accept All / Reject All / Customize options
 * - Remembers user choice for 7 days
 * - GDPR compliant
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  hasUserConsented, 
  grantAllConsents, 
  denyAllConsents,
  updateConsent,
  initConsentMode
} from '@/utils/consent-mode';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const ConsentBanner: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Consent settings for detailed view
  const [consents, setConsents] = useState({
    analytics: false,
    ads: false,
    personalization: false
  });

  useEffect(() => {
    // Initialize consent mode if not already initialized
    initConsentMode();
    
    // Show banner only if user hasn't consented
    const hasConsented = hasUserConsented();
    if (!hasConsented) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    grantAllConsents();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    denyAllConsents();
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    updateConsent({
      analytics_storage: consents.analytics ? 'granted' : 'denied',
      ad_storage: consents.ads ? 'granted' : 'denied',
      ad_user_data: consents.ads ? 'granted' : 'denied',
      ad_personalization: consents.ads ? 'granted' : 'denied',
      personalization_storage: consents.personalization ? 'granted' : 'denied'
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Translations
  const texts = {
    bg: {
      title: '🍪 Използваме бисквитки',
      description: 'Използваме бисквитки за подобряване на вашето изживяване, анализ на трафика и персонализирана реклама. Повече информация в нашата',
      privacyLink: 'Политика за поверителност',
      customize: 'Настройки',
      reject: 'Откажи',
      acceptAll: 'Приеми всички',
      detailTitle: 'Персонализирайте настройките за бисквитки',
      essential: 'Необходими бисквитки',
      essentialDesc: 'Задължителни за функционирането на сайта (вход, кошница, безопасност)',
      analytics: 'Аналитични бисквитки',
      analyticsDesc: 'Помагат ни да подобрим сайта чрез анализ на посещенията (Google Analytics)',
      ads: 'Рекламни бисквитки',
      adsDesc: 'Показват ви релевантни реклами за автомобили (Google Ads, Facebook)',
      personalization: 'Персонализация',
      personalizationDesc: 'Запазват вашите предпочитания (език, тема, филтри)',
      back: 'Назад',
      rejectAll: 'Откажи всички',
      saveChoice: 'Запази избора'
    },
    en: {
      title: '🍪 We Use Cookies',
      description: 'We use cookies to improve your experience, analyze traffic, and deliver personalized ads. More information in our',
      privacyLink: 'Privacy Policy',
      customize: 'Settings',
      reject: 'Reject',
      acceptAll: 'Accept All',
      detailTitle: 'Customize Cookie Settings',
      essential: 'Essential Cookies',
      essentialDesc: 'Required for site functionality (login, cart, security)',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'Help us improve the site through usage analysis (Google Analytics)',
      ads: 'Advertising Cookies',
      adsDesc: 'Show you relevant car ads (Google Ads, Facebook)',
      personalization: 'Personalization',
      personalizationDesc: 'Save your preferences (language, theme, filters)',
      back: 'Back',
      rejectAll: 'Reject All',
      saveChoice: 'Save Choice'
    }
  };

  const t = texts[language];

  return (
    <BannerContainer $isDark={isDark}>
      <BannerContent>
        {!showDetails ? (
          <>
            <BannerText $isDark={isDark}>
              <strong>{t.title}</strong>
              <p>
                {t.description} <a href="/privacy" target="_blank" rel="noopener noreferrer">{t.privacyLink}</a>.
              </p>
            </BannerText>
            <BannerActions>
              <CustomizeButton onClick={() => setShowDetails(true)} $isDark={isDark}>
                {t.customize}
              </CustomizeButton>
              <RejectButton onClick={handleRejectAll} $isDark={isDark}>
                {t.reject}
              </RejectButton>
              <AcceptButton onClick={handleAcceptAll} $isDark={isDark}>
                {t.acceptAll}
              </AcceptButton>
            </BannerActions>
          </>
        ) : (
          <>
            <DetailedView $isDark={isDark}>
              <DetailTitle $isDark={isDark}>{t.detailTitle}</DetailTitle>
              
              <ConsentOption $isDark={isDark}>
                <ConsentLabel $isDark={isDark}>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                  />
                  <strong>{t.essential}</strong>
                </ConsentLabel>
                <ConsentDescription $isDark={isDark}>
                  {t.essentialDesc}
                </ConsentDescription>
              </ConsentOption>

              <ConsentOption $isDark={isDark}>
                <ConsentLabel $isDark={isDark}>
                  <input
                    type="checkbox"
                    checked={consents.analytics}
                    onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
                  />
                  <strong>{t.analytics}</strong>
                </ConsentLabel>
                <ConsentDescription $isDark={isDark}>
                  {t.analyticsDesc}
                </ConsentDescription>
              </ConsentOption>

              <ConsentOption $isDark={isDark}>
                <ConsentLabel $isDark={isDark}>
                  <input
                    type="checkbox"
                    checked={consents.ads}
                    onChange={(e) => setConsents({ ...consents, ads: e.target.checked })}
                  />
                  <strong>{t.ads}</strong>
                </ConsentLabel>
                <ConsentDescription $isDark={isDark}>
                  {t.adsDesc}
                </ConsentDescription>
              </ConsentOption>

              <ConsentOption $isDark={isDark}>
                <ConsentLabel $isDark={isDark}>
                  <input
                    type="checkbox"
                    checked={consents.personalization}
                    onChange={(e) => setConsents({ ...consents, personalization: e.target.checked })}
                  />
                  <strong>{t.personalization}</strong>
                </ConsentLabel>
                <ConsentDescription $isDark={isDark}>
                  {t.personalizationDesc}
                </ConsentDescription>
              </ConsentOption>
            </DetailedView>

            <BannerActions>
              <BackButton onClick={() => setShowDetails(false)} $isDark={isDark}>
                {t.back}
              </BackButton>
              <RejectButton onClick={handleRejectAll} $isDark={isDark}>
                {t.rejectAll}
              </RejectButton>
              <AcceptButton onClick={handleSaveCustom} $isDark={isDark}>
                {t.saveChoice}
              </AcceptButton>
            </BannerActions>
          </>
        )}
      </BannerContent>
    </BannerContainer>
  );
};

// Styled Components
const BannerContainer = styled.div<{ $isDark: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ $isDark }) => 
    $isDark 
      ? 'rgba(15, 23, 42, 0.98)' 
      : 'rgba(255, 255, 255, 0.98)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : '#1e293b'};
  z-index: 99999;
  box-shadow: ${({ $isDark }) => 
    $isDark 
      ? '0 -4px 20px rgba(0, 0, 0, 0.5)' 
      : '0 -4px 20px rgba(0, 0, 0, 0.1)'};
  border-top: 1px solid ${({ $isDark }) => 
    $isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)'};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const BannerContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 30px;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const BannerText = styled.div<{ $isDark: boolean }>`
  margin-bottom: 20px;

  strong {
    font-size: 18px;
    display: block;
    margin-bottom: 8px;
    color: ${({ $isDark }) => $isDark ? '#f1f5f9' : '#1e293b'};
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: ${({ $isDark }) => $isDark ? 'rgba(241, 245, 249, 0.9)' : 'rgba(30, 41, 59, 0.9)'};
  }

  a {
    color: ${({ $isDark }) => $isDark ? '#60a5fa' : '#3b82f6'};
    text-decoration: underline;
    
    &:hover {
      color: ${({ $isDark }) => $isDark ? '#93c5fd' : '#2563eb'};
    }
  }
`;

const BannerActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $isDark: boolean }>`
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid
    ${({ $isDark }) => ($isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)')};
  background: ${({ $isDark }) =>
    $isDark
      ? 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
      : 'linear-gradient(135deg, #f8fafc, #e2e8f0)'};
  color: ${({ $isDark }) => ($isDark ? '#e2e8f0' : '#0f172a')};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $isDark }) =>
    $isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
      : '0 10px 30px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255,255,255,0.7)'};

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: ${({ $isDark }) =>
      $isDark
        ? '0 14px 32px rgba(0, 0, 0, 0.45)'
        : '0 14px 32px rgba(15, 23, 42, 0.16)'};
  }

  &:active {
    transform: translateY(0) scale(0.99);
    box-shadow: ${({ $isDark }) =>
      $isDark
        ? '0 6px 16px rgba(0, 0, 0, 0.35)'
        : '0 6px 16px rgba(15, 23, 42, 0.12)'};
  }

  &:focus-visible {
    outline: 2px solid ${({ $isDark }) => ($isDark ? '#60a5fa' : '#2563eb')};
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const AcceptButton = styled(Button)<{ $isDark: boolean }>`
  background: ${({ $isDark }) =>
    $isDark
      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
      : 'linear-gradient(135deg, #28a745, #22c55e)'};
  color: #ffffff;
  border-color: transparent;

  &:hover {
    background: ${({ $isDark }) =>
      $isDark
        ? 'linear-gradient(135deg, #1fb152, #15803d)'
        : 'linear-gradient(135deg, #22c55e, #1faa4d)'};
  }

  &:active {
    background: ${({ $isDark }) =>
      $isDark
        ? 'linear-gradient(135deg, #15803d, #166534)'
        : 'linear-gradient(135deg, #1c9d4b, #15803d)'};
  }
`;

const RejectButton = styled(Button)<{ $isDark: boolean }>`
  background: ${({ $isDark }) =>
    $isDark
      ? 'linear-gradient(135deg, #475569, #334155)'
      : 'linear-gradient(135deg, #6b7280, #4b5563)'};
  color: #ffffff;
  border-color: transparent;

  &:hover {
    background: ${({ $isDark }) =>
      $isDark
        ? 'linear-gradient(135deg, #3b4758, #232b3a)'
        : 'linear-gradient(135deg, #4f586c, #374151)'};
  }

  &:active {
    background: ${({ $isDark }) =>
      $isDark
        ? 'linear-gradient(135deg, #2a3342, #1f2937)'
        : 'linear-gradient(135deg, #3a4252, #1f2937)'};
  }
`;

const CustomizeButton = styled(Button)<{ $isDark: boolean }>`
  background: ${({ $isDark }) =>
    $isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid
    ${({ $isDark }) => ($isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.12)')};
  color: ${({ $isDark }) => ($isDark ? '#e2e8f0' : '#0f172a')};

  &:hover {
    background: ${({ $isDark }) =>
      $isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 1)'};
  }
`;

const BackButton = styled(Button)<{ $isDark: boolean }>`
  background: ${({ $isDark }) =>
    $isDark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(241, 245, 249, 0.95)'};
  border: 1px solid
    ${({ $isDark }) => ($isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.1)')};
  color: ${({ $isDark }) => ($isDark ? '#e2e8f0' : '#0f172a')};

  &:hover {
    background: ${({ $isDark }) =>
      $isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(226, 232, 240, 1)'};
  }
`;

const DetailedView = styled.div<{ $isDark: boolean }>`
  margin-bottom: 20px;
`;

const DetailTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding: 0 16px;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConsentOption = styled.div<{ $isDark: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ $isDark }) =>
    $isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ $isDark }) =>
      $isDark
        ? 'rgba(255, 107, 53, 0.05)'
        : 'rgba(255, 107, 53, 0.03)'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ConsentLabel = styled.label<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  margin: 0;
  width: 100%;

  strong {
    color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
    font-weight: 600;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    min-width: 18px;
    cursor: pointer;
    accent-color: ${({ $isDark }) => $isDark ? '#60a5fa' : '#3b82f6'};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:hover:not(:disabled) {
      accent-color: ${({ $isDark }) => $isDark ? '#93c5fd' : '#60a5fa'};
    }
  }
`;

const ConsentDescription = styled.p<{ $isDark: boolean }>`
  font-size: 13px;
  color: ${({ $isDark }) => 
    $isDark 
      ? 'rgba(226, 232, 240, 0.65)'
      : 'rgba(30, 41, 59, 0.65)'};
  margin: 0;
  line-height: 1.4;
  padding-left: 30px;
`;

export default ConsentBanner;
