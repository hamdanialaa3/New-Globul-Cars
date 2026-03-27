import React from 'react';
import styled from 'styled-components';
import { BarChart2, PieChart, TrendingUp, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Container = styled.section`
  padding: 80px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  margin: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--accent-primary);
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  color: var(--accent-primary);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Light mode: Orange gradient background, White text */
  html[data-theme="light"] & {
    background: var(--btn-primary-bg);
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: var(--btn-primary-bg);
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }

  &:hover {
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: var(--btn-primary-bg);
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: var(--btn-primary-bg);
      color: #000000 !important;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
  }

  &:active {
    transform: translateY(-1px);
    html[data-theme="light"] & {
      background: var(--btn-primary-bg);
      color: #ffffff !important;
    }
    html[data-theme="dark"] & {
      background: var(--btn-primary-bg);
      color: #000000 !important;
    }
  }
`;

const AIAnalyticsTeaser: React.FC = () => {
    const { t } = useLanguage();
    
    return (
        <Container>
            <Content>
                <Title>{t('home.aiAnalytics.title')}</Title>
                <Subtitle>
                    {t('home.aiAnalytics.subtitle')}
                </Subtitle>

                <FeaturesGrid>
                    <Feature>
                        <IconWrapper><BarChart2 size={28} /></IconWrapper>
                        <FeatureTitle>{t('home.aiAnalytics.priceTrends')}</FeatureTitle>
                    </Feature>
                    <Feature>
                        <IconWrapper><PieChart size={28} /></IconWrapper>
                        <FeatureTitle>{t('home.aiAnalytics.marketShare')}</FeatureTitle>
                    </Feature>
                    <Feature>
                        <IconWrapper><TrendingUp size={28} /></IconWrapper>
                        <FeatureTitle>{t('home.aiAnalytics.forecasts')}</FeatureTitle>
                    </Feature>
                </FeaturesGrid>

                <Button>
                    {t('home.aiAnalytics.viewAnalytics')}
                    <ArrowRight size={20} />
                </Button>
            </Content>
        </Container>
    );
};

export default AIAnalyticsTeaser;

