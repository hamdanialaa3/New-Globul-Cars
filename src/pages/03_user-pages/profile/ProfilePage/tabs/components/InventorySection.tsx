/**
 * InventorySection Component
 * قسم السيارات مع فلاتر ذكية وطريقة العرض (Grid)
 * متوافق مع الدستور: استخدام CarCardGermanStyle الموجود
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Car, Search } from 'lucide-react';
import { useLanguage } from '../../../../../../contexts/LanguageContext';
import CarCardGermanStyle from '../../../../../../components/CarCard/CarCardGermanStyle';
import { CarListing } from '../../../../../../types/CarListing';
import type { ProfileCar } from '../../../types';

interface InventorySectionProps {
  userCars: ProfileCar[];
  profileType?: string;
  ownerPlanTier?: string;
  ownerIsVerified?: boolean;
}

export const InventorySection: React.FC<InventorySectionProps> = ({ 
  userCars = [],
  profileType = 'private',
  ownerPlanTier,
  ownerIsVerified
}) => {
  const { language } = useLanguage();
  const [inventorySearch, setInventorySearch] = useState('');

  // Filter cars
  const filteredCars = useMemo(() => {
    if (!inventorySearch.trim()) return userCars;
    const lower = inventorySearch.toLowerCase();
    return userCars.filter((car: any) =>
      (car.make?.toLowerCase().includes(lower)) ||
      (car.model?.toLowerCase().includes(lower)) ||
      (car.year?.toString().includes(lower)) ||
      (car.price?.toString().includes(lower))
    );
  }, [userCars, inventorySearch]);

  return (
    <InventoryContainer>
      <InventoryHeader>
        <InventoryTitle $profileType={profileType}>
          <Car size={28} />
          {language === 'bg' ? 'Налични Автомобили' : 'Available Stock'}
          <InventoryCount>({filteredCars.length})</InventoryCount>
        </InventoryTitle>

        <SearchWrapper>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            placeholder={language === 'bg' ? 'Търсене в този магазин...' : 'Search in this store...'}
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
          />
        </SearchWrapper>
      </InventoryHeader>

      {filteredCars.length > 0 ? (
        <CarGrid>
          {filteredCars.map((car: any) => (
            <CarCardGermanStyle
              key={car.id}
              car={car as unknown as CarListing}
              ownerProfileType={profileType}
              ownerPlanTier={ownerPlanTier}
              ownerIsVerified={ownerIsVerified}
            />
          ))}
        </CarGrid>
      ) : (
        <EmptyState>
          <Car size={48} color="#94A3B8" />
          <EmptyText>
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
// STYLED COMPONENTS
// ============================================================================

const getThemeColor = (type: string) => {
  switch(type) {
    case 'company': return '#1E3A8A';
    case 'dealer': return '#059669';
    case 'private': return '#EA580C';
    default: return '#64748B';
  }
};

const InventoryContainer = styled.section`
  padding: 40px 0;
  background: white;
`;

const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InventoryTitle = styled.h2<{ $profileType: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 800;
  color: ${props => getThemeColor(props.$profileType)};
  margin: 0;

  svg {
    color: ${props => getThemeColor(props.$profileType)};
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const InventoryCount = styled.span`
  font-size: 24px;
  color: #64748B;
  font-weight: 600;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  background: #F8FAFC;

  &:focus {
    outline: none;
    border-color: #3B82F6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94A3B8;
  }
`;

const CarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #94A3B8;
`;

const EmptyText = styled.p`
  margin-top: 16px;
  font-size: 16px;
  color: #64748B;
`;
