// Favorites Page - Premium UI
// World-Class Implementation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useFavorites } from '@/hooks/useFavorites';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Heart,
  Grid,
  List,
  Trash2,
  ExternalLink,
  TrendingDown,
  Clock,
  MapPin,
  Gauge,
  Fuel,
  Euro,
  Search,
  Calendar,
  Loader2
} from 'lucide-react';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 8px;
`;

const ViewButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#005ca9' : '#6c757d'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #005ca9;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const FavoritesGrid = styled.div<{ view: 'grid' | 'list' }>`
  display: grid;
  gap: ${props => props.view === 'grid' ? '24px' : '16px'};
  grid-template-columns: ${props => 
    props.view === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr'
  };
`;

const FavoriteCard = styled.div<{ view: 'grid' | 'list' }>`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: ${props => props.view === 'list' ? 'flex' : 'block'};
  gap: ${props => props.view === 'list' ? '20px' : '0'};

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #005ca9;
    transform: translateY(-4px);
  }
`;

const CarImage = styled.div<{ view: 'grid' | 'list'; image: string }>`
  width: ${props => props.view === 'list' ? '300px' : '100%'};
  height: ${props => props.view === 'list' ? '200px' : '220px'};
  background: var(--bg-secondary);
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PriceDropBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: #dc3545;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
`;

const FavoriteIconWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const CarContent = styled.div`
  padding: 20px;
  flex: 1;
`;

const CarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
`;

const CarPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #005ca9;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OldPrice = styled.span`
  font-size: 16px;
  color: #6c757d;
  text-decoration: line-through;
  font-weight: 400;
`;

const CarDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6c757d;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CarActions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f1f1;
`;

const CardButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => 
    props.variant === 'primary' ? '#005ca9' :
    props.variant === 'danger' ? '#dc3545' :
    '#f8f9fa'
  };
  color: ${props => 
    props.variant === 'primary' || props.variant === 'danger' ? 'white' : '#212529'
  };

  &:hover {
    background: ${props => 
      props.variant === 'primary' ? '#004080' :
      props.variant === 'danger' ? '#c82333' :
      '#e9ecef'
    };
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyStateComponent = styled.div`
  text-align: center;
  padding: 80px 16px;
`;

const EmptyIconLarge = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
`;

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { favorites, loading, removeFavorite } = useFavorites();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const handleRemove = async (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    if (window.confirm('Remove from favorites?')) {
      await removeFavorite(carId);
    }
  };

  const handleViewCar = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  const getPriceDrop = (fav: any) => {
    if (fav.originalPrice > fav.carData.price) {
      const drop = fav.originalPrice - fav.carData.price;
      const percent = Math.round((drop / fav.originalPrice) * 100);
      return { drop, percent };
    }
    return null;
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Loading favorites...</LoadingState>
      </PageContainer>
    );
  }

  if (favorites.length === 0) {
    return (
      <PageContainer>
        <EmptyStateComponent>
          <EmptyIconLarge>❤️</EmptyIconLarge>
          <EmptyTitle>No Favorites Yet</EmptyTitle>
          <EmptyText>
            Start adding cars to your favorites by clicking the heart icon ❤️
          </EmptyText>
          <EmptyButton onClick={() => navigate('/cars')}>
            <Search size={20} />
            Browse Cars
          </EmptyButton>
        </EmptyStateComponent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <TitleSection>
          <Title>
            <Heart size={32} fill="#dc3545" color="#dc354625" />
            My Favorites ({favorites.length})
          </Title>
          <Subtitle>Cars you've saved for later</Subtitle>
        </TitleSection>
        
        <ViewToggle>
          <ViewButton
            $active={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <Grid />
            Grid
          </ViewButton>
          <ViewButton
            $active={view === 'list'}
            onClick={() => setView('list')}
          >
            <List />
            List
          </ViewButton>
        </ViewToggle>
      </Header>

      <FavoritesGrid view={view}>
        {favorites.map((fav) => {
          const priceDrop = getPriceDrop(fav);
          
          return (
            <FavoriteCard
              key={fav.id}
              view={view}
              onClick={() => handleViewCar(fav.carId)}
            >
              <CarImage
                view={view}
                image={fav.carData.image || '/placeholder-car.jpg'}
              >
                {priceDrop && (
                  <PriceDropBadge>
                    <TrendingDown size={14} />
                    -{priceDrop.percent}%
                  </PriceDropBadge>
                )}
                <FavoriteIconWrapper>
                  <Heart size={20} fill="#dc3545" color="#dc3545" />
                </FavoriteIconWrapper>
              </CarImage>

              <CarContent>
                <CarTitle>{fav.carData.title}</CarTitle>
                
                <CarPrice>
                  <Euro />
                  {fav.carData.price.toLocaleString()}
                  {priceDrop && (
                    <OldPrice>
                      €{fav.originalPrice.toLocaleString()}
                    </OldPrice>
                  )}
                </CarPrice>

                <CarDetails>
                  <DetailItem>
                    <Calendar />
                    {fav.carData.year}
                  </DetailItem>
                  <DetailItem>
                    <Gauge />
                    {fav.carData.mileage.toLocaleString()} km
                  </DetailItem>
                  <DetailItem>
                    <MapPin />
                    {fav.carData.location}
                  </DetailItem>
                  {fav.carData.fuelType && (
                    <DetailItem>
                      <Fuel />
                      {fav.carData.fuelType}
                    </DetailItem>
                  )}
                </CarDetails>

                <CarActions onClick={(e) => e.stopPropagation()}>
                  <CardButton
                    variant="primary"
                    onClick={() => handleViewCar(fav.carId)}
                  >
                    <ExternalLink />
                    View
                  </CardButton>
                  <CardButton
                    variant="danger"
                    onClick={(e) => handleRemove(e, fav.carId)}
                  >
                    <Trash2 />
                    Remove
                  </CardButton>
                </CarActions>
              </CarContent>
            </FavoriteCard>
          );
        })}
      </FavoritesGrid>
    </PageContainer>
  );
};

// Loading and Empty States
const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #6c757d;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  color: #212529;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const EmptyButton = styled.button`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export default FavoritesPage;


