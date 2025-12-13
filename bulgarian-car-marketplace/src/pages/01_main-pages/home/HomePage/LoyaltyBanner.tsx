// LoyaltyBanner.tsx
// Encourages registration / login to unlock platform benefits

import React, { memo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useAuth } from '../../../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../../../services/analytics/UnifiedAnalyticsService';

const Container = styled.section`
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 60%);
  color: #fff;
  border-radius: 14px;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.35), transparent 60%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 22px 20px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-family: 'Martica', 'Arial', sans-serif;
  font-weight: 600;
`;

const BenefitsTitle = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  opacity: 0.9;
`;

const BenefitsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
`;

const BenefitItem = styled.li`
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  position: relative;
  padding-left: 12px;
  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: rgba(255,255,255,0.85);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const CTAButton = styled.button`
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Martica', 'Arial', sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Light mode: Orange gradient background, White text */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFA500 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }

  &:hover {
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FF5722 0%, #FF6B35 50%, #FF8C42 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFC107 100%) !important;
      color: #000000 !important;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
  }

  &:active {
    transform: translateY(-1px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #E64A19 0%, #FF5722 50%, #FF6B35 100%) !important;
      color: #ffffff !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFA000 0%, #FFC107 50%, #FFD700 100%) !important;
      color: #000000 !important;
    }
  }
`;

const LoyaltyBanner: React.FC = memo(() => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  // Only render if unauthenticated (guard against flicker with currentUser check)
  if (currentUser) return null;

  const bannerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Fire 'home_loyaltybanner_view' when visible & unauthenticated
  if (currentUser) return; // Only track for unauth users

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        analyticsService.trackEvent('home_loyaltybanner_view', {});
        observer.unobserve(entries[0].target);
      }
    },
    { threshold: 0.3 }
  );

  if (bannerRef.current) {
    observer.observe(bannerRef.current);
  }

  return () => observer.disconnect();
}, [currentUser]);

// When signup is clicked:
const handleSignupClick = () => {
  // Track 'home_loyaltybanner_signup_click'
  analyticsService.trackEvent('home_loyaltybanner_signup_click', {});
  navigate('/auth/register');
};

// When signin is clicked:
const handleSigninClick = () => {
  // Track 'home_loyaltybanner_signin_click'
  analyticsService.trackEvent('home_loyaltybanner_signin_click', {});
  navigate('/auth/login');
};

  return (
    <Container aria-label={t('home.loyaltyBanner.title')}>
      <Title>{t('home.loyaltyBanner.title')}</Title>
      <BenefitsTitle>{t('home.loyaltyBanner.benefitsTitle')}</BenefitsTitle>
      <BenefitsList>
        <BenefitItem>{t('home.loyaltyBanner.benefit1')}</BenefitItem>
        <BenefitItem>{t('home.loyaltyBanner.benefit2')}</BenefitItem>
        <BenefitItem>{t('home.loyaltyBanner.benefit3')}</BenefitItem>
      </BenefitsList>
      <Actions>
        <CTAButton data-action="signup" onClick={() => navigate('/auth/register')}>{t('home.loyaltyBanner.cta')}</CTAButton>
        <CTAButton data-action="signin" onClick={handleSigninClick}>{t('home.loyaltyBanner.altCta')}</CTAButton>
      </Actions>
    </Container>
  );
});

export default LoyaltyBanner;
