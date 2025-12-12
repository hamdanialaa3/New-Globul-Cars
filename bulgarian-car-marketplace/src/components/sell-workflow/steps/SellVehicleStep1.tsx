// Sell Vehicle Step 1: Vehicle Type Selection
// الخطوة 1: اختيار نوع المركبة

import React, { useState } from 'react';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, Wrench } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';

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

const VehicleOption = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected ? 'var(--accent-primary)' : 'var(--bg-card)'};
  border: 2px solid ${props => props.$selected ? 'var(--accent-primary)' : 'var(--border)'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$selected ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-primary);
  }
`;

const VehicleIcon = styled.div<{ $selected: boolean }>`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: ${props => props.$selected ? 'white' : 'var(--accent-primary)'};
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const VehicleLabel = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;

export const SellVehicleStep1: React.FC<SellVehicleStep1Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  const vehicleTypes = [
    { id: 'car', IconComponent: Car, label: language === 'bg' ? 'Лека кола' : 'Car' },
    { id: 'van', IconComponent: Caravan, label: language === 'bg' ? 'Ван' : 'Van' },
    { id: 'motorcycle', IconComponent: Bike, label: language === 'bg' ? 'Мотоциклет' : 'Motorcycle' },
    { id: 'truck', IconComponent: Truck, label: language === 'bg' ? 'Камион' : 'Truck' },
    { id: 'bus', IconComponent: Bus, label: language === 'bg' ? 'Автобус' : 'Bus' },
    { id: 'parts', IconComponent: Wrench, label: language === 'bg' ? 'Части' : 'Parts' },
  ];

  return (
    <FormContainer>
      <VehicleGrid>
        {vehicleTypes.map(({ id, IconComponent, label }) => (
          <VehicleOption
            key={id}
            $selected={workflowData.vehicleType === id}
            onClick={() => onUpdate({ vehicleType: id })}
          >
            <VehicleIcon $selected={workflowData.vehicleType === id}>
              <IconComponent />
            </VehicleIcon>
            <VehicleLabel>{label}</VehicleLabel>
          </VehicleOption>
        ))}
      </VehicleGrid>
    </FormContainer>
  );
};

export default SellVehicleStep1;
