// src/components/AdvancedSearch.tsx
// Advanced Search Component for Bulgarian Car Marketplace

import { useState, useEffect } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { CarSearchFilters } from '../firebase';

interface AdvancedSearchProps {
  filters: CarSearchFilters;
  onFiltersChange: (filters: CarSearchFilters) => void;
  onSearch: () => void;
  onClear: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const SearchContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const SearchHeader = styled.div`
  padding: 16px;
  background: #2563eb;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }

  .toggle-icon {
    font-size: 24px;
    transition: transform 0.3s ease-in-out;
  }
`;

const SearchContent = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => isExpanded ? 'none' : '0'};
  overflow: ${({ isExpanded }) => isExpanded ? 'visible' : 'hidden'};
  transition: max-height 0.3s ease-in-out, overflow 0.3s ease-in-out;
`;

const SearchForm = styled.div`
  padding: 16px;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchGroup = styled.div`
  label {
    display: block;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  input, select, textarea {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    background: ${({ theme }) => theme.colors.background.paper};
    transition: border-color 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const PriceRange = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  input {
    flex: 1;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};

  label {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    cursor: pointer;

    input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const SectionHeader = styled.h4`
  background: ${({ theme }) => theme.colors.grey[100]};
  color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const ActionButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    border-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.primary.main};

    &:hover {
      background: ${({ theme }) => theme.colors.primary.main};
      color: white;
    }
  }

  &.clear {
    border-color: ${({ theme }) => theme.colors.grey[400]};
    background: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.grey[700]};

    &:hover {
      background: ${({ theme }) => theme.colors.grey[200]};
      border-color: ${({ theme }) => theme.colors.grey[500]};
    }
  }
`;

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isExpanded = false,
  onToggleExpanded
}) => {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters);
  const [currentLanguage, setCurrentLanguage] = useState<'bg' | 'en'>('bg');

  // Advanced Search specific translations
  const advancedTranslations = {
    bg: {
      any: 'Всички',
      vehicleCondition: 'Състояние на автомобила',
      parkingAssist: 'Паркиращи сензори',
      interiorSection: 'Интериор',
      interiorColor: 'Цвят на интериора',
      seatMaterial: 'Материал на седалките',
      airConditioning: 'Климатик',
      airbags: 'Въздушни възглавници',
      cruiseControl: 'Круиз контрол',
      offerDetails: 'Детайли на офертата',
      sellerType: 'Тип продавач',
      paymentMethod: 'Начин на плащане',
      adOnlineDays: 'Дни онлайн',
      environmentalStandards: 'Екологични стандарти',
      emissionClass: 'Емисионен клас',
      trailerType: 'Тип ремарке',
      additionalOptions: 'Допълнителни опции',
      features: 'Екстри'
    },
    en: {
      any: 'Any',
      vehicleCondition: 'Vehicle Condition',
      parkingAssist: 'Parking Sensors',
      interiorSection: 'Interior',
      interiorColor: 'Interior Color',
      seatMaterial: 'Seat Material',
      airConditioning: 'Air Conditioning',
      airbags: 'Airbags',
      cruiseControl: 'Cruise Control',
      offerDetails: 'Offer Details',
      sellerType: 'Seller Type',
      paymentMethod: 'Payment Method',
      adOnlineDays: 'Days Online',
      environmentalStandards: 'Environmental Standards',
      emissionClass: 'Emission Class',
      trailerType: 'Trailer Type',
      additionalOptions: 'Additional Options',
      features: 'Features'
    }
  };

  const at = advancedTranslations[currentLanguage];

  // Basic Data Options
  const vehicleTypes = [
    'Кабриолет/Родстер', 'Комби', 'Джип/Пикап/SUV', 'Седан', 'Малки коли', 
    'Спортни коли/Купе', 'Ван/Минибус', 'Други'
  ];

  const vehicleConditions = [
    'Нов', 'Употребяван', 'Предварително регистриран', 'Служебна кола', 
    'Класически автомобил', 'Демонстрационно возило'
  ];

  const paymentTypes = ['Закупуване', 'Лизинг'];

  const seatNumbers = [2, 3, 4, 5, 6, 7, 8, 9];
  const doorNumbers = [2, 3, 4, 5];

  // Technical Data Options
  const fuelTypes = [
    'Бензин', 'Дизел', 'Електрически', 'Етанол (FFV, E85 и др.)', 
    'Хибрид (дизел/електрически)', 'Хибрид (бензин/електрически)', 
    'Водород', 'LPG', 'Природен газ', 'Други', 'Plug-in хибрид'
  ];

  const driveTypes = [
    'Всички колела', 'Предно задвижване', 'Задно задвижване'
  ];

  const transmissionTypes = [
    'Автоматична', 'Полуавтоматична', 'Ръчна скоростна кутия'
  ];

  const emissionStickers = ['Зелена', 'Жълта', 'Червена'];
  const emissionClasses = [
    'Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 
    'Euro 6c', 'Euro 6d-TEMP', 'Euro 6d'
  ];

  // Exterior Options
  const exteriorColors = [
    'Черен', 'Бежов', 'Сив', 'Кафяв', 'Бял', 'Оранжев', 'Син', 
    'Жълт', 'Червен', 'Зелен', 'Сребърен', 'Златен', 'Лилав'
  ];

  const trailerCouplingTypes = [
    'Фиксировано, откачащо се или завъртащо се', 
    'Откачащо се или завъртащо се', 
    'Завъртащо се'
  ];

  const parkingSensors = [
    '360° Камера', 'Камера', 'Отпред', 'Отзад', 
    'Предупреждение за задния трафик', 'Самоуправляващи системи'
  ];

  const cruiseControlTypes = [
    'Круиз контрол', 'Адаптивен круиз контрол'
  ];

  // Interior Options
  const interiorColors = [
    'Бежов', 'Черен', 'Син', 'Кафяв', 'Сив', 'Червен', 'Други'
  ];

  const interiorMaterials = [
    'Алкантара', 'Плат', 'Имитация кожа', 'Частична кожа', 
    'Пълна кожа', 'Кадифе', 'Други'
  ];

  const airbagTypes = [
    'Водачка въздушна възглавница', 'Предни въздушни възглавници',
    'Предни и странични въздушни възглавници', 
    'Предни, странични и още въздушни възглавници'
  ];

  const airConditioningTypes = [
    'Без климатизация', 'Ръчна или автоматична климатизация',
    'Автоматична климатизация', 'Автоматична климатизация, 2 зони',
    'Автоматична климатизация, 3 зони', 'Автоматична климатизация, 4 зони'
  ];

  // Offer Details
  const sellerTypes = ['Търговец', 'Частно лице', 'Фирмена кола'];
  const dealerRatings = ['3 звезди', '4 звезди', '5 звезди'];
  const adOnlineDays = [1, 3, 7, 14];

  const damageTypes = [
    'Без', 'Катастрофирала', 'Повредена', 'Неремонтирана', 
    'За части', 'Неработеща'
  ];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (key: keyof CarSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocationChange = (field: 'city' | 'region', value: string) => {
    const newLocation = {
      ...localFilters.location,
      [field]: value
    };
    handleInputChange('location', newLocation);
  };

  const handleFeaturesChange = (feature: string, checked: boolean) => {
    const currentFeatures = localFilters.features || [];
    const newFeatures = checked
      ? [...currentFeatures, feature]
      : currentFeatures.filter(f => f !== feature);
    handleInputChange('features', newFeatures);
  };

  const handleSearch = () => {
    onSearch();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  const bulgarianMakes = [
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Honda',
    'Ford', 'Opel', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Nissan',
    'Hyundai', 'Kia', 'Škoda', 'Seat', 'Dacia', 'Suzuki', 'Mazda'
  ];

  const bulgarianCities = [
    'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора',
    'Плевен', 'Сливен', 'Добрич', 'Шумен', 'Перник', 'Хасково',
    'Ямбол', 'Пазарджик', 'Благоевград', 'Велико Търново', 'Враца',
    'Габрово', 'Асеновград', 'Видин', 'Кърджали', 'Кюстендил', 'Монтана',
    'Търговище', 'Силистра', 'Ловеч', 'Разград', 'Смолян'
  ];

  const carFeatures = [
    'Климатична инсталация', 'Навигация', 'Камера за обратно виждане',
    'Парктроник', 'Круиз контрол', 'Сензорни фарове', 'LED фарове',
    'Ел. огледала', 'Ел. седалки', 'Подгрев на седалки', 'Панорамен покрив',
    '4x4', 'Автопилот', 'Apple CarPlay', 'Android Auto'
  ];

  return (
    <SearchContainer>
      <SearchHeader>
        <h3 onClick={onToggleExpanded} style={{ cursor: 'pointer', flex: 1 }}>
          {currentLanguage === 'bg' ? 'Разширено търсене' : 'Advanced Search'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setCurrentLanguage(currentLanguage === 'bg' ? 'en' : 'bg')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              border: '1px solid rgba(255, 255, 255, 0.3)', 
              color: 'white', 
              padding: '8px 12px', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            {currentLanguage === 'bg' ? 'EN' : 'БГ'}
          </button>
          <span className="toggle-icon" onClick={onToggleExpanded} style={{ cursor: 'pointer' }}>
            {isExpanded ? '−' : '+'}
          </span>
        </div>
      </SearchHeader>

      <SearchContent isExpanded={isExpanded}>
        <SearchForm>
          {/* ========== Basic Data ========== */}
          <SectionHeader>{currentLanguage === 'bg' ? 'Основни данни' : 'Basic Data'}</SectionHeader>
          
          <SearchRow>
            <SearchGroup>
              <label>{currentLanguage === 'bg' ? 'Марка' : 'Make'}</label>
              <select 
                value={localFilters.make || ''} 
                onChange={(e) => handleInputChange('make', e.target.value)}
              >
                <option value="">{at.any}</option>
                {bulgarianMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{currentLanguage === 'bg' ? 'Модел' : 'Model'}</label>
              <input
                type="text"
                placeholder={currentLanguage === 'bg' ? 'напр. GTI ...' : 'e.g. GTI ...'}
                value={localFilters.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </SearchGroup>

            <SearchGroup>
              <label>{currentLanguage === 'bg' ? 'Тип автомобил' : 'Body Style'}</label>
              <select 
                value={localFilters.bodyStyle || ''} 
                onChange={(e) => handleInputChange('bodyStyle', e.target.value)}
              >
                <option value="">{at.any}</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          <SearchRow>
            <SearchGroup>
              <label>{currentLanguage === 'bg' ? 'Места от' : 'Seats from'}</label>
              <select 
                value={localFilters.seats?.from || ''} 
                onChange={(e) => handleInputChange('seats', { ...localFilters.seats, from: parseInt(e.target.value) || undefined })}
              >
                <option value="">{at.any}</option>
                {seatNumbers.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{currentLanguage === 'bg' ? 'до' : 'to'}</label>
              <select 
                value={localFilters.seats?.to || ''} 
                onChange={(e) => handleInputChange('seats', { ...localFilters.seats, to: parseInt(e.target.value) || undefined })}
              >
                <option value="">{at.any}</option>
                {seatNumbers.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.doorsFrom')}</label>
              <select 
                value={localFilters.doors?.from || ''} 
                onChange={(e) => handleInputChange('doors', { ...localFilters.doors, from: parseInt(e.target.value) || undefined })}
              >
                <option value="">{t('advancedSearch.any')}</option>
                {doorNumbers.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>
          {/* ========== Technical Data ========== */}
          <SectionHeader>{t('advancedSearch.technicalData')}</SectionHeader>
          
          <SearchRow>
            <SearchGroup>
              <label>{t('advancedSearch.fuelType')}</label>
              <select 
                value={localFilters.fuelType || ''} 
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
              >
                <option value="">{t('advancedSearch.any')}</option>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.powerFrom')}</label>
              <input
                type="number"
                placeholder={t('advancedSearch.any')}
                value={localFilters.power?.from || ''}
                onChange={(e) => handleInputChange('power', { ...localFilters.power, from: parseInt(e.target.value) || undefined })}
              />
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.powerTo')}</label>
              <input
                type="number"
                placeholder={t('advancedSearch.any')}
                value={localFilters.power?.to || ''}
                onChange={(e) => handleInputChange('power', { ...localFilters.power, to: parseInt(e.target.value) || undefined })}
              />
            </SearchGroup>
          </SearchRow>

          <SearchRow>
            <SearchGroup>
              <label>{t('advancedSearch.driveType')}</label>
              <select 
                value={localFilters.driveType || ''} 
                onChange={(e) => handleInputChange('driveType', e.target.value)}
              >
                <option value="">{t('advancedSearch.any')}</option>
                {driveTypes.map(drive => (
                  <option key={drive} value={drive}>{drive}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.transmission')}</label>
              <select 
                value={localFilters.transmission || ''} 
                onChange={(e) => handleInputChange('transmission', e.target.value)}
              >
                <option value="">{t('advancedSearch.any')}</option>
                {transmissionTypes.map(trans => (
                  <option key={trans} value={trans}>{trans}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.emissionSticker')}</label>
              <select 
                value={localFilters.emissionSticker || ''} 
                onChange={(e) => handleInputChange('emissionSticker', e.target.value)}
              >
                <option value="">{t('advancedSearch.any')}</option>
                {emissionStickers.map(sticker => (
                  <option key={sticker} value={sticker}>{sticker}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          {/* ========== Price, Year & Mileage ========== */}
          <SectionHeader>{t('advancedSearch.priceYearMileage')}</SectionHeader>

          <SearchRow>
            <SearchGroup>
              <label>{t('advancedSearch.priceFrom')}</label>
              <input
                type="number"
                placeholder={t('advancedSearch.any')}
                value={localFilters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', parseInt(e.target.value) || undefined)}
              />
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.priceTo')}</label>
              <input
                type="number"
                placeholder={t('advancedSearch.any')}
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', parseInt(e.target.value) || undefined)}
              />
            </SearchGroup>

            <SearchGroup>
              <label>Mileage From / Километри от</label>
              <input
                type="number"
                placeholder="Any / Всеки"
                value={localFilters.minMileage || ''}
                onChange={(e) => handleInputChange('minMileage', parseInt(e.target.value) || undefined)}
              />
            </SearchGroup>
          </SearchRow>

          <SearchRow>
            <SearchGroup>
              <label>Mileage To / Километри до</label>
              <input
                type="number"
                placeholder="Any / Всеки"
                value={localFilters.maxMileage || ''}
                onChange={(e) => handleInputChange('maxMileage', parseInt(e.target.value) || undefined)}
              />
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.yearFrom')}</label>
              <input
                type="number"
                placeholder={t('advancedSearch.any')}
                value={localFilters.minYear || ''}
                onChange={(e) => handleInputChange('minYear', parseInt(e.target.value) || undefined)}
              />
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.yearTo')}</label>
              <input
                type="number"
                placeholder={t('advancedSearch.any')}
                value={localFilters.maxYear || ''}
                onChange={(e) => handleInputChange('maxYear', parseInt(e.target.value) || undefined)}
              />
            </SearchGroup>
          </SearchRow>

          {/* ========== Location ========== */}
          <SectionHeader>{t('advancedSearch.location')}</SectionHeader>

          <SearchRow>
            <SearchGroup>
              <label>{t('advancedSearch.country')}</label>
              <input
                type="text"
                value={t('advancedSearch.bulgaria')}
                disabled
                style={{ background: '#f5f5f5', color: '#666' }}
              />
            </SearchGroup>

            <SearchGroup>
              <label>{t('advancedSearch.city')}</label>
              <select
                value={localFilters.location?.city || ''}
                onChange={(e) => handleLocationChange('city', e.target.value)}
              >
                <option value="">{t('advancedSearch.any')}</option>
                {bulgarianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          {/* ========== Exterior ========== */}
          <SectionHeader>{t('advancedSearch.exterior')}</SectionHeader>
          
          <SearchRow>
            <SearchGroup>
              <label>Car Color / Цвят на колата</label>
              <select 
                value={localFilters.exteriorColorCategory || ''} 
                onChange={(e) => handleInputChange('exteriorColorCategory', e.target.value)}
              >
                <option value="">Any / Всеки</option>
                {exteriorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.vehicleCondition}</label>
              <select 
                value={localFilters.condition || ''} 
                onChange={(e) => handleInputChange('condition', e.target.value)}
              >
                <option value="">{at.any}</option>
                {vehicleConditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.parkingAssist}</label>
              <select 
                value={localFilters.parkingAssist?.[0] || ''} 
                onChange={(e) => handleInputChange('parkingAssist', e.target.value ? [e.target.value] : undefined)}
              >
                <option value="">{at.any}</option>
                {parkingSensors.map(sensor => (
                  <option key={sensor} value={sensor}>{sensor}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          {/* ========== المقصورة الداخلية ========== */}
          <SectionHeader>{at.interiorSection}</SectionHeader>
          
          <SearchRow>
            <SearchGroup>
              <label>{at.interiorColor}</label>
              <select 
                value={localFilters.interiorColor || ''} 
                onChange={(e) => handleInputChange('interiorColor', e.target.value)}
              >
                <option value="">{at.any}</option>
                {interiorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.seatMaterial}</label>
              <select 
                value={localFilters.interiorMaterial || ''} 
                onChange={(e) => handleInputChange('interiorMaterial', e.target.value)}
              >
                <option value="">{at.any}</option>
                {interiorMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.airConditioning}</label>
              <select 
                value={localFilters.climateControl || ''} 
                onChange={(e) => handleInputChange('climateControl', e.target.value)}
              >
                <option value="">{at.any}</option>
                {airConditioningTypes.map(ac => (
                  <option key={ac} value={ac}>{ac}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          <SearchRow>
            <SearchGroup>
              <label>{at.airbags}</label>
              <select 
                value={localFilters.airbags || ''} 
                onChange={(e) => handleInputChange('airbags', e.target.value)}
              >
                <option value="">{at.any}</option>
                {airbagTypes.map(airbag => (
                  <option key={airbag} value={airbag}>{airbag}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.cruiseControl}</label>
              <select 
                value={localFilters.cruiseControl || ''} 
                onChange={(e) => handleInputChange('cruiseControl', e.target.value)}
              >
                <option value="">{at.any}</option>
                {cruiseControlTypes.map(cruise => (
                  <option key={cruise} value={cruise}>{cruise}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          {/* ========== تفاصيل العرض ========== */}
          <SectionHeader>{at.offerDetails}</SectionHeader>
          
          <SearchRow>
            <SearchGroup>
              <label>{at.sellerType}</label>
              <select 
                value={localFilters.sellerType || ''} 
                onChange={(e) => handleInputChange('sellerType', e.target.value)}
              >
                <option value="">{at.any}</option>
                {sellerTypes.map(seller => (
                  <option key={seller} value={seller}>{seller}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.paymentMethod}</label>
              <select 
                value={localFilters.paymentType || ''} 
                onChange={(e) => handleInputChange('paymentType', e.target.value)}
              >
                <option value="">{at.any}</option>
                {paymentTypes.map(payment => (
                  <option key={payment} value={payment}>{payment}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.adOnlineDays}</label>
              <select 
                value={localFilters.adOnlineSinceDays || ''} 
                onChange={(e) => handleInputChange('adOnlineSinceDays', parseInt(e.target.value) || undefined)}
              >
                <option value="">{at.any}</option>
                {adOnlineDays.map(days => (
                  <option key={days} value={days}>{days}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          {/* ========== المعايير البيئية ========== */}
          <SectionHeader>{at.environmentalStandards}</SectionHeader>
          
          <SearchRow>
            <SearchGroup>
              <label>{at.emissionClass}</label>
              <select 
                value={localFilters.emissionClass || ''} 
                onChange={(e) => handleInputChange('emissionClass', e.target.value)}
              >
                <option value="">{at.any}</option>
                {emissionClasses.map(emission => (
                  <option key={emission} value={emission}>{emission}</option>
                ))}
              </select>
            </SearchGroup>

            <SearchGroup>
              <label>{at.trailerType}</label>
              <select 
                value={localFilters.towbar || ''} 
                onChange={(e) => handleInputChange('towbar', e.target.value)}
              >
                <option value="">{at.any}</option>
                {trailerCouplingTypes.map(trailer => (
                  <option key={trailer} value={trailer}>{trailer}</option>
                ))}
              </select>
            </SearchGroup>
          </SearchRow>

          {/* خيارات إضافية - moved to end with comprehensive features */}
          <SectionHeader>{at.additionalOptions}</SectionHeader>

          <SearchRow>
            <SearchGroup style={{ gridColumn: '1 / -1' }}>
              <label>{at.features}</label>
              <CheckboxGroup>
                {carFeatures.map(feature => (
                  <label key={feature}>
                    <input
                      type="checkbox"
                      checked={localFilters.features?.includes(feature) || false}
                      onChange={(e) => handleFeaturesChange(feature, e.target.checked)}
                    />
                    {feature}
                  </label>
                ))}
              </CheckboxGroup>
            </SearchGroup>
          </SearchRow>

          {/* Action Buttons */}
          <ActionButtons>
            <ActionButton onClick={handleSearch}>
              بحث
            </ActionButton>
            <ActionButton className="clear" onClick={handleClear}>
              مسح الكل
            </ActionButton>
          </ActionButtons>
        </SearchForm>
      </SearchContent>
    </SearchContainer>
  );
};

export default AdvancedSearch;