// Workflow Flow Visualization Component
// مكون تصور سير العمل - القرص الدائري المحسّن

import React from 'react';
import styled from 'styled-components';
import Circular3DProgressLEDEnhanced from './Circular3DProgressLED_Enhanced';

interface WorkflowFlowProps {
  currentStepIndex: number;
  totalSteps: number;
  language?: 'bg' | 'en';
  carBrand?: string; // اسم ماركة السيارة
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

const WorkflowFlow: React.FC<WorkflowFlowProps> = ({
  currentStepIndex,
  totalSteps,
  language = 'bg',
  carBrand
}) => {
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <FlowContainer>
      <Circular3DProgressLEDEnhanced 
        progress={progress} 
        totalSteps={totalSteps}
        currentStep={currentStepIndex + 1}
        language={language}
        carBrand={carBrand}
      />
    </FlowContainer>
  );
};

export default WorkflowFlow;

