/**
 * DriveTypeShowcaseSection.tsx
 * قسم عرض السيارات حسب نوع الدفع
 * Drive Type Showcase Section
 * 
 * Displays cars grouped by drive type (FWD, RWD, AWD, 4WD)
 * يعرض السيارات مجمعة حسب نوع الدفع (دفع أمامي، خلفي، رباعي)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
// ... existing imports
import { Gauge, Compass, Mountain, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { glassNeutralButton } from '../../../../styles/glassmorphism-buttons';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const SectionContainer = styled.section`
  max-width: 1440px;
  margin: 0 auto;
  padding: 4rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  
  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const DriveTypeName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const DriveTypeDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const DriveTypeFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  
  li {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
    
    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--primary-color);
      font-weight: bold;
    }
  }
`;

const ViewCarsButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-color-dark);
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// ============================================================================
// DRIVE TYPE DATA
// ============================================================================

interface DriveTypeConfig {
  id: string;
  icon: React.ReactNode;
  nameBg: string;
  nameEn: string;
  descriptionBg: string;
  descriptionEn: string;
  featuresBg: string[];
  featuresEn: string[];
  searchValue: string;
}

const DRIVE_TYPES: DriveTypeConfig[] = [
  {
    id: 'fwd',
    icon: <Gauge />,
    nameBg: 'Предно задвижване',
    nameEn: 'Front-Wheel Drive',
    descriptionBg: 'Идеални за градско шофиране с отлична икономия на гориво',
    descriptionEn: 'Ideal for city driving with excellent fuel economy',
    featuresBg: [
      'По-добра икономия на гориво',
      'Отлично сцепление при мокри условия',
      'Просторен интериор'
    ],
    featuresEn: [
      'Better fuel economy',
      'Excellent traction in wet conditions',
      'Spacious interior'
    ],
    searchValue: 'Преден (FWD)'
  },
  {
    id: 'rwd',
    icon: <Compass />,
    nameBg: 'Задно задвижване',
    nameEn: 'Rear-Wheel Drive',
    descriptionBg: 'За любителите на спортно шофиране и високи перформанси',
    descriptionEn: 'For sports driving enthusiasts and high performance',
    featuresBg: [
      'По-добро управление',
      'Оптимално разпределение на теглото',
      'Спортни характеристики'
    ],
    featuresEn: [
      'Better handling',
      'Optimal weight distribution',
      'Sporty characteristics'
    ],
    searchValue: 'Заден (RWD)'
  },
  {
    id: 'awd',
    icon: <Mountain />,
    nameBg: 'Четирикоколесно задвижване',
    nameEn: 'All-Wheel Drive',
    descriptionBg: 'Максимално сцепление при всякакви метеорологични условия',
    descriptionEn: 'Maximum traction in all weather conditions',
    featuresBg: [
      'Отлична стабилност',
      'Безопасност при всякакви условия',
      'Постоянно задвижване на 4 колела'
    ],
    featuresEn: [
      'Excellent stability',
      'Safety in all conditions',
      'Permanent 4-wheel drive'
    ],
    searchValue: 'Четирикоколесен (AWD)'
  },
  {
    id: '4wd',
    icon: <Truck />,
    nameBg: '4x4 Задвижване',
    nameEn: '4x4 Drive',
    descriptionBg: 'За офроуд приключения и труднодостъпни терени',
    descriptionEn: 'For off-road adventures and difficult terrains',
    featuresBg: [
      'Висока проходимост',
      'Възможност за превключване',
      'Идеален за офроуд'
    ],
    featuresEn: [
      'High ground clearance',
      'Switchable capability',
      'Perfect for off-road'
    ],
    searchValue: '4x4 (4WD)'
  }
];

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 0 1rem;
`;

const DriveTypesScroll = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding: 1rem 0.5rem 2rem 0.5rem; /* Bottom padding for shadow/hover effects */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  /* Hide scrollbar for clean look */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ScrollButton = styled.button<{ $direction: 'left' | 'right' }>`
  ${glassNeutralButton}
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: -1rem;' : 'right: -1rem;'}
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Ensure default background is not transparent for visibility */
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    display: none; /* Hide on mobile, use touch scroll */
  }

  &:hover {
    background: var(--bg-primary);
    transform: translateY(-50%) scale(1.1);
  }
`;

// Updated Card Style for Horizontal Layout
const DriveTypeCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  
  /* Fixed width for carousel items */
  min-width: 320px;
  max-width: 320px;
  flex-shrink: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
    
    &::before {
      opacity: 0.05;
    }
  }
  
  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 480px) {
    min-width: 280px;
    max-width: 280px;
  }
`;

// ... other existing component definitions ...

const DriveTypeShowcaseSection: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDriveTypeClick = (driveType: DriveTypeConfig) => {
    navigate(`/advanced-search?driveType=${encodeURIComponent(driveType.searchValue)}`);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350; // Card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>
          {language === 'bg' ? 'Намерете автомобил по тип задвижване' : 'Find Cars by Drive Type'}
        </SectionTitle>
        <SectionSubtitle>
          {language === 'bg'
            ? 'Изберете задвижването, което отговаря на вашия стил на шофиране'
            : 'Choose the drive type that matches your driving style'}
        </SectionSubtitle>
      </SectionHeader>

      <CarouselContainer>
        <ScrollButton $direction="left" onClick={() => scroll('left')} aria-label="Scroll left">
          <ChevronLeft size={24} />
        </ScrollButton>

        <DriveTypesScroll ref={scrollRef}>
          {DRIVE_TYPES.map((driveType) => (
            <DriveTypeCard
              key={driveType.id}
              onClick={() => handleDriveTypeClick(driveType)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDriveTypeClick(driveType);
                }
              }}
            >
              <IconWrapper>{driveType.icon}</IconWrapper>
              <DriveTypeName>
                {language === 'bg' ? driveType.nameBg : driveType.nameEn}
              </DriveTypeName>
              <DriveTypeDescription>
                {language === 'bg' ? driveType.descriptionBg : driveType.descriptionEn}
              </DriveTypeDescription>
              <DriveTypeFeatures>
                {(language === 'bg' ? driveType.featuresBg : driveType.featuresEn).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </DriveTypeFeatures>
              <ViewCarsButton>
                {language === 'bg' ? 'Преглед на автомобили' : 'View Cars'}
              </ViewCarsButton>
            </DriveTypeCard>
          ))}
        </DriveTypesScroll>

        <ScrollButton $direction="right" onClick={() => scroll('right')} aria-label="Scroll right">
          <ChevronRight size={24} />
        </ScrollButton>
      </CarouselContainer>
    </SectionContainer>
  );
};

export default DriveTypeShowcaseSection;
