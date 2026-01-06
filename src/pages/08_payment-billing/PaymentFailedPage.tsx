// src/pages/08_payment-billing/PaymentFailedPage.tsx
// Payment Failed Page - When payment fails or is canceled

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { XCircle, RefreshCw, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../services/logger-service';
import { useToast } from '../../components/Toast';
import { getCarDetailsUrl } from '../../utils/routing-utils';
import { unifiedCarService } from '../../services/car';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: white;
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

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const ErrorTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: #991b1b;
  font-size: 0.875rem;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const Button = styled.button<{ $primary?: boolean; $secondary?: boolean }>`
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
  
  ${props => {
    if (props.$primary) {
      return `
        background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
        color: white;
        border: none;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
        }
      `;
    } else if (props.$secondary) {
      return `
        background: white;
        color: #6b7280;
        border: 2px solid #e5e7eb;
        
        &:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
      `;
    } else {
      return `
        background: #f3f4f6;
        color: #374151;
        border: 2px solid #e5e7eb;
        
        &:hover {
          background: #e5e7eb;
        }
      `;
    }
  }}
`;

const ReasonsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  text-align: left;
  
  li {
    padding: 0.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
    display: flex;
    align-items: start;
    gap: 0.5rem;
    
    &::before {
      content: '•';
      color: #ef4444;
      font-weight: bold;
      margin-right: 0.25rem;
    }
  }
`;

/**
 * Payment Failed Page
 * Displays when payment fails or is canceled
 */
const PaymentFailedPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const isBg = language === 'bg';

  const carId = searchParams.get('carId');
  const errorMessage = searchParams.get('error');
  const [carUrl, setCarUrl] = useState<string>('/cars');

  useEffect(() => {
    // Track failed payment
    logger.warn('Payment failed', new Error(errorMessage || 'Unknown error'), { carId });
    
    // ✅ FIXED: Load car data to generate proper numeric URL
    if (carId) {
      unifiedCarService.getCarById(carId)
        .then(car => {
          if (car) {
            const url = getCarDetailsUrl(car);
            setCarUrl(url);
          } else {
            // ✅ CONSTITUTION: No /car-details/ fallback - go to search
            setCarUrl('/cars');
          }
        })
        .catch(error => {
          logger.error('Error loading car for URL generation', error as Error, { carId });
          // ✅ CONSTITUTION: No /car-details/ fallback - go to search
          setCarUrl('/cars');
        });
    }
  }, [carId, errorMessage]);

  const handleRetry = () => {
    if (carId) {
      navigate(`/checkout/${carId}`);
    } else {
      navigate('/cars');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    // ✅ FIXED: Use proper numeric URL if available, otherwise fallback
    navigate(carUrl);
  };

  return (
    <Container>
      <Card>
        <IconWrapper>
          <XCircle />
        </IconWrapper>
        
        <Title>
          {isBg ? '❌ Плащането неуспешно' : '❌ Payment Failed'}
        </Title>
        
        <Message>
          {isBg 
            ? 'Съжаляваме, но плащането не беше успешно. Моля, опитайте отново или изберете друг метод на плащане.'
            : 'We\'re sorry, but the payment was not successful. Please try again or choose a different payment method.'}
        </Message>

        {errorMessage && (
          <ErrorBox>
            <ErrorTitle>
              <AlertTriangle size={18} />
              {isBg ? 'Детайли за грешката:' : 'Error Details:'}
            </ErrorTitle>
            <ErrorMessage>{errorMessage}</ErrorMessage>
          </ErrorBox>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>
            {isBg ? 'Възможни причини:' : 'Possible reasons:'}
          </h3>
          <ReasonsList>
            <li>{isBg ? 'Недостатъчни средства по картата' : 'Insufficient funds on card'}</li>
            <li>{isBg ? 'Картата е изтекла или невалидна' : 'Card expired or invalid'}</li>
            <li>{isBg ? 'Проблем с банковата мрежа' : 'Bank network issue'}</li>
            <li>{isBg ? 'Плащането е отменено' : 'Payment was canceled'}</li>
          </ReasonsList>
        </div>

        <ButtonGroup>
          <Button onClick={handleGoBack}>
            <ArrowLeft size={18} />
            {isBg ? 'Назад' : 'Back'}
          </Button>
          <Button $secondary onClick={handleGoHome}>
            <Home size={18} />
            {isBg ? 'Начална страница' : 'Home'}
          </Button>
          <Button $primary onClick={handleRetry}>
            <RefreshCw size={18} />
            {isBg ? 'Опитай отново' : 'Try Again'}
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default PaymentFailedPage;
