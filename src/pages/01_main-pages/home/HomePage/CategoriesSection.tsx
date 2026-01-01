// Categories Section - Popular Vehicle Categories with Real Data
// Раздел категории - Популярни категории превозни средства с реални данни
// CategoriesSection - Popular vehicle categories with real Firebase data

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { unifiedCarService } from '../../../../services/car';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';
import { logger } from '../../../../services/logger-service';

const SectionContainer = styled.section`
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.4)' 
    : 'rgba(245, 241, 235, 0.4)'};
  transition: background-color 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 50px 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#262626' : '#e5e7eb'};
  padding-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const TitleContainer = styled.div``;

const SectionTitle = styled.h2`
  font-family: 'Exo 2', 'Arial', sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const SectionSubtitle = styled.p`
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const ViewAllLink = styled(Link)`
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    gap: 8px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#FFA500' : '#FFA500'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CategoriesContainer = styled.div`
  /* Container for horizontal scroll */
`;

const CarCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f0f0f' : '#ffffff'};
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#262626' : '#e5e7eb'};
  position: relative;
  cursor: pointer;
  transition: transform 0.4s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  }
`;

const CardImgWrap = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
  padding: 15px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#f8fafc'};
`;

const CardImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 2px;
  transition: transform 0.5s ease;
  
  ${CarCard}:hover & {
    transform: scale(1.05);
  }
`;

const FrameSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
`;

const FramePath = styled.path<{ $isDark: boolean }>`
  fill: none;
  stroke: ${props => props.$isDark 
    ? 'url(#frameGradientDark)' 
    : 'url(#frameGradientLight)'};
  stroke-width: 2.5;
  stroke-dasharray: 700;
  stroke-dashoffset: 700;
  transition: stroke-dashoffset 0.8s ease-in-out;
  
  ${CarCard}:hover & {
    stroke-dashoffset: 0;
  }
`;

const CardInfo = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-family: 'Exo 2', 'Arial', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CardCount = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  display: block;
  margin-bottom: 15px;
`;

const CardPrice = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFD700' : '#FF8F10'};
  font-size: 1.1rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
`;

interface CategoryData {
  id: string;
  labelBg: string;
  labelEn: string;
  count: number;
  minPrice: number;
  imageUrl?: string;
}

const CATEGORIES: Omit<CategoryData, 'count' | 'minPrice'>[] = [
  { id: 'suv', labelBg: 'Джипове (SUV)', labelEn: 'SUVs' },
  { id: 'sedan', labelBg: 'Седани', labelEn: 'Sedans' },
  { id: 'electric', labelBg: 'Електромобили', labelEn: 'Electric Cars' },
  { id: 'hatchback', labelBg: 'Хечбеци', labelEn: 'Hatchbacks' },
  { id: 'coupe', labelBg: 'Купета', labelEn: 'Coupes' },
  { id: 'wagon', labelBg: 'Комби', labelEn: 'Wagons' },
];

const CategoriesSection: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadCategoriesData = async () => {
      try {
        setLoading(true);
        const data: CategoryData[] = [];

        for (const category of CATEGORIES) {
          try {
            // Get cars for this category
            const filters: any = { 
              isActive: true, 
              isSold: false 
            };
            
            // Map category IDs to bodyType
            if (category.id === 'electric') {
              filters.fuelType = 'electric';
            } else {
              filters.bodyType = category.id;
            }

            const cars = await unifiedCarService.searchCars(filters, 100);
            
            if (cars.length > 0) {
              const prices = cars
                .map(c => c.price || 0)
                .filter(p => p > 0);
              
              const minPrice = prices.length > 0 
                ? Math.min(...prices) 
                : 0;

              data.push({
                ...category,
                count: cars.length,
                minPrice: minPrice,
              });
            }
          } catch (error) {
            logger.error(`Error loading category ${category.id}:`, error as Error, {
              context: 'CategoriesSection',
              action: 'loadCategory',
              categoryId: category.id
            });
            // Add with default values
            data.push({
              ...category,
              count: 0,
              minPrice: 0,
            });
          }
        }

        // Sort by count (most popular first)
        data.sort((a, b) => b.count - a.count);
        setCategoriesData(data.slice(0, 3)); // Show top 3
      } catch (error) {
        logger.error('Error loading categories data:', error as Error, {
          context: 'CategoriesSection',
          action: 'loadCategoriesData'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCategoriesData();
  }, []);

  const handleCardClick = (categoryId: string) => {
    if (categoryId === 'electric') {
      navigate('/cars?fuelType=electric');
    } else {
      navigate(`/cars?bodyType=${categoryId}`);
    }
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return language === 'bg' ? '—' : '—';
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <SectionContainer>
        <LoadingState>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingState>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      {/* SVG Gradients */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="frameGradientDark" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="frameGradientLight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#FF8F10', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      <SectionHeader>
        <TitleContainer>
          <SectionTitle>
            {language === 'bg' ? 'Популярни Категории' : 'Popular Categories'}
          </SectionTitle>
          <SectionSubtitle>
            {language === 'bg' 
              ? 'Разгледайте пазара по тип купе' 
              : 'Explore the market by body type'}
          </SectionSubtitle>
        </TitleContainer>
        <ViewAllLink to="/cars">
          {language === 'bg' ? 'Виж всички' : 'View All'}
          <ArrowRight />
        </ViewAllLink>
      </SectionHeader>

      <CategoriesContainer>
        <HorizontalScrollContainer
          gap="30px"
          padding="0"
          itemMinWidth="320px"
          showArrows={true}
        >
          {categoriesData.map((category) => (
            <CarCard 
              key={category.id}
              onClick={() => handleCardClick(category.id)}
            >
              <CardImgWrap>
                <CardImg
                  src={`https://images.unsplash.com/photo-${category.id === 'suv' ? '1519641471654-76ce0107ad1b' : category.id === 'sedan' ? '1552519507-da3b142c6e3d' : '1560958089-b8a1929cea89'}?auto=format&fit=crop&w=800&q=80`}
                  alt={language === 'bg' ? category.labelBg : category.labelEn}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/images/default-car.jpg';
                  }}
                />
                <FrameSvg viewBox="0 0 400 250" preserveAspectRatio="none">
                  <FramePath 
                    $isDark={isDark}
                    d="M200,245 L395,245 L395,5 L200,5" 
                  />
                  <FramePath 
                    $isDark={isDark}
                    d="M200,245 L5,245 L5,5 L200,5" 
                  />
                </FrameSvg>
              </CardImgWrap>
              <CardInfo>
                <CardTitle>
                  {language === 'bg' ? category.labelBg : category.labelEn}
                </CardTitle>
                <CardCount>
                  {category.count.toLocaleString()} {language === 'bg' ? 'Обяви' : 'Listings'}
                </CardCount>
                <CardPrice>
                  {language === 'bg' ? 'от' : 'from'} {formatPrice(category.minPrice)}
                </CardPrice>
              </CardInfo>
            </CarCard>
          ))}
        </HorizontalScrollContainer>
      </CategoriesContainer>
    </SectionContainer>
  );
};

export default CategoriesSection;
