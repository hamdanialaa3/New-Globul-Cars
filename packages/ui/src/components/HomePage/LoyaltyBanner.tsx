// Loyalty Banner Component
// Final CTA banner for registration

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@globul-cars/core';

const BannerContainer = styled.section`
  background: linear-gradient(135deg, #0055A4 0%, #003366 100%);
  color: white;
  padding: 60px 20px;
  margin: 40px 0;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 85, 164, 0.3);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 143, 16, 0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    padding: 48px 16px;
    margin: 24px 0;
    border-radius: 12px;
  }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(255, 143, 16, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: #FF8F10;
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.1) rotate(180deg);
      opacity: 0.8;
    }
  }

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;

    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    font-size: 0.9375rem;
    margin-bottom: 20px;
  }
`;

const CTAContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PrimaryCTA = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  background: #FF8F10;
  color: #000;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 143, 16, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 143, 16, 0.5);
    background: #ff9f30;

    svg {
      transform: translateX(4px);
    }
  }

  svg {
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 14px 32px;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    padding: 12px 24px;
    font-size: 0.9375rem;
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
`;

const SecondaryLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  text-decoration: underline;
  text-underline-offset: 4px;

  &:hover {
    color: white;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const LoyaltyBanner: React.FC = () => {
  const { language } = useLanguage();

  return (
    <BannerContainer>
      <Container>
        <IconWrapper>
          <Sparkles />
        </IconWrapper>

        <Title>
          {language === 'bg'
            ? 'Създай профил и отключи аналитики'
            : 'Create Your Profile and Unlock Analytics'}
        </Title>

        <Description>
          {language === 'bg'
            ? 'Получете достъп до AI оценка, аналитики и безплатно подчертаване на първия ви обява за 7 дни.'
            : 'Get access to AI valuation, analytics, and free highlight for your first listing for 7 days.'}
        </Description>

        <CTAContainer>
          <PrimaryCTA to="/register">
            {language === 'bg' ? 'Регистрация' : 'Register'}
            <ArrowRight size={20} />
          </PrimaryCTA>
          <SecondaryLink to="/register?learn-more=true">
            {language === 'bg' ? 'Научете повече' : 'Learn More'}
          </SecondaryLink>
        </CTAContainer>
      </Container>
    </BannerContainer>
  );
};

export default LoyaltyBanner;

