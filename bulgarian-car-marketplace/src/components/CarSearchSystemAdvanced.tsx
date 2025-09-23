import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { AdvancedSearchParams, CarDataFromFile, AvailableFilterOptions } from '../types/CarData';
import { advancedDataService } from '../services/AdvancedDataService';
import AdvancedFilterSystem from './AdvancedFilterSystem';
import { SmartSearchSuggestions } from './SmartSearchSuggestions';
import AnalyticsSystem from './analytics/AnalyticsSystem';
import RatingSystem from './RatingSystem';
import { LoadingSpinner } from './LoadingSpinner';

interface CarSearchSystemAdvancedProps {
  onSearchResults: (results: CarDataFromFile[]) => void;
  onSearchParamsChange?: (params: AdvancedSearchParams) => void;
}

const CarSearchSystemAdvanced: React.FC<CarSearchSystemAdvancedProps> = (props) => {
  const { onSearchResults, onSearchParamsChange } = props;
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
    make: '',
    model: '',
    vehicleType: [],
    minSeats: '',
    maxSeats: '',
    doors: '',
    slidingDoor: '',
    condition: [],
    paymentType: [],
    minPrice: '',
    maxPrice: '',
    minFirstRegistration: '',
    maxFirstRegistration: '',
    minMileage: '',
    maxMileage: '',
    huValidUntil: '',
    owners: '',
    fullServiceHistory: false,
    roadworthy: false,
    newService: false,
    country: 'BG',
    city: '',
    zipCode: '',
    radius: '',
    deliveryAvailable: false,
    fuelType: [],
    minPower: '',
    maxPower: '',
    powerUnit: 'hp',
    minEngineSize: '',
    maxEngineSize: '',
    minFuelTank: '',
    maxFuelTank: '',
    minWeight: '',
    maxWeight: '',
    minCylinders: '',
    maxCylinders: '',
    driveType: '',
    transmission: [],
    maxFuelConsumption: '',
    emissionSticker: '',
    emissionClass: '',
    particulateFilter: false,
    exteriorColor: [],
    exteriorFinish: [],
    trailerCoupling: '',
    trailerAssist: false,
    minTrailerLoadBraked: '',
    minTrailerLoadUnbraked: '',
    noseWeight: '',
    parkingSensors: [],
    camera360: false,
    rearTrafficAlert: false,
    selfSteering: false,
    cruiseControl: [],
    exteriorFeatures: [],
    interiorColor: [],
    interiorMaterial: [],
    airbags: [],
    airConditioning: [],
    interiorFeatures: [],
    sellerType: [],
    minDealerRating: '',
    adOnlineSince: '',
    withPictures: false,
    vatReclaimable: false,
    warranty: false,
    nonSmoker: false,
    excludeVehicles: []
  });
  const [quickQuery, setQuickQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // استرجاع آخر بحث محفوظ عند تحميل الصفحة
  useEffect(() => {
    const savedParams = localStorage.getItem('globul_last_search');
    if (savedParams) {
      try {
        const parsed = JSON.parse(savedParams);
        setSearchParams(parsed);
      } catch {}
    }
  }, []);


  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CarDataFromFile[]>([]);
  const [availableData, setAvailableData] = useState<AvailableFilterOptions>({
    makes: [],
    models: [],
    modelsByMake: {},
    vehicleTypes: [],
    conditions: [],
    cities: [],
    fuelTypes: [],
    transmissions: [],
    colors: [],
    features: []
  });
  const [searchDuration, setSearchDuration] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    const loadData = async () => {
      try {
        await advancedDataService.loadData();
        const options = advancedDataService.getAvailableOptions();
        setAvailableData(options);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // استرجاع آخر بحث محفوظ عند تحميل الصفحة
  useEffect(() => {
    const savedParams = localStorage.getItem('globul_last_search');
    if (savedParams) {
      try {
        const parsed = JSON.parse(savedParams);
        setSearchParams(parsed);
      } catch {}
    }
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const results = advancedDataService.advancedSearch(searchParams);
      const endTime = performance.now();
      setSearchDuration(Math.round(endTime - startTime));

      setSearchResults(results);
      if (typeof onSearchResults === 'function') onSearchResults(results);
      setShowAnalytics(true);
      if (typeof onSearchParamsChange === 'function') onSearchParamsChange(searchParams);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      if (typeof onSearchResults === 'function') onSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamsChange = (newParams: AdvancedSearchParams) => {
  setSearchParams(newParams);
  if (typeof onSearchParamsChange === 'function') onSearchParamsChange(newParams);
  };

  return (
    <SearchContainer>
      {/* زر حفظ البحث */}
      <div style={{ textAlign: 'right', marginBottom: 12 }}>
        <button
          style={{ padding: '8px 18px', borderRadius: '6px', background: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          onClick={() => {
            localStorage.setItem('globul_last_search', JSON.stringify(searchParams));
            alert('تم حفظ البحث بنجاح!');
          }}
        >
          حفظ البحث الحالي
        </button>
      </div>
      <SearchHeader>
        <SearchTitle>{t('cars.search.advanced', 'Разширено търсене')}</SearchTitle>
        <SearchDescription>
          {t('cars.search.advancedDescription', 'Намерете идеалния автомобил с нашата мощна система за филтриране')}
        </SearchDescription>
      </SearchHeader>

      {/* بحث سريع مع اقتراحات ذكية */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <input
          type="text"
          value={quickQuery}
          onChange={e => {
            setQuickQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 2);
          }}
          placeholder={t('cars.search.quickPlaceholder', 'Търсене на марка, модел или характеристика...')}
          style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        {showSuggestions && (
          <SmartSearchSuggestions
            query={quickQuery}
            carData={searchResults.length > 0 ? searchResults : []}
            onSuggestionSelect={suggestion => {
              setQuickQuery(suggestion);
              setShowSuggestions(false);
            }}
          />
        )}
      </div>

      <AdvancedFilterSystem
        searchParams={searchParams}
        onFiltersChange={handleParamsChange}
        availableData={availableData}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {isLoading && <LoadingSpinner />}

      {showAnalytics && searchResults.length > 0 && (
        <AnalyticsSystem
          searchResults={searchResults}
          searchParams={searchParams}
          searchDuration={searchDuration}
        />
      )}

      {/* نظام التقييمات */}
      <RatingSystem
        dealerRating={4.5}
        onRatingSubmit={(rating, comment) => {
          console.log('Rating submitted:', rating, comment);
          // هنا يمكن إضافة منطق إرسال التقييم للخادم
        }}
      />

      {/* عرض النتائج */}
      <SearchResultsContainer>
        <ResultsHeader>
          <ResultsTitle>
            {t('cars.search.results', 'Резултати от търсенето')}
            {searchResults.length > 0 && (
              <ResultsCount>({searchResults.length})</ResultsCount>
            )}
          </ResultsTitle>
        </ResultsHeader>

        {searchResults.length === 0 && !isLoading && showAnalytics && (
          <NoResults>
            <NoResultsTitle>{t('cars.search.noResults', 'Няма намерени резултати')}</NoResultsTitle>
            <NoResultsText>
              {t('cars.search.tryAdjustingFilters', 'Опитайте да промените филтрите си или да разширите критериите за търсене.')}
            </NoResultsText>
          </NoResults>
        )}

        {searchResults.length > 0 && (
          <ResultsGrid>
            {searchResults.map(car => (
              <CarCard key={car.id}>
                <CarImage>
                  {car.images && car.images.length > 0 ? (
                    <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
                  ) : (
                    <NoImage>{t('cars.noImage', 'Няма снимка')}</NoImage>
                  )}
                </CarImage>
                <CarInfo>
                  <CarTitle>{car.brand} {car.model} {car.year}</CarTitle>
                  <CarPrice>{car.price.toLocaleString()} €</CarPrice>
                  <CarDetails>
                    <DetailItem>{car.mileage.toLocaleString()} km</DetailItem>
                    <DetailItem>{car.fuelType}</DetailItem>
                    <DetailItem>{car.transmission}</DetailItem>
                    <DetailItem>{car.location}</DetailItem>
                  </CarDetails>
                  <CarDescription>{car.description}</CarDescription>
                </CarInfo>
              </CarCard>
            ))}
          </ResultsGrid>
        )}
      </SearchResultsContainer>
    </SearchContainer>
  );
};

// Styled Components
const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[300]};
`;

const SearchTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const SearchDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchResultsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ResultsHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ResultsTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ResultsCount = styled.span`
  color: ${({ theme }) => theme.colors.primary.main};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const NoResultsTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const NoResultsText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CarCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.base};
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CarImage = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.grey[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NoImage = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CarInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const CarTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const CarPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CarDetails = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const DetailItem = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.grey[100]};
  padding: 2px 8px;
  border-radius: 4px;
`;

const CarDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default CarSearchSystemAdvanced;