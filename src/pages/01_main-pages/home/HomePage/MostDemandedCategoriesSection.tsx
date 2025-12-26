import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { unifiedCarService, UnifiedCar } from '../../../../services/car';
import ModernCarCard from './ModernCarCard';
import DemandStats from './DemandStats';
import { Bot, ArrowRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { logger } from '../../../../services/logger-service';
import HorizontalScrollContainer from '../../../../components/HorizontalScrollContainer/HorizontalScrollContainer';

// Styled Components
const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 80px 20px;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(51, 65, 85, 0.4) 100%)'
    : 'linear-gradient(135deg, rgba(168, 174, 184, 0.4) 0%, rgba(195, 207, 226, 0.4) 100%)'};
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

const CategoriesNavContainer = styled.div`
  margin-bottom: 40px;
`;

const ViewAllButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 40px auto 0;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;

  /* Light mode: Orange/Yellow gradient */
  html[data-theme="light"] & {
    background: linear-gradient(135deg, #FF8F10 0%, #FFA500 50%, #FFD700 100%);
    color: #000000;
    box-shadow: 0 4px 20px rgba(255, 143, 16, 0.4);
  }

  /* Dark mode: Black with yellow text */
  html[data-theme="dark"] & {
    background: #000000;
    color: #FFD700;
    border: 2px solid #FFD700;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    html[data-theme="light"] & {
      background: linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FF8F10 100%);
      box-shadow: 0 8px 30px rgba(255, 143, 16, 0.5);
    }
    html[data-theme="dark"] & {
      background: #1a1a1a;
      box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4);
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
`;

const RankBadge = styled.span<{ $rank: number; $active: boolean; $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 800;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)';
    return 'transparent';
  }};
  color: ${props => props.$rank <= 3 ? '#000000' : 'transparent'};
  box-shadow: ${props => props.$rank <= 3 ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none'};
  margin-right: 4px;
`;

const CategoryTab = styled.button<{ $active: boolean; $rank?: number; $isDark: boolean }>`
  padding: 12px 24px;
  border-radius: 30px;
  border: 1px solid ${props =>
    props.$active
      ? (props.$isDark ? 'rgba(240, 147, 251, 0.55)' : 'rgba(240, 147, 251, 0.40)')
      : (props.$isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.10)')};
  background: ${props =>
    props.$active
      ? `linear-gradient(135deg,
          rgba(240, 147, 251, ${props.$isDark ? 0.26 : 0.18}) 0%,
          rgba(245, 87, 108, ${props.$isDark ? 0.22 : 0.14}) 100%
        )`
      : (props.$isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.55)')};
  color: ${props => (props.$active ? '#ffffff' : props.$isDark ? '#e2e8f0' : '#1e293b')};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props =>
    props.$active
      ? (props.$isDark
        ? '0 18px 42px rgba(0, 0, 0, 0.45), 0 8px 18px rgba(240, 147, 251, 0.16)'
        : '0 14px 34px rgba(15, 23, 42, 0.12), 0 6px 14px rgba(240, 147, 251, 0.14)')
      : (props.$isDark
        ? '0 14px 30px rgba(0, 0, 0, 0.38)'
        : '0 10px 26px rgba(15, 23, 42, 0.10)')};
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  /* subtle glass shine */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.10) 25%,
      rgba(255, 255, 255, 0.05) 55%,
      rgba(255, 255, 255, 0.00) 100%
    );
    opacity: ${props => (props.$isDark ? 0.16 : 0.22)};
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.$active
        ? (props.$isDark
          ? '0 22px 50px rgba(0, 0, 0, 0.52), 0 10px 24px rgba(240, 147, 251, 0.22)'
          : '0 18px 44px rgba(15, 23, 42, 0.16), 0 10px 22px rgba(240, 147, 251, 0.18)')
        : (props.$isDark
          ? '0 18px 38px rgba(0, 0, 0, 0.46)'
          : '0 14px 34px rgba(15, 23, 42, 0.14)')};
    border-color: ${props => (props.$isDark ? 'rgba(240, 147, 251, 0.65)' : 'rgba(240, 147, 251, 0.55)')};
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.875rem;
  }
`;

const CarsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
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

        <CategoriesNavContainer>
          <HorizontalScrollContainer
            gap="12px"
            padding="0"
            itemMinWidth="auto"
            showArrows={true}
          >
            {CATEGORIES.map(category => (
              <CategoryTab
                key={category.id}
                $active={selectedCategory === category.id}
                $rank={category.rank}
                $isDark={isDark}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.rank <= 3 && (
                  <RankBadge 
                    $rank={category.rank} 
                    $active={selectedCategory === category.id}
                    $isDark={isDark}
                  >
                    {category.rank}
                  </RankBadge>
                )}
                {category.rank <= 3 && <TrendingUp size={14} />}
                {t(`bodyTypes.${category.id}`)}
              </CategoryTab>
            ))}
          </HorizontalScrollContainer>
        </CategoriesNavContainer>

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
          <CarsContainer>
            <HorizontalScrollContainer
              gap="32px"
              padding="0"
              itemMinWidth="320px"
              showArrows={true}
            >
              {cars.slice(0, 12).map(car => (
                <ModernCarCard
                  key={car.id}
                  car={car}
                  showStatus={true}
                />
              ))}
            </HorizontalScrollContainer>
          </CarsContainer>
          
          {cars.length > 0 && (
            <ViewAllButton $isDark={isDark} onClick={() => navigate(`/cars?bodyType=${selectedCategory}`)}>
              <span>{language === 'bg' ? 'Виж всички' : 'View All'}</span>
              <ArrowRight size={18} />
            </ViewAllButton>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default MostDemandedCategoriesSection;
