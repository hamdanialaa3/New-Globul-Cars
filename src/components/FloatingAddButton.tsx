// Floating Speed Dial Button - Multi-action FAB with Glassmorphism
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Plus, Car, Users, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
  50% { box-shadow: 0 0 0 20px rgba(139, 92, 246, 0); }
`;

// Horizontal slide-in (left expansion)
const slideInHorizontal = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(135deg); }
`;

// ==================== STYLED COMPONENTS ====================

const SpeedDialContainer = styled.div`
  position: fixed;
  bottom: 160px; /* Base position - aligned with other floating buttons */
  right: 32px; /* Aligned with other floating buttons */
  z-index: 999;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    bottom: 136px; /* Base position on mobile - aligned with other floating buttons */
    right: 24px; /* Aligned with other floating buttons on mobile */
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
    rgba(139, 92, 246, 0.9) 0%, 
    rgba(99, 102, 241, 0.85) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.4),
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
      0 12px 48px rgba(139, 92, 246, 0.5),
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
  width: 64px;
  height: 64px;
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
  transform: ${props => props.$show ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.8)'};
  animation: ${props => props.$show ? slideInHorizontal : 'none'} 0.3s ease-out;
  animation-delay: ${props => props.$index * 0.05}s;
  animation-fill-mode: backwards;
  
  &:hover {
    transform: translateX(0) scale(1.1);
    box-shadow: 
      0 8px 32px rgba(139, 92, 246, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateX(0) scale(1.05);
  }
  
  svg {
    color: #FFD700;
    width: 28px;
    height: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const ItemLabel = styled.div<{ $show: boolean }>`
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: rgba(33, 37, 41, 0.95);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -6px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid rgba(33, 37, 41, 0.95);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
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
    display: none;
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
  const location = useLocation();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // ✅ FIX: Hide FloatingAddButton in sell workflow pages to prevent navigation conflicts
  const isInSellWorkflow = location.pathname.startsWith('/sell/inserat/');
  
  if (isInSellWorkflow) {
    return null; // Don't render in sell workflow
  }
  
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
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      label: { bg: 'Карта', en: 'Map' },
      onClick: () => {
        navigate('/map');
        setIsOpen(false);
      }
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="15" y="3" width="6" height="6" rx="1" />
          <rect x="3" y="15" width="6" height="6" rx="1" />
          <rect x="15" y="15" width="6" height="6" rx="1" />
          <path d="M9 6h6" />
          <path d="M12 9v6" />
          <path d="M6 9v6" />
          <path d="M18 9v6" />
          <path d="M9 18h6" />
        </svg>
      ),
      label: { bg: 'Диаграма', en: 'Diagram' },
      onClick: () => {
        navigate('/diagram');
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


