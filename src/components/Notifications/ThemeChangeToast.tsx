import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, CheckCircle, Info } from 'lucide-react';
import type { ProfileType } from '../../contexts/ProfileTypeContext';

// ==================== TYPES ====================

interface ThemeChangeToastProps {
  fromType: ProfileType;
  toType: ProfileType;
}

interface Theme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  gradient: string;
}

// ==================== THEMES ====================

const THEMES: Record<ProfileType, Theme> = {
  private: {
    primary: '#3B82F6',
    primaryDark: '#FF6B00',
    primaryLight: '#FFB84D',
    gradient: 'linear-gradient(135deg, #3B82F6, #FF6B00)'
  },
  dealer: {
    primary: '#2196F3',
    primaryDark: '#1976D2',
    primaryLight: '#64B5F6',
    gradient: 'linear-gradient(135deg, #2196F3, #1976D2)'
  },
  company: {
    primary: '#1565C0',
    primaryDark: '#0D47A1',
    primaryLight: '#1E88E5',
    gradient: 'linear-gradient(135deg, #1565C0, #0D47A1)'
  }
};

// ==================== ANIMATIONS ====================

const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const progressBar = keyframes`
  from { width: 100%; }
  to { width: 0; }
`;

// ==================== STYLED COMPONENTS ====================

const ToastContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  
  min-width: 320px;
  background: #3e3e3e;
  border-radius: 12px;
  
  box-shadow: 
    8px 8px 24px rgba(0, 0, 0, 0.6),
    -4px -4px 16px rgba(255, 255, 255, 0.05);
  
  overflow: hidden;
  animation: ${slideIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ToastHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TransitionIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TypeIconWrapper = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: #ffffff;
  font-weight: 700;
  font-size: 0.75rem;
  
  box-shadow: 0 4px 12px ${props => props.$color}40;
`;

const ToastTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
`;

const ToastBody = styled.div`
  padding: 16px 20px;
`;

const ChangeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    color: #4CAF50;
    flex-shrink: 0;
  }
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 0 2px 8px ${props => props.$color}60;
  flex-shrink: 0;
`;

const ToastProgress = styled.div<{ $duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  animation: ${progressBar} ${props => props.$duration}ms linear forwards;
`;

// ==================== COMPONENT ====================

const ThemeChangeToast: React.FC<ThemeChangeToastProps> = ({ fromType, toType }) => {
  const fromTheme = THEMES[fromType];
  const toTheme = THEMES[toType];
  
  const getTypeName = (type: ProfileType): string => {
    const names: Record<ProfileType, string> = {
      private: 'Private',
      dealer: 'Dealer',
      company: 'Company'
    };
    return names[type];
  };
  
  const getTypeInitial = (type: ProfileType): string => {
    return type.charAt(0).toUpperCase();
  };
  
  return (
    <ToastContainer>
      <ToastHeader>
        <TransitionIcon>
          <TypeIconWrapper $color={fromTheme.primary}>
            {getTypeInitial(fromType)}
          </TypeIconWrapper>
          <ArrowRight size={16} color="rgba(255, 255, 255, 0.6)" />
          <TypeIconWrapper $color={toTheme.primary}>
            {getTypeInitial(toType)}
          </TypeIconWrapper>
        </TransitionIcon>
        <ToastTitle>Profile Type Changed</ToastTitle>
      </ToastHeader>
      
      <ToastBody>
        <ChangeList>
          <ChangeItem>
            <ColorDot $color={fromTheme.primary} />
            <ArrowRight size={12} color="rgba(255, 255, 255, 0.4)" />
            <ColorDot $color={toTheme.primary} />
            <span>Theme colors updated to {getTypeName(toType)}</span>
          </ChangeItem>
          
          <ChangeItem>
            <CheckCircle size={14} />
            <span>New features unlocked</span>
          </ChangeItem>
          
          <ChangeItem>
            <Info size={14} />
            <span>Additional fields now available</span>
          </ChangeItem>
        </ChangeList>
      </ToastBody>
      
      <ToastProgress $duration={3000} />
    </ToastContainer>
  );
};

export default ThemeChangeToast;

