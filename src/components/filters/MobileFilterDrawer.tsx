import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { ResponsiveButton } from '../ui/ResponsiveButton';

// Backdrop overlay
const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.75)'
      : 'rgba(0, 0, 0, 0.5)'};
  z-index: 9999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(4px);
`;

// Drawer container
const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark' 
      ? 'linear-gradient(160deg, #0c1220 0%, #050914 100%)'
      : '#ffffff'};
  border-radius: 20px 20px 0 0;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 -8px 32px rgba(0, 0, 0, 0.6)'
      : '0 -4px 20px rgba(0, 0, 0, 0.15)'};
  z-index: 10000;
  max-height: 80vh;
  transform: translateY(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'};
  backdrop-filter: blur(20px);
  
  /* iOS safe area */
  padding-bottom: env(safe-area-inset-bottom);
`;

// Drawer header
const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 14px;
  border-bottom: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'};
  flex-shrink: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent'};
  
  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: ${({ theme }) => 
      theme.mode === 'dark' ? '#f8f9fa' : '#1f2937'};
    letter-spacing: -0.3px;
  }
`;

// Close button
const CloseButton = styled.button`
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f3f4f6'};
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e5e7eb'};
    transform: rotate(90deg);
  }
  
  &:active {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#d1d5db'};
    transform: rotate(90deg) scale(0.95);
  }
  
  svg {
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#e5e7eb' : '#6b7280'};
  }
`;

// Scrollable content area
const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  -webkit-overflow-scrolling: touch;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f3f4f6'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) =>
        theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af'};
    }
  }
`;

// Filter section
const FilterSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Section title
const SectionTitle = styled.h4`
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

// Input field
const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e5e7eb'};
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  color: ${({ theme }) => 
    theme.mode === 'dark' ? '#f1f3f5' : '#1f2937'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'white'};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0B5FFF;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.08)' : 'rgba(11, 95, 255, 0.02)'};
    box-shadow: 0 0 0 3px ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.15)' : 'rgba(11, 95, 255, 0.1)'};
  }
  
  &::placeholder {
    color: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#9ca3af'};
  }
`;

// Select dropdown
const Select = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e5e7eb'};
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  color: ${({ theme }) => 
    theme.mode === 'dark' ? '#f1f3f5' : '#1f2937'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'white'};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #0B5FFF;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.08)' : 'rgba(11, 95, 255, 0.02)'};
    box-shadow: 0 0 0 3px ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(11, 95, 255, 0.15)' : 'rgba(11, 95, 255, 0.1)'};
  }
  
  option {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#1a1d2e' : 'white'};
    color: ${({ theme }) => 
      theme.mode === 'dark' ? '#f1f3f5' : '#1f2937'};
  }
`;

// Range inputs container
const RangeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: center;
`;

const RangeSeparator = styled.span`
  color: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af'};
  font-size: 14px;
  font-weight: 500;
`;

// Drawer footer with action buttons
const DrawerFooter = styled.div`
  padding: 14px 20px;
  border-top: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'};
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  background: ${({ theme }) =>
    theme.mode === 'dark' 
      ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
      : 'white'};
  backdrop-filter: blur(10px);
`;

// Filter count badge
const FilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #0B5FFF 0%, #0A4FDB 100%);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  margin-left: 8px;
  box-shadow: 0 2px 8px rgba(11, 95, 255, 0.3);
`;

export interface FilterValues {
  make?: string;
  model?: string;
  priceMin?: string;
  priceMax?: string;
  yearMin?: string;
  yearMax?: string;
  mileageMin?: string;
  mileageMax?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  region?: string;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  language?: 'bg' | 'en';
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = {},
  language = 'bg'
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  // Update local state when initial filters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Hide footer when drawer is open
  useEffect(() => {
    const footer = document.querySelector('.main-footer');
    if (isOpen && footer) {
      (footer as HTMLElement).style.display = 'none';
    } else if (footer) {
      (footer as HTMLElement).style.display = '';
    }
  }, [isOpen]);

  const handleChange = (key: keyof FilterValues, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
    onClose();
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'filters.title': { bg: 'Филтри', en: 'Filters' },
      'filters.make': { bg: 'Марка', en: 'Make' },
      'filters.model': { bg: 'Модел', en: 'Model' },
      'filters.price': { bg: 'Цена', en: 'Price' },
      'filters.year': { bg: 'Година', en: 'Year' },
      'filters.mileage': { bg: 'Пробег', en: 'Mileage' },
      'filters.fuelType': { bg: 'Гориво', en: 'Fuel Type' },
      'filters.transmission': { bg: 'Скоростна кутия', en: 'Transmission' },
      'filters.bodyType': { bg: 'Тип купе', en: 'Body Type' },
      'filters.locationData?.regionName': { bg: 'Регион', en: 'Region' },
      'filters.from': { bg: 'От', en: 'From' },
      'filters.to': { bg: 'До', en: 'To' },
      'filters.apply': { bg: 'Приложи филтри', en: 'Apply Filters' },
      'filters.clear': { bg: 'Изчисти', en: 'Clear' },
      'filters.selectMake': { bg: 'Избери марка', en: 'Select make' },
      'filters.selectModel': { bg: 'Избери модел', en: 'Select model' },
      'filters.selectFuel': { bg: 'Избери гориво', en: 'Select fuel' },
      'filters.selectTransmission': { bg: 'Избери скоростна кутия', en: 'Select transmission' },
      'filters.selectBody': { bg: 'Избери тип купе', en: 'Select body type' },
      'filters.selectRegion': { bg: 'Избери регион', en: 'Select region' },
    };
    return translations[key]?.[language] || key;
  };

  return (
    <>
      <Backdrop $isOpen={isOpen} onClick={onClose} />

      <DrawerContainer $isOpen={isOpen}>
        {/* Header */}
        <DrawerHeader>
          <h3>
            {t('filters.title')}
            {activeFiltersCount > 0 && (
              <FilterBadge>{activeFiltersCount}</FilterBadge>
            )}
          </h3>
          <CloseButton onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </CloseButton>
        </DrawerHeader>

        {/* Content */}
        <DrawerContent>
          {/* Make */}
          <FilterSection>
            <SectionTitle>{t('filters.make')}</SectionTitle>
            <Input
              type="text"
              placeholder={t('filters.selectMake')}
              value={filters.make || ''}
              onChange={(e) => handleChange('make', e.target.value)}
            />
          </FilterSection>

          {/* Model */}
          <FilterSection>
            <SectionTitle>{t('filters.model')}</SectionTitle>
            <Input
              type="text"
              placeholder={t('filters.selectModel')}
              value={filters.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
            />
          </FilterSection>

          {/* Price Range */}
          <FilterSection>
            <SectionTitle>{t('filters.price')}</SectionTitle>
            <RangeInputs>
              <Input
                type="number"
                placeholder={t('filters.from')}
                value={filters.priceMin || ''}
                onChange={(e) => handleChange('priceMin', e.target.value)}
              />
              <RangeSeparator>—</RangeSeparator>
              <Input
                type="number"
                placeholder={t('filters.to')}
                value={filters.priceMax || ''}
                onChange={(e) => handleChange('priceMax', e.target.value)}
              />
            </RangeInputs>
          </FilterSection>

          {/* Year Range */}
          <FilterSection>
            <SectionTitle>{t('filters.year')}</SectionTitle>
            <RangeInputs>
              <Input
                type="number"
                placeholder={t('filters.from')}
                value={filters.yearMin || ''}
                onChange={(e) => handleChange('yearMin', e.target.value)}
              />
              <RangeSeparator>—</RangeSeparator>
              <Input
                type="number"
                placeholder={t('filters.to')}
                value={filters.yearMax || ''}
                onChange={(e) => handleChange('yearMax', e.target.value)}
              />
            </RangeInputs>
          </FilterSection>

          {/* Mileage Range */}
          <FilterSection>
            <SectionTitle>{t('filters.mileage')}</SectionTitle>
            <RangeInputs>
              <Input
                type="number"
                placeholder={t('filters.from')}
                value={filters.mileageMin || ''}
                onChange={(e) => handleChange('mileageMin', e.target.value)}
              />
              <RangeSeparator>—</RangeSeparator>
              <Input
                type="number"
                placeholder={t('filters.to')}
                value={filters.mileageMax || ''}
                onChange={(e) => handleChange('mileageMax', e.target.value)}
              />
            </RangeInputs>
          </FilterSection>

          {/* Fuel Type */}
          <FilterSection>
            <SectionTitle>{t('filters.fuelType')}</SectionTitle>
            <Select
              value={filters.fuelType || ''}
              onChange={(e) => handleChange('fuelType', e.target.value)}
            >
              <option value="">{t('filters.selectFuel')}</option>
              <option value="petrol">{language === 'bg' ? 'Бензин' : 'Petrol'}</option>
              <option value="diesel">{language === 'bg' ? 'Дизел' : 'Diesel'}</option>
              <option value="electric">{language === 'bg' ? 'Електрически' : 'Electric'}</option>
              <option value="hybrid">{language === 'bg' ? 'Хибрид' : 'Hybrid'}</option>
              <option value="lpg">{language === 'bg' ? 'ГАЗ/ГБО' : 'LPG'}</option>
            </Select>
          </FilterSection>

          {/* Transmission */}
          <FilterSection>
            <SectionTitle>{t('filters.transmission')}</SectionTitle>
            <Select
              value={filters.transmission || ''}
              onChange={(e) => handleChange('transmission', e.target.value)}
            >
              <option value="">{t('filters.selectTransmission')}</option>
              <option value="manual">{language === 'bg' ? 'Ръчна' : 'Manual'}</option>
              <option value="automatic">{language === 'bg' ? 'Автоматична' : 'Automatic'}</option>
              <option value="semi-automatic">{language === 'bg' ? 'Полуавтоматична' : 'Semi-automatic'}</option>
            </Select>
          </FilterSection>

          {/* Body Type */}
          <FilterSection>
            <SectionTitle>{t('filters.bodyType')}</SectionTitle>
            <Select
              value={filters.bodyType || ''}
              onChange={(e) => handleChange('bodyType', e.target.value)}
            >
              <option value="">{t('filters.selectBody')}</option>
              <option value="sedan">{language === 'bg' ? 'Седан' : 'Sedan'}</option>
              <option value="hatchback">{language === 'bg' ? 'Хечбек' : 'Hatchback'}</option>
              <option value="suv">{language === 'bg' ? 'SUV/Джип' : 'SUV'}</option>
              <option value="wagon">{language === 'bg' ? 'Комби' : 'Wagon'}</option>
              <option value="coupe">{language === 'bg' ? 'Купе' : 'Coupe'}</option>
              <option value="van">{language === 'bg' ? 'Ван' : 'Van'}</option>
            </Select>
          </FilterSection>

          {/* Region */}
          <FilterSection>
            <SectionTitle>{t('filters.locationData?.regionName')}</SectionTitle>
            <Input
              type="text"
              placeholder={t('filters.selectRegion')}
              value={filters.locationData?.regionName || ''}
              onChange={(e) => handleChange('region', e.target.value)}
            />
          </FilterSection>
        </DrawerContent>

        {/* Footer */}
        <DrawerFooter>
          <ResponsiveButton
            variant="outline"
            fullWidth
            onClick={handleClear}
          >
            {t('filters.clear')}
          </ResponsiveButton>
          <ResponsiveButton
            variant="primary"
            fullWidth
            onClick={handleApply}
          >
            {t('filters.apply')}
            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
          </ResponsiveButton>
        </DrawerFooter>
      </DrawerContainer>
    </>
  );
};
