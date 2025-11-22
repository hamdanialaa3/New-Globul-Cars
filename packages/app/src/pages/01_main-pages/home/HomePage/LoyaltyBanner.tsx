// LoyaltyBanner.tsx
// Encourages registration / login to unlock platform benefits

import React, { memo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/coreLanguageContext';
import { useAuth } from '@globul-cars/coreAuthProvider';

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
  background: #fff;
  color: var(--accent-primary);
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Martica', 'Arial', sans-serif;
  box-shadow: var(--shadow-sm);
  transition: background 0.15s ease, color 0.15s ease;
  &:hover { background: rgba(255,255,255,0.85); }
  &:active { background: rgba(255,255,255,0.75); }
`;

const LoyaltyBanner: React.FC = memo(() => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  // Only render if unauthenticated (guard against flicker with currentUser check)
  if (currentUser) return null;

  // TODO(analytics): Fire 'home_loyaltybanner_view' when visible & unauthenticated
  // TODO(analytics): Track 'home_loyaltybanner_signup_click' & 'home_loyaltybanner_signin_click'

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
        <CTAButton data-action="signup">{t('home.loyaltyBanner.cta')}</CTAButton>
        <CTAButton data-action="signin">{t('home.loyaltyBanner.altCta')}</CTAButton>
      </Actions>
    </Container>
  );
});

export default LoyaltyBanner;
