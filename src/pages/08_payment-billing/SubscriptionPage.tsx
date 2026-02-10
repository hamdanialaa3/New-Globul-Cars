// src/pages/SubscriptionPage.tsx - WORLD CLASS REDESIGN
// Theme: Royal Night (Deep Blue + Aurora)

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import SubscriptionManager from '../../components/subscription/SubscriptionManager';
import { useAuth } from '../../contexts/AuthProvider';
import { subscriptionTheme } from '../../components/subscription/subscription-theme'; // Use new theme
import {
  ArrowLeft, CheckCircle, Sparkles, Zap, ChevronDown,
  HelpCircle, Target, Shield, Globe, Award,
  BarChart3, MessageSquare, Quote, Star
} from 'lucide-react';
import { toast } from 'react-toastify';

// ============================================================================
// ANIMATIONS
// ============================================================================

const auroraMovement = keyframes`
  0% { background-position: 50% 50%, 50% 50%; }
  50% { background-position: 100% 0%, 0% 100%; }
  100% { background-position: 50% 50%, 50% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${subscriptionTheme.colors.bg.primary};
  background-image: 
    radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%);
  color: ${subscriptionTheme.colors.text.primary};
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;

  /* Global Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #0f172a;
  }
  &::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
`;

// --- Navigation ---
const NavHeader = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${subscriptionTheme.colors.text.secondary};
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(-2px);
  }
`;

// --- Hero Section ---
const HeroSection = styled.header`
  padding: 8rem 1rem 4rem;
  text-align: center;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;

  /* Ambient light behind text */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%);
    z-index: -1;
    filter: blur(40px);
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 99px;
  color: #d8b4fe;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out;

  svg { width: 14px; height: 14px; }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${fadeInUp} 0.6s ease-out 0.1s backwards;

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${subscriptionTheme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  animation: ${fadeInUp} 0.6s ease-out 0.2s backwards;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

// --- Pricing Container (Managed by SubscriptionManager) ---
const PricingContainer = styled.div`
  padding: 0 1rem;
  margin-bottom: 6rem;
  animation: ${fadeInUp} 0.8s ease-out 0.3s backwards;
`;

// --- Trust/Social Proof ---
const TrustSection = styled.div`
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.2);
  padding: 2rem 0;
  margin-bottom: 6rem;
`;

const MarqueeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 3rem;
  opacity: 0.5;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: white;
    font-size: 1.1rem;
    
    svg { color: #a855f7; }
  }
`;

// --- Comparison Table ---
const ComparisonSection = styled.section`
  max-width: 1000px;
  margin: 0 auto 6rem;
  padding: 0 1rem;
`;

const GlassCard = styled.div`
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2rem;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
    overflow-x: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; // ensure scroll on mobile
`;

const Th = styled.th`
  text-align: left;
  padding: 1.5rem 1rem;
  color: ${subscriptionTheme.colors.text.secondary};
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:first-child { width: 40%; }
  &:not(:first-child) { 
    text-align: center; 
    width: 20%;
    color: white;
    font-weight: 700;
  }
`;

const Td = styled.td`
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: ${subscriptionTheme.colors.text.primary};

  &:not(:first-child) {
    text-align: center;
  }

  svg {
    color: #a855f7;
    width: 20px;
    height: 20px;
  }
`;

// --- FAQ Section ---
const FAQSection = styled.section`
  max-width: 800px;
  margin: 0 auto 8rem;
  padding: 0 1rem;
`;

const FAQHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  p {
    color: ${subscriptionTheme.colors.text.secondary};
  }
`;

const AccordionItem = styled.div<{ $isOpen: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;

  ${p => p.$isOpen && css`
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(168, 85, 247, 0.3);
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.05);
  `}
`;

const AccordionTrigger = styled.button`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  text-align: left;

  svg {
    transition: transform 0.3s ease;
    color: ${subscriptionTheme.colors.text.secondary};
  }
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${p => p.$isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 1.5rem;
  
  p {
    padding-bottom: 1.5rem;
    color: ${subscriptionTheme.colors.text.secondary};
    line-height: 1.6;
    margin: 0;
  }
`;

// --- Component Logic ---
const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBg = language === 'bg';
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Content Data
  const texts = {
    back: isBg ? 'Назад' : 'Back',
    badge: isBg ? 'Премиум Планове' : 'Premium Plans',
    title: isBg ? 'Отключете пълния си потенциал' : 'Unlock Your Full Potential',
    subtitle: isBg
      ? 'Изберете план, който отговаря на вашите нужди. Без скрити такси. Прозрачно и честно.'
      : 'Choose a plan that fits your ambition. No hidden fees. Transparent and fair.',
    trust: {
      secure: isBg ? 'SSL Защита' : 'SSL Secure',
      support: isBg ? '24/7 Поддръжка' : '24/7 Support',
      guarantee: isBg ? '30 дни гаранция' : '30-Day Guarantee',
    },
    comparison: {
      title: isBg ? 'Сравнете плановете' : 'Compare Plans',
      features: isBg ? 'Функция' : 'Feature',
      free: isBg ? 'Безплатен' : 'Free',
      dealer: isBg ? 'Дилър' : 'Dealer',
      company: isBg ? 'Компания' : 'Company',
    }
  };

  const comparisonData = [
    { feature: isBg ? 'Обяви' : 'Listings', free: '3', dealer: '100', company: '∞' },
    { feature: isBg ? 'AI Оценка' : 'AI Valuation', free: 'Basic', dealer: 'Advanced', company: 'Pro' },
    { feature: isBg ? 'Снимки/Кола' : 'Photos/Car', free: '10', dealer: '30', company: '50' },
    { feature: isBg ? 'Поддръжка' : 'Support', free: 'Email', dealer: 'Priority', company: 'Dedicated' },
  ];

  const faqs = [
    {
      q: isBg ? 'Мога ли да откажа по всяко време?' : 'Can I cancel at any time?',
      a: isBg ? 'Да, можете да прекратите абонамента си по всяко време без неустойки.' : 'Yes, you can cancel your subscription at any time with no penalties.'
    },
    {
      q: isBg ? 'Какви методи на плащане приемате?' : 'What payment methods do you accept?',
      a: isBg ? 'Приемаме всички основни кредитни карти и банкови преводи.' : 'We accept all major credit cards and bank transfers.'
    },
    {
      q: isBg ? 'Има ли безплатен пробен период?' : 'Is there a free trial?',
      a: isBg ? 'Предлагаме 14-дневен пробен период за Дилърския план.' : 'We offer a 14-day free trial on the Dealer plan.'
    }
  ];

  return (
    <PageContainer>
      <NavHeader>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          {texts.back}
        </BackButton>
      </NavHeader>

      <HeroSection>
        <Badge>
          <Sparkles />
          {texts.badge}
        </Badge>
        <Title>{texts.title}</Title>
        <Subtitle>{texts.subtitle}</Subtitle>
      </HeroSection>

      <PricingContainer>
        <SubscriptionManager />
      </PricingContainer>

      <TrustSection>
        <MarqueeContainer>
          <div><Shield size={20} /> {texts.trust.secure}</div>
          <div><Globe size={20} /> Global Reach</div>
          <div><Award size={20} /> Top Rated</div>
          <div><CheckCircle size={20} /> Verified</div>
        </MarqueeContainer>
      </TrustSection>

      <ComparisonSection>
        <FAQHeader>
          <h2>{texts.comparison.title}</h2>
        </FAQHeader>
        <GlassCard>
          <Table>
            <thead>
              <tr>
                <Th>{texts.comparison.features}</Th>
                <Th>{texts.comparison.free}</Th>
                <Th>{texts.comparison.dealer}</Th>
                <Th>{texts.comparison.company}</Th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i}>
                  <Td>{row.feature}</Td>
                  <Td>{row.free}</Td>
                  <Td>{row.dealer}</Td>
                  <Td>{row.company}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </GlassCard>
      </ComparisonSection>

      <FAQSection>
        <FAQHeader>
          <h2>FAQ</h2>
          <p>{isBg ? 'Често задавани въпроси' : 'Frequently Asked Questions'}</p>
        </FAQHeader>
        {faqs.map((item, idx) => (
          <AccordionItem key={idx} $isOpen={openFAQ === idx}>
            <AccordionTrigger onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}>
              {item.q}
              <ChevronDown
                size={20}
                style={{ transform: openFAQ === idx ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </AccordionTrigger>
            <AccordionContent $isOpen={openFAQ === idx}>
              <p>{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </FAQSection>
    </PageContainer>
  );
};

export default SubscriptionPage;
