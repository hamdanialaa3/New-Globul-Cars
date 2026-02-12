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
    if (props.$disabled) return '#9CA3AF';
    return props.$selected ? 'var(--accent-primary)' : '#9CA3AF';
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
  
  /* Responsive padding - Auto-scales based on screen size */
  @media (max-width: 1024px) {
    padding: 1.25rem 1rem;
  }
  
  @media (max-width: 896px) and (orientation: landscape) {
    padding: 1rem 0.75rem;
  }
  
  @media (max-width: 640px) and (orientation: portrait) {
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem 0.5rem;
  }
  
  @media (max-width: 360px) {
    padding: 0.75rem 0.4rem;
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
  transition: all 0.3s ease;
  
  svg {
    width: 32px;
    height: 32px;
  }
  
  /* Tablet - Medium size */
  @media (max-width: 1024px) {
    margin-bottom: 0.6rem;
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
  
  /* Landscape mobile - Slightly smaller */
  @media (max-width: 896px) and (orientation: landscape) {
    margin-bottom: 0.5rem;
    
    svg {
      width: 26px;
      height: 26px;
    }
  }
  
  /* Portrait mobile - Mobile-friendly size */
  @media (max-width: 640px) and (orientation: portrait) {
    margin-bottom: 0.5rem;
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
  
  /* Very small screens - smallest size */
  @media (max-width: 480px) {
    margin-bottom: 0.4rem;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const VehicleLabel = styled.div<{ $disabled: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  color: ${props => props.$disabled ? 'var(--text-disabled)' : 'inherit'};
  transition: font-size 0.3s ease;
  text-align: center;
  line-height: 1.3;
  
  /* Tablet size - Slightly smaller */
  @media (max-width: 1024px) {
    font-size: 0.88rem;
  }
  
  /* Landscape mobile - Even smaller */
  @media (max-width: 896px) and (orientation: landscape) {
    font-size: 0.78rem;
  }
  
  /* Portrait mobile - Noticeably smaller but readable */
  @media (max-width: 640px) and (orientation: portrait) {
    font-size: 0.7rem;
    font-weight: 500;
  }
  
  /* Very small screens - Smallest size but still visible */
  @media (max-width: 480px) {
    font-size: 0.65rem;
    line-height: 1.2;
  }
  
  /* Extra tiny screens - Smallest possible size */
  @media (max-width: 360px) {
    font-size: 0.6rem;
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
