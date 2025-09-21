// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { bulgarianCarService, BulgarianCar, CarSearchFilters } from '../firebase';
import { YEARS_OPTIONS } from '../constants/carMakes';
import AdvancedSearch from '../components/AdvancedSearch';
import CarSearchSystem from '../components/CarSearchSystem';
import DetailedSearch from '../components/DetailedSearch';

// Interface for detailed search filters
interface DetailedSearchFilters {
  make: string;
  model: string;
  generation: string;
  bodyStyle: string;
  vehicleType: string;
  seats: { from: string; to: string };
  doors: string;
  slidingDoor: string;
  condition: string;
  paymentType: string;
  price: { from: string; to: string };
  firstRegistration: { from: string; to: string };
  mileage: { from: string; to: string };
  huValid: string;
  owner: string;
  serviceHistory: boolean;
  roadworthy: boolean;
  inspection: boolean;
  country: string;
  location: string;
  radius: string;
  delivery: boolean;
  fuelType: string;
  power: { from: string; to: string; unit: 'PS' | 'kW' };
  displacement: { from: string; to: string };
  tankSize: { from: string; to: string };
  weight: { from: string; to: string };
  cylinders: { from: string; to: string };
  driveType: string;
  transmission: string;
  fuelConsumption: string;
  emissionSticker: string;
  emissionClass: string;
  particulateFilter: boolean;
  exteriorColor: string;
  metallic: boolean;
  matte: boolean;
  towbar: string;
  towbarAssistant: boolean;
  brakedTrailerLoad: string;
  unbrakedTrailerLoad: string;
  supportLoad: string;
  parkingAssist: string[];
  cruiseControl: string;
  interiorColor: string;
  interiorMaterial: string;
  airbags: string;
  climateControl: string;
  extras: string[];
  sellerType: string;
  sellerRating: string;
  onlineSince: string;
  warranty: boolean;
  withImages: boolean;
  withVideo: boolean;
  vatDeductible: boolean;
  nonSmoker: boolean;
  reducedPrice: boolean;
  taxi: boolean;
  damagedVehicles: string;
  business: string;
  qualitySeal: string;
  searchDescription: string;
}

// Styled Components
const CarsContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${({ theme }) => theme.spacing['2xl']};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const FiltersSection = styled.aside`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.base};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  position: sticky;
  top: ${({ theme }) => theme.spacing['2xl']};
  height: fit-content;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FilterGroup = styled.div`
  label {
    display: block;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  select, input {
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
`;

// مكون خاص للقائمة المنسدلة مع أيقونات الشركات
// تم استبداله بالنظام الجديد CarSearchSystem

const FilterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
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
`;

const ResultsSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  cursor: pointer;
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const CarCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CarImage = styled.div`
  height: 200px;
  background: ${({ theme }) => theme.colors.grey[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  color: ${({ theme }) => theme.colors.grey[400]};
  position: relative;
`;

const CarBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.secondary.main};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const CarContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CarTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
  flex: 1;
`;

const CarTitleWithBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CarPrice = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &::before {
    content: '€';
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

const CarDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CarDetail = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CarLocation = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

// Cars Page Component
const CarsPage: React.FC = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState<BulgarianCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CarSearchFilters>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'mileage' | 'year'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] = useState(false);
  const [showDetailedSearch, setShowDetailedSearch] = useState(false);

// Generate years array from 1900 to 2025
// const YEARS_OPTIONS = (() => {
//   const years = [];
//   for (let year = 2025; year >= 1900; year--) {
//     years.push(year);
//   }
//   return years;
// })();

// Comprehensive car makes list - Updated with complete list
// const CAR_MAKES = [
//   'Abarth', 'Acura', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Brilliance', 'Bugatti',
//   'Buick', 'BYD', 'Cadillac', 'Changan', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia',
//   'Daewoo', 'Daihatsu', 'Dodge', 'Dongfeng', 'DS Automobiles', 'Exeed', 'Ferrari', 'Fiat', 'Fisker', 'Ford',
//   'Forthing', 'GAZ', 'Geely', 'Genesis', 'GMC', 'Great Wall', 'Haval', 'Honda', 'Hongqi', 'Hummer',
//   'Hyundai', 'Infiniti', 'Iran Khodro', 'Isuzu', 'Iveco', 'Jaguar', 'JAC', 'Jeep', 'Jetour', 'Kia',
//   'Koenigsegg', 'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Leapmotor', 'Lexus', 'Lincoln', 'Lotus', 'Lucid Motors',
//   'MAN', 'Mahindra', 'Maserati', 'Maxus', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini',
//   'Mitsubishi', 'Moskvitch', 'NIO', 'Nissan', 'Opel', 'Pagani', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche',
//   'Praga', 'RAM', 'Renault', 'Rimac', 'Rinspeed', 'Rolls-Royce', 'Rover', 'Saab', 'Saipa', 'Scania',
//   'SEAT', 'Seres', 'Sin Cars', 'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tata', 'Tesla',
//   'Toyota', 'Tatra', 'TVR', 'UAZ', 'Volkswagen', 'Volvo', 'Voyah', 'Wiesmann', 'Xpeng', 'Zeekr'
// ];  // Load cars
  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      const result = await bulgarianCarService.searchCars(
        filters,
        sortBy,
        sortOrder,
        20
      );
      setCars(result.cars);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    loadCars();
  }, [loadCars]);

  // Handle detailed search
  const handleDetailedSearch = useCallback((detailedFilters: DetailedSearchFilters) => {
    const newFilters: CarSearchFilters = {
      make: detailedFilters.make || undefined,
      model: detailedFilters.model || undefined,
      generation: detailedFilters.generation || undefined,
      bodyStyle: detailedFilters.bodyStyle || undefined,
      minPrice: detailedFilters.price.from ? parseInt(detailedFilters.price.from) : undefined,
      maxPrice: detailedFilters.price.to ? parseInt(detailedFilters.price.to) : undefined,
      fuelType: detailedFilters.fuelType || undefined,
      transmission: detailedFilters.transmission || undefined,
      condition: detailedFilters.condition || undefined,
      minYear: detailedFilters.firstRegistration.from ? parseInt(detailedFilters.firstRegistration.from) : undefined,
      maxYear: detailedFilters.firstRegistration.to ? parseInt(detailedFilters.firstRegistration.to) : undefined,
      maxMileage: detailedFilters.mileage.to ? parseInt(detailedFilters.mileage.to) : undefined,
      location: detailedFilters.location ? {
        city: detailedFilters.location,
        radius: detailedFilters.radius ? parseInt(detailedFilters.radius) : undefined
      } : undefined,
      // Add more mappings as needed
    };
    setFilters(newFilters);
    setShowDetailedSearch(false);
  }, []);
  const handleFilterChange = (key: keyof CarSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setIsAdvancedSearchExpanded(false);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('_');
    setSortBy(field as any);
    setSortOrder(order as any);
  };

  return (
    <CarsContainer>
      <PageContainer>
        {/* Page Header */}
        <PageHeader>
          <h1>{t('cars.title')}</h1>
          <p>{t('cars.subtitle')}</p>
        </PageHeader>

        {/* Advanced Search */}
        <AdvancedSearch
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={loadCars}
          onClear={clearFilters}
          isExpanded={isAdvancedSearchExpanded}
          onToggleExpanded={() => setIsAdvancedSearchExpanded(!isAdvancedSearchExpanded)}
        />

        <Layout>
          {/* Filters Section (left sidebar) */}
          <FiltersSection>
            {/* النظام الجديد للبحث الهرمي */}
            <CarSearchSystem
              onSearch={(searchFilters) => {
                // تحويل فلاتر النظام الجديد إلى فلاتر النظام القديم
                const newFilters: CarSearchFilters = {
                  ...filters,
                  make: searchFilters.make || undefined,
                  model: searchFilters.model || undefined,
                  generation: searchFilters.generation || undefined,
                  bodyStyle: searchFilters.bodyStyle || undefined
                };
                setFilters(newFilters);
              }}
              initialFilters={{
                make: filters.make || '',
                model: filters.model || '',
                generation: filters.generation || '',
                bodyStyle: filters.bodyStyle || ''
              }}
            />

            <FiltersGrid>

              <FilterGroup>
                <label>{t('cars.filters.priceRange')} (€)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder={t('cars.filters.fromPrice')}
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || undefined)}
                  />
                  <input
                    type="number"
                    placeholder={t('cars.filters.toPrice')}
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </FilterGroup>

              <FilterGroup>
                <label>{t('cars.filters.mileage')} (km)</label>
                <input
                  type="number"
                  placeholder={t('cars.filters.maxMileage')}
                  value={filters.maxMileage || ''}
                  onChange={(e) => handleFilterChange('maxMileage', parseInt(e.target.value) || undefined)}
                />
              </FilterGroup>

            <FilterGroup>
              <label>{t('cars.filters.fuelType')}</label>
              <select
                value={filters.fuelType || ''}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              >
                <option value="">{t('cars.filters.allFuelTypes')}</option>
                <option value="petrol">{t('cars.fuelTypes.petrol')}</option>
                <option value="diesel">{t('cars.fuelTypes.diesel')}</option>
                <option value="electric">{t('cars.fuelTypes.electric')}</option>
                <option value="hybrid">{t('cars.fuelTypes.hybrid')}</option>
                <option value="gas">{t('cars.fuelTypes.gas')}</option>
                <option value="lpg">{t('cars.fuelTypes.lpg')}</option>
                <option value="cng">{t('cars.fuelTypes.cng')}</option>
                <option value="hydrogen">{t('cars.fuelTypes.hydrogen')}</option>
                <option value="ethanol">{t('cars.fuelTypes.ethanol')}</option>
                <option value="biodiesel">{t('cars.fuelTypes.biodiesel')}</option>
                <option value="other">{t('cars.fuelTypes.other')}</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('cars.filters.year')}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={filters.minYear || ''}
                  onChange={(e) => handleFilterChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
                  style={{ flex: 1 }}
                >
                  <option value="">{t('cars.filters.fromYear')}</option>
                  {YEARS_OPTIONS.map((year) => (
                    <option key={`min-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.maxYear || ''}
                  onChange={(e) => handleFilterChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
                  style={{ flex: 1 }}
                >
                  <option value="">{t('cars.filters.toYear')}</option>
                  {YEARS_OPTIONS.map((year) => (
                    <option key={`max-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </FilterGroup>

              <FilterGroup>
                <label>{t('cars.filters.location')}</label>
                <input
                  type="text"
                  placeholder={t('cars.filters.city')}
                  value={filters.location?.city || ''}
                  onChange={(e) => handleFilterChange('location', {
                    ...filters.location,
                    city: e.target.value || undefined
                  })}
                />
              </FilterGroup>

              <FilterGroup>
                <label>{t('cars.filters.radius')} (km)</label>
                <input
                  type="number"
                  placeholder={t('cars.filters.searchRadius')}
                  value={filters.location?.radius || ''}
                  onChange={(e) => handleFilterChange('location', {
                    ...filters.location,
                    radius: parseInt(e.target.value) || undefined
                  })}
                />
              </FilterGroup>

            <FilterGroup>
              <label>{t('cars.filters.transmission')}</label>
              <select
                value={filters.transmission || ''}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
              >
                <option value="">{t('cars.filters.allTransmissions')}</option>
                <option value="manual">{t('cars.transmissions.manual')}</option>
                <option value="automatic">{t('cars.transmissions.automatic')}</option>
                <option value="semi-automatic">{t('cars.transmissions.semiAutomatic')}</option>
                <option value="cvt">{t('cars.transmissions.cvt')}</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>{t('cars.filters.condition')}</label>
              <select
                value={filters.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                <option value="">{t('cars.filters.allConditions')}</option>
                <option value="new">{t('cars.conditions.new')}</option>
                <option value="used">{t('cars.conditions.used')}</option>
                <option value="damaged">{t('cars.conditions.damaged')}</option>
              </select>
            </FilterGroup>

            </FiltersGrid>

            <FilterActions>
              <FilterButton onClick={loadCars}>
                {t('cars.filters.search')}
              </FilterButton>
              <FilterButton className="secondary" onClick={clearFilters}>
                {t('cars.filters.clear')}
              </FilterButton>
              <FilterButton className="secondary" onClick={() => setShowDetailedSearch(true)}>
                {t('detailedSearch.title')}
              </FilterButton>
            </FilterActions>
          </FiltersSection>

          {/* Results Section (right content) */}
          <ResultsSection>
          <ResultsHeader>
            <div>
              <h2>{t('cars.results.title')}</h2>
              <span>{cars.length} {t('cars.results.found')}</span>
            </div>

            <SortSelect
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="createdAt_desc">{t('cars.sort.newest')}</option>
              <option value="createdAt_asc">{t('cars.sort.oldest')}</option>
              <option value="price_asc">{t('cars.sort.priceLow')}</option>
              <option value="price_desc">{t('cars.sort.priceHigh')}</option>
              <option value="year_desc">{t('cars.sort.yearNew')}</option>
              <option value="year_asc">{t('cars.sort.yearOld')}</option>
              <option value="mileage_asc">{t('cars.sort.mileageLow')}</option>
              <option value="mileage_desc">{t('cars.sort.mileageHigh')}</option>
            </SortSelect>
          </ResultsHeader>

            {loading ? (
              <LoadingSpinner>
                {t('common.loading')}
              </LoadingSpinner>
            ) : cars.length === 0 ? (
              <NoResults>
                <h3>{t('cars.noResults.title')}</h3>
                <p>{t('cars.noResults.message')}</p>
                <FilterButton onClick={clearFilters}>
                  {t('cars.noResults.clearFilters')}
                </FilterButton>
              </NoResults>
            ) : (
              <CarsGrid>
                {cars.map((car) => (
                  <CarCard key={car.id}>
                    <Link to={`/cars/${car.id}`} style={{ textDecoration: 'none' }}>
                      <CarImage>
                        {car.images.length > 0 ? (
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          '🚗'
                        )}
                        {car.isFeatured && (
                          <CarBadge>{t('cars.featured')}</CarBadge>
                        )}
                      </CarImage>
                      <CarContent>
                        <CarTitleWithBrand>
                          <CarTitle>{car.title}</CarTitle>
                        </CarTitleWithBrand>
                        <CarPrice>{car.price.toLocaleString()}</CarPrice>
                        <CarDetails>
                          <CarDetail>📅 {car.year}</CarDetail>
                          <CarDetail>⚡ {car.power} HP</CarDetail>
                          <CarDetail>⛽ {car.fuelType}</CarDetail>
                        </CarDetails>
                        <CarDetails>
                          <CarDetail>🛣️ {car.mileage.toLocaleString()} km</CarDetail>
                          <CarDetail>🔄 {car.transmission}</CarDetail>
                        </CarDetails>
                        <CarLocation>
                          📍 {car.location.city}, {car.location.region}
                        </CarLocation>
                      </CarContent>
                    </Link>
                  </CarCard>
                ))}
              </CarsGrid>
            )}
          </ResultsSection>
        </Layout>

        {/* Detailed Search Modal */}
        {showDetailedSearch && (
          <DetailedSearch
            onSearch={handleDetailedSearch}
            onClose={() => setShowDetailedSearch(false)}
            onSaveSearch={() => {
              // Handle save search functionality
              setShowDetailedSearch(false);
            }}
            initialFilters={{
              make: filters.make || '',
              model: filters.model || '',
              generation: filters.generation || '',
              bodyStyle: filters.bodyStyle || '',
              price: {
                from: filters.minPrice?.toString() || '',
                to: filters.maxPrice?.toString() || ''
              },
              firstRegistration: {
                from: filters.minYear?.toString() || '',
                to: filters.maxYear?.toString() || ''
              },
              mileage: {
                from: '',
                to: filters.maxMileage?.toString() || ''
              },
              fuelType: filters.fuelType || '',
              transmission: filters.transmission || '',
              condition: filters.condition || '',
              location: filters.location?.city || '',
              radius: filters.location?.radius?.toString() || '10'
            }}
          />
        )}
      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;