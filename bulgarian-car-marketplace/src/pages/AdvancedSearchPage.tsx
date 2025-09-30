// src/pages/AdvancedSearchPage.tsx
// Advanced Search Page for Bulgarian Car Marketplace
// Inspired by mobile.de advanced search functionality

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';

// Mobile.de Exact Colors - Professional Design System
const colors = {
  primary: {
    orange: '#FF7900',      // Mobile.de main orange
    orangeHover: '#E86900', // Orange hover state
    orangeLight: '#FFF4ED', // Light orange background
    blue: '#0066CC',        // Mobile.de blue
    blueHover: '#0052A3',   // Blue hover state
  },
  neutral: {
    white: '#FFFFFF',
    grayBg: '#F8F9FA',      // Main background
    grayLight: '#F1F3F4',   // Light gray
    grayBorder: '#E1E5E9',  // Border color
    grayText: '#5F6368',    // Secondary text
    grayDark: '#3C4043',    // Primary text
    black: '#000000',
  },
  text: {
    primary: '#202124',     // Main text color
    secondary: '#5F6368',   // Secondary text
    link: '#1A73E8',        // Link color
  }
};



// Mobile.de Exact Layout Container
const SearchContainer = styled.div`
  min-height: 100vh;
  background: ${colors.neutral.grayBg};
  padding: 24px 0;
  direction: ltr;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  direction: ltr;
`;

// Mobile.de Header Style - Simple and Clean
const HeaderSection = styled.div`
  margin-bottom: 24px;
  text-align: left;

  h1 {
    font-size: 28px;
    font-weight: 400;
    color: ${colors.text.primary};
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  p {
    font-size: 14px;
    color: ${colors.text.secondary};
    margin: 0;
    line-height: 1.4;
  }
`;

// Mobile.de Form Container - Exact Style with Sections
const SearchForm = styled.form`
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden;
`;

// Section Card - Mobile.de Style
const SectionCard = styled.div`
  border-bottom: 1px solid ${colors.neutral.grayBorder};
  
  &:last-child {
    border-bottom: none;
  }
`;

// Section Header - Clickable Mobile.de Style
const SectionHeader = styled.div<{ isOpen: boolean }>`
  background: ${props => props.isOpen ? colors.neutral.grayLight : colors.neutral.white};
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${colors.neutral.grayLight};
  }
`;

// Section Content - Expandable
const SectionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: ${colors.neutral.white};
`;

// Section Body - Padding for content
const SectionBody = styled.div`
  padding: 20px;
`;

// Mobile.de Section Title Style
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.text.primary};
  margin: 0;
  padding: 0;
  border: none;
`;

// Expand/Collapse Icon
const ExpandIcon = styled.span<{ isOpen: boolean }>`
  font-size: 14px;
  color: ${colors.text.secondary};
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  &::before {
    content: '▼';
  }
`;

// Mobile.de Grid Layout - Multi-column like original
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Mobile.de Form Group Style
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-weight: 400;
    color: ${colors.text.primary};
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`;

// Mobile.de Input Style - Exact Match
const SearchInput = styled.input`
  padding: 12px 16px;
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  transition: border-color 0.2s ease;
  height: 44px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.blue};
  }

  &:hover {
    border-color: ${colors.primary.blue};
  }
`;

// Mobile.de Select Style - Exact Match
const SearchSelect = styled.select`
  padding: 12px 16px;
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.text.primary};
  cursor: pointer;
  transition: border-color 0.2s ease;
  height: 44px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  option {
    background: ${colors.neutral.white};
    color: ${colors.text.primary};
    padding: 8px 16px;
    font-size: 14px;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.blue};
  }

  &:hover {
    border-color: ${colors.primary.blue};
  }
`;

// Mobile.de Checkbox Group Style
const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${colors.text.primary};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1.4;
  white-space: nowrap;
  user-select: none;

  &:hover {
    background: rgba(0, 102, 204, 0.05);
  }

  /* Hide the default checkbox */
  input[type="checkbox"] {
    display: none;
  }
`;

// Custom circular checkbox style
const CustomCheckbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.checked ? '#10B981' : 'rgba(239, 68, 68, 0.3)'};
  background: ${props => props.checked ? '#10B981' : 'rgba(239, 68, 68, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;

  /* Checkmark icon */
  &::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
    opacity: ${props => props.checked ? 1 : 0};
    transform: ${props => props.checked ? 'scale(1)' : 'scale(0.3)'};
    transition: all 0.2s ease;
  }

  /* Hover effect */
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

// Mobile.de Range Input Group Style
const RangeGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;

  span {
    color: ${colors.text.secondary};
    font-size: 14px;
    white-space: nowrap;
    padding: 0 4px;
  }

  input {
    flex: 1;
  }
`;

// Mobile.de Action Section - Horizontal Layout
const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${colors.neutral.grayBorder};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchButton = styled.button`
  padding: 12px 32px;
  background: ${colors.primary.orange};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: 44px;
  min-width: 120px;

  &:hover {
    background: ${colors.primary.orangeHover};
  }

  &:active {
    background: ${colors.primary.orangeHover};
  }

  &:disabled {
    background: ${colors.neutral.grayBorder};
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  padding: 12px 24px;
  background: ${colors.neutral.white};
  color: ${colors.text.secondary};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 4px;
  font-weight: 400;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 44px;
  min-width: 100px;

  &:hover {
    background: ${colors.neutral.grayLight};
    border-color: ${colors.primary.blue};
  }
`;

// Results Summary - Clean White Card
const ResultsSummary = styled.div`
  background: ${colors.neutral.white};
  border: 1px solid ${colors.neutral.grayBorder};
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: left; /* Left align content */
  direction: ltr; /* Left-to-right direction */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);


  h4 {
    color: ${colors.primary.blue};
    font-size: 1.3rem;
    margin-bottom: 1rem;
    text-align: left; /* Left align heading */
    direction: ltr; /* Left-to-right direction */
  }

  p {
    color: ${colors.text.secondary};
    font-size: 1rem;
    text-align: left; /* Left align paragraph */
    direction: ltr; /* Left-to-right direction */
  }
`;

// Search Data Interface
interface SearchData {
  // Basic Data
  make: string;
  model: string;
  vehicleType: string;
  seatsFrom: string;
  seatsTo: string;
  doorsFrom: string;
  doorsTo: string;
  slidingDoor: string;
  condition: string;
  paymentType: string;
  priceFrom: string;
  priceTo: string;
  firstRegistrationFrom: string;
  firstRegistrationTo: string;
  mileageFrom: string;
  mileageTo: string;
  huValid: string;
  ownersCount: string;
  serviceHistory: string;
  roadworthy: string;
  // Technical Data
  fuelType: string;
  powerFrom: string;
  powerTo: string;
  cubicCapacityFrom: string;
  cubicCapacityTo: string;
  fuelTankVolumeFrom: string;
  fuelTankVolumeTo: string;
  weightFrom: string;
  weightTo: string;
  cylindersFrom: string;
  cylindersTo: string;
  driveType: string;
  transmission: string;
  fuelConsumptionUpTo: string;
  emissionSticker: string;
  emissionClass: string;
  particulateFilter: string;
  // Exterior
  exteriorColor: string;
  trailerCoupling: string;
  trailerLoadBraked: string;
  trailerLoadUnbraked: string;
  noseWeight: string;
  parkingSensors: string[];
  cruiseControl: string;
  // Interior
  interiorColor: string;
  interiorMaterial: string;
  airbags: string;
  airConditioning: string;
  extras: string[];
  // Offer Details
  seller: string;
  dealerRating: string;
  adOnlineSince: string;
  adsWithPictures: boolean;
  adsWithVideo: boolean;
  discountOffers: boolean;
  nonSmokerVehicle: boolean;
  taxi: boolean;
  vatReclaimable: boolean;
  warranty: boolean;
  damagedVehicles: boolean;
  commercialExport: string;
  approvedUsedProgramme: string;
  // Location
  country: string;
  city: string;
  radius: string;
  deliveryOffers: boolean;
  // Search
  searchDescription: string;
}

// Main Component
const AdvancedSearchPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Search Form State
  const [searchData, setSearchData] = useState<SearchData>({
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

  // Section collapse/expand state - Mobile.de style sections
  const [sectionsOpen, setSectionsOpen] = useState({
    basicData: true,
    technicalData: false,
    exterior: false,
    interior: false,
    offerDetails: false,
    location: false,
    searchDescription: false
  });

  // Toggle section visibility
  const toggleSection = (sectionName: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Handle checkbox (circular) toggle
  const handleCheckboxToggle = (fieldName: string, value: string) => {
    setSearchData(prev => {
      const currentArray = prev[fieldName as keyof typeof prev] as string[];
      const isChecked = currentArray.includes(value);
      
      if (isChecked) {
        // Remove from array
        return {
          ...prev,
          [fieldName]: currentArray.filter(item => item !== value)
        };
      } else {
        // Add to array
        return {
          ...prev,
          [fieldName]: [...currentArray, value]
        };
      }
    });
  };

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
          {/* Basic Data Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.basicData}
              onClick={() => toggleSection('basicData')}
            >
              <SectionTitle>{t('advancedSearch.basicData')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.basicData} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.basicData}>
              <SectionBody>
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Technical Data Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.technicalData}
              onClick={() => toggleSection('technicalData')}
            >
              <SectionTitle>{t('advancedSearch.technicalData')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.technicalData} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.technicalData}>
              <SectionBody>
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Exterior Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.exterior}
              onClick={() => toggleSection('exterior')}
            >
              <SectionTitle>{t('advancedSearch.exterior')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.exterior} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.exterior}>
              <SectionBody>
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
                <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', '360camera')}>
                  <CustomCheckbox checked={searchData.parkingSensors.includes('360camera')} />
                  360° Camera
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'camera')}>
                  <CustomCheckbox checked={searchData.parkingSensors.includes('camera')} />
                  Camera
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'front')}>
                  <CustomCheckbox checked={searchData.parkingSensors.includes('front')} />
                  Front
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'rear')}>
                  <CustomCheckbox checked={searchData.parkingSensors.includes('rear')} />
                  Rear
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'reartraffic')}>
                  <CustomCheckbox checked={searchData.parkingSensors.includes('reartraffic')} />
                  Rear traffic alert
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('parkingSensors', 'selfsteering')}>
                  <CustomCheckbox checked={searchData.parkingSensors.includes('selfsteering')} />
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Interior Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.interior}
              onClick={() => toggleSection('interior')}
            >
              <SectionTitle>{t('advancedSearch.interior')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.interior} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.interior}>
              <SectionBody>
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
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'disabled')}>
                  <CustomCheckbox checked={searchData.extras.includes('disabled')} />
                  {t('advancedSearch.disabledAccess')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'electricBackseat')}>
                  <CustomCheckbox checked={searchData.extras.includes('electricBackseat')} />
                  {t('advancedSearch.electricRearSeats')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'electricSeats')}>
                  <CustomCheckbox checked={searchData.extras.includes('electricSeats')} />
                  {t('advancedSearch.electricSeats')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'electricSeatsMemory')}>
                  <CustomCheckbox checked={searchData.extras.includes('electricSeatsMemory')} />
                  {t('advancedSearch.electricSeatsMemory')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'electricWindows')}>
                  <CustomCheckbox checked={searchData.extras.includes('electricWindows')} />
                  {t('advancedSearch.electricWindows')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'emergencyCall')}>
                  <CustomCheckbox checked={searchData.extras.includes('emergencyCall')} />
                  {t('advancedSearch.emergencyCallSystem')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'fatigueWarning')}>
                  <CustomCheckbox checked={searchData.extras.includes('fatigueWarning')} />
                  {t('advancedSearch.fatigueWarning')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'foldingSeats')}>
                  <CustomCheckbox checked={searchData.extras.includes('foldingSeats')} />
                  {t('advancedSearch.foldingRearSeats')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'foldingMirrors')}>
                  <CustomCheckbox checked={searchData.extras.includes('foldingMirrors')} />
                  {t('advancedSearch.foldingMirrors')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'handsfree')}>
                  <CustomCheckbox checked={searchData.extras.includes('handsfree')} />
                  {t('advancedSearch.handsFreeSystem')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'headup')}>
                  <CustomCheckbox checked={searchData.extras.includes('headup')} />
                  {t('advancedSearch.headUpDisplay')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'heatedRearSeats')}>
                  <CustomCheckbox checked={searchData.extras.includes('heatedRearSeats')} />
                  {t('advancedSearch.heatedRearSeats')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'heatedSeats')}>
                  <CustomCheckbox checked={searchData.extras.includes('heatedSeats')} />
                  {t('advancedSearch.heatedSeats')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'heatedSteering')}>
                  <CustomCheckbox checked={searchData.extras.includes('heatedSteering')} />
                  {t('advancedSearch.heatedSteeringWheel')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'inductionCharging')}>
                  <CustomCheckbox checked={searchData.extras.includes('inductionCharging')} />
                  {t('advancedSearch.wirelessCharging')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'integratedStreaming')}>
                  <CustomCheckbox checked={searchData.extras.includes('integratedStreaming')} />
                  {t('advancedSearch.integratedMusicStreaming')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'isofix')}>
                  <CustomCheckbox checked={searchData.extras.includes('isofix')} />
                  {t('advancedSearch.isofix')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'leatherSteering')}>
                  <CustomCheckbox checked={searchData.extras.includes('leatherSteering')} />
                  {t('advancedSearch.leatherSteeringWheel')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'lumbarSupport')}>
                  <CustomCheckbox checked={searchData.extras.includes('lumbarSupport')} />
                  {t('advancedSearch.lumbarSupport')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'massageSeats')}>
                  <CustomCheckbox checked={searchData.extras.includes('massageSeats')} />
                  {t('advancedSearch.massageSeats')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'multifunctionSteering')}>
                  <CustomCheckbox checked={searchData.extras.includes('multifunctionSteering')} />
                  {t('advancedSearch.multifunctionalSteeringWheel')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'navigation')}>
                  <CustomCheckbox checked={searchData.extras.includes('navigation')} />
                  {t('advancedSearch.navigation')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'onboardComputer')}>
                  <CustomCheckbox checked={searchData.extras.includes('onboardComputer')} />
                  {t('advancedSearch.onBoardComputer')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'paddleShifters')}>
                  <CustomCheckbox checked={searchData.extras.includes('paddleShifters')} />
                  {t('advancedSearch.paddleShifters')}
                </CheckboxLabel>
                <CheckboxLabel onClick={() => handleCheckboxToggle('extras', 'passengerIsofix')}>
                  <CustomCheckbox checked={searchData.extras.includes('passengerIsofix')} />
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Offer Details Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.offerDetails}
              onClick={() => toggleSection('offerDetails')}
            >
              <SectionTitle>{t('advancedSearch.offerDetails')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.offerDetails} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.offerDetails}>
              <SectionBody>
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Location Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.location}
              onClick={() => toggleSection('location')}
            >
              <SectionTitle>{t('advancedSearch.location')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.location} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.location}>
              <SectionBody>
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

          {/* Search Description Section */}
          <SectionCard>
            <SectionHeader 
              isOpen={sectionsOpen.searchDescription}
              onClick={() => toggleSection('searchDescription')}
            >
              <SectionTitle>{t('advancedSearch.searchInDescription')}</SectionTitle>
              <ExpandIcon isOpen={sectionsOpen.searchDescription} />
            </SectionHeader>
            <SectionContent isOpen={sectionsOpen.searchDescription}>
              <SectionBody>
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
              </SectionBody>
            </SectionContent>
          </SectionCard>

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
