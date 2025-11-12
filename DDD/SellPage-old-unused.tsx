import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { Car, Smartphone, Shield, DollarSign, Users, BarChart3, Sparkles, Zap } from 'lucide-react';

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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 3rem;
  margin: 2rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 143, 16, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.9rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0 0 1.75rem 0;
  line-height: 1.5;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #ff8f10, #005ca9);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
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

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const SmartButton = styled.button`
  background: white;
  color: #ff8f10;
  border: 2px solid #ff8f10;
  border-radius: 50px;
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.15);
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #ff8f10, #005ca9);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 143, 16, 0.3);
  }

  svg {
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ComingSoonBadge = styled.span`
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-left: 0.5rem;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 143, 16, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(255, 143, 16, 0.2);
    border-color: rgba(255, 143, 16, 0.3);
  }
`;

const FeatureIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 143, 16, 0.1), rgba(0, 92, 169, 0.1));
  transition: all 0.3s ease;

  svg {
    width: 28px;
    height: 28px;
    color: #ff8f10;
    transition: all 0.3s ease;
  }

  ${FeatureCard}:hover & {
    background: linear-gradient(135deg, #ff8f10, #005ca9);
    transform: scale(1.1);
    
    svg {
      color: white;
    }
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  padding: 2rem;
  margin: 3rem 0;
  border-left: 4px solid #ff8f10;
`;

const InfoTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
`;

const StepsList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: step-counter;
`;

const StepItem = styled.li`
  counter-increment: step-counter;
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  padding: 1.2rem;
  margin-bottom: 0.8rem;
  background: white;
  border-radius: 10px;
  border-left: 3px solid #ff8f10;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 15px rgba(255, 143, 16, 0.15);
  }

  &::before {
    content: counter(step-counter);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 35px;
    height: 35px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff8f10, #005ca9);
    color: white;
    font-weight: 700;
    font-size: 1rem;
  }
`;

const StepText = styled.div`
  flex: 1;
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.6;
  padding-top: 0.4rem;
`;


const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showSmartInfo, setShowSmartInfo] = useState(false);

  const handleStartSelling = () => {
    navigate('/sell/auto');
  };

  const handleSmartAdd = () => {
    setShowSmartInfo(true);
    setTimeout(() => setShowSmartInfo(false), 3000);
  };

  return (
    <SellPageContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>{t('sell.hero.title')}</Title>
          <Subtitle>{t('sell.hero.subtitle')}</Subtitle>
          
          <ButtonsContainer>
            <StartButton onClick={handleStartSelling}>
              <Car size={20} />
              {t('sell.hero.startNow')}
            </StartButton>
            
            <SmartButton onClick={handleSmartAdd}>
              <Sparkles size={20} />
              {t('sell.hero.smartAdd')}
              <ComingSoonBadge>Soon</ComingSoonBadge>
            </SmartButton>
          </ButtonsContainer>

          {showSmartInfo && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(255, 143, 16, 0.1), rgba(0, 92, 169, 0.1))',
              borderRadius: '12px',
              border: '2px solid #ff8f10',
              color: '#2c3e50',
              fontSize: '0.95rem',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              <Zap size={24} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem', color: '#ff8f10' }} />
              <strong>{t('sell.hero.smartAddDescription')}</strong>
            </div>
          )}
        </HeaderCard>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>
              <Car />
            </FeatureIcon>
            <FeatureTitle>{t('sell.features.fast.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.fast.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Smartphone />
            </FeatureIcon>
            <FeatureTitle>{t('sell.features.mobile.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.mobile.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Shield />
            </FeatureIcon>
            <FeatureTitle>{t('sell.features.secure.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.secure.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <DollarSign />
            </FeatureIcon>
            <FeatureTitle>{t('sell.features.free.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.free.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <Users />
            </FeatureIcon>
            <FeatureTitle>{t('sell.features.audience.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.audience.description')}</FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <BarChart3 />
            </FeatureIcon>
            <FeatureTitle>{t('sell.features.analytics.title')}</FeatureTitle>
            <FeatureDescription>{t('sell.features.analytics.description')}</FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <InfoCard>
          <InfoTitle>{t('sell.howItWorks.title')}</InfoTitle>
          <StepsList>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.0')}</StepText>
            </StepItem>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.1')}</StepText>
            </StepItem>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.2')}</StepText>
            </StepItem>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.3')}</StepText>
            </StepItem>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.4')}</StepText>
            </StepItem>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.5')}</StepText>
            </StepItem>
            <StepItem>
              <StepText>{t('sell.howItWorks.steps.6')}</StepText>
            </StepItem>
          </StepsList>
        </InfoCard>
      </ContentWrapper>
    </SellPageContainer>
  );
};

export default SellPage;
