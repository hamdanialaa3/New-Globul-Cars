/**
 * EIK Verification Component
 * UI for verifying Bulgarian company EIK (ЕИК) numbers
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  verifyEIK, 
  validateEIKFormat, 
  formatEIK,
  EIKVerificationResult 
} from '../../services/verification/eik-verification-service';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface EIKVerificationProps {
  onVerificationComplete?: (result: EIKVerificationResult) => void;
  initialEIK?: string;
  showBusinessNameField?: boolean;
}

export const EIKVerification: React.FC<EIKVerificationProps> = ({
  onVerificationComplete,
  initialEIK = '',
  showBusinessNameField = true
}) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  
  const [eik, setEIK] = useState(initialEIK);
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EIKVerificationResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous results
    setError('');
    setResult(null);

    // Check authentication
    if (!currentUser) {
      setError(t('verification.loginRequired') || 'Моля влезте в профила си');
      return;
    }

    // Validate format
    const formatValidation = validateEIKFormat(eik);
    if (!formatValidation.valid) {
      setError(formatValidation.error || 'Невалиден формат на ЕИК');
      return;
    }

    setLoading(true);

    try {
      const verificationResult = await verifyEIK(eik, businessName);
      setResult(verificationResult);

      if (onVerificationComplete) {
        onVerificationComplete(verificationResult);
      }
    } catch (err: any) {
      setError(err.message || 'Грешка при верификация');
    } finally {
      setLoading(false);
    }
  };

  const handleEIKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 13) {
      setEIK(value);
      setError(''); // Clear error on input change
    }
  };

  return (
    <Container>
      <Header>
        <Title>{t('verification.eikTitle') || 'Верификация на ЕИК'}</Title>
        <Subtitle>
          {t('verification.eikSubtitle') || 'Проверете дали ЕИК номерът е валиден и активен'}
        </Subtitle>
      </Header>

      <Form onSubmit={handleVerify}>
        <FormGroup>
          <Label htmlFor="eik">
            {t('verification.eikNumber') || 'ЕИК номер'} <Required>*</Required>
          </Label>
          <Input
            id="eik"
            type="text"
            value={eik}
            onChange={handleEIKChange}
            placeholder="123456789"
            maxLength={13}
            disabled={loading}
            hasError={!!error && !loading}
          />
          <Hint>
            {t('verification.eikHint') || '9 или 13 цифри (без интервали)'}
          </Hint>
        </FormGroup>

        {showBusinessNameField && (
          <FormGroup>
            <Label htmlFor="businessName">
              {t('verification.businessName') || 'Име на фирма (незадължително)'}
            </Label>
            <Input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t('verification.businessNamePlaceholder') || 'ООД "Пример"'}
              disabled={loading}
            />
          </FormGroup>
        )}

        {error && !loading && (
          <ErrorBox>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>{error}</ErrorText>
          </ErrorBox>
        )}

        {result && !loading && (
          <ResultBox isValid={result.valid}>
            <ResultHeader>
              <ResultIcon>{result.valid ? '✅' : '❌'}</ResultIcon>
              <ResultTitle>
                {result.valid 
                  ? (t('verification.validEIK') || 'Валиден ЕИК')
                  : (t('verification.invalidEIK') || 'Невалиден ЕИК')
                }
              </ResultTitle>
            </ResultHeader>

            <ResultContent>
              <ResultRow>
                <ResultLabel>{t('verification.eikNumber') || 'ЕИК номер'}:</ResultLabel>
                <ResultValue>{formatEIK(result.eik)}</ResultValue>
              </ResultRow>

              {result.companyName && (
                <ResultRow>
                  <ResultLabel>{t('verification.companyName') || 'Име на фирма'}:</ResultLabel>
                  <ResultValue>{result.companyName}</ResultValue>
                </ResultRow>
              )}

              {result.address && (
                <ResultRow>
                  <ResultLabel>{t('verification.address') || 'Адрес'}:</ResultLabel>
                  <ResultValue>{result.address}</ResultValue>
                </ResultRow>
              )}

              {result.registrationDate && (
                <ResultRow>
                  <ResultLabel>{t('verification.registrationDate') || 'Дата на регистрация'}:</ResultLabel>
                  <ResultValue>{new Date(result.registrationDate).toLocaleDateString('bg-BG')}</ResultValue>
                </ResultRow>
              )}

              {result.status && (
                <ResultRow>
                  <ResultLabel>{t('verification.status') || 'Статус'}:</ResultLabel>
                  <StatusBadge status={result.status}>
                    {result.status === 'active' ? '🟢 Активна' : 
                     result.status === 'inactive' ? '🟡 Неактивна' : 
                     '🔴 Ликвидация'}
                  </StatusBadge>
                </ResultRow>
              )}

              {result.legalForm && (
                <ResultRow>
                  <ResultLabel>{t('verification.legalForm') || 'Правна форма'}:</ResultLabel>
                  <ResultValue>{result.legalForm}</ResultValue>
                </ResultRow>
              )}

              <ResultMessage>{result.message}</ResultMessage>
            </ResultContent>
          </ResultBox>
        )}

        <SubmitButton type="submit" disabled={loading || !eik}>
          {loading ? (
            <>
              <Spinner />
              {t('verification.verifying') || 'Проверява се...'}
            </>
          ) : (
            t('verification.verify') || 'Провери'
          )}
        </SubmitButton>
      </Form>

      <InfoBox>
        <InfoIcon>ℹ️</InfoIcon>
        <InfoText>
          {t('verification.eikInfo') || 
            'ЕИК (Единен Идентификационен Код) е уникален номер на всяка българска фирма. ' +
            'Този номер може да се провери в Търговския регистър на НАП.'
          }
        </InfoText>
      </InfoBox>
    </Container>
  );
};

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
  font-size: 28px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 16px;
`;

const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Required = styled.span`
  color: #ef4444;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${({ hasError }) => (hasError ? '#ef4444' : '#e5e7eb')};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ hasError, theme }) => (hasError ? '#ef4444' : theme.colors.primary)};
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Hint = styled.p`
  margin-top: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
`;

const ErrorIcon = styled.span`
  font-size: 20px;
`;

const ErrorText = styled.p`
  color: #dc2626;
  margin: 0;
`;

const ResultBox = styled.div<{ isValid: boolean }>`
  background: ${({ isValid }) => (isValid ? '#f0fdf4' : '#fef2f2')};
  border: 2px solid ${({ isValid }) => (isValid ? '#86efac' : '#fecaca')};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ResultIcon = styled.span`
  font-size: 24px;
`;

const ResultTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const ResultContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-of-type {
    border-bottom: none;
  }
`;

const ResultLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ResultValue = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  background: ${({ status }) =>
    status === 'active' ? '#d1fae5' : status === 'inactive' ? '#fef3c7' : '#fee2e2'};
  color: ${({ status }) =>
    status === 'active' ? '#059669' : status === 'inactive' ? '#d97706' : '#dc2626'};
`;

const ResultMessage = styled.p`
  margin: 12px 0 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
`;

const InfoIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  margin: 0;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.5;
`;
