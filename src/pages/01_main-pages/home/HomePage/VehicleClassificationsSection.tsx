import { logger } from '../../../../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import ModernCarCard from './ModernCarCard';
import VehicleCategoryCard, { VehicleCategory } from './VehicleCategoryCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';

// Styled Components
const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 80px 20px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)'
    : 'rgba(245, 241, 235, 0.4)'};
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    padding: 50px 16px;
  }
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 50px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 16px;
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 16px;
  line-height: 1.2;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.125rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  line-height: 1.6;
  transition: color 0.3s ease;
`;

const CategoriesContainer = styled.div`
  margin-bottom: 50px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const CarsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const ViewAllButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 40px auto 0;
  padding: 12px 32px;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isDark
    ? '0 2px 5px rgba(0,0,0,0.3)'
    : '0 2px 5px rgba(0,0,0,0.05)'};

  &:hover {
    background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
    border-color: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
    transform: translateY(-2px);
    box-shadow: ${props => props.$isDark
    ? '0 4px 12px rgba(0,0,0,0.4)'
    : '0 4px 12px rgba(0,0,0,0.1)'};
  }
`;

// Categories Data (Bulgarian)
const CATEGORIES: VehicleCategory[] = [
  { id: 'sedan', labelBg: 'Седан', labelEn: 'Sedan', iconName: 'sedan', count: 1240 },
  { id: 'suv', labelBg: 'Джип / SUV', labelEn: 'SUV', iconName: 'suv', count: 980 },
  { id: 'hatchback', labelBg: 'Хечбек', labelEn: 'Hatchback', iconName: 'hatchback', count: 850 },
  { id: 'coupe', labelBg: 'Купе', labelEn: 'Coupe', iconName: 'coupe', count: 320 },
  { id: 'wagon', labelBg: 'Комби', labelEn: 'Wagon', iconName: 'wagon', count: 450 },
  { id: 'convertible', labelBg: 'Кабрио', labelEn: 'Convertible', iconName: 'convertible', count: 180 },
  { id: 'pickup', labelBg: 'Пикап', labelEn: 'Pickup', iconName: 'pickup', count: 150 },
  { id: 'minivan', labelBg: 'Миниван', labelEn: 'Minivan', iconName: 'minivan', count: 210 }
];

const VehicleClassificationsSection: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState('sedan');
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const result = await unifiedCarService.searchCars({
          isActive: true,
          isSold: false,
          bodyType: selectedCategory // Filter by selected body type
        }, 8);
        setCars(result.slice(0, 8));
      } catch (error) {
        logger.error('Error loading cars:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [selectedCategory]);

  const handleViewAll = () => {
    navigate(`/cars?bodyType=${selectedCategory}`);
  };

  const selectedCategoryLabel = CATEGORIES.find(c => c.id === selectedCategory);
  const categoryLabel = language === 'bg'
    ? selectedCategoryLabel?.labelBg
    : selectedCategoryLabel?.labelEn;

  return (
    <SectionContainer $isDark={isDark}>
      <HeaderContainer>
        <Badge>
          <Sparkles size={16} />
          <span>{t('home.vehicleCategories.smartSearch', language === 'bg' ? 'Интелигентно търсене' : 'Smart Search')}</span>
        </Badge>
        <Title $isDark={isDark}>
          {t('home.vehicleCategories.title', language === 'bg' ? 'Категории автомобили' : 'Vehicle Categories')}
        </Title>
        <Subtitle $isDark={isDark}>
          {t('home.vehicleCategories.subtitle', language === 'bg'
            ? 'Разгледайте нашата широка гама от автомобили, класифицирани по тип купе за ваше улеснение.'
            : 'Explore our wide range of cars, classified by body type for your convenience.')}
        </Subtitle>
      </HeaderContainer>

      <CategoriesContainer>
        <HorizontalScrollContainer
          gap="16px"
          padding="0"
          itemMinWidth="140px"
          showArrows={true}
        >
          {CATEGORIES.map(category => (
            <VehicleCategoryCard
              key={category.id}
              category={category}
              isActive={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </HorizontalScrollContainer>
      </CategoriesContainer>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: isDark ? '#cbd5e1' : '#64748b'
        }}>
          {t('home.vehicleCategories.loading', language === 'bg' ? 'Зареждане на автомобили...' : 'Loading cars...')}
        </div>
      ) : (
        <>
          <CarsContainer>
            <HorizontalScrollContainer
              gap="30px"
              padding="0"
              itemMinWidth="300px"
              showArrows={true}
            >
              {cars.map(car => (
                <ModernCarCard
                  key={car.id}
                  car={car}
                  showStatus={true}
                />
              ))}
            </HorizontalScrollContainer>
          </CarsContainer>
          
          {cars.length > 0 && (
            <ViewAllButton $isDark={isDark} onClick={handleViewAll}>
              <span>{language === 'bg' ? 'Виж всички' : 'View All'}</span>
              <ArrowRight size={18} />
            </ViewAllButton>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default VehicleClassificationsSection;
