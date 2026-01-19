
import { useState, useEffect } from 'react';
import { unifiedWorkflowPersistence, TimerState } from '../../../services/unified-workflow-persistence.service';
const UnifiedWorkflowPersistenceService = unifiedWorkflowPersistence;

/**
 * Hook to manage the wizard draft timer.
 * Provides the remaining time and active status.
 */
export const useWizardTimer = () => {
    const [timerState, setTimerState] = useState<TimerState>({
        isActive: false,
        remainingSeconds: 0,
        totalSeconds: 0
    });

    useEffect(() => {
        // Initial state
        setTimerState(UnifiedWorkflowPersistenceService.getTimerState());

        // Subscribe to updates
        const unsubscribe = UnifiedWorkflowPersistenceService.subscribeToTimer((state) => {
            setTimerState(state);
        });

        return () => unsubscribe();
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        ...timerState,
        formattedTime: formatTime(timerState.remainingSeconds),
        percentage: (timerState.remainingSeconds / timerState.totalSeconds) * 100
    };
};
