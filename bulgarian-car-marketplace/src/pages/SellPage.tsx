import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const StepContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  margin: 2rem 0;
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

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const StepTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StepSubtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  position: relative;
  overflow: hidden;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          
          &:hover {
            background: #e9ecef;
            color: #495057;
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          
          &:hover {
            background: #667eea;
            color: white;
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
          
          &:hover {
            background: #5a6268;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
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

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 200px;
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.5s ease;
  }
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

  const handleStartSelling = () => {
    navigate('/sell/auto');
  };

  return (
    <SellPageContainer>
      <ContentWrapper>
        <HeaderCard>
          <Title>Продайте превозното си средство</Title>
          <Subtitle>
            Създайте професионална обява за вашето превозно средство с нашата 
            интуитивна система за създаване на обяви
          </Subtitle>
          <StartButton onClick={handleStartSelling}>
            Започнете сега
          </StartButton>
        </HeaderCard>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🚗</FeatureIcon>
            <FeatureTitle>Лесно и бързо</FeatureTitle>
            <FeatureDescription>
              Създайте обява за по-малко от 10 минути с нашата стъпка по стъпка система
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>Мобилно приложение</FeatureTitle>
            <FeatureDescription>
              Управлявайте обявите си от всяко място с нашето мобилно приложение
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Безопасно</FeatureTitle>
            <FeatureDescription>
              Всички ваши данни са защитени с най-високите стандарти за сигурност
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>Безплатно</FeatureTitle>
            <FeatureDescription>
              Създавайте и управлявайте обявите си напълно безплатно
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>👥</FeatureIcon>
            <FeatureTitle>Широка аудитория</FeatureTitle>
            <FeatureDescription>
              Достигнете хиляди потенциални купувачи в цяла България
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Аналитика</FeatureTitle>
            <FeatureDescription>
              Следете представянето на обявите си с детайлна аналитика
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <InfoCard>
          <InfoTitle>ℹ️ Как работи системата?</InfoTitle>
          <InfoText>
            1. <strong>Изберете типа на превозното средство</strong> - лека кола, джип, ван, мотоциклет<br/>
            2. <strong>Попълнете основните данни</strong> - марка, модел, година, пробег<br/>
            3. <strong>Добавете оборудването</strong> - безопасност, комфорт, инфотейнмънт<br/>
            4. <strong>Качете снимки</strong> - до 20 снимки с високо качество<br/>
            5. <strong>Определете цената</strong> - фиксирана или договорна<br/>
            6. <strong>Добавете контакт</strong> - име, телефон, адрес<br/>
            7. <strong>Публикувайте</strong> - обявата е готова!
          </InfoText>
        </InfoCard>
      </ContentWrapper>
    </SellPageContainer>
  );
};

export default SellPage;
