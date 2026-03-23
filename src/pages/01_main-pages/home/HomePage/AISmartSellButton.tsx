/**
 * AI Smart Sell Button
 * Prominent CTA button for AI-powered car listing
 * 
 * Features:
 * - Eye-catching glassmorphism design
 * - Animated AI Robot icon
 * - Opens AI Analysis Modal
 * - Bilingual support (bg/en)
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Zap, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';
import { AIRobotIcon } from '@/components/icons/AIRobotIcon';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

const ButtonWrapper = styled(motion.div)`
  position: relative;
  display: inline-block;
`;

const StyledButton = styled.button`
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 1.25rem 3rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: inherit;
  color: white;
  background: var(--btn-primary-bg);
  box-shadow: 
    0 12px 40px rgba(59, 130, 246, 0.4),
    0 6px 20px rgba(147, 51, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: var(--btn-primary-bg);
    box-shadow: 
      0 16px 56px rgba(59, 130, 246, 0.5),
      0 8px 28px rgba(147, 51, 234, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  /* Shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--btn-primary-bg);
    animation: ${shimmer} 3s infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem 2rem;
    border-radius: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.875rem 1.5rem;
    gap: 0.5rem;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
    gap: 0.375rem;
  }
`;

const IconWrapper = styled.span<{ $animate?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: ${({ $animate }) => ($animate ? pulse : 'none')} 2s ease-in-out infinite;
  
  svg {
    width: 1.5em;
    height: 1.5em;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  @media (max-width: 768px) {
    svg {
      width: 1.25em;
      height: 1.25em;
    }
  }
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 0.95em;
  }

  @media (max-width: 360px) {
    font-size: 0.85em;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--btn-primary-bg);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  z-index: 2;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
    top: -6px;
    right: -6px;
  }
`;

export const AISmartSellButton: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleClick = () => {
    logger.info('AI Smart Sell button clicked');
    navigate('/ai-analysis');
  };

  const text = {
    button: language === 'bg' 
      ? 'Добави обява с AI' 
      : 'Add Listing with AI',
    badge: language === 'bg' ? 'НОВО' : 'NEW'
  };

  return (
    <>
      <Container>
        <ButtonWrapper
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <StyledButton onClick={handleClick} aria-label={text.button}>
            <IconWrapper $animate>
              <AIRobotIcon size={20} animate />
            </IconWrapper>
            <ButtonText>{text.button}</ButtonText>
            <IconWrapper>
              <Camera />
            </IconWrapper>
            <IconWrapper>
              <Zap />
            </IconWrapper>
          </StyledButton>
          <Badge>{text.badge}</Badge>
        </ButtonWrapper>
      </Container>
    </>
  );
};

export default AISmartSellButton;
