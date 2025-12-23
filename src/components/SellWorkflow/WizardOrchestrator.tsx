
import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { useWizardState } from './hooks/useWizardState';
import { useWizardValidation } from './hooks/useWizardValidation';
import { useWizardTimer } from './hooks/useWizardTimer';
import BladeStepper from './BladeStepper';
import { Check, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, Clock, Cloud } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Services
import SellWorkflowService from '../../services/sell-workflow-service';
import { ImageStorageService } from '../../services/ImageStorageService';

// Import Steps
import SellVehicleStep1 from './steps/SellVehicleStep1';
import SellVehicleStep2 from './steps/SellVehicleStep2';
import SellVehicleStep3 from './steps/SellVehicleStep3';
import SellVehicleStep4 from './steps/SellVehicleStep4';
import SellVehicleStep5 from './steps/SellVehicleStep5';
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

const TOTAL_STEPS = 6;

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
                toast.success(language === 'bg' ? 'Обявата е публикувана успешно!' : 'Vehicle published successfully!');

                // 4. Cleanup
                await resetWizard();

                if (onComplete) onComplete();
                // Navigate to the new car detail page using numeric ID if available
                const targetId = result.carNumericId || result.carId;
                navigate(`/car/${targetId}`);
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
            case 6: return <SellVehicleStep6 {...commonProps} />;
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
        { id: 'contact', labelEn: 'Contact', labelBg: 'Контакт', subLabelEn: 'Review & Publish', subLabelBg: 'Преглед' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
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
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <Cloud size={14} />
                        {language === 'bg' ? 'Облачна чернова' : 'Cloud Sync Active'}
                    </div>
                )}
            </StatusWrapper>

            {showMenu && (
                <ResetConfirmDialog>
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
                                <ConfirmButton $variant="cancel" onClick={() => setShowResetConfirm(false)}>
                                    {language === 'bg' ? 'Отказ' : 'Cancel'}
                                </ConfirmButton>
                                <ConfirmButton
                                    $variant="danger"
                                    onClick={() => {
                                        resetWizard();
                                        setShowResetConfirm(false);
                                        setShowMenu(false);
                                        if (onCancel) onCancel();
                                    }}
                                >
                                    {language === 'bg' ? 'Изтрий' : 'Delete'}
                                </ConfirmButton>
                            </ResetConfirmButtons>
                        </>
                    ) : (
                        <Button
                            onClick={() => setShowResetConfirm(true)}
                            style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none', padding: '0.5rem 0', color: '#ef4444' }}
                        >
                            <RotateCcw size={16} style={{ marginRight: '8px' }} />
                            {language === 'bg' ? 'Рестарт на формата' : 'Reset Form'}
                        </Button>
                    )}
                </ResetConfirmDialog>
            )}

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
                <ResetButton
                    onClick={() => setShowMenu(!showMenu)}
                    disabled={isPublishing}
                    title={language === 'bg' ? 'Опции' : 'Options'}
                >
                    <RotateCcw />
                    <span>{language === 'bg' ? 'Опции' : 'Options'}</span>
                </ResetButton>

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
    );
};
