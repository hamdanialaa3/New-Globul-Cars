// Step 1: Vehicle Type Selection
// الخطوة 1: اختيار نوع المركبة
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Car, Truck, Bus, Bike, Caravan, Wrench, Construction } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCarListingStore } from '../../stores/car-listing-store';
import { step1Schema, Step1Data } from '../../schemas/car-listing.schema';
import { toast } from 'react-toastify';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
`;

const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
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

const VehicleOption = styled.button<{ $selected: boolean; $disabled: boolean }>`
  background: ${props => {
    if (props.$disabled) return 'var(--bg-secondary)';
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
  opacity: ${props => props.$disabled ? 0.7 : 1};
  position: relative;
  overflow: hidden;
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
  
  @media (max-width: 640px) {
    padding: 1rem;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
  
  @media (max-width: 640px) {
    margin-bottom: 0;
    
    svg {
      width: 40px;
      height: 40px;
    }
  }
`;

const VehicleLabel = styled.div<{ $disabled: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  color: ${props => props.$disabled ? 'var(--text-disabled)' : 'inherit'};
  
  @media (max-width: 640px) {
    display: none;
  }
`;

export const Step1VehicleType: React.FC = () => {
  const { language, t } = useLanguage();
  const { formData, updateStepData, markStepComplete } = useCarListingStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData.step1 || { vehicleType: 'car' },
    mode: 'onChange',
  });

  const selectedVehicleType = watch('vehicleType');

  // Auto-update store when form changes
  useEffect(() => {
    if (selectedVehicleType) {
      handleSubmit((data) => {
        updateStepData('step1', data);
        markStepComplete(0);
      })();
    }
  }, [selectedVehicleType]);

  const vehicleTypes = [
    { id: 'car', IconComponent: Car, label: t('sell.start.vehicleTypes.car.title'), disabled: false },
    { id: 'van', IconComponent: Caravan, label: t('sell.start.vehicleTypes.van.title'), disabled: false },
    { id: 'motorcycle', IconComponent: Bike, label: t('sell.start.vehicleTypes.motorcycle.title'), disabled: false },
    { id: 'truck', IconComponent: Truck, label: t('sell.start.vehicleTypes.truck.title'), disabled: false },
    { id: 'bus', IconComponent: Bus, label: t('sell.start.vehicleTypes.bus.title'), disabled: false },
    { id: 'parts', IconComponent: Wrench, label: t('sell.start.vehicleTypes.parts.title'), disabled: false },
  ];

  const handleVehicleSelect = (id: string, disabled: boolean) => {
    if (disabled) {
      const message = language === 'bg'
        ? 'Очаквайте скоро! Тези опции ще бъдат налични много скоро.'
        : 'Coming very soon! These options will be available shortly.';
      toast.info(message);
      return;
    }

    setValue('vehicleType', id as Step1Data['vehicleType'], { shouldValidate: true });
  };

  return (
    <StepContainer>
      <div>
        <StepTitle>
          {language === 'bg' ? 'Изберете тип превозно средство' : 'Select Vehicle Type'}
        </StepTitle>
        <StepDescription>
          {language === 'bg'
            ? 'Моля, изберете типа на превозното средство, което искате да продадете'
            : 'Please select the type of vehicle you want to sell'}
        </StepDescription>
      </div>

      <form onSubmit={handleSubmit((data) => {
        updateStepData('step1', data);
        markStepComplete(0);
      })}>
        <input type="hidden" {...register('vehicleType')} />
        
        <VehicleGrid>
          {vehicleTypes.map(({ id, IconComponent, label, disabled }) => {
            const isSelected = selectedVehicleType === id;
            
            return (
              <VehicleOption
                key={id}
                type="button"
                $selected={isSelected}
                $disabled={disabled}
                onClick={() => handleVehicleSelect(id, disabled)}
              >

                <VehicleIcon $selected={isSelected} $disabled={disabled}>
                  <IconComponent />
                </VehicleIcon>
                <VehicleLabel $disabled={disabled}>{label}</VehicleLabel>
              </VehicleOption>
            );
          })}
        </VehicleGrid>
        
        {errors.vehicleType && (
          <p style={{ color: 'var(--error)', marginTop: '1rem', textAlign: 'center' }}>
            {errors.vehicleType.message}
          </p>
        )}
      </form>
    </StepContainer>
  );
};

