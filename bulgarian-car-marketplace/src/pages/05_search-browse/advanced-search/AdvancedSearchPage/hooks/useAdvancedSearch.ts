import { logger } from '../../../../../services/logger-service';
// src/pages/AdvancedSearchPage/hooks/useAdvancedSearch.ts
// Custom hook for Advanced Search Page state management

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { SearchData, SectionState, SectionName, SortOption, ViewMode, SearchResultsMeta } from '../types';
import { CarListing } from '../../../../../types/CarListing';
import algoliaSearchService from '../../../../../services/algoliaSearchService';
import { useFilters } from '../../../../../contexts/FilterContext';
import { brandsModelsDataService } from '../../../../../services/brands-models-data.service';

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

  const { filters, updateFilter } = useFilters();

  // Search Form State (local UI state; core subset synced with FilterContext)
  const [searchData, setSearchData] = useState<SearchData>(createInitialSearchData());
  const [isSearching, setIsSearching] = useState(false);
  
  // ✅ NEW: Load brands dynamically from centralized service
  const [carMakes, setCarMakes] = useState<string[]>([]);
  
  useEffect(() => {
    // Load brands on mount
    brandsModelsDataService.getAllBrands().then(brands => {
      setCarMakes(brands);
    }).catch(error => {
      logger.error('Failed to load car makes:', error);
      // Fallback to popular brands
      setCarMakes([
        'Volkswagen', 'Mercedes-Benz', 'BMW', 'Audi', 'Opel', 'Toyota', 
        'Ford', 'Peugeot', 'Honda', 'Renault'
      ]);
    });
  }, []);
  
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

    // Sync core filters to FilterContext
    const coreMap: Record<string, (val: string) => void> = {
      make: v => updateFilter('make', v),
      model: v => updateFilter('model', v),
      priceFrom: v => updateFilter('priceFrom', v),
      priceTo: v => updateFilter('priceTo', v),
      firstRegistrationFrom: v => updateFilter('yearFrom', v),
      firstRegistrationTo: v => updateFilter('yearTo', v),
      city: v => updateFilter('city', v),
      fuelType: v => updateFilter('fuelType', v),
      transmission: v => updateFilter('transmission', v),
      searchDescription: v => updateFilter('text', v)
    };
    if (coreMap[name]) coreMap[name](type === 'checkbox' ? String(checked ? 'true' : '') : value);
  };

  // Initial hydration from FilterContext (once)
  useEffect(() => {
    // Only apply if filters has data (avoid overwriting user input after first change)
    if (!filters) return;
    setSearchData(prev => ({
      ...prev,
      make: filters.make || prev.make,
      model: filters.model || prev.model,
      priceFrom: filters.priceFrom || prev.priceFrom,
      priceTo: filters.priceTo || prev.priceTo,
      firstRegistrationFrom: filters.yearFrom || prev.firstRegistrationFrom,
      firstRegistrationTo: filters.yearTo || prev.firstRegistrationTo,
      city: filters.city || prev.city,
      fuelType: filters.fuelType || prev.fuelType,
      transmission: filters.transmission || prev.transmission,
      searchDescription: filters.text || prev.searchDescription
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Form Submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      logger.info('🔍 Starting Algolia search with filters:', searchData);
      
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
      
      logger.info(`✅ Algolia search completed: ${response.totalResults} cars found in ${response.processingTime}ms`);

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
      logger.error('❌ Algolia search error:', error);
      alert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setSearchData(createInitialSearchData());
  };

  // ✅ Data arrays loaded from service or constants
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
    // All 28 Bulgarian Provinces (Области)
    t('advancedSearch.blagoevgrad'),
    t('advancedSearch.burgas'),
    t('advancedSearch.dobrich'),
    t('advancedSearch.gabrovo'),
    t('advancedSearch.haskovo'),
    t('advancedSearch.kardzhali'),
    t('advancedSearch.kyustendil'),
    t('advancedSearch.lovech'),
    t('advancedSearch.montana'),
    t('advancedSearch.pazardzhik'),
    t('advancedSearch.pernik'),
    t('advancedSearch.pleven'),
    t('advancedSearch.plovdiv'),
    t('advancedSearch.razgrad'),
    t('advancedSearch.ruse'),
    t('advancedSearch.shumen'),
    t('advancedSearch.silistra'),
    t('advancedSearch.sliven'),
    t('advancedSearch.smolyan'),
    t('advancedSearch.sofia'),
    t('advancedSearch.sofiaProvince'),
    t('advancedSearch.staraZagora'),
    t('advancedSearch.targovishte'),
    t('advancedSearch.varna'),
    t('advancedSearch.velikoTarnovo'),
    t('advancedSearch.vidin'),
    t('advancedSearch.vratsa'),
    t('advancedSearch.yambol')
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