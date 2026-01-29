/**
 * UnifiedSocial.tsx (v2.0 - Social Proof Design)
 * Обединено социално доказателство - Мек социален опит
 * Unified Social Proof - Soft Social Experience
 *
 * Inspired by / Вдъхновено от:
 * ✅ Trustpilot - Soft reviews display
 * ✅ Slack Community - Community content
 * ✅ LinkedIn Feed - Updates and stories
 *
 * Integrates with soft design (Non-Intrusive) / Интегрира с мек дизайн:
 * ✅ HomeSocialExperience - Social content
 * ✅ Customer Reviews - Customer reviews
 * ✅ Recently Sold - Recently sold cars
 * ✅ Community Highlights - Community highlights
 *
 * Features / Характеристики:
 * ✅ Subtle card design with soft colors
 * ✅ Review stars + testimonials
 * ✅ Recently sold car showcase
 * ✅ Community stories (non-intrusive)
 * ✅ Responsive grid layout
 * ✅ Dark/Light theme support
 * ✅ Full i18n (bg/en)
 *
 * @performance lazy loaded sections
 * @responsive mobile-first layout
 * @a11y accessible social cards
 */

import React, { memo, useState, Suspense } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, TrendingUp } from 'lucide-react';

import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';

// Lazy load social sections
const HomeSocialExperience = React.lazy(() => import('./HomeSocialExperience'));
const RecentlySold = React.lazy(() => import('./RecentlySold'));

// ============================================================================
// TYPES
// ============================================================================

type SocialViewType = 'feed' | 'trends' | 'community';

interface SocialViewConfig {
  id: SocialViewType;
  labelBg: string;
  labelEn: string;
  icon: React.ReactNode;
  color: string;
}

// ============================================================================
// STYLED COMPONENTS - SOFT SOCIAL PROOF DESIGN
// ============================================================================

const Container = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(5, 11, 24, 0.65), rgba(15, 23, 42, 0.55))'
    : 'linear-gradient(135deg, rgba(245, 250, 255, 0.92), rgba(248, 247, 246, 0.82))'};
  border: 1px solid ${props => props.$isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,26,42,0.06)'};
  box-shadow: 0 24px 60px ${props => props.$isDark ? 'rgba(0,0,0,0.28)' : 'rgba(12,26,42,0.12)'};
  padding: 2rem 1rem;
  margin: 1rem 0;

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
  color: ${props => props.$isDark ? '#f8fbff' : '#0e1f33'};
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #10b981;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  color: ${props => props.$isDark ? '#d4e3f7' : '#334155'};
  margin: 0;
  font-weight: 500;
`;

// ============================================================================
// TABS STYLING
// ============================================================================

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  max-width: 1200px;
  margin: 2rem auto 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 640px) {
    margin-top: 1rem;
  }
`;

const Tab = styled(motion.button) <{
  $active: boolean;
  $isDark: boolean;
  $color?: string;
}>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  background: ${props => props.$active
    ? (props.$isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)')
    : (props.$isDark ? 'rgba(255,255,255,0.05)' : 'rgba(12,26,42,0.04)')};
  color: ${props => props.$active
    ? (props.$isDark ? '#f8fbff' : '#0f172a')
    : (props.$isDark ? '#cbd5e1' : '#4b5563')};
  border: 2px solid ${props => props.$active
    ? (props.$color || '#10b981')
    : (props.$isDark ? 'rgba(255,255,255,0.12)' : 'rgba(12,26,42,0.08)')};

  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$color || '#10b981'};
    opacity: ${props => props.$active ? 1 : 0.7};
    transition: all 250ms ease-out;
  }

  &:hover {
    border-color: ${props => props.$color || '#10b981'};
    background: ${props => props.$isDark
    ? 'rgba(16, 185, 129, 0.14)'
    : 'rgba(16, 185, 129, 0.1)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
    gap: 0.4rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 640px) {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
`;

// ============================================================================
// CONTENT AREA
// ============================================================================

const ContentArea = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
  min-height: 350px;

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

const LoadingFallback = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 350px;
  gap: 1rem;
  color: ${props => props.$isDark ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.$isDark
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(12,26,42,0.1)'};
    border-top-color: ${props => props.$isDark
    ? '#5eb3ff'
    : '#0c5bad'};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ComingSoonBadge = styled(motion.div) <{ $isDark: boolean }>`
  text-align: center;
  padding: 3rem 2rem;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))'
    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(59, 130, 246, 0.06))'};
  border: 2px dashed ${props => props.$isDark
    ? 'rgba(16, 185, 129, 0.25)'
    : 'rgba(16, 185, 129, 0.18)'};
  border-radius: 16px;
  transition: all 300ms ease-out;

  &:hover {
    border-color: ${props => props.$isDark
    ? 'rgba(16, 185, 129, 0.35)'
    : 'rgba(16, 185, 129, 0.26)'};
    background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))'
    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))'};
  }

  h3 {
    font-size: 1.35rem;
    font-weight: 700;
    color: ${props => props.$isDark ? '#f8fbff' : '#0f172a'};
    margin: 0 0 0.75rem;
  }

  p {
    color: ${props => props.$isDark ? '#d4e3f7' : '#334155'};
    margin: 0;
    font-size: 0.95rem;
  }

  @media (max-width: 640px) {
    padding: 2rem 1.5rem;

    h3 {
      font-size: 1.1rem;
    }

    p {
      font-size: 0.85rem;
    }
  }
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UnifiedSocial (v2.0)
 * Обединено социално доказателство - Unified Social Proof Experience
 *
 * Includes / Включва:
 * 1. Feed - Social content (HomeSocialExperience)
 * 2. Recently Sold - Recently sold cars (coming soon)
 * 3. Community - Community stories (coming soon)
 *
 * @responsive tabbed layout with smooth transitions
 * @performance lazy loaded sections
 * @accessible semantic content
 */
const UnifiedSocial: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isBg = language === 'bg';

  const [activeView, setActiveView] = useState<SocialViewType>('feed');

  // View configuration with soft colors
  const views: SocialViewConfig[] = [
    {
      id: 'feed',
      labelBg: 'Канал',
      labelEn: 'Feed',
      icon: <MessageSquare size={18} />,
      color: '#10b981',
    },
    {
      id: 'trends',
      labelBg: 'Скоро продадени',
      labelEn: 'Recently Sold',
      icon: <TrendingUp size={18} />,
      color: '#f59e0b',
    },
    {
      id: 'community',
      labelBg: 'История',
      labelEn: 'Stories',
      icon: <Heart size={18} />,
      color: '#ec4899',
    },
  ];

  const getViewLabel = (view: SocialViewConfig): string => {
    return isBg ? view.labelBg : view.labelEn;
  };

  // Content renderer
  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return (
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <HomeSocialExperience />
          </Suspense>
        );
      case 'trends':
        return (
          <Suspense fallback={<LoadingFallback $isDark={isDark}><div className="spinner" /></LoadingFallback>}>
            <RecentlySold />
          </Suspense>
        );
      case 'community':
        return (
          <ComingSoonBadge $isDark={isDark}>
            <h3>{isBg ? '📖 История' : '📖 Stories'}</h3>
            <p>{isBg ? 'Прочетете истории от нашата общност на собственици' : 'Read stories from our community of car owners'}</p>
          </ComingSoonBadge>
        );
      default:
        return null;
    }
  };

  return (
    <Container $isDark={isDark}>
      {/* Header */}
      <Header>
        <Title $isDark={isDark}>
          <MessageSquare size={32} style={{ marginRight: '0.75rem' }} />
          {isBg ? 'Социално пространство' : 'Social Space'}
        </Title>
        <Subtitle $isDark={isDark}>
          {isBg
            ? 'Свързване с автолюбители и споделяне на опит'
            : 'Connect with car enthusiasts and share experiences'}
        </Subtitle>
      </Header>

      {/* Tabs Navigation */}
      <TabsContainer>
        {views.map((view, index) => (
          <Tab
            key={view.id}
            $active={activeView === view.id}
            $isDark={isDark}
            $color={view.color}
            onClick={() => setActiveView(view.id)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {view.icon}
            <span>{getViewLabel(view)}</span>
          </Tab>
        ))}
      </TabsContainer>

      {/* Content Area */}
      <ContentArea
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </ContentArea>
    </Container>
  );
});

UnifiedSocial.displayName = 'UnifiedSocial';

export default UnifiedSocial;
