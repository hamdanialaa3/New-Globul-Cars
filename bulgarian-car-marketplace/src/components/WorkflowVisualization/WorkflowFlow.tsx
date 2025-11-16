// Workflow Flow Visualization Component
// مكون تصور سير العمل - القرص الدائري المحسّن

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Circular3DProgressLEDEnhanced from './Circular3DProgressLED_Enhanced';
import WorkflowPersistenceService from '@/services/workflowPersistenceService';
import { SELL_WORKFLOW_STEP_ORDER } from '@/constants/sellWorkflowSteps';

interface WorkflowFlowProps {
  currentStepIndex: number;
  totalSteps: number;
  language?: 'bg' | 'en';
  carBrand?: string; // اسم ماركة السيارة
  variant?: 'panel' | 'inline';
  className?: string;
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

const InlineContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.25rem 0;
`;

const WorkflowFlow: React.FC<WorkflowFlowProps> = ({
  currentStepIndex,
  totalSteps,
  language = 'bg',
  carBrand,
  variant = 'panel',
  className
}) => {
  // حساب النسبة المئوية (0-100%) بناءً على البيانات الفعلية + الخطوات المكتملة
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const currentProgress = WorkflowPersistenceService.getProgress();
      setProgress(currentProgress);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 2000);
    return () => clearInterval(interval);
  }, []);

  const workflowTotalSteps = SELL_WORKFLOW_STEP_ORDER.length || totalSteps;

  const circle = (
    <Circular3DProgressLEDEnhanced 
      progress={progress} 
      totalSteps={workflowTotalSteps}
      currentStep={currentStepIndex + 1}
      language={language}
      carBrand={carBrand}
      variant={variant === 'inline' ? 'compact' : 'full'}
    />
  );

  if (variant === 'inline') {
    return <InlineContainer className={className}>{circle}</InlineContainer>;
  }

  return <FlowContainer className={className}>{circle}</FlowContainer>;
};

export default WorkflowFlow;

