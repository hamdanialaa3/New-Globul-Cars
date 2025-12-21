// Wizard Progress Component
// مكون شريط التقدم
import React from 'react';
import styled from 'styled-components';
import { Check, Circle } from 'lucide-react';
import { useCarListingStore } from '../../stores/car-listing-store';
import { useLanguage } from '@/contexts/LanguageContext';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  margin-bottom: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--border);
    z-index: 0;
  }
`;

const ProgressLine = styled.div<{ $progress: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  background: var(--accent-primary);
  z-index: 1;
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
`;

const StepItem = styled.button<{ $isActive: boolean; $isCompleted: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: ${props => props.$isCompleted ? 'pointer' : 'default'};
  opacity: ${props => props.$isActive || props.$isCompleted ? 1 : 0.5};
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: ${props => props.$isCompleted ? 1 : 0.8};
  }
`;

const StepIcon = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.$isCompleted) return 'var(--success, #22c55e)';
    if (props.$isActive) return 'var(--accent-primary, #3b82f6)';
    return 'var(--bg-card, #ffffff)';
  }};
  color: white;
  border: 2px solid ${props => {
    if (props.$isCompleted) return 'var(--success, #22c55e)';
    if (props.$isActive) return 'var(--accent-primary, #3b82f6)';
    return 'var(--border, #e2e8f0)';
  }};
  transition: all 0.3s ease;
`;

const StepLabel = styled.span<{ $isActive: boolean }>`
  font-size: 0.75rem;
  font-weight: ${props => props.$isActive ? 600 : 400};
  color: ${props => props.$isActive ? 'var(--accent-primary, #3b82f6)' : 'var(--text-secondary, #64748b)'};
  text-align: center;
  white-space: nowrap;
`;

const STEP_LABELS = [
  { en: 'Vehicle Type', bg: 'Тип МПС' },
  { en: 'Vehicle Data', bg: 'Данни' },
  { en: 'Equipment', bg: 'Оборудване' },
  { en: 'Images', bg: 'Снимки' },
  { en: 'Pricing', bg: 'Цена' },
  { en: 'Contact', bg: 'Контакт' },
];

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const { completedSteps, goToStep } = useCarListingStore();
  const { language } = useLanguage();
  
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <ProgressContainer>
      <ProgressLine $progress={progress} />
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.has(index);
        const label = STEP_LABELS[index]?.[language === 'bg' ? 'bg' : 'en'] || `Step ${index + 1}`;

        return (
          <StepItem
            key={index}
            $isActive={isActive}
            $isCompleted={isCompleted}
            onClick={() => isCompleted && goToStep(index)}
            aria-label={`Step ${index + 1}: ${label}`}
          >
            <StepIcon $isActive={isActive} $isCompleted={isCompleted}>
              {isCompleted ? (
                <Check size={20} />
              ) : (
                <Circle size={20} />
              )}
            </StepIcon>
            <StepLabel $isActive={isActive}>{label}</StepLabel>
          </StepItem>
        );
      })}
    </ProgressContainer>
  );
};

