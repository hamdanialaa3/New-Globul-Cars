// src/components/EIKInput.tsx
// EIK Input component with real-time verification

import React, { useState } from 'react';
import styled from 'styled-components';
import { eikVerificationService } from '../services/eik-verification-service';
import { useLanguage } from '../contexts/LanguageContext';

const Container = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ error?: boolean; verified?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${(p) => {
    if (p.error) return '#ef4444';
    if (p.verified) return '#059669';
    return '#e5e7eb';
  }};
  border-radius: 8px;
  font-size: 16px;
  font-family: monospace;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${(p) => (p.error ? '#ef4444' : '#2563eb')};
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const StatusIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
`;

const Message = styled.p<{ type: 'error' | 'success' | 'info' }>`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${(p) => {
    switch (p.type) {
      case 'error': return '#dc2626';
      case 'success': return '#059669';
      default: return '#6b7280';
    }
  }};
`;

const VerificationDetails = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  font-size: 13px;
`;

const DetailItem = styled.p`
  margin: 4px 0;
  
  strong {
    color: #15803d;
  }
`;

interface EIKInputProps {
  value: string;
  onChange: (eik: string) => void;
  onVerificationChange?: (verified: boolean, data?: any) => void;
  required?: boolean;
  disabled?: boolean;
}

export const EIKInput: React.FC<EIKInputProps> = ({
  value,
  onChange,
  onVerificationChange,
  required = false,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '');
    onChange(newValue);
    setVerified(false);
    setError('');
    setVerificationData(null);
  };

  const handleBlur = async () => {
    if (!value) return;

    if (!eikVerificationService.isValidEIK(value)) {
      setError(t('eik.invalidFormat') || 'Invalid EIK format');
      onVerificationChange?.(false);
      return;
    }

    try {
      setVerifying(true);
      setError('');

      const result = await eikVerificationService.verifyEIK(value);

      if (result.success) {
        setVerified(true);
        setVerificationData(result);
        onVerificationChange?.(true, result);
      } else {
        setError(result.error || (t('eik.verificationFailed') || 'Verification failed'));
        onVerificationChange?.(false);
      }
    } catch (err: any) {
      setError(err.message || (t('eik.verificationError') || 'Verification error'));
      onVerificationChange?.(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Container>
      <Label>
        {t('eik.label') || 'EIK (Company Registration Number)'}
        {required && <span style={{ color: '#dc2626' }}> *</span>}
      </Label>

      <InputWrapper>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="123456789"
          value={eikVerificationService.formatEIK(value)}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled || verifying}
          error={!!error}
          verified={verified}
        />

        {verifying && <StatusIcon>⏳</StatusIcon>}
        {error && <StatusIcon>❌</StatusIcon>}
        {verified && <StatusIcon>✅</StatusIcon>}
      </InputWrapper>

      {error && <Message type="error">{error}</Message>}

      {verificationData && verified && (
        <VerificationDetails>
          <DetailItem>
            <strong>{t('eik.companyName') || 'Company Name'}:</strong> {verificationData.companyName}
          </DetailItem>
          {verificationData.address && (
            <DetailItem>
              <strong>{t('eik.address') || 'Address'}:</strong> {verificationData.address}
            </DetailItem>
          )}
          {verificationData.status && (
            <DetailItem>
              <strong>{t('eik.status') || 'Status'}:</strong> {verificationData.status}
            </DetailItem>
          )}
        </VerificationDetails>
      )}

      <Message type="info">
        {t('eik.hint') || 'Enter a 9 or 13 digit number'}
      </Message>
    </Container>
  );
};

export default EIKInput;
