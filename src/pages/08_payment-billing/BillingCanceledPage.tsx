// src/pages/08_payment-billing/BillingCanceledPage.tsx
// Payment Canceled Page - User canceled Stripe checkout

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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

const InfoBox = styled.div`
  background: #fef9c3;
  border: 2px solid #fde047;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #854d0e;
  margin: 0 0 0.5rem 0;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #713f12;
  margin: 0;
  line-height: 1.5;
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
    background: linear-gradient(135deg, #FF8F10 0%, #fb923c 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
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
 * Billing Canceled Page
 * Displays when user cancels Stripe checkout
 */
const BillingCanceledPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isBg = language === 'bg';

  const handleRetry = () => {
    navigate('/billing');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container>
      <Card>
        <IconWrapper>
          <XCircle />
        </IconWrapper>
        
        <Title>
          {isBg ? '❌ Плащането е отменено' : '❌ Payment Canceled'}
        </Title>
        
        <Message>
          {isBg 
            ? 'Вашето плащане беше отменено. Не се притеснявайте - няма извършени транзакции.'
            : 'Your payment was canceled. Don\'t worry - no charges were made.'}
        </Message>

        <InfoBox>
          <InfoTitle>
            {isBg ? '💡 Нуждаете се от помощ?' : '💡 Need Help?'}
          </InfoTitle>
          <InfoText>
            {isBg 
              ? 'Ако имате въпроси относно нашите планове или срещнахте проблем, нашият екип за поддръжка е на разположение 24/7.'
              : 'If you have questions about our plans or encountered an issue, our support team is available 24/7.'}
          </InfoText>
        </InfoBox>

        <ButtonGroup>
          <Button onClick={handleGoHome}>
            <ArrowLeft size={18} />
            {isBg ? 'Към началото' : 'Go Home'}
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

export default BillingCanceledPage;
