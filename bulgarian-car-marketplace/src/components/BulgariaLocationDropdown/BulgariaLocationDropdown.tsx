/**
 * Bulgaria Location Dropdown Component
 * مكون القائمة المنسدلة للمواقع البلغارية
 * 
 * Cascading dropdowns for selecting location in Bulgaria:
 * 1. Province (28 options)
 * 2. City (filtered by province)
 * 3. Postal Code (4-digit, auto-filled)
 * 
 * Features:
 * - Major provinces highlighted (by population)
 * - "Other" option for manual entry
 * - Bilingual support (Bulgarian/English)
 * - Auto-fill postal code when city selected
 * - Responsive design
 * 
 * Similar to BrandModelMarkdownDropdown architecture
 * 
 * @author GitHub Copilot
 * @date November 16, 2025
 */

import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import bulgariaLocationsService, { CityData } from '../../services/bulgaria-locations.service';

// ============================================
// TYPES
// ============================================

export interface BulgariaLocationData {
  province: string;
  city: string;
  postalCode: string;
  isManualEntry?: boolean; // True if user selected "Other"
}

interface BulgariaLocationDropdownProps {
  value: BulgariaLocationData;
  onChange: (location: BulgariaLocationData) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const DropdownGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $required?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 4px;

  ${props => props.$required && `
    &::after {
      content: '*';
      color: ${props.theme.colors.error.main};
    }
  `}
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 12px 16px;
  font-size: 16px;
  font-family: 'Martica', Arial, sans-serif;
  border: 2px solid ${props => 
    props.$hasError 
      ? props.theme.colors.error.main 
      : props.theme.colors.grey[300]
  };
  border-radius: 8px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.light}33;
  }

  &:disabled {
    background: ${props => props.theme.colors.grey[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    padding: 8px;
  }

  /* Major provinces - bold and orange */
  option.major-province {
    font-weight: 700;
    color: #FF8F10;
  }

  option.other-option {
    border-top: 2px solid ${props => props.theme.colors.grey[300]};
    font-weight: 600;
    color: ${props => props.theme.colors.secondary.main};
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 12px 16px;
  font-size: 16px;
  font-family: 'Martica', Arial, sans-serif;
  border: 2px solid ${props => 
    props.$hasError 
      ? props.theme.colors.error.main 
      : props.theme.colors.grey[300]
  };
  border-radius: 8px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary.light}33;
  }

  &:disabled {
    background: ${props => props.theme.colors.grey[100]};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.error.main};
  margin-top: 4px;
`;

const LoadingText = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const PostalCodeDisplay = styled.div`
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Martica', Arial, sans-serif;
  border: 2px solid ${props => props.theme.colors.grey[300]};
  border-radius: 8px;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '📮';
    font-size: 20px;
  }
`;

// ============================================
// COMPONENT
// ============================================

export const BulgariaLocationDropdown: React.FC<BulgariaLocationDropdownProps> = ({
  value,
  onChange,
  className,
  disabled = false,
  error
}) => {
  const { language } = useLanguage();
  
  // State
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showManualProvince, setShowManualProvince] = useState(false);
  const [showManualCity, setShowManualCity] = useState(false);
  const [showManualPostalCode, setShowManualPostalCode] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (value.province && value.province !== 'other' && !showManualProvince) {
      loadCities(value.province);
    } else {
      setCities([]);
    }
  }, [value.province, showManualProvince]);

  // Auto-fill postal code when city selected
  useEffect(() => {
    if (value.city && cities.length > 0 && !showManualCity) {
      const selectedCity = cities.find(c => c.name === value.city || c.nameEn === value.city);
      if (selectedCity && selectedCity.postalCode !== value.postalCode) {
        onChange({
          ...value,
          postalCode: selectedCity.postalCode
        });
      }
    }
  }, [value, value.city, cities, showManualCity, onChange]);

  /**
   * Load all provinces
   */
  const loadProvinces = async () => {
    try {
      console.log('[BulgariaLocationDropdown] Starting to load provinces...');
      setIsLoadingProvinces(true);
      const allProvinces = await bulgariaLocationsService.getAllProvinces();
      console.log('[BulgariaLocationDropdown] Loaded provinces:', allProvinces.length, allProvinces);
      setProvinces(allProvinces);
    } catch (error) {
      console.error('[BulgariaLocationDropdown] Failed to load provinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  /**
   * Load cities for selected province
   */
  const loadCities = async (provinceName: string) => {
    try {
      setIsLoadingCities(true);
      const provinceCities = await bulgariaLocationsService.getCitiesInProvince(provinceName);
      setCities(provinceCities);
    } catch (error) {
      console.error('[BulgariaLocationDropdown] Failed to load cities:', error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  /**
   * Major provinces (by population)
   */
  const majorProvinces = useMemo(() => {
    return [
      'София-град',      // Sofia City
      'Пловдив',         // Plovdiv
      'Варна',           // Varna
      'Бургас',          // Burgas
      'Русе',            // Ruse
      'Стара Загора',    // Stara Zagora
      'Плевен',          // Pleven
      'Сливен'           // Sliven
    ];
  }, []);

  /**
   * Handle province change
   */
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvince = e.target.value;

    if (selectedProvince === 'other') {
      setShowManualProvince(true);
      setShowManualCity(true);
      setShowManualPostalCode(true);
      onChange({
        province: '',
        city: '',
        postalCode: '',
        isManualEntry: true
      });
    } else {
      setShowManualProvince(false);
      setShowManualCity(false);
      setShowManualPostalCode(false);
      onChange({
        province: selectedProvince,
        city: '',
        postalCode: '',
        isManualEntry: false
      });
    }
  };

  /**
   * Handle city change
   */
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;

    if (selectedCity === 'other') {
      setShowManualCity(true);
      setShowManualPostalCode(true);
      onChange({
        ...value,
        city: '',
        postalCode: '',
        isManualEntry: true
      });
    } else {
      setShowManualCity(false);
      setShowManualPostalCode(false);
      const cityData = cities.find(c => c.name === selectedCity || c.nameEn === selectedCity);
      onChange({
        ...value,
        city: selectedCity,
        postalCode: cityData?.postalCode || '',
        isManualEntry: false
      });
    }
  };

  /**
   * Handle manual input changes
   */
  const handleManualProvinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      province: e.target.value,
      isManualEntry: true
    });
  };

  const handleManualCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      city: e.target.value,
      isManualEntry: true
    });
  };

  const handleManualPostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow 4 digits
    const input = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({
      ...value,
      postalCode: input,
      isManualEntry: true
    });
  };

  /**
   * Translations
   */
  const translations = {
    province: {
      bg: 'Област',
      en: 'Province'
    },
    city: {
      bg: 'Град',
      en: 'City'
    },
    postalCode: {
      bg: 'Пощенски код',
      en: 'Postal Code'
    },
    selectProvince: {
      bg: 'Изберете област',
      en: 'Select province'
    },
    selectCity: {
      bg: 'Изберете град',
      en: 'Select city'
    },
    other: {
      bg: '🔸 Друго (ръчно въвеждане)',
      en: '🔸 Other (manual entry)'
    },
    loading: {
      bg: 'Зареждане...',
      en: 'Loading...'
    },
    manualProvincePlaceholder: {
      bg: 'Въведете област',
      en: 'Enter province'
    },
    manualCityPlaceholder: {
      bg: 'Въведете град',
      en: 'Enter city'
    },
    manualPostalCodePlaceholder: {
      bg: '####',
      en: '####'
    }
  };

  const t2 = (key: keyof typeof translations) => translations[key][language];

  return (
    <Container className={className}>
      {/* Province Selector */}
      <DropdownGroup>
        <Label $required>{t2('province')}</Label>
        {isLoadingProvinces ? (
          <LoadingText>{t2('loading')}</LoadingText>
        ) : showManualProvince ? (
          <Input
            type="text"
            value={value.province}
            onChange={handleManualProvinceChange}
            placeholder={t2('manualProvincePlaceholder')}
            disabled={disabled}
            $hasError={!!error}
          />
        ) : (
          <Select
            value={value.province || ''}
            onChange={handleProvinceChange}
            disabled={disabled}
            $hasError={!!error}
          >
            <option value="">{t2('selectProvince')}</option>
            
            {/* Major provinces first */}
            {provinces
              .filter(p => majorProvinces.includes(p))
              .map(province => (
                <option 
                  key={province} 
                  value={province}
                  className="major-province"
                >
                  ⭐ {province}
                </option>
              ))}
            
            {/* Other provinces */}
            {provinces
              .filter(p => !majorProvinces.includes(p))
              .map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            
            {/* "Other" option */}
            <option value="other" className="other-option">
              {t2('other')}
            </option>
          </Select>
        )}
      </DropdownGroup>

      {/* City Selector */}
      <DropdownGroup>
        <Label $required>{t2('city')}</Label>
        {isLoadingCities ? (
          <LoadingText>{t2('loading')}</LoadingText>
        ) : showManualCity ? (
          <Input
            type="text"
            value={value.city}
            onChange={handleManualCityChange}
            placeholder={t2('manualCityPlaceholder')}
            disabled={disabled}
            $hasError={!!error}
          />
        ) : (
          <Select
            value={value.city || ''}
            onChange={handleCityChange}
            disabled={disabled || !value.province || value.province === 'other'}
            $hasError={!!error}
          >
            <option value="">{t2('selectCity')}</option>
            
            {cities.map(city => {
              const displayName = language === 'bg' ? city.name : city.nameEn;
              const isMajor = bulgariaLocationsService.isMajorCity(city.name);
              
              return (
                <option 
                  key={`${city.name}-${city.postalCode}`} 
                  value={city.name}
                  className={isMajor ? 'major-province' : ''}
                >
                  {isMajor ? '⭐ ' : ''}{displayName}
                  {city.district ? ` (${city.district})` : ''}
                </option>
              );
            })}
            
            {/* "Other" option */}
            {cities.length > 0 && (
              <option value="other" className="other-option">
                {t2('other')}
              </option>
            )}
          </Select>
        )}
      </DropdownGroup>

      {/* Postal Code */}
      <DropdownGroup>
        <Label $required>{t2('postalCode')}</Label>
        {showManualPostalCode ? (
          <Input
            type="text"
            value={value.postalCode}
            onChange={handleManualPostalCodeChange}
            placeholder={t2('manualPostalCodePlaceholder')}
            maxLength={4}
            disabled={disabled}
            $hasError={!!error}
          />
        ) : value.postalCode ? (
          <PostalCodeDisplay>
            {value.postalCode}
          </PostalCodeDisplay>
        ) : (
          <Input
            type="text"
            value=""
            placeholder={t2('manualPostalCodePlaceholder')}
            disabled
          />
        )}
      </DropdownGroup>

      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default BulgariaLocationDropdown;
