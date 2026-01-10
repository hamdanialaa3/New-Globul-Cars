import React from 'react';
import styled from 'styled-components';
import { Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { glassPrimaryButton } from '../../../../styles/glassmorphism-buttons';

const Container = styled.div`
  padding: 40px 20px;
  background: linear-gradient(90deg, rgba(79, 70, 229, 0.11) 37%, rgba(124, 58, 237, 0.66) 100%);
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
  ${glassPrimaryButton}
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  
  /* Override colors for theme - Glass orange effect */
  background: linear-gradient(135deg, 
    rgba(255, 143, 16, 0.4) 0%, 
    rgba(255, 143, 16, 0.2) 100%
  );
  color: #fff;
  border: 1px solid rgba(255, 143, 16, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 143, 16, 0.6) 0%, 
      rgba(255, 143, 16, 0.3) 100%
    );
    border-color: rgba(255, 143, 16, 0.6);
    box-shadow: 
      0 8px 32px 0 rgba(255, 143, 16, 0.5),
      0 0 20px rgba(255, 143, 16, 0.4);
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(-1px);
    }
  }
`;

const SmartSellStrip: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
      <Button onClick={() => navigate('/sell/auto')}>
        {t('home.smartSell.startSelling')}
        <ArrowRight size={20} />
      </Button>
    </Container>
  );
};

export default SmartSellStrip;
