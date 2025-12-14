// Sell Vehicle Step 1: Vehicle Type Selection
// الخطوة 1: اختيار نوع المركبة

import React from 'react';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, Wrench } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';
import { toast } from 'react-toastify';

interface SellVehicleStep1Props {
  workflowData: SellWorkflowData;
  onUpdate: (updates: Partial<SellWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const VehicleOption = styled.div<{ $selected: boolean; $disabled: boolean }>`
  background: ${props => {
    if (props.$disabled) return '#f5f5f5';
    return props.$selected ? 'var(--accent-primary)' : 'var(--bg-card)';
  }};
  border: 2px solid ${props => {
    if (props.$disabled) return '#e0e0e0';
    return props.$selected ? 'var(--accent-primary)' : 'var(--border)';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  color: ${props => {
    if (props.$disabled) return '#999999';
    return props.$selected ? 'white' : 'var(--text-primary)';
  }};
  opacity: ${props => props.$disabled ? 0.4 : 1};
  position: relative;
  filter: ${props => props.$disabled ? 'grayscale(80%)' : 'none'};
  
  &:hover {
    ${props => !props.$disabled ? `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--accent-primary);
    ` : `
      cursor: not-allowed;
    `}
  }
`;

const VehicleIcon = styled.div<{ $selected: boolean; $disabled: boolean }>`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: ${props => {
    if (props.$disabled) return '#999999';
    return props.$selected ? 'white' : 'var(--accent-primary)';
  }};
  opacity: ${props => props.$disabled ? 0.4 : 1};
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const VehicleLabel = styled.div<{ $disabled: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  color: ${props => props.$disabled ? '#999999' : 'inherit'};
`;

const ComingSoonBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  z-index: 10;
`;

export const SellVehicleStep1: React.FC<SellVehicleStep1Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  const vehicleTypes = [
    { id: 'car', IconComponent: Car, label: language === 'bg' ? 'Лека кола' : 'Car', disabled: false },
    { id: 'van', IconComponent: Caravan, label: language === 'bg' ? 'Ван' : 'Van', disabled: true },
    { id: 'motorcycle', IconComponent: Bike, label: language === 'bg' ? 'Мотоциклет' : 'Motorcycle', disabled: true },
    { id: 'truck', IconComponent: Truck, label: language === 'bg' ? 'Камион' : 'Truck', disabled: true },
    { id: 'bus', IconComponent: Bus, label: language === 'bg' ? 'Автобус' : 'Bus', disabled: true },
    { id: 'parts', IconComponent: Wrench, label: language === 'bg' ? 'Части' : 'Parts', disabled: true },
  ];

  const handleVehicleSelect = (id: string, disabled: boolean) => {
    if (disabled) {
      toast.info(
        language === 'bg' ? 'Скоро ще бъде налично' : 'Coming Soon',
        {
          autoClose: 3000,
          position: 'top-center'
        }
      );
      return;
    }
    
    onUpdate({ vehicleType: id });
  };

  return (
    <FormContainer>
      <VehicleGrid>
        {vehicleTypes.map(({ id, IconComponent, label, disabled }) => (
          <VehicleOption
            key={id}
            $selected={workflowData.vehicleType === id}
            $disabled={disabled}
            onClick={() => handleVehicleSelect(id, disabled)}
          >
            {disabled && (
              <ComingSoonBadge>
                {language === 'bg' ? 'Скоро' : 'Soon'}
              </ComingSoonBadge>
            )}
            <VehicleIcon $selected={workflowData.vehicleType === id} $disabled={disabled}>
              <IconComponent />
            </VehicleIcon>
            <VehicleLabel $disabled={disabled}>{label}</VehicleLabel>
          </VehicleOption>
        ))}
      </VehicleGrid>
    </FormContainer>
  );
};

export default SellVehicleStep1;
