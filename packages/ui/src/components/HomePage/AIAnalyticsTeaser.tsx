// AI & Analytics Teaser Component
// Displays 3 AI/Analytics features to encourage registration

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { TrendingUp, Globe, BarChart3 } from 'lucide-react';
import { useLanguage } from '@globul-cars/core';

const TeaserContainer = styled.section`
  background: linear-gradient(135deg, #0055A4 0%, #003366 100%);
  color: white;
  padding: 60px 20px;
  margin: 40px 0;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 85, 164, 0.3);

  @media (max-width: 768px) {
    padding: 40px 16px;
    margin: 24px 0;
    border-radius: 12px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: white;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 32px;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
    margin-bottom: 24px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 40px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, background 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: rgba(0, 150, 110, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 32px;
    height: 32px;
    color: #00966E;
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;

    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: white;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 8px;
  }
`;

const FeatureDescription = styled.p`
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const CTAContainer = styled.div`
  text-align: center;
  margin-top: 40px;

  @media (max-width: 768px) {
    margin-top: 32px;
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

const AIAnalyticsTeaser: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: TrendingUp,
      title: language === 'bg' ? 'AI-Driven Value' : 'AI-Driven Value',
      description: language === 'bg' 
        ? 'Получете справедлива оценка на пазарната стойност на вашата кола веднага преди продажба.'
        : 'Get a fair market value assessment for your car instantly before selling.',
      link: '/ai-dashboard',
    },
    {
      icon: Globe,
      title: language === 'bg' ? 'Digital Twin View' : 'Digital Twin View',
      description: language === 'bg'
        ? 'Вижте цифровия двойник на колата и нейната напълно документирана история.'
        : 'View the car\'s digital twin and its fully documented history.',
      link: '/digital-twin',
    },
    {
      icon: BarChart3,
      title: language === 'bg' ? 'Analytics Portal' : 'Analytics Portal',
      description: language === 'bg'
        ? 'Дълбоки B2B анализи на българския пазар за търговци и инвеститори.'
        : 'Deep B2B analytics of the Bulgarian market for dealers and investors.',
      link: '/analytics',
    },
  ];

  return (
    <TeaserContainer>
      <Container>
        <Title>
          {language === 'bg' ? 'Вашата Интелигентна Предимство' : 'Your Intelligent Advantage'}
        </Title>
        
        <FeaturesGrid>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <FeatureCard key={index}>
                <IconWrapper>
                  <IconComponent />
                </IconWrapper>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            );
          })}
        </FeaturesGrid>

        <CTAContainer>
          <CTAButton to="/register">
            {language === 'bg' ? 'Отключете Всички Функции' : 'Unlock All Features'}
          </CTAButton>
        </CTAContainer>
      </Container>
    </TeaserContainer>
  );
};

export default AIAnalyticsTeaser;

