// Circular 3D LED Progress Indicator
// مؤشر التقدم الدائري ثلاثي الأبعاد مع LED

import React from 'react';
import styled, { keyframes } from 'styled-components';

interface Circular3DProgressLEDProps {
  progress: number; // 0-100
  totalSteps: number;
  currentStep: number;
  completedFields?: number; // عدد الحقول المكتملة
  totalFields?: number; // إجمالي الحقول المطلوبة
  language?: 'bg' | 'en'; // اللغة
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

const CircularWrapper = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
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

const CenterContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  /* الوسط فارغ تماماً - جاهز لإضافة محتوى لاحقاً */
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
  margin-top: 1.5rem;
`;

const PercentSymbol = styled.span`
  font-size: 1.5rem;
  opacity: 0.8;
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
`;

const QualityBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => `${props.$color}20`};
  border: 2px solid ${props => props.$color};
  border-radius: 20px;
  color: ${props => props.$color};
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
  box-shadow: 
    0 4px 12px ${props => `${props.$color}40`},
    inset 0 1px 0 ${props => `${props.$color}40`};
`;

// ==================== HELPER FUNCTIONS ====================

const getProgressColor = (progress: number): string => {
  if (progress < 25) return '#e74c3c'; // Red
  if (progress < 50) return '#ff8f10'; // Orange
  if (progress < 75) return '#f39c12'; // Yellow
  if (progress < 90) return '#27ae60'; // Green
  return '#16a085'; // Dark Green (Olive)
};

const getProgressLabel = (progress: number, language: 'bg' | 'en' = 'en'): string => {
  const labels = {
    bg: {
      poor: '🔴 Много малко информация',
      low: '🟠 Малко информация',
      medium: '🟡 Средна информация',
      good: '🟢 Добра информация',
      excellent: '🟢 Отлична информация'
    },
    en: {
      poor: '🔴 Very Little Information',
      low: '🟠 Low Information',
      medium: '🟡 Medium Information',
      good: '🟢 Good Information',
      excellent: '🟢 Excellent Information'
    }
  };

  const lang = labels[language];

  if (progress < 25) return lang.poor;
  if (progress < 50) return lang.low;
  if (progress < 75) return lang.medium;
  if (progress < 90) return lang.good;
  return lang.excellent;
};

const getQualityLevel = (progress: number, language: 'bg' | 'en' = 'en'): string => {
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

// ==================== MAIN COMPONENT ====================

const Circular3DProgressLED: React.FC<Circular3DProgressLEDProps> = ({
  progress,
  totalSteps,
  currentStep,
  completedFields = 0,
  totalFields = 100,
  language = 'bg'
}) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressColor = getProgressColor(progress);
  const progressLabel = getProgressLabel(progress, language);
  const qualityLevel = getQualityLevel(progress, language);

  return (
    <Container>
      <CircularWrapper>
        <SVGContainer>
          {/* Glow background */}
          <CircleGlow
            cx="110"
            cy="110"
            r={radius}
          />
          
          {/* Background circle */}
          <CircleBackground
            cx="110"
            cy="110"
            r={radius}
          />
          
          {/* Progress circle */}
          <CircleProgress
            cx="110"
            cy="110"
            r={radius}
            $progress={progress}
            $color={progressColor}
          />
        </SVGContainer>

        <InnerCircle>
          <CenterContent>
            {/* ⚫ الوسط فارغ تماماً - جاهز لإضافة محتوى لاحقاً */}
          </CenterContent>
        </InnerCircle>
      </CircularWrapper>

      {/* النسبة المئوية تحت القرص */}
      <ProgressPercentage $color={progressColor}>
        {progress}<PercentSymbol>%</PercentSymbol>
      </ProgressPercentage>

      <ProgressDescription $color={progressColor}>
        {progressLabel}
      </ProgressDescription>

      <QualityBadge $color={progressColor}>
        ★ {qualityLevel}
      </QualityBadge>
    </Container>
  );
};

export default Circular3DProgressLED;

