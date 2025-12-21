// Workflow Progress Bar
// شريط التقدم عبر خطوات الـ workflow

import React from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  
  @media (max-width: 768px) {
    padding: 1.25rem 0.75rem;
    overflow-x: auto;
  }
`;

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 900px;
  width: 100%;
  
  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  position: relative;
  z-index: 2;
  
  background: ${props => 
    props.$completed 
      ? 'var(--accent-primary)' 
      : props.$active 
        ? 'var(--accent-primary)' 
        : 'var(--bg-tertiary)'
  };
  
  color: ${props => 
    props.$completed || props.$active 
      ? 'white' 
      : 'var(--text-tertiary)'
  };
  
  border: 2px solid ${props => 
    props.$completed 
      ? 'var(--accent-primary)' 
      : props.$active 
        ? 'var(--accent-primary)' 
        : 'var(--border)'
  };
  
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
`;

const StepLabel = styled.div<{ $active: boolean; $completed: boolean }>`
  font-size: 0.875rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  color: ${props => 
    props.$active 
      ? 'var(--accent-primary)' 
      : props.$completed 
        ? 'var(--text-primary)' 
        : 'var(--text-tertiary)'
  };
  text-align: center;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const StepConnector = styled.div<{ $completed: boolean }>`
  position: absolute;
  top: 21px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: ${props => 
    props.$completed 
      ? 'var(--accent-primary)' 
      : 'var(--border)'
  };
  z-index: 1;
  transition: background 0.3s ease;
  
  @media (max-width: 768px) {
    top: 18px;
  }
`;

const CheckIcon = styled(Check)`
  width: 20px;
  height: 20px;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }
`;

interface WorkflowStep {
  id: number;
  path: string;
  labelKey: string;
}

export const WorkflowProgressBar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const steps: WorkflowStep[] = [
    { id: 1, path: '/sell/auto', labelKey: 'workflow.steps.vehicle' },
    { id: 2, path: '/fahrzeugdaten', labelKey: 'workflow.steps.details' },
    { id: 3, path: '/equipment', labelKey: 'workflow.steps.equipment' },
    { id: 4, path: '/bilder', labelKey: 'workflow.steps.images' },
    { id: 5, path: '/preview', labelKey: 'workflow.steps.preview' }
  ];

  // Determine current step based on URL
  const currentStepIndex = steps.findIndex(step => 
    location.pathname.includes(step.path)
  );
  
  const currentStep = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  return (
    <ProgressContainer>
      <ProgressWrapper>
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;

          return (
            <Step
              key={step.id}
              $active={isActive}
              $completed={isCompleted}
            >
              <StepNumber $active={isActive} $completed={isCompleted}>
                {isCompleted ? <CheckIcon /> : step.id}
              </StepNumber>
              
              <StepLabel $active={isActive} $completed={isCompleted}>
                {t(step.labelKey) || `Step ${step.id}`}
              </StepLabel>
              
              {index < steps.length - 1 && (
                <StepConnector $completed={isCompleted} />
              )}
            </Step>
          );
        })}
      </ProgressWrapper>
    </ProgressContainer>
  );
};

export default WorkflowProgressBar;
