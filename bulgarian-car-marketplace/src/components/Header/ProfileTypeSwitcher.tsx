// src/components/Header/ProfileTypeSwitcher.tsx
// Profile Type Switcher Component for Header
import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Building2 } from 'lucide-react';
import { useProfileType } from '../../contexts/ProfileTypeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ProfileTypeSwitcher: React.FC = () => {
  const { profileType, switchProfileType, theme } = useProfileType();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitch = async (newType: 'private' | 'dealer' | 'company') => {
    if (newType === profileType || isLoading) return;
    
    setIsLoading(true);
    try {
      await switchProfileType(newType);
    } catch (error) {
      console.error('Error switching profile type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SwitcherContainer>
      <TypeButton
        $active={profileType === 'private'}
        $color="#FF8F10"
        onClick={() => handleSwitch('private')}
        disabled={isLoading}
        title={language === 'bg' ? 'Личен профил' : 'Private Profile'}
      >
        <User size={16} />
        <span>{language === 'bg' ? 'Личен' : 'Private'}</span>
      </TypeButton>

      <TypeButton
        $active={profileType === 'dealer'}
        $color="#16a34a"
        onClick={() => handleSwitch('dealer')}
        disabled={isLoading}
        title={language === 'bg' ? 'Дилърски профил' : 'Dealer Profile'}
      >
        <Building2 size={16} />
        <span>{language === 'bg' ? 'Дилър' : 'Dealer'}</span>
      </TypeButton>

      <TypeButton
        $active={profileType === 'company'}
        $color="#1d4ed8"
        onClick={() => handleSwitch('company')}
        disabled={isLoading}
        title={language === 'bg' ? 'Фирмен профил' : 'Company Profile'}
      >
        <Building2 size={16} />
        <span>{language === 'bg' ? 'Компания' : 'Company'}</span>
      </TypeButton>
    </SwitcherContainer>
  );
};

// Styled Components
const SwitcherContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    gap: 4px;
    padding: 3px;
  }
`;

const TypeButton = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid ${props => props.$active ? props.$color : 'transparent'};
  background: ${props => props.$active 
    ? `linear-gradient(135deg, ${props.$color} 0%, ${props.$color}E6 100%)` 
    : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6c757d'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  
  /* Glow effect for active button */
  ${props => props.$active && `
    box-shadow: 
      0 4px 16px ${props.$color}40,
      0 0 20px ${props.$color}30,
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    /* Shine effect */
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 70%
      );
      transform: rotate(45deg);
      animation: shine 3s infinite;
    }
  `}
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    filter: ${props => props.$active ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'};
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: ${props => props.$color};
    background: ${props => props.$active 
      ? `linear-gradient(135deg, ${props.$color}F0 0%, ${props.$color}CC 100%)` 
      : `${props.$color}15`};
    color: ${props => props.$active ? 'white' : props.$color};
    box-shadow: ${props => props.$active 
      ? `0 6px 20px ${props.$color}50, 0 0 25px ${props.$color}35` 
      : `0 4px 12px ${props.$color}20`};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.75rem;
    gap: 4px;
    
    svg {
      width: 14px;
      height: 14px;
    }
    
    span {
      display: none;
    }
  }
  
  @keyframes shine {
    0% {
      transform: rotate(45deg) translateX(-100%);
    }
    50%, 100% {
      transform: rotate(45deg) translateX(100%);
    }
  }
`;

export default ProfileTypeSwitcher;
