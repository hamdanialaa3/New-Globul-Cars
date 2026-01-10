/**
 * Progress Bar Component
 * Shows step-by-step progress in multi-step forms (e.g., Sell Wizard)
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  showLabels?: boolean;
}

const Container = styled.div`
  width: 100%;
  padding: 20px 0;
  margin-bottom: 24px;
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: ${props => props.theme.border};
  z-index: 0;
`;

const ProgressFill = styled.div<{ progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: ${props => props.theme.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const Step = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const StepCircle = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.isCompleted) return props.theme.success || '#10b981';
    if (props.isActive) return props.theme.primary;
    return props.theme.bg.light;
  }};
  color: ${props => {
    if (props.isCompleted || props.isActive) return 'white';
    return props.theme.text.secondary;
  }};
  border: 2px solid ${props => {
    if (props.isCompleted) return props.theme.success || '#10b981';
    if (props.isActive) return props.theme.primary;
    return props.theme.border;
  }};
`;

const StepLabel = styled.div<{ isActive: boolean }>`
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  color: ${props => props.isActive ? props.theme.text.primary : props.theme.text.secondary};
  font-weight: ${props => props.isActive ? 600 : 400};
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileStepInfo = styled.div`
  display: none;
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme.text.secondary};
  margin-bottom: 12px;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  steps,
  showLabels = true
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <Container>
      <MobileStepInfo>
        Step {currentStep} of {totalSteps}
      </MobileStepInfo>
      <StepsContainer>
        <ProgressLine>
          <ProgressFill progress={progressPercentage} />
        </ProgressLine>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const label = steps?.[step - 1] || `Step ${step}`;

          return (
            <Step key={step} isActive={isActive} isCompleted={isCompleted}>
              <StepCircle isActive={isActive} isCompleted={isCompleted}>
                {isCompleted ? <Check size={20} /> : step}
              </StepCircle>
              {showLabels && (
                <StepLabel isActive={isActive}>
                  {label}
                </StepLabel>
              )}
            </Step>
          );
        })}
      </StepsContainer>
    </Container>
  );
};

export default ProgressBar;
