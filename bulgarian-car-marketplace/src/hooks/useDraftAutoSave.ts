// Auto-save Hook for Drafts
// Hook للحفظ التلقائي للمسودات

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { SellWorkflowData } from './useSellWorkflow';
import DraftsService from '@/services/drafts-service';
import { toast } from 'react-toastify';
import { logger } from '@/services/logger-service';

interface UseDraftAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  currentStep?: number;
}

export const useDraftAutoSave = (
  workflowData: SellWorkflowData,
  options: UseDraftAutoSaveOptions = {}
) => {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    currentStep = 0
  } = options;

  const { currentUser } = useAuth();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !currentUser) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      await saveDraft();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [workflowData, enabled, currentUser, interval]);

  /**
   * Save draft manually or automatically
   */
  const saveDraft = async (showToast = false): Promise<string | null> => {
    if (!currentUser) {
      logger.warn('No user logged in, cannot save draft');
      return null;
    }

    try {
      setIsSaving(true);

      const savedDraftId = await DraftsService.autoSaveDraft(
        currentUser.uid,
        draftId,
        workflowData,
        currentStep
      );

      if (savedDraftId) {
        setDraftId(savedDraftId);
        setLastSaved(new Date());

        if (showToast) {
          toast.success('Draft saved', {
            position: 'bottom-right',
            autoClose: 2000
          });
        }

        return savedDraftId;
      }

      return null;
    } catch (error) {
      logger.error('Failed to save draft', error as Error, { userId: currentUser.uid, draftId });
      
      if (showToast) {
        toast.error('Failed to save draft', {
          position: 'bottom-right'
        });
      }

      return null;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Delete current draft
   */
  const deleteDraft = async (): Promise<void> => {
    if (!draftId) return;

    try {
      await DraftsService.deleteDraft(draftId);
      setDraftId(null);
      setLastSaved(null);
      
      toast.success('Draft deleted', {
        position: 'bottom-right',
        autoClose: 2000
      });
    } catch (error) {
      logger.error('Failed to delete draft', error as Error, { draftId });
      toast.error('Failed to delete draft');
    }
  };

  /**
   * Get time since last save
   */
  const getTimeSinceLastSave = (): string => {
    if (!lastSaved) return 'Never';

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return {
    draftId,
    isSaving,
    lastSaved,
    saveDraft,
    deleteDraft,
    getTimeSinceLastSave
  };
};

export default useDraftAutoSave;

