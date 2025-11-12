// Professional Garage Section - نفس تصميم MyListingsPage_Pro
// قسم الكراج الاحترافي

import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Car, 
  Edit2, 
  Trash2, 
  Eye, 
  Heart, 
  MapPin, 
  Activity,
  TrendingUp,
  Plus
} from 'lucide-react';
import { getCarLogoUrl } from '../../services/car-logo-service';

// ==================== TYPES ====================

export interface GarageCar {
  id: string;
  title?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency?: 'EUR';
  mainImage?: string;
  images?: (string | File)[];
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  horsepower?: number;  // ⚡ NEW: Mobile.de style
  power?: number;  // Alternative field name
  gearbox?: string;  // Alternative field name for transmission
  fuelConsumption?: number;  // ⚡ NEW: l/100km
  consumption?: number;  // Alternative field name
  co2Emissions?: number;  // ⚡ NEW: g CO₂/km
  emissions?: number;  // Alternative field name
  status: 'active' | 'sold' | 'draft' | 'pending';
  views?: number;
  favorites?: number;
  inquiries?: number;
  createdAt: Date;
  updatedAt?: Date;
  city?: string;
  region?: string;
  location?: {
    city?: string;
    region?: string;
  };
}

interface GarageSectionProps {
  cars: GarageCar[];
  onEdit?: (carId: string) => void;
  onDelete?: (carId: string) => void;
  onAddNew?: () => void;
}

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ==================== STYLED COMPONENTS ====================

const GarageContainer = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.6s ease-out;
  background: var(--bg-primary);
`;

const Header = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-primary) 100%);
  border-radius: 20px 20px 0 0;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const GarageIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const HeaderTitle = styled.div`
  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 800;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const AddButton = styled.button`
  background: white;
  color: #2c3e50;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #ecf0f1;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(44, 62, 80, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(44, 62, 80, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(44, 62, 80, 0.05);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  margin: 0 auto 0.5rem;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px ${props => props.$color}40;

  svg {
    color: white;
    width: 20px;
    height: 20px;
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2c3e50, #4ca1af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.3rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background: var(--bg-primary);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const CarCard = styled.div`
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-orange);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${CarCard}:hover & {
    transform: scale(1.1);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
`;

const CarLogo = styled.img`
  width: 90px;
  height: 90px;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(255, 255, 255, 0.4));
  animation: ${pulse} 3s ease-in-out  /* ⚡ OPTIMIZED: Removed infinite */;
`;

const CarLogoGlow = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  animation: ${pulse} 3s ease-in-out  /* ⚡ OPTIMIZED: Removed infinite */;
`;

const StatusBadge = styled.div<{ $status: string }>`
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  background: ${props => {
    switch (props.$status) {
      case 'sold': return 'linear-gradient(135deg, #e74c3c, #c0392b)';
      case 'active': return 'linear-gradient(135deg, #27ae60, #229954)';
      case 'draft': return 'linear-gradient(135deg, #f39c12, #e67e22)';
      default: return 'linear-gradient(135deg, #3498db, #2980b9)';
    }
  }};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

const CardContent = styled.div`
  padding: 1.25rem;
  background: var(--bg-card);
`;

const CarTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

const Price = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  letter-spacing: -0.5px;
  line-height: 1.2;
`;

const DetailsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;

  &:not(:last-child)::after {
    content: '';
    width: 1px;
    height: 14px;
    background: var(--border);
    margin-left: 16px;
  }

  svg {
    display: none; /* Hide icons for mobile.de style */
  }

  span {
    white-space: nowrap;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 0.6rem;
  background: rgba(44, 62, 80, 0.05);
  border-radius: 10px;
  margin-bottom: 0.8rem;
`;

const StatMini = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e74c3c;
  font-weight: 600;
  padding: 0.8rem 1rem;
  border-top: 1px solid #ecf0f1;
  font-size: 0.9rem;
  background: rgba(231, 76, 60, 0.05);
  border-radius: 0 0 15px 15px;
  margin: 0 -1rem -1rem -1rem;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem;
  background: rgba(44, 62, 80, 0.03);
  border-top: 1px solid #ecf0f1;
  margin: 0 -1rem -1rem -1rem;
  border-radius: 0 0 20px 20px;
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'view' }>`
  flex: 1;
  padding: 0.4rem 0.3rem;
  border: none;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  white-space: nowrap;
  min-width: 0;

  ${props => {
    switch (props.$variant) {
      case 'edit':
        return `
          background: linear-gradient(135deg, #2c3e50, #4ca1af);
          color: white;
          box-shadow: 0 3px 10px rgba(44, 62, 80, 0.3);
          &:hover {
            box-shadow: 0 5px 15px rgba(44, 62, 80, 0.4);
            transform: translateY(-2px);
          }
        `;
      case 'delete':
        return `
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3);
          &:hover {
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
            transform: translateY(-2px);
          }
        `;
      case 'view':
        return `
          background: white;
          color: #2c3e50;
          border: 2px solid #2c3e50;
          &:hover {
            background: #2c3e50;
            color: white;
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: #f8f9fa;
          color: #2c3e50;
          &:hover { background: #e9ecef; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  padding: 5rem 2rem;
  text-align: center;
  background: white;
  border-radius: 0 0 20px 20px;

  h3 {
    font-size: 2rem;
    background: linear-gradient(135deg, #2c3e50, #4ca1af);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    font-weight: 800;
  }

  p {
    font-size: 1.1rem;
    color: #7f8c8d;
    margin-bottom: 2rem;
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #2c3e50, #4ca1af);
  background-size: 200% 200%;
  animation: ${gradientShift} 4s ease  /* ⚡ OPTIMIZED: Removed infinite */;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(44, 62, 80, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(44, 62, 80, 0.4);
  }
`;

// ==================== COMPONENT ====================

export const GarageSectionPro: React.FC<GarageSectionProps> = ({ 
  cars = [],
  onEdit,
  onDelete,
  onAddNew
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Statistics
  const stats = useMemo(() => ({
    total: cars.length,
    active: cars.filter(c => c.status === 'active').length,
    sold: cars.filter(c => c.status === 'sold').length,
    totalViews: cars.reduce((sum, c) => sum + (c.views || 0), 0),
    totalFavorites: cars.reduce((sum, c) => sum + (c.favorites || 0), 0)
  }), [cars]);

  // Get image or logo
  const getCarVisual = (car: GarageCar): { type: 'image' | 'logo'; url: string } => {
    // Try actual image first
    if (car.mainImage) {
      return { type: 'image', url: car.mainImage };
    }
    if (car.images && car.images.length > 0) {
      const firstImage = car.images[0];
      if (typeof firstImage === 'string') {
        const imageUrl = firstImage as string;
        if (imageUrl.trim()) {
          return { type: 'image', url: imageUrl };
        }
      }
    }
    
    // Fallback to car logo
    return { type: 'logo', url: getCarLogoUrl(car.make) };
  };

  // Get location
  const getLocation = (car: GarageCar): string => {
    if (car.location?.city && car.location?.region) {
      return `${car.location.city}, ${car.location.region}`;
    }
    if (car.city && car.region) {
      return `${car.city}, ${car.region}`;
    }
    if (car.city) return car.city;
    if (car.region) return car.region;
    return language === 'bg' ? 'Неизвестно' : 'Unknown';
  };

  // Get status text
  const getStatusText = (status: string) => {
    const statusMap: Record<string, { bg: string; en: string }> = {
      active: { bg: 'Активна', en: 'Active' },
      sold: { bg: 'Продадена', en: 'Sold' },
      draft: { bg: 'Чернова', en: 'Draft' },
      pending: { bg: 'В изчакване', en: 'Pending' }
    };
    return language === 'bg' ? statusMap[status]?.bg : statusMap[status]?.en;
  };

  const handleView = (carId: string) => {
    navigate(`/car/${carId}`);
  };

  const handleEdit = (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(carId);
    } else {
      navigate(`/edit-listing/${carId}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    if (window.confirm(language === 'bg' 
      ? 'Сигурни ли сте, че искате да изтриете тази обява?' 
      : 'Are you sure you want to delete this listing?')) {
      if (onDelete) {
        onDelete(carId);
      }
    }
  };

  return (
    <GarageContainer>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <GarageIcon>
            <Car />
          </GarageIcon>
          <HeaderTitle>
            <h2>{language === 'bg' ? 'Моят гараж' : 'My Garage'}</h2>
            <p>{stats.total} {language === 'bg' ? 'автомобила' : 'vehicles'}</p>
          </HeaderTitle>
        </HeaderLeft>
        <AddButton onClick={onAddNew}>
          <Plus size={20} />
          {language === 'bg' ? 'Добави кола' : 'Add Car'}
        </AddButton>
      </Header>

      {/* Statistics */}
      {cars.length > 0 && (
        <StatsBar>
          <StatCard>
            <StatIcon $color="linear-gradient(135deg, #27ae60, #229954)">
              <Activity size={20} />
            </StatIcon>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>{language === 'bg' ? 'Активни' : 'Active'}</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon $color="linear-gradient(135deg, #3498db, #2980b9)">
              <TrendingUp size={20} />
            </StatIcon>
            <StatValue>{stats.sold}</StatValue>
            <StatLabel>{language === 'bg' ? 'Продадени' : 'Sold'}</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon $color="linear-gradient(135deg, #9b59b6, #8e44ad)">
              <Eye size={20} />
            </StatIcon>
            <StatValue>{stats.totalViews}</StatValue>
            <StatLabel>{language === 'bg' ? 'Прегледи' : 'Views'}</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon $color="linear-gradient(135deg, #e74c3c, #c0392b)">
              <Heart size={20} />
            </StatIcon>
            <StatValue>{stats.totalFavorites}</StatValue>
            <StatLabel>{language === 'bg' ? 'Любими' : 'Favorites'}</StatLabel>
          </StatCard>
        </StatsBar>
      )}

      {/* Cars Grid */}
      {cars.length > 0 ? (
        <CarsGrid>
          {cars.map(car => {
            const visual = getCarVisual(car);
            
            return (
              <CarCard key={car.id} onClick={() => handleView(car.id)}>
                {/* Image/Logo */}
                <ImageContainer>
                  {visual.type === 'image' ? (
                    <CarImage src={visual.url} alt={`${car.make} ${car.model}`} />
                  ) : (
                    <ImagePlaceholder>
                      <CarLogoGlow />
                      <CarLogo src={visual.url} alt={car.make} />
                    </ImagePlaceholder>
                  )}
                  
                  {car.status && (
                    <StatusBadge $status={car.status}>
                      {getStatusText(car.status)}
                    </StatusBadge>
                  )}
                </ImageContainer>

                {/* Content */}
                <CardContent>
                  {/* Title */}
                  <CarTitle>{car.make} {car.model}</CarTitle>
                  
                  {/* Price */}
                  <Price>
                    {car.price.toLocaleString('bg-BG')} {car.currency || 'EUR'}
                  </Price>
                  
                  {/* Fuel Type Badge */}
                  {car.fuelType && (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      marginBottom: '12px',
                      color: 'var(--text-primary)'
                    }}>
                      {car.fuelType}
                    </div>
                  )}

                  {/* Specs - Mobile.de style */}
                  <DetailsGrid>
                    {(car.horsepower || car.power) && (
                      <DetailItem>
                        <span>{car.horsepower || car.power} hp</span>
                      </DetailItem>
                    )}
                    {(car.transmission || car.gearbox) && (
                      <DetailItem>
                        <span>{car.transmission || car.gearbox}</span>
                      </DetailItem>
                    )}
                    {car.mileage !== undefined && (
                      <DetailItem>
                        <span>{car.mileage.toLocaleString('bg-BG')} km</span>
                      </DetailItem>
                    )}
                  </DetailsGrid>
                  
                  {/* Consumption & Emissions */}
                  {((car.fuelConsumption || car.consumption) || (car.co2Emissions || car.emissions)) && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border)'
                    }}>
                      {(car.fuelConsumption || car.consumption) && `${car.fuelConsumption || car.consumption} l/100km (comb.)`}
                      {(car.fuelConsumption || car.consumption) && (car.co2Emissions || car.emissions) && ' • '}
                      {(car.co2Emissions || car.emissions) && `${car.co2Emissions || car.emissions} g CO₂/km (comb.)`}
                    </div>
                  )}

                  {/* Mini Stats */}
                  <StatsRow>
                    <StatMini>
                      <Eye size={16} />
                      <span>{car.views || 0}</span>
                    </StatMini>
                    <StatMini>
                      <Heart size={16} />
                      <span>{car.favorites || 0}</span>
                    </StatMini>
                  </StatsRow>

                  <Location>
                    <MapPin />
                    <span>{getLocation(car)}</span>
                  </Location>
                </CardContent>

                {/* Actions */}
                <ActionsBar>
                  <ActionButton 
                    $variant="view" 
                    onClick={(e) => { e.stopPropagation(); handleView(car.id); }}
                    title={language === 'bg' ? 'Преглед' : 'View'}
                  >
                    <Eye size={12} />
                  </ActionButton>
                  <ActionButton 
                    $variant="edit" 
                    onClick={(e) => handleEdit(e, car.id)}
                    title={language === 'bg' ? 'Редактирай' : 'Edit'}
                  >
                    <Edit2 size={12} />
                  </ActionButton>
                  <ActionButton 
                    $variant="delete" 
                    onClick={(e) => handleDelete(e, car.id)}
                    title={language === 'bg' ? 'Изтрий' : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </ActionButton>
                </ActionsBar>
              </CarCard>
            );
          })}
        </CarsGrid>
      ) : (
        <EmptyState>
          <h3>{language === 'bg' ? 'Няма автомобили' : 'No Vehicles'}</h3>
          <p>
            {language === 'bg'
              ? 'Все още нямате добавени автомобили в гаража си.'
              : 'You don\'t have any vehicles in your garage yet.'}
          </p>
          <CreateButton onClick={onAddNew}>
            <Plus size={20} />
            {language === 'bg' ? 'Добави първата кола' : 'Add First Car'}
          </CreateButton>
        </EmptyState>
      )}
    </GarageContainer>
  );
};

export default GarageSectionPro;

