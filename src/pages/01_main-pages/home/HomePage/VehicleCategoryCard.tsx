import React from 'react';
import styled from 'styled-components';
import { Car, Truck, Zap, Shield, Activity, Users, Briefcase, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Interface for category data
export interface VehicleCategory {
    id: string;
    labelBg: string; // Bulgarian label
    labelEn: string; // English label
    iconName: string;
    count?: number;
}

// Icon mapping
const IconMap: Record<string, React.ReactNode> = {
    'sedan': <Car size={24} />,
    'suv': <Shield size={24} />,
    'hatchback': <Activity size={24} />,
    'coupe': <Zap size={24} />,
    'wagon': <Briefcase size={24} />,
    'convertible': <Sun size={24} />,
    'pickup': <Truck size={24} />,
    'minivan': <Users size={24} />
};

const Card = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  
  /* Parallelogram shape with skew */
  transform: skewX(-8deg);
  transform-origin: center;
  
  /* Glassmorphism background */
  background: ${({ theme, $active }) =>
    $active
      ? `linear-gradient(135deg,
          rgba(255, 121, 0, ${theme.mode === 'dark' ? 0.28 : 0.18}) 0%,
          rgba(255, 143, 16, ${theme.mode === 'dark' ? 0.22 : 0.14}) 55%,
          rgba(255, 185, 0, ${theme.mode === 'dark' ? 0.18 : 0.12}) 100%
        )`
      : theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(255, 255, 255, 0.55)'};

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  border: 1px solid ${({ theme, $active }) =>
    $active
      ? (theme.mode === 'dark' ? 'rgba(255, 143, 16, 0.55)' : 'rgba(255, 121, 0, 0.35)')
      : (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.10)')};
  
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Enhanced shadows */
  box-shadow: ${({ theme, $active }) =>
    $active
      ? (theme.mode === 'dark'
        ? '0 18px 40px rgba(0, 0, 0, 0.45), 0 8px 18px rgba(255, 121, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.10)'
        : '0 14px 34px rgba(15, 23, 42, 0.12), 0 6px 14px rgba(255, 121, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.35)')
      : (theme.mode === 'dark'
        ? '0 14px 30px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
        : '0 10px 26px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.35)')};
  
  color: ${({ theme, $active }) =>
    $active ? (theme.mode === 'dark' ? '#ffffff' : theme.colors.text.primary) : theme.colors.text.primary};
  
  height: 100%;
  width: 100%;
  min-height: 120px;

  /* Inner content wrapper - reverse skew to keep text straight */
  & > div {
    transform: skewX(8deg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  /* Hover effects */
  &:hover {
    transform: skewX(-8deg) translateY(-6px) scale(1.02);
    box-shadow: ${({ theme, $active }) =>
      $active
        ? (theme.mode === 'dark'
          ? '0 22px 50px rgba(0, 0, 0, 0.52), 0 10px 24px rgba(255, 121, 0, 0.22)'
          : '0 18px 44px rgba(15, 23, 42, 0.16), 0 10px 22px rgba(255, 121, 0, 0.18)')
        : (theme.mode === 'dark'
          ? '0 18px 38px rgba(0, 0, 0, 0.46)'
          : '0 14px 34px rgba(15, 23, 42, 0.14)')};
    border-color: ${({ theme, $active }) =>
      $active
        ? (theme.mode === 'dark' ? 'rgba(255, 143, 16, 0.65)' : 'rgba(255, 121, 0, 0.45)')
        : (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(15, 23, 42, 0.16)')};
  }

  &:active {
    transform: skewX(-8deg) translateY(-2px) scale(0.98);
    box-shadow: ${props => props.$active 
      ? '0 4px 12px rgba(255, 121, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2)' 
      : '0 2px 6px rgba(0, 0, 0, 0.1)'};
  }

  /* Shine effect on active */
  ${props => props.$active && `
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
        rgba(255, 255, 255, 0.15) 50%,
        transparent 70%
      );
      transform: rotate(45deg);
      animation: shine 3s infinite;
    }
  `}

  /* Subtle glass shine */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.10) 25%,
      rgba(255, 255, 255, 0.05) 55%,
      rgba(255, 255, 255, 0.00) 100%
    );
    opacity: ${({ theme }) => (theme.mode === 'dark' ? 0.16 : 0.22)};
    pointer-events: none;
  }

  svg {
    margin-bottom: 12px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: ${({ theme, $active }) =>
      $active ? '#ffffff' : (theme.mode === 'dark' ? '#FF8F10' : '#FF7900')};
    filter: ${props => props.$active 
      ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' 
      : 'none'};
  }

  &:hover svg {
    transform: scale(1.15) rotate(5deg);
    color: ${props => props.$active 
      ? '#ffffff' 
      : '#FF7900'};
  }

  @keyframes shine {
    0% {
      transform: rotate(45deg) translateX(-100%);
    }
    50%, 100% {
      transform: rotate(45deg) translateX(100%);
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    padding: 20px 16px;
    min-height: 100px;
    
    &:hover {
      transform: skewX(-8deg) translateY(-3px) scale(1.01);
    }
  }
`;

const Label = styled.span<{ $active: boolean }>`
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.3px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${props => props.$active 
    ? '#ffffff' 
    : '#1e293b'};
  text-shadow: ${props => props.$active 
    ? '0 1px 2px rgba(0, 0, 0, 0.2)' 
    : 'none'};
  
  html[data-theme="dark"] & {
    color: ${props => props.$active 
      ? '#ffffff' 
      : '#e2e8f0'};
  }
`;

const Count = styled.span<{ $active: boolean }>`
  font-size: 0.8125rem;
  font-weight: 500;
  margin-top: 6px;
  opacity: ${props => props.$active ? 0.95 : 0.7};
  color: ${props => props.$active 
    ? 'rgba(255, 255, 255, 0.95)' 
    : '#64748b'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: ${props => props.$active 
    ? '0 1px 2px rgba(230, 18, 18, 0.15)' 
    : 'none'};
  
  html[data-theme="dark"] & {
    color: ${props => props.$active 
      ? 'rgba(255, 255, 255, 0.95)' 
      : '#94a3b8'};
  }
`;

interface Props {
    category: VehicleCategory;
    isActive: boolean;
    onClick: () => void;
}

const VehicleCategoryCard: React.FC<Props> = ({ category, isActive, onClick }) => {
    const { language } = useLanguage();
    
    const getLabel = () => {
        return language === 'bg' ? category.labelBg : category.labelEn;
    };
    
    const getCountText = () => {
        const count = category.count || 0;
        if (language === 'bg') {
            return `${count} обяви`;
        } else {
            return `${count} ${count === 1 ? 'listing' : 'listings'}`;
        }
    };
    
    return (
        <Card $active={isActive} onClick={onClick}>
            <div>
                {IconMap[category.iconName] || <Car size={24} />}
                <Label $active={isActive}>{getLabel()}</Label>
                <Count $active={isActive}>{getCountText()}</Count>
            </div>
        </Card>
    );
};

export default VehicleCategoryCard;
