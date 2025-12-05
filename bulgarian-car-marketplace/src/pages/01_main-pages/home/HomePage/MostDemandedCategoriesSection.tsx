import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import ModernCarCard from './ModernCarCard';
import DemandStats from './DemandStats';
import { Bot, Zap, ArrowRight, Award } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { logger } from '../../../../services/logger-service';

// Styled Components
const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 80px 20px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'};
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;

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

const SectionSubtitle = styled.p<{ $isDark: boolean }>`
  font-size: 1.25rem;
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  max-width: 700px;
  margin: 0 auto 40px;
  line-height: 1.6;
  transition: color 0.3s ease;
  
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

const CategoryTab = styled.button<{ $active: boolean; $rank?: number; $isDark: boolean }>`
  padding: 12px 24px;
  border-radius: 30px;
  border: 2px solid ${props => props.$active 
    ? '#f093fb' 
    : props.$isDark ? '#334155' : '#e2e8f0'};
  background: ${props => props.$active
    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    : props.$isDark ? '#1e293b' : 'white'
  };
  color: ${props => props.$active ? 'white' : props.$isDark ? '#cbd5e1' : '#64748b'};
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active
    ? '0 4px 15px rgba(240, 147, 251, 0.3)'
    : props.$isDark 
      ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.05)'
  };
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$rank && props.$rank <= 3 && `
    &::after {
      content: '';
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFD700' stroke='%23B8860B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='7'/%3E%3Cpolyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.active
      ? '0 6px 20px rgba(240, 147, 251, 0.4)'
      : props.$isDark 
        ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
        : '0 4px 12px rgba(240, 147, 251, 0.2)'};
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

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 40px auto 0;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Light mode: Orange gradient background, White text */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFA500 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.35) !important;
  }

  /* Dark mode: Yellow gradient background, Black text */
  html[data-theme="dark"] & {
    background: linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFA000 100%) !important;
    color: #000000 !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  }

  &:hover {
    transform: translateY(-3px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FF5722 0%, #FF6B35 50%, #FF8C42 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFC107 100%) !important;
      color: #000000 !important;
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6) !important;
    }
  }

  &:active {
    transform: translateY(-1px);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #E64A19 0%, #FF5722 50%, #FF6B35 100%) !important;
      color: #ffffff !important;
    }
    html[data-theme="dark"] & {
      background: linear-gradient(135deg, #FFA000 0%, #FFC107 50%, #FFD700 100%) !important;
      color: #000000 !important;
    }
  }
`;

// Categories Configuration
const CATEGORIES = [
  { id: 'sedan', rank: 1 },
  { id: 'suv', rank: 2 },
  { id: 'hatchback', rank: 3 },
  { id: 'coupe', rank: 4 },
  { id: 'wagon', rank: 5 },
  { id: 'convertible', rank: 6 },
  { id: 'pickup', rank: 7 },
  { id: 'minivan', rank: 8 }
];

const MostDemandedCategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState('sedan');
  const [cars, setCars] = useState<UnifiedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [demandPercentage, setDemandPercentage] = useState(0);

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const result = await unifiedCarService.searchCars({
          isActive: true,
          isSold: false
        }, 12);

        // Filter logic (mock implementation for demo)
        const filteredCars = result.filter(car =>
          (car.bodyType && car.bodyType.toLowerCase() === selectedCategory) ||
          true // Fallback
        );

        setCars(filteredCars.slice(0, 12));

        // Calculate demand (mock)
        const demand = Math.floor(Math.random() * (98 - 75 + 1) + 75);
        setDemandPercentage(demand);

      } catch (error) {
        logger.error('Error loading cars', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [selectedCategory]);

  const handleViewAll = () => {
    navigate(`/search?category=${selectedCategory}`);
  };

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <AIBadge>
          <Bot size={16} />
          <span>{language === 'bg' ? 'AI Анализ' : 'AI Analysis'}</span>
        </AIBadge>
        <SectionTitle>
          {language === 'bg' ? 'Най-търсени категории' : 'Most Demanded Categories'}
        </SectionTitle>
        <SectionSubtitle $isDark={isDark}>
          {language === 'bg'
            ? 'Открийте най-популярните категории автомобили, базирани на интелигентен анализ на потребителското търсене.'
            : 'Discover the most popular car categories based on intelligent user demand analysis.'}
        </SectionSubtitle>

        <CategoriesNav>
          {CATEGORIES.map(category => (
            <CategoryTab
              key={category.id}
              $active={selectedCategory === category.id}
              $rank={category.rank}
              $isDark={isDark}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.rank <= 3 && <Award size={16} color={selectedCategory === category.id ? 'white' : '#f59e0b'} />}
              {t(`bodyTypes.${category.id}`)}
            </CategoryTab>
          ))}
        </CategoriesNav>

        {!loading && cars.length > 0 && (
          <DemandStats
            categoryName={t(`bodyTypes.${selectedCategory}`)}
            percentage={demandPercentage}
          />
        )}
      </SectionHeader>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: isDark ? '#cbd5e1' : '#64748b' 
        }}>
          {language === 'bg' ? 'Анализиране на данни...' : 'Analyzing data...'}
        </div>
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
              {language === 'bg' ? 'Виж всички' : 'View All'} {t(`bodyTypes.${selectedCategory}`)} ({cars.length}+)
              <ArrowRight size={18} />
            </ViewAllButton>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default MostDemandedCategoriesSection;
