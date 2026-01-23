import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthProvider';
import { WorkflowPersistenceService } from '../../../../services/unified-workflow-persistence.service';
import SellWorkflowService from '../../../../services/sell-workflow-service';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
import { logger } from '../../../../services/logger-service';
export const useSubmissionFlow = ({ redirectPath = '/profile/my-ads' } = {}) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { workflowData, clearWorkflowData } = useSellWorkflow();
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    const [listingId, setListingId] = useState(null);
    const submit = useCallback(async () => {
        setStatus('submitting');
        setErrorMessage(null);
        try {
            if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.uid)) {
                throw new Error('NOT_AUTHENTICATED');
            }
            const persistedState = WorkflowPersistenceService.loadState();
            const data = Object.assign(Object.assign({}, workflowData), ((persistedState === null || persistedState === void 0 ? void 0 : persistedState.data) || {}));
            const images = await WorkflowPersistenceService.getImagesAsFiles();
            const validation = SellWorkflowService.validateWorkflowData(Object.assign(Object.assign({}, data), { images: images.length }), false);
            if (validation.criticalMissing) {
                throw new Error(`Missing critical fields: ${validation.missingFields.join(', ') || 'Unknown'}`);
            }
            const createdListingId = await SellWorkflowService.createCarListing(Object.assign(Object.assign({}, data), { images }), currentUser.uid, images);
            WorkflowPersistenceService.clearState();
            clearWorkflowData();
            setListingId(createdListingId);
            setStatus('success');
            navigate(redirectPath);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown submission error';
            logger.error('Submission failed', error);
            setStatus('error');
            setErrorMessage(message);
        }
    }, [clearWorkflowData, currentUser === null || currentUser === void 0 ? void 0 : currentUser.uid, navigate, redirectPath, workflowData]);
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
