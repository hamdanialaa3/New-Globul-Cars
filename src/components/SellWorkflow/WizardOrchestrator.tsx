
import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useWizardState } from './hooks/useWizardState';
import { useWizardValidation } from './hooks/useWizardValidation';
import { useWizardTimer } from './hooks/useWizardTimer';
import BladeStepper from './BladeStepper';
import { Check, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, Clock, Cloud, Sparkles, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { BulgarianProfileService } from '../../services/bulgarian-profile-service';

// Services
import SellWorkflowService from '../../services/sell-workflow-service';
import { ImageStorageService } from '../../services/ImageStorageService';

// Import Steps
import SellVehicleStep1 from './steps/SellVehicleStep1';
import SellVehicleStep2 from './steps/SellVehicleStep2';
import SellVehicleStep3 from './steps/SellVehicleStep3';
import SellVehicleStep4 from './steps/SellVehicleStep4';
import SellVehicleStep5 from './steps/SellVehicleStep5';
import SellVehicleStep6_5 from './steps/SellVehicleStep6_5';
import SellVehicleStep6 from './steps/SellVehicleStep6';

// Import Styles
import {
    WizardContainer,
    StepContent,
    NavigationButtons,
    Button,
    ResetButton,
    ResetConfirmDialog,
    ResetConfirmTitle,
    ResetConfirmText,
    ResetConfirmButtons,
    ConfirmButton,
    TimerBadge,
    StatusWrapper,
    DraftBadge
} from './styles';

const TOTAL_STEPS = 7;

// Success Animation Styles
const confettiAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const scaleInBounce = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.5);
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  overflow: hidden;
`;

const ConfettiPiece = styled.div<{ $delay: number; $left: number; $color: string }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.$color};
  top: -10px;
  left: ${props => props.$left}%;
  animation: ${confettiAnimation} 2s ease-out forwards;
  animation-delay: ${props => props.$delay}s;
  border-radius: 2px;
`;

const SuccessCard = styled(motion.div)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  animation: ${pulseGlow} 2s ease-in-out infinite;
`;

const SuccessIconWrapper = styled(motion.div)`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const SuccessTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const SuccessMessage = styled(motion.p)`
  font-size: 1.25rem;
  opacity: 0.95;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const SuccessBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1rem;
`;

interface WizardOrchestratorProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

export const WizardOrchestrator: React.FC<WizardOrchestratorProps> = ({ onComplete, onCancel }) => {
    const { language } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Hooks
    const {
        currentStep,
        formData,
        goToStep,
        nextStep,
        prevStep,
        resetWizard,
        updateFormData,
        loading,
        isSaving
    } = useWizardState();

    const { canProceed, stepError, validateForPublish } = useWizardValidation(currentStep, formData);
    const { formattedTime, remainingSeconds, isActive } = useWizardTimer();

    // UI State
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    
    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu) return;
        
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-reset-menu]')) {
                setShowMenu(false);
                setShowResetConfirm(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    // Handlers
    const handleNext = () => {
        if (canProceed) {
            setDirection('forward');
            nextStep();
        } else if (stepError) {
            toast.error(language === 'bg' ? 'Моля попълнете задължителните полета' : stepError);
        }
    };

    const handleBack = () => {
        setDirection('backward');
        prevStep();
    };

    const handlePublish = async () => {
        const validation = validateForPublish();
        if (!validation.valid) {
            toast.error(language === 'bg' ? 'Моля попълнете всички задължителни полета' : validation.errors[0]);
            return;
        }

        if (!currentUser) {
            toast.warn(language === 'bg' ? 'Моля влезте в профила си, за да публикувате' : 'Please log in to publish your listing');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        setIsPublishing(true);
        try {
            // 1. Get images from IndexedDB
            const images = await ImageStorageService.getImages();

            // 2. Prepare payload (ensure it matches what SellWorkflowService expects)
            const payload = {
                ...formData,
                images: images.length // Service handles actual upload
            };

            // 3. Call the service
            const result = await SellWorkflowService.createCarListing(
                payload,
                currentUser.uid,
                images
            );

            if (result.carId) {
                // Show success animation
                setShowSuccessAnimation(true);
                
                // Get user's numeric ID for navigation
                let userNumericId: number | null = null;
                try {
                    const profile = await BulgarianProfileService.getUserProfile(currentUser.uid);
                    userNumericId = profile?.numericId || null;
                } catch (error) {
                    console.error('Failed to get user numeric ID:', error);
                }

                toast.success(language === 'bg' ? 'Обявата е публикувана успешно!' : 'Vehicle published successfully!');

                // 4. Cleanup
                await resetWizard();

                if (onComplete) onComplete();
                
                // Wait for animation to play (1.5 seconds)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Navigate to my-ads page with user's numeric ID
                if (userNumericId) {
                    navigate(`/profile/${userNumericId}/my-ads`);
                } else {
                    // Fallback to profile page if numeric ID not available
                    navigate('/profile/my-ads');
                }
            } else {
                throw new Error('No carId returned from service');
            }

        } catch (error: any) {
            console.error('Publishing failed', error);
            const errorMsg = error.message || (language === 'bg' ? 'Възникна грешка при публикуването' : 'Failed to publish listing');
            toast.error(errorMsg);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        if (stepIndex < currentStep) {
            setDirection('backward');
            goToStep(stepIndex);
        } else if (stepIndex === currentStep + 1 && canProceed) {
            setDirection('forward');
            goToStep(stepIndex);
        }
    };

    // Step Rendering Logic
    const renderStep = () => {
        const commonProps = {
            workflowData: formData,
            onUpdate: updateFormData
        };

        switch (currentStep) {
            case 1: return <SellVehicleStep1 {...commonProps} onNext={handleNext} />;
            case 2: return <SellVehicleStep2 {...commonProps} />;
            case 3: return <SellVehicleStep3 {...commonProps} />;
            case 4: return <SellVehicleStep4 {...commonProps} />;
            case 5: return <SellVehicleStep5 {...commonProps} />;
            case 6: return <SellVehicleStep6_5 {...commonProps} />;
            case 7: return <SellVehicleStep6 {...commonProps} />;
            default: return <div>Unknown Step</div>;
        }
    };

    // Stepper Configuration
    const stepperSteps = [
        { id: 'vehicle-selection', labelEn: 'Vehicle Type', labelBg: 'Тип МПС', subLabelEn: 'Category', subLabelBg: 'Категория' },
        { id: 'vehicle-data', labelEn: 'Vehicle Data', labelBg: 'Данни', subLabelEn: 'Specs & VIN', subLabelBg: 'Спецификации' },
        { id: 'equipment', labelEn: 'Equipment', labelBg: 'Оборудване', subLabelEn: 'Features', subLabelBg: 'Екстри' },
        { id: 'images', labelEn: 'Images', labelBg: 'Снимки', subLabelEn: 'Gallery', subLabelBg: 'Галерия' },
        { id: 'pricing', labelEn: 'Pricing', labelBg: 'Цена', subLabelEn: 'Cost & Currency', subLabelBg: 'Стойност' },
        { id: 'description', labelEn: 'Description', labelBg: 'Описание', subLabelEn: 'AI-Powered', subLabelBg: 'AI Помощник' },
        { id: 'contact', labelEn: 'Contact', labelBg: 'Контакт', subLabelEn: 'Review & Publish', subLabelBg: 'Преглед' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // Generate confetti pieces
    const confettiColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        left: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
    }));

    return (
        <>
            <AnimatePresence>
                {showSuccessAnimation && (
                    <SuccessOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {confettiPieces.map(piece => (
                            <ConfettiPiece
                                key={piece.id}
                                $delay={piece.delay}
                                $left={piece.left}
                                $color={piece.color}
                            />
                        ))}
                        <SuccessCard
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        >
                            <SuccessIconWrapper
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Car size={64} strokeWidth={2.5} />
                            </SuccessIconWrapper>
                            <SuccessTitle
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {language === 'bg' ? '🎉 Успешно публикувано!' : '🎉 Successfully Published!'}
                            </SuccessTitle>
                            <SuccessMessage
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                {language === 'bg' 
                                    ? 'Вашата обява е добавена успешно и вече е видима в профила ви!'
                                    : 'Your listing has been successfully added and is now visible in your profile!'}
                            </SuccessMessage>
                            <SuccessBadge
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                            >
                                <Sparkles size={24} />
                                <span>
                                    {language === 'bg' ? 'Преминаване към моите обяви...' : 'Redirecting to my ads...'}
                                </span>
                            </SuccessBadge>
                        </SuccessCard>
                    </SuccessOverlay>
                )}
            </AnimatePresence>

            <WizardContainer>
                <StatusWrapper>
                {isActive && (
                    <TimerBadge $warning={remainingSeconds < 300}>
                        <Clock />
                        <span>{formattedTime}</span>
                    </TimerBadge>
                )}

                <DraftBadge>
                    {isSaving ? (
                        language === 'bg' ? 'Запазване...' : 'Saving...'
                    ) : (
                        language === 'bg' ? 'Черновата е запазена' : 'Draft Saved'
                    )}
                </DraftBadge>

                {currentUser && (
                    <div style={{ 
                        marginLeft: 'auto', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: 'var(--text-tertiary)',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.4'
                    }}>
                        <Cloud size={14} />
                        {language === 'bg' ? 'Облачна чернова' : 'Cloud Sync Active'}
                    </div>
                )}
            </StatusWrapper>


            <BladeStepper
                stepsData={stepperSteps}
                currentStep={currentStep - 1}
                totalSteps={stepperSteps.length}
                onStepClick={(idx) => handleStepClick(idx + 1)}
            />

            <StepContent $direction={direction}>
                {renderStep()}
            </StepContent>

            <NavigationButtons>
                <div style={{ position: 'relative' }} data-reset-menu>
                    <ResetButton
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isPublishing) {
                                setShowMenu(!showMenu);
                                setShowResetConfirm(false);
                            }
                        }}
                        disabled={isPublishing}
                        title={language === 'bg' ? 'Изтрий черновата и започни отново' : 'Delete draft and start over'}
                        type="button"
                    >
                        <RotateCcw />
                        <span>{language === 'bg' ? 'Изтрий черновата' : 'Reset Form'}</span>
                    </ResetButton>
                    
                    {showMenu && (
                        <ResetConfirmDialog onClick={(e) => e.stopPropagation()} data-reset-menu>
                            {showResetConfirm ? (
                                <>
                                    <ResetConfirmTitle>
                                        <AlertTriangle size={18} />
                                        {language === 'bg' ? 'Сигурни ли сте?' : 'Are you sure?'}
                                    </ResetConfirmTitle>
                                    <ResetConfirmText>
                                        {language === 'bg'
                                            ? 'Всички въведени данни ще бъдат изтрити.'
                                            : 'All entered data will be deleted.'}
                                    </ResetConfirmText>
                                    <ResetConfirmButtons>
                                        <ConfirmButton $variant="cancel" onClick={() => {
                                            setShowResetConfirm(false);
                                            setShowMenu(false);
                                        }}>
                                            {language === 'bg' ? 'Отказ' : 'Cancel'}
                                        </ConfirmButton>
                                        <ConfirmButton
                                            $variant="danger"
                                            onClick={async () => {
                                                await resetWizard();
                                                setShowResetConfirm(false);
                                                setShowMenu(false);
                                                goToStep(1);
                                                if (onCancel) onCancel();
                                            }}
                                        >
                                            {language === 'bg' ? 'Изтрий' : 'Delete'}
                                        </ConfirmButton>
                                    </ResetConfirmButtons>
                                </>
                            ) : (
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowResetConfirm(true);
                                    }}
                                    style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none', padding: '0.5rem 0', color: '#ef4444' }}
                                >
                                    <RotateCcw size={16} style={{ marginRight: '8px' }} />
                                    {language === 'bg' ? 'Рестарт на формата' : 'Reset Form'}
                                </Button>
                            )}
                        </ResetConfirmDialog>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {currentStep > 1 && (
                        <Button $variant="secondary" onClick={handleBack} disabled={isPublishing}>
                            <ArrowLeft size={20} />
                            {language === 'bg' ? 'Назад' : 'Back'}
                        </Button>
                    )}

                    <Button
                        $variant="primary"
                        onClick={currentStep === TOTAL_STEPS ? handlePublish : handleNext}
                        disabled={!canProceed || isPublishing}
                        style={{
                            opacity: (!canProceed || isPublishing) ? 0.5 : 1,
                            cursor: (!canProceed || isPublishing) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isPublishing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                {language === 'bg' ? 'Публикуване...' : 'Publishing...'}
                            </>
                        ) : currentStep === TOTAL_STEPS ? (
                            <>
                                <Check size={20} />
                                {language === 'bg' ? 'Публикувай' : 'Publish'}
                            </>
                        ) : (
                            <>
                                {language === 'bg' ? 'Напред' : 'Next'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </Button>
                </div>
            </NavigationButtons>
            </WizardContainer>
        </>
    );
};
