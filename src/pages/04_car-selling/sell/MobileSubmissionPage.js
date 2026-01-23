import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// Mobile Submission Page - Final step in sell workflow
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { WorkflowPersistenceService } from '../../../services/unified-workflow-persistence.service';
import { logger } from '../../../services/logger-service';
import { S } from './MobileSubmissionPage.styles';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import SellWorkflowService from '../../../services/sell-workflow-service';
const ProgressWrapper = styled.div `
  padding: 0.75rem 1rem 0;
`;
const MobileSubmissionPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { vehicleType } = useParams();
    const [state, setState] = useState('submitting');
    const [error, setError] = useState('');
    const submitListing = async () => {
        try {
            setState('submitting');
            SellWorkflowStepStateService.markPending('publish');
            // Load workflow data
            const workflowState = WorkflowPersistenceService.loadState();
            if (!workflowState) {
                throw new Error('No workflow data found');
            }
            const { data } = workflowState;
            const images = await WorkflowPersistenceService.getImagesAsFiles();
            // Validate required data
            if (!(user === null || user === void 0 ? void 0 : user.uid)) {
                throw new Error('User not authenticated');
            }
            if (!data.make || !data.year) {
                throw new Error('Missing required vehicle information');
            }
            // Create the car listing using the actual service
            const result = await SellWorkflowService.createCarListing(data, user.uid, images);
            // ✅ CRITICAL FIX: Handle both string (carId) and object (with redirectUrl) responses
            const carId = typeof result === 'string' ? result : result.carId;
            const redirectUrl = typeof result === 'object' && result.redirectUrl
                ? result.redirectUrl
                : '/my-listings'; // Fallback
            // Log successful submission
            logger.info('Car listing submitted successfully', {
                carId,
                redirectUrl,
                userId: user.uid,
                vehicleType,
                imageCount: images.length,
                make: data.make,
                model: data.model,
                year: data.year
            });
            // Clear workflow state after successful submission
            WorkflowPersistenceService.clearState();
            setState('success');
            SellWorkflowStepStateService.markCompleted('publish');
        }
        catch (err) {
            logger.error('Submission error', err, {
                userId: user === null || user === void 0 ? void 0 : user.uid,
                vehicleType,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
            setError(err instanceof Error ? err.message : 'Unknown error occurred during submission');
            setState('error');
        }
    };
    useEffect(() => {
        submitListing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleViewListing = () => {
        // Navigate to user's listings
        navigate('/my-listings');
    };
    const handleCreateNew = () => {
        navigate('/sell');
    };
    const handleRetry = () => {
        submitListing();
    };
    const handleGoBack = () => {
        navigate(-1);
    };
    return (_jsxs(_Fragment, { children: [_jsx(ProgressWrapper, { children: _jsx(SellProgressBar, { currentStep: "publish" }) }), _jsx(S.Container, { children: _jsxs(S.Content, { children: [state === 'submitting' && (_jsxs(_Fragment, { children: [_jsx(S.LoadingSpinner, {}), _jsx(S.Title, { children: t('sell.submission.submitting') }), _jsx(S.Message, { children: t('sell.submission.pleaseWait') })] })), state === 'success' && (_jsxs(_Fragment, { children: [_jsx(S.SuccessIcon, { children: "\u2713" }), _jsx(S.Title, { children: t('sell.submission.success') }), _jsx(S.Message, { children: t('sell.submission.successMessage') }), _jsxs(S.Actions, { children: [_jsx(S.PrimaryButton, { onClick: handleViewListing, children: t('sell.submission.viewListing') }), _jsx(S.SecondaryButton, { onClick: handleCreateNew, children: t('sell.submission.createNew') })] })] })), state === 'error' && (_jsxs(_Fragment, { children: [_jsx(S.ErrorIcon, { children: "\u2715" }), _jsx(S.Title, { children: t('sell.submission.error') }), _jsx(S.Message, { children: error || t('sell.submission.errorMessage') }), _jsxs(S.Actions, { children: [_jsx(S.PrimaryButton, { onClick: handleRetry, children: t('sell.submission.retry') }), _jsx(S.SecondaryButton, { onClick: handleGoBack, children: t('sell.submission.goBack') })] })] }))] }) })] }));
};
export default MobileSubmissionPage;
