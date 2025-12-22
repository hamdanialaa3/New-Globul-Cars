import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from 'styled-components';
import {
  Heart,
  Grid,
  List,
  Trash2,
  ExternalLink,
  TrendingDown,
  MapPin,
  Gauge,
  Fuel,
  Euro,
  Search,
  Calendar,
  SlidersHorizontal,
  Zap
} from 'lucide-react';

import { useFavorites } from '../../../../hooks/useFavorites';
import { useAuth } from '../../../../contexts/AuthProvider';
import { logger } from '../../../../services/logger-service';
import { getCarDetailsUrl } from '../../../../utils/routing-utils';

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotateGear = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(160deg, #050914 0%, #0b1224 50%, #05070f 100%)' 
    : '#f8f9fa'};
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.primary 
    : '#1a1a1a'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Hero = styled.div`
  position: relative;
  margin-bottom: 48px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(11, 95, 255, 0.1) 0%, rgba(0, 196, 140, 0.05) 100%)'
    : 'white'};
  padding: 40px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(107, 114, 128, 0.3)' 
    : '#e0e0e0'};
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 80px,
        ${({ theme }) => theme.mode === 'dark' 
          ? 'rgba(107, 114, 128, 0.1)' 
          : 'rgba(0, 0, 0, 0.03)'} 80px,
        ${({ theme }) => theme.mode === 'dark' 
          ? 'rgba(107, 114, 128, 0.1)' 
          : 'rgba(0, 0, 0, 0.03)'} 81px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 80px,
        ${({ theme }) => theme.mode === 'dark' 
          ? 'rgba(107, 114, 128, 0.1)' 
          : 'rgba(0, 0, 0, 0.03)'} 80px,
        ${({ theme }) => theme.mode === 'dark' 
          ? 'rgba(107, 114, 128, 0.1)' 
          : 'rgba(0, 0, 0, 0.03)'} 81px
      );
    mask: radial-gradient(ellipse at center, transparent 0%, black 100%);
    pointer-events: none;
    border-radius: 16px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 300px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #0B5FFF 0%, #00C48C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.secondary 
    : '#666'};
  margin: 0;
  transition: color 0.3s ease;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.grey[800] 
    : '#f0f0f0'};
  padding: 4px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
`;

const ViewButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active 
    ? (props.theme.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(11, 95, 255, 0.3), rgba(0, 196, 140, 0.2))'
      : 'white')
    : 'transparent'};
  color: ${props => props.$active 
    ? '#0B5FFF'
    : (props.theme.mode === 'dark' ? props.theme.colors.text.secondary : '#666')};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active 
    ? (props.theme.mode === 'dark'
      ? '0 4px 12px rgba(11, 95, 255, 0.2)'
      : '0 2px 8px rgba(11, 95, 255, 0.1)')
    : 'none'};

  &:hover {
    color: #0B5FFF;
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(11, 95, 255, 0.15)'
      : 'rgba(11, 95, 255, 0.08)'};
  }

  svg {
    width: 18px;
    height: 18px;
    color: currentColor;
    transition: color 0.2s ease;
  }
`;

const FilterSection = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(12, 18, 32, 0.78)'
    : 'white'};
  backdrop-filter: blur(14px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(107, 114, 128, 0.3)'
    : '#e0e0e0'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.6s ease-out;
  transition: all 0.3s ease;
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.primary 
    : '#333'};
  margin-bottom: 16px;
  transition: color 0.3s ease;

  svg {
    color: ${({ theme }) => theme.mode === 'dark' ? '#0B5FFF' : '#0066CC'};
    transition: color 0.3s ease;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FilterControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.secondary 
    : '#666'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? theme.colors.grey[700]
    : '#d0d0d0'};
  border-radius: 8px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? theme.colors.grey[800]
    : 'white'};
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.primary 
    : '#333'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0B5FFF;
  }

  &:focus {
    outline: none;
    border-color: #0B5FFF;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(11, 95, 255, 0.2)'
      : 'rgba(11, 95, 255, 0.1)'};
  }

  option {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a2e' : 'white'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#fff' : '#333'};
  }
`;

const FavoritesGrid = styled.div<{ view: 'grid' | 'list' }>`
  display: grid;
  gap: ${props => props.view === 'grid' ? '24px' : '16px'};
  grid-template-columns: ${props => 
    props.view === 'grid' 
      ? 'repeat(auto-fill, minmax(300px, 1fr))' 
      : '1fr'
  };
  animation: ${fadeInUp} 0.6s ease-out;
`;

const FavoriteCard = styled.div<{ view: 'grid' | 'list' }>`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(12, 18, 32, 0.6)'
    : 'white'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(107, 114, 128, 0.3)'
    : '#e0e0e0'};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: ${props => props.view === 'list' ? 'flex' : 'block'};
  gap: ${props => props.view === 'list' ? '20px' : '0'};
  backdrop-filter: blur(10px);

  &:hover {
    border-color: #0B5FFF;
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 8px 32px rgba(11, 95, 255, 0.2)'
      : '0 8px 24px rgba(0, 0, 0, 0.08)'};
  }
`;

const CarImage = styled.div<{ view: 'grid' | 'list'; image: string }>`
  width: ${props => props.view === 'list' ? '300px' : '100%'};
  height: ${props => props.view === 'list' ? '200px' : '220px'};
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(11, 95, 255, 0.1), rgba(0, 196, 140, 0.05))'
    : '#f0f0f0'};
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BadgeOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.5) 100%)'
    : 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  pointer-events: none;
`;

const PriceDropBadge = styled.div`
  background: linear-gradient(135deg, #FF5858 0%, #DC3545 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(255, 88, 88, 0.3);

  svg {
    color: white;
  }
`;

const FavoriteIconWrapper = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(12, 18, 32, 0.9)'
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.4)'
    : 'rgba(0, 0, 0, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: all 0.3s ease;

  svg {
    color: #FF0000;
    fill: #FF0000;
  }
`;

const CarContent = styled.div`
  padding: 20px;
  flex: 1;
`;

const CarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.primary 
    : '#333'};
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
`;

const CarPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #0B5FFF 0%, #00C48C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: #0B5FFF;
  }
`;

const OldPrice = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.secondary 
    : '#999'};
  text-decoration: line-through;
  font-weight: 400;
  background: none;
  -webkit-text-fill-color: unset;
  transition: color 0.3s ease;
`;

const CarDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(107, 114, 128, 0.2)'
    : '#e0e0e0'};
  transition: border-color 0.3s ease;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.secondary 
    : '#666'};
  transition: color 0.3s ease;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#0B5FFF' : '#0066CC'};
    transition: color 0.3s ease;
  }
`;

const CarActions = styled.div`
  display: flex;
  gap: 8px;
`;

const CardButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => 
    props.variant === 'primary' 
      ? 'linear-gradient(135deg, #0B5FFF 0%, #00C48C 100%)'
      : 'linear-gradient(135deg, #FF5858 0%, #DC3545 100%)'
  };
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.variant === 'primary'
        ? '0 4px 12px rgba(11, 95, 255, 0.3)'
        : '0 4px 12px rgba(255, 88, 88, 0.3)'};
  }

  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 24px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.primary 
    : '#333'};
  margin-bottom: 12px;
  transition: color 0.3s ease;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.secondary 
    : '#666'};
  margin-bottom: 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  transition: color 0.3s ease;
`;

const EmptyButton = styled.button`
  background: linear-gradient(135deg, #0B5FFF 0%, #00C48C 100%);
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
    box-shadow: 0 8px 20px rgba(11, 95, 255, 0.3);
  }

  svg {
    width: 18px;
    height: 18px;
    color: white;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  animation: ${rotateGear} 2s linear infinite;
  
  svg {
    width: 100%;
    height: 100%;
    color: ${({ theme }) => theme.mode === 'dark' ? '#0B5FFF' : '#0066CC'};
    transition: color 0.3s ease;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.mode === 'dark' 
    ? theme.colors.text.secondary 
    : '#666'};
  transition: color 0.3s ease;
`;

// ============================================================================
// FILTER TYPES
// ============================================================================

interface FilterState {
  sortBy: 'newest' | 'oldest' | 'priceLow' | 'priceHigh' | 'name';
  priceRange: 'all' | 'under10' | '10-20' | '20-50' | 'over50';
  fuelType: 'all' | 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'all' | 'manual' | 'automatic';
  searchQuery: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();
  
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'newest',
    priceRange: 'all',
    fuelType: 'all',
    transmission: 'all',
    searchQuery: ''
  });

  // Filtered and sorted favorites
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(fav =>
        fav.carData.title.toLowerCase().includes(query) ||
        fav.carData.make.toLowerCase().includes(query) ||
        fav.carData.model.toLowerCase().includes(query)
      );
    }

    // Fuel type filter
    if (filters.fuelType !== 'all') {
      result = result.filter(fav =>
        fav.carData.fuelType?.toLowerCase() === filters.fuelType
      );
    }

    // Transmission filter
    if (filters.transmission !== 'all') {
      result = result.filter(fav =>
        fav.carData.transmission?.toLowerCase() === filters.transmission
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      result = result.filter(fav => {
        const price = fav.carData.price;
        switch (filters.priceRange) {
          case 'under10': return price < 10000;
          case '10-20': return price >= 10000 && price < 20000;
          case '20-50': return price >= 20000 && price < 50000;
          case 'over50': return price >= 50000;
          default: return true;
        }
      });
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const aTime = (a.addedAt as { seconds: number }).seconds || 0;
          const bTime = (b.addedAt as { seconds: number }).seconds || 0;
          return bTime - aTime;
        });
        break;
      case 'oldest':
        result.sort((a, b) => {
          const aTime = (a.addedAt as { seconds: number }).seconds || 0;
          const bTime = (b.addedAt as { seconds: number }).seconds || 0;
          return aTime - bTime;
        });
        break;
      case 'priceLow':
        result.sort((a, b) => a.carData.price - b.carData.price);
        break;
      case 'priceHigh':
        result.sort((a, b) => b.carData.price - a.carData.price);
        break;
      case 'name':
        result.sort((a, b) => a.carData.title.localeCompare(b.carData.title));
        break;
    }

    return result;
  }, [favorites, filters]);

  const handleRemove = async (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    if (window.confirm('Remove from favorites?')) {
      await removeFavorite(carId);
      logger.info('Favorite removed', { carId });
    }
  };

  const handleViewCar = (carId: string) => {
    logger.info('Navigating to car details', { carId });
    const car = favorites.find(f => f.id === carId);
    if (car) {
      navigate(getCarDetailsUrl(car));
    }
  };

  const getPriceDrop = (fav: { originalPrice: number; carData: { price: number } }) => {
    if (fav.originalPrice > fav.carData.price) {
      const drop = fav.originalPrice - fav.carData.price;
      const percent = Math.round((drop / fav.originalPrice) * 100);
      return { drop, percent };
    }
    return null;
  };

  if (!currentUser) {
    return (
      <PageContainer>
        <EmptyStateContainer>
          <EmptyIcon>🔐</EmptyIcon>
          <EmptyTitle>Sign in to view favorites</EmptyTitle>
          <EmptyText>You need to be logged in to save and view your favorite cars</EmptyText>
          <EmptyButton onClick={() => navigate('/login')}>
            <Heart size={20} />
            Sign In
          </EmptyButton>
        </EmptyStateContainer>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner>
            <Zap />
          </LoadingSpinner>
          <LoadingText>Loading your favorites...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (favorites.length === 0) {
    return (
      <PageContainer>
        <EmptyStateContainer>
          <EmptyIcon>❤️</EmptyIcon>
          <EmptyTitle>No Favorites Yet</EmptyTitle>
          <EmptyText>
            Start adding cars to your favorites by clicking the heart icon
          </EmptyText>
          <EmptyButton onClick={() => navigate('/cars')}>
            <Search size={20} />
            Browse Cars
          </EmptyButton>
        </EmptyStateContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Hero>
        <HeroContent>
          <TitleSection>
            <Title>
              <Heart size={32} fill="#FF0000" color="#FF0000" />
              My Favorites ({filteredFavorites.length})
            </Title>
            <Subtitle>Your collection of saved cars</Subtitle>
          </TitleSection>
          
          <Controls>
            <ViewToggle>
              <ViewButton
                $active={view === 'grid'}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                <Grid />
                <span>Grid</span>
              </ViewButton>
              <ViewButton
                $active={view === 'list'}
                onClick={() => setView('list')}
                title="List view"
              >
                <List />
                <span>List</span>
              </ViewButton>
            </ViewToggle>
          </Controls>
        </HeroContent>
      </Hero>

      {/* FILTER SECTION */}
      <FilterSection>
        <FilterTitle>
          <SlidersHorizontal size={16} />
          Filter & Sort
        </FilterTitle>

        <FilterGrid>
          <FilterControl>
            <FilterLabel>Sort By</FilterLabel>
            <FilterSelect
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="name">Car Name A-Z</option>
            </FilterSelect>
          </FilterControl>

          <FilterControl>
            <FilterLabel>Price Range</FilterLabel>
            <FilterSelect
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value as FilterState['priceRange'] })}
            >
              <option value="all">All Prices</option>
              <option value="under10">Under €10,000</option>
              <option value="10-20">€10,000 - €20,000</option>
              <option value="20-50">€20,000 - €50,000</option>
              <option value="over50">Over €50,000</option>
            </FilterSelect>
          </FilterControl>

          <FilterControl>
            <FilterLabel>Fuel Type</FilterLabel>
            <FilterSelect
              value={filters.fuelType}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value as FilterState['fuelType'] })}
            >
              <option value="all">All Fuel Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </FilterSelect>
          </FilterControl>

          <FilterControl>
            <FilterLabel>Transmission</FilterLabel>
            <FilterSelect
              value={filters.transmission}
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value as FilterState['transmission'] })}
            >
              <option value="all">All Types</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </FilterSelect>
          </FilterControl>
        </FilterGrid>
      </FilterSection>

      {/* FAVORITES GRID */}
      <FavoritesGrid view={view}>
        {filteredFavorites.map((fav) => {
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
                <BadgeOverlay>
                  <div>
                    {priceDrop && (
                      <PriceDropBadge>
                        <TrendingDown size={14} />
                        -{priceDrop.percent}%
                      </PriceDropBadge>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <FavoriteIconWrapper>
                      <Heart size={20} />
                    </FavoriteIconWrapper>
                  </div>
                </BadgeOverlay>
              </CarImage>

              <CarContent onClick={(e) => e.stopPropagation()}>
                <CarTitle>{fav.carData.title}</CarTitle>
                
                <CarPrice>
                  <Euro size={20} />
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

                <CarActions>
                  <CardButton
                    variant="primary"
                    onClick={() => handleViewCar(fav.carId)}
                  >
                    <ExternalLink size={16} />
                    View
                  </CardButton>
                  <CardButton
                    variant="danger"
                    onClick={(e) => handleRemove(e, fav.carId)}
                  >
                    <Trash2 size={16} />
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

export default FavoritesPage;


