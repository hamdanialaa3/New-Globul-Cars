// Floating Speed Dial Button - Multi-action FAB with Glassmorphism
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Plus, Car, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 143, 16, 0.7); }
  50% { box-shadow: 0 0 0 20px rgba(255, 143, 16, 0); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(135deg); }
`;

// ==================== STYLED COMPONENTS ====================

const SpeedDialContainer = styled.div`
  position: fixed;
  bottom: 160px;
  right: 32px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  
  @media (max-width: 768px) {
    bottom: 136px;
    right: 24px;
    gap: 12px;
  }
`;

const Backdrop = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 998;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

const FloatingButton = styled.button<{ $isOpen: boolean }>`
  position: relative;
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
  
  animation: ${props => props.$isOpen ? 'none' : float} 3s ease-in-out infinite;
  
  &:hover {
    transform: translateY(-4px) scale(1.1);
    box-shadow: 
      0 12px 48px rgba(255, 143, 16, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: translateY(-2px) scale(1.05);
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
`;

const MainIcon = styled.div<{ $isOpen: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transform: ${props => props.$isOpen ? 'rotate(135deg)' : 'rotate(0deg)'};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
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

const SpeedDialItem = styled.button<{ $index: number; $show: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.95) 0%, 
    rgba(22, 33, 62, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  box-shadow: 
    0 6px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)'};
  animation: ${props => props.$show ? slideIn : 'none'} 0.3s ease-out;
  animation-delay: ${props => props.$index * 0.05}s;
  animation-fill-mode: backwards;
  
  &:hover {
    transform: translateY(-2px) scale(1.1);
    box-shadow: 
      0 8px 32px rgba(255, 143, 16, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0) scale(1.05);
  }
  
  svg {
    color: #FFD700;
    width: 28px;
    height: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
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

const ItemLabel = styled.div<{ $show: boolean }>`
  position: absolute;
  right: 72px;
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
    display: none;
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

interface SpeedDialAction {
  icon: React.ReactNode;
  label: { bg: string; en: string };
  onClick: () => void;
}

const FloatingAddButton: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const actions: SpeedDialAction[] = [
    {
      icon: <Car size={28} strokeWidth={2.5} />,
      label: { bg: 'Добави кола', en: 'Add Car' },
      onClick: () => {
        navigate('/sell');
        setIsOpen(false);
      }
    },
    {
      icon: <Users size={28} strokeWidth={2.5} />,
      label: { bg: 'Социална мрежа', en: 'Social Feed' },
      onClick: () => {
        navigate('/social');
        setIsOpen(false);
      }
    }
  ];
  
  const handleMainClick = () => {
    setIsOpen(!isOpen);
  };
  
  const handleBackdropClick = () => {
    setIsOpen(false);
  };
  
  return (
    <>
      <Backdrop $show={isOpen} onClick={handleBackdropClick} />
      
      <SpeedDialContainer>
        {/* Speed Dial Items */}
        {actions.map((action, index) => (
          <div key={index} style={{ position: 'relative' }}>
            <SpeedDialItem
              $index={index}
              $show={isOpen}
              onClick={action.onClick}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={action.label[language]}
            >
              {action.icon}
            </SpeedDialItem>
            
            <ItemLabel $show={isOpen && hoveredIndex === index}>
              {action.label[language]}
            </ItemLabel>
          </div>
        ))}
        
        {/* Main Button */}
        <FloatingButton
          $isOpen={isOpen}
          onClick={handleMainClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
        >
          <MainIcon $isOpen={isOpen}>
            <Plus size={28} strokeWidth={3} />
          </MainIcon>
          
          <Tooltip $show={showTooltip && !isOpen}>
            {language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
          </Tooltip>
        </FloatingButton>
      </SpeedDialContainer>
    </>
  );
};

export default FloatingAddButton;

