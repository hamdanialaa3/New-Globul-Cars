import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthProvider';
import { WorkflowPersistenceService } from '../../../../services/unified-workflow-persistence.service';
import SellWorkflowService from '../../../../services/sell-workflow-service';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
import { logger } from '../../../../services/logger-service';

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface UseSubmissionFlowOptions {
  redirectPath?: string;
}

export const useSubmissionFlow = ({ redirectPath = '/profile/my-ads' }: UseSubmissionFlowOptions = {}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { workflowData, clearWorkflowData } = useSellWorkflow();

  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      if (!currentUser?.uid) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const persistedState = WorkflowPersistenceService.loadState();
      const data = {
        ...workflowData,
        ...(persistedState?.data || {})
      };
      const images = await WorkflowPersistenceService.getImagesAsFiles();

      const validation = SellWorkflowService.validateWorkflowData(
        {
          ...data,
          images: images.length
        },
        false
      );

      if (validation.criticalMissing) {
        throw new Error(
          `Missing critical fields: ${validation.missingFields.join(', ') || 'Unknown'}`
        );
      }

      const createdListingId = await SellWorkflowService.createCarListing(
        {
          ...data,
          images
        },
        currentUser.uid,
        images
      );

      WorkflowPersistenceService.clearState();
      clearWorkflowData();
      setListingId(createdListingId);
      setStatus('success');
      navigate(redirectPath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown submission error';
      logger.error('Submission failed', error as Error);
      setStatus('error');
      setErrorMessage(message);
    }
  }, [clearWorkflowData, currentUser?.uid, navigate, redirectPath, workflowData]);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setListingId(null);
  }, []);

  return {
    status,
    errorMessage,
    listingId,
    submit,
    reset
  };
};

export default useSubmissionFlow;

