// Mobile Submission Page - Final step in sell workflow
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import WorkflowPersistenceService from '@/services/workflowPersistenceService';
import { logger } from '@/services/logger-service';
import { S } from './MobileSubmissionPage.styles';

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
      
      // Load workflow data
      const workflowState = WorkflowPersistenceService.loadState();
      if (!workflowState) {
        throw new Error('No workflow data found');
      }

      const { data } = workflowState;
      const images = WorkflowPersistenceService.getImagesAsFiles();

      // Prepare listing data
      const listingData = {
        ...data,
        userId: user?.uid,
        vehicleType: vehicleType || 'car',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // TODO: Replace with actual Firebase submission
      // const carId = await carService.createCar(listingData, images);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log submission
      logger.info('Listing submitted successfully', { 
        userId: user?.uid,
        vehicleType,
        imageCount: images.length 
      });
      
      // Clear workflow state after successful submission
      WorkflowPersistenceService.clearState();
      
      setState('success');
    } catch (err) {
      logger.error('Submission error', err as Error, { userId: user?.uid, vehicleType });
      setError(err instanceof Error ? err.message : 'Unknown error');
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
  );
};

export default MobileSubmissionPage;
