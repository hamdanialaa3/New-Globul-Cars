import React from 'react';
import styled from 'styled-components';
import { Car, Truck, Zap, Shield, Activity, Users, Briefcase, Sun } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

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
  
  /* Background with gradient */
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #FF7900 0%, #FF8F10 50%, #FFB900 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'};
  
  border: 2px solid ${props => props.$active 
    ? 'transparent' 
    : 'rgba(255, 121, 0, 0.2)'};
  
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Enhanced shadows */
  box-shadow: ${props => props.$active 
    ? '0 8px 24px rgba(255, 121, 0, 0.35), 0 4px 12px rgba(255, 121, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)'};
  
  color: ${props => props.$active 
    ? '#ffffff' 
    : '#1e293b'};
  
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
    box-shadow: ${props => props.$active 
      ? '0 12px 32px rgba(255, 121, 0, 0.45), 0 6px 16px rgba(255, 121, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
      : '0 8px 20px rgba(255, 121, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)'};
    border-color: ${props => props.$active 
      ? 'transparent' 
      : 'rgba(255, 121, 0, 0.4)'};
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #FF8F10 0%, #FF7900 50%, #FF8F10 100%)' 
      : 'linear-gradient(135deg, #fff5eb 0%, #ffe8d1 100%)'};
    color: ${props => props.$active 
      ? '#ffffff' 
      : '#FF7900'};
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

  /* Dark mode support */
  html[data-theme="dark"] & {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #FF7900 0%, #FF8F10 50%, #FFB900 100%)' 
      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'};
    border-color: ${props => props.$active 
      ? 'transparent' 
      : 'rgba(255, 121, 0, 0.3)'};
    color: ${props => props.$active 
      ? '#ffffff' 
      : '#e2e8f0'};
    box-shadow: ${props => props.$active 
      ? '0 8px 24px rgba(255, 121, 0, 0.4), 0 4px 12px rgba(255, 121, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
      : '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'};
    
    &:hover {
      background: ${props => props.$active 
        ? 'linear-gradient(135deg, #FF8F10 0%, #FF7900 50%, #FF8F10 100%)' 
        : 'linear-gradient(135deg, #334155 0%, #475569 100%)'};
      border-color: ${props => props.$active 
        ? 'transparent' 
        : 'rgba(255, 121, 0, 0.5)'};
      color: ${props => props.$active 
        ? '#ffffff' 
        : '#FF7900'};
      box-shadow: ${props => props.$active 
        ? '0 12px 32px rgba(255, 121, 0, 0.5), 0 6px 16px rgba(255, 121, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)' 
        : '0 8px 20px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)'};
    }
  }

  svg {
    margin-bottom: 12px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: ${props => props.$active 
      ? '#ffffff' 
      : '#FF7900'};
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
