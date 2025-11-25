import React from 'react';
import styled from 'styled-components';
import { Car, Truck, Zap, Shield, Activity, Users, Briefcase, Sun } from 'lucide-react';

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

const Card = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white'};
  border: 1px solid ${props => props.active ? 'transparent' : '#e2e8f0'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? '0 10px 25px -5px rgba(59, 130, 246, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'};
  color: ${props => props.active ? 'white' : '#64748b'};
  height: 100%;
  width: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.active ? 'transparent' : '#3b82f6'};
    color: ${props => props.active ? 'white' : '#3b82f6'};
  }

  svg {
    margin-bottom: 12px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

const Label = styled.span`
  font-weight: 600;
  font-size: 0.9375rem;
  text-align: center;
`;

const Count = styled.span<{ active: boolean }>`
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
  color: ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : '#94a3b8'};
`;

interface Props {
    category: VehicleCategory;
    isActive: boolean;
    onClick: () => void;
}

const VehicleCategoryCard: React.FC<Props> = ({ category, isActive, onClick }) => {
    return (
        <Card active={isActive} onClick={onClick}>
            {IconMap[category.iconName] || <Car size={24} />}
            <Label>{category.labelBg}</Label>
            <Count active={isActive}>{category.count || 0} обяви</Count> {/* 'ads' in Bulgarian */}
        </Card>
    );
};

export default VehicleCategoryCard;
