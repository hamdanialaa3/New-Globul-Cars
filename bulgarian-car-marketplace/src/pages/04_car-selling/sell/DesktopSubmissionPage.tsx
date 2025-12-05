// Desktop Submission Page - Final step in sell workflow
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import WorkflowPersistenceService from '../../../services/workflowPersistenceService';
import { logger } from '../../../services/logger-service';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import SellWorkflowService from '../../../services/sellWorkflowService';

const ProgressWrapper = styled.div`
  padding: 1rem 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  border: 4px solid var(--border-primary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 2rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--error);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  padding: 0.875rem 2rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.875rem 2rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
`;

type SubmissionState = 'submitting' | 'success' | 'error';

const DesktopSubmissionPage: React.FC = () => {
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
      const images = WorkflowPersistenceService.getImagesAsFiles();

      // Validate required data
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      if (!data.make || !data.year) {
        throw new Error('Missing required vehicle information');
      }

      // Create the car listing using the actual service
      const carId = await SellWorkflowService.createCarListing(data, user.uid, images);

      // Log successful submission
      logger.info('Car listing submitted successfully', {
        carId,
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
      <Container>
        <Content>
          {state === 'submitting' && (
            <>
              <LoadingSpinner />
              <Title>{t('sell.submission.submitting')}</Title>
              <Message>{t('sell.submission.pleaseWait')}</Message>
            </>
          )}

          {state === 'success' && (
            <>
              <SuccessIcon>✓</SuccessIcon>
              <Title>{t('sell.submission.success')}</Title>
              <Message>{t('sell.submission.successMessage')}</Message>
              <Actions>
                <PrimaryButton onClick={handleViewListing}>
                  {t('sell.submission.viewListing')}
                </PrimaryButton>
                <SecondaryButton onClick={handleCreateNew}>
                  {t('sell.submission.createNew')}
                </SecondaryButton>
              </Actions>
            </>
          )}

          {state === 'error' && (
            <>
              <ErrorIcon>✕</ErrorIcon>
              <Title>{t('sell.submission.error')}</Title>
              <Message>
                {error || t('sell.submission.errorMessage')}
              </Message>
              <Actions>
                <PrimaryButton onClick={handleRetry}>
                  {t('sell.submission.retry')}
                </PrimaryButton>
                <SecondaryButton onClick={handleGoBack}>
                  {t('sell.submission.goBack')}
                </SecondaryButton>
              </Actions>
            </>
          )}
        </Content>
      </Container>
    </>
  );
};

export default DesktopSubmissionPage;