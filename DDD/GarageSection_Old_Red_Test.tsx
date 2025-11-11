// src/components/Profile/GarageSection.tsx
// Garage Section - قسم الكراج الاحترافي
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Car, 
  TrendingUp, 
  Clock, 
  Eye, 
  MessageCircle,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
  Filter,
  SortDesc,
  Plus
} from 'lucide-react';
import LazyImage from '../LazyImage';

// ==================== TYPES ====================

export interface GarageCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: 'EUR';
  mainImage?: string;
  mileage?: number;
  fuelType?: string;
  horsepower?: number;  // ⚡ NEW: For mobile.de style
  transmission?: string;  // ⚡ NEW: Automatic/Manual
  fuelConsumption?: number;  // ⚡ NEW: l/100km
  co2Emissions?: number;  // ⚡ NEW: g CO₂/km
  status: 'active' | 'sold' | 'draft' | 'pending';
  views?: number;
  inquiries?: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface GarageSectionProps {
  cars: GarageCar[];
  onEdit?: (carId: string) => void;
  onDelete?: (carId: string) => void;
  onAddNew?: () => void;
}

// ==================== STYLED COMPONENTS ====================

const GarageContainer = styled.div`
  width: 100%;
  background: red !important;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 10px solid red !important;
`;

const GarageHeader = styled.div`
  padding: 24px;
  background: red !important;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    filter: blur(40px);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    filter: blur(30px);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const GarageIcon = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const HeaderTitle = styled.div`
  h2 {
    margin: 0 0 4px 0;
    font-size: 1.75rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.95;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: var(--accent-orange);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: #fff;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const GarageStats = styled.div`
  padding: 20px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent-orange);
  }
  
  .stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--accent-orange);
    margin-bottom: 4px;
    display: block;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
`;

const GarageControls = styled.div`
  padding: 16px 24px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$active ? 'var(--accent-orange)' : 'var(--bg-card)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.$active ? 'var(--accent-orange)' : 'var(--border)'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'var(--accent-primary)' : 'var(--bg-secondary)'};
    border-color: var(--accent-orange);
  }
`;

const GarageGrid = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

const CarCardStyled = styled.div`
  background: red !important;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 5px solid yellow !important;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-orange);
  }
`;

const CarImage = styled.div`
  width: 100%;
  height: 200px;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: var(--border);
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  ${props => {
    switch (props.$status) {
      case 'active':
        return `
          background: rgba(76, 175, 80, 0.95);
          color: white;
        `;
      case 'sold':
        return `
          background: rgba(33, 150, 243, 0.95);
          color: white;
        `;
      case 'draft':
        return `
          background: rgba(158, 158, 158, 0.95);
          color: white;
        `;
      case 'pending':
        return `
          background: rgba(255, 152, 0, 0.95);
          color: white;
        `;
      default:
        return `
          background: rgba(0, 0, 0, 0.7);
          color: white;
        `;
    }
  }}
`;

const CarContent = styled.div`
  padding: 20px;
  background: var(--bg-card);
`;

const CarTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: red !important;
  line-height: 1.3;
`;

const CarPrice = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: red !important;
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  
  .price-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: white !important;
    background: red !important;
    padding: 2px 8px;
    border-radius: 4px;
  }
`;

const CarDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    
    &:not(:last-child)::after {
      content: '';
      width: 1px;
      height: 14px;
      background: var(--border);
      margin-left: 16px;
    }
  }
`;

const CarStats = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-secondary);
  
  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const CarActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: var(--accent-orange);
          color: white;
          &:hover {
            background: var(--accent-primary);
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          &:hover {
            background: var(--bg-card);
            border-color: var(--accent-orange);
          }
        `;
    }
  }}
`;

const EmptyGarage = styled.div`
  padding: 60px 24px;
  text-align: center;
  color: var(--text-secondary);
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
  }
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }
  
  p {
    margin: 0 0 24px 0;
    font-size: 1rem;
    color: var(--text-secondary);
  }
`;

// ==================== COMPONENT ====================

export const GarageSection: React.FC<GarageSectionProps> = ({ 
  cars = [],
  onEdit,
  onDelete,
  onAddNew
}) => {
  const { t, language } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold' | 'draft' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views'>('date');

  // Statistics
  const stats = useMemo(() => ({
    total: cars.length,
    active: cars.filter(c => c.status === 'active').length,
    sold: cars.filter(c => c.status === 'sold').length,
    draft: cars.filter(c => c.status === 'draft').length,
    pending: cars.filter(c => c.status === 'pending').length,
    totalViews: cars.reduce((sum, c) => sum + (c.views || 0), 0),
    totalInquiries: cars.reduce((sum, c) => sum + (c.inquiries || 0), 0)
  }), [cars]);

  // Filtered and sorted cars
  const displayedCars = useMemo(() => {
    let filtered = filterStatus === 'all' 
      ? cars 
      : cars.filter(c => c.status === filterStatus);
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'views':
          return (b.views || 0) - (a.views || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [cars, filterStatus, sortBy]);

  // Get status label
  const getStatusLabel = (status: string) => {
    return t(`profile.garage.status.${status}`);
  };

  return (
    <GarageContainer>
      {/* Header */}
      <GarageHeader>
        <HeaderContent>
          <HeaderLeft>
            <GarageIcon>
              <Car />
            </GarageIcon>
            <HeaderTitle>
              <h2>{t('profile.garage.myGarage')}</h2>
              <p>{stats.total} {language === 'bg' ? 'автомобила' : 'vehicles'}</p>
            </HeaderTitle>
          </HeaderLeft>
          <AddButton onClick={onAddNew}>
            <Plus size={20} />
            {language === 'bg' ? 'Добави кола' : 'Add Car'}
          </AddButton>
        </HeaderContent>
      </GarageHeader>

      {/* Statistics */}
      <GarageStats>
        <StatCard>
          <span className="stat-number">{stats.active}</span>
          <span className="stat-label">{t('profile.garage.activeCars')}</span>
        </StatCard>
        <StatCard>
          <span className="stat-number">{stats.sold}</span>
          <span className="stat-label">{t('profile.garage.soldCars')}</span>
        </StatCard>
        <StatCard>
          <span className="stat-number">{stats.draft}</span>
          <span className="stat-label">{t('profile.garage.draftCars')}</span>
        </StatCard>
        <StatCard>
          <span className="stat-number">{stats.totalViews}</span>
          <span className="stat-label">{language === 'bg' ? 'Прегледи' : 'Views'}</span>
        </StatCard>
      </GarageStats>

      {/* Controls */}
      {cars.length > 0 && (
        <GarageControls>
          <ControlGroup>
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            <FilterButton 
              $active={filterStatus === 'all'} 
              onClick={() => setFilterStatus('all')}
            >
              {t('profile.garage.status.all')}
            </FilterButton>
            <FilterButton 
              $active={filterStatus === 'active'} 
              onClick={() => setFilterStatus('active')}
            >
              {t('profile.garage.status.active')}
            </FilterButton>
            <FilterButton 
              $active={filterStatus === 'sold'} 
              onClick={() => setFilterStatus('sold')}
            >
              {t('profile.garage.status.sold')}
            </FilterButton>
            <FilterButton 
              $active={filterStatus === 'draft'} 
              onClick={() => setFilterStatus('draft')}
            >
              {t('profile.garage.status.draft')}
            </FilterButton>
          </ControlGroup>
          
          <ControlGroup>
            <SortDesc size={18} style={{ color: 'var(--text-secondary)' }} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="date">{language === 'bg' ? 'Дата' : 'Date'}</option>
              <option value="price">{language === 'bg' ? 'Цена' : 'Price'}</option>
              <option value="views">{language === 'bg' ? 'Прегледи' : 'Views'}</option>
            </select>
          </ControlGroup>
        </GarageControls>
      )}

      {/* Cars Grid */}
      {displayedCars.length > 0 ? (
        <GarageGrid>
          {displayedCars.map((car) => (
            <CarCardStyled key={car.id}>
              <CarImage>
                {car.mainImage ? (
                  <LazyImage src={car.mainImage} alt={car.title} />
                ) : (
                  <div className="placeholder">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
                      <circle cx="7.5" cy="14.5" r="1.5"/>
                      <circle cx="16.5" cy="14.5" r="1.5"/>
                    </svg>
                  </div>
                )}
                <StatusBadge $status={car.status}>
                  {getStatusLabel(car.status)}
                </StatusBadge>
              </CarImage>
              
              <CarContent>
                {/* Title */}
                <CarTitle>{car.title}</CarTitle>
                
                {/* Price */}
                <CarPrice>
                  €{car.price.toLocaleString()}
                  <span className="price-label">Fair price</span>
                </CarPrice>
                
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
                <CarDetails>
                  {car.horsepower && (
                    <div className="detail-item">
                      {car.horsepower} hp
                    </div>
                  )}
                  {car.transmission && (
                    <div className="detail-item">
                      {car.transmission}
                    </div>
                  )}
                  {car.mileage !== undefined && (
                    <div className="detail-item">
                      {car.mileage.toLocaleString()} km
                    </div>
                  )}
                </CarDetails>
                
                {/* Consumption & Emissions */}
                {(car.fuelConsumption || car.co2Emissions) && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border)'
                  }}>
                    {car.fuelConsumption && `${car.fuelConsumption} l/100km (comb.)`}
                    {car.fuelConsumption && car.co2Emissions && ' • '}
                    {car.co2Emissions && `${car.co2Emissions} g CO₂/km (comb.)`}
                  </div>
                )}
                
                {/* Stats */}
                <CarStats>
                  <div className="stat">
                    <Eye size={14} />
                    {car.views || 0}
                  </div>
                  <div className="stat">
                    <MessageCircle size={14} />
                    {car.inquiries || 0}
                  </div>
                </CarStats>
                
                {/* Action Buttons */}
                <CarActions>
                  <ActionButton 
                    $variant="primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(car.id);
                    }}
                  >
                    <Edit2 size={16} />
                    {language === 'bg' ? 'Редактирай' : 'Edit'}
                  </ActionButton>
                  <ActionButton 
                    $variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/cars/${car.id}`, '_blank');
                    }}
                  >
                    <Eye size={16} />
                    {language === 'bg' ? 'Преглед' : 'View'}
                  </ActionButton>
                  <ActionButton 
                    $variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(language === 'bg' 
                        ? 'Сигурни ли сте, че искате да изтриете?' 
                        : 'Are you sure you want to delete?')) {
                        onDelete?.(car.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </CarActions>
              </CarContent>
            </CarCardStyled>
          ))}
        </GarageGrid>
      ) : (
        <EmptyGarage>
          <div className="empty-icon">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 17h14v2H5v-2zm0-2h14V9H5v6zm7-13l9 5v8H3V7l9-5z"/>
              <circle cx="7.5" cy="14.5" r="1.5"/>
              <circle cx="16.5" cy="14.5" r="1.5"/>
            </svg>
          </div>
          <h3>{t('profile.garage.emptyTitle')}</h3>
          <p>{t('profile.garage.emptyDescription')}</p>
          <AddButton onClick={onAddNew}>
            <Plus size={20} />
            {t('profile.addFirstCar')}
          </AddButton>
        </EmptyGarage>
      )}
    </GarageContainer>
  );
};

export default GarageSection;

