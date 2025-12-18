// SellWorkflow Component - Multi-step wizard wrapper
// مكوّن مسار البيع - غلاف المعالج متعدد الخطوات

import React from 'react';
import { logger } from '@/services/logger-service';

export interface SellWorkflowProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  draftData?: Record<string, unknown>;
}

export const SellWorkflow: React.FC<SellWorkflowProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  draftData,
  children,
}) => {
  if (currentStep < 1 || currentStep > totalSteps) {
    logger.warn('SellWorkflow: invalid step', { currentStep, totalSteps });
  }
  return (
    <div aria-label="sell-workflow">
      {/* Minimal shell; actual step components render via children */}
      {children}
      <div style={{ display: 'none' }}>
        {/* Navigation handlers accessible to step components */}
        <button onClick={onPrev} aria-hidden />
        <button onClick={onNext} aria-hidden />
      </div>
    </div>
  );
};

export default SellWorkflow;
