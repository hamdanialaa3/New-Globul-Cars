// RobotChatIcon.tsx
// أيقونة روبوت المحادثة - تظهر في جميع الصفحات

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MessageCircle } from 'lucide-react';
import { AIChatbot } from './AIChatbot';
import { useLanguage } from '@/contexts/LanguageContext';

// ==================== ANIMATIONS ====================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// ==================== STYLED COMPONENTS ====================

const FloatingContainer = styled.div`
  position: fixed;
  right: 32px;
  bottom: 244px; /* FloatingAddButton at 160px + 64px button + 20px gap */
  z-index: 1000;
  
  @media (max-width: 768px) {
    right: 24px;
    bottom: 212px; /* Mobile: 136px + 56px + 20px */
  }
`;

const ChatButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: white;
  font-size: 32px;
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${float} 3s ease-in-out infinite;
  
  box-shadow: 0 8px 24px ${props => props.$isActive 
    ? 'rgba(56, 189, 248, 0.4)' 
    : 'rgba(102, 126, 234, 0.4)'
  };
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 32px ${props => props.$isActive 
      ? 'rgba(56, 189, 248, 0.5)' 
      : 'rgba(102, 126, 234, 0.5)'
    };
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
  
  svg {
    stroke-width: 2;
  }
  
  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }
`;

const Badge = styled.div<{ $show: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'scale(1)' : 'scale(0)'};
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 9px;
  }
`;

const Tooltip = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateY(0)' : 'translateY(4px)'};
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 16px;
    border: 6px solid transparent;
    border-top-color: rgba(15, 23, 42, 0.95);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

// ==================== COMPONENT ====================

export const RobotChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { language } = useLanguage();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const tooltipText = {
    bg: 'AI Асистент',
    en: 'AI Assistant'
  };

  return (
    <>
      <FloatingContainer>
        <ChatButton
          $isActive={isOpen}
          onClick={handleToggle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={isOpen 
            ? (language === 'bg' ? 'Затвори AI чат' : 'Close AI Chat')
            : (language === 'bg' ? 'Отвори AI чат' : 'Open AI Chat')
          }
        >
          <MessageCircle size={28} />
          
          {/* Optional: Badge for unread messages */}
          <Badge $show={false}>!</Badge>
        </ChatButton>
        
        <Tooltip $show={showTooltip && !isOpen}>
          {tooltipText[language as keyof typeof tooltipText] || tooltipText.en}
        </Tooltip>
      </FloatingContainer>
      
      {/* Chat Window - controlled by RobotChatIcon state */}
      <AIChatbot 
        position="bottom-right"
        hideButton={true}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default RobotChatIcon;
