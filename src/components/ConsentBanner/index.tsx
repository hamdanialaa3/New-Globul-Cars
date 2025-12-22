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
  updateConsent 
} from '@/utils/consent-mode';

const ConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Consent settings for detailed view
  const [consents, setConsents] = useState({
    analytics: false,
    ads: false,
    personalization: false
  });

  useEffect(() => {
    // Show banner only if user hasn't consented
    if (!hasUserConsented()) {
      setIsVisible(true);
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

  return (
    <BannerContainer>
      <BannerContent>
        {!showDetails ? (
          <>
            <BannerText>
              <strong>🍪 Използваме бисквитки</strong>
              <p>
                Използваме бисквитки за подобряване на вашето изживяване, анализ на трафика и персонализирана реклама.
                Повече информация в нашата <a href="/privacy" target="_blank">Политика за поверителност</a>.
              </p>
            </BannerText>
            <BannerActions>
              <CustomizeButton onClick={() => setShowDetails(true)}>
                Настройки
              </CustomizeButton>
              <RejectButton onClick={handleRejectAll}>
                Откажи
              </RejectButton>
              <AcceptButton onClick={handleAcceptAll}>
                Приеми всички
              </AcceptButton>
            </BannerActions>
          </>
        ) : (
          <>
            <DetailedView>
              <DetailTitle>Персонализирайте настройките за бисквитки</DetailTitle>
              
              <ConsentOption>
                <ConsentLabel>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                  />
                  <strong>Необходими бисквитки</strong>
                </ConsentLabel>
                <ConsentDescription>
                  Задължителни за функционирането на сайта (вход, кошница, безопасност)
                </ConsentDescription>
              </ConsentOption>

              <ConsentOption>
                <ConsentLabel>
                  <input
                    type="checkbox"
                    checked={consents.analytics}
                    onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
                  />
                  <strong>Аналитични бисквитки</strong>
                </ConsentLabel>
                <ConsentDescription>
                  Помагат ни да подобрим сайта чрез анализ на посещенията (Google Analytics)
                </ConsentDescription>
              </ConsentOption>

              <ConsentOption>
                <ConsentLabel>
                  <input
                    type="checkbox"
                    checked={consents.ads}
                    onChange={(e) => setConsents({ ...consents, ads: e.target.checked })}
                  />
                  <strong>Рекламни бисквитки</strong>
                </ConsentLabel>
                <ConsentDescription>
                  Показват ви релевантни реклами за автомобили (Google Ads, Facebook)
                </ConsentDescription>
              </ConsentOption>

              <ConsentOption>
                <ConsentLabel>
                  <input
                    type="checkbox"
                    checked={consents.personalization}
                    onChange={(e) => setConsents({ ...consents, personalization: e.target.checked })}
                  />
                  <strong>Персонализация</strong>
                </ConsentLabel>
                <ConsentDescription>
                  Запазват вашите предпочитания (език, тема, филтри)
                </ConsentDescription>
              </ConsentOption>
            </DetailedView>

            <BannerActions>
              <BackButton onClick={() => setShowDetails(false)}>
                Назад
              </BackButton>
              <RejectButton onClick={handleRejectAll}>
                Откажи всички
              </RejectButton>
              <AcceptButton onClick={handleSaveCustom}>
                Запази избора
              </AcceptButton>
            </BannerActions>
          </>
        )}
      </BannerContent>
    </BannerContainer>
  );
};

// Styled Components
const BannerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  z-index: 99999;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
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

const BannerText = styled.div`
  margin-bottom: 20px;

  strong {
    font-size: 18px;
    display: block;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    opacity: 0.9;
  }

  a {
    color: #4A90E2;
    text-decoration: underline;
    
    &:hover {
      color: #66A6FF;
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

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const AcceptButton = styled(Button)`
  background: #28A745;
  color: white;

  &:hover {
    background: #218838;
  }
`;

const RejectButton = styled(Button)`
  background: #6C757D;
  color: white;

  &:hover {
    background: #5A6268;
  }
`;

const CustomizeButton = styled(Button)`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BackButton = styled(Button)`
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DetailedView = styled.div`
  margin-bottom: 20px;
`;

const DetailTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 15px;
`;

const ConsentOption = styled.div`
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
`;

const ConsentLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 15px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;

const ConsentDescription = styled.p`
  font-size: 13px;
  opacity: 0.7;
  margin: 5px 0 0 28px;
  line-height: 1.5;
`;

export default ConsentBanner;
