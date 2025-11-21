// Smart Sell Strip Component
// Horizontal banner promoting the sell workflow

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Camera, DollarSign, Upload } from 'lucide-react';
import { useLanguage } from '@globul-cars/core';

const StripContainer = styled.section`
  background: linear-gradient(135deg, #00966E 0%, #007a5a 100%);
  color: white;
  padding: 48px 20px;
  margin: 40px 0;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 150, 110, 0.3);
  text-align: center;

  @media (max-width: 768px) {
    padding: 36px 16px;
    margin: 24px 0;
    border-radius: 12px;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
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

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const StepIcon = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);

  svg {
    width: 28px;
    height: 28px;
    color: white;
  }

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const StepLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const Arrow = styled.span`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 16px 40px;
  background: #FF8F10;
  color: #000;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 143, 16, 0.4);
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 143, 16, 0.5);
    background: #ff9f30;
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
  }
`;

const MicroStat = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const SmartSellStrip: React.FC = () => {
  const { language } = useLanguage();

  const steps = [
    {
      icon: Camera,
      label: language === 'bg' ? 'Снимай' : 'Photo',
    },
    {
      icon: DollarSign,
      label: language === 'bg' ? 'Оцени' : 'Value',
    },
    {
      icon: Upload,
      label: language === 'bg' ? 'Публикувай' : 'Publish',
    },
  ];

  return (
    <StripContainer>
      <Container>
        <Title>
          {language === 'bg' 
            ? 'Продайте Колата си Умно. Първи Контакт за 24ч.'
            : 'Sell Your Car Smart. First Contact in 24h.'}
        </Title>
        
        <Subtitle>
          {language === 'bg'
            ? 'Започнете сега - получавайте първи контакт от купувач средно за 24 часа.'
            : 'Start now - get your first buyer contact on average within 24 hours.'}
        </Subtitle>

        <StepsContainer>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <React.Fragment key={index}>
                <StepItem>
                  <StepIcon>
                    <IconComponent />
                  </StepIcon>
                  <StepLabel>{step.label}</StepLabel>
                </StepItem>
                {index < steps.length - 1 && <Arrow>→</Arrow>}
              </React.Fragment>
            );
          })}
        </StepsContainer>

        <CTAButton to="/sell">
          {language === 'bg' ? 'Продайте за 5 минути' : 'Sell in 5 Minutes'}
        </CTAButton>

        <MicroStat>
          {language === 'bg'
            ? 'Средно 24 часа до първи купувач контакт.'
            : 'Average 24 hours to first buyer contact.'}
        </MicroStat>
      </Container>
    </StripContainer>
  );
};

export default SmartSellStrip;

