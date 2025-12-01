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
  padding: 20px;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%)' 
    : 'var(--bg-card)'};
  border: 2px solid ${props => props.$active 
    ? 'transparent' 
    : 'var(--border-primary)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$active 
    ? 'var(--shadow-button)' 
    : 'var(--shadow-card)'};
  color: ${props => props.$active 
    ? 'var(--text-inverse)' 
    : 'var(--text-primary)'};
  height: 100%;
  width: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.$active 
      ? 'var(--shadow-button)' 
      : 'var(--shadow-lg)'};
    border-color: ${props => props.$active 
      ? 'transparent' 
      : 'var(--accent-primary)'};
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)' 
      : 'var(--bg-hover)'};
    color: ${props => props.$active 
      ? 'var(--text-inverse)' 
      : 'var(--accent-primary)'};
  }

  &:active {
    transform: translateY(-2px);
  }

  svg {
    margin-bottom: 12px;
    transition: transform 0.3s ease, color 0.3s ease;
    color: ${props => props.$active 
      ? 'var(--text-inverse)' 
      : 'var(--accent-primary)'};
  }

  &:hover svg {
    transform: scale(1.1);
    color: ${props => props.$active 
      ? 'var(--text-inverse)' 
      : 'var(--accent-primary)'};
  }
`;

const Label = styled.span`
  font-weight: 600;
  font-size: 0.9375rem;
  text-align: center;
  transition: color 0.3s ease;
`;

const Count = styled.span<{ $active: boolean }>`
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 4px;
  color: ${props => props.$active 
    ? 'var(--text-inverse)' 
    : 'var(--text-tertiary)'};
  transition: color 0.3s ease, opacity 0.3s ease;
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
            {IconMap[category.iconName] || <Car size={24} />}
            <Label>{getLabel()}</Label>
            <Count $active={isActive}>{getCountText()}</Count>
        </Card>
    );
};

export default VehicleCategoryCard;
