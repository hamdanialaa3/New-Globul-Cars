// src/pages/CarsPage.tsx
// Cars Page for Bulgarian Car Marketplace

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../hooks/useTranslation';
import { bulgarianCarService, BulgarianCar, CarSearchFilters, FuelType, TransmissionType, CarCondition } from '../firebase';
import AdvancedFilterSystemMobile from '../components/AdvancedFilterSystemMobile';
// Import theme types
import '../styles/theme';
import CarSearchSystem from '../components/CarSearchSystemNew';
import DetailedSearch from '../components/DetailedSearch';
import LazyImage from '../components/LazyImage';

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

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 480px) {
    padding: 0 ${({ theme }) => theme.spacing.xs};
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};

    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }
  }
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

// Removed old sidebar filter styled components after layout simplification

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
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'mileage' | 'year'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetailedSearch, setShowDetailedSearch] = useState(false);
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] = useState(false);

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
  const loadCars = useCallback(async (searchFilters?: any) => {
    try {
      setLoading(true);
      const result = await bulgarianCarService.searchCars(
        searchFilters || filters,
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
      fuelType: detailedFilters.fuelType as FuelType || undefined,
      transmission: detailedFilters.transmission as TransmissionType || undefined,
      condition: detailedFilters.condition as CarCondition || undefined,
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
  // Sidebar filter handler removed with old layout

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

        {/* Simple Search (top, full width) */}
        <CarSearchSystem
          filters={[]}
          results={cars as any}
          loading={loading}
          onSearch={loadCars}
          onReset={clearFilters}
          onSearchResults={(results: any) => {
            console.log('Search results:', results);
            // تحويل نتائج البحث من CarDataFromFile إلى BulgarianCar
            const bulgarianCars: BulgarianCar[] = results.map((car: any, index: number) => ({
              id: `search-result-${index}`,
              ownerId: 'system',
              ownerName: 'System Search',
              ownerEmail: 'search@globulcars.com',

              // Basic Information
              make: car.brand,
              model: car.model,
              year: car.year,
              mileage: 0, // لا توجد معلومات في البيانات الأساسية
              price: typeof (car as any).price === 'string' ? ((car as any).price ? parseFloat((car as any).price.replace(/[^\d.]/g, '')) || 0 : 0) : (typeof (car as any).price === 'number' ? (car as any).price : 0),
              currency: 'EUR',

              // Technical Details
              fuelType: (car.fuelType as any) || 'petrol',
              transmission: (car.transmission as any) || 'manual',
              engineSize: typeof (car as any).engineSize === 'string' ? ((car as any).engineSize ? parseFloat((car as any).engineSize.replace(/[^\d.]/g, '')) || 0 : 0) : (typeof (car as any).engineSize === 'number' ? (car as any).engineSize : 0),
              power: typeof (car as any).power === 'string' ? ((car as any).power ? parseFloat((car as any).power.replace(/[^\d.]/g, '')) || 0 : 0) : (typeof (car as any).power === 'number' ? (car as any).power : 0),
              condition: (car.condition as any) || 'used',

              // Location
              location: {
                city: 'Sofia', // افتراضي
                region: 'Sofia',
                postalCode: '1000',
                country: 'Bulgaria'
              },

              // Description
              title: `${car.brand} ${car.model} ${car.year}`,
              description: `سيارة ${car.brand} ${car.model} من سنة ${car.year}. ${car.engineSize ? `محرك: ${car.engineSize}L` : ''} ${car.power ? `قوة: ${car.power}HP` : ''}`,
              features: [],
              color: car.color || 'Unknown',

              // Media
              images: [],
              mainImage: '',

              // Status
              isActive: true,
              isSold: false,
              isFeatured: false,
              views: 0,
              favorites: 0,

              // Bulgarian Specific
              hasBulgarianRegistration: true,
              vinNumber: `VIN${index}`,
              firstRegistrationDate: new Date(car.year, 0, 1),
              inspectionValidUntil: new Date(car.year + 2, 0, 1),

              // Metadata
              createdAt: new Date(),
              updatedAt: new Date()
            }));

            setCars(bulgarianCars);
          }}
        />

        {/* Advanced Filter System - Mobile.de inspired */}
        <AdvancedFilterSystemMobile
          onSearch={loadCars}
          onReset={clearFilters}
          onSaveSearch={(filters) => {
            console.log('Saving search filters:', filters);
            // Implement save search functionality
          }}
          loading={loading}
        />

        {/* Results Section */}
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
                {cars.map((car) => {
                  const imgCount = Array.isArray(car.images) ? car.images.length : 0;
                  const firstImg = imgCount > 0 ? car.images![0] : undefined;
                  const city = car.location?.city ?? '—';
                  const region = car.location?.region ?? '';
                  return (
                  <CarCard key={car.id}>
                    <Link to={`/cars/${car.id}`} style={{ textDecoration: 'none' }}>
                      <CarImage>
                        {firstImg ? (
                          <LazyImage src={firstImg} alt={car.title} placeholder="🚗" />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: '#ccc'
                          }}>
                            🚗
                          </div>
                        )}
                        {car.isFeatured && (
                          <CarBadge>{t('cars.featured')}</CarBadge>
                        )}
                      </CarImage>
                      <CarContent>
                        <CarTitleWithBrand>
                          <CarTitle>{car.title}</CarTitle>
                        </CarTitleWithBrand>
                        <CarPrice>{Number.isFinite(car.price as any) ? Number(car.price).toLocaleString() : '—'}</CarPrice>
                        <CarDetails>
                          <CarDetail>📅 {car.year}</CarDetail>
                          <CarDetail>⚡ {car.power} HP</CarDetail>
                          <CarDetail>⛽ {car.fuelType}</CarDetail>
                        </CarDetails>
                        <CarDetails>
                          <CarDetail>🛣️ {Number.isFinite(car.mileage as any) ? Number(car.mileage).toLocaleString() : '—'} km</CarDetail>
                          <CarDetail>🔄 {car.transmission}</CarDetail>
                        </CarDetails>
                        <CarLocation>
                          📍 {city}{region ? `, ${region}` : ''}
                        </CarLocation>
                      </CarContent>
                    </Link>
                  </CarCard>
                );})}
              </CarsGrid>
            )}
          </ResultsSection>

        {/* Detailed Search Modal */}
        {showDetailedSearch && (
          <DetailedSearch
            filters={[]}
            onSearch={handleDetailedSearch as any}
            onReset={() => setShowDetailedSearch(false)}
            loading={false}
          />
        )}
      </PageContainer>
    </CarsContainer>
  );
};

export default CarsPage;