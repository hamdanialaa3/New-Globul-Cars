import React from 'react';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, Wrench, Construction } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';
import { toast } from 'react-toastify';

interface SellVehicleStep1Props {
  workflowData: Partial<UnifiedWorkflowData>;
  onUpdate: (updates: Partial<UnifiedWorkflowData>) => void;
  onNext?: () => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ComingSoonBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--warning);
  color: var(--text-on-accent);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const VehicleOption = styled.div<{ $selected: boolean; $disabled: boolean }>`
  background: ${props => {
    if (props.$disabled) return 'var(--bg-secondary)'; // Keeping it visible but distinct
    return props.$selected ? 'var(--accent-primary)' : 'var(--bg-card)';
  }};
  border: 2px solid ${props => {
    if (props.$disabled) return 'var(--border-secondary)';
    return props.$selected ? 'var(--accent-primary)' : 'var(--border-primary)';
  }};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  color: ${props => {
    if (props.$disabled) return 'var(--text-disabled)';
    return props.$selected ? 'white' : 'var(--text-primary)';
  }};
  opacity: ${props => props.$disabled ? 0.7 : 1}; /* Increased opacity to make it readable */
  position: relative;
  overflow: hidden; /* Added to contain badge/effects */
  
  /* grayscale effect for disabled items */
  filter: ${props => props.$disabled ? 'grayscale(100%)' : 'none'};
  
  &:hover {
    ${props => !props.$disabled ? `
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent-primary);
    ` : `
      background: var(--bg-hover);
    `}
  }
  
  /* ✅ FIX: Adjust padding when text is hidden in portrait mobile */
  @media (max-width: 640px) and (orientation: portrait) {
    padding: 1rem;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  /* ✅ FIX: Smaller padding in landscape mobile */
  @media (max-width: 896px) and (orientation: landscape) {
    padding: 1rem 0.75rem;
  }
  
  /* ✅ FIX: Very small screens */
  @media (max-width: 480px) {
    padding: 0.875rem;
    min-height: 90px;
  }
`;

const VehicleIcon = styled.div<{ $selected: boolean; $disabled: boolean }>`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: ${props => {
    if (props.$disabled) return 'var(--text-disabled)';
    return props.$selected ? 'white' : 'var(--accent-primary)';
  }};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  svg {
    width: 32px;
    height: 32px;
  }
  
  /* ✅ FIX: Larger icons when text is hidden in portrait mobile */
  @media (max-width: 640px) and (orientation: portrait) {
    margin-bottom: 0;
    
    svg {
      width: 40px;
      height: 40px;
    }
  }
  
  /* ✅ FIX: Medium icons in landscape mobile */
  @media (max-width: 896px) and (orientation: landscape) {
    margin-bottom: 0.5rem;
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
  
  /* ✅ FIX: Larger icons in very small screens */
  @media (max-width: 480px) {
    margin-bottom: 0;
    
    svg {
      width: 36px;
      height: 36px;
    }
  }
`;

const VehicleLabel = styled.div<{ $disabled: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  color: ${props => props.$disabled ? 'var(--text-disabled)' : 'inherit'};
  
  /* ✅ FIX: Hide text in portrait mobile, show only icons */
  @media (max-width: 640px) and (orientation: portrait) {
    display: none;
  }
  
  /* ✅ FIX: Smaller text in landscape mobile */
  @media (max-width: 896px) and (orientation: landscape) {
    font-size: 0.75rem;
  }
  
  /* ✅ FIX: Very small screens - hide text */
  @media (max-width: 480px) {
    display: none;
  }
`;

export const SellVehicleStep1: React.FC<SellVehicleStep1Props> = ({
  workflowData,
  onUpdate,
  onNext,
}) => {
  const { t, language } = useLanguage();

  const vehicleTypes = [
    { id: 'car', IconComponent: Car, label: t('sell.start.vehicleTypes.car.title'), disabled: false },
    // SUV removed as per request
    { id: 'van', IconComponent: Caravan, label: t('sell.start.vehicleTypes.van.title'), disabled: true },
    { id: 'motorcycle', IconComponent: Bike, label: t('sell.start.vehicleTypes.motorcycle.title'), disabled: true },
    { id: 'truck', IconComponent: Truck, label: t('sell.start.vehicleTypes.truck.title'), disabled: true },
    { id: 'bus', IconComponent: Bus, label: t('sell.start.vehicleTypes.bus.title'), disabled: true },
    { id: 'parts', IconComponent: Wrench, label: t('sell.start.vehicleTypes.parts.title'), disabled: true },
  ];

  const handleVehicleSelect = (id: string, disabled: boolean) => {
    if (disabled) {
      // "Coming very soon these options will be available"
      const message = language === 'bg'
        ? 'Очаквайте скоро! Тези опции ще бъдат налични много скоро.'
        : 'Coming very soon! These options will be available shortly.';
      toast.info(message);
      return;
    }

    onUpdate({ vehicleType: id });
    if (onNext) {
      onNext();
    }
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
            title={disabled ? (language === 'bg' ? 'Очаквайте скоро' : 'Coming Soon') : ''}
          >
            {disabled && (
              <ComingSoonBadge>
                <Construction size={10} />
                {language === 'bg' ? 'СКОРО' : 'SOON'}
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
