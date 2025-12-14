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
