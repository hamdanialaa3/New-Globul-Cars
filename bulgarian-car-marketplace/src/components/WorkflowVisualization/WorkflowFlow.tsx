// Workflow Flow Visualization Component
// مكون تصور سير العمل - نمط n8n احترافي

import React from 'react';
import styled from 'styled-components';
import WorkflowNode from './WorkflowNode';
import ProgressLED from './ProgressLED';

interface WorkflowStep {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isCompleted: boolean;
}

interface WorkflowFlowProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  onStepClick?: (stepId: string, index: number) => void;
  totalSteps: number;
}

const FlowContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 143, 16, 0.1);
  position: sticky;
  top: 2rem;
`;

const FlowTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const NodesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 2rem 0;
  position: relative;
`;

const NodeWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
`;

const Connector = styled.div<{ $isActive: boolean }>`
  position: absolute;
  left: 30px;
  top: 60px;
  width: 2px;
  height: 100%;
  background: ${props => props.$isActive 
    ? 'linear-gradient(180deg, #ff8f10, #005ca9)' 
    : '#e9ecef'
  };
  z-index: 1;

  ${props => props.$isActive && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -1px;
      width: 4px;
      height: 20px;
      background: #ff8f10;
      border-radius: 2px;
      animation: flow 2s linear infinite;
    }

    @keyframes flow {
      0% {
        top: 0;
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        top: 100%;
        opacity: 0;
      }
    }
  `}
`;

const WorkflowFlow: React.FC<WorkflowFlowProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  totalSteps
}) => {
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <FlowContainer>
      <FlowTitle>Workflow Progress</FlowTitle>
      
      <ProgressLED 
        progress={progress} 
        totalSteps={totalSteps}
        currentStep={currentStepIndex + 1}
      />

      <NodesContainer>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = step.isCompleted;
          const showConnector = index < steps.length - 1;

          return (
            <NodeWrapper key={step.id}>
              {showConnector && (
                <Connector $isActive={isCompleted} />
              )}
              
              <WorkflowNode
                label={step.label}
                isActive={isActive}
                isCompleted={isCompleted}
                icon={step.icon}
                onClick={() => onStepClick && onStepClick(step.id, index)}
              />
            </NodeWrapper>
          );
        })}
      </NodesContainer>
    </FlowContainer>
  );
};

export default WorkflowFlow;

