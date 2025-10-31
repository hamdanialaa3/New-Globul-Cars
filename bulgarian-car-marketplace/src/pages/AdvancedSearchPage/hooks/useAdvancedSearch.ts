// src/pages/AdvancedSearchPage/hooks/useAdvancedSearch.ts
// Custom hook for Advanced Search Page state management

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { SearchData, SectionState, SectionName, SortOption, ViewMode, SearchResultsMeta } from '../types';
import { CarListing } from '../../../types/CarListing';
import algoliaSearchService from '../../../services/algoliaSearchService';

const createInitialSearchData = (): SearchData => ({
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
  // ✅ Equipment Arrays
  safetyEquipment: [],
  comfortEquipment: [],
  infotainmentEquipment: [],
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

const createInitialSectionState = (): SectionState => ({
  basicData: true,
  technicalData: false,
  exterior: false,
  interior: false,
  offerDetails: false,
  location: false,
  searchDescription: false
});

export const useAdvancedSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Search Form State
  const [searchData, setSearchData] = useState<SearchData>(createInitialSearchData());
  const [isSearching, setIsSearching] = useState(false);
  
  // Search Results State
  const [searchResults, setSearchResults] = useState<CarListing[]>([]);
  const [resultsMeta, setResultsMeta] = useState<SearchResultsMeta>({
    totalResults: 0,
    processingTime: 0,
    page: 0,
    totalPages: 0
  });

  // UI State
  const [sortBy, setSortBy] = useState<SortOption>('createdAt_desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Section collapse/expand state - Mobile.de style sections
  const [sectionsOpen, setSectionsOpen] = useState<SectionState>(createInitialSectionState());

  // Toggle section visibility
  const toggleSection = (sectionName: SectionName) => {
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setSearchData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle Form Submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      console.log('🔍 Starting Algolia search with filters:', searchData);
      
      // Use Algolia search service with sorting
      const response = await algoliaSearchService.searchCars(searchData, { 
        sortBy,
        page: 0,
        hitsPerPage: 100 
      });
      
      setSearchResults(response.cars);
      setResultsMeta({
        totalResults: response.totalResults,
        processingTime: response.processingTime,
        page: response.page,
        totalPages: response.totalPages
      });
      
      console.log(`✅ Algolia search completed: ${response.totalResults} cars found in ${response.processingTime}ms`);

      // Navigate to results page with search params
      const searchParams = new URLSearchParams();
      Object.entries(searchData).forEach(([key, value]) => {
        if (value && typeof value === 'string') searchParams.set(key, value);
        else if (typeof value === 'boolean' && value) searchParams.set(key, 'true');
        else if (Array.isArray(value) && value.length > 0) searchParams.set(key, value.join(','));
      });
      
      // Add sort parameter
      searchParams.set('sort', sortBy);

      navigate(`/cars?${searchParams.toString()}`);
    } catch (error) {
      console.error('❌ Algolia search error:', error);
      alert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setSearchData(createInitialSearchData());
  };

  // ✅ FIXED: Use popular brands (simpler and faster)
  const carMakes = [
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 
    'Ford', 'Opel', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Seat',
    'Škoda', 'Dacia', 'Suzuki', 'Mazda', 'Mitsubishi', 'Volvo', 'Lexus'
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

  return {
    // State
    searchData,
    isSearching,
    sectionsOpen,
    searchResults,
    resultsMeta,
    sortBy,
    viewMode,

    // Actions
    toggleSection,
    handleCheckboxToggle,
    handleInputChange,
    handleSearch,
    handleReset,
    setSortBy,
    setViewMode,

    // Data
    carMakes,
    fuelTypes,
    exteriorColors,
    interiorColors,
    interiorMaterials,
    countries,
    bulgarianCities,
    radiusOptions,

    // Translation
    t
  };
};