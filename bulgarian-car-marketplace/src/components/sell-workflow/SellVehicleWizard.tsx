// Sell Vehicle Wizard Component
// معالج خطوات بيع السيارة داخل الـ modal - نمط mobile.de

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { SELL_WORKFLOW_STEPS, SellWorkflowStepId } from '../../constants/sellWorkflowSteps';
import useSellWorkflow from '../../hooks/useSellWorkflow';
import SellWorkflowService from '../../services/sellWorkflowService';
import { ImageStorageService } from '../../services/ImageStorageService';
import { WorkflowPersistenceService } from '../../services/unified-workflow-persistence.service';
import { toast } from 'react-toastify';
import { logger } from '../../services/logger-service';
import SellVehicleStep1 from './steps/SellVehicleStep1';
import SellVehicleStep2 from './steps/SellVehicleStep2';
import SellVehicleStep3 from './steps/SellVehicleStep3';
import SellVehicleStep4 from './steps/SellVehicleStep4';
import SellVehicleStep5 from './steps/SellVehicleStep5';
import SellVehicleStep6 from './steps/SellVehicleStep6';
import BladeStepper from './BladeStepper';

interface SellVehicleWizardProps {
  initialStep?: number;
  onComplete: () => void;
  onCancel: () => void;
  initialVehicleType?: string;
  mode?: 'create' | 'edit';
  existingCarId?: string;
}

const TOTAL_STEPS = 6; // بدون preview و publish - فقط الخطوات الأساسية

// Animations
const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 500px;
  width: 100%;
`;

const StepContent = styled.div<{ $direction: 'forward' | 'backward' }>`
  animation: ${props => props.$direction === 'forward' ? slideInRight : slideInLeft} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  text-align: center;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  position: relative;
`;

const ResetButton = styled.button`
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  
  &:hover:not(:disabled) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ResetConfirmDialog = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 280px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ResetConfirmTitle = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #f59e0b;
  }
`;

const ResetConfirmText = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ResetConfirmButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button<{ $variant: 'danger' | 'cancel' }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.$variant === 'danger' ? `
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
      transform: scale(1.05);
    }
  ` : `
    background: var(--bg-secondary);
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-hover);
    }
  `}
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--accent-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }
  ` : `
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border);
    
    &:hover:not(:disabled) {
      border-color: var(--accent-primary);
      background: var(--bg-hover);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;



export const SellVehicleWizard: React.FC<SellVehicleWizardProps> = ({
  onComplete,
  onCancel,
  initialVehicleType,
  mode = 'create',
  existingCarId,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { workflowData, updateWorkflowData, clearWorkflowData } = useSellWorkflow();
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Dropdown menu states
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Set initial vehicle type if provided from URL
  useEffect(() => {
    if (initialVehicleType && !workflowData.vehicleType) {
      updateWorkflowData({ vehicleType: initialVehicleType }, 'vehicle-selection');
    }
  }, [initialVehicleType, workflowData.vehicleType, updateWorkflowData]);

  // Load existing car data for Edit Mode
  useEffect(() => {
    const loadCarForEdit = async () => {
      if (mode === 'edit' && existingCarId) {
        try {
          clearWorkflowData();

          const { unifiedCarService } = await import('../../services/car/unified-car.service');
          const car = await unifiedCarService.getCarById(existingCarId);

          if (car) {
            const mappedData: any = {
              vehicleType: (car as any).vehicleType || 'car',
              make: car.make,
              model: car.model,
              year: car.year?.toString() || '',
              mileage: car.mileage?.toString() || '',
              fuelType: car.fuelType,
              transmission: car.transmission,
              power: car.power?.toString() || '',
              engineSize: (car as any).engineSize?.toString() || '',
              price: car.price?.toString() || '',
              currency: (car as any).currency || 'BGN',
              sellerName: (car as any).sellerName || currentUser?.displayName || '',
              sellerPhone: (car as any).sellerPhone || '',
              city: (car as any).city || '',
              region: (car as any).region || '',
              description: (car as any).description || '',
              images: (car.images || []).join(','),
            };

            if (car.extras) mappedData.extrasEquipment = Array.isArray(car.extras) ? car.extras : (car.extras as string).split(',');
            if (car.safety) mappedData.safetyEquipment = Array.isArray(car.safety) ? car.safety : (car.safety as string).split(',');
            if (car.comfort) mappedData.comfortEquipment = Array.isArray(car.comfort) ? car.comfort : (car.comfort as string).split(',');

            updateWorkflowData(mappedData);

            logger.info('Loaded car data for edit', { carId: existingCarId });
          }
        } catch (error) {
          logger.error('Failed to load car for edit', error as Error);
          toast.error('Failed to load vehicle data');
        }
      }
    };

    // Run if mode is edit
    if (mode === 'edit') {
      loadCarForEdit();
    }
  }, [mode, existingCarId, clearWorkflowData]);
  const stepsWithSubLabels = [
    { id: 'vehicle-selection', labelEn: 'Vehicle Type', labelBg: 'Тип МПС', subLabelEn: 'Category', subLabelBg: 'Категория' },
    { id: 'vehicle-data', labelEn: 'Vehicle Data', labelBg: 'Данни', subLabelEn: 'Specs & VIN', subLabelBg: 'Спецификации' },
    { id: 'equipment', labelEn: 'Equipment', labelBg: 'Оборудване', subLabelEn: 'Features', subLabelBg: 'Екстри' },
    { id: 'images', labelEn: 'Images', labelBg: 'Снимки', subLabelEn: 'Gallery', subLabelBg: 'Галерия' },
    { id: 'pricing', labelEn: 'Pricing', labelBg: 'Цена', subLabelEn: 'Cost & Currency', subLabelBg: 'Стойност' },
    { id: 'contact', labelEn: 'Contact', labelBg: 'Контакт', subLabelEn: 'Review & Publish', subLabelBg: 'Преглед' },
  ];

  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const stepIds: SellWorkflowStepId[] = [
    'vehicle-selection',
    'vehicle-data',
    'equipment',
    'images',
    'pricing',
    'contact',
  ];

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // vehicle-selection
        return !!workflowData.vehicleType;
      case 1: // vehicle-data
        return !!(workflowData.make && workflowData.model && workflowData.year);
      case 2: // equipment
        return true; // Optional
      case 3: // images
        return true; // Optional - images are saved in IndexedDB
      case 4: // pricing
        return !!workflowData.price;
      case 5: // contact
        return !!(
          workflowData.sellerName &&
          workflowData.sellerEmail &&
          workflowData.sellerPhone &&
          workflowData.region &&
          workflowData.city
        );
      default:
        return false;
    }
  }, [currentStep, workflowData]);

  const handleNext = useCallback(() => {
    if (canProceed && currentStep < TOTAL_STEPS - 1) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    if (isPublishing) return; // Prevent double submission

    setIsPublishing(true);

    try {
      // Validate required fields
      if (!workflowData.make || !workflowData.year) {
        toast.error(
          language === 'bg'
            ? 'Липсва критична информация за превозното средство'
            : 'Missing critical vehicle information'
        );
        setIsPublishing(false);
        return;
      }

      if (!currentUser?.uid) {
        toast.error(
          language === 'bg'
            ? 'Моля влезте в профила си'
            : 'Please log in to your account'
        );
        setIsPublishing(false);
        return;
      }

      // Get images from IndexedDB
      let imageFiles: File[] = [];
      try {
        imageFiles = await ImageStorageService.getImages();
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Images loaded from IndexedDB', { count: imageFiles.length });
        }
      } catch (error) {
        logger.warn('Failed to load images from IndexedDB', error as Error);
      }

      // Prepare payload - merge all workflow data
      const payload = {
        ...workflowData,
        vehicleType: workflowData.vehicleType || 'car',
        sellerType: workflowData.sellerType || 'private',
        // Ensure equipment arrays are converted to strings if needed
        safety: Array.isArray(workflowData.safetyEquipment)
          ? workflowData.safetyEquipment.join(',')
          : (workflowData.safety || ''),
        comfort: Array.isArray(workflowData.comfortEquipment)
          ? workflowData.comfortEquipment.join(',')
          : (workflowData.comfort || ''),
        infotainment: Array.isArray(workflowData.infotainmentEquipment)
          ? workflowData.infotainmentEquipment.join(',')
          : (workflowData.infotainment || ''),
        extras: Array.isArray(workflowData.extrasEquipment)
          ? workflowData.extrasEquipment.join(',')
          : (workflowData.extras || ''),
        // Ensure preferredContact is a string
        preferredContact: Array.isArray(workflowData.preferredContact)
          ? workflowData.preferredContact.join(',')
          : (workflowData.preferredContact || ''),
        imagesCount: imageFiles.length || workflowData.imagesCount || 0
      };

      // Validate workflow data
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Validating workflow data', {
          make: payload.make,
          model: payload.model,
          year: payload.year,
          vehicleType: payload.vehicleType,
          sellerName: payload.sellerName,
          sellerEmail: payload.sellerEmail,
          sellerPhone: payload.sellerPhone
        });
      }

      const validation = SellWorkflowService.validateWorkflowData(payload, false);

      if (validation.criticalMissing) {
        logger.error('Validation failed - critical fields missing', new Error('Missing required fields'), { missingFields: validation.missingFields });
        toast.error(
          language === 'bg'
            ? `Критична информация липсва: ${validation.missingFields.join(', ')}`
            : `Critical information missing: ${validation.missingFields.join(', ')}`
        );
        setIsPublishing(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Validation passed');
      }

      // Create car listing
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Creating car listing', {
          hasPayload: !!payload,
          userId: currentUser.uid,
          imageCount: imageFiles.length,
          make: payload.make,
          model: payload.model,
          year: payload.year,
          vehicleType: payload.vehicleType
        });
      }

      let carId: string;
      try {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Calling car service', { mode });
        }

        if (mode === 'edit' && existingCarId) {
          const { unifiedCarService } = await import('../../services/car/unified-car.service');
          // For update, we pass the merged payload.
          // We need to handle image updates:
          // 1. New images (in imageFiles) need uploading.
          // 2. Existing images (in payload.images? or separate) need preserving.

          // Upload new images
          let uploadedUrls: string[] = [];
          if (imageFiles.length > 0) {
            const { imageUploadService } = await import('../../services/car/image-upload.service');
            uploadedUrls = await imageUploadService.uploadImages(existingCarId, imageFiles);
          }

          // Combine with existing (logic depends on how we tracked deletions of old images)
          // For simplicity in this step, we just append new ones. 
          // Ideally we should track "remaining existing images".

          // Perform Update
          const updatePayload = {
            ...payload,
            images: undefined // handle images separately if needed or let service handle
          };
          // Remove undefined/nulls

          await unifiedCarService.updateCar(existingCarId, updatePayload);
          carId = existingCarId;

          toast.success(language === 'bg' ? 'Промените са запазени!' : 'Changes saved!');
        } else {
          carId = await SellWorkflowService.createCarListing(payload, currentUser.uid, imageFiles);
        }

        if (process.env.NODE_ENV === 'development') {
          logger.debug('createCarListing returned carId', { carId, type: typeof carId, length: carId?.length });
        }

        if (!carId || typeof carId !== 'string' || carId.trim() === '') {
          logger.error('Invalid carId returned', new Error('Car ID is empty or invalid'), { carId, type: typeof carId });
          throw new Error('Car ID is empty or invalid');
        }

        if (process.env.NODE_ENV === 'development') {
          logger.debug('Car ID is valid and ready for navigation', { carId });
        }
      } catch (createError: any) {
        logger.error('Error creating car listing', createError as Error, {
          message: createError.message,
          stack: createError.stack,
          name: createError.name
        });
        logger.error('Failed to create car listing', createError as Error, {
          userId: currentUser.uid,
          payload: {
            make: payload.make,
            model: payload.model,
            year: payload.year,
            vehicleType: payload.vehicleType
          },
          errorMessage: createError.message,
          errorStack: createError.stack
        });
        throw createError; // Re-throw to be caught by outer catch
      }

      // Success message
      toast.success(
        language === 'bg'
          ? `Обявата е създадена успешно${imageFiles.length > 0 ? ` с ${imageFiles.length} снимки` : ''}!`
          : `Listing created successfully${imageFiles.length > 0 ? ` with ${imageFiles.length} images` : ''}!`,
        {
          autoClose: 3000,
          position: 'top-center'
        }
      );

      // N8N Integration (non-critical)
      try {
        const N8nService = await import('../../services/n8n-integration');
        await N8nService.default.onCarPublished(currentUser.uid, carId, payload as any);
      } catch (n8nError) {
        logger.warn('N8N webhook failed (non-critical)', { error: n8nError, carId });
      }

      // Get draftId BEFORE clearing localStorage
      const draftId = localStorage.getItem('current_draft_id');

      // Clear workflow data and images AFTER successful creation
      clearWorkflowData();
      try {
        await ImageStorageService.clearImages();
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Images cleared from IndexedDB');
        }
      } catch (error) {
        logger.warn('Failed to clear images from IndexedDB (non-critical)', error as Error);
      }
      localStorage.removeItem('current_draft_id');

      // Delete draft from Firestore if exists
      if (draftId && currentUser) {
        try {
          const DraftsService = await import('../../services/drafts-service');
          await DraftsService.default.deleteDraft(draftId);
          logger.info('Draft deleted from Firestore after publishing', { draftId });
        } catch (error) {
          logger.warn('Failed to delete Firestore draft (non-critical)', { error, draftId });
        }
      }

      logger.info('Car listing published successfully', { carId, userId: currentUser.uid });
      if (process.env.NODE_ENV === 'development') {
        logger.debug('All cleanup completed', { carId });
      }

      // Close modal first, then navigate to car detail page
      onComplete(); // This will trigger modal close

      // Navigate to the My Ads page after a short delay
      setTimeout(() => {
        // Navigate to My Ads page
        const myAdsUrl = '/profile/my-ads';
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Navigating to My Ads page', { myAdsUrl, imageCount: imageFiles.length });
        }
        navigate(myAdsUrl);
      }, 100);

    } catch (error: unknown) {
      logger.error('Error in handleComplete', error as Error, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        userId: currentUser?.uid
      });

      logger.error('Error creating listing', error as Error, {
        userId: currentUser?.uid,
        errorMessage: error.message,
        errorStack: error.stack
      });

      const errorMessage = error.message || (language === 'bg'
        ? 'Възникна грешка при създаване на обявата'
        : 'Error creating listing');

      toast.error(errorMessage, {
        autoClose: 5000,
        position: 'top-center'
      });

      setIsPublishing(false);
    }
  }, [workflowData, currentUser, language, navigate, onComplete, clearWorkflowData, isPublishing]);

  // Reset Memory - Clear everything and start fresh
  const handleResetMemory = useCallback(async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setIsResetting(true);

    try {
      // Clear all workflow data
      clearWorkflowData();

      // Clear images from IndexedDB
      try {
        await ImageStorageService.clearImages();
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Images cleared from IndexedDB');
        }
      } catch (error) {
        logger.warn('Error clearing images', error as Error);
      }

      // Clear WorkflowPersistenceService
      WorkflowPersistenceService.clearState();

      // Clear localStorage items related to workflow
      localStorage.removeItem('current_draft_id');
      localStorage.removeItem('workflow_state');
      localStorage.removeItem('workflow_images');

      // Clear unified workflow if exists
      try {
        const UnifiedWorkflowPersistenceServiceModule = await import('../../services/unified-workflow-persistence.service');
        const UnifiedWorkflowPersistenceService = UnifiedWorkflowPersistenceServiceModule.default || UnifiedWorkflowPersistenceServiceModule.UnifiedWorkflowPersistenceService;
        if (UnifiedWorkflowPersistenceService && typeof UnifiedWorkflowPersistenceService.clearData === 'function') {
          await UnifiedWorkflowPersistenceService.clearData();
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Unified workflow data cleared');
          }
        }
      } catch (error) {
        logger.warn('Unified workflow service not available or already cleared', error as Error);
      }

      // Delete draft from Firestore if exists (get draftId before clearing localStorage)
      const draftId = localStorage.getItem('current_draft_id');
      if (draftId && currentUser) {
        try {
          const DraftsService = await import('../../services/drafts-service');
          await DraftsService.default.deleteDraft(draftId);
          logger.info('Draft deleted from Firestore during reset', { draftId });
        } catch (error) {
          logger.warn('Failed to delete Firestore draft (non-critical)', { error, draftId });
        }
      }

      // Clear any session storage
      sessionStorage.removeItem('edit_mode');
      sessionStorage.removeItem('edit_car_id');
      sessionStorage.removeItem('edit_car_data');

      // Reset to first step
      setCurrentStep(0);
      setDirection('forward');
      setShowResetConfirm(false);

      toast.success(
        language === 'bg'
          ? 'Памятта е изчистена. Започвате отново.'
          : 'Memory reset. Starting fresh.',
        {
          autoClose: 2000,
          position: 'top-center'
        }
      );

      logger.info('Workflow memory reset completed', { userId: currentUser?.uid });
    } catch (error) {
      logger.error('Error resetting workflow memory', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при изчистване на паметта'
          : 'Error resetting memory',
        {
          autoClose: 3000
        }
      );
    } finally {
      setIsResetting(false);
    }
  }, [showResetConfirm, clearWorkflowData, currentUser, language]);

  // Delete draft handler
  const handleDeleteDraft = async () => {
    if (!workflowData) {
      toast.info(
        language === 'bg' ? 'Няма данни за изтриване' : 'No data to delete',
        { position: 'bottom-right', autoClose: 2000 }
      );
      return;
    }

    setIsDeleting(true);

    try {
      // Delete from Firestore drafts if draftId exists
      const draftId = localStorage.getItem('current_draft_id');
      if (draftId && currentUser) {
        try {
          await DraftsService.deleteDraft(draftId);
          localStorage.removeItem('current_draft_id');
          logger.info('Draft deleted from Firestore', { draftId });
        } catch (error) {
          logger.warn('Failed to delete Firestore draft (non-critical)', { error, draftId });
        }
      }

      // Clear workflow
      await clearWorkflowData();

      // Clear localStorage
      localStorage.removeItem('globul_sell_workflow_state');
      localStorage.removeItem('globul_unified_workflow');

      toast.success(
        language === 'bg'
          ? 'Черновата е изтрита успешно'
          : 'Draft deleted successfully',
        {
          position: 'bottom-right',
          autoClose: 2000
        }
      );

      // Navigate or close modal
      setTimeout(() => {
        if (onCancel) {
          onCancel();
        } else {
          navigate('/sell/auto');
        }
      }, 500);
    } catch (error) {
      logger.error('Error deleting draft', error as Error);
      toast.error(
        language === 'bg'
          ? 'Грешка при изтриване на черновата'
          : 'Error deleting draft',
        {
          position: 'bottom-right',
          autoClose: 3000
        }
      );
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
      setShowMenu(false);
    }
  };

  const stepTitles = stepIds.map(stepId => {
    const step = SELL_WORKFLOW_STEPS.find(s => s.id === stepId);
    return step ? (language === 'bg' ? step.labels.bg : step.labels.en) : '';
  });



  return (
    <WizardContainer>
      <BladeStepper
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onStepClick={(index) => {
          // Allow navigation to any previously completed step or the next available step
          // or just allow free navigation as requested "for editing or review"
          // We'll allow clicking any step, but user logic might restrict saving if data missing.
          // For now, let's allow it as requested.
          setCurrentStep(index);
          setDirection(index > currentStep ? 'forward' : 'backward');
        }}
        stepsData={stepsWithSubLabels}
      />

      <StepContent $direction={direction}>
        {/* Title is redundant now with the new stepper showing labels prominently, but we keep it for now or remove if it looks cluttered. 
            The user didn't explicitly say remove title, but "Replace the primitive bar". 
            Let's keep the title for clarity of content area. */}
        <StepTitle>{stepTitles[currentStep]}</StepTitle>

        {currentStep === 0 && (
          <SellVehicleStep1
            workflowData={workflowData}
            onUpdate={updateWorkflowData}
            onNext={handleNext}
          />
        )}

        {currentStep === 1 && (
          <SellVehicleStep2
            workflowData={workflowData}
            onUpdate={updateWorkflowData}
          />
        )}

        {currentStep === 2 && (
          <SellVehicleStep3
            workflowData={workflowData}
            onUpdate={updateWorkflowData}
          />
        )}

        {currentStep === 3 && (
          <SellVehicleStep4
            workflowData={workflowData}
            onUpdate={updateWorkflowData}
          />
        )}

        {currentStep === 4 && (
          <SellVehicleStep5
            workflowData={workflowData}
            onUpdate={updateWorkflowData}
          />
        )}

        {currentStep === 5 && (
          <SellVehicleStep6
            workflowData={workflowData}
            onUpdate={updateWorkflowData}
          />
        )}
      </StepContent>

      <NavigationButtons>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {currentStep > 0 && (
            <Button $variant="secondary" onClick={handleBack}>
              <ArrowLeft size={18} />
              {language === 'bg' ? 'Назад' : 'Back'}
            </Button>
          )}
          <ResetButton
            onClick={handleResetMemory}
            disabled={isPublishing || isResetting}
            title={language === 'bg' ? 'Изчисти паметта и започни отново' : 'Reset memory and start fresh'}
          >
            <RotateCcw size={16} />
            {language === 'bg' ? 'Изчисти паметта' : 'Reset Memory'}
          </ResetButton>
          {showResetConfirm && (
            <ResetConfirmDialog>
              <ResetConfirmTitle>
                <AlertTriangle size={18} />
                {language === 'bg' ? 'Потвърждение' : 'Confirmation'}
              </ResetConfirmTitle>
              <ResetConfirmText>
                {language === 'bg'
                  ? 'Сигурни ли сте, че искате да изчистите всички данни и да започнете отново? Това действие не може да бъде отменено.'
                  : 'Are you sure you want to clear all data and start fresh? This action cannot be undone.'}
              </ResetConfirmText>
              <ResetConfirmButtons>
                <ConfirmButton
                  $variant="cancel"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                >
                  {language === 'bg' ? 'Отказ' : 'Cancel'}
                </ConfirmButton>
                <ConfirmButton
                  $variant="danger"
                  onClick={handleResetMemory}
                  disabled={isResetting}
                >
                  {isResetting
                    ? (language === 'bg' ? 'Изчистване...' : 'Resetting...')
                    : (language === 'bg' ? 'Изчисти' : 'Reset')
                  }
                </ConfirmButton>
              </ResetConfirmButtons>
            </ResetConfirmDialog>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button $variant="secondary" onClick={onCancel} disabled={isPublishing || isResetting}>
            {language === 'bg' ? 'Отказ' : 'Cancel'}
          </Button>
          {currentStep < TOTAL_STEPS - 1 ? (
            // Hide Next button on step 0 (vehicle selection) as it auto-advances
            currentStep !== 0 && (
              <Button $variant="primary" onClick={handleNext} disabled={!canProceed || isPublishing || isResetting}>
                {language === 'bg' ? 'Напред' : 'Next'}
                <ArrowRight size={18} />
              </Button>
            )
          ) : (
            <Button $variant="primary" onClick={handleComplete} disabled={!canProceed || isPublishing || isResetting}>
              {isPublishing
                ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
                : (language === 'bg' ? 'Публикувай' : 'Publish')
              }
              {!isPublishing && <Check size={18} />}
            </Button>
          )}
        </div>
      </NavigationButtons>
    </WizardContainer>
  );
};

export default SellVehicleWizard;
