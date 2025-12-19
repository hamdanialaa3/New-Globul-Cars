// Sell Modal Page - Opens the modal when route is /sell/auto
// صفحة فتح الـ modal عند /sell/auto

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SellVehicleModal from '../../../components/SellWorkflow/SellVehicleModal';

const SellModalPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  // Get initial step and vehicleType from URL params if exists
  const stepParam = searchParams.get('step');
  const vehicleTypeParam = searchParams.get('vt');
  const initialStep = stepParam ? parseInt(stepParam, 10) : 0;
  const initialVehicleType = vehicleTypeParam || undefined;

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
