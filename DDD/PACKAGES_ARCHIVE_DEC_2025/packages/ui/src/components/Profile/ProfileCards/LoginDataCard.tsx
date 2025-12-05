// Login Data Card Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Displays email and password with verification status

import React, { useState } from 'react';
import styled from 'styled-components';
import { Lock, Mail, Key, Edit } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import VerificationBadge from './VerificationBadge';

interface LoginDataCardProps {
  email: string;
  emailVerified: boolean;
  onChangePassword?: () => void;
  onVerifyEmail?: () => void;
}

const LoginDataCard: React.FC<LoginDataCardProps> = ({
  email,
  emailVerified,
  onChangePassword,
  onVerifyEmail
}) => {
  const { language } = useLanguage();

  return (
    <Card>
      <SectionHeader>
        <Title>
          <Lock size={20} />
          {language === 'bg' ? 'Данни за вход' : 'Login data'}
        </Title>
      </SectionHeader>

      <DataRow>
        <LabelSection>
          <IconWrapper><Mail size={16} /></IconWrapper>
          <Label>
            {language === 'bg' ? 'Имейл адрес' : 'E-mail Address'}
          </Label>
        </LabelSection>
        <ValueSection>
          <Value>{email}</Value>
          <VerificationBadge 
            verified={emailVerified} 
            type="email"
            onVerify={onVerifyEmail}
            inline
          />
        </ValueSection>
      </DataRow>

      <DataRow>
        <LabelSection>
          <IconWrapper><Key size={16} /></IconWrapper>
          <Label>
            {language === 'bg' ? 'Парола' : 'Password'}
          </Label>
        </LabelSection>
        <ValueSection>
          <Value>••••••••••••</Value>
          {onChangePassword && (
            <ChangeButton onClick={onChangePassword}>
              <Edit size={14} />
              {language === 'bg' ? 'Промяна' : 'Change'}
            </ChangeButton>
          )}
        </ValueSection>
      </DataRow>
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const DataRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
    gap: 8px;
  }
`;

const LabelSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #6c757d;
`;

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

const ValueSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Value = styled.span`
  font-size: 0.9375rem;
  color: #212529;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ChangeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 6px 12px;
  color: #495057;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 0.75rem;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export default LoginDataCard;

