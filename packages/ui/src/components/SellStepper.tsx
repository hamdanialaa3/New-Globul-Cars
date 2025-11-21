import React from 'react';
import styled from 'styled-components';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    title: string;
    titleBg: string;
    titleEn: string;
    description: string;
    descriptionBg: string;
    descriptionEn: string;
  }>;
  onStepClick?: (step: number) => void;
}

const StepperContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 2rem;
  border-radius: 0 0 20px 20px;
`;

const StepperWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  padding: 0 2rem;
`;

const StepItem = styled.div<{ $isActive: boolean; $isCompleted: boolean; $isClickable: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  cursor: ${props => props.$isClickable ? 'pointer' : 'default'};
  opacity: ${props => props.$isActive || props.$isCompleted ? 1 : 0.6};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.$isClickable ? 'translateY(-2px)' : 'none'};
  }

  &::after {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: ${props => 
      props.$isCompleted ? '#4CAF50' : 
      props.$isActive ? '#2196F3' : '#E0E0E0'
    };
    z-index: 1;
  }

  &:last-child::after {
    display: none;
  }
`;

const StepCircle = styled.div<{ $isActive: boolean; $isCompleted: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => 
    props.$isCompleted ? '#4CAF50' : 
    props.$isActive ? '#2196F3' : '#E0E0E0'
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  z-index: 2;
  position: relative;
  transition: all 0.3s ease;

  ${props => props.$isCompleted && `
    &::before {
      content: '✓';
      font-size: 20px;
    }
  `}
`;

const StepContent = styled.div`
  text-align: center;
  margin-top: 1rem;
  max-width: 150px;
`;

const StepTitle = styled.h3<{ $isActive: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$isActive ? 'bold' : 'normal'};
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
`;

const StepDescription = styled.p<{ $isActive: boolean }>`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.3;
`;

const ProgressBar = styled.div<{ progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 2px;
  transition: width 0.5s ease;
`;

const SellStepper: React.FC<StepperProps> = ({ 
  currentStep, 
  totalSteps, 
  steps, 
  onStepClick 
}) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <StepperContainer>
      <StepperWrapper>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isClickable = stepNumber <= currentStep && onStepClick;

          return (
            <StepItem
              key={step.id}
              $isActive={isActive}
              $isCompleted={isCompleted}
              $isClickable={!!isClickable}
              onClick={() => isClickable && onStepClick?.(stepNumber)}
            >
              <StepCircle $isActive={isActive} $isCompleted={isCompleted}>
                {!isCompleted && stepNumber}
              </StepCircle>
              <StepContent>
                <StepTitle $isActive={isActive}>
                  {step.titleBg}
                </StepTitle>
                <StepDescription $isActive={isActive}>
                  {step.descriptionBg}
                </StepDescription>
              </StepContent>
            </StepItem>
          );
        })}
        <ProgressBar progress={progress} />
      </StepperWrapper>
    </StepperContainer>
  );
};

export default SellStepper;
