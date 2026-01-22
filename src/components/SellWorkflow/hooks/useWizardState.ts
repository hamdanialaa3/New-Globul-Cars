
import { useState, useEffect, useCallback } from 'react';
import { UnifiedWorkflowPersistenceService, UnifiedWorkflowData } from '../../../services/unified-workflow-persistence.service';
import { useAuth } from '../../../contexts/AuthProvider';
import { logger } from '@/services/logger-service';

export interface WizardStateReturn {
    currentStep: number;
    formData: Partial<UnifiedWorkflowData>;
    loading: boolean;
    isSaving: boolean;
    error: string | null;
    updateFormData: (newData: Partial<UnifiedWorkflowData>) => void;
    goToStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetWizard: () => void;
}

export const useWizardState = (workflowId: string = 'default'): WizardStateReturn => {
    const { currentUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<UnifiedWorkflowData>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Load draft on initialization (Local + Cloud Sync)
    useEffect(() => {
        const loadDraft = async () => {
            try {
                setLoading(true);

                // First, load locally saved data for immediate feedback
                const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
                let data = persistenceService.loadData();

                // If logged in, attempt to sync with cloud
                if (currentUser?.uid) {
                    const cloudData = await persistenceService.loadFromCloud(currentUser.uid);
                    if (cloudData) {
                        data = cloudData; // Cloud data is prioritized if newer (handled in service)
                    }
                }

                if (data) {
                    setFormData(data);
                    if (data.currentStep) {
                        const stepNum = typeof data.currentStep === 'string'
                            ? parseInt(data.currentStep, 10)
                            : data.currentStep;

                        if (!isNaN(stepNum)) {
                            setCurrentStep(stepNum);
                        }
                    }
                }
            } catch (err) {
                logger.error("Error loading workflow draft", err as Error);
                setError("Failed to restore previous session.");
            } finally {
                setLoading(false);
            }
        };

        loadDraft();
    }, [currentUser, workflowId]);

    // 2. Auto-Save with Debounce (Logic is handled inside persistence service usually, but we call save here specifically)
    useEffect(() => {
        if (loading) return;

        const saveData = async () => {
            setIsSaving(true);
            try {
                const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
                // Save locally
                // We pass 'currentStep' to ensure it's updated in the main object   
                persistenceService.saveData(formData, currentStep);

                // Cloud save (if authenticated)
                if (currentUser?.uid) {
                    await persistenceService.saveToCloud(currentUser.uid);
                }
            } catch (err) {
                logger.error("Auto-save failed", err as Error);
            } finally {
                setIsSaving(false);
            }
        };

        // Debounce save
        const timeoutId = setTimeout(saveData, 1000);
        return () => clearTimeout(timeoutId);
    }, [formData, currentStep, loading, currentUser]);

    // 3. Action Handlers
    const updateFormData = useCallback((newData: Partial<UnifiedWorkflowData>) => {
        setFormData(prev => ({ ...prev, ...newData }));
    }, []);

    const goToStep = useCallback((step: number) => {
        setCurrentStep(step);
        // Persist step change immediately
        const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
        persistenceService.updateCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep(prev => {
            const next = prev + 1;
            const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
            persistenceService.updateCurrentStep(next);
            return next;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => {
            const back = Math.max(1, prev - 1);
            const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
            persistenceService.updateCurrentStep(back);
            return back;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const resetWizard = useCallback(async () => {
        setFormData({});
        setCurrentStep(1);
        const persistenceService = UnifiedWorkflowPersistenceService.getInstance();
        await persistenceService.executeFullReset();
    }, []);

    return {
        currentStep,
        formData,
        loading,
        isSaving,
        error,
        updateFormData,
        goToStep,
        nextStep,
        prevStep,
        resetWizard
    };
};
