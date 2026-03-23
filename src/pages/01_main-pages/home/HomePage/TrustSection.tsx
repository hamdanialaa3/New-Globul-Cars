// Trust Section - Why Choose Us (Competitive Edge)
// قسم الثقة - لماذا تختارنا (ميزة تنافسية)

import React from 'react';
import styled from 'styled-components';
import { Shield, FileText, History, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TrustSectionContainer = styled.section`
  margin-top: 100px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 24px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#262626' : '#e5e7eb'};
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.mode === 'dark' ? '#404040' : '#d1d5db'} transparent;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#404040' : '#d1d5db'};
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    margin-top: 60px;
    padding: 20px 16px;
    gap: 16px;
  }
`;

const TrustItem = styled.div`
  text-align: center;
  padding: 16px;
  min-width: 200px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    min-width: 160px;
    padding: 12px;
  }
`;

const TrustIcon = styled.div`
  font-size: 1.75rem;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : 'var(--accent-primary)'};
  
  svg {
    width: 36px;
    height: 36px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 10px;
    
    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

const TrustTitle = styled.h4`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    margin-bottom: 6px;
  }
`;

const TrustDesc = styled.p`
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

interface TrustFeature {
  icon: React.ReactNode;
  titleBg: string;
  titleEn: string;
  descBg: string;
  descEn: string;
}

const TRUST_FEATURES: TrustFeature[] = [
  {
    icon: <Shield />,
    titleBg: 'Проверени Дилъри',
    titleEn: 'Verified Dealers',
    descBg: 'Работим само с лицензирани автокъщи в България за вашата сигурност.',
    descEn: 'We work only with licensed car dealerships in Bulgaria for your security.'
  },
  {
    icon: <FileText />,
    titleBg: 'Лизинг & Застраховка',
    titleEn: 'Financing & Insurance',
    descBg: 'Получете оферти за финансиране и каско директно през платформата.',
    descEn: 'Get financing and insurance quotes directly through the platform.'
  },
  {
    icon: <History />,
    titleBg: 'История на автомобила',
    titleEn: 'Vehicle History',
    descBg: 'Възможност за проверка на VIN номера преди покупка.',
    descEn: 'Ability to check VIN number before purchase.'
  },
  {
    icon: <RefreshCw />,
    titleBg: '360° Преглед',
    titleEn: '360° View',
    descBg: 'Виртуални огледи за избрани премиум автомобили.',
    descEn: 'Virtual tours for selected premium vehicles.'
  }
];

const TrustSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <TrustSectionContainer>
      {TRUST_FEATURES.map((feature, index) => (
        <TrustItem key={index}>
          <TrustIcon>
            {feature.icon}
          </TrustIcon>
          <TrustTitle>
            {language === 'bg' ? feature.titleBg : feature.titleEn}
          </TrustTitle>
          <TrustDesc>
            {language === 'bg' ? feature.descBg : feature.descEn}
          </TrustDesc>
        </TrustItem>
      ))}
    </TrustSectionContainer>
  );
};

export default TrustSection;
