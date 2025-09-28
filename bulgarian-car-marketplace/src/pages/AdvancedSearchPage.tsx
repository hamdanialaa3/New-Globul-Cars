// src/pages/AdvancedSearchPage.tsx
// Advanced Search Page for Bulgarian Car Marketplace
// Inspired by mobile.de advanced search functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();
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
    t('advancedSearch.gasolineFuel'), t('advancedSearch.dieselFuel'), t('advancedSearch.electricFuel'), t('advancedSearch.ethanolFuel'),
    t('advancedSearch.hybridDieselElectric'), t('advancedSearch.hybridGasolineElectric'),
    t('advancedSearch.hydrogenFuel'), t('advancedSearch.lpgFuel'), t('advancedSearch.naturalGasFuel'), t('advancedSearch.otherFuel'), t('advancedSearch.pluginHybridFuel')
  ];

  const exteriorColors = [
    t('advancedSearch.black'), t('advancedSearch.beige'), t('advancedSearch.gray'), t('advancedSearch.brown'), t('advancedSearch.white'), t('advancedSearch.orange'), t('advancedSearch.blue'), t('advancedSearch.yellow'), t('advancedSearch.red'), t('advancedSearch.green'),
    t('advancedSearch.silver'), t('advancedSearch.gold'), t('advancedSearch.purple'), t('advancedSearch.matte'), t('advancedSearch.metallic')
  ];

  const interiorColors = [t('advancedSearch.interiorBeige'), t('advancedSearch.interiorBlack'), t('advancedSearch.interiorBlue'), t('advancedSearch.interiorBrown'), t('advancedSearch.interiorGray'), t('advancedSearch.interiorRed'), t('advancedSearch.interiorOther')];

  const interiorMaterials = [t('advancedSearch.alcantara'), t('advancedSearch.fabric'), t('advancedSearch.artificialLeather'), t('advancedSearch.partialLeather'), t('advancedSearch.fullLeather'), t('advancedSearch.velour'), t('advancedSearch.materialOther')];

  const countries = [t('advancedSearch.bulgaria'), t('advancedSearch.germany'), t('advancedSearch.austria'), t('advancedSearch.switzerland'), t('advancedSearch.countryOther')];

  const bulgarianCities = [
    t('advancedSearch.sofia'), t('advancedSearch.plovdiv'), t('advancedSearch.varna'), t('advancedSearch.burgas'), t('advancedSearch.ruse'), t('advancedSearch.staraZagora'),
    t('advancedSearch.pleven'), t('advancedSearch.dobrich'), t('advancedSearch.sliven'), t('advancedSearch.shumen'), t('advancedSearch.pernik'), t('advancedSearch.haskovo')
  ];

  const radiusOptions = ['10 km', '25 km', '50 km', '100 km', '200 km'];

  return (
    <SearchContainer>
      <Container>
        {/* Header */}
        <HeaderSection>
          <h1>{t('advancedSearch.title')}</h1>
          <p>{t('advancedSearch.subtitle')}</p>
        </HeaderSection>

        {/* Search Form */}
        <SearchForm onSubmit={handleSearch}>
          {/* Basic Data */}
          <SectionTitle>{t('advancedSearch.basicData')}</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.make')}</label>
              <SearchSelect name="make" value={searchData.make} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {carMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.model')}</label>
              <SearchInput
                type="text"
                name="model"
                value={searchData.model}
                onChange={handleInputChange}
                placeholder={t('advancedSearch.modelPlaceholder')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.vehicleType')}</label>
              <SearchSelect name="vehicleType" value={searchData.vehicleType} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="cabriolet">{t('advancedSearch.cabriolet')}</option>
                <option value="estate">{t('advancedSearch.estate')}</option>
                <option value="offroad">{t('advancedSearch.offroad')}</option>
                <option value="saloon">{t('advancedSearch.saloon')}</option>
                <option value="small">{t('advancedSearch.small')}</option>
                <option value="sports">{t('advancedSearch.sports')}</option>
                <option value="van">{t('advancedSearch.van')}</option>
                <option value="other">{t('advancedSearch.other')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfSeats')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="seatsFrom"
                  value={searchData.seatsFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="seatsTo"
                  value={searchData.seatsTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfDoors')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="doorsFrom"
                  value={searchData.doorsFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="doorsTo"
                  value={searchData.doorsTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.slidingDoor')}</label>
              <SearchSelect name="slidingDoor" value={searchData.slidingDoor} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.typeAndCondition')}</label>
              <SearchSelect name="condition" value={searchData.condition} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="new">{t('advancedSearch.newCondition')}</option>
                <option value="used">{t('advancedSearch.usedCondition')}</option>
                <option value="pre-registration">{t('advancedSearch.preRegistrationCondition')}</option>
                <option value="employee">{t('advancedSearch.employeeCondition')}</option>
                <option value="classic">{t('advancedSearch.classicCondition')}</option>
                <option value="demonstration">{t('advancedSearch.demonstrationCondition')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.paymentType')}</label>
              <SearchSelect name="paymentType" value={searchData.paymentType} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="buy">{t('advancedSearch.purchaseOption')}</option>
                <option value="leasing">{t('advancedSearch.leasingOption')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.price')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="priceFrom"
                  value={searchData.priceFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                />
                <span>€</span>
                <SearchInput
                  type="number"
                  name="priceTo"
                  value={searchData.priceTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.firstRegistration')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="firstRegistrationFrom"
                  value={searchData.firstRegistrationFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                  min="1950"
                  max="2025"
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="firstRegistrationTo"
                  value={searchData.firstRegistrationTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                  min="1950"
                  max="2025"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.mileage')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="mileageFrom"
                  value={searchData.mileageFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                />
                <span>km</span>
                <SearchInput
                  type="number"
                  name="mileageTo"
                  value={searchData.mileageTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.huValidUntil')}</label>
              <SearchInput
                type="number"
                name="huValid"
                value={searchData.huValid}
                onChange={handleInputChange}
                placeholder={t('advancedSearch.exampleYear')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfOwners')}</label>
              <SearchSelect name="ownersCount" value={searchData.ownersCount} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.fullServiceHistory')}</label>
              <SearchSelect name="serviceHistory" value={searchData.serviceHistory} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="yes">{t('advancedSearch.yesOption')}</option>
                <option value="no">{t('advancedSearch.noOption')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.roadworthy')}</label>
              <SearchSelect name="roadworthy" value={searchData.roadworthy} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="yes">{t('advancedSearch.yesOption')}</option>
                <option value="no">{t('advancedSearch.noOption')}</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>

          {/* Technical Data */}
          <SectionTitle>{t('advancedSearch.technicalData')}</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.fuelType')}</label>
              <SearchSelect name="fuelType" value={searchData.fuelType} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.power')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="powerFrom"
                  value={searchData.powerFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                />
                <span>hp</span>
                <SearchInput
                  type="number"
                  name="powerTo"
                  value={searchData.powerTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.cubicCapacity')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="cubicCapacityFrom"
                  value={searchData.cubicCapacityFrom}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                />
                <span>ccm</span>
                <SearchInput
                  type="number"
                  name="cubicCapacityTo"
                  value={searchData.cubicCapacityTo}
                  onChange={handleInputChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>
          </FormGrid>

          {/* Exterior */}
          <SectionTitle>{t('advancedSearch.exterior')}</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.exteriorColour')}</label>
              <SearchSelect name="exteriorColor" value={searchData.exteriorColor} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                {exteriorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.trailerCoupling')}</label>
              <SearchSelect name="trailerCoupling" value={searchData.trailerCoupling} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="fixed">Фиксиран, detachable или swiveling</option>
                <option value="detachable">Detachable или swiveling</option>
                <option value="swiveling">Swiveling</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.trailerLoadBraked')}</label>
              <SearchInput
                type="number"
                name="trailerLoadBraked"
                value={searchData.trailerLoadBraked}
                onChange={handleInputChange}
                placeholder={t('advancedSearch.fromPlaceholder')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.trailerLoadUnbraked')}</label>
              <SearchInput
                type="number"
                name="trailerLoadUnbraked"
                value={searchData.trailerLoadUnbraked}
                onChange={handleInputChange}
                placeholder={t('advancedSearch.fromPlaceholder')}
              />
            </FormGroup>

            <FormGroup>
              <label>Nose Weight</label>
              <SearchInput
                type="number"
                name="noseWeight"
                value={searchData.noseWeight}
                onChange={handleInputChange}
                placeholder={t('advancedSearch.fromPlaceholder')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.parkingSensors')}</label>
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
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="cruise">Круиз контрол</option>
                <option value="adaptive">Adaptive Cruise Control</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>

          {/* Interior */}
          <SectionTitle>{t('advancedSearch.interior')}</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.interiorColour')}</label>
              <SearchSelect name="interiorColor" value={searchData.interiorColor} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                {interiorColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.interiorMaterial')}</label>
              <SearchSelect name="interiorMaterial" value={searchData.interiorMaterial} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                {interiorMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.airbags')}</label>
              <SearchSelect name="airbags" value={searchData.airbags} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="driver">Еърбег за шофьора</option>
                <option value="front">Предни еърбегове</option>
                <option value="frontside">Предни и странични еърбегове</option>
                <option value="frontsidemore">Предни, странични и още</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.airConditioning')}</label>
              <SearchSelect name="airConditioning" value={searchData.airConditioning} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="no">Без климатик</option>
                <option value="manual">Ръчен или автоматичен климатик</option>
                <option value="auto">Автоматичен климатик</option>
                <option value="auto2">Автоматичен климатик, 2 зони</option>
                <option value="auto3">Автоматичен климатик, 3 зони</option>
                <option value="auto4">Автоматичен климатик, 4 зони</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.extras')}</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="alarm" />
                  {t('advancedSearch.alarm')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="ambient" />
                  {t('advancedSearch.ambientLighting')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="android" />
                  {t('advancedSearch.androidAuto')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="apple" />
                  {t('advancedSearch.appleCarPlay')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="armrest" />
                  {t('advancedSearch.armrest')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="autoMirror" />
                  {t('advancedSearch.autoTintedMirror')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="auxHeating" />
                  {t('advancedSearch.additionalHeating')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="bluetooth" />
                  {t('advancedSearch.bluetooth')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="cargoBarrier" />
                  {t('advancedSearch.cargoBarrier')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="cdPlayer" />
                  {t('advancedSearch.cdPlayer')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="dab" />
                  {t('advancedSearch.dabRadio')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="digitalCockpit" />
                  {t('advancedSearch.digitalCockpit')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="disabled" />
                  {t('advancedSearch.disabledAccess')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricBackseat" />
                  {t('advancedSearch.electricRearSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricSeats" />
                  {t('advancedSearch.electricSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricSeatsMemory" />
                  {t('advancedSearch.electricSeatsMemory')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="electricWindows" />
                  {t('advancedSearch.electricWindows')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="emergencyCall" />
                  {t('advancedSearch.emergencyCallSystem')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="fatigueWarning" />
                  {t('advancedSearch.fatigueWarning')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="foldingSeats" />
                  {t('advancedSearch.foldingRearSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="foldingMirrors" />
                  {t('advancedSearch.foldingMirrors')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="handsfree" />
                  {t('advancedSearch.handsFreeSystem')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="headup" />
                  {t('advancedSearch.headUpDisplay')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="heatedRearSeats" />
                  {t('advancedSearch.heatedRearSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="heatedSeats" />
                  {t('advancedSearch.heatedSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="heatedSteering" />
                  {t('advancedSearch.heatedSteeringWheel')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="inductionCharging" />
                  {t('advancedSearch.wirelessCharging')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="integratedStreaming" />
                  {t('advancedSearch.integratedMusicStreaming')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="isofix" />
                  {t('advancedSearch.isofix')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="leatherSteering" />
                  {t('advancedSearch.leatherSteeringWheel')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="lumbarSupport" />
                  {t('advancedSearch.lumbarSupport')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="massageSeats" />
                  {t('advancedSearch.massageSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="multifunctionSteering" />
                  {t('advancedSearch.multifunctionalSteeringWheel')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="navigation" />
                  {t('advancedSearch.navigation')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="onboardComputer" />
                  {t('advancedSearch.onBoardComputer')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="paddleShifters" />
                  {t('advancedSearch.paddleShifters')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="passengerIsofix" />
                  {t('advancedSearch.passengerIsofix')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="seatVentilation" />
                  {t('advancedSearch.seatVentilation')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="showRightHand" />
                  {t('advancedSearch.rightHandDrive')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="skiBag" />
                  {t('advancedSearch.skiBag')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="smokerPackage" />
                  {t('advancedSearch.smokersPackage')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="soundSystem" />
                  {t('advancedSearch.audioSystem')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="sportSeats" />
                  {t('advancedSearch.sportsSeats')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="touchscreen" />
                  {t('advancedSearch.touchscreen')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="tunerRadio" />
                  {t('advancedSearch.tunerRadio')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="tv" />
                  {t('advancedSearch.tv')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="usb" />
                  {t('advancedSearch.usbPort')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="virtualMirrors" />
                  {t('advancedSearch.virtualMirrors')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="voiceControl" />
                  {t('advancedSearch.voiceControl')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="winterPackage" />
                  {t('advancedSearch.winterPackage')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input type="checkbox" name="extras" value="wlan" />
                  {t('advancedSearch.wlanWifiHotspot')}
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>
          </FormGrid>

          {/* Offer Details */}
          <SectionTitle>{t('advancedSearch.offerDetails')}</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.seller')}</label>
              <SearchSelect name="seller" value={searchData.seller} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="dealer">Дилър</option>
                <option value="private">Частно лице</option>
                <option value="company">Фирма</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.dealerRating')}</label>
              <SearchSelect name="dealerRating" value={searchData.dealerRating} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="3stars">от 3 звезди</option>
                <option value="4stars">от 4 звезди</option>
                <option value="5stars">от 5 звезди</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.listingOnlineSince')}</label>
              <SearchSelect name="adOnlineSince" value={searchData.adOnlineSince} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="1day">1 ден</option>
                <option value="3days">3 дни</option>
                <option value="7days">7 дни</option>
                <option value="14days">14 дни</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>                  {t('advancedSearch.specialOptions')}</label>
              <CheckboxGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="adsWithPictures"
                    checked={searchData.adsWithPictures}
                    onChange={(e) => setSearchData(prev => ({ ...prev, adsWithPictures: e.target.checked }))}
                  />
                  {t('advancedSearch.listingsWithPhotos')}
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="adsWithVideo"
                    checked={searchData.adsWithVideo}
                    onChange={(e) => setSearchData(prev => ({ ...prev, adsWithVideo: e.target.checked }))}
                  />
                  {t('advancedSearch.listingsWithVideo')}
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
                <option value="">{t('advancedSearch.allOptions')}</option>
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
          <SectionTitle>{t('advancedSearch.location')}</SectionTitle>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.country')}</label>
              <SearchSelect name="country" value={searchData.country} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.cityZipCode')}</label>
              <SearchSelect name="city" value={searchData.city} onChange={handleInputChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                {bulgarianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.radius')}</label>
              <SearchSelect name="radius" value={searchData.radius} onChange={handleInputChange}>
                {radiusOptions.map(radius => (
                  <option key={radius} value={radius}>{radius}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.deliveryOffers')}</label>
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
          <SectionTitle>{t('advancedSearch.searchInDescription')}</SectionTitle>
          <FormGrid>
            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <label>{t('advancedSearch.descriptionPlaceholder')}</label>
              <SearchInput
                type="text"
                name="searchDescription"
                value={searchData.searchDescription}
                onChange={handleInputChange}
                placeholder={t('advancedSearch.enterKeywords')}
              />
            </FormGroup>
          </FormGrid>

          {/* Action Buttons */}
          <ActionSection>
            <ResetButton type="button" onClick={handleReset}>
              {t('advancedSearch.resetFilters')}
            </ResetButton>
            <SearchButton type="submit" disabled={isSearching}>
              {isSearching ? t('advancedSearch.searching') : t('advancedSearch.searchCars')}
            </SearchButton>
          </ActionSection>
        </SearchForm>

        {/* Results Summary Placeholder */}
        <ResultsSummary>
          <h4>{t('advancedSearch.searchResults')}</h4>
          <p>{t('advancedSearch.applyFiltersAbove')}</p>
        </ResultsSummary>
      </Container>
    </SearchContainer>
  );
};

export default AdvancedSearchPage;
