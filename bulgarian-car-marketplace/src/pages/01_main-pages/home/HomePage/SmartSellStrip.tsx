import React from 'react';
import styled from 'styled-components';
import { Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Container = styled.div`
  padding: 40px 20px;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 30px 20px;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
    font-size: 1.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
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
  white-space: nowrap;
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

const SmartSellStrip: React.FC = () => {
    const { t } = useLanguage();
    
    return (
        <Container>
            <Content>
                <Title>
                    <Zap size={28} fill="white" />
                    {t('home.smartSell.title')}
                </Title>
                <Description>
                    {t('home.smartSell.description')}
                </Description>
            </Content>
            <Button>
                {t('home.smartSell.startSelling')}
                <ArrowRight size={20} />
            </Button>
        </Container>
    );
};

export default SmartSellStrip;
