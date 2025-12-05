// Verification Badge Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Shows verification status for email/phone

import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

interface VerificationBadgeProps {
  verified: boolean;
  type?: 'email' | 'phone';
  onVerify?: () => void;
  inline?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  verified, 
  type = 'email',
  onVerify,
  inline = false 
}) => {
  const { language } = useLanguage();

  const getText = () => {
    if (verified) {
      return language === 'bg' ? 'Потвърден' : 'Confirmed';
    }
    return language === 'bg' ? 'Непотвърден' : 'Not confirmed';
  };

  return (
    <Container $inline={inline}>
      <Badge $verified={verified}>
        {verified ? (
          <CheckCircle size={14} />
        ) : (
          <AlertCircle size={14} />
        )}
        <Text>{getText()}</Text>
      </Badge>
      
      {!verified && onVerify && (
        <VerifyButton onClick={onVerify}>
          {language === 'bg' 
            ? `Потвърди ${type === 'phone' ? 'телефонен номер' : 'имейл'} сега`
            : `Confirm ${type} now`}
        </VerifyButton>
      )}
    </Container>
  );
};

const Container = styled.div<{ $inline: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: ${props => props.$inline ? 'nowrap' : 'wrap'};

  @media (max-width: 768px) {
    flex-direction: ${props => props.$inline ? 'row' : 'column'};
    align-items: ${props => props.$inline ? 'center' : 'flex-start'};
    gap: 8px;
  }
`;

const Badge = styled.div<{ $verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  
  ${props => props.$verified ? `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  ` : `
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
  `}

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 3px 10px;
    font-size: 0.75rem;
  }
`;

const Text = styled.span``;

const VerifyButton = styled.button`
  background: transparent;
  border: none;
  color: #0066cc;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #004080;
  }

  &:active {
    color: #003366;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

export default VerificationBadge;

