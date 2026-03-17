// ProfileMyAds.tsx
// World-Class My Ads Dashboard - Refactored with modular components

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from './hooks/useProfile';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-toastify';
import { UnifiedCar } from '@/services/car';
import { unifiedCarService } from '@/services/car/unified-car-service';
import { logger } from '@/services/logger-service';
import { Plus, ArrowUpDown } from 'lucide-react';
import BulkUploadWizard from './components/BulkUploadWizard';

// Import new modular components
import { ThemeAwareWrapper } from './components/MyAds/ThemeAwareWrapper';
import { AdsStatsSummary } from './components/MyAds/AdsStatsSummary';
import { AdsToolbar, SortOption, FilterOption, ViewMode } from './components/MyAds/AdsToolbar';
import { AdCardGrid } from './components/MyAds/AdCardGrid';
import { AdCardList } from './components/MyAds/AdCardList';
import { EmptyState } from './components/MyAds/EmptyState';
import styled from 'styled-components';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const ContentSection = styled.div`
  padding: 2rem 1rem;
  margin-top: 0;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1<{ $isDark?: boolean }>`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ $isDark }) => $isDark ? '#e2e8f0' : '#1e293b'};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const AddButton = styled.button<{ $isDark?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ff8f10;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);

  &:hover {
    background: #ff7900;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.4);
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

const PowerBar = styled.div<{ $isDark?: boolean }>`
  margin-bottom: 2rem;
  background: ${({ $isDark }) => $isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'};
  border: 1px solid ${({ $isDark }) => $isDark ? '#22c55e' : '#4ade80'};
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PowerBarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PowerBarTitle = styled.h3<{ $isDark?: boolean }>`
  margin: 0;
  color: ${({ $isDark }) => $isDark ? '#4ade80' : '#15803d'};
  font-size: 1.125rem;
  font-weight: 700;
`;

const PowerBarStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #64748b;
`;

const ProgressBar = styled.div<{ $percentage: number; $isDark?: boolean }>`
  width: 100px;
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${({ $percentage }) => $percentage}%;
    height: 100%;
    background: ${({ $percentage, $isDark }) =>
    $percentage > 80
      ? '#ef4444'
      : ($isDark ? '#22c55e' : '#15803d')};
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const ViewModeToggle = styled.div<{ $isDark?: boolean }>`
  display: flex;
  background: ${({ $isDark }) => $isDark ? '#1e293b' : '#ffffff'};
  border-radius: 8px;
  border: 1px solid ${({ $isDark }) => $isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
  overflow: hidden;
`;

const ViewModeButton = styled.button<{ $active: boolean; $isDark?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${({ $active, $isDark }) =>
    $active
      ? ($isDark ? '#475569' : '#ff8f10')
      : 'transparent'};
  color: ${({ $active }) => $active ? '#ffffff' : '#64748b'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ProfileMyAds: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const params = useParams<{ userId?: string }>();
  const { userCars, isOwnProfile, loadUserCars, user } = useProfile(params.userId);
  const { profileType, permissions, isDealer, isCompany, getProgressToLimit } = useProfileType();

  // State management
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMatrix, setShowMatrix] = useState(false);

  // Convert and process cars
  const unifiedCars: UnifiedCar[] = useMemo(() => {
    let cars = ((userCars || []) as any[]).map((car: any) => ({
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
      featuredImageIndex: typeof car.featuredImageIndex === 'number' ? car.featuredImageIndex : 0,
      mainImage: car.images?.[car.featuredImageIndex || 0] || car.images?.[0] || car.mainImage,
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
      cars = cars.filter((car: any) => car.isActive === true && car.isSold !== true);
    } else if (filterBy === 'sold') {
      cars = cars.filter((car: any) => car.isSold === true);
    } else if (filterBy === 'pending') {
      cars = cars.filter((car: any) => car.status === 'pending' || car.isActive === false);
    }

    // Apply sort
    const sorted = [...cars].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'nameAsc':
          return `${a.make || ''} ${a.model || ''}`.trim().toLowerCase().localeCompare(`${b.make || ''} ${b.model || ''}`.trim().toLowerCase());
        case 'nameDesc':
          return `${b.make || ''} ${b.model || ''}`.trim().toLowerCase().localeCompare(`${a.make || ''} ${a.model || ''}`.trim().toLowerCase());
        case 'priceLow':
          return (a.price || 0) - (b.price || 0);
        case 'priceHigh':
          return (b.price || 0) - (a.price || 0);
        case 'yearNew':
          return (b.year || 0) - (a.year || 0);
        case 'yearOld':
          return (a.year || 0) - (b.year || 0);
        case 'make':
          return (a.make || '').toLowerCase().localeCompare((b.make || '').toLowerCase());
        case 'model':
          return (a.model || '').toLowerCase().localeCompare((b.model || '').toLowerCase());
        default:
          return 0;
      }
    });

    return sorted;
  }, [userCars, sortBy, filterBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = unifiedCars.filter(c => c.isActive && !c.isSold).length;
    const totalViews = unifiedCars.reduce((sum, car) => sum + ((car as any).views || 0), 0);
    const totalMessages = unifiedCars.reduce((sum, car) => sum + ((car as any).messages || 0), 0);
    return {
      active,
      totalViews,
      totalMessages,
      totalListings: unifiedCars.length
    };
  }, [unifiedCars]);

  // Clone handler
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
      loadUserCars();
    } catch (err) {
      logger.error('Clone failed', err as Error);
      toast.error(language === 'bg' ? 'Грешка при клониране' : 'Clone failed');
    }
  };

  // View handler
  const handleView = (car: UnifiedCar) => {
    const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
    const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId;

    if (sellerNumericId && carNumericId) {
      window.open(`/car/${sellerNumericId}/${carNumericId}`, '_blank');
    } else {
      // ⛔ CONSTITUTION VIOLATION: Car missing numeric IDs
      logger.error('Car missing numeric IDs - data integrity issue', new Error('Invalid car data'), { carId: car.id, car });
      toast.error('This listing has invalid data. Please contact support.');
    }
  };

  // Edit handler
  const handleEdit = (car: UnifiedCar) => {
    import('../../../../utils/routing-utils').then(({ getCarUrlFromUnifiedCar }) => {
      navigate(`${getCarUrlFromUnifiedCar(car)}/edit`);
    });
  };

  // Limit progress
  const listingStats = getProgressToLimit ? getProgressToLimit('listings') : { used: 0, total: 3, percentage: 0 };

  return (
    <ThemeAwareWrapper profileType={profileType} isDark={isDark}>
      <PageContainer>
        <ContentSection>
          {/* Power Bar for Dealers & Companies */}
          {(isDealer || isCompany) && (
            <PowerBar $isDark={isDark}>
              <PowerBarContent>
                <PowerBarTitle $isDark={isDark}>
                  {language === 'bg' ? 'Професионален Панел' : 'Professional Dashboard'}
                </PowerBarTitle>
                <PowerBarStats>
                  <span>
                    {language === 'bg' ? 'Месечна квота' : 'Monthly Quota'}: <strong>{listingStats.used} / {listingStats.total === 999 ? '∞' : listingStats.total}</strong>
                  </span>
                  <ProgressBar $percentage={listingStats.percentage} $isDark={isDark} />
                </PowerBarStats>
              </PowerBarContent>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {permissions.canBulkUpload && (
                  <AddButton $isDark={isDark} onClick={() => setShowMatrix(true)} style={{ background: '#2563eb' }}>
                    <ArrowUpDown size={18} />
                    {language === 'bg' ? 'Масово Качване' : 'Bulk Upload'}
                  </AddButton>
                )}
                <ViewModeToggle $isDark={isDark}>
                  <ViewModeButton
                    $active={viewMode === 'grid'}
                    $isDark={isDark}
                    onClick={() => setViewMode('grid')}
                  >
                    {language === 'bg' ? 'Мрежа' : 'Grid'}
                  </ViewModeButton>
                  <ViewModeButton
                    $active={viewMode === 'list'}
                    $isDark={isDark}
                    onClick={() => setViewMode('list')}
                  >
                    {language === 'bg' ? 'Списък' : 'List'}
                  </ViewModeButton>
                </ViewModeToggle>
              </div>
            </PowerBar>
          )}

          {/* Header */}
          <HeaderSection>
            <Title $isDark={isDark}>
              {language === 'bg' ? 'Моите обяви' : 'My Ads'}
            </Title>
            {isOwnProfile && (
              <AddButton $isDark={isDark} onClick={() => navigate('/sell')}>
                <Plus size={18} />
                {language === 'bg' ? 'Добави нова' : 'Add New'}
              </AddButton>
            )}
          </HeaderSection>

          {/* Stats Summary */}
          {unifiedCars.length > 0 && (
            <AdsStatsSummary
              activeCount={stats.active}
              totalViews={stats.totalViews}
              totalMessages={stats.totalMessages}
              totalListings={stats.totalListings}
              isDark={isDark}
            />
          )}

          {/* Toolbar */}
          {unifiedCars.length > 0 && (
            <AdsToolbar
              sortBy={sortBy}
              filterBy={filterBy}
              viewMode={viewMode}
              onSortChange={setSortBy}
              onFilterChange={setFilterBy}
              onViewModeChange={setViewMode}
              isDark={isDark}
            />
          )}

          {/* Matrix Modal */}
          {showMatrix && (
            <BulkUploadWizard
              onCancel={() => setShowMatrix(false)}
              onComplete={(result) => {
                setShowMatrix(false);
                // Refresh cars list after successful import
                if (result.successful > 0) {
                  window.location.reload();
                }
              }}
            />
          )}

          {/* Content */}
          {unifiedCars.length === 0 ? (
            <EmptyState
              isOwnProfile={isOwnProfile}
              onAddNew={() => navigate('/sell')}
              isDark={isDark}
              isFiltered={filterBy !== 'all' || sortBy !== 'newest'}
              onClearFilters={() => {
                setFilterBy('all');
                setSortBy('newest');
              }}
            />
          ) : viewMode === 'grid' ? (
            <AdCardGrid
              cars={unifiedCars}
              isOwnProfile={isOwnProfile}
              onView={handleView}
              onEdit={handleEdit}
              onClone={permissions.canCloneListing ? handleClone : undefined}
            />
          ) : (
            <AdCardList
              cars={unifiedCars}
              isOwnProfile={isOwnProfile}
              onView={handleView}
              onEdit={handleEdit}
              onClone={permissions.canCloneListing ? handleClone : undefined}
              isDark={isDark}
            />
          )}
        </ContentSection>
      </PageContainer>
    </ThemeAwareWrapper>
  );
};

export default ProfileMyAds;
