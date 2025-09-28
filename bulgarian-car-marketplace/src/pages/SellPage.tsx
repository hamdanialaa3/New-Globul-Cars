import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

const SellPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;


const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 4rem 3rem;
  margin: 2rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: #7f8c8d;
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  padding: 2.5rem;
  margin: 3rem 0;
  border-left: 4px solid #667eea;
`;

const InfoTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
`;

const InfoText = styled.div`
  font-size: 1rem;
  color: #495057;
  line-height: 1.8;
  
  strong {
    color: #2c3e50;
    font-weight: 600;
  }
`;


const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStartSelling = () => {
    navigate('/sell/auto');
  };

  return (
    <SellPageContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>{t('sell.hero.title')}</Title>
          <Subtitle>{t('sell.hero.subtitle')}</Subtitle>
          <StartButton onClick={handleStartSelling}>{t('sell.hero.startNow')}</StartButton>
        </HeaderCard>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🚗</FeatureIcon>
            <FeatureTitle>{t('sell.features.fast.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.fast.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>{t('sell.features.mobile.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.mobile.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>{t('sell.features.secure.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.secure.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>{t('sell.features.free.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.free.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>👥</FeatureIcon>
            <FeatureTitle>{t('sell.features.audience.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.audience.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>{t('sell.features.analytics.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.analytics.description')}</FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <InfoCard>
          <InfoTitle>{t('sell.howItWorks.title')}</InfoTitle>
          <InfoText>
            {t('sell.howItWorks.steps.0')}<br/>
            {t('sell.howItWorks.steps.1')}<br/>
            {t('sell.howItWorks.steps.2')}<br/>
            {t('sell.howItWorks.steps.3')}<br/>
            {t('sell.howItWorks.steps.4')}<br/>
            {t('sell.howItWorks.steps.5')}<br/>
            {t('sell.howItWorks.steps.6')}
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </SellPageContainer>
  );
};

export default SellPage;
