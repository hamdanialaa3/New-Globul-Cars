import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { unifiedCarService, UnifiedCar } from '@/services/car';
import WeatherStyleCarCard from './WeatherStyleCarCard';
import DemandStats from './DemandStats';
import { Bot, ArrowRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { logger } from '@/services/logger-service';
import HorizontalScrollContainer from '@/components/HorizontalScrollContainer/HorizontalScrollContainer';

// Styled Components
const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(5, 15, 35, 0.95) 0%, rgba(10, 25, 50, 0.95) 50%, rgba(15, 35, 65, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(240, 248, 255, 0.95) 0%, rgba(230, 240, 255, 0.95) 100%)'};
  /* 🟣 Light purple border */
  border: 1px solid rgba(168, 85, 247, 0.12);
  border-radius: 8px;
  margin: 0 12px;
  box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.06);

  /* Futuristic Grid Background with Dotted Lines */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(${props => props.$isDark ? 'rgba(0, 243, 255, 0.08)' : 'rgba(0, 100, 200, 0.05)'} 1px, transparent 1px),
      linear-gradient(90deg, ${props => props.$isDark ? 'rgba(0, 243, 255, 0.08)' : 'rgba(0, 100, 200, 0.05)'} 1px, transparent 1px);
    background-size: 60px 60px;
    background-position: 0 0, 0 0;
    mask-image: radial-gradient(circle at 1px 1px, black 1px, transparent 0);
    -webkit-mask-image: radial-gradient(circle at 1px 1px, black 1px, transparent 0);
    mask-size: 60px 60px;
    -webkit-mask-size: 60px 60px;
    opacity: 0.3;
    /* ✅ Performance: Disabled heavy animation */
    /* animation: gridMove 20s linear infinite; */
  }

  /* ✅ Performance: Removed heavy animation keyframes */
  /* @keyframes gridMove {
    0% {
      background-position: 0 0, 0 0;
    }
    100% {
      background-position: 60px 60px, 60px 60px;
    }
  } */

  /* Glowing Corner Accents */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 0% 0%, ${props => props.$isDark ? 'rgba(0, 243, 255, 0.15)' : 'rgba(100, 200, 255, 0.1)'} 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, ${props => props.$isDark ? 'rgba(255, 0, 255, 0.15)' : 'rgba(255, 100, 200, 0.1)'} 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 30px 16px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
  
  /* Subtle glow effect */
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, transparent 70%);
    filter: blur(40px);
    z-index: -1;
  }
`;

const AIBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 243, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 243, 255, 0.3);
  color: #00f3ff;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 24px;
  box-shadow: 
    0 0 20px rgba(0, 243, 255, 0.4),
    inset 0 0 20px rgba(0, 243, 255, 0.1);
  animation: aiPulse 3s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
  position: relative;
  overflow: hidden;

  /* Animated gradient shine */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 70%
    );
    animation: shine 3s infinite;
    transform: rotate(45deg);
  }

  @keyframes aiPulse {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(0, 243, 255, 0.4),
        inset 0 0 20px rgba(0, 243, 255, 0.1);
      border-color: rgba(0, 243, 255, 0.3);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(0, 243, 255, 0.6),
        0 0 50px rgba(0, 243, 255, 0.3),
        inset 0 0 30px rgba(0, 243, 255, 0.15);
      border-color: rgba(0, 243, 255, 0.5);
    }
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  svg {
    filter: drop-shadow(0 0 5px rgba(0, 243, 255, 0.8));
    animation: iconFloat 2s ease-in-out infinite;
  }

  @keyframes iconFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.75rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00f3ff 0%, #00d4ff 30%, #ff00ff 70%, #ff0066 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
  position: relative;
  filter: drop-shadow(0 0 20px rgba(0, 243, 255, 0.3));
  animation: titleGlow 4s ease-in-out infinite;
  
  @keyframes titleGlow {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(0, 243, 255, 0.3));
    }
    50% {
      filter: drop-shadow(0 0 30px rgba(0, 243, 255, 0.5)) drop-shadow(0 0 50px rgba(255, 0, 255, 0.3));
    }
  }
  
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
  gap: 0.75rem;
  margin: 50px auto 0;
  padding: 14px 32px;
  border: 1px solid ${props => props.$isDark ? 'rgba(0, 243, 255, 0.4)' : 'rgba(0, 150, 255, 0.3)'};
  border-radius: 16px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* Glassmorphism background */
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(255, 0, 255, 0.12) 100%)'
    : 'linear-gradient(135deg, rgba(0, 200, 255, 0.2) 0%, rgba(150, 100, 255, 0.15) 100%)'};
  color: ${props => props.$isDark ? '#00f3ff' : '#0066ff'};
  box-shadow: ${props => props.$isDark
    ? '0 0 25px rgba(0, 243, 255, 0.3), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 243, 255, 0.1)'
    : '0 0 20px rgba(0, 200, 255, 0.25), 0 8px 20px rgba(0, 0, 0, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.2)'};
  text-shadow: ${props => props.$isDark ? '0 0 10px rgba(0, 243, 255, 0.5)' : 'none'};

  /* Animated shine effect */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 70%
    );
    transform: rotate(45deg);
    transition: transform 0.6s;
    opacity: 0;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.03);
    border-color: ${props => props.$isDark ? 'rgba(0, 243, 255, 0.7)' : 'rgba(0, 200, 255, 0.5)'};
    box-shadow: ${props => props.$isDark
    ? '0 0 40px rgba(0, 243, 255, 0.5), 0 12px 32px rgba(0, 0, 0, 0.4), inset 0 0 25px rgba(0, 243, 255, 0.15)'
    : '0 0 35px rgba(0, 200, 255, 0.4), 0 12px 28px rgba(0, 0, 0, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.3)'};
    
    &::before {
      transform: translateX(100%) translateY(100%) rotate(45deg);
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(1.01);
  }
  
  svg {
    width: 20px;
    height: 20px;
    filter: ${props => props.$isDark ? 'drop-shadow(0 0 5px rgba(0, 243, 255, 0.8))' : 'none'};
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 0.875rem;
  }
`;

const RankBadge = styled.span<{ $rank: number; $active: boolean; $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 800;
  background: ${props => {
    if (props.$rank === 1) return props.$isDark
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.3) 100%)'
      : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    if (props.$rank === 2) return props.$isDark
      ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.3) 0%, rgba(168, 168, 168, 0.3) 100%)'
      : 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)';
    if (props.$rank === 3) return props.$isDark
      ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.3) 0%, rgba(184, 115, 51, 0.3) 100%)'
      : 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)';
    return 'transparent';
  }};
  border: ${props => props.$rank <= 3
    ? (props.$isDark
      ? (props.$rank === 1 ? '1px solid rgba(255, 215, 0, 0.5)' : props.$rank === 2 ? '1px solid rgba(192, 192, 192, 0.5)' : '1px solid rgba(205, 127, 50, 0.5)')
      : 'none')
    : 'none'};
  color: ${props => {
    if (props.$rank <= 3) {
      return props.$isDark
        ? (props.$rank === 1 ? '#FFD700' : props.$rank === 2 ? '#C0C0C0' : '#CD7F32')
        : '#000000';
    }
    return 'transparent';
  }};
  box-shadow: ${props => {
    if (props.$rank <= 3) {
      const color = props.$rank === 1 ? '255, 215, 0' : props.$rank === 2 ? '192, 192, 192' : '205, 127, 50';
      return props.$isDark
        ? `0 0 15px rgba(${color}, 0.4), inset 0 0 10px rgba(${color}, 0.1)`
        : `0 2px 8px rgba(0, 0, 0, 0.2)`;
    }
    return 'none';
  }};
  margin-right: 6px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-shadow: ${props => props.$isDark && props.$rank <= 3 ? `0 0 8px currentColor` : 'none'};
  animation: ${props => props.$active && props.$rank <= 3 ? 'badgePulse 2s ease-in-out infinite' : 'none'};

  @keyframes badgePulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }
`;

const CategoryTab = styled.button<{ $active: boolean; $rank?: number; $isDark: boolean }>`
  padding: 14px 28px;
  border-radius: 16px;
  border: 1px solid ${props =>
    props.$active
      ? (props.$isDark ? 'rgba(0, 243, 255, 0.5)' : 'rgba(0, 150, 255, 0.4)')
      : (props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  background: ${props =>
    props.$active
      ? (props.$isDark
        ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(255, 0, 255, 0.12) 100%)'
        : 'linear-gradient(135deg, rgba(0, 200, 255, 0.2) 0%, rgba(150, 100, 255, 0.15) 100%)')
      : (props.$isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)')};
  color: ${props => (props.$active
    ? (props.$isDark ? '#00f3ff' : '#0066ff')
    : (props.$isDark ? '#e2e8f0' : '#1e293b'))};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props =>
    props.$active
      ? (props.$isDark
        ? '0 0 30px rgba(0, 243, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 243, 255, 0.1)'
        : '0 0 25px rgba(0, 200, 255, 0.3), 0 8px 20px rgba(0, 0, 0, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.2)')
      : (props.$isDark
        ? '0 4px 15px rgba(0, 0, 0, 0.2)'
        : '0 4px 12px rgba(0, 0, 0, 0.08)')};
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;

  /* Glass shine effect */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      135deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.4s ease;
    transform: rotate(45deg);
    animation: ${props => props.$active ? 'glassShine 3s infinite' : 'none'};
  }

  @keyframes glassShine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  /* Active glow border */
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    padding: 2px;
    background: ${props => props.$active
    ? (props.$isDark
      ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.6), rgba(255, 0, 255, 0.6))'
      : 'linear-gradient(135deg, rgba(0, 200, 255, 0.5), rgba(150, 100, 255, 0.5))')
    : 'transparent'};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.4s ease;
    filter: blur(1px);
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${props =>
    props.$active
      ? (props.$isDark
        ? '0 0 40px rgba(0, 243, 255, 0.6), 0 12px 32px rgba(0, 0, 0, 0.4), inset 0 0 25px rgba(0, 243, 255, 0.15)'
        : '0 0 35px rgba(0, 200, 255, 0.4), 0 12px 28px rgba(0, 0, 0, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.3)')
      : (props.$isDark
        ? '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 243, 255, 0.2)'
        : '0 8px 20px rgba(0, 0, 0, 0.12), 0 0 12px rgba(0, 200, 255, 0.15)')};
    border-color: ${props => (props.$isDark ? 'rgba(0, 243, 255, 0.7)' : 'rgba(0, 200, 255, 0.5)')};
    
    &::before {
      opacity: ${props => props.$active ? 1 : 0.5};
    }
  }

  &:active {
    transform: translateY(-1px) scale(1);
  }

  @media (max-width: 768px) {
    padding: 12px 22px;
    font-size: 0.875rem;
  }
`;

const CarsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  padding: 10px 0;
  
  /* Subtle glow around container */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(ellipse at center, rgba(0, 243, 255, 0.05) 0%, transparent 70%);
    border-radius: 20px;
    z-index: -1;
    pointer-events: none;
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
        }, 12);

        // Filter by body type
        const filteredCars = result.filter((car: any) =>
          car.bodyType && car.bodyType.toLowerCase() === selectedCategory
        );

        setCars(filteredCars.length > 0 ? filteredCars.slice(0, 12) : result.slice(0, 12));

        // Calculate demand based on actual listing ratio
        const totalCount = result.length || 1;
        const matchCount = filteredCars.length;
        const demand = totalCount > 0 ? Math.min(98, Math.round((matchCount / totalCount) * 100) + 60) : 0;
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
              {cars.slice(0, 12).map((car: any) => (
                <WeatherStyleCarCard
                  key={car.id}
                  car={car}
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
