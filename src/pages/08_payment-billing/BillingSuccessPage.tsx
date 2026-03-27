// src/pages/08_payment-billing/BillingSuccessPage.tsx
// Payment Success Page - Stripe checkout completed

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { billingService } from '../../features/billing/BillingService';
import { logger } from '../../services/logger-service';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: white;
  }
`;

const LoadingWrapper = styled(IconWrapper)`
  background: linear-gradient(135deg, #3B82F6 0%, #fb923c 100%);
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const DetailsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  text-align: left;
  
  li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const Label = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Value = styled.span`
  color: #1a1a1a;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #3B82F6 0%, #fb923c 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
  ` : `
    background: white;
    color: #6b7280;
    border: 2px solid #e5e7eb;
    
    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  `}
`;

/**
 * Billing Success Page
 * Displays confirmation after successful Stripe checkout
 */
const BillingSuccessPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const isBg = language === 'bg';

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      logger.warn('No session_id in success page');
      navigate('/billing');
      return;
    }

    // Verify session and get subscription details
    const verifySession = async () => {
      try {
        setLoading(true);
        
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get updated subscription
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.uid) {
          const sub = await billingService.getCurrentSubscription(currentUser.uid);
          setSubscription(sub);
        }
        
        logger.info('Payment verified successfully', { sessionId });
      } catch (error) {
        logger.error('Error verifying session', error as Error);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [searchParams, navigate]);

  const handleGoToDashboard = () => {
    navigate('/profile');
  };

  const handleViewBilling = () => {
    navigate('/billing');
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <LoadingWrapper>
            <Loader />
          </LoadingWrapper>
          <Title>
            {isBg ? '⏳ Обработка на плащането...' : '⏳ Processing Payment...'}
          </Title>
          <Message>
            {isBg 
              ? 'Моля, изчакайте докато потвърдим вашата транзакция.'
              : 'Please wait while we confirm your transaction.'}
          </Message>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <IconWrapper>
          <CheckCircle />
        </IconWrapper>
        
        <Title>
          {isBg ? '🎉 Плащането е успешно!' : '🎉 Payment Successful!'}
        </Title>
        
        <Message>
          {isBg 
            ? 'Благодарим ви! Вашият абонамент е активиран успешно.'
            : 'Thank you! Your subscription has been activated successfully.'}
        </Message>

        {subscription && (
          <DetailsList>
            <li>
              <Label>{isBg ? 'План:' : 'Plan:'}</Label>
              <Value>
                {subscription.planId === 'dealer' 
                  ? (isBg ? 'Търговец' : 'Dealer')
                  : (isBg ? 'Компания' : 'Company')}
              </Value>
            </li>
            <li>
              <Label>{isBg ? 'Интервал:' : 'Interval:'}</Label>
              <Value>
                {subscription.interval === 'monthly'
                  ? (isBg ? 'Месечен' : 'Monthly')
                  : (isBg ? 'Годишен' : 'Annual')}
              </Value>
            </li>
            <li>
              <Label>{isBg ? 'Статус:' : 'Status:'}</Label>
              <Value style={{ color: '#10b981' }}>
                {isBg ? '✅ Активен' : '✅ Active'}
              </Value>
            </li>
          </DetailsList>
        )}

        <ButtonGroup>
          <Button onClick={handleViewBilling}>
            {isBg ? 'Преглед на фактури' : 'View Invoices'}
          </Button>
          <Button $primary onClick={handleGoToDashboard}>
            {isBg ? 'Към профила' : 'Go to Profile'}
            <ArrowRight size={18} />
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default BillingSuccessPage;


