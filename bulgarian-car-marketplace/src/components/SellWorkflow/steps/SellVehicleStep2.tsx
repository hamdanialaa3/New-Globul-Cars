// Sell Vehicle Step 2: Vehicle Data
// الخطوة 2: بيانات المركبة

import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';
import BrandModelMarkdownDropdown from '../../BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import { BODY_TYPES, DOOR_OPTIONS, SEAT_OPTIONS, FUEL_TYPES, TRANSMISSION_TYPES, EXTERIOR_COLORS } from '../../../pages/04_car-selling/sell/VehicleData/types';

interface SellVehicleStep2Props {
  workflowData: SellWorkflowData;
  onUpdate: (updates: Partial<SellWorkflowData>) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SectionDivider = styled.hr`
  border: none;
  height: 1px;
  background: var(--border);
  margin: 1rem 0;
  opacity: 0.3;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.5rem 0;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'var(--border)'};
  background: ${props => props.$active ? 'var(--accent-primary)' : 'var(--bg-card)'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '700' : '600'};
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    transform: translateY(-1px);
  }
`;

const FIRST_REGISTRATION_MONTHS = [
  { value: '01', labelBg: 'Януари', labelEn: 'January' },
  { value: '02', labelBg: 'Февруари', labelEn: 'February' },
  { value: '03', labelBg: 'Март', labelEn: 'March' },
  { value: '04', labelBg: 'Април', labelEn: 'April' },
  { value: '05', labelBg: 'Май', labelEn: 'May' },
  { value: '06', labelBg: 'Юни', labelEn: 'June' },
  { value: '07', labelBg: 'Юли', labelEn: 'July' },
  { value: '08', labelBg: 'Август', labelEn: 'August' },
  { value: '09', labelBg: 'Септември', labelEn: 'September' },
  { value: '10', labelBg: 'Октомври', labelEn: 'October' },
  { value: '11', labelBg: 'Ноември', labelEn: 'November' },
  { value: '12', labelBg: 'Декември', labelEn: 'December' }
];

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

// Define styled components outside
// Define styled components outside
const AttentionPulse = styled.div<{ $isActive: boolean }>`
  border-radius: 12px;
  animation: ${props => props.$isActive ? 'pulse-attention 2s infinite' : 'none'};
  transition: box-shadow 0.3s ease;
  
  @keyframes pulse-attention {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
`;

// Helper component to handle scroll on mount with visual attention
const RevealWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (ref.current) {
      // Smooth scroll to element's center-top area to leave space for label
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleInteraction = () => {
    setIsActive(false);
  };

  return (
    <AttentionPulse
      ref={ref}
      $isActive={isActive}
      onClick={handleInteraction}
      onFocus={handleInteraction}
      // Also catch clicks heavily nested inside (bubbling)
      onMouseDown={handleInteraction}
    >
      <FieldGroup>{children}</FieldGroup>
    </AttentionPulse>
  );
};

export const SellVehicleStep2: React.FC<SellVehicleStep2Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();
  const [isCustomMileage, setIsCustomMileage] = useState(false);
  const [isCustomPower, setIsCustomPower] = useState(false);

  // Initialize custom states
  useEffect(() => {
    if (workflowData.mileage && !MILEAGE_OPTIONS.includes(Number(workflowData.mileage))) {
      setIsCustomMileage(true);
    }
    if (workflowData.power && !POWER_OPTIONS.includes(Number(workflowData.power))) {
      setIsCustomPower(true);
    }
  }, [workflowData.mileage, workflowData.power]);

  // Parse first registration year
  const firstRegistrationYear = useMemo(() => {
    if (workflowData.firstRegistration) {
      if (typeof workflowData.firstRegistration === 'string') {
        return workflowData.firstRegistration;
      }
    }
    return workflowData.year?.toString() || '';
  }, [workflowData.firstRegistration, workflowData.year]);

  // Generate year options (current year to 1950)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  // Progressive Reveal Logic - Chain of dependencies
  const hasBrand = !!workflowData.make;
  const hasModel = !!workflowData.model;
  // Step 2 unlocks when Model is selected
  // Step 3 unlocked when Year is selected
  const hasYear = !!workflowData.year;
  // (Removed: isFirstRegComplete - we now only use year)
  // Step 5 unlocked when Mileage is filled
  const hasMileage = !!workflowData.mileage;
  // Step 6 unlocked when Condition is selected
  const hasCondition = !!workflowData.condition;
  // Step 7 unlocked when Fuel is selected
  const hasFuel = !!workflowData.fuelType;
  // Step 8 unlocked when Transmission is selected
  const hasTransmission = !!workflowData.transmission;
  // Step 9 unlocked when Power is filled (4 digits max)
  const hasPower = !!workflowData.power;
  // Step 10 unlocked when Body is selected
  const hasBody = !!workflowData.bodyType;
  // Step 11 unlocked when Doors are selected
  const hasDoors = !!workflowData.doors;
  // Step 12 unlocked when Seats are selected
  const hasSeats = !!workflowData.seats;
  // Step 13 unlocked when Color is filled
  const hasColor = !!workflowData.color;

  // Helper to style completed fields
  // "Green text" requested by user for completed fields
  const successColor = '#22c55e'; // Green-500 equivalent, bright but readable

  // Override styles for success state - text becomes green when field has value
  const getLabelStyle = (hasValue: boolean) => ({
    color: hasValue ? successColor : 'var(--text-primary)',
    transition: 'color 0.3s ease'
  });

  const getInputStyle = (hasValue: boolean) => ({
    borderColor: hasValue ? successColor : 'var(--border)',
    color: hasValue ? successColor : 'var(--text-primary)',
    fontWeight: hasValue ? '600' : 'normal',
    transition: 'all 0.3s ease'
  });

  return (
    <FormContainer>
      {/* Brand & Model - Always visible (Brand) then Model reveals */}
      <FieldGroup>
        <Label style={getLabelStyle(hasBrand && hasModel)}>
          {language === 'bg' ? 'Марка и модел' : 'Brand & Model'} *
        </Label>
        <BrandModelMarkdownDropdown
          brand={workflowData.make || ''}
          model={workflowData.model || ''}
          onBrandChange={(brand) => onUpdate({ make: brand })}
          onModelChange={(model) => onUpdate({ model: model })}
        />
      </FieldGroup>

      {/* Only show subsequent fields if Model is selected */}
      {hasModel && (
        <>
          <SectionTitle>{language === 'bg' ? 'Основна информация' : 'Basic Information'}</SectionTitle>

          <RevealWrapper>
            <Label style={getLabelStyle(!!firstRegistrationYear)}>{language === 'bg' ? 'Година на производство' : 'Year of Manufacture'} *</Label>
            <Select
              value={firstRegistrationYear}
              onChange={(e) => {
                const valYear = e.target.value;
                onUpdate({
                  firstRegistration: valYear || '',
                  year: valYear ? parseInt(valYear) : undefined
                });
              }}
              required
              style={getInputStyle(!!firstRegistrationYear)}
            >
              <option value="">{language === 'bg' ? 'Изберете година' : 'Select year'}</option>
              {yearOptions.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </Select>
          </RevealWrapper>

          {!!firstRegistrationYear && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasMileage)}>{language === 'bg' ? 'Пробег (км)' : 'Mileage (km)'}</Label>
              <Select
                value={isCustomMileage ? '__other__' : (workflowData.mileage || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__other__') {
                    setIsCustomMileage(true);
                    onUpdate({ mileage: '' });
                  } else {
                    setIsCustomMileage(false);
                    onUpdate({ mileage: val });
                  }
                }}
                style={getInputStyle(hasMileage || isCustomMileage)}
              >
                <option value="">{language === 'bg' ? 'Изберете пробег' : 'Select mileage'}</option>
                {MILEAGE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt.toLocaleString()} km</option>
                ))}
                <option value="__other__">{language === 'bg' ? 'Друго' : 'Other'}</option>
              </Select>

              {isCustomMileage && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Input
                    type="number"
                    value={workflowData.mileage || ''}
                    onChange={(e) => {
                      // Limit to 8 digits
                      const val = e.target.value.slice(0, 8);
                      onUpdate({ mileage: val });
                    }}
                    placeholder={language === 'bg' ? 'Въведете пробег (точкни км)' : 'Enter exact mileage'}
                    min="0"
                    autoFocus
                    style={getInputStyle(hasMileage)}
                  />
                </div>
              )}
            </RevealWrapper>
          )}

          {hasMileage && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasCondition)}>{language === 'bg' ? 'Състояние' : 'Condition'}</Label>
              <ToggleGroup>
                {CONDITION_OPTIONS.map(option => (
                  <ToggleButton
                    key={option.value}
                    $active={workflowData.condition === option.value}
                    onClick={() => onUpdate({ condition: option.value })}
                    style={workflowData.condition === option.value ? { borderColor: successColor, backgroundColor: successColor } : {}}
                  >
                    {language === 'bg' ? option.labelBg : option.labelEn}
                  </ToggleButton>
                ))}
              </ToggleGroup>
            </RevealWrapper>
          )}

          {hasCondition && (
            <>
              <SectionDivider />
              <SectionTitle>{language === 'bg' ? 'Технически детайли' : 'Technical Details'}</SectionTitle>

              <RevealWrapper>
                <Label style={getLabelStyle(hasFuel)}>{language === 'bg' ? 'Тип гориво' : 'Fuel Type'}</Label>
                <Select
                  value={workflowData.fuelType || ''}
                  onChange={(e) => onUpdate({ fuelType: e.target.value })}
                  style={getInputStyle(hasFuel)}
                >
                  <option value="">{language === 'bg' ? 'Изберете тип гориво' : 'Select fuel type'}</option>
                  {FUEL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </RevealWrapper>
            </>
          )}

          {hasFuel && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasTransmission)}>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</Label>
              <Select
                value={workflowData.transmission || ''}
                onChange={(e) => onUpdate({ transmission: e.target.value })}
                style={getInputStyle(hasTransmission)}
              >
                <option value="">{language === 'bg' ? 'Изберете скоростна кутия' : 'Select transmission'}</option>
                {TRANSMISSION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </RevealWrapper>
          )}

          {hasTransmission && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasPower)}>{language === 'bg' ? 'Мощност (к.с.)' : 'Power (HP)'}</Label>
              <Select
                value={isCustomPower ? '__other__' : (workflowData.power || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__other__') {
                    setIsCustomPower(true);
                    onUpdate({ power: '' });
                  } else {
                    setIsCustomPower(false);
                    onUpdate({ power: val });
                  }
                }}
                style={getInputStyle(hasPower || isCustomPower)}
              >
                <option value="">{language === 'bg' ? 'Изберете мощност' : 'Select power'}</option>
                {POWER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt} hp</option>
                ))}
                <option value="__other__">{language === 'bg' ? 'Друго' : 'Other'}</option>
              </Select>

              {isCustomPower && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Input
                    type="text"
                    maxLength={4} // Limit to 4 characters
                    value={workflowData.power || ''}
                    onChange={(e) => {
                      // Allow only numbers and max 4 digits
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      onUpdate({ power: val });
                    }}
                    placeholder={language === 'bg' ? 'Въведете мощност' : 'Enter power'}
                    autoFocus
                    style={getInputStyle(hasPower)}
                  />
                </div>
              )}
            </RevealWrapper>
          )}

          {hasPower && (
            <>
              <SectionDivider />
              <SectionTitle>{language === 'bg' ? 'Физически детайли' : 'Physical Details'}</SectionTitle>

              <RevealWrapper>
                <Label style={getLabelStyle(hasBody)}>{language === 'bg' ? 'Тип каросерия' : 'Body Type'}</Label>
                <Select
                  value={workflowData.bodyType || ''}
                  onChange={(e) => onUpdate({ bodyType: e.target.value })}
                  style={getInputStyle(hasBody)}
                >
                  <option value="">{language === 'bg' ? 'Изберете тип каросерия' : 'Select body type'}</option>
                  {BODY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {language === 'bg' ? type.labelBg : type.labelEn}
                    </option>
                  ))}
                </Select>
              </RevealWrapper>
            </>
          )}

          {hasBody && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasDoors)}>{language === 'bg' ? 'Брой врати' : 'Doors'}</Label>
              <ToggleGroup>
                {DOOR_OPTIONS.map(option => (
                  <ToggleButton
                    key={option}
                    $active={workflowData.doors === option}
                    onClick={() => onUpdate({ doors: option })}
                    style={workflowData.doors === option ? { borderColor: successColor, backgroundColor: successColor } : {}}
                  >
                    {option}
                  </ToggleButton>
                ))}
              </ToggleGroup>
            </RevealWrapper>
          )}

          {hasDoors && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasSeats)}>{language === 'bg' ? 'Брой седалки' : 'Seats'}</Label>
              <ToggleGroup>
                {SEAT_OPTIONS.map(option => (
                  <ToggleButton
                    key={option}
                    $active={workflowData.seats === option}
                    onClick={() => onUpdate({ seats: option })}
                    style={workflowData.seats === option ? { borderColor: successColor, backgroundColor: successColor } : {}}
                  >
                    {option}
                  </ToggleButton>
                ))}
              </ToggleGroup>
            </RevealWrapper>
          )}

          {hasSeats && (
            <RevealWrapper>
              <Label style={getLabelStyle(hasColor)}>{language === 'bg' ? 'Външен цвят' : 'Exterior Color'}</Label>
              <Select
                value={workflowData.color === 'Other' ? 'Other' : (workflowData.color || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    onUpdate({ color: 'Other', exteriorColor: '' }); // Clear specific color if Other selected
                  } else {
                    onUpdate({ color: val, exteriorColor: val, exteriorColorOther: undefined });
                  }
                }}
                style={getInputStyle(hasColor)}
              >
                <option value="">{language === 'bg' ? 'Изберете цвят' : 'Select color'}</option>
                {EXTERIOR_COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </Select>

              {workflowData.color === 'Other' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Input
                    type="text"
                    value={workflowData.exteriorColorOther || ''}
                    onChange={(e) => onUpdate({ exteriorColorOther: e.target.value, exteriorColor: e.target.value })}
                    placeholder={language === 'bg' ? 'Въведете вашия цвят' : 'Enter your color'}
                    style={getInputStyle(!!workflowData.exteriorColorOther)}
                    autoFocus
                  />
                </div>
              )}
            </RevealWrapper>
          )}

          {/* Show remaining fields only at the very end or group them appropriately if needed */}
          {hasColor && (
            <>
              <SectionDivider />
              <SectionTitle>{language === 'bg' ? 'Информация за продавача' : 'Seller Information'}</SectionTitle>
              <RevealWrapper>
                <Label>{language === 'bg' ? 'Тип продавач' : 'Seller Type'}</Label>
                <ToggleGroup>
                  <ToggleButton
                    $active={workflowData.sellerType === 'private'}
                    onClick={() => onUpdate({ sellerType: 'private' })}
                    style={workflowData.sellerType === 'private' ? { borderColor: successColor, backgroundColor: successColor } : {}}
                  >
                    {language === 'bg' ? 'Частно лице' : 'Private'}
                  </ToggleButton>
                  <ToggleButton
                    $active={workflowData.sellerType === 'dealer'}
                    onClick={() => onUpdate({ sellerType: 'dealer' })}
                    style={workflowData.sellerType === 'dealer' ? { borderColor: successColor, backgroundColor: successColor } : {}}
                  >
                    {language === 'bg' ? 'Търговец' : 'Dealer'}
                  </ToggleButton>
                  <ToggleButton
                    $active={workflowData.sellerType === 'company'}
                    onClick={() => onUpdate({ sellerType: 'company' })}
                    style={workflowData.sellerType === 'company' ? { borderColor: successColor, backgroundColor: successColor } : {}}
                  >
                    {language === 'bg' ? 'Фирма' : 'Company'}
                  </ToggleButton>
                </ToggleGroup>
              </RevealWrapper>
            </>
          )}
        </>
      )}
    </FormContainer>
  );
};

export default SellVehicleStep2;
