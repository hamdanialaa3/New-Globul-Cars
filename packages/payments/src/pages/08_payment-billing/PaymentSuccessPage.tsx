// src/pages/PaymentSuccessPage.tsx
// Payment Success Page

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CheckCircle, Home, FileText, Share2 } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { monitoring } from '@globul-cars/services/monitoring-service';

const Container = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: scaleIn 0.5s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #7f8c8d;
`;

const Value = styled.span`
  color: #2c3e50;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' 
    ? 'white' 
    : 'linear-gradient(135deg, #FF7900, #ff8c1a)'};
  color: ${props => props.variant === 'secondary' ? '#FF7900' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid #FF7900' : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
  }
`;

const PaymentSuccessPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    // Track successful purchase
    monitoring.trackUserAction('purchase_completed', 'payment', {
      transactionId
    });
  }, [transactionId]);

  return (
    <Container>
      <SuccessIcon>
        <CheckCircle size={50} />
      </SuccessIcon>

      <Title>
        {language === 'bg' ? 'Плащането е успешно!' : 'Payment Successful!'}
      </Title>

      <Message>
        {language === 'bg'
          ? 'Благодарим ви за покупката! Ще получите потвърждение по имейл скоро.'
          : 'Thank you for your purchase! You will receive a confirmation email shortly.'}
      </Message>

      <Card>
        <InfoRow>
          <Label>{language === 'bg' ? 'Номер на транзакция' : 'Transaction ID'}</Label>
          <Value>{transactionId || 'TXN-' + Date.now()}</Value>
        </InfoRow>
        <InfoRow>
          <Label>{language === 'bg' ? 'Дата' : 'Date'}</Label>
          <Value>{new Date().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</Value>
        </InfoRow>
        <InfoRow>
          <Label>{language === 'bg' ? 'Статус' : 'Status'}</Label>
          <Value style={{ color: '#10b981' }}>
            {language === 'bg' ? 'Завършено' : 'Completed'}
          </Value>
        </InfoRow>
      </Card>

      <ButtonGroup>
        <Button onClick={() => navigate('/')}>
          <Home size={20} />
          {language === 'bg' ? 'Начална страница' : 'Home'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/my-listings')}>
          <FileText size={20} />
          {language === 'bg' ? 'Моите обяви' : 'My Listings'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default PaymentSuccessPage;
