// src/pages/billing/SuccessPage.tsx
// Stripe Checkout Success Page
// Displays success message after successful subscription

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import styled from 'styled-components';
import { serviceLogger } from '../../services/logger-wrapper';

// ==================== TYPES ====================

interface SessionVerificationResult {
  success: boolean;
  subscription?: {
    id: string;
    planTier: string;
    status: string;
    currentPeriodEnd: string;
  };
  error?: string;
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 3rem;
  
  &::after {
    content: '✓';
    color: white;
  }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: #4a5568;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const DetailsBox = styled.div`
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #4a5568;
`;

const DetailValue = styled.span`
  color: #1a202c;
  font-weight: 500;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: left;
`;

// ==================== COMPONENT ====================

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const verifySession = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      if (!currentUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        serviceLogger.info('Verifying checkout session', { sessionId });

        // Call Cloud Function to verify session
        const verifySessionFn = httpsCallable<
          { sessionId: string },
          SessionVerificationResult
        >(functions, 'verifyCheckoutSession');

        const result = await verifySessionFn({ sessionId });
        const data = result.data;

        if (data.success && data.subscription) {
          setSubscription(data.subscription);
          serviceLogger.info('Subscription activated', { 
            subscriptionId: data.subscription.id 
          });
        } else {
          setError(data.error || 'Failed to verify session');
        }

      } catch (err: any) {
        serviceLogger.error('Error verifying session', err as Error);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, currentUser]);

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleViewInvoices = () => {
    navigate('/profile/billing/invoices');
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <LoadingSpinner />
          <Title>{t('billing.verifying')}</Title>
          <Message>{t('billing.pleaseWait')}</Message>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <ErrorMessage>
            <strong>{t('common.error')}:</strong> {error}
          </ErrorMessage>
          <CTAButton onClick={() => navigate('/pricing')}>
            {t('billing.tryAgain')}
          </CTAButton>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <SuccessIcon />
        
        <Title>{t('billing.success.title')}</Title>
        <Message>{t('billing.success.message')}</Message>

        {subscription && (
          <DetailsBox>
            <DetailRow>
              <DetailLabel>{t('billing.plan')}:</DetailLabel>
              <DetailValue>{subscription.planTier}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>{t('billing.status')}:</DetailLabel>
              <DetailValue style={{ color: '#48bb78' }}>
                {subscription.status === 'active' ? t('billing.active') : subscription.status}
              </DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>{t('billing.renewsOn')}:</DetailLabel>
              <DetailValue>
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  language === 'bg' ? 'bg-BG' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </DetailValue>
            </DetailRow>
          </DetailsBox>
        )}

        <CTAButton onClick={handleGoToProfile}>
          {t('billing.goToProfile')}
        </CTAButton>

        <SecondaryButton onClick={handleViewInvoices}>
          {t('billing.viewInvoices')}
        </SecondaryButton>
      </Card>
    </Container>
  );
};

export default SuccessPage;
