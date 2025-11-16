// Enhanced Circular 3D LED Progress Indicator
// مؤشر التقدم الدائري ثلاثي الأبعاد المحسّن مع شعار السيارة والمسننات

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { getCarLogoUrl } from '../../services/car-logo-service';

interface Circular3DProgressLEDEnhancedProps {
  progress: number; // 0-100
  totalSteps: number;
  currentStep: number;
  language?: 'bg' | 'en';
  carBrand?: string; // اسم ماركة السيارة لعرض الشعار
  variant?: 'full' | 'compact';
  className?: string;
}

// ==================== ANIMATIONS ====================

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
`;

const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor);
  }
  50% {
    filter: drop-shadow(0 0 12px currentColor) drop-shadow(0 0 24px currentColor);
  }
`;

const clockwise = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const counterClockwise = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
`;

const loadingBarAnimate = keyframes`
  0% {
    transform: rotate(0deg) translateY(0);
    filter: hue-rotate(0deg);
  }
  20% {
    transform: rotate(calc(-90deg * var(--i))) translateY(calc(var(--i) * 0.5px));
  }
  60% {
    transform: rotate(calc(0deg * var(--i))) translateY(0);
  }
  100% {
    transform: rotate(0deg) translateY(0);
    filter: hue-rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff8f10, #005ca9);
    opacity: 0.8;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(255, 143, 16, 0.05), transparent 70%);
    pointer-events: none;
  }
`;

const CompactContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
`;

const CircularWrapper = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const SVGContainer = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 12;
  stroke-linecap: round;
`;

const CircleGlow = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.02);
  stroke-width: 16;
  stroke-linecap: round;
  filter: blur(8px);
`;

const CircleProgress = styled.circle<{ $progress: number; $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: ${2 * Math.PI * 100};
  stroke-dashoffset: ${props => 2 * Math.PI * 100 * (1 - props.$progress / 100)};
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease;
  animation: ${pulse} 2s ease-in-out infinite;
  filter: drop-shadow(0 0 12px ${props => props.$color}) 
          drop-shadow(0 0 24px ${props => props.$color}40);
`;

const InnerCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 
    inset 0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 -8px 24px rgba(255, 255, 255, 0.02),
    0 4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  
  /* 3D effect */
  &::before {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08), transparent 50%);
  }

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      rgba(255, 143, 16, 0.1) 25%,
      transparent 50%,
      rgba(0, 92, 169, 0.1) 75%,
      transparent 100%
    );
    animation: ${rotate} 8s linear infinite;
    opacity: 0.3;
    filter: blur(4px);
  }
`;

// القرص الزجاجي الشفاف الدوار
const GlassyOrbit = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$show ? '140px' : '0'};
  height: ${props => props.$show ? '140px' : '0'};
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(255, 143, 16, 0.05), transparent 50%);
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.1),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  animation: ${rotate} 6s linear infinite;
  opacity: ${props => props.$show ? 1 : 0};
  transition: all 0.6s ease;
  backdrop-filter: blur(2px);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    right: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff, #03e9f4);
    box-shadow: 0 0 10px #03e9f4, 0 0 20px #03e9f4;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff, #ff8f10);
    box-shadow: 0 0 10px #ff8f10, 0 0 20px #ff8f10;
  }
`;

// شعار السيارة في الوسط - شكل مسنن ⚙️
const CarLogoContainer = styled.div<{ $show: boolean }>`
  position: relative;
  z-index: 3;
  width: ${props => props.$show ? '130px' : '0'};
  height: ${props => props.$show ? '130px' : '0'};
  opacity: ${props => props.$show ? 1 : 0};
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* شكل مسنن بدلاً من الدائرة */
  clip-path: polygon(
    50% 0%, 61% 10%, 71% 8%, 79% 21%, 90% 29%, 
    92% 42%, 100% 50%, 92% 58%, 90% 71%, 79% 79%, 
    71% 92%, 61% 90%, 50% 100%, 39% 90%, 29% 92%, 
    21% 79%, 10% 71%, 8% 58%, 0% 50%, 8% 42%, 
    10% 29%, 21% 21%, 29% 8%, 39% 10%
  );
  
  background: 
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08), transparent 70%);
  padding: 0.75rem;
  
  /* تأثير التوهج حول الشعار */
  &::before {
    content: '';
    position: absolute;
    inset: -12px;
    clip-path: polygon(
      50% 0%, 61% 10%, 71% 8%, 79% 21%, 90% 29%, 
      92% 42%, 100% 50%, 92% 58%, 90% 71%, 79% 79%, 
      71% 92%, 61% 90%, 50% 100%, 39% 90%, 29% 92%, 
      21% 79%, 10% 71%, 8% 58%, 0% 50%, 8% 42%, 
      10% 29%, 21% 21%, 29% 8%, 39% 10%
    );
    background: radial-gradient(circle, transparent 40%, rgba(255, 143, 16, 0.15) 100%);
    animation: ${pulse} 3s ease-in-out infinite;
  }
`;

const CarLogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  animation: ${shimmer} 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
`;

const CenterContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressPercentage = styled.div<{ $color: string }>`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.$color};
  text-shadow: 
    0 0 20px ${props => props.$color}80,
    0 0 40px ${props => props.$color}40;
  font-feature-settings: 'tnum';
  animation: ${glow} 2s ease-in-out infinite;
  margin-top: 0.5rem;
`;

const PercentSymbol = styled.span`
  font-size: 1.5rem;
  opacity: 0.8;
`;

// LED Indicator احترافي بدلاً من الإيموجي
const StatusLEDIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 
    0 0 8px ${props => props.$color},
    0 0 16px ${props => `${props.$color}80`},
    0 0 24px ${props => `${props.$color}40`},
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  position: relative;
  animation: ${pulse} 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    filter: blur(1px);
  }
`;

const ProgressDescription = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  background: ${props => `${props.$color}15`};
  border-radius: 10px;
  border: 1px solid ${props => `${props.$color}30`};
  text-shadow: 0 0 10px ${props => `${props.$color}40`};
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// Star Icon احترافي بدلاً من ★
const StarIcon = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$color};
    clip-path: polygon(
      50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 
      50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%
    );
    filter: drop-shadow(0 0 8px ${props => props.$color});
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
    clip-path: polygon(
      50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 
      50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%
    );
  }
`;

const QualityBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1rem;
  background: ${props => `${props.$color}20`};
  border: 2px solid ${props => props.$color};
  border-radius: 20px;
  color: ${props => props.$color};
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 0.75rem;
  box-shadow: 
    0 4px 12px ${props => `${props.$color}40`},
    inset 0 1px 0 ${props => `${props.$color}40`};
`;

// ==================== GEARBOX (المسننات) ====================

const GearboxContainer = styled.div<{ $gearsCount: number }>`
  position: relative;
  width: 100%;
  height: ${props => props.$gearsCount > 0 ? '80px' : '0'};
  margin-top: ${props => props.$gearsCount > 0 ? '1.5rem' : '0'};
  opacity: ${props => props.$gearsCount > 0 ? 1 : 0};
  transition: all 0.6s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Gearbox = styled.div`
  position: relative;
  width: 200px;
  height: 80px;
  background: #111;
  border-radius: 8px;
  box-shadow: 
    0 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 0, 0, 0.8);
  overflow: hidden;
`;

const Gear = styled.div<{ 
  $size: 'large' | 'small';
  $position: { top: string; left: string };
  $rotation: 'clockwise' | 'counter';
  $speed: number;
  $show: boolean;
}>`
  position: absolute;
  width: ${props => props.$size === 'large' ? '60px' : '40px'};
  height: ${props => props.$size === 'large' ? '60px' : '40px'};
  border-radius: 50%;
  top: ${props => props.$position.top};
  left: ${props => props.$position.left};
  animation: ${props => props.$rotation === 'clockwise' ? clockwise : counterClockwise} 
             ${props => props.$speed}s infinite linear;
  opacity: ${props => props.$show ? 1 : 0};
  transform: scale(${props => props.$show ? 1 : 0});
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition-delay: ${props => props.$show ? '0.2s' : '0s'};

  &::after {
    content: "";
    position: absolute;
    width: ${props => props.$size === 'large' ? '42px' : '24px'};
    height: ${props => props.$size === 'large' ? '42px' : '24px'};
    border-radius: 50%;
    background: #111;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;

const GearInner = styled.div<{ $size: 'large' | 'small' }>`
  position: relative;
  width: 100%;
  height: 100%;
  background: #555;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 0 5px rgba(255, 255, 255, 0.1),
    inset 0 0 2px 2px rgba(0, 0, 0, 0.1),
    inset 0 0 2px 2px #090909;
`;

const GearBar = styled.div<{ $index: number; $size: 'large' | 'small' }>`
  position: absolute;
  width: ${props => props.$size === 'large' ? '12px' : '8px'};
  height: ${props => props.$size === 'large' ? '68px' : '46px'};
  background: #555;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) 
             rotate(${props => {
               const angles = [0, 60, 120, 90, 30, 150];
               return angles[props.$index % 6] || 0;
             }}deg);
  border-radius: 2px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
`;

// ==================== LOADING BAR ====================

const LoadingBarContainer = styled.div<{ $show: boolean }>`
  position: relative;
  display: flex;
  gap: 2px;
  margin-top: ${props => props.$show ? '1.5rem' : '0'};
  height: ${props => props.$show ? '8px' : '0'};
  opacity: ${props => props.$show ? 1 : 0};
  transition: all 0.4s ease;
`;

const LoadingBarSpan = styled.span<{ $i: number; $color: string }>`
  position: relative;
  width: 12px;
  height: 8px;
  display: block;
  --i: ${props => props.$i};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$color};
    box-shadow: 
      0 0 5px ${props => props.$color},
      0 0 15px ${props => props.$color},
      0 0 30px ${props => props.$color};
    animation: ${loadingBarAnimate} 8s linear infinite;
    animation-delay: calc(var(--i) * 0.1s);
    border-radius: 2px;
  }
`;

// ==================== HELPER FUNCTIONS ====================

const getProgressColor = (progress: number): string => {
  if (progress < 25) return '#e74c3c';
  if (progress < 50) return '#ff8f10';
  if (progress < 75) return '#f39c12';
  if (progress < 90) return '#27ae60';
  return '#16a085';
};

const getProgressLabel = (progress: number, language: 'bg' | 'en' = 'bg'): string => {
  const labels = {
    bg: {
      poor: 'Много малко информация',
      low: 'Малко информация',
      medium: 'Средна информация',
      good: 'Добра информация',
      excellent: 'Отлична информация'
    },
    en: {
      poor: 'Very Little Information',
      low: 'Low Information',
      medium: 'Medium Information',
      good: 'Good Information',
      excellent: 'Excellent Information'
    }
  };

  const lang = labels[language];

  if (progress < 25) return lang.poor;
  if (progress < 50) return lang.low;
  if (progress < 75) return lang.medium;
  if (progress < 90) return lang.good;
  return lang.excellent;
};

const getQualityLevel = (progress: number, language: 'bg' | 'en' = 'bg'): string => {
  const levels = {
    bg: {
      poor: 'НЕОБХОДИМА',
      low: 'ОСНОВНА',
      medium: 'СТАНДАРТНА',
      good: 'КАЧЕСТВЕНА',
      excellent: 'ПРЕМИУМ'
    },
    en: {
      poor: 'REQUIRED',
      low: 'BASIC',
      medium: 'STANDARD',
      good: 'QUALITY',
      excellent: 'PREMIUM'
    }
  };

  const lang = levels[language];

  if (progress < 25) return lang.poor;
  if (progress < 50) return lang.low;
  if (progress < 75) return lang.medium;
  if (progress < 90) return lang.good;
  return lang.excellent;
};

// عدد المسننات بناءً على التقدم
const getGearsCount = (progress: number): number => {
  if (progress < 25) return 1;
  if (progress < 50) return 2;
  if (progress < 75) return 3;
  return 4;
};

// عدد أشرطة Loading Bar بناءً على التقدم
const getLoadingBarsCount = (progress: number): number => {
  return Math.max(5, Math.min(20, Math.floor(progress / 5)));
};

// ==================== MAIN COMPONENT ====================

const Circular3DProgressLEDEnhanced: React.FC<Circular3DProgressLEDEnhancedProps> = ({
  progress,
  totalSteps,
  currentStep,
  language = 'bg',
  carBrand,
  variant = 'full',
  className
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [activeBrand, setActiveBrand] = useState<string>('');

  const radius = 100;
  const progressColor = getProgressColor(progress);
  const progressLabel = getProgressLabel(progress, language);
  const qualityLevel = getQualityLevel(progress, language);
  const gearsCount = getGearsCount(progress);
  const loadingBarsCount = getLoadingBarsCount(progress);

  // Load car logo when brand changes
  useEffect(() => {
    let isSubscribed = true;
    if (!carBrand) {
      // Keep previous logo; just mark not active brand
      setActiveBrand('');
      return () => { isSubscribed = false; };
    }
    const url = getCarLogoUrl(carBrand);
    const loader = new Image();
    loader.onload = () => {
      if (!isSubscribed) return;
      setLogoUrl(url);
      setLogoLoaded(true);
      setActiveBrand(carBrand);
    };
    loader.onerror = () => {
      if (!isSubscribed) return;
      // Fall back but do NOT clear instantly to reduce flicker
      setLogoUrl('/car-logos/mein_logo_rest.png');
      setLogoLoaded(true);
      setActiveBrand(carBrand);
    };
    loader.src = url;
    return () => { isSubscribed = false; };
  }, [carBrand]);

  // Gears configuration
  const gears = [
    { size: 'large', position: { top: '10px', left: '10px' }, rotation: 'counter', speed: 3, index: 0 },
    { size: 'small', position: { top: '31px', left: '50px' }, rotation: 'clockwise', speed: 3, index: 1 },
    { size: 'large', position: { top: '10px', left: '90px' }, rotation: 'counter', speed: 3, index: 2 },
    { size: 'small', position: { top: '13px', left: '128px' }, rotation: 'counter', speed: 6, index: 3 },
  ] as const;

  const circleContent = (
    <CircularWrapper>
      <SVGContainer>
        <CircleGlow cx="110" cy="110" r={radius} />
        <CircleBackground cx="110" cy="110" r={radius} />
        <CircleProgress
          cx="110"
          cy="110"
          r={radius}
          $progress={progress}
          $color={progressColor}
        />
      </SVGContainer>

      <InnerCircle>
        <GlassyOrbit $show={logoLoaded && !!activeBrand} />

        <CenterContent>
          {activeBrand && logoUrl && (
            <CarLogoContainer $show={logoLoaded}>
              <CarLogoImage 
                src={logoUrl} 
                alt={activeBrand}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/car-logos/mein_logo_rest.png';
                }}
              />
            </CarLogoContainer>
          )}
        </CenterContent>
      </InnerCircle>
    </CircularWrapper>
  );

  if (variant === 'compact') {
    return <CompactContainer className={className}>{circleContent}</CompactContainer>;
  }

  return (
    <Container className={className}>
      {circleContent}
      {/* النسبة المئوية تحت القرص */}
      <ProgressPercentage $color={progressColor}>
        {progress}<PercentSymbol>%</PercentSymbol>
      </ProgressPercentage>

      <ProgressDescription $color={progressColor}>
        <StatusLEDIndicator $color={progressColor} />
        {progressLabel}
      </ProgressDescription>

      <QualityBadge $color={progressColor}>
        <StarIcon $color={progressColor} />
        {qualityLevel}
      </QualityBadge>

      {/* المسننات المتحركة - تزداد مع التقدم */}
      <GearboxContainer $gearsCount={gearsCount}>
        <Gearbox>
          {gears.map((gear, index) => (
            <Gear
              key={index}
              $size={gear.size}
              $position={gear.position}
              $rotation={gear.rotation}
              $speed={gear.speed}
              $show={index < gearsCount}
            >
              <GearInner $size={gear.size}>
                {Array.from({ length: 6 }).map((_, barIndex) => (
                  <GearBar 
                    key={barIndex} 
                    $index={barIndex} 
                    $size={gear.size}
                  />
                ))}
              </GearInner>
            </Gear>
          ))}
        </Gearbox>
      </GearboxContainer>

      {/* Loading Bar - تظهر عند التقدم */}
      <LoadingBarContainer $show={progress > 10}>
        {Array.from({ length: loadingBarsCount }).map((_, i) => (
          <LoadingBarSpan 
            key={i} 
            $i={i + 1}
            $color={progressColor}
          />
        ))}
      </LoadingBarContainer>
    </Container>
  );
};

export default Circular3DProgressLEDEnhanced;

