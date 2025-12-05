// src/pages/SubscriptionPage.tsx
// Subscription Management Page for Bulgarian Car Marketplace

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import SubscriptionManager from '../../components/subscription/SubscriptionManager';
import { useAuth } from '../../contexts/AuthProvider';
import { 
  Crown, ArrowLeft, Star, Shield, TrendingUp, Users, 
  CheckCircle, Sparkles, Award, Zap, Clock, HeartHandshake 
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors?.background || '#0a0a0a'} 0%,
    ${({ theme }) => theme.colors?.backgroundSecondary || '#1a1a1a'} 100%
  );
  padding: 0;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
  padding: 3rem 0;
  box-shadow: 0 4px 20px rgba(255, 143, 16, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Content = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: rgba(255, 143, 16, 0.1);
  color: #FF8F10;
  border: 2px solid rgba(255, 143, 16, 0.3);
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;

  &:hover {
    background: rgba(255, 143, 16, 0.2);
    border-color: #FF8F10;
    transform: translateX(-4px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SubscriptionPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isBg = language === 'bg';

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Will redirect
  }

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <HeaderTop>
            <IconWrapper>
              <Crown />
            </IconWrapper>
            <div>
              <HeaderTitle>
                {isBg ? 'Планове и Цени' : 'Plans & Pricing'}
              </HeaderTitle>
            </div>
          </HeaderTop>
          <HeaderSubtitle>
            {isBg 
              ? 'Изберете перфектния план за вашия бизнес. Продавайте повече автомобили с нашите професионални инструменти.'
              : 'Choose the perfect plan for your business. Sell more cars with our professional tools.'
            }
          </HeaderSubtitle>
        </HeaderContent>
      </Header>

      <Content>
        <BackButton onClick={() => navigate('/')}>
          <ArrowLeft />
          {isBg ? 'Назад към начало' : 'Back to Home'}
        </BackButton>

        <SubscriptionManager />
      </Content>
    </PageContainer>
  );
};

export default SubscriptionPage;