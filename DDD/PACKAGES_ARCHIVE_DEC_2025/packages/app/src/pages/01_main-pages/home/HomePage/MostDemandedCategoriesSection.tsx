// Most Demanded Categories Section with Real Car Cards
// الفئات الأكثر طلباً مع بطاقات سيارات حقيقية

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { carListingService } from '@globul-cars/services/carListingService';
import { carDataService } from '@globul-cars/services/carDataService';
import { CarListing } from '@globul-cars/core/typesCarListing';
import ModernCarCard from './ModernCarCard';

// Styled Components
const SectionContainer = styled.section`
  padding: 80px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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

const AIBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    50% {
      box-shadow: 0 4px 25px rgba(16, 185, 129, 0.5);
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.75rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

const CategoriesNav = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const CategoryTab = styled.button<{ active: boolean; rank?: number }>`
  padding: 12px 24px;
  border-radius: 30px;
  border: 2px solid ${props => props.active ? '#f093fb' : '#e2e8f0'};
  background: ${props => props.active
    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    : 'white'
  };
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active
    ? '0 4px 15px rgba(240, 147, 251, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'
  };
  position: relative;

  ${props => props.rank && props.rank <= 3 && `
    &::before {
      content: '${props.rank === 1 ? '🥇' : props.rank === 2 ? '🥈' : '🥉'}';
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 1.25rem;
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4);
    border-color: #f093fb;
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

const DemandIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  max-width: 600px;
  margin: 0 auto 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
`;

const DemandText = styled.div`
  font-size: 0.9375rem;
  color: #64748b;
  font-weight: 600;
`;

const DemandBar = styled.div<{ percentage: number }>`
  flex: 1;
  height: 12px;
  background: rgba(240, 147, 251, 0.2);
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    border-radius: 10px;
    transition: width 1s ease-out;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DemandPercentage = styled.div`
  font-size: 1.25rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ViewAllButton = styled.button`
  display: block;
  margin: 40px auto 0;
  padding: 14px 32px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4);
  }

  @media (max-width: 768px) {
    padding: 12px 28px;
    font-size: 0.9375rem;
  }
`;

// Categories Configuration
const CATEGORIES = [
  { id: 'sedan', label: 'سيدان', icon: '🚗', rank: 1 },
  { id: 'suv', label: 'دفع رباعي', icon: '🚙', rank: 2 },
  { id: 'hatchback', label: 'هاتشباك', icon: '🚕', rank: 3 },
  { id: 'coupe', label: 'كوبيه', icon: '🏎️', rank: 4 },
  { id: 'wagon', label: 'ستيشن واجن', icon: '🚐', rank: 5 },
  { id: 'convertible', label: 'كشف', icon: '🏖️', rank: 6 },
  { id: 'pickup', label: 'بيك أب', icon: '🛻', rank: 7 },
  { id: 'minivan', label: 'ميني فان', icon: '🚎', rank: 8 }
];

const MostDemandedCategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('sedan');
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [demandPercentage, setDemandPercentage] = useState(0);

  // Load cars based on selected category
  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const result = await carListingService.getListings({
          category: selectedCategory,
          status: 'active',
          limit: 12
        });

        setCars(result.listings);

        // Calculate demand percentage (simplified)
        const totalViews = result.listings.reduce((sum, car) => sum + (car.views || 0), 0);
        const avgViews = result.listings.length > 0 ? totalViews / result.listings.length : 0;
        const demand = Math.min(Math.round((avgViews / 100) * 100), 100);
        setDemandPercentage(demand);

      } catch (error) {
        console.error('Error loading cars:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [selectedCategory]);

  const handleViewAll = () => {
    navigate(`/search?category=${selectedCategory}`);
  };

  const getCurrentCategory = () => {
    return CATEGORIES.find(cat => cat.id === selectedCategory);
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <AIBadge>🤖 مدعوم بالذكاء الاصطناعي</AIBadge>
        <SectionTitle>الفئات الأكثر طلباً</SectionTitle>
        <SectionSubtitle>
          اكتشف الفئات الأكثر شعبية بناءً على تحليل ذكي للطلب والاهتمام
        </SectionSubtitle>

        <CategoriesNav>
          {CATEGORIES.map(category => (
            <CategoryTab
              key={category.id}
              active={selectedCategory === category.id}
              rank={category.rank}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.label}
            </CategoryTab>
          ))}
        </CategoriesNav>

        {!loading && cars.length > 0 && (
          <DemandIndicator>
            <DemandText>مستوى الطلب على {getCurrentCategory()?.label}</DemandText>
            <DemandBar percentage={demandPercentage} />
            <DemandPercentage>{demandPercentage}%</DemandPercentage>
          </DemandIndicator>
        )}
      </SectionHeader>

      {loading ? (
        <LoadingContainer>
          <div>جاري تحليل البيانات...</div>
        </LoadingContainer>
      ) : (
        <>
          <CarsGrid>
            {cars.slice(0, 12).map(car => (
              <ModernCarCard
                key={car.id}
                car={car}
                showStatus={true}
              />
            ))}
          </CarsGrid>

          {cars.length > 0 && (
            <ViewAllButton onClick={handleViewAll}>
              عرض جميع {getCurrentCategory()?.label} ({cars.length}+)
            </ViewAllButton>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default MostDemandedCategoriesSection;
