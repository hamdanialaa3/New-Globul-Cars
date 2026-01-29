/**
 * AI Car Advisor Page
 * 
 * "Start Advisor" landing page and wizard container.
 * Features:
 * - Intelligent questionnaire
 * - AI-driven recommendations
 * - Multi-step wizard flow
 */

import React, { useState, Suspense } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ArrowRight, Check, Search, Gauge, Shield, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Styled Components
const PageContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  padding-top: 80px; // Clear fixed header
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
  font-family: 'Martica', sans-serif;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled(motion.h1) <{ $isDark: boolean }>`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: ${props => props.$isDark
        ? 'linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #ec4899 100%)'
        : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Subtitle = styled(motion.p) <{ $isDark: boolean }>`
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const StartButton = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1rem 3rem;
  border-radius: 9999px;
  font-size: 1.125rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
`;

const FeatureCard = styled(motion.div) <{ $isDark: boolean }>`
  background: ${props => props.$isDark ? 'rgba(30, 41, 59, 0.5)' : 'white'};
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid ${props => props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  text-align: left;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
`;

const FeatureDesc = styled.p<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  line-height: 1.5;
`;

const AIAdvisorPage: React.FC = () => {
    const { language } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const isBg = language === 'bg';
    const navigate = useNavigate();

    const [viewState, setViewState] = useState<'hero' | 'wizard' | 'results'>('hero');
    const [advisorData, setAdvisorData] = useState<AdvisorData | null>(null);

    // Translations
    const t = {
        title: isBg ? 'AI Автомобилен Съветник' : 'AI Car Advisor',
        subtitle: isBg
            ? 'Не сте сигурни каква кола търсите? Нашият изкуствен интелект ще анализира вашите нужди, бюджет и стил на шофиране, за да намери перфектния автомобил за вас.'
            : 'Not sure what car you\'re looking for? Our AI will analyze your needs, budget, and driving style to find the perfect car for you.',
        start: isBg ? 'Стартирай Асистента' : 'Start Advisor',
        features: [
            {
                icon: <Bot size={24} />,
                title: isBg ? 'Интелигентен Анализ' : 'Intelligent Analysis',
                desc: isBg ? 'Разбира вашите реални нужди отвъд просто марка и модел.' : 'Understands your real needs beyond just make and model.'
            },
            {
                icon: <Shield size={24} />,
                title: isBg ? 'Надеждност & История' : 'Reliability & History',
                desc: isBg ? 'Препоръчва само проверени автомобили с доказана история.' : 'Recommends only verified cars with proven history.'
            },
            {
                icon: <Sparkles size={24} />,
                title: isBg ? 'Персонализирани Оферти' : 'Personalized Deals',
                desc: isBg ? 'Намира най-добрите оферти на пазара, скрити за обикновения потребител.' : 'Finds the best market deals hidden from the average user.'
            }
        ]
    };

    const handleStart = () => {
        setViewState('wizard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWizardComplete = (data: AdvisorData) => {
        setAdvisorData(data);
        setViewState('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setAdvisorData(null);
        setViewState('hero');
    };

    return (
        <PageContainer $isDark={isDark}>
            <ContentWrapper>
                <AnimatePresence mode="wait">
                    {viewState === 'hero' && (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <HeroSection>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    style={{ display: 'inline-block', marginBottom: '1rem' }}
                                >
                                    <span style={{
                                        background: 'rgba(37, 99, 235, 0.1)',
                                        color: '#3b82f6',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontWeight: '600',
                                        border: '1px solid rgba(37, 99, 235, 0.2)'
                                    }}>
                                        {isBg ? '✨ Нова AI Технология' : '✨ New AI Technology'}
                                    </span>
                                </motion.div>

                                <Title
                                    $isDark={isDark}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {t.title}
                                </Title>

                                <Subtitle
                                    $isDark={isDark}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {t.subtitle}
                                </Subtitle>

                                <StartButton
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={handleStart}
                                >
                                    <Sparkles size={20} />
                                    {t.start}
                                </StartButton>
                            </HeroSection>

                            <FeaturesGrid>
                                {t.features.map((feature, index) => (
                                    <FeatureCard
                                        key={index}
                                        $isDark={isDark}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + (index * 0.1) }}
                                    >
                                        <IconWrapper>{feature.icon}</IconWrapper>
                                        <FeatureTitle $isDark={isDark}>{feature.title}</FeatureTitle>
                                        <FeatureDesc $isDark={isDark}>{feature.desc}</FeatureDesc>
                                    </FeatureCard>
                                ))}
                            </FeaturesGrid>
                        </motion.div>
                    )}

                    {viewState === 'wizard' && (
                        <motion.div
                            key="wizard"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <AdvisorWizard onComplete={handleWizardComplete} />
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <button
                                    onClick={() => setViewState('hero')}
                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {isBg ? 'Отказ' : 'Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {viewState === 'results' && advisorData && (
                        <AdvisorResults data={advisorData} onReset={handleReset} />
                    )}
                </AnimatePresence>
            </ContentWrapper>
        </PageContainer>
    );
};

export default AIAdvisorPage;
