// Mobile Submission Page - Final step in sell workflow
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { WorkflowPersistenceService } from '../../../services/unified-workflow-persistence.service';
import { logger } from '../../../services/logger-service';
import { S } from './MobileSubmissionPage.styles';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import SellWorkflowService from '../../../services/sellWorkflowService';

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

type SubmissionState = 'submitting' | 'success' | 'error';

const MobileSubmissionPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicleType } = useParams();
  const [state, setState] = useState<SubmissionState>('submitting');
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
      if (!user?.uid) {
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
    } catch (err) {
      logger.error('Submission error', err as Error, { 
        userId: user?.uid, 
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

  return (
    <>
      <ProgressWrapper>
        <SellProgressBar currentStep="publish" />
      </ProgressWrapper>
      <S.Container>
        <S.Content>
          {state === 'submitting' && (
            <>
              <S.LoadingSpinner />
              <S.Title>{t('sell.submission.submitting')}</S.Title>
              <S.Message>{t('sell.submission.pleaseWait')}</S.Message>
            </>
          )}

          {state === 'success' && (
            <>
              <S.SuccessIcon>✓</S.SuccessIcon>
              <S.Title>{t('sell.submission.success')}</S.Title>
              <S.Message>{t('sell.submission.successMessage')}</S.Message>
              <S.Actions>
                <S.PrimaryButton onClick={handleViewListing}>
                  {t('sell.submission.viewListing')}
                </S.PrimaryButton>
                <S.SecondaryButton onClick={handleCreateNew}>
                  {t('sell.submission.createNew')}
                </S.SecondaryButton>
              </S.Actions>
            </>
          )}

          {state === 'error' && (
            <>
              <S.ErrorIcon>✕</S.ErrorIcon>
              <S.Title>{t('sell.submission.error')}</S.Title>
              <S.Message>
                {error || t('sell.submission.errorMessage')}
              </S.Message>
              <S.Actions>
                <S.PrimaryButton onClick={handleRetry}>
                  {t('sell.submission.retry')}
                </S.PrimaryButton>
                <S.SecondaryButton onClick={handleGoBack}>
                  {t('sell.submission.goBack')}
                </S.SecondaryButton>
              </S.Actions>
            </>
          )}
        </S.Content>
      </S.Container>
    </>
  );
};

export default MobileSubmissionPage;
