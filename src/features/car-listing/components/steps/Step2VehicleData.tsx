// Step 2: Vehicle Data with BrandModelMarkdownDropdown
// الخطوة 2: بيانات السيارة مع الحفاظ على BrandModelMarkdownDropdown
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCarListingStore } from '../../stores/car-listing-store';
import { step2Schema, Step2Data } from '../../schemas/car-listing.schema';
import BrandModelMarkdownDropdown from '@/components/BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import { FUEL_TYPES, TRANSMISSION_TYPES, BODY_TYPES, DOOR_OPTIONS, SEAT_OPTIONS, EXTERIOR_COLORS } from '@/pages/04_car-selling/sell/VehicleData/types';
import { CAR_YEARS } from '@/data/dropdown-options';
import { Star, Zap } from 'lucide-react';
import { isFeaturedBrand } from '@/services/carBrandsService';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label<{ $hasValue?: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${props => props.$hasValue ? '#22c55e' : 'var(--text-primary)'};
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HintText = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Select = styled.select<{ $hasValue?: boolean }>`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$hasValue ? '#22c55e' : 'var(--border)'};
  border-radius: 10px;
  background: var(--bg-card);
  color: ${props => props.$hasValue ? '#22c55e' : 'var(--text-primary)'};
  font-size: 0.95rem;
  font-weight: ${props => props.$hasValue ? '600' : 'normal'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  option {
    padding: 0.5rem;
    background: var(--bg-card);
    color: var(--text-primary);
  }
  
  /* ✅ Featured brands styling - الحفاظ على الألوان */
  option.featured-brand {
    font-weight: 700;
    color: #ff8f10;
    background: rgba(255, 143, 16, 0.05);
  }
  
  option.other-option {
    border-top: 2px solid var(--border);
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-accent);
  }
`;

const Input = styled.input<{ $hasValue?: boolean }>`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$hasValue ? '#22c55e' : 'var(--border)'};
  border-radius: 10px;
  background: var(--bg-card);
  color: ${props => props.$hasValue ? '#22c55e' : 'var(--text-primary)'};
  font-size: 0.95rem;
  font-weight: ${props => props.$hasValue ? '600' : 'normal'};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1.5rem 0 1rem 0;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 2px solid ${props => props.$active ? '#22c55e' : 'var(--border)'};
  background: ${props => props.$active ? '#22c55e' : 'var(--bg-card)'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '700' : '600'};
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:hover {
    border-color: ${props => props.$active ? '#22c55e' : 'var(--accent-primary)'};
    transform: translateY(-1px);
  }
`;

const ErrorText = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const CONDITION_OPTIONS = [
  { value: 'new', labelBg: 'Нов', labelEn: 'New' },
  { value: 'used', labelBg: 'Използван', labelEn: 'Used' },
  { value: 'damaged', labelBg: 'Повреден', labelEn: 'Damaged' }
];

const MILEAGE_OPTIONS = [
  5000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000,
  100000, 125000, 150000, 175000, 200000, 250000, 300000, 400000, 500000, 1000000
];

const POWER_OPTIONS = [
  30, 60, 90, 120, 150, 180, 210, 240, 270, 300,
  350, 400, 450, 500, 600, 700, 800, 900, 1000
];

export const Step2VehicleData: React.FC = () => {
  const { language } = useLanguage();
  const { formData, updateStepData, markStepComplete } = useCarListingStore();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData.step2 || {},
    mode: 'onChange',
  });

  const [isCustomMileage, setIsCustomMileage] = useState(false);
  const [isCustomPower, setIsCustomPower] = useState(false);

  const make = watch('make');
  const model = watch('model');
  const year = watch('year');
  const mileage = watch('mileage');
  const condition = watch('condition');
  const fuelType = watch('fuelType');
  const transmission = watch('transmission');
  const power = watch('power');
  const bodyType = watch('bodyType');
  const doors = watch('doors');
  const seats = watch('seats');
  const color = watch('color');

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  // Auto-update store when form changes
  useEffect(() => {
    const subscription = watch((data) => {
      updateStepData('step2', data as Partial<Step2Data>);
      
      // Mark complete if required fields are filled
      if (data.make && data.model && data.year) {
        markStepComplete(1);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStepData, markStepComplete]);

  // ✅ Handle BrandModelMarkdownDropdown changes
  const handleBrandChange = (brand: string) => {
    setValue('make', brand, { shouldValidate: true });
  };

  const handleModelChange = (model: string) => {
    setValue('model', model, { shouldValidate: true });
  };

  return (
    <StepContainer>
      <div>
        <StepTitle>
          {language === 'bg' ? 'Данни за превозното средство' : 'Vehicle Data'}
        </StepTitle>
        <StepDescription>
          {language === 'bg'
            ? 'Въведете основната информация за вашето превозно средство'
            : 'Enter basic information about your vehicle'}
        </StepDescription>
      </div>

      <form onSubmit={handleSubmit((data) => {
        updateStepData('step2', data);
        markStepComplete(1);
      })}>
        {/* ✅ BrandModelMarkdownDropdown - الحفاظ على المكون الحالي مع جميع التفاصيل */}
        <FieldGroup>
          <Label $hasValue={!!(make && model)}>
            {language === 'bg' ? 'Марка и модел' : 'Brand & Model'} *
            {make && (
              <HintText>
                <Star size={14} color="#ff8f10" />
                {isFeaturedBrand(make) && (language === 'bg' ? 'Популярна марка' : 'Popular brand')}
              </HintText>
            )}
          </Label>
          <BrandModelMarkdownDropdown
            brand={make || ''}
            model={model || ''}
            onBrandChange={handleBrandChange}
            onModelChange={handleModelChange}
          />
          {(errors.make || errors.model) && (
            <ErrorText>{errors.make?.message || errors.model?.message}</ErrorText>
          )}
        </FieldGroup>

        {/* Year */}
        <FieldGroup>
          <Label $hasValue={!!year} htmlFor="year">
            {language === 'bg' ? 'Година' : 'Year'} *
          </Label>
          <Select
            id="year"
            $hasValue={!!year}
            {...register('year', { valueAsNumber: true })}
          >
            <option value="">{language === 'bg' ? 'Изберете година' : 'Select year'}</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
          {errors.year && <ErrorText>{errors.year.message}</ErrorText>}
        </FieldGroup>

        {/* Mileage */}
        <FieldGroup>
          <Label $hasValue={!!mileage} htmlFor="mileage">
            {language === 'bg' ? 'Пробег (км)' : 'Mileage (km)'}
          </Label>
          <Select
            id="mileage"
            $hasValue={!!mileage}
            value={isCustomMileage ? '__other__' : (mileage?.toString() || '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__other__') {
                setIsCustomMileage(true);
                setValue('mileage', undefined);
              } else {
                setIsCustomMileage(false);
                setValue('mileage', val ? parseInt(val) : undefined, { shouldValidate: true });
              }
            }}
          >
            <option value="">{language === 'bg' ? 'Изберете пробег' : 'Select mileage'}</option>
            {MILEAGE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt.toLocaleString()} km</option>
            ))}
            <option value="__other__">{language === 'bg' ? 'Друго' : 'Other'}</option>
          </Select>
          {isCustomMileage && (
            <Input
              type="number"
              $hasValue={!!mileage}
              value={mileage?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value.slice(0, 8);
                setValue('mileage', val ? parseInt(val) : undefined, { shouldValidate: true });
              }}
              placeholder={language === 'bg' ? 'Въведете пробег' : 'Enter mileage'}
              min="0"
              autoFocus
            />
          )}
          {errors.mileage && <ErrorText>{errors.mileage.message}</ErrorText>}
        </FieldGroup>

        {/* Condition */}
        <SectionTitle>{language === 'bg' ? 'Състояние' : 'Condition'}</SectionTitle>
        <ToggleGroup>
          {CONDITION_OPTIONS.map(option => (
            <ToggleButton
              key={option.value}
              type="button"
              $active={condition === option.value}
              onClick={() => setValue('condition', option.value as any, { shouldValidate: true })}
            >
              {language === 'bg' ? option.labelBg : option.labelEn}
            </ToggleButton>
          ))}
        </ToggleGroup>

        {/* Technical Details */}
        <SectionTitle>{language === 'bg' ? 'Технически детайли' : 'Technical Details'}</SectionTitle>

        {/* Fuel Type */}
        <FieldGroup>
          <Label $hasValue={!!fuelType} htmlFor="fuelType">
            {language === 'bg' ? 'Тип гориво' : 'Fuel Type'}
          </Label>
          <Select
            id="fuelType"
            $hasValue={!!fuelType}
            {...register('fuelType')}
          >
            <option value="">{language === 'bg' ? 'Изберете тип гориво' : 'Select fuel type'}</option>
            {FUEL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </FieldGroup>

        {/* Transmission */}
        <FieldGroup>
          <Label $hasValue={!!transmission} htmlFor="transmission">
            {language === 'bg' ? 'Скоростна кутия' : 'Transmission'}
          </Label>
          <Select
            id="transmission"
            $hasValue={!!transmission}
            {...register('transmission')}
          >
            <option value="">{language === 'bg' ? 'Изберете скоростна кутия' : 'Select transmission'}</option>
            {TRANSMISSION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </FieldGroup>

        {/* Power */}
        <FieldGroup>
          <Label $hasValue={!!power} htmlFor="power">
            {language === 'bg' ? 'Мощност (к.с.)' : 'Power (HP)'}
          </Label>
          <Select
            id="power"
            $hasValue={!!power}
            value={isCustomPower ? '__other__' : (power?.toString() || '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__other__') {
                setIsCustomPower(true);
                setValue('power', undefined);
              } else {
                setIsCustomPower(false);
                setValue('power', val ? parseInt(val) : undefined, { shouldValidate: true });
              }
            }}
          >
            <option value="">{language === 'bg' ? 'Изберете мощност' : 'Select power'}</option>
            {POWER_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt} hp</option>
            ))}
            <option value="__other__">{language === 'bg' ? 'Друго' : 'Other'}</option>
          </Select>
          {isCustomPower && (
            <Input
              type="number"
              $hasValue={!!power}
              value={power?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setValue('power', val ? parseInt(val) : undefined, { shouldValidate: true });
              }}
              placeholder={language === 'bg' ? 'Въведете мощност' : 'Enter power'}
              maxLength={4}
              autoFocus
            />
          )}
        </FieldGroup>

        {/* Physical Details */}
        <SectionTitle>{language === 'bg' ? 'Физически детайли' : 'Physical Details'}</SectionTitle>

        {/* Body Type */}
        <FieldGroup>
          <Label $hasValue={!!bodyType} htmlFor="bodyType">
            {language === 'bg' ? 'Тип каросерия' : 'Body Type'}
          </Label>
          <Select
            id="bodyType"
            $hasValue={!!bodyType}
            {...register('bodyType')}
          >
            <option value="">{language === 'bg' ? 'Изберете тип каросерия' : 'Select body type'}</option>
            {BODY_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {language === 'bg' ? type.labelBg : type.labelEn}
              </option>
            ))}
          </Select>
        </FieldGroup>

        {/* Doors */}
        <FieldGroup>
          <Label $hasValue={!!doors} htmlFor="doors">
            {language === 'bg' ? 'Брой врати' : 'Doors'}
          </Label>
          <ToggleGroup>
            {DOOR_OPTIONS.map(option => (
              <ToggleButton
                key={option}
                type="button"
                $active={doors?.toString() === option}
                onClick={() => setValue('doors', parseInt(option), { shouldValidate: true })}
              >
                {option}
              </ToggleButton>
            ))}
          </ToggleGroup>
        </FieldGroup>

        {/* Seats */}
        <FieldGroup>
          <Label $hasValue={!!seats} htmlFor="seats">
            {language === 'bg' ? 'Брой седалки' : 'Seats'}
          </Label>
          <ToggleGroup>
            {SEAT_OPTIONS.map(option => (
              <ToggleButton
                key={option}
                type="button"
                $active={seats?.toString() === option}
                onClick={() => setValue('seats', parseInt(option), { shouldValidate: true })}
              >
                {option}
              </ToggleButton>
            ))}
          </ToggleGroup>
        </FieldGroup>

        {/* Color */}
        <FieldGroup>
          <Label $hasValue={!!color} htmlFor="color">
            {language === 'bg' ? 'Външен цвят' : 'Exterior Color'}
          </Label>
          <Select
            id="color"
            $hasValue={!!color}
            {...register('color')}
          >
            <option value="">{language === 'bg' ? 'Изберете цвят' : 'Select color'}</option>
            {EXTERIOR_COLORS.map(colorOption => (
              <option key={colorOption} value={colorOption}>{colorOption}</option>
            ))}
          </Select>
        </FieldGroup>

        {/* History Toggles */}
        <SectionTitle>{language === 'bg' ? 'История' : 'History'}</SectionTitle>
        <FieldGroup>
          <ToggleGroup>
            <ToggleButton
              type="button"
              $active={watch('hasAccidentHistory') || false}
              onClick={() => setValue('hasAccidentHistory', !watch('hasAccidentHistory'), { shouldValidate: true })}
            >
              {language === 'bg' ? 'Има история на катастрофи' : 'Has accident history'}
            </ToggleButton>
            <ToggleButton
              type="button"
              $active={watch('hasServiceHistory') || false}
              onClick={() => setValue('hasServiceHistory', !watch('hasServiceHistory'), { shouldValidate: true })}
            >
              {language === 'bg' ? 'Има сервизна история' : 'Has service history'}
            </ToggleButton>
          </ToggleGroup>
        </FieldGroup>
      </form>
    </StepContainer>
  );
};

