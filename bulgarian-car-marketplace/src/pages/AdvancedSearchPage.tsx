// src/pages/AdvancedSearchPage.tsx
// Advanced Search Page for Bulgarian Car Marketplace
// Inspired by mobile.de advanced search functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Professional Color Palette - Black & Yellow System
const colors = {
  primary: {
    yellow: '#FFD700',
    yellowMedium: '#F4C430',
    yellowDark: '#DAA520',
    yellowDeep: '#B8860B',
  },
  neutral: {
    black: '#000000',
    blackLight: '#1a1a1a',
    blackMedium: '#333333',
    blackSoft: '#4a4a4a',
    gray: '#666666',
    grayLight: '#999999',
    grayLighter: '#cccccc',
    white: '#ffffff',
  },
  accent: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Main Container
const SearchContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${colors.neutral.blackLight} 0%,
    ${colors.primary.yellowMedium} 25%,
    ${colors.primary.yellowDark} 50%,
    ${colors.neutral.blackMedium} 75%,
    ${colors.neutral.black} 100%
  );
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

// Header Section
const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 24px;
  padding: 3rem 2rem;
  animation: ${fadeIn} 0.8s ease-out;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${colors.primary.yellow}, ${colors.primary.yellowDark});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: ${colors.neutral.white};
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }
`;

// Search Form Container
const SearchForm = styled.form`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

// Section Title
const SectionTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${colors.primary.yellow};
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(218, 165, 32, 0.3);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: ${colors.primary.yellow};
    border-radius: 2px;
  }
`;

// Form Grid
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

// Form Group
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  label {
    font-weight: 500;
    color: ${colors.neutral.white};
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
`;

// Professional Input
const SearchInput = styled.input`
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 12px;
  font-size: 0.95rem;
  color: ${colors.neutral.white};
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.yellow};
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.2);
  }

  &:hover {
    border-color: rgba(218, 165, 32, 0.5);
  }
`;

// Professional Select
const SearchSelect = styled.select`
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 12px;
  font-size: 0.95rem;
  color: ${colors.neutral.white};
  cursor: pointer;
  transition: all 0.3s ease;

  option {
    background: ${colors.neutral.black};
    color: ${colors.neutral.white};
    padding: 0.5rem;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.yellow};
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.2);
  }

  &:hover {
    border-color: rgba(218, 165, 32, 0.5);
  }
`;

// Checkbox Group
const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: ${colors.neutral.white};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(218, 165, 32, 0.1);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${colors.primary.yellow};
    cursor: pointer;
  }
`;

// Range Input Group
const RangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: end;

  span {
    color: ${colors.neutral.grayLight};
    font-size: 0.9rem;
    text-align: center;
    padding-bottom: 0.5rem;
  }
`;

// Action Buttons
const ActionSection = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(218, 165, 32, 0.3);
`;

const SearchButton = styled.button`
  padding: 1.25rem 3rem;
  background: linear-gradient(135deg, ${colors.primary.yellow}, ${colors.primary.yellowDark});
  color: ${colors.neutral.black};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(218, 165, 32, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled.button`
  padding: 1.25rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: ${colors.neutral.white};
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${colors.primary.yellow};
  }
`;

// Results Summary (placeholder for now)
const ResultsSummary = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
  animation: ${slideIn} 0.8s ease-out;

  h4 {
    color: ${colors.primary.yellow};
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${colors.neutral.white};
    opacity: 0.8;
    font-size: 1rem;
  }
`;

// Main Component
const AdvancedSearchPage: React.FC = () => {
  const navigate = useNavigate();

  // Search Form State
  const [searchData, setSearchData] = useState({
    // Basic Data
    make: '',
    model: '',
    vehicleType: '',
    seatsFrom: '',
    seatsTo: '',
    doorsFrom: '',
    doorsTo: '',
    slidingDoor: '',
    condition: '',
    paymentType: '',
    priceFrom: '',
    priceTo: '',
    firstRegistrationFrom: '',
    firstRegistrationTo: '',
    mileageFrom: '',
    mileageTo: '',
    huValid: '',
    ownersCount: '',
    serviceHistory: '',
    roadworthy: '',
    // Technical Data
    fuelType: '',
    powerFrom: '',
    powerTo: '',
    cubicCapacityFrom: '',
    cubicCapacityTo: '',
    fuelTankVolumeFrom: '',
    fuelTankVolumeTo: '',
    weightFrom: '',
    weightTo: '',
    cylindersFrom: '',
    cylindersTo: '',
    driveType: '',
    transmission: '',
    fuelConsumptionUpTo: '',
    emissionSticker: '',
    emissionClass: '',
    particulateFilter: '',
    // Exterior
    exteriorColor: '',
    trailerCoupling: '',
    trailerLoadBraked: '',
    trailerLoadUnbraked: '',
    noseWeight: '',
    parkingSensors: [],
    cruiseControl: '',
    // Interior
    interiorColor: '',
    interiorMaterial: '',
    airbags: '',
    airConditioning: '',
    extras: [],
    // Offer Details
    seller: '',
    dealerRating: '',
    adOnlineSince: '',
    adsWithPictures: false,
    adsWithVideo: false,
    discountOffers: false,
    nonSmokerVehicle: false,
    taxi: false,
    vatReclaimable: false,
    warranty: false,
    damagedVehicles: false,
    commercialExport: '',
    approvedUsedProgramme: '',
    // Location
    country: '',
    city: '',
    radius: '10',
    deliveryOffers: false,
    // Search
    searchDescription: ''
  });

  const [isSearching, setIsSearching] = useState(false);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Form Submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      // Simulate search
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to results page with search params
      const searchParams = new URLSearchParams();
      Object.entries(searchData).forEach(([key, value]) => {
        if (value && typeof value === 'string') searchParams.set(key, value);
        else if (typeof value === 'boolean' && value) searchParams.set(key, 'true');
        else if (Array.isArray(value) && value.length > 0) searchParams.set(key, value.join(','));
      });

      navigate(`/cars?${searchParams.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setSearchData({
      // Basic Data
      make: '',
      model: '',
      vehicleType: '',
      seatsFrom: '',
      seatsTo: '',
      doorsFrom: '',
      doorsTo: '',
      slidingDoor: '',
      condition: '',
      paymentType: '',
      priceFrom: '',
      priceTo: '',
      firstRegistrationFrom: '',
      firstRegistrationTo: '',
      mileageFrom: '',
      mileageTo: '',
      huValid: '',
      ownersCount: '',
      serviceHistory: '',
      roadworthy: '',
      // Technical Data
      fuelType: '',
      powerFrom: '',
      powerTo: '',
      cubicCapacityFrom: '',
      cubicCapacityTo: '',
      fuelTankVolumeFrom: '',
      fuelTankVolumeTo: '',
      weightFrom: '',
      weightTo: '',
      cylindersFrom: '',
      cylindersTo: '',
      driveType: '',
      transmission: '',
      fuelConsumptionUpTo: '',
      emissionSticker: '',
      emissionClass: '',
      particulateFilter: '',
      // Exterior
      exteriorColor: '',
      trailerCoupling: '',
      trailerLoadBraked: '',
      trailerLoadUnbraked: '',
      noseWeight: '',
      parkingSensors: [],
      cruiseControl: '',
      // Interior
      interiorColor: '',
      interiorMaterial: '',
      airbags: '',
      airConditioning: '',
      extras: [],
      // Offer Details
      seller: '',
      dealerRating: '',
      adOnlineSince: '',
      adsWithPictures: false,
      adsWithVideo: false,
      discountOffers: false,
      nonSmokerVehicle: false,
      taxi: false,
      vatReclaimable: false,
      warranty: false,
      damagedVehicles: false,
      commercialExport: '',
      approvedUsedProgramme: '',
      // Location
      country: '',
      city: '',
      radius: '10',
      deliveryOffers: false,
      // Search
      searchDescription: ''
    });
  };

  // Data Arrays
  const carMakes = [
    'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Opel',
    'Nissan', 'Hyundai', 'Kia', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Seat',
    'Škoda', 'Dacia', 'Suzuki', 'Mazda', 'Mitsubishi', 'Volvo', 'Lexus', 'Infiniti'
  ];

  const fuelTypes = [
    'Бензин', 'Дизел', 'Електрически', 'Етанол (FFV, E85, etc.)',
    'Хибриден (дизел/електрически)', 'Хибриден (бензин/електрически)',
    'Водород', 'LPG', 'Природен газ', 'Други', 'Plug-in хибрид'
  ];

  const exteriorColors = [
    'Черен', 'Бежов', 'Сив', 'Кафяв', 'Бял', 'Оранжев', 'Син', 'Жълт', 'Червен', 'Зелен',
    'Сребърен', 'Златен', 'Лилав', 'Мат', 'Металик'
  ];

  const interiorColors = ['Бежов', 'Черен', 'Син', 'Кафяв', 'Сив', 'Червен', 'Други'];

  const interiorMaterials = ['Алкантара', 'Плат', 'Изкуствена кожа', 'Частична кожа', 'Пълна кожа', 'Велур', 'Други'];

  const countries = ['България', 'Германия', 'Австрия', 'Швейцария', 'Други'];

  const bulgarianCities = [
    'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора',
    'Плевен', 'Добрич', 'Сливен', 'Шумен', 'Перник', 'Хасково'
  ];

  const radiusOptions = ['10 km', '25 km', '50 km', '100 km', '200 km'];

  return (
    <SearchContainer>
      <Container>
        {/* Header */}
        <HeaderSection>
          <h1>Подробно търсене: Коли – нови или употребявани</h1>
          <p>Намерете идеалната кола с нашата разширена система за търсене</p>
        </HeaderSection>

        {/* Search Form */}
        <SearchForm onSubmit={handleSearch}>
          {/* Basic Data */}
          <SectionTitle>Основни данни</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>Марка</label>
              <SearchSelect name="make" value={searchData.make} onChange={handleInputChange}>
                <option value="">Всички</option>
                {carMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Модел</label>
              <SearchInput
                type="text"
                name="model"
                value={searchData.model}
                onChange={handleInputChange}
                placeholder="например: GTI …"
              />
            </FormGroup>

            <FormGroup>
              <label>Тип превозно средство</label>
              <SearchSelect name="vehicleType" value={searchData.vehicleType} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="cabriolet">Кабриолет/ Родстър</option>
                <option value="estate">Комби</option>
                <option value="offroad">Джип/ Пикап/ SUV</option>
                <option value="saloon">Седан</option>
                <option value="small">Малък автомобил</option>
                <option value="sports">Спортен/ Купе</option>
                <option value="van">Ван/ Микробус</option>
                <option value="other">Други</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Брой места</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="seatsFrom"
                  value={searchData.seatsFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="seatsTo"
                  value={searchData.seatsTo}
                  onChange={handleInputChange}
                  placeholder="до"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>Брой врати</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="doorsFrom"
                  value={searchData.doorsFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="doorsTo"
                  value={searchData.doorsTo}
                  onChange={handleInputChange}
                  placeholder="до"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>Плъзгаща се врата</label>
              <SearchSelect name="slidingDoor" value={searchData.slidingDoor} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="yes">Да</option>
                <option value="no">Не</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Тип и състояние</label>
              <SearchSelect name="condition" value={searchData.condition} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="new">Нови</option>
                <option value="used">Употребявани</option>
                <option value="pre-registration">Предварителна регистрация</option>
                <option value="employee">Служебен автомобил</option>
                <option value="classic">Класически</option>
                <option value="demonstration">Демонстрационен</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Тип плащане</label>
              <SearchSelect name="paymentType" value={searchData.paymentType} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="buy">Покупка</option>
                <option value="leasing">Лизинг</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Цена</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="priceFrom"
                  value={searchData.priceFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                />
                <span>€</span>
                <SearchInput
                  type="number"
                  name="priceTo"
                  value={searchData.priceTo}
                  onChange={handleInputChange}
                  placeholder="до"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>Първа регистрация</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="firstRegistrationFrom"
                  value={searchData.firstRegistrationFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                  min="1950"
                  max="2025"
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="firstRegistrationTo"
                  value={searchData.firstRegistrationTo}
                  onChange={handleInputChange}
                  placeholder="до"
                  min="1950"
                  max="2025"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>Пробег</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="mileageFrom"
                  value={searchData.mileageFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                />
                <span>km</span>
                <SearchInput
                  type="number"
                  name="mileageTo"
                  value={searchData.mileageTo}
                  onChange={handleInputChange}
                  placeholder="до"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>HU поне валиден до</label>
              <SearchInput
                type="number"
                name="huValid"
                value={searchData.huValid}
                onChange={handleInputChange}
                placeholder="например: 2025"
              />
            </FormGroup>

            <FormGroup>
              <label>Брой собственици</label>
              <SearchSelect name="ownersCount" value={searchData.ownersCount} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Пълна сервизна история</label>
              <SearchSelect name="serviceHistory" value={searchData.serviceHistory} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="yes">Да</option>
                <option value="no">Не</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Пътно способен</label>
              <SearchSelect name="roadworthy" value={searchData.roadworthy} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="yes">Да</option>
                <option value="no">Не</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>

          {/* Technical Data */}
          <SectionTitle>Технически данни</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>Тип гориво</label>
              <SearchSelect name="fuelType" value={searchData.fuelType} onChange={handleInputChange}>
                <option value="">Всички</option>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Мощност</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="powerFrom"
                  value={searchData.powerFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                />
                <span>hp</span>
                <SearchInput
                  type="number"
                  name="powerTo"
                  value={searchData.powerTo}
                  onChange={handleInputChange}
                  placeholder="до"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>Работен обем</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="cubicCapacityFrom"
                  value={searchData.cubicCapacityFrom}
                  onChange={handleInputChange}
                  placeholder="от"
                />
                <span>ccm</span>
                <SearchInput
                  type="number"
                  name="cubicCapacityTo"
                  value={searchData.cubicCapacityTo}
                  onChange={handleInputChange}
                  placeholder="до"
                />
              </RangeGroup>
            </FormGroup>
          </FormGrid>

          {/* Exterior */}
          <SectionTitle>Екстериор</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>Цвят на каросерията</label>
              <SearchSelect name="exteriorColor" value={searchData.exteriorColor} onChange={handleInputChange}>
                <option value="">Всички</option>
                {exteriorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Теглич</label>
              <SearchSelect name="trailerCoupling" value={searchData.trailerCoupling} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="fixed">Фиксиран, detachable или swiveling</option>
                <option value="detachable">Detachable или swiveling</option>
                <option value="swiveling">Swiveling</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Товароспособност теглич спирана</label>
              <SearchInput
                type="number"
                name="trailerLoadBraked"
                value={searchData.trailerLoadBraked}
                onChange={handleInputChange}
                placeholder="от"
              />
            </FormGroup>

            <FormGroup>
              <label>Товароспособност теглич неспирана</label>
              <SearchInput
                type="number"
                name="trailerLoadUnbraked"
                value={searchData.trailerLoadUnbraked}
                onChange={handleInputChange}
                placeholder="от"
              />
            </FormGroup>

            <FormGroup>
              <label>Nose Weight</label>
              <SearchInput
                type="number"
                name="noseWeight"
                value={searchData.noseWeight}
                onChange={handleInputChange}
                placeholder="от"
              />
            </FormGroup>

            <FormGroup>
              <label>Паркинг сензори</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input type="checkbox" name="parkingSensors" value="360camera" />
                  360° Camera
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="parkingSensors" value="camera" />
                  Camera
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="parkingSensors" value="front" />
                  Front
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="parkingSensors" value="rear" />
                  Rear
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="parkingSensors" value="reartraffic" />
                  Rear traffic alert
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="parkingSensors" value="selfsteering" />
                  Self-steering systems
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <label>Круиз контрол</label>
              <SearchSelect name="cruiseControl" value={searchData.cruiseControl} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="cruise">Круиз контрол</option>
                <option value="adaptive">Adaptive Cruise Control</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>

          {/* Interior */}
          <SectionTitle>Интериор</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>Цвят на интериора</label>
              <SearchSelect name="interiorColor" value={searchData.interiorColor} onChange={handleInputChange}>
                <option value="">Всички</option>
                {interiorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Материал на интериора</label>
              <SearchSelect name="interiorMaterial" value={searchData.interiorMaterial} onChange={handleInputChange}>
                <option value="">Всички</option>
                {interiorMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Еърбегове</label>
              <SearchSelect name="airbags" value={searchData.airbags} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="driver">Еърбег за шофьора</option>
                <option value="front">Предни еърбегове</option>
                <option value="frontside">Предни и странични еърбегове</option>
                <option value="frontsidemore">Предни, странични и още</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Климатик</label>
              <SearchSelect name="airConditioning" value={searchData.airConditioning} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="no">Без климатик</option>
                <option value="manual">Ръчен или автоматичен климатик</option>
                <option value="auto">Автоматичен климатик</option>
                <option value="auto2">Автоматичен климатик, 2 зони</option>
                <option value="auto3">Автоматичен климатик, 3 зони</option>
                <option value="auto4">Автоматичен климатик, 4 зони</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Екстри</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="alarm" />
                  Аларма
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="ambient" />
                  Амбиентно осветление
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="android" />
                  Android Auto
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="apple" />
                  Apple CarPlay
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="armrest" />
                  Подлакътник
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="autoMirror" />
                  Автоматично затъмняващо се огледало
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="auxHeating" />
                  Допълнително отопление
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="bluetooth" />
                  Bluetooth
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="cargoBarrier" />
                  Преграда за багаж
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="cdPlayer" />
                  CD плейър
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="dab" />
                  DAB радио
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="digitalCockpit" />
                  Дигитален кокпит
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="disabled" />
                  За инвалиди
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricBackseat" />
                  Електрически задни седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricSeats" />
                  Електрически седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricSeatsMemory" />
                  Електрически седалки с памет
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricWindows" />
                  Електрически прозорци
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="emergencyCall" />
                  Система за спешни повиквания
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="fatigueWarning" />
                  Предупреждение за умора
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="foldingSeats" />
                  Сгъваеми задни седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="foldingMirrors" />
                  Сгъваеми огледала
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="handsfree" />
                  Hands-free система
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="headup" />
                  Head-up дисплей
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="heatedRearSeats" />
                  Отопляеми задни седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="heatedSeats" />
                  Отопляеми седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="heatedSteering" />
                  Отопляем волан
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="inductionCharging" />
                  Безжично зареждане
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="integratedStreaming" />
                  Интегрирано музикално стрийминг
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="isofix" />
                  Isofix
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="leatherSteering" />
                  Кожен волан
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="lumbarSupport" />
                  Лумбална опора
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="massageSeats" />
                  Масажни седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="multifunctionSteering" />
                  Мултифункционален волан
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="navigation" />
                  Навигация
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="onboardComputer" />
                  Бордов компютър
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="paddleShifters" />
                  Paddle shifters
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="passengerIsofix" />
                  Isofix за пътник
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="seatVentilation" />
                  Вентилация на седалките
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="showRightHand" />
                  Дясно кормило
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="skiBag" />
                  Ски чанта
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="smokerPackage" />
                  Пакет за пушачи
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="soundSystem" />
                  Аудио система
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="sportSeats" />
                  Спортни седалки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="touchscreen" />
                  Тъчскрийн
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="tunerRadio" />
                  Тунер/радио
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="tv" />
                  TV
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="usb" />
                  USB порт
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="virtualMirrors" />
                  Виртуални огледала
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="voiceControl" />
                  Гласов контрол
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="winterPackage" />
                  Зимен пакет
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="wlan" />
                  WLAN/WiFi hotspot
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>
          </FormGrid>

          {/* Offer Details */}
          <SectionTitle>Детайли на офертата</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>Продавач</label>
              <SearchSelect name="seller" value={searchData.seller} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="dealer">Дилър</option>
                <option value="private">Частно лице</option>
                <option value="company">Фирма</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Рейтинг на дилъра</label>
              <SearchSelect name="dealerRating" value={searchData.dealerRating} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="3stars">от 3 звезди</option>
                <option value="4stars">от 4 звезди</option>
                <option value="5stars">от 5 звезди</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Обявата онлайн от</label>
              <SearchSelect name="adOnlineSince" value={searchData.adOnlineSince} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="1day">1 ден</option>
                <option value="3days">3 дни</option>
                <option value="7days">7 дни</option>
                <option value="14days">14 дни</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Специални опции</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="adsWithPictures"
                    checked={searchData.adsWithPictures}
                    onChange={(e) => setSearchData(prev => ({ ...prev, adsWithPictures: e.target.checked }))}
                  />
                  Обяви със снимки
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="adsWithVideo"
                    checked={searchData.adsWithVideo}
                    onChange={(e) => setSearchData(prev => ({ ...prev, adsWithVideo: e.target.checked }))}
                  />
                  Обяви с видео
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="discountOffers"
                    checked={searchData.discountOffers}
                    onChange={(e) => setSearchData(prev => ({ ...prev, discountOffers: e.target.checked }))}
                  />
                  Оферти с отстъпка
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="nonSmokerVehicle"
                    checked={searchData.nonSmokerVehicle}
                    onChange={(e) => setSearchData(prev => ({ ...prev, nonSmokerVehicle: e.target.checked }))}
                  />
                  Непушачески автомобил
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="taxi"
                    checked={searchData.taxi}
                    onChange={(e) => setSearchData(prev => ({ ...prev, taxi: e.target.checked }))}
                  />
                  Такси
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="vatReclaimable"
                    checked={searchData.vatReclaimable}
                    onChange={(e) => setSearchData(prev => ({ ...prev, vatReclaimable: e.target.checked }))}
                  />
                  ДДС възстановим
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="warranty"
                    checked={searchData.warranty}
                    onChange={(e) => setSearchData(prev => ({ ...prev, warranty: e.target.checked }))}
                  />
                  Гаранция
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <label>Повредени автомобили</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="damagedVehicles"
                    checked={searchData.damagedVehicles}
                    onChange={(e) => setSearchData(prev => ({ ...prev, damagedVehicles: e.target.checked }))}
                  />
                  Не показвай
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <label>Търговски, експорт/импорт</label>
              <SearchSelect name="commercialExport" value={searchData.commercialExport} onChange={handleInputChange}>
                <option value="">Всички</option>
                <option value="commercial">Търговски</option>
                <option value="export">Експорт</option>
                <option value="import">Импорт</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Програма за одобрени употребявани автомобили</label>
              <SearchSelect name="approvedUsedProgramme" value={searchData.approvedUsedProgramme} onChange={handleInputChange}>
                <option value="">Избери</option>
                <option value="yes">Да</option>
                <option value="no">Не</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>

          {/* Location */}
          <SectionTitle>Местоположение</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>Държава</label>
              <SearchSelect name="country" value={searchData.country} onChange={handleInputChange}>
                <option value="">Всички</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Град / пощенски код</label>
              <SearchSelect name="city" value={searchData.city} onChange={handleInputChange}>
                <option value="">Всички</option>
                {bulgarianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Радиус</label>
              <SearchSelect name="radius" value={searchData.radius} onChange={handleInputChange}>
                {radiusOptions.map(radius => (
                  <option key={radius} value={radius}>{radius}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>Оферти за доставка</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="deliveryOffers"
                    checked={searchData.deliveryOffers}
                    onChange={(e) => setSearchData(prev => ({ ...prev, deliveryOffers: e.target.checked }))}
                  />
                  Покажи само оферти с доставка
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>
          </FormGrid>

          {/* Search Description */}
          <SectionTitle>Търсене в описание на автомобила</SectionTitle>
          <FormGrid>
            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <label>например: drive mode switch, LTE, thermal glazing …</label>
              <SearchInput
                type="text"
                name="searchDescription"
                value={searchData.searchDescription}
                onChange={handleInputChange}
                placeholder="Въведете ключови думи за търсене в описанието"
              />
            </FormGroup>
          </FormGrid>

          {/* Action Buttons */}
          <ActionSection>
            <ResetButton type="button" onClick={handleReset}>
              Нулирай филтрите
            </ResetButton>
            <SearchButton type="submit" disabled={isSearching}>
              {isSearching ? 'Търсене...' : 'Търси коли'}
            </SearchButton>
          </ActionSection>
        </SearchForm>

        {/* Results Summary Placeholder */}
        <ResultsSummary>
          <h4>Резултати от търсенето</h4>
          <p>Приложете филтрите по-горе за да видите наличните коли</p>
        </ResultsSummary>
      </Container>
    </SearchContainer>
  );
};

export default AdvancedSearchPage;