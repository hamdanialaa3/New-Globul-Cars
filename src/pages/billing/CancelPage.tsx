// src/pages/billing/CancelPage.tsx
// Stripe Checkout Cancel Page
// Displays message when user cancels checkout

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import styled from 'styled-components';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

const CancelIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 3rem;
  
  &::after {
    content: '✕';
    color: white;
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

const BenefitsBox = styled.div`
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  
  svg {
    width: 24px;
    height: 24px;
    margin-right: 1rem;
    color: #48bb78;
  }
  
  span {
    color: #2d3748;
    font-size: 1rem;
  }
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

const SurveyBox = styled.div`
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SurveyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
  
  &:hover {
    background: #fed7d7;
  }
  
  input {
    margin-right: 0.75rem;
  }
  
  span {
    color: #2d3748;
  }
`;

// ==================== COMPONENT ====================

export const CancelPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = React.useState<string>('');

  const handleReturnToPricing = () => {
    navigate('/pricing');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const cancellationReasons = [
    { id: 'too_expensive', label: t('billing.cancel.reasons.expensive') },
    { id: 'not_ready', label: t('billing.cancel.reasons.notReady') },
    { id: 'missing_features', label: t('billing.cancel.reasons.missingFeatures') },
    { id: 'found_alternative', label: t('billing.cancel.reasons.foundAlternative') },
    { id: 'other', label: t('billing.cancel.reasons.other') },
  ];

  const CheckIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <Container>
      <Card>
        <CancelIcon />
        
        <Title>{t('billing.cancel.title')}</Title>
        <Message>{t('billing.cancel.message')}</Message>

        <SurveyBox>
          <SurveyTitle>{t('billing.cancel.surveyTitle')}</SurveyTitle>
          <RadioGroup>
            {cancellationReasons.map((reason) => (
              <RadioLabel key={reason.id}>
                <input
                  type="radio"
                  name="cancellation_reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span>{reason.label}</span>
              </RadioLabel>
            ))}
          </RadioGroup>
        </SurveyBox>

        <BenefitsBox>
          <BenefitItem>
            <CheckIcon />
            <span>{t('billing.cancel.benefits.noCommitment')}</span>
          </BenefitItem>
          <BenefitItem>
            <CheckIcon />
            <span>{t('billing.cancel.benefits.cancelAnytime')}</span>
          </BenefitItem>
          <BenefitItem>
            <CheckIcon />
            <span>{t('billing.cancel.benefits.moneyBackGuarantee')}</span>
          </BenefitItem>
        </BenefitsBox>

        <CTAButton onClick={handleReturnToPricing}>
          {t('billing.cancel.viewPlans')}
        </CTAButton>

        <SecondaryButton onClick={handleGoHome}>
          {t('billing.cancel.goHome')}
        </SecondaryButton>
      </Card>
    </Container>
  );
};

export default CancelPage;
