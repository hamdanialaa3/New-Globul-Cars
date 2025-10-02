// My Listings Page - User's Car Listings
// صفحة إعلانات المستخدم

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthProvider';
import { useLanguage } from '../contexts/LanguageContext';
import carListingService from '../services/carListingService';
import { CarListing } from '../types/CarListing';
import CarCard from '../components/CarCard';

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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
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

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's listings
  useEffect(() => {
    const loadListings = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading user listings...');

        const userListings = await carListingService.getListingsBySeller(user.email || '');
        setListings(userListings);

        console.log(`✅ Loaded ${userListings.length} listings`);
      } catch (err: any) {
        console.error('❌ Error loading listings:', err);
        setError(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [user, navigate]);

  // Calculate statistics
  const activeListings = listings.filter(l => l.status === 'active').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalFavorites = listings.reduce((sum, l) => sum + (l.favorites || 0), 0);

  // Handle create new listing
  const handleCreateListing = () => {
    navigate('/sell');
  };

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
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
            <strong>⚠️ {language === 'bg' ? 'Грешка' : 'Error'}</strong><br/>
            {error}
          </ErrorCard>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <EmptyState>
            <h3>🚗 {language === 'bg' ? 'Нямате обяви' : 'No listings yet'}</h3>
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
                <CarCard key={listing.id} car={listing} />
              ))}
            </CarsGrid>
          </>
        )}

      </ContentWrapper>
    </PageContainer>
  );
};

export default MyListingsPage;
