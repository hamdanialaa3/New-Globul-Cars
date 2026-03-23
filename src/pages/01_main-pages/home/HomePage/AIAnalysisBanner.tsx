/**
 * AIAnalysisBanner.tsx
 * شريط ترويجي جذاب لتحليل السيارات بالذكاء الاصطناعي
 * 
 * ✨ PREMIUM DESIGN:
 * - Eye-catching gradient banner
 * - Step-by-step visual explanation
 * - Animated icons with flow arrows
 * - Glassmorphism effects
 * - Dark/Light theme support
 * - BG/EN translations
 * 
 * 📍 Links to: /ai-analysis
 * 
 * @version 1.0.0
 * @date February 3, 2026
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Camera, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AIRobotIcon } from '@/components/icons/AIRobotIcon';

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  bg: {
    badge: 'AI Технология',
    title: 'Анализирай колата си с AI',
    subtitle: 'Качи снимки → AI анализира → Получи точна оценка за секунди',
    step1: 'Качи снимки',
    step1Desc: 'Снимай колата от всички страни',
    step2: 'AI Анализ',
    step2Desc: 'Gemini AI разпознава марка, модел, състояние',
    step3: 'Пазарна цена',
    step3Desc: 'Сравнение с 10,000+ обяви в реално време',
    step4: 'Готова обява',
    step4Desc: 'Публикувай с един клик',
    cta: 'Започни AI Анализ',
    free: 'Безплатно',
    accurate: '95% точност',
    fast: '30 сек'
  },
  en: {
    badge: 'AI Technology',
    title: 'Analyze your car with AI',
    subtitle: 'Upload photos → AI analyzes → Get accurate estimate in seconds',
    step1: 'Upload Photos',
    step1Desc: 'Take photos from all angles',
    step2: 'AI Analysis',
    step2Desc: 'Gemini AI recognizes make, model, condition',
    step3: 'Market Price',
    step3Desc: 'Comparison with 10,000+ listings in real-time',
    step4: 'Ready Listing',
    step4Desc: 'Publish with one click',
    cta: 'Start AI Analysis',
    free: 'Free',
    accurate: '95% accurate',
    fast: '30 sec'
  }
};

// ============================================================================
// ANIMATIONS
// ============================================================================

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const flowArrow = keyframes`
  0% {
    opacity: 0.3;
    transform: translateX(-5px);
  }
  50% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0.3;
    transform: translateX(5px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(147, 51, 234, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(147, 51, 234, 0.3);
  }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const BannerContainer = styled(motion.section)<{ $isDark: boolean }>`
  position: relative;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  
  /* Gradient background */
  background: ${p => p.$isDark 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #7c3aed 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 40%, #8b5cf6 100%)'
  };
  
  /* Border */
  border: 1px solid ${p => p.$isDark 
    ? 'rgba(139, 92, 246, 0.3)' 
    : 'rgba(255, 255, 255, 0.3)'
  };
  
  /* Shadow with glow */
  box-shadow: ${p => p.$isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 92, 246, 0.15)'
    : '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.15)'
  };
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    animation: ${glow} 2s ease-in-out infinite;
  }
  
  /* Animated gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--btn-primary-bg);
    background-size: 200% 100%;
    animation: ${shimmer} 4s infinite;
    pointer-events: none;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: 40px 48px;
  
  @media (max-width: 1024px) {
    padding: 32px 32px;
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const TextSection = styled.div`
  flex: 1;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  
  svg {
    width: 14px;
    height: 14px;
    animation: ${pulse} 2s infinite;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const StatBadge = styled.span<{ $variant?: 'green' | 'blue' | 'purple' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${p => {
    switch (p.$variant) {
      case 'green': return 'rgba(16, 185, 129, 0.2)';
      case 'blue': return 'rgba(59, 130, 246, 0.2)';
      case 'purple': return 'rgba(139, 92, 246, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${p => {
    switch (p.$variant) {
      case 'green': return 'rgba(16, 185, 129, 0.4)';
      case 'blue': return 'rgba(59, 130, 246, 0.4)';
      case 'purple': return 'rgba(139, 92, 246, 0.4)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  border-radius: 8px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 32px;
  
  @media (max-width: 900px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
`;

const StepCard = styled(motion.div)<{ $isDark: boolean }>`
  flex: 1;
  min-width: 140px;
  max-width: 200px;
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
  }
  
  @media (max-width: 900px) {
    min-width: 120px;
    padding: 16px 12px;
  }
`;

const StepIconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.$color};
  border-radius: 16px;
  animation: ${float} 3s ease-in-out infinite;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
  
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const StepTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const StepDesc = styled.p`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const FlowArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: rgba(255, 255, 255, 0.5);
    animation: ${flowArrow} 1.5s ease-in-out infinite;
  }
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const CTASection = styled.div`
  display: flex;
  justify-content: center;
`;

const CTAButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 40px;
  background: var(--btn-primary-bg);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
  
  svg {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: var(--btn-primary-bg);
    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.5);
    
    svg:last-child {
      transform: translateX(4px);
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px 24px;
    font-size: 1rem;
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

const AIAnalysisBanner: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleClick = () => {
    navigate('/ai-analysis');
  };

  const steps = [
    { icon: Camera, title: t.step1, desc: t.step1Desc, color: 'linear-gradient(135deg, #3b82f6, #2563eb)', delay: 0 },
    { icon: AIRobotIcon, title: t.step2, desc: t.step2Desc, color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', delay: 0.1 },
    { icon: BarChart3, title: t.step3, desc: t.step3Desc, color: 'linear-gradient(135deg, #f59e0b, #d97706)', delay: 0.2 },
    { icon: CheckCircle2, title: t.step4, desc: t.step4Desc, color: 'linear-gradient(135deg, #10b981, #059669)', delay: 0.3 }
  ];

  return (
    <BannerContainer
      $isDark={isDark}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      <Content>
        {/* Top Row: Title + Stats */}
        <TopRow>
          <TextSection>
            <Badge>
              <Zap />
              {t.badge}
            </Badge>
            <Title>{t.title}</Title>
            <Subtitle>{t.subtitle}</Subtitle>
          </TextSection>
          
          <StatsRow>
            <StatBadge $variant="green">
              <Shield />
              {t.free}
            </StatBadge>
            <StatBadge $variant="blue">
              <TrendingUp />
              {t.accurate}
            </StatBadge>
            <StatBadge $variant="purple">
              <Zap />
              {t.fast}
            </StatBadge>
          </StatsRow>
        </TopRow>
        
        {/* Steps Flow */}
        <StepsContainer>
          {steps.map((step, index) => (
            <React.Fragment key={step.title}>
              <StepCard
                $isDark={isDark}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: step.delay }}
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <StepIconWrapper $color={step.color} style={{ animationDelay: `${index * 0.3}s` }}>
                  <step.icon />
                </StepIconWrapper>
                <StepTitle>{step.title}</StepTitle>
                <StepDesc>{step.desc}</StepDesc>
              </StepCard>
              
              {index < steps.length - 1 && (
                <FlowArrow>
                  <ArrowRight />
                </FlowArrow>
              )}
            </React.Fragment>
          ))}
        </StepsContainer>
        
        {/* CTA Button */}
        <CTASection>
          <CTAButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AIRobotIcon size={20} animate />
            {t.cta}
            <ArrowRight />
          </CTAButton>
        </CTASection>
      </Content>
    </BannerContainer>
  );
});

AIAnalysisBanner.displayName = 'AIAnalysisBanner';

export default AIAnalysisBanner;
