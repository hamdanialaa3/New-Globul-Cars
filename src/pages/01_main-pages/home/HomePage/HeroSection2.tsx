import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MobileBGTheme } from '@/design-system/theme';
import { FaSearch, FaBolt, FaCar, FaBuilding, FaLeaf } from 'react-icons/fa';

const HeroContainer = styled.section`
  position: relative;
  height: 90vh;
  min-height: 600px;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${MobileBGTheme.brand.dark};
`;

const VideoBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  
  /* Animated gradient background - replaces video for better performance */
  background: linear-gradient(
    135deg,
    ${MobileBGTheme.brand.dark} 0%,
    ${MobileBGTheme.brand.primary} 25%,
    ${MobileBGTheme.brand.secondary} 50%,
    ${MobileBGTheme.brand.primary} 75%,
    ${MobileBGTheme.brand.dark} 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  /* Subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%);
    animation: patternMove 30s ease infinite;
  }
  
  @keyframes patternMove {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, 20px); }
  }
  
  /* Dark overlay for text readability */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom, 
      rgba(0,0,0,0.4), 
      ${MobileBGTheme.brand.dark}
    );
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 1000px;
  padding: ${MobileBGTheme.spacing.md};
  width: 100%;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: ${MobileBGTheme.spacing.md};
  line-height: 1.1;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);

   span {
    background: linear-gradient(135deg, ${MobileBGTheme.brand.primary}, ${MobileBGTheme.brand.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: ${MobileBGTheme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }
`;

const SearchContainer = styled(motion.div)`
  background: ${MobileBGTheme.glassmorphism.background};
  backdrop-filter: ${MobileBGTheme.glassmorphism.backdropFilter};
  border: ${MobileBGTheme.glassmorphism.border};
  box-shadow: ${MobileBGTheme.glassmorphism.shadow};
  border-radius: 20px;
  padding: ${MobileBGTheme.spacing.md};
  margin: ${MobileBGTheme.spacing.xl} auto;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: ${MobileBGTheme.spacing.md};
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: ${MobileBGTheme.spacing.sm} ${MobileBGTheme.spacing.md};
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: ${MobileBGTheme.animations.smooth};

  &:focus-within {
    background: rgba(255, 255, 255, 0.25);
    border-color: ${MobileBGTheme.brand.primary};
    transform: scale(1.01);
  }

  svg {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-right: ${MobileBGTheme.spacing.sm};
  }
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: white;
  width: 100%;
  padding: ${MobileBGTheme.spacing.sm};
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const QuickFilters = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: ${MobileBGTheme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterChip = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: ${MobileBGTheme.spacing.xs} ${MobileBGTheme.spacing.md};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${MobileBGTheme.spacing.xs};
  font-size: 0.9rem;
  transition: ${MobileBGTheme.animations.smooth};

  &:hover {
    background: ${MobileBGTheme.brand.primary};
    border-color: ${MobileBGTheme.brand.primary};
  }
`;

const StatsContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: ${MobileBGTheme.spacing.xxl};
  margin-top: ${MobileBGTheme.spacing.xl};
  
  @media (max-width: ${MobileBGTheme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${MobileBGTheme.spacing.md};
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const HeroSection2: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Quick filter handlers - Navigate to filtered search results
    const handleQuickFilter = (filterType: 'latest' | 'topOffers' | 'electric' | 'dealers') => {
        const filters: Record<string, string> = {
            latest: '/cars?sort=newest&days=1',
            topOffers: '/cars?sort=bestPrice&verified=true',
            electric: '/cars?fuelType=electric',
            dealers: '/cars?sellerType=dealer'
        };
        navigate(filters[filterType] || '/cars');
    };

    // Search handler
    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    // Handle Enter key in search input
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <HeroContainer>
            <VideoBackground>
                {/* Animated gradient background - optimized for performance */}
                {/* Replaces video for instant load and smooth animation */}
            </VideoBackground>

            <HeroContent>
                <Title
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Бъдещето на автомобилния пазар<br />
                    <span>в България е тук</span>
                </Title>

                <SearchContainer
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <SearchInputWrapper>
                        <FaSearch onClick={handleSearch} style={{ cursor: 'pointer' }} />
                        <SearchInput
                            placeholder="🤖 Търси с AI: 'BMW X5 2020 София до 30000'"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </SearchInputWrapper>

                    <QuickFilters>
                        <FilterChip 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickFilter('latest')}
                        >
                            <FaBolt /> Нови 24ч
                        </FilterChip>
                        <FilterChip 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickFilter('topOffers')}
                        >
                            <FaCar /> Топ Оферти
                        </FilterChip>
                        <FilterChip 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickFilter('electric')}
                        >
                            <FaLeaf /> Електрически
                        </FilterChip>
                        <FilterChip 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickFilter('dealers')}
                        >
                            <FaBuilding /> От Дилъри
                        </FilterChip>
                    </QuickFilters>
                </SearchContainer>

                <StatsContainer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <StatItem>
                        <StatNumber>221,450</StatNumber>
                        <StatLabel>Активни обяви</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatNumber>1,850</StatNumber>
                        <StatLabel>Нови днес</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatNumber>98%</StatNumber>
                        <StatLabel>Доволни клиенти</StatLabel>
                    </StatItem>
                </StatsContainer>
            </HeroContent>
        </HeroContainer>
    );
};
