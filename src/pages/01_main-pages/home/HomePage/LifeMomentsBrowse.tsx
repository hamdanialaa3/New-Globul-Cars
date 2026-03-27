/**
 * LifeMomentsBrowse.tsx
 * Преживявания и моменти - Life Moments Browse Section
 * 
 * 🎯 EMOTIONAL CAR DISCOVERY
 * This feature helps users find cars based on life situations:
 * - Family expansion → Spacious SUV/Minivan
 * - Work commute → Efficient sedan/hybrid
 * - Adventure → 4x4/Offroad
 * - Eco-conscious → Electric/Hybrid
 * - City life → Compact/Hatchback
 * - Luxury lifestyle → Premium brands
 * 
 * Inspired by / Вдъхновено от:
 * ✅ Apple - Emotional marketing approach
 * ✅ Airbnb - Experience-based discovery
 * ✅ Tesla - Lifestyle positioning
 * 
 * Features / Характеристики:
 * ✅ Beautiful gradient cards with icons
 * ✅ Emotional storytelling approach
 * ✅ Premium animations
 * ✅ Dark/Light theme support
 * ✅ Full i18n (BG/EN)
 * 
 * @performance optimized rendering
 * @responsive mobile-first grid
 * @a11y accessible cards with proper semantics
 */

import React, { memo, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '@/services/analytics/UnifiedAnalyticsService';
import {
  Users, Briefcase, Mountain, Leaf, Building2, Crown,
  Heart, Baby, Compass, Zap, ArrowRight
} from 'lucide-react';

// ============================================================================
// TYPES & DATA
// ============================================================================

interface LifeMomentItem {
  key: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
  emoji: string;
}

const MOMENTS: LifeMomentItem[] = [
  {
    key: 'family',
    icon: <Users />,
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    key: 'work',
    icon: <Briefcase />,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    emoji: '💼'
  },
  {
    key: 'adventure',
    icon: <Mountain />,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    emoji: '🏔️'
  },
  {
    key: 'eco',
    icon: <Leaf />,
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    shadowColor: 'rgba(34, 197, 94, 0.4)',
    emoji: '🌱'
  },
  {
    key: 'city',
    icon: <Building2 />,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    emoji: '🏙️'
  },
  {
    key: 'luxury',
    icon: <Crown />,
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    shadowColor: 'rgba(234, 179, 8, 0.4)',
    emoji: '👑'
  }
];

// ============================================================================
// ANIMATIONS
// ============================================================================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Section = styled.section<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.35) 100%)'};
  border: 1px solid ${props => props.$isDark
    ? '#2d3748'
    : 'rgba(0, 0, 0, 0.06)'};
  border-radius: 24px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow: hidden;
  box-shadow: ${props => props.$isDark
    ? '0 20px 50px rgba(0, 0, 0, 0.5)'
    : '0 20px 50px rgba(0, 0, 0, 0.05)'};
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    gap: 1.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 18px;
  background: var(--btn-primary-bg);
  color: #ffffff;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: fit-content;
  margin: 0 auto 0.5rem;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
`;

const Title = styled.h2<{ $isDark: boolean }>`
  margin: 0;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 900;
  color: ${props => props.$isDark ? '#f8fafc' : '#0f172a'};
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${props => props.$isDark ? '#cbd5e1' : '#475569'};
  max-width: 650px;
  margin: 0 auto;
  font-weight: 500;
`;

const MomentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MomentCard = styled(motion.button) <{
  $isDark: boolean;
  $gradient: string;
  $shadowColor: string;
}>`
  position: relative;
  border: none;
  background: ${props => props.$isDark
    ? 'rgba(30, 41, 59, 0.4)'
    : 'rgba(255, 255, 255, 0.8)'};
  padding: 1.5rem 1.25rem;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  backdrop-filter: blur(12px);
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$gradient};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px ${props => props.$shadowColor};
    border-color: transparent;
    
    &::before {
      opacity: 0.1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
    gap: 0.5rem;
  }
`;

const IconWrapper = styled.div<{ $gradient: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$gradient};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
  
  svg {
    width: 26px;
    height: 26px;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const MomentTitle = styled.span<{ $isDark: boolean }>`
  font-size: 1rem;
  color: ${props => props.$isDark ? '#F8FAFC' : '#0f172a'};
  font-weight: 700;
  position: relative;
  z-index: 1;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const MomentDescription = styled.span<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  position: relative;
  z-index: 1;
  display: none;
  
  @media (min-width: 1024px) {
    display: block;
  }
`;

const ArrowIcon = styled(ArrowRight) <{ $isDark: boolean }>`
  width: 16px;
  height: 16px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  
  ${MomentCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    badge: '✨ Lifestyle Discovery',
    title: 'Find Your Perfect Car',
    subtitle: 'Choose based on your lifestyle and let us recommend the best options',
    moments: {
      family: { title: 'Family', desc: 'Spacious & Safe' },
      work: { title: 'Business', desc: 'Professional' },
      adventure: { title: 'Adventure', desc: 'Off-road Ready' },
      eco: { title: 'Eco-Friendly', desc: 'Green Choice' },
      city: { title: 'City Life', desc: 'Compact & Smart' },
      luxury: { title: 'Luxury', desc: 'Premium Style' },
    },
  },
  bg: {
    badge: '✨ Открий стила си',
    title: 'Намери перфектната кола',
    subtitle: 'Изберете според вашия начин на живот и ние ще препоръчаме най-добрите опции',
    moments: {
      family: { title: 'Семейство', desc: 'Просторна и безопасна' },
      work: { title: 'Бизнес', desc: 'Професионална' },
      adventure: { title: 'Приключение', desc: 'Готова за офроуд' },
      eco: { title: 'Еко', desc: 'Зелен избор' },
      city: { title: 'Град', desc: 'Компактна' },
      luxury: { title: 'Лукс', desc: 'Премиум стил' },
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

const LifeMomentsBrowse: React.FC = memo(() => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();
  const browseSectionRef = useRef<HTMLDivElement>(null);

  const t = translations[language as 'en' | 'bg'] || translations.en;

  useEffect(() => {
    // Fire 'home_lifemoments_view' once visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          analyticsService.trackEvent('home_lifemoments_view', {
            momentCount: MOMENTS?.length || 0,
          });
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );

    if (browseSectionRef.current) {
      observer.observe(browseSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // When moment is clicked:
  const handleMomentClick = useCallback((momentKey: string) => {
    // Track 'home_lifemoments_click' with moment key
    analyticsService.trackEvent('home_lifemoments_click', {
      momentKey,
    });
    navigate(`/browse?moment=${momentKey}`);
  }, [navigate]);

  return (
    <Section $isDark={isDarkMode} ref={browseSectionRef} aria-label={t.title}>
      <Header>
        <Badge>{t.badge}</Badge>
        <Title $isDark={isDarkMode}>{t.title}</Title>
        <Subtitle $isDark={isDarkMode}>{t.subtitle}</Subtitle>
      </Header>

      <MomentsGrid>
        {MOMENTS.map((m, index) => (
          <MomentCard
            key={m.key}
            $isDark={isDarkMode}
            $gradient={m.gradient}
            $shadowColor={m.shadowColor}
            onClick={() => handleMomentClick(m.key)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconWrapper $gradient={m.gradient}>
              {m.icon}
            </IconWrapper>
            <MomentTitle $isDark={isDarkMode}>
              {t.moments[m.key as keyof typeof t.moments]?.title || m.key}
            </MomentTitle>
            <MomentDescription $isDark={isDarkMode}>
              {t.moments[m.key as keyof typeof t.moments]?.desc || ''}
            </MomentDescription>
            <ArrowIcon $isDark={isDarkMode} />
          </MomentCard>
        ))}
      </MomentsGrid>
    </Section>
  );
});

LifeMomentsBrowse.displayName = 'LifeMomentsBrowse';

export default LifeMomentsBrowse;

