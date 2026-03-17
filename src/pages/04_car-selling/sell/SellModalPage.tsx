// Sell Modal Page - Opens the modal when route is /sell/auto
// صفحة فتح الـ modal عند /sell/auto

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SellVehicleModal from '@/components/SellWorkflow/SellVehicleModal';
import UnifiedWorkflowPersistenceService from '@/services/unified-workflow-persistence.service';

const SellModalPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  // Get initial step and vehicleType from URL params if exists
  const stepParam = searchParams.get('step');
  const vehicleTypeParam = searchParams.get('vt');
  const initialStep = stepParam ? parseInt(stepParam, 10) : 0;
  const initialVehicleType = vehicleTypeParam || undefined;

  // ✅ FIX: Start timer automatically when opening /sell/auto page
  useEffect(() => {
    // Check if there's existing workflow data
    const existingData = UnifiedWorkflowPersistenceService.loadData();
    
    if (existingData && !existingData.isPublished) {
      // Timer will start automatically via startTimer() when data exists
      // But we ensure it's running by checking timer state
      const timerState = UnifiedWorkflowPersistenceService.getTimerState();
      if (timerState.isActive && timerState.remainingSeconds > 0) {
        // Timer is already running - no action needed
        return;
      }
    } else {
      // No existing data - initialize empty workflow to start timer
      // This ensures timer starts even if user hasn't filled any data yet
      UnifiedWorkflowPersistenceService.saveData({
        currentStep: initialStep,
        startedAt: Date.now(),
        lastSavedAt: Date.now(),
        isPublished: false,
        completedSteps: []
      }, initialStep);
    }
  }, [initialStep]);

  const handleClose = () => {
    setIsOpen(false);
    // Navigate back or to home
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleComplete = () => {
    // Wizard handles navigation internally after publishing
    // Just close the modal
    setIsOpen(false);
    // Navigation is handled by Wizard's handleComplete
  };

  return (
    <SellVehicleModal
      isOpen={isOpen}
      onClose={handleClose}
      onComplete={handleComplete}
      initialStep={initialStep}
      initialVehicleType={initialVehicleType}
    />
  );
};

export default SellModalPage;
