// Personal Vehicle Form Component
// نموذج بيانات المركبة الشخصية

import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { PersonalVehicleFormData } from '../../types/personal-vehicle.types';
import { useTranslation } from '../../hooks/useTranslation';

interface PersonalVehicleFormProps {
  step: 'basic' | 'usage' | 'review';
  formData: PersonalVehicleFormData;
  onUpdate: (updates: Partial<PersonalVehicleFormData>) => void;
}

// Animations
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

// Styled Components
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const Select = styled.select<{ $error?: boolean }>`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#ef4444' : 'var(--border)'};
  border-radius: 10px;
  background: ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)'};
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  ${props => props.$error && `animation: ${shake} 0.5s ease-in-out;`}
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  max-width: 450px;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#ef4444' : 'var(--border)'};
  border-radius: 10px;
  background: ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)'};
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  ${props => props.$error && `animation: ${shake} 0.5s ease-in-out;`}
`;

const InputWrapper = styled.div<{ $error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 450px;
`;

const Suffix = styled.span`
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
`;

const ErrorMessage = styled.div`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const Hint = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 2px solid ${props => props.$active ? 'var(--accent-primary)' : 'var(--border)'};
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)'};
  color: ${props => props.$active ? 'var(--accent-primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '700' : '600'};
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    background: rgba(59, 130, 246, 0.1);
  }
`;

const InlineFields = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const ReviewSection = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border);
`;

const ReviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReviewLabel = styled.span`
  font-weight: 600;
  color: var(--text-secondary);
`;

const ReviewValue = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
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
  { value: '12', labelBg: 'Декември', labelEn: 'December' },
];

const DOOR_OPTIONS = [
  { value: '2/3', label: '2/3' },
  { value: '4/5', label: '4/5' },
  { value: '6/7', label: '6/7' },
];

const MILEAGE_RANGES = [
  { value: '0-10000', label: '0 - 10,000 km' },
  { value: '10000-50000', label: '10,000 - 50,000 km' },
  { value: '50000-100000', label: '50,000 - 100,000 km' },
  { value: '100000-150000', label: '100,000 - 150,000 km' },
  { value: '150000+', label: '150,000+ km' },
];

const ANNUAL_MILEAGE_OPTIONS = [
  { value: '5000', label: '5,000 km/year' },
  { value: '10000', label: '10,000 km/year' },
  { value: '15000', label: '15,000 km/year' },
  { value: '20000', label: '20,000 km/year' },
  { value: '25000', label: '25,000 km/year' },
  { value: '30000', label: '30,000 km/year' },
  { value: '40000', label: '40,000 km/year' },
  { value: '50000+', label: '50,000+ km/year' },
];

export const PersonalVehicleForm: React.FC<PersonalVehicleFormProps> = ({
  step,
  formData,
  onUpdate,
}) => {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
      const year = (currentYear - i).toString();
      return { value: year, label: year };
    });
  }, []);

  const monthOptions = useMemo(() => {
    return FIRST_REGISTRATION_MONTHS.map(month => ({
      value: month.value,
      label: language === 'bg' ? month.labelBg : month.labelEn,
    }));
  }, [language]);

  const fuelOptions = useMemo(() => {
    return [
      { value: 'petrol', label: language === 'bg' ? 'Бензин' : 'Petrol' },
      { value: 'diesel', label: language === 'bg' ? 'Дизел' : 'Diesel' },
      { value: 'electric', label: language === 'bg' ? 'Електрически' : 'Electric' },
      { value: 'hybrid', label: language === 'bg' ? 'Хибриден' : 'Hybrid' },
      { value: 'lpg', label: 'LPG' },
    ];
  }, [language]);

  const convertHPtoKW = (hp: string): string => {
    const hpNum = parseInt(hp) || 0;
    return Math.round(hpNum * 0.7355).toString();
  };

  if (step === 'basic') {
    return (
      <FormContainer>
        <FieldGroup>
          <Label>{language === 'bg' ? 'Първа регистрация' : 'First Registration'}</Label>
          <InlineFields>
            <Select
              value={formData.registrationMonth}
              onChange={(e) => onUpdate({ registrationMonth: e.target.value })}
            >
              <option value="">{language === 'bg' ? 'Месец' : 'Month'}</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={formData.registrationYear}
              onChange={(e) => onUpdate({ registrationYear: e.target.value })}
            >
              <option value="">{language === 'bg' ? 'Година' : 'Year'}</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </InlineFields>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Брои врати' : 'Doors'}</Label>
          <ToggleGroup>
            {DOOR_OPTIONS.map(option => (
              <ToggleButton
                key={option.value}
                $active={formData.doors === option.value}
                onClick={() => onUpdate({ doors: option.value as '2/3' | '4/5' | '6/7' })}
              >
                {option.label}
              </ToggleButton>
            ))}
          </ToggleGroup>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Тип гориво' : 'Fuel Type'}</Label>
          <ToggleGroup>
            {fuelOptions.map(option => (
              <ToggleButton
                key={option.value}
                $active={formData.fuelType === option.value}
                onClick={() => onUpdate({ fuelType: option.value as any })}
              >
                {option.label}
              </ToggleButton>
            ))}
          </ToggleGroup>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</Label>
          <ToggleGroup>
            <ToggleButton
              $active={formData.transmission === 'manual'}
              onClick={() => onUpdate({ transmission: 'manual' })}
            >
              {language === 'bg' ? 'Ръчна' : 'Manual'}
            </ToggleButton>
            <ToggleButton
              $active={formData.transmission === 'automatic'}
              onClick={() => onUpdate({ transmission: 'automatic' })}
            >
              {language === 'bg' ? 'Автоматична' : 'Automatic'}
            </ToggleButton>
          </ToggleGroup>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Мощност' : 'Power'}</Label>
          <InputWrapper>
            <Input
              type="number"
              value={formData.power}
              onChange={(e) => onUpdate({ power: e.target.value })}
              placeholder="85"
              min="0"
              max="999"
            />
            <Suffix>PS</Suffix>
          </InputWrapper>
          {formData.power && (
            <Hint>
              {convertHPtoKW(formData.power)} KW
            </Hint>
          )}
        </FieldGroup>
      </FormContainer>
    );
  }

  if (step === 'usage') {
    return (
      <FormContainer>
        <FieldGroup>
          <Label>{language === 'bg' ? 'Дата на покупка' : 'Purchase Date'}</Label>
          <InlineFields>
            <Select
              value={formData.purchaseMonth || ''}
              onChange={(e) => onUpdate({ purchaseMonth: e.target.value })}
            >
              <option value="">{language === 'bg' ? 'Месец' : 'Month'}</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={formData.purchaseYear || ''}
              onChange={(e) => onUpdate({ purchaseYear: e.target.value })}
            >
              <option value="">{language === 'bg' ? 'Година' : 'Year'}</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </InlineFields>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Километраж при покупка' : 'Mileage at Purchase'}</Label>
          <Select
            value={formData.purchaseMileage || ''}
            onChange={(e) => onUpdate({ purchaseMileage: e.target.value })}
          >
            <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
            {MILEAGE_RANGES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label>
            {language === 'bg' ? 'Текущ километраж' : 'Current Mileage'} *
          </Label>
          <InputWrapper>
            <Input
              type="number"
              value={formData.currentMileage}
              onChange={(e) => onUpdate({ currentMileage: e.target.value })}
              placeholder="185000"
              min="0"
              required
            />
            <Suffix>km</Suffix>
          </InputWrapper>
          <Hint>
            {language === 'bg'
              ? 'За да определим текущата пазарна стойност, се нуждаем от километража на вашето превозно средство.'
              : 'To determine the current market value, we need the mileage of your vehicle.'}
          </Hint>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Километри годишно' : 'Annual Mileage'}</Label>
          <Select
            value={formData.annualMileage || ''}
            onChange={(e) => onUpdate({ annualMileage: e.target.value })}
          >
            <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
            {ANNUAL_MILEAGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Технически преглед валиден до' : 'Inspection Valid Until'}</Label>
          <InlineFields>
            <Select
              value={formData.inspectionMonth || ''}
              onChange={(e) => onUpdate({ inspectionMonth: e.target.value })}
            >
              <option value="">{language === 'bg' ? 'Месец' : 'Month'}</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={formData.inspectionYear || ''}
              onChange={(e) => onUpdate({ inspectionYear: e.target.value })}
            >
              <option value="">{language === 'bg' ? 'Година' : 'Year'}</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </InlineFields>
        </FieldGroup>

        <FieldGroup>
          <Label>{language === 'bg' ? 'Единствен потребител?' : 'Sole User?'}</Label>
          <ToggleGroup>
            <ToggleButton
              $active={formData.isSoleUser === true}
              onClick={() => onUpdate({ isSoleUser: true })}
            >
              {language === 'bg' ? 'Да' : 'Yes'}
            </ToggleButton>
            <ToggleButton
              $active={formData.isSoleUser === false}
              onClick={() => onUpdate({ isSoleUser: false })}
            >
              {language === 'bg' ? 'Не' : 'No'}
            </ToggleButton>
          </ToggleGroup>
        </FieldGroup>

        <FieldGroup>
          <Label>
            {language === 'bg' ? 'Пощенски код' : 'Postal Code'} *
          </Label>
          <Input
            type="text"
            value={formData.postalCode}
            onChange={(e) => onUpdate({ postalCode: e.target.value })}
            placeholder="1000"
            pattern="[0-9]{4,5}"
            required
          />
          <Hint>
            {language === 'bg'
              ? 'Само с пощенски код можем да покажем услуги във вашата област.'
              : 'Only with postal code can we show services in your area.'}
          </Hint>
        </FieldGroup>
      </FormContainer>
    );
  }

  if (step === 'review') {
    const getFuelTypeLabel = (value: string) => {
      return fuelOptions.find(opt => opt.value === value)?.label || value;
    };

    const getMonthLabel = (value: string) => {
      return monthOptions.find(opt => opt.value === value)?.label || value;
    };

    return (
      <ReviewSection>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Марка' : 'Make'}</ReviewLabel>
          <ReviewValue>{formData.make}</ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Модел' : 'Model'}</ReviewLabel>
          <ReviewValue>{formData.model}</ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Първа регистрация' : 'First Registration'}</ReviewLabel>
          <ReviewValue>
            {getMonthLabel(formData.registrationMonth)} {formData.registrationYear}
          </ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Брои врати' : 'Doors'}</ReviewLabel>
          <ReviewValue>{formData.doors}</ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Тип гориво' : 'Fuel Type'}</ReviewLabel>
          <ReviewValue>{getFuelTypeLabel(formData.fuelType)}</ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Скоростна кутия' : 'Transmission'}</ReviewLabel>
          <ReviewValue>
            {formData.transmission === 'manual'
              ? (language === 'bg' ? 'Ръчна' : 'Manual')
              : (language === 'bg' ? 'Автоматична' : 'Automatic')}
          </ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Мощност' : 'Power'}</ReviewLabel>
          <ReviewValue>
            {formData.power} PS ({convertHPtoKW(formData.power)} KW)
          </ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Цвят' : 'Color'}</ReviewLabel>
          <ReviewValue>
            {formData.color} {formData.isMetallic && '(Metallic)'}
          </ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Текущ километраж' : 'Current Mileage'}</ReviewLabel>
          <ReviewValue>{formData.currentMileage} km</ReviewValue>
        </ReviewRow>
        <ReviewRow>
          <ReviewLabel>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</ReviewLabel>
          <ReviewValue>{formData.postalCode}</ReviewValue>
        </ReviewRow>
      </ReviewSection>
    );
  }

  return null;
};

export default PersonalVehicleForm;
