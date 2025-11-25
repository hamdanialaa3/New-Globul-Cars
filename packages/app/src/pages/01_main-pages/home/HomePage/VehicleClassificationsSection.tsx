// Vehicle Classifications Section with Real Car Cards
// تصنيفات المركبات مع بطاقات سيارات حقيقية

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { carListingService } from '@globul-cars/services/carListingService';
import { CarListing } from '@globul-cars/core/typesCarListing';
import ModernCarCard from './ModernCarCard';

// Styled Components
const SectionContainer = styled.section`
  padding: 80px 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 50px 16px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.h2`
  font-size: 2.75rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.25rem;
  color: #64748b;
  max-width: 700px;
  margin: 0 auto 40px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.0625rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 28px;
  border-radius: 30px;
  border: 2px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.active
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'white'
  };
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active
    ? '0 4px 15px rgba(102, 126, 234, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'
  };

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    border-color: #667eea;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
`;

const CarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.25rem;
  color: #64748b;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 24px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  max-width: 500px;
  margin: 0 auto;
`;

const ViewAllButton = styled.button`
  display: block;
  margin: 40px auto 0;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  @media (max-width: 768px) {
    padding: 12px 28px;
    font-size: 0.9375rem;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Vehicle Types Configuration
const VEHICLE_TYPES = [
  { id: 'all', label: 'الكل', icon: '🚗' },
  { id: 'car', label: 'سيارات ركاب', icon: '🚗' },
  { id: 'suv', label: 'دفع رباعي', icon: '🚙' },
  { id: 'van', label: 'شاحنات صغيرة', icon: '🚐' },
  { id: 'motorcycle', label: 'دراجات نارية', icon: '🏍️' },
  { id: 'truck', label: 'شاحنات', icon: '🚛' },
  { id: 'bus', label: 'حافلات', icon: '🚌' }
];

const VehicleClassificationsSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('all');
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgPrice: 0,
    newListings: 0
  });

  // Load cars based on selected type
  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const filters: any = {
          status: 'active',
          limit: 12
        };

        if (selectedType !== 'all') {
          filters.vehicleType = selectedType;
        }

        const result = await carListingService.getListings(filters);
        setCars(result.listings);

        // Calculate stats
        const total = result.listings.length;
        const avgPrice = total > 0
          ? result.listings.reduce((sum, car) => sum + (car.price || 0), 0) / total
          : 0;

        // Count new listings (last 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const newListings = result.listings.filter(car => {
          const createdAt = car.createdAt instanceof Date
            ? car.createdAt.getTime()
            : new Date(car.createdAt).getTime();
          return createdAt >= sevenDaysAgo;
        }).length;

        setStats({ total, avgPrice, newListings });
      } catch (error) {
        console.error('Error loading cars:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [selectedType]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleViewAll = () => {
    if (selectedType === 'all') {
      navigate('/search');
    } else {
      navigate(`/search?vehicleType=${selectedType}`);
    }
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>تصنيفات المركبات</SectionTitle>
        <SectionSubtitle>
          اكتشف مجموعة واسعة من المركبات المتاحة حسب النوع
        </SectionSubtitle>

        <TabsContainer>
          {VEHICLE_TYPES.map(type => (
            <Tab
              key={type.id}
              active={selectedType === type.id}
              onClick={() => setSelectedType(type.id)}
            >
              {type.icon} {type.label}
            </Tab>
          ))}
        </TabsContainer>

        {!loading && cars.length > 0 && (
          <StatsBar>
            <StatItem>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>متوفر</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{formatPrice(stats.avgPrice)}</StatValue>
              <StatLabel>متوسط السعر</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.newListings}</StatValue>
              <StatLabel>جديد هذا الأسبوع</StatLabel>
            </StatItem>
          </StatsBar>
        )}
      </SectionHeader>

      {loading ? (
        <LoadingContainer>
          <div>جاري التحميل...</div>
        </LoadingContainer>
      ) : cars.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🚗</EmptyIcon>
          <EmptyTitle>لا توجد مركبات متاحة</EmptyTitle>
          <EmptyText>
            لم نجد أي مركبات من هذا النوع حالياً. جرب نوعاً آخر أو تحقق لاحقاً.
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <CarsGrid>
            {cars.map(car => (
              <ModernCarCard
                key={car.id}
                car={car}
                showStatus={true}
              />
            ))}
          </CarsGrid>

          <ViewAllButton onClick={handleViewAll}>
            عرض جميع المركبات ({stats.total}+)
          </ViewAllButton>
        </>
      )}
    </SectionContainer>
  );
};

export default VehicleClassificationsSection;
