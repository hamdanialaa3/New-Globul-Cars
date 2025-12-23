import { logger } from '../../../../services/logger-service';
import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import ModernCarCard from '../../../01_main-pages/home/HomePage/ModernCarCard';
import { UnifiedCar } from '../../../../services/car';
import { Car, Plus, ArrowUpDown, Filter, Eye } from 'lucide-react';
import * as S from './styles';
import { unifiedCarService } from '../../../../services/UnifiedCarService';
import { MatrixUploader } from '../components/MatrixUploader';

/**
 * My Ads Tab - Full garage with all user's cars
 * Professional Garage/Showroom display
 */
const ProfileMyAds: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const params = useParams<{ userId?: string }>();
  const { userCars, isOwnProfile, loadUserCars, user } = useProfile(params.userId);

  // Sort and filter states
  const [sortBy, setSortBy] = React.useState<string>('newest');
  const [filterBy, setFilterBy] = React.useState<string>('all');

  // Get user name for title
  const userName = user?.displayName || (language === 'bg' ? 'Потребител' : 'User');

  // Convert userCars to UnifiedCar format and apply sorting/filtering
  const unifiedCars: UnifiedCar[] = React.useMemo(() => {
    let cars = ((userCars || []) as any[]).map(car => ({
      ...car,
      id: car.id,
      make: car.make || '',
      model: car.model || '',
      year: car.year,
      price: car.price || 0,
      mileage: car.mileage || 0,
      fuelType: car.fuelType || car.fuel,
      transmission: car.transmission || car.gearbox,
      images: car.images || (car.mainImage ? [car.mainImage] : []),
      mainImage: car.mainImage || car.images?.[0],
      location: car.location || (car.locationData?.cityName ? { city: car.locationData?.cityName } : undefined),
      condition: car.condition || 'used',
      isFeatured: car.isFeatured || false,
      isActive: car.isActive !== false,
      isSold: car.isSold || false,
      horsepower: car.horsepower || car.power,
      createdAt: car.createdAt || new Date(),
      updatedAt: car.updatedAt || car.createdAt || new Date()
    })) as UnifiedCar[];

    // Apply filter
    if (filterBy === 'active') {
      cars = cars.filter(car => car.isActive === true && car.isSold !== true);
    } else if (filterBy === 'sold') {
      cars = cars.filter(car => car.isSold === true);
    } else if (filterBy === 'pending') {
      cars = cars.filter(car => car.status === 'pending' || car.isActive === false);
    }

    // Apply sort
    const sorted = [...cars].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'nameAsc':
          const nameA = `${a.make || ''} ${a.model || ''}`.trim().toLowerCase();
          const nameB = `${b.make || ''} ${b.model || ''}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        case 'nameDesc':
          const nameA2 = `${a.make || ''} ${a.model || ''}`.trim().toLowerCase();
          const nameB2 = `${b.make || ''} ${b.model || ''}`.trim().toLowerCase();
          return nameB2.localeCompare(nameA2);
        case 'priceLow':
          return (a.price || 0) - (b.price || 0);
        case 'priceHigh':
          return (b.price || 0) - (a.price || 0);
        case 'yearNew':
          return (b.year || 0) - (a.year || 0);
        case 'yearOld':
          return (a.year || 0) - (b.year || 0);
        case 'make':
          const makeA = (a.make || '').toLowerCase();
          const makeB = (b.make || '').toLowerCase();
          return makeA.localeCompare(makeB);
        case 'model':
          const modelA = (a.model || '').toLowerCase();
          const modelB = (b.model || '').toLowerCase();
          return modelA.localeCompare(modelB);
        default:
          return 0;
      }
    });

    return sorted;
  }, [userCars, sortBy, filterBy]);

  // Power Tools State
  const { permissions, isDealer, isCompany, getProgressToLimit } = useProfileType(); // Use Context
  const [showMatrix, setShowMatrix] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'compact'>('grid');

  // Clone Handler
  const handleClone = async (carId: string) => {
    if (!permissions.canCloneListing || !user) return;
    try {
      const toastId = toast.loading(language === 'bg' ? 'Клониране...' : 'Cloning...');
      await unifiedCarService.cloneCarListing(carId, user.uid);
      toast.update(toastId, {
        render: language === 'bg' ? 'Обявата е клонирана!' : 'Listing Cloned!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
      // reload
      loadUserCars();
    } catch (err) {
      logger.error('Clone failed', err as Error);
    }
  };

  // Limit Progress
  const listingStats = getProgressToLimit ? getProgressToLimit('listings') : { used: 0, total: 3, percentage: 0 };
  const isApproachingLimit = listingStats.percentage > 80;

  return (
    <Container $isDark={isDark}>
      <S.ContentSection style={{ padding: '2rem 1rem', marginTop: 0 }}>

        {/* POWER BAR - For Dealers & Companies */}
        {(isDealer || isCompany) && (
          <div style={{
            marginBottom: '2rem',
            background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
            border: `1px solid ${isDark ? '#22c55e' : '#4ade80'}`,
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ margin: 0, color: isDark ? '#4ade80' : '#15803d' }}>
                {language === 'bg' ? 'Професионален Панел' : 'Professional Dashboard'}
              </h3>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem' }}>
                  Monthly Quota: <strong>{listingStats.used} / {listingStats.total === 999 ? '∞' : listingStats.total}</strong>
                </span>
                {/* Mini Progress Bar */}
                <div style={{ width: '100px', height: '6px', background: '#334155', borderRadius: '3px' }}>
                  <div style={{
                    width: `${listingStats.percentage}%`,
                    height: '100%',
                    background: isApproachingLimit ? '#ef4444' : '#22c55e',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {permissions.canBulkUpload && (
                <AddButton $isDark={isDark} onClick={() => setShowMatrix(true)} style={{ background: '#2563eb' }}>
                  <ArrowUpDown size={18} />
                  {language === 'bg' ? 'Масово Качване' : 'Bulk Upload'}
                </AddButton>
              )}
              <div style={{ display: 'flex', background: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: '1px solid #475569' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ padding: '0.5rem', background: viewMode === 'grid' ? '#475569' : 'transparent', color: viewMode === 'grid' ? 'white' : 'inherit', border: 'none', borderRadius: '6px 0 0 6px', cursor: 'pointer' }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  style={{ padding: '0.5rem', background: viewMode === 'compact' ? '#475569' : 'transparent', color: viewMode === 'compact' ? 'white' : 'inherit', border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer' }}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        )}

        <SectionHeader>
          <SectionTitle $isDark={isDark}>
            {language === 'bg' ? 'Моите обяви' : 'My Ads'}
          </SectionTitle>
          {isOwnProfile && (
            <AddButton onClick={() => navigate('/sell')} $isDark={isDark}>
              <Plus size={18} />
              {language === 'bg' ? 'Добави нова' : 'Add New'}
            </AddButton>
          )}
        </SectionHeader>

        {/* Sort and Filter Controls - Always visible if there are cars */}
        {userCars && userCars.length > 0 && (
          <FiltersBar>
            <FilterGroup>
              <FilterIcon><ArrowUpDown size={16} /></FilterIcon>
              <FilterLabel>{language === 'bg' ? 'Сортирай по' : 'Sort by'}:</FilterLabel>
              <FilterSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">{language === 'bg' ? 'Най-нови първо' : 'Newest first'}</option>
                <option value="oldest">{language === 'bg' ? 'Най-стари първо' : 'Oldest first'}</option>
                <option value="nameAsc">{language === 'bg' ? 'Име (А-Я)' : 'Name (A-Z)'}</option>
                <option value="nameDesc">{language === 'bg' ? 'Име (Я-А)' : 'Name (Z-A)'}</option>
                <option value="priceLow">{language === 'bg' ? 'Цена: ниска → висока' : 'Price: Low to High'}</option>
                <option value="priceHigh">{language === 'bg' ? 'Цена: висока → ниска' : 'Price: High to Low'}</option>
                <option value="yearNew">{language === 'bg' ? 'Година: нова → стара' : 'Year: New to Old'}</option>
                <option value="yearOld">{language === 'bg' ? 'Година: стара → нова' : 'Year: Old to New'}</option>
                <option value="make">{language === 'bg' ? 'По марка' : 'By Make'}</option>
                <option value="model">{language === 'bg' ? 'По модел' : 'By Model'}</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterIcon><Filter size={16} /></FilterIcon>
              <FilterLabel>{language === 'bg' ? 'Филтрирай по' : 'Filter by'}:</FilterLabel>
              <FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="all">{language === 'bg' ? 'Всички' : 'All'}</option>
                <option value="active">{language === 'bg' ? 'Активни' : 'Active'}</option>
                <option value="sold">{language === 'bg' ? 'Продадени' : 'Sold'}</option>
                <option value="pending">{language === 'bg' ? 'В изчакване' : 'Pending'}</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersBar>
        )}

        {/* Matrix Modal */}
        {showMatrix && <MatrixUploader onClose={() => setShowMatrix(false)} />}

        {/* Show empty state only if no cars at all, or if filtered results are empty */}
        {(!userCars || userCars.length === 0) ? (
          <EmptyState $isDark={isDark}>
            <Car size={64} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <EmptyText $isDark={isDark}>
              {language === 'bg'
                ? 'Все още нямате обяви'
                : 'You don\'t have any listings yet'}
            </EmptyText>
            {isOwnProfile && (
              <AddButton onClick={() => navigate('/sell')} $isDark={isDark}>
                <Plus size={18} />
                {language === 'bg' ? 'Добави първа обява' : 'Add First Listing'}
              </AddButton>
            )}
          </EmptyState>
        ) : unifiedCars.length === 0 ? (
          <EmptyState $isDark={isDark}>
            <Car size={64} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <EmptyText $isDark={isDark}>
              {language === 'bg'
                ? 'Няма резултати с избраните филтри'
                : 'No results match the selected filters'}
            </EmptyText>
            <FilterResetButton onClick={() => {
              setFilterBy('all');
              setSortBy('newest');
            }} $isDark={isDark}>
              {language === 'bg' ? 'Изчисти филтрите' : 'Clear Filters'}
            </FilterResetButton>
          </EmptyState>
        ) : (
          /* View Mode Logic */
          viewMode === 'compact' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {unifiedCars.map(car => (
                <div key={car.id} style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 100px', gap: '1rem', padding: '0.5rem', background: isDark ? '#1e293b' : 'white', borderRadius: '8px', alignItems: 'center' }}>
                  <img src={car.mainImage?.url || 'placeholder.jpg'} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <span style={{ fontWeight: 'bold' }}>{car.make} {car.model}</span>
                  <span>{car.year}</span>
                  <span>€{car.price}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`, borderRadius: '4px', color: isDark ? '#e2e8f0' : '#475569', cursor: 'pointer' }}
                      onClick={() => {
                        const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
                        const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId || (car as any).numericId;
                        if (sellerNumericId && carNumericId) {
                          window.open(`/car/${sellerNumericId}/${carNumericId}`, '_blank');
                        } else {
                          import('../../../../utils/routing-utils').then(({ getCarUrlFromUnifiedCar }) => {
                            window.open(getCarUrlFromUnifiedCar(car), '_blank');
                          });
                        }
                      }}
                      title={language === 'bg' ? 'Преглед' : 'View'}
                    >
                      <Eye size={14} />
                      {viewMode === 'compact' && (language === 'bg' ? 'Преглед' : 'View')}
                    </button>
                    <button style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => {
                      import('../../../../utils/routing-utils').then(({ getCarUrlFromUnifiedCar }) => {
                        navigate(`${getCarUrlFromUnifiedCar(car)}/edit`);
                      });
                    }}>Edit</button>
                    {permissions.canCloneListing && (
                      <button
                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                        onClick={() => handleClone(car.id!)}
                      >
                        Clone
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CarsGrid>
              {unifiedCars.map((car) => (
                <div key={car.id} style={{ position: 'relative' }}>
                  <ModernCarCard
                    car={car}
                    showStatus={true}
                    onFavorite={(carId) => {
                      logger.info('Favorite clicked:', carId);
                    }}
                  />
                  {/* Clone Button Overlay */}
                  {permissions.canCloneListing && isOwnProfile && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClone(car.id!); }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10,
                        background: 'rgba(59, 130, 246, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      CLONE
                    </button>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        import('../../../../utils/routing-utils').then(({ getCarUrlFromUnifiedCar }) => {
                          navigate(`${getCarUrlFromUnifiedCar(car)}/edit`);
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: permissions.canCloneListing ? '70px' : '10px', // Shift if clone exists
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#1e293b',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      EDIT
                    </button>
                  )}
                </div>
              ))}
            </CarsGrid>
          )
        )}
      </S.ContentSection>
    </Container>
  );
};

const Container = styled.div<{ $isDark: boolean }>`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  background: ${({ $isDark }) => $isDark ? '#0f172a' : 'var(--bg-primary)'};
  min-height: 60vh;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const SectionTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const AddButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-button);
  
  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1025px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: ${({ $isDark }) => $isDark ? '#0f172a' : 'var(--bg-primary)'};
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: #f8fafc;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterIcon = styled.div`
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    color: #e2e8f0;
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    color: #1e293b;
  }
`;

const FilterSelect = styled.select`
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(255, 143, 16, 0.1);
  }
  
  option {
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 8px;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
    
    &:hover {
      border-color: var(--accent-primary);
    }
    
    option {
      background: #0f172a;
      color: #e2e8f0;
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: white;
    border-color: rgba(0, 0, 0, 0.15);
    color: #1e293b;
    
    &:hover {
      border-color: var(--accent-primary);
    }
    
    option {
      background: white;
      color: #1e293b;
    }
  }
`;

const FilterResetButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-button);
  margin-top: 1rem;
  
  &:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export default ProfileMyAds;

