/**
 * UnifiedSmartSell.tsx
 * Обединен модул за умна продажба - Unified Smart Sell Section
 * 
 * 🎯 CONSOLIDATED CTA FOR SELLING
 * Combines the power of:
 * - AISmartSellButton (AI-powered listing)
 * - SmartSellStrip (Quick sell banner)
 * 
 * Into ONE powerful, conversion-optimized section.
 * 
 * Inspired by / Вдъхновено от:
 * ✅ Airbnb - "Become a Host" CTA
 * ✅ Tesla - Clean, premium sell experience
 * ✅ Vinted - Easy listing flow
 * 
 * Features / Характеристики:
 * ✅ Two-column layout (Benefits + CTA)
 * ✅ AI-powered pricing teaser
 * ✅ Quick stats (avg sell time, success rate)
 * ✅ Premium glassmorphism design
 * ✅ Dark/Light theme support
 * ✅ Full i18n (BG/EN)
 * 
 * @performance optimized with memo
 * @responsive mobile-first design
 * @a11y accessible buttons and links
 */

import React, { memo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, ArrowRight, CheckCircle, TrendingUp, Clock, Shield, 
  Sparkles, Camera, DollarSign, Target, Star
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthProvider';
import { glassPrimaryButton } from '../../../../styles/glassmorphism-buttons';
import { analyticsService } from '@/services/analytics/UnifiedAnalyticsService';

// ============================================================================
// ANIMATIONS
// ============================================================================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255, 143, 16, 0.4); }
  50% { opacity: 0.9; box-shadow: 0 0 0 15px rgba(255, 143, 16, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.section<{ $isDark: boolean }>`
  position: relative;
  padding: 2.5rem 2rem;
  margin: 1.5rem 0;
  border-radius: 24px;
  overflow: hidden;
  
  /* Premium animated gradient background */
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(255, 143, 16, 0.15) 0%, rgba(234, 88, 12, 0.1) 50%, rgba(255, 143, 16, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(255, 143, 16, 0.08) 0%, rgba(234, 88, 12, 0.05) 50%, rgba(255, 143, 16, 0.08) 100%)'};
  
  background-size: 200% 200%;
  animation: ${gradientMove} 8s ease infinite;
  
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 143, 16, 0.3)'
    : 'rgba(255, 143, 16, 0.2)'};
  
  box-shadow: 0 20px 60px ${props => props.$isDark
    ? 'rgba(255, 143, 16, 0.15)'
    : 'rgba(255, 143, 16, 0.1)'};

  /* Shimmer overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--btn-primary-bg);
    background-size: 200% 100%;
    animation: ${shimmer} 4s linear infinite;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.75rem 1.25rem;
    margin: 1rem 0;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Badge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--btn-primary-bg);
  color: white;
  border-radius: 24px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
  box-shadow: 0 4px 15px rgba(255, 143, 16, 0.4);
  
  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 900px) {
    margin: 0 auto;
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
  margin: 0;
  
  span {
    color: #FF8F10;
  }
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 1.05rem;
  line-height: 1.6;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  margin: 0;
  max-width: 500px;

  @media (max-width: 900px) {
    margin: 0 auto;
  }
`;

const BenefitsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const BenefitItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.04)'};
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${props => props.$isDark ? '#e2e8f0' : '#475569'};
  
  svg {
    width: 16px;
    height: 16px;
    color: #FF8F10;
  }
`;

const RightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
`;

const StatCard = styled(motion.div)<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem 0.5rem;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)'};
`;

const StatValue = styled.span<{ $isDark: boolean }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: #FF8F10;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.span<{ $isDark: boolean }>`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  
  @media (max-width: 480px) {
    font-size: 0.65rem;
  }

  @media (max-width: 360px) {
    font-size: 0.6rem;
  }
`;

const CTAButton = styled(motion.button)`
  ${glassPrimaryButton}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 14px;
  background: var(--btn-primary-bg);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${pulse} 3s ease-in-out infinite;
  width: 100%;
  max-width: 320px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(255, 143, 16, 0.5);
  }
  
  svg {
    width: 22px;
    height: 22px;
  }
  
  @media (max-width: 768px) {
    padding: 14px 32px;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 0.9rem;
    gap: 6px;
  }

  @media (max-width: 360px) {
    padding: 10px 16px;
    font-size: 0.8rem;
  }
`;

const AIBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SecondaryLink = styled(motion.button)<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: transparent;
  border: none;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #FF8F10;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    badge: 'AI-Powered Selling',
    title: 'Sell Your Car',
    titleHighlight: 'Faster',
    description: 'Our AI helps you price your car perfectly and reach thousands of verified buyers. List in under 5 minutes.',
    benefits: {
      pricing: 'Smart Pricing',
      reach: 'Wide Reach',
      secure: 'Secure Sale',
      fast: 'Quick Sale',
    },
    stats: {
      avgDays: '7',
      avgDaysLabel: 'Avg. Days to Sell',
      successRate: '94%',
      successLabel: 'Success Rate',
      buyers: '50K+',
      buyersLabel: 'Active Buyers',
    },
    cta: 'Start Selling',
    ctaAI: 'AI',
    learnMore: 'Learn how it works',
  },
  bg: {
    badge: 'AI продажба',
    title: 'Продайте колата си',
    titleHighlight: 'по-бързо',
    description: 'Нашият AI ви помага да оцените колата си перфектно и да достигнете хиляди потвърдени купувачи. Обява за под 5 минути.',
    benefits: {
      pricing: 'Умно ценообразуване',
      reach: 'Широк обхват',
      secure: 'Сигурна продажба',
      fast: 'Бърза продажба',
    },
    stats: {
      avgDays: '7',
      avgDaysLabel: 'Средно дни за продажба',
      successRate: '94%',
      successLabel: 'Успеваемост',
      buyers: '50K+',
      buyersLabel: 'Активни купувачи',
    },
    cta: 'Започни продажба',
    ctaAI: 'AI',
    learnMore: 'Научи как работи',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

const UnifiedSmartSell: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const navigate = useNavigate();

  const t = translations[language as 'en' | 'bg'] || translations.en;

  const handleStartSelling = useCallback(() => {
    analyticsService.trackEvent('smart_sell_cta_click', {
      location: 'homepage_unified_smart_sell',
      isLoggedIn: !!user,
    });
    navigate('/sell');
  }, [navigate, user]);

  const handleLearnMore = useCallback(() => {
    analyticsService.trackEvent('smart_sell_learn_more_click', {
      location: 'homepage_unified_smart_sell',
    });
    navigate('/help?topic=selling');
  }, [navigate]);

  return (
    <Container $isDark={isDark}>
      <ContentGrid>
        {/* Left: Text & Benefits */}
        <LeftContent>
          <Badge
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles />
            {t.badge}
          </Badge>

          <Title $isDark={isDark}>
            {t.title} <span>{t.titleHighlight}</span>
          </Title>

          <Description $isDark={isDark}>
            {t.description}
          </Description>

          <BenefitsList>
            <BenefitItem $isDark={isDark}>
              <DollarSign />
              {t.benefits.pricing}
            </BenefitItem>
            <BenefitItem $isDark={isDark}>
              <Target />
              {t.benefits.reach}
            </BenefitItem>
            <BenefitItem $isDark={isDark}>
              <Shield />
              {t.benefits.secure}
            </BenefitItem>
            <BenefitItem $isDark={isDark}>
              <Zap />
              {t.benefits.fast}
            </BenefitItem>
          </BenefitsList>
        </LeftContent>

        {/* Right: Stats & CTA */}
        <RightContent>
          <StatsGrid>
            <StatCard 
              $isDark={isDark}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatValue $isDark={isDark}>{t.stats.avgDays}</StatValue>
              <StatLabel $isDark={isDark}>{t.stats.avgDaysLabel}</StatLabel>
            </StatCard>
            <StatCard 
              $isDark={isDark}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatValue $isDark={isDark}>{t.stats.successRate}</StatValue>
              <StatLabel $isDark={isDark}>{t.stats.successLabel}</StatLabel>
            </StatCard>
            <StatCard 
              $isDark={isDark}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatValue $isDark={isDark}>{t.stats.buyers}</StatValue>
              <StatLabel $isDark={isDark}>{t.stats.buyersLabel}</StatLabel>
            </StatCard>
          </StatsGrid>

          <CTAButton
            onClick={handleStartSelling}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera />
            {t.cta}
            <AIBadge>
              <Sparkles />
              {t.ctaAI}
            </AIBadge>
            <ArrowRight />
          </CTAButton>

          <SecondaryLink
            $isDark={isDark}
            onClick={handleLearnMore}
            whileHover={{ x: 5 }}
          >
            {t.learnMore}
            <ArrowRight />
          </SecondaryLink>
        </RightContent>
      </ContentGrid>
    </Container>
  );
});

UnifiedSmartSell.displayName = 'UnifiedSmartSell';

export default UnifiedSmartSell;
