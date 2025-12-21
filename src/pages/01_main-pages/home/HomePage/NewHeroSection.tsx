
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import SearchWidget from './SearchWidget';
import TrustIndicators from './TrustIndicators';
import { Car, Send } from 'lucide-react';

const HeroContainer = styled.div<{ $isDark: boolean }>`
  position: relative;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #020617 0%, #003366 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)'};
  min-height: 800px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px 20px 60px;
  overflow: hidden;
  transition: background 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  /* Grid pattern overlay - مربعات مخططة رفيعة */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      /* Vertical lines - خطوط عمودية */
      linear-gradient(${props => props.$isDark 
        ? 'rgba(255, 255, 255, 0.03)' 
        : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px),
      /* Horizontal lines - خطوط أفقية */
      linear-gradient(90deg, ${props => props.$isDark 
        ? 'rgba(255, 255, 255, 0.03)' 
        : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: linear-gradient(to bottom, black, transparent);
    pointer-events: none;
    opacity: ${props => props.$isDark ? 0.8 : 1};
    z-index: 1;
  }

  /* Dynamic Glow Effects */
  &::after {
    content: '';
    position: absolute;
    width: 800px;
    height: 800px;
    background: ${props => props.$isDark
      ? 'radial-gradient(circle, rgba(0, 102, 204, 0.15) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(0, 102, 255, 0.08) 0%, transparent 70%)'};
    top: -10%;
    right: -20%;
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 768px) {
    min-height: auto;
    padding: 120px 16px 40px;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;

const Headlines = styled(motion.div)<{ $isDark: boolean }>`
  text-align: center;
  color: ${props => props.$isDark ? 'white' : '#1E293B'};
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
`;

const Title = styled.h1<{ $isDark: boolean }>`
  font-size: 4.5rem;
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  line-height: 1;
  letter-spacing: -0.04em;
  color: ${props => props.$isDark ? '#FFFFFF' : '#0F172A'};
  text-shadow: ${props => props.$isDark
    ? '0 10px 30px rgba(0,0,0,0.5)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)'};
  transition: color 0.3s ease, text-shadow 0.3s ease;

  span {
    color: ${props => props.$isDark ? '#0066FF' : '#0066FF'};
    position: relative;
    display: inline-block;
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)'
      : 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 0;
      width: 100%;
      height: 8px;
      background: ${props => props.$isDark
        ? 'rgba(0, 102, 255, 0.3)'
        : 'rgba(0, 102, 255, 0.2)'};
      border-radius: 4px;
      z-index: -1;
    }
  }

  @media (max-width: 768px) {
    font-size: 2.75rem;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.5rem;
  color: ${props => props.$isDark ? '#e2e8f0' : '#475569'};
  margin: 0;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 500;
  line-height: 1.4;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    padding: 0 1rem;
  }
`;

const QuickActions = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }
`;

const ActionButton = styled(motion.button) <{ $variant?: 'primary' | 'secondary'; $isDark: boolean }>`
  padding: 1.125rem 2.75rem;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;

  ${props => props.$variant === 'primary' ? `
    background: ${props.$isDark 
      ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.4) 0%, rgba(0, 123, 255, 0.5) 100%)' 
      : 'linear-gradient(135deg, rgba(0, 102, 255, 0.8) 0%, rgba(0, 123, 255, 0.9) 100%)'};
    color: ${props.$isDark ? '#FFFFFF' : '#FFFFFF'};
    backdrop-filter: blur(20px);
    box-shadow: ${props.$isDark
      ? '0 8px 30px rgba(0, 102, 255, 0.3), 0 0 0 1px rgba(100, 181, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      : '0 8px 30px rgba(0, 102, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)'};
    border: ${props.$isDark 
      ? '1px solid rgba(100, 181, 246, 0.4)' 
      : '1px solid rgba(59, 130, 246, 0.3)'};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.6s ease;
    }
    
    &:hover {
      background: ${props.$isDark 
        ? 'linear-gradient(135deg, rgba(0, 123, 255, 0.5) 0%, rgba(37, 99, 235, 0.6) 100%)' 
        : 'linear-gradient(135deg, rgba(0, 123, 255, 0.9) 0%, rgba(37, 99, 235, 1) 100%)'};
      box-shadow: ${props.$isDark
        ? '0 12px 40px rgba(0, 102, 255, 0.4), 0 0 0 1px rgba(100, 181, 246, 0.3)'
        : '0 12px 40px rgba(0, 102, 255, 0.35)'};
      border-color: ${props.$isDark 
        ? 'rgba(100, 181, 246, 0.6)' 
        : 'rgba(59, 130, 246, 0.5)'};
      
      &::before {
        left: 100%;
      }
    }
  ` : `
    background: ${props.$isDark
      ? 'linear-gradient(135deg, rgba(255, 102, 0, 0.25) 0%, rgba(255, 119, 0, 0.3) 100%)'
      : 'linear-gradient(135deg, rgba(255, 102, 0, 0.9) 0%, rgba(255, 119, 0, 1) 100%)'};
    color: ${props.$isDark ? '#FFD700' : '#FFFFFF'};
    backdrop-filter: blur(20px);
    border: ${props.$isDark 
      ? '1px solid rgba(255, 165, 0, 0.4)' 
      : '1px solid rgba(255, 140, 0, 0.3)'};
    box-shadow: ${props.$isDark
      ? '0 8px 30px rgba(255, 102, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      : '0 8px 30px rgba(255, 102, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'};
    
    &:hover {
      background: ${props.$isDark
        ? 'linear-gradient(135deg, rgba(255, 119, 0, 0.35) 0%, rgba(255, 140, 0, 0.4) 100%)'
        : 'linear-gradient(135deg, rgba(255, 119, 0, 1) 0%, rgba(255, 140, 0, 1) 100%)'};
      border-color: ${props.$isDark ? 'rgba(255, 165, 0, 0.6)' : 'rgba(255, 140, 0, 0.5)'};
      box-shadow: ${props.$isDark
        ? '0 12px 40px rgba(255, 102, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        : '0 12px 40px rgba(255, 102, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)'};
    }
  `}

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
    padding: 1rem 2rem;
  }
`;

const SearchWrapper = styled(motion.div)`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const NewHeroSection: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isBg = language === 'bg';
  const isDark = theme === 'dark';

  return (
    <HeroContainer $isDark={isDark}>
      <ContentWrapper>
        <Headlines
          $isDark={isDark}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Title $isDark={isDark}>
            {isBg ? (
              <>Твоят нов <span>автомобил</span></>
            ) : (
              <>Your next <span>Journey</span></>
            )}
          </Title>
          <Subtitle $isDark={isDark}>
            {isBg
              ? 'Най-престижният пазар в България. Директна връзка с топ дилъри.'
              : 'The most prestigious marketplace in Bulgaria. Direct access to top dealers.'}
          </Subtitle>
        </Headlines>

        <SearchWrapper
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SearchWidget />
        </SearchWrapper>

        <QuickActions
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <ActionButton
            $variant="primary"
            $isDark={isDark}
            whileHover={{ scale: 1.05, translateY: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/sell/intro')}
          >
            <Send size={20} />
            {isBg ? 'Продай кола сега' : 'Sell Car Now'}
          </ActionButton>

          <ActionButton
            $variant="secondary"
            $isDark={isDark}
            whileHover={{ scale: 1.05, translateY: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/cars')}
          >
            <Car size={20} />
            {isBg ? 'Разгледай обяви' : 'Browse Ads'}
          </ActionButton>
        </QuickActions>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{ width: '100%' }}
        >
          <TrustIndicators />
        </motion.div>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default NewHeroSection;
