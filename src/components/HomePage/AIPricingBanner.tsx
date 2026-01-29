/**
 * AI Pricing Banner - Sci-Fi Glassmorphism Design
 * شريط ترويجي لحاسبة تسعير السيارات بالذكاء الاصطناعي
 * 
 * Design: Blue/Black gradient sci-fi glassmorphism
 * Theme: Dark/Light mode support
 * Updated: January 18, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const AIPricingBanner: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme } = useTheme();

  const t = language === 'bg' ? {
    badge: 'Ново!',
    title: 'Изчислете Цената на Вашата Кола с AI',
    subtitle: 'Автоматично сравнение със сходни обяви в Mobile.bg, Cars.bg и AutoScout24.bg',
    cta: 'Изчисли Сега',
    feature1: 'AI Анализ',
    feature2: 'Пазарни Данни',
    feature3: 'Точна Оценка',
  } : {
    badge: 'New!',
    title: 'Calculate Your Car Price with AI',
    subtitle: 'Automatic comparison with similar listings on Bulgarian market',
    cta: 'Calculate Now',
    feature1: 'AI Analysis',
    feature2: 'Market Data',
    feature3: 'Accurate Estimate',
  };

  return (
    <BannerContainer $theme={theme} onClick={() => navigate('/pricing')}>
      <BannerContent>
        <LeftSection>
          <Badge $theme={theme}>{t.badge}</Badge>
          <Title>{t.title}</Title>
          <Subtitle>{t.subtitle}</Subtitle>
          
          <Features>
            <Feature>
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </FeatureIcon>
              <FeatureText>{t.feature1}</FeatureText>
            </Feature>
            <Feature>
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </FeatureIcon>
              <FeatureText>{t.feature2}</FeatureText>
            </Feature>
            <Feature>
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </FeatureIcon>
              <FeatureText>{t.feature3}</FeatureText>
            </Feature>
          </Features>
        </LeftSection>

        <RightSection>
          <CTAButton $theme={theme}>
            {t.cta}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </CTAButton>

          <FloatingIcon $delay={0}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </FloatingIcon>
          
          <FloatingIcon $delay={1}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </FloatingIcon>
          
          <FloatingIcon $delay={2}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="20" x2="12" y2="10"/>
              <line x1="18" y1="20" x2="18" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          </FloatingIcon>
        </RightSection>
      </BannerContent>
    </BannerContainer>
  );
};

const BannerContainer = styled.div<{ $theme: 'dark' | 'light' }>`
  position: relative;
  width: 100%;
  min-height: 280px;
  border-radius: 24px;
  background: ${p => p.$theme === 'dark' 
    ? 'linear-gradient(135deg, #0a0e27 0%, #1e3a8a 50%, #581c87 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)'
  };
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid ${p => p.$theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
  box-shadow: ${p => p.$theme === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)'
    : '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)'
  };

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
    animation: glowPulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${p => p.$theme === 'dark'
      ? '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)'
      : '0 12px 48px rgba(59, 130, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.3)'
    };
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  @media (max-width: 768px) {
    min-height: 320px;
  }
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  padding: 40px 48px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    text-align: center;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Badge = styled.div<{ $theme: 'dark' | 'light' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

const Title = styled.h2`
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: white;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0;
  max-width: 600px;
`;

const Features = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 8px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FeatureText = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;

  @media (max-width: 768px) {
    margin-top: 16px;
  }
`;

const CTAButton = styled.button<{ $theme: 'dark' | 'light' }>`
  padding: 16px 40px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: ${p => p.$theme === 'dark' ? '#1e3a8a' : '#3b82f6'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  white-space: nowrap;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    background: white;
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const FloatingIcon = styled.div<{ $delay: number }>`
  position: absolute;
  color: rgba(255, 255, 255, 0.3);
  animation: float 3s ease-in-out infinite;
  animation-delay: ${p => p.$delay}s;

  &:nth-child(2) {
    top: 0;
    right: 80px;
  }

  &:nth-child(3) {
    top: 40px;
    right: 20px;
  }

  &:nth-child(4) {
    bottom: 0;
    right: 60px;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-10px);
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export default AIPricingBanner;
