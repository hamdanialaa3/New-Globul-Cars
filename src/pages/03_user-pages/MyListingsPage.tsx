// My Listings Page - User's Car Listings
// صفحة إعلانات المستخدم

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { unifiedCarService } from '../../services/car';
import { CarListing } from '../../types/CarListing';
import { CarIcon } from '../../components/icons/CarIcon';
import CarCardGermanStyle from '../../components/CarCard/CarCardGermanStyle';
import { logger } from '../../services/logger-service';
import { getCarDetailsUrl } from '../../utils/routing-utils';
import { usePullToRefresh } from '../../hooks/useMobileInteractions';
import { PullToRefreshIndicator } from '../../components/mobile/PullToRefreshIndicator';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 150px;

  @media (max-width: 768px) {
    min-width: 120px;
    padding: 1rem 1.5rem;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const CarsGrid = styled.div`
  display: grid;
  gap: 20px;
  margin: 2rem 0;
  grid-template-columns: 1fr; /* xs */

  @media (min-width: 600px) { /* sm */
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 900px) { /* md */
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1200px) { /* lg/xl */
    grid-template-columns: repeat(4, 1fr);
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
  color: #7f8c8d;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;

  h3 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #7f8c8d;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorCard = styled.div`
  background: #fee;
  border: 2px solid #fcc;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  color: #c00;
  text-align: center;
`;

const ListingCardWrapper = styled.div`
  position: relative;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'view' | 'edit' | 'delete' }>`
  background: ${props => {
    if (props.$variant === 'delete') return '#e74c3c';
    if (props.$variant === 'edit') return '#2563EB';
    return '#667eea';
  }};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    background: ${props => {
    if (props.$variant === 'delete') return '#c0392b';
    if (props.$variant === 'edit') return '#e66a00';
    return '#5568d3';
  }};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pull-to-Refresh: Container ref
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Load user's listings function (extracted to be reusable)
  const loadListings = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Loading user listings', { email: user.email });
      }

      // ✅ Use unifiedCarService instead of carListingService
      // Get user's cars by sellerId (user.uid)
      const userListings = await unifiedCarService.getUserCars(user.uid);
      setListings(userListings as any[]);

      if (process.env.NODE_ENV === 'development') {
        // Debug first listing to check if numeric IDs are present
        if (userListings.length > 0) {
          logger.debug('User listings loaded. Check IDs:', {
            firstCarId: userListings[0].id,
            sellerNumericId: userListings[0].sellerNumericId,
            carNumericId: userListings[0].carNumericId
          });
        }
        logger.debug('Loaded user listings successfully', { count: userListings.length });
      }
    } catch (err: any) {
      logger.error('Error loading user listings', err as Error, { email: user.email });
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Pull-to-Refresh: Refresh handler
  const handleRefresh = async () => {
    try {
      logger.info('🔄 Pull-to-refresh: Refreshing listings');
      await loadListings();
      toast.success(
        language === 'bg'
          ? 'Обявите са актуализирани'
          : 'Listings refreshed'
      );
    } catch (error) {
      logger.error('❌ Pull-to-refresh: Failed to refresh', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при актуализиране'
          : 'Failed to refresh'
      );
    }
  };

  // Pull-to-Refresh: Hook
  const { pulling, refreshing } = usePullToRefresh(
    pageContainerRef,
    handleRefresh
  );

  // Calculate statistics
  const activeListings = listings.filter(l => l.status === 'active').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalFavorites = listings.reduce((sum, l) => sum + (l.favorites || 0), 0);

  // Handle create new listing
  const handleCreateListing = () => {
    navigate('/sell');
  };

  const handleViewDetails = (listing: CarListing) => {
    // ✅ FIX: Use unified URL generation logic to prevent mismatches
    // This ensures we always prioritize numeric IDs if available
    const url = getCarDetailsUrl({
      sellerNumericId: listing.sellerNumericId,
      carNumericId: listing.carNumericId || listing.numericId,
      sellerId: listing.sellerId,
      id: listing.id
    });
    navigate(url);
  };

  const handleEditListing = (listing: CarListing) => {
    navigate(`/edit-car/${listing.id}`);
  };

  const handleDeleteListing = async (carId: string) => {
    // Add logging
    logger.info('Delete requested for car', { carId });

    if (!window.confirm(language === 'bg'
      ? 'Сигурни ли сте, че искате да изтриете тази обява?'
      : 'Are you sure you want to delete this listing?')) {
      logger.info('Delete cancelled by user');
      return;
    }

    try {
      setLoading(true); // Show loading state briefly
      await unifiedCarService.deleteCar(carId);
      logger.info('Delete successful');

      // Refresh listings immediately
      await loadListings();
      toast.success(language === 'bg' ? 'Обявата е изтрита успешно!' : 'Listing deleted successfully!');
    } catch (err) {
      logger.error('Error deleting listing', err as Error, { carId });
      toast.error(language === 'bg' ? 'Грешка при изтриване: ' + (err as Error).message : 'Error deleting listing: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageContainer ref={pageContainerRef}>
      {/* Pull-to-Refresh Indicator */}
      <PullToRefreshIndicator 
        pulling={pulling}
        refreshing={refreshing}
        pullingText={language === 'bg' ? 'Издърпайте за опресняване' : 'Pull to refresh'}
        refreshingText={language === 'bg' ? 'Опресняване...' : 'Refreshing...'}
        position="top"
      />
      
      <ContentWrapper>
        {/* Header */}
        <Header>
          <Title>
            {language === 'bg' ? 'Моите обяви' : 'My Listings'}
          </Title>
          <Subtitle>
            {language === 'bg'
              ? 'Управлявайте вашите обяви за автомобили'
              : 'Manage your car listings'}
          </Subtitle>
        </Header>

        {/* Statistics */}
        {!loading && listings.length > 0 && (
          <StatsBar>
            <StatCard>
              <StatValue>{activeListings}</StatValue>
              <StatLabel>{language === 'bg' ? 'Активни' : 'Active'}</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{soldListings}</StatValue>
              <StatLabel>{language === 'bg' ? 'Продадени' : 'Sold'}</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{totalViews}</StatValue>
              <StatLabel>{language === 'bg' ? 'Прегледи' : 'Views'}</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{totalFavorites}</StatValue>
              <StatLabel>{language === 'bg' ? 'Любими' : 'Favorites'}</StatLabel>
            </StatCard>
          </StatsBar>
        )}

        {/* Loading State */}
        {loading && (
          <LoadingState>
            <div className="loading-spinner" />
            <p>{language === 'bg' ? 'Зареждане на обявите...' : 'Loading listings...'}</p>
          </LoadingState>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorCard>
            <strong>⚠️ {language === 'bg' ? 'Грешка' : 'Error'}</strong><br />
            {error}
          </ErrorCard>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <EmptyState>
            <CarIcon size={64} color="#2563EB" style={{ marginBottom: '16px', opacity: 0.6 }} />
            <h3>{language === 'bg' ? 'Нямате обяви' : 'No listings yet'}</h3>
            <p>
              {language === 'bg'
                ? 'Все още не сте създали обява за автомобил. Започнете сега и достигнете до хиляди потенциални купувачи!'
                : 'You haven\'t created any car listings yet. Start now and reach thousands of potential buyers!'}
            </p>
            <CreateButton onClick={handleCreateListing}>
              {language === 'bg' ? '+ Създай обява' : '+ Create Listing'}
            </CreateButton>
          </EmptyState>
        )}

        {/* Listings Grid */}
        {!loading && listings.length > 0 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <CreateButton onClick={handleCreateListing}>
                {language === 'bg' ? '+ Създай нова обява' : '+ Create New Listing'}
              </CreateButton>
            </div>

            <CarsGrid>
              {listings.map(listing => (
                <ListingCardWrapper key={listing.id}>
                  <ActionButtons style={{ zIndex: 100 }}>
                    <ActionButton
                      $variant="view"
                      onClick={(e) => {
                        e.stopPropagation();
                        // @ts-ignore
                        if (listing.id) handleViewDetails(listing);
                      }}
                      title={language === 'bg' ? 'Преглед' : 'View Details'}
                    >
                      👁️ {language === 'bg' ? 'Преглед' : 'View'}
                    </ActionButton>
                    <ActionButton
                      $variant="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        // @ts-ignore
                        if (listing.id) handleEditListing(listing);
                      }}
                      title={language === 'bg' ? 'Редактирай' : 'Edit'}
                    >
                      ✏️ {language === 'bg' ? 'Редактирай' : 'Edit'}
                    </ActionButton>
                    <ActionButton
                      $variant="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        logger.info('Delete button clicked', { id: listing.id });
                        if (listing.id) handleDeleteListing(listing.id);
                      }}
                      title={language === 'bg' ? 'Изтрий' : 'Delete'}
                    >
                      🗑️ {language === 'bg' ? 'Изтрий' : 'Delete'}
                    </ActionButton>
                  </ActionButtons>
                  <CarCardGermanStyle car={listing} />
                </ListingCardWrapper>
              ))}
            </CarsGrid>
          </>
        )}

      </ContentWrapper>
    </PageContainer>
  );
};

export default MyListingsPage;

