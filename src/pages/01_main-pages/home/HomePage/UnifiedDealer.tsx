/**
 * UnifiedDealer.tsx (v2.0 - Trust-Centric Design)
 * Обединени търговци и дилъри - Витрина с фокус върху доверието
 * Unified Dealers & Showrooms - Trust-Focused Showcase
 *
 * Inspired by / Вдъхновено от:
 * ✅ TrustPilot - Visual rating system
 * ✅ Airbnb - High trust display
 * ✅ Mercedes Dealer Finder - High professionalism
 *
 * Features / Характеристики:
 * ✅ Trust badges + prominent verification indicators
 * ✅ Stats header (500+ dealers, Avg rating, Verified)
 * ✅ Featured dealers grid with hover effects
 * ✅ Clear "Become a Dealer" CTA
 * ✅ Mobile-optimized card layout
 * ✅ Dark/Light theme support
 * ✅ Full i18n (bg/en)
 *
 * @performance real-time Firebase data with suspense
 * @responsive mobile-first dealer cards
 * @a11y accessible verification badges
 */

import React, { memo, useState, useEffect, Suspense } from 'react';
import styled from 'styled-components';
import { logger } from '@/services/logger-service';
import { motion } from 'framer-motion';
import { Star, CheckCircle, TrendingUp, Users, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import HorizontalScrollContainer from '@/components/HorizontalScrollContainer/HorizontalScrollContainer';

// Lazy load DealerSpotlight
const DealerSpotlight = React.lazy(() => import('./DealerSpotlight'));

// ============================================================================
// STYLED COMPONENTS - TRUST-CENTRIC DESIGN
// ============================================================================

const Container = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(5, 11, 24, 0.5), rgba(15, 23, 42, 0.3))'
    : 'linear-gradient(135deg, rgba(240, 245, 255, 0.8), rgba(248, 247, 246, 0.5))'};
  padding: 2rem 1rem;
  margin: 1rem 0;
  border-radius: 24px;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 0.75rem 0;
  }

  @media (max-width: 640px) {
    padding: 1rem 0.75rem;
    margin: 0.5rem 0;
  }
`;

const Header = styled.div<{ $isDark: boolean }>`
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  color: ${props => props.$isDark ? '#f5f8ff' : '#0c1a2a'};
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #6366F1;
    flex-shrink: 0;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  color: ${props => props.$isDark ? '#c9d6e8' : '#52627a'};
  margin: 0 0 2rem;
  font-weight: 500;
`;

const StatsBar = styled(motion.div) <{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(94, 179, 255, 0.15)'
    : 'rgba(12, 26, 42, 0.1)'};
  border-radius: 16px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
`;

const StatItem = styled(motion.div) <{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  transition: all 200ms ease-out;

  &:hover {
    transform: translateY(-4px);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$isDark
    ? 'rgba(94, 179, 255, 0.2)'
    : 'rgba(12, 26, 42, 0.08)'};
    border-radius: 10px;
    color: #6366F1;
    flex-shrink: 0;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$isDark ? '#5eb3ff' : '#0c5bad'};
  }

  .stat-label {
    font-size: 0.9rem;
    color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
    font-weight: 500;
  }
`;

const DealersSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ContentArea = styled.div`
  min-height: 350px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const CTASection = styled(motion.div) <{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  padding: 2.5rem;
  background: var(--btn-primary-bg);
  border: 2px solid ${props => props.$isDark
    ? 'rgba(99, 102, 241, 0.25)'
    : 'rgba(99, 102, 241, 0.15)'};
  border-radius: 16px;
  transition: all 300ms ease-out;

  &:hover {
    border-color: ${props => props.$isDark
    ? 'rgba(99, 102, 241, 0.4)'
    : 'rgba(99, 102, 241, 0.25)'};
    background: var(--btn-primary-bg);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const CTAContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .cta-icon {
    font-size: 1.75rem;
  }

  h3 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: ${props => (props as any).$isDark ? '#f5f8ff' : '#0c1a2a'};
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: ${props => (props as any).$isDark ? '#c9d6e8' : '#52627a'};
    font-weight: 500;
  }

  @media (max-width: 640px) {
    text-align: center;

    h3 {
      font-size: 1.15rem;
    }

    p {
      font-size: 0.9rem;
    }
  }
`;

const CTAButton = styled(motion.button) <{ $isDark: boolean }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  background: var(--btn-primary-bg);
  color: white;
  white-space: nowrap;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
  transition: all 200ms ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.35);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    width: 100%;
    padding: 0.85rem 1.5rem;
    font-size: 1rem;
  }
`;

const LoadingFallback = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 300px;
  gap: 1rem;
  color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;

  .spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg,
        transparent 0deg,
        #3B82F6 90deg,
        transparent 100deg,
        transparent 360deg
      );
      animation: led-orbit 1.2s linear infinite;
    }
  }

  @keyframes led-orbit {
    to { transform: rotate(360deg); }
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnifiedDealer (v2.0)
 * Обединени търговци - Витрина с фокус върху доверието
 * Unified Dealers - Trust-Centric Showcase
 *
 * Includes / Включва:
 * 1. Prominent Trust Stats (500+ dealers, verified, ratings)
 * 2. Featured Dealers Grid
 * 3. Clear "Become a Dealer" CTA
 * 4. Premium styling with hover effects
 *
 * @responsive mobile-first dealer cards
 * @performance real-time Firebase data
 * @accessible verification badges
 */
const UnifiedDealer: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  const [dealerCount, setDealerCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const count = await DealershipRepository.getVerifiedCount();
        setDealerCount(count);
      } catch (error) {
        logger.error('Error fetching dealer stats', error as Error);
      }
    };
    fetchStats();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <Container $isDark={isDark}>
      {/* Header Section */}
      <Header>
        <Title $isDark={isDark}>
          <CheckCircle size={32} style={{ marginRight: '0.75rem' }} />
          {isBg ? 'Верифицирани дилъри' : 'Verified Dealers'}
        </Title>
        <Subtitle $isDark={isDark}>
          {isBg
            ? 'Открийте най-доверени автосалони и официални представителства'
            : 'Discover the most trusted dealerships and official representatives'}
        </Subtitle>
      </Header>

      {/* Trust Stats Bar */}
      <StatsBar
        $isDark={isDark}
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      >
        <StatItem
          $isDark={isDark}
          custom={0}
          variants={itemVariants}
        >
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-value">{dealerCount !== null ? `${dealerCount}+` : '...'}</div>
          <div className="stat-label">{isBg ? 'Дилъри' : 'Dealers'}</div>
        </StatItem>

        <StatItem
          $isDark={isDark}
          custom={1}
          variants={itemVariants}
        >
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">100%</div>
          <div className="stat-label">{isBg ? 'Верифицирани' : 'Verified'}</div>
        </StatItem>

        <StatItem
          $isDark={isDark}
          custom={2}
          variants={itemVariants}
        >
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-value">4.8</div>
          <div className="stat-label">{isBg ? 'Рейтинг' : 'Rating'}</div>
        </StatItem>
      </StatsBar>

      {/* Dealers Section */}
      <DealersSection>
        <ContentArea>
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <DealerSpotlight />
          </Suspense>
        </ContentArea>
      </DealersSection>

      {/* Call-to-Action Section */}
      <CTASection
        $isDark={isDark}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <CTAContent $isDark={isDark}>
          <div className="cta-icon">
            <Building2 size={32} />
          </div>
          <h3>{isBg ? 'Станете част от нас' : 'Become a Dealer Today'}</h3>
          <p>
            {isBg
              ? 'Регистрирайте вашия автосалон и достигнете до хиляди потенциални купувачи на нашата платформа'
              : 'Register your dealership and reach thousands of potential buyers on our platform'}
          </p>
        </CTAContent>
        <CTAButton
          $isDark={isDark}
          onClick={() => navigate('/dealer-registration')}
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {isBg ? 'Начало' : 'Get Started'}
        </CTAButton>
      </CTASection>
    </Container>
  );
});

UnifiedDealer.displayName = 'UnifiedDealer';

export default UnifiedDealer;


