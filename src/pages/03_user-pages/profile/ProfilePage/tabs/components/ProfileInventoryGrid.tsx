/**
 * ProfileInventoryGrid Component
 * عرض وفلترة السيارات - نفس تصميم صفحة my-ads
 * متوافق مع الدستور: استخدام CompactCarCard من my-ads
 * يدعم Dark/Light Mode بالكامل
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Car, Search, Filter } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import CompactCarCard from '../../../../../../components/CarCards/CompactCarCard';
import { UnifiedCar } from '../../../../../../services/car';
import type { ProfileCar } from '../../../types';

interface ProfileInventoryGridProps {
  userCars: ProfileCar[];
  profileType?: string;
  ownerPlanTier?: string;
  ownerIsVerified?: boolean;
}

export const ProfileInventoryGrid: React.FC<ProfileInventoryGridProps> = ({ 
  userCars = [],
  profileType = 'private',
  ownerPlanTier,
  ownerIsVerified
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [inventorySearch, setInventorySearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Convert ProfileCar to UnifiedCar format
  const unifiedCars: UnifiedCar[] = useMemo(() => {
    return ((userCars || []) as any[]).map(car => ({
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
  }, [userCars]);

  // Filter cars
  const filteredCars = useMemo(() => {
    if (!inventorySearch.trim()) return unifiedCars;
    const lower = inventorySearch.toLowerCase();
    return unifiedCars.filter(car =>
      (car.make?.toLowerCase().includes(lower)) ||
      (car.model?.toLowerCase().includes(lower)) ||
      (car.year?.toString().includes(lower)) ||
      (car.price?.toString().includes(lower))
    );
  }, [unifiedCars, inventorySearch]);

  return (
    <InventoryContainer $isDark={isDark}>
      <FilterBar $isDark={isDark}>
        <StatsSection>
          <StatsLabel $isDark={isDark}>
            {language === 'bg' ? 'Резултати' : 'Results'}: 
            <StatsCount $isDark={isDark}>{filteredCars.length}</StatsCount>
            {language === 'bg' ? ' автомобила' : ' cars'}
          </StatsLabel>
        </StatsSection>

        <SearchWrapper>
          <SearchIcon $isDark={isDark}>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            $isDark={isDark}
            placeholder={language === 'bg' ? 'Търсене в този магазин...' : 'Search in this store...'}
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
          />
        </SearchWrapper>

        <FilterToggle $isDark={isDark} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} />
          {language === 'bg' ? 'Филтри' : 'Filters'}
        </FilterToggle>
      </FilterBar>

      {/* Advanced Filters (Collapsible) */}
      {showFilters && (
        <AdvancedFilters $isDark={isDark}>
          <FilterGroup>
            <FilterLabel $isDark={isDark}>{language === 'bg' ? 'Марка' : 'Brand'}</FilterLabel>
            <FilterSelect $isDark={isDark}>
              <option>{language === 'bg' ? 'Всички марки' : 'All Brands'}</option>
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel $isDark={isDark}>{language === 'bg' ? 'Година' : 'Year'}</FilterLabel>
            <FilterSelect $isDark={isDark}>
              <option>{language === 'bg' ? 'Всички години' : 'All Years'}</option>
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel $isDark={isDark}>{language === 'bg' ? 'Цена' : 'Price'}</FilterLabel>
            <FilterSelect $isDark={isDark}>
              <option>{language === 'bg' ? 'Всички цени' : 'All Prices'}</option>
            </FilterSelect>
          </FilterGroup>
        </AdvancedFilters>
      )}

      {filteredCars.length > 0 ? (
        <GridContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredCars.map((car, index) => {
            const sellerNumericId = (car as any).sellerNumericId || (car as any).ownerNumericId;
            const carNumericId = (car as any).carNumericId || (car as any).userCarSequenceId;

            return (
              <GridItem
                key={car.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <CompactCarCard
                  car={car}
                  isOwnProfile={false}
                  showStatus={false}
                  onView={(carId) => {
                    if (sellerNumericId && carNumericId) {
                      window.open(`/car/${sellerNumericId}/${carNumericId}`, '_blank');
                    }
                  }}
                />
              </GridItem>
            );
          })}
        </GridContainer>
      ) : (
        <EmptyState $isDark={isDark}>
          <Car size={48} color={isDark ? '#64748B' : '#94A3B8'} />
          <EmptyText $isDark={isDark}>
            {inventorySearch 
              ? (language === 'bg' ? 'Няма автомобили, отговарящи на търсенето' : 'No cars match your search')
              : (language === 'bg' ? 'Няма налични автомобили в момента' : 'No cars available at the moment')
            }
          </EmptyText>
        </EmptyState>
      )}
    </InventoryContainer>
  );
};

// ============================================================================
// STYLED COMPONENTS - Dark/Light Mode Support + Same Grid as my-ads
// ============================================================================

const InventoryContainer = styled.div<{ $isDark: boolean }>`
  width: 100%;
  background: ${props => props.$isDark ? '#0F1419' : '#F8FAFC'};
  padding: 24px;
  border-radius: 16px;
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const FilterBar = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  background: ${props => props.$isDark ? '#1E293B' : 'white'};
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  box-shadow: ${props => props.$isDark 
    ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
    : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StatsSection = styled.div`
  display: flex;
  align-items: center;
  min-width: 150px;
`;

const StatsLabel = styled.span<{ $isDark: boolean }>`
  font-weight: 600;
  color: ${props => props.$isDark ? '#CBD5E1' : '#64748B'};
  font-size: 14px;
  transition: color 0.3s ease;
`;

const StatsCount = styled.span<{ $isDark: boolean }>`
  font-weight: 700;
  color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
  margin: 0 4px;
  transition: color 0.3s ease;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchIcon = styled.div<{ $isDark: boolean }>`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.$isDark ? '#94A3B8' : '#94A3B8'};
  pointer-events: none;
  transition: color 0.3s ease;
`;

const SearchInput = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: ${props => props.$isDark ? '#1E293B' : '#F8FAFC'};
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};

  &:focus {
    outline: none;
    border-color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
    background: ${props => props.$isDark ? '#0F172A' : 'white'};
    box-shadow: 0 0 0 3px ${props => props.$isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &::placeholder {
    color: ${props => props.$isDark ? '#64748B' : '#94A3B8'};
  }
`;

const FilterToggle = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$isDark ? '#3B82F6' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    background: ${props => props.$isDark ? '#2563EB' : '#2563EB'};
  }
`;

const AdvancedFilters = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 25px;
  padding: 20px;
  background: ${props => props.$isDark ? '#1E293B' : '#F8FAFC'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  transition: all 0.3s ease;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label<{ $isDark: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$isDark ? '#CBD5E1' : '#475569'};
  transition: color 0.3s ease;
`;

const FilterSelect = styled.select<{ $isDark: boolean }>`
  padding: 10px 12px;
  border: 2px solid ${props => props.$isDark ? '#334155' : '#E2E8F0'};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.$isDark ? '#0F172A' : 'white'};
  color: ${props => props.$isDark ? '#F8FAFC' : '#1E293B'};
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$isDark ? '#60A5FA' : '#3B82F6'};
    box-shadow: 0 0 0 3px ${props => props.$isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
`;

// ✅ نفس Grid Layout من AdCardGrid في my-ads
const GridContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 641px) and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  @media (min-width: 1025px) and (max-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }

  @media (min-width: 1441px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }
`;

const GridItem = styled(motion.div)`
  width: 100%;
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 80px 20px;
  color: ${props => props.$isDark ? '#64748B' : '#94A3B8'};
  transition: color 0.3s ease;
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  margin-top: 16px;
  font-size: 16px;
  color: ${props => props.$isDark ? '#94A3B8' : '#64748B'};
  transition: color 0.3s ease;
`;
