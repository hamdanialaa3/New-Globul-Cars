// Floating Add Car Button - Glassmorphism design
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Plus, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 143, 16, 0.7); }
  50% { box-shadow: 0 0 0 20px rgba(255, 143, 16, 0); }
`;

// ==================== STYLED COMPONENTS ====================

const FloatingButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 999;
  
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  
  background: linear-gradient(135deg, 
    rgba(255, 143, 16, 0.9) 0%, 
    rgba(255, 121, 0, 0.85) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  box-shadow: 
    0 8px 32px rgba(255, 143, 16, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  cursor: pointer;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* GPU acceleration */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  animation: ${float} 3s ease-in-out infinite;
  
  &:hover {
    transform: translateY(-4px) scale(1.1);
    box-shadow: 
      0 12px 48px rgba(255, 143, 16, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    animation: none; /* Stop floating on hover */
  }
  
  &:active {
    transform: translateY(-2px) scale(1.05);
    animation: ${pulse} 0.6s ease-out;
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  
  svg {
    width: 28px;
    height: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  @media (max-width: 768px) {
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  
  padding: 8px 16px;
  background: rgba(33, 37, 41, 0.95);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: none;
  
  transition: opacity 0.2s ease;
  
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  
  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid rgba(33, 37, 41, 0.95);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
  
  @media (max-width: 768px) {
    display: none; /* Hide tooltip on mobile */
  }
`;

// ==================== COMPONENT ====================

const FloatingAddButton: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const handleClick = () => {
    navigate('/sell');
  };
  
  return (
    <>
      <FloatingButton
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={language === 'bg' ? 'Добави кола' : 'Add Car'}
        title={language === 'bg' ? 'Добави кола' : 'Add Car'}
      >
        <IconWrapper>
          <Plus size={28} strokeWidth={3} />
        </IconWrapper>
        
        <Tooltip $show={showTooltip}>
          {language === 'bg' ? 'Добави кола' : 'Add Car'}
        </Tooltip>
      </FloatingButton>
    </>
  );
};

export default FloatingAddButton;

