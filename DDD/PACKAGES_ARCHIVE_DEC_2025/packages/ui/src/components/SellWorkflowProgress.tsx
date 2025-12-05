// Sell Workflow Progress Indicator
// مؤشر تقدم workflow بيع السيارة

import React from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';

interface WorkflowStep {
  id: string;
  label: string;
  labelBg: string;
  isComplete: boolean;
  isCurrent: boolean;
}

interface SellWorkflowProgressProps {
  currentStep: string;
  language: 'bg' | 'en';
}

const ProgressContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ProgressTitle = styled.h3`
  text-align: center;
  color: #2c3e50;
  margin: 0 0 2rem 0;
  font-size: 1.2rem;
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StepLine = styled.div<{ isComplete: boolean }>`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: ${props => props.isComplete ? '#27ae60' : '#e0e0e0'};
  z-index: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StepItem = styled.div<{ isComplete: boolean; isCurrent: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  z-index: 2;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    padding: 0.5rem;
    background: ${props => props.isCurrent ? 'rgba(102, 126, 234, 0.05)' : 'transparent'};
    border-radius: 10px;
  }
`;

const StepCircle = styled.div<{ isComplete: boolean; isCurrent: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  
  background: ${props => {
    if (props.isComplete) return 'linear-gradient(135deg, #27ae60, #229954)';
    if (props.isCurrent) return 'linear-gradient(135deg, #667eea, #764ba2)';
    return '#e0e0e0';
  }};
  
  color: ${props => (props.isComplete || props.isCurrent) ? 'white' : '#7f8c8d'};
  
  ${props => props.isCurrent && `
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    animation: pulse 2s infinite;
  `}

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
    }
  }
`;

const StepLabel = styled.div<{ isCurrent: boolean }>`
  font-size: 0.85rem;
  text-align: center;
  color: ${props => props.isCurrent ? '#667eea' : '#7f8c8d'};
  font-weight: ${props => props.isCurrent ? '600' : '500'};
  max-width: 100px;

  @media (max-width: 768px) {
    max-width: none;
    text-align: left;
  }
`;

const ProgressBar = styled.div`
  margin-top: 2rem;
  background: #e0e0e0;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  width: ${props => props.percentage}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
`;

const SellWorkflowProgress: React.FC<SellWorkflowProgressProps> = ({ currentStep, language }) => {
  const steps: WorkflowStep[] = [
    { id: 'vehicle', label: 'Vehicle Type', labelBg: 'Вид автомобил', isComplete: false, isCurrent: false },
    { id: 'seller', label: 'Seller Type', labelBg: 'Тип продавач', isComplete: false, isCurrent: false },
    { id: 'data', label: 'Vehicle Data', labelBg: 'Данни', isComplete: false, isCurrent: false },
    { id: 'equipment', label: 'Equipment', labelBg: 'Оборудване', isComplete: false, isCurrent: false },
    { id: 'images', label: 'Images', labelBg: 'Снимки', isComplete: false, isCurrent: false },
    { id: 'pricing', label: 'Pricing', labelBg: 'Ценообразуване', isComplete: false, isCurrent: false },
    { id: 'contact', label: 'Contact', labelBg: 'Контакт', isComplete: false, isCurrent: false }
  ];

  // Map current step to progress
  const stepMap: Record<string, number> = {
    'auto': 0,
    'verkaeufertyp': 1,
    'details': 2,
    'ausstattung': 3,
    'bilder': 4,
    'preis': 5,
    'kontakt': 6
  };

  const currentStepIndex = stepMap[currentStep] ?? 0;

  // Update steps status
  steps.forEach((step, index) => {
    step.isComplete = index < currentStepIndex;
    step.isCurrent = index === currentStepIndex;
  });

  const completionPercentage = Math.round((currentStepIndex / (steps.length - 1)) * 100);

  return (
    <ProgressContainer>
      <ProgressTitle>
        {language === 'bg' ? 'Прогрес на обявата' : 'Listing Progress'}
      </ProgressTitle>
      
      <StepsContainer>
        {steps.map((step, index) => (
          <StepItem key={step.id} isComplete={step.isComplete} isCurrent={step.isCurrent}>
            <StepCircle isComplete={step.isComplete} isCurrent={step.isCurrent}>
              {step.isComplete ? <Check size={20} /> : index + 1}
            </StepCircle>
            <StepLabel isCurrent={step.isCurrent}>
              {language === 'bg' ? step.labelBg : step.label}
            </StepLabel>
          </StepItem>
        ))}
      </StepsContainer>

      <ProgressBar>
        <ProgressFill percentage={completionPercentage} />
      </ProgressBar>
      
      <ProgressText>
        {completionPercentage}% {language === 'bg' ? 'завършено' : 'complete'}
      </ProgressText>
    </ProgressContainer>
  );
};

export default SellWorkflowProgress;


