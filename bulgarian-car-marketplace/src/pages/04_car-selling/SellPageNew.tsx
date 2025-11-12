// Sell Page with Workflow Visualization
// صفحة البيع مع تصور الأتمتة - تصميم split screen

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { Car, Sparkles } from 'lucide-react';
import SplitScreenLayout from '../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../components/WorkflowVisualization';

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeaderCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  border: 1px solid rgba(255, 143, 16, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
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
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0 0 1.75rem 0;
  line-height: 1.5;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(255, 143, 16, 0.4);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #ff8f10, #005ca9);
    color: white;
  }

  svg {
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
  }
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.5rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 143, 16, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 143, 16, 0.15);
  }
`;

const FeatureTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const FeatureDescription = styled.p`
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
`;

const SellPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const workflowSteps = [
    { id: 'start', label: 'Start', icon: undefined, isCompleted: true },
    { id: 'vehicle', label: 'Vehicle Type', icon: undefined, isCompleted: false },
    { id: 'seller', label: 'Seller Type', icon: undefined, isCompleted: false },
    { id: 'data', label: 'Vehicle Data', icon: undefined, isCompleted: false },
    { id: 'equipment', label: 'Equipment', icon: undefined, isCompleted: false },
    { id: 'images', label: 'Images', icon: undefined, isCompleted: false },
    { id: 'pricing', label: 'Pricing', icon: undefined, isCompleted: false },
    { id: 'contact', label: 'Contact', icon: undefined, isCompleted: false },
    { id: 'publish', label: 'Publish', icon: undefined, isCompleted: false }
  ];

  const leftContent = (
    <ContentSection>
      <HeaderCard>
        <Title>{t('sell.hero.title')}</Title>
        <Subtitle>{t('sell.hero.subtitle')}</Subtitle>
        
        <ButtonsContainer>
          <StartButton onClick={() => navigate('/sell/auto')}>
            <Car size={20} />
            {t('sell.hero.startNow')}
          </StartButton>
          
          <SmartButton onClick={() => alert(t('sell.hero.smartAddDescription'))}>
            <Sparkles size={20} />
            {t('sell.hero.smartAdd')}
            <Badge>Soon</Badge>
          </SmartButton>
        </ButtonsContainer>
      </HeaderCard>

      <FeaturesGrid>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.fast.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.fast.description')}</FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.mobile.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.mobile.description')}</FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.secure.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.secure.description')}</FeatureDescription>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>{t('sell.features.free.title')}</FeatureTitle>
          <FeatureDescription>{t('sell.features.free.description')}</FeatureDescription>
        </FeatureCard>
      </FeaturesGrid>
    </ContentSection>
  );

  const rightContent = (
    <WorkflowFlow
      currentStepIndex={0}
      totalSteps={9}
      language={language}
    />
  );

  return <SplitScreenLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default SellPageNew;

