// Sell Vehicle Step 2: Vehicle Data
// الخطوة 2: بيانات المركبة

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';
import BrandModelMarkdownDropdown from '../../BrandModelMarkdownDropdown/BrandModelMarkdownDropdown';
import { BODY_TYPES, DOOR_OPTIONS, SEAT_OPTIONS, FUEL_TYPES, TRANSMISSION_TYPES } from '../../../pages/04_car-selling/sell/VehicleData/types';

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

export const SellVehicleStep2: React.FC<SellVehicleStep2Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();

  // Parse first registration
  const firstRegistrationMonth = useMemo(() => {
    if (workflowData.firstRegistration) {
      if (typeof workflowData.firstRegistration === 'string') {
        const parts = workflowData.firstRegistration.split('/');
        return parts[0] || '';
      }
    }
    return '';
  }, [workflowData.firstRegistration]);

  const firstRegistrationYear = useMemo(() => {
    if (workflowData.firstRegistration) {
      if (typeof workflowData.firstRegistration === 'string') {
        const parts = workflowData.firstRegistration.split('/');
        return parts[1] || '';
      }
    }
    return workflowData.year || '';
  }, [workflowData.firstRegistration, workflowData.year]);

  // Generate year options (current year to 1950)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  return (
    <FormContainer>
      {/* Basic Information */}
      <SectionTitle>{language === 'bg' ? 'Основна информация' : 'Basic Information'}</SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Марка и модел' : 'Brand & Model'} *</Label>
        <BrandModelMarkdownDropdown
          value={{
            make: workflowData.make || '',
            model: workflowData.model || ''
          }}
          onChange={(value) => {
            onUpdate({
              make: value.make,
              model: value.model
            });
          }}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Година на производство' : 'Year'} *</Label>
        <Select
          value={workflowData.year || ''}
          onChange={(e) => onUpdate({ year: e.target.value })}
          required
        >
          <option value="">{language === 'bg' ? 'Изберете година' : 'Select year'}</option>
          {yearOptions.map(year => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Първа регистрация' : 'First Registration'}</Label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Select
            value={firstRegistrationMonth}
            onChange={(e) => {
              const month = e.target.value;
              const year = firstRegistrationYear || workflowData.year || '';
              onUpdate({ firstRegistration: month && year ? `${month}/${year}` : '' });
            }}
            style={{ flex: 1, maxWidth: '200px' }}
          >
            <option value="">{language === 'bg' ? 'Месец' : 'Month'}</option>
            {FIRST_REGISTRATION_MONTHS.map(month => (
              <option key={month.value} value={month.value}>
                {language === 'bg' ? month.labelBg : month.labelEn}
              </option>
            ))}
          </Select>
          <Select
            value={firstRegistrationYear}
            onChange={(e) => {
              const year = e.target.value;
              const month = firstRegistrationMonth || '';
              onUpdate({ firstRegistration: month && year ? `${month}/${year}` : '' });
            }}
            style={{ flex: 1, maxWidth: '200px' }}
          >
            <option value="">{language === 'bg' ? 'Година' : 'Year'}</option>
            {yearOptions.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </Select>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Пробег (км)' : 'Mileage (km)'}</Label>
        <Input
          type="number"
          value={workflowData.mileage || ''}
          onChange={(e) => onUpdate({ mileage: e.target.value })}
          placeholder={language === 'bg' ? 'Въведете пробег' : 'Enter mileage'}
          min="0"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Състояние' : 'Condition'}</Label>
        <ToggleGroup>
          {CONDITION_OPTIONS.map(option => (
            <ToggleButton
              key={option.value}
              $active={workflowData.condition === option.value}
              onClick={() => onUpdate({ condition: option.value })}
            >
              {language === 'bg' ? option.labelBg : option.labelEn}
            </ToggleButton>
          ))}
        </ToggleGroup>
      </FieldGroup>

      <SectionDivider />

      {/* Technical Details */}
      <SectionTitle>{language === 'bg' ? 'Технически детайли' : 'Technical Details'}</SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Тип гориво' : 'Fuel Type'}</Label>
        <Select
          value={workflowData.fuelType || ''}
          onChange={(e) => onUpdate({ fuelType: e.target.value })}
        >
          <option value="">{language === 'bg' ? 'Изберете тип гориво' : 'Select fuel type'}</option>
          {FUEL_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</Label>
        <Select
          value={workflowData.transmission || ''}
          onChange={(e) => onUpdate({ transmission: e.target.value })}
        >
          <option value="">{language === 'bg' ? 'Изберете скоростна кутия' : 'Select transmission'}</option>
          {TRANSMISSION_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Мощност (к.с.)' : 'Power (HP)'}</Label>
        <Input
          type="number"
          value={workflowData.power || ''}
          onChange={(e) => onUpdate({ power: e.target.value })}
          placeholder={language === 'bg' ? 'Въведете мощност' : 'Enter power'}
          min="0"
        />
      </FieldGroup>

      <SectionDivider />

      {/* Physical Details */}
      <SectionTitle>{language === 'bg' ? 'Физически детайли' : 'Physical Details'}</SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Тип каросерия' : 'Body Type'}</Label>
        <Select
          value={workflowData.bodyType || ''}
          onChange={(e) => onUpdate({ bodyType: e.target.value })}
        >
          <option value="">{language === 'bg' ? 'Изберете тип каросерия' : 'Select body type'}</option>
          {BODY_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {language === 'bg' ? type.labelBg : type.labelEn}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Брой врати' : 'Doors'}</Label>
        <ToggleGroup>
          {DOOR_OPTIONS.map(option => (
            <ToggleButton
              key={option}
              $active={workflowData.doors === option}
              onClick={() => onUpdate({ doors: option })}
            >
              {option}
            </ToggleButton>
          ))}
        </ToggleGroup>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Брой седалки' : 'Seats'}</Label>
        <ToggleGroup>
          {SEAT_OPTIONS.map(option => (
            <ToggleButton
              key={option}
              $active={workflowData.seats === option}
              onClick={() => onUpdate({ seats: option })}
            >
              {option}
            </ToggleButton>
          ))}
        </ToggleGroup>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Външен цвят' : 'Exterior Color'}</Label>
        <Input
          type="text"
          value={workflowData.color || workflowData.exteriorColor || ''}
          onChange={(e) => onUpdate({ color: e.target.value, exteriorColor: e.target.value })}
          placeholder={language === 'bg' ? 'Въведете цвят' : 'Enter color'}
        />
      </FieldGroup>

      <SectionDivider />

      {/* Seller Information */}
      <SectionTitle>{language === 'bg' ? 'Информация за продавача' : 'Seller Information'}</SectionTitle>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Тип продавач' : 'Seller Type'}</Label>
        <ToggleGroup>
          <ToggleButton
            $active={workflowData.sellerType === 'private'}
            onClick={() => onUpdate({ sellerType: 'private' })}
          >
            {language === 'bg' ? 'Частно лице' : 'Private'}
          </ToggleButton>
          <ToggleButton
            $active={workflowData.sellerType === 'dealer'}
            onClick={() => onUpdate({ sellerType: 'dealer' })}
          >
            {language === 'bg' ? 'Търговец' : 'Dealer'}
          </ToggleButton>
          <ToggleButton
            $active={workflowData.sellerType === 'company'}
            onClick={() => onUpdate({ sellerType: 'company' })}
          >
            {language === 'bg' ? 'Фирма' : 'Company'}
          </ToggleButton>
        </ToggleGroup>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Тип продажба' : 'Sale Type'}</Label>
        <ToggleGroup>
          <ToggleButton
            $active={workflowData.saleType === 'private'}
            onClick={() => onUpdate({ saleType: 'private' })}
          >
            {language === 'bg' ? 'Частна' : 'Private'}
          </ToggleButton>
          <ToggleButton
            $active={workflowData.saleType === 'commercial'}
            onClick={() => onUpdate({ saleType: 'commercial' })}
          >
            {language === 'bg' ? 'Търговска' : 'Commercial'}
          </ToggleButton>
        </ToggleGroup>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Готовност за продажба' : 'Sale Timeline'}</Label>
        <ToggleGroup>
          <ToggleButton
            $active={workflowData.saleTimeline === 'unknown'}
            onClick={() => onUpdate({ saleTimeline: 'unknown' })}
          >
            {language === 'bg' ? 'Не знам' : "Don't know"}
          </ToggleButton>
          <ToggleButton
            $active={workflowData.saleTimeline === 'soon'}
            onClick={() => onUpdate({ saleTimeline: 'soon' })}
          >
            {language === 'bg' ? 'Възможно най-скоро' : 'ASAP'}
          </ToggleButton>
          <ToggleButton
            $active={workflowData.saleTimeline === 'months'}
            onClick={() => onUpdate({ saleTimeline: 'months' })}
          >
            {language === 'bg' ? 'В рамките на месеци' : 'Within months'}
          </ToggleButton>
        </ToggleGroup>
      </FieldGroup>

      <FieldGroup>
        <Label>{language === 'bg' ? 'Годност за път' : 'Roadworthy'}</Label>
        <ToggleGroup>
          <ToggleButton
            $active={workflowData.roadworthy === true}
            onClick={() => onUpdate({ roadworthy: true })}
          >
            {language === 'bg' ? 'Да' : 'Yes'}
          </ToggleButton>
          <ToggleButton
            $active={workflowData.roadworthy === false}
            onClick={() => onUpdate({ roadworthy: false })}
          >
            {language === 'bg' ? 'Не' : 'No'}
          </ToggleButton>
        </ToggleGroup>
      </FieldGroup>
    </FormContainer>
  );
};

export default SellVehicleStep2;
