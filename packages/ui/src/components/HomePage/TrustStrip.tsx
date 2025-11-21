// TrustStrip Component - شريط الثقة المصغر
// Displays trust signals: verified sellers, security badges, payment ready

import React from 'react';
import styled from 'styled-components';
import { Shield, CheckCircle, CreditCard } from 'lucide-react';
import { useLanguage } from '@globul-cars/core';

const TrustStripContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: rgba(0, 51, 102, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  z-index: 10;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    padding: 10px 16px;
    gap: 16px;
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 12px;
    font-size: 0.6875rem;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;

  svg {
    width: 18px;
    height: 18px;
    color: #00966E;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    gap: 6px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (max-width: 480px) {
    font-size: 0.6875rem;
    gap: 4px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

interface TrustStripProps {
  verifiedSellers?: number;
  showSecurity?: boolean;
  showPayment?: boolean;
}

const TrustStrip: React.FC<TrustStripProps> = ({
  verifiedSellers = 100,
  showSecurity = true,
  showPayment = true,
}) => {
  const { t, language } = useLanguage();

  const getText = (key: string) => {
    if (language === 'bg') {
      const bgTexts: Record<string, string> = {
        verifiedSellers: `${verifiedSellers}+ Потвърдени Продавачи`,
        secured: 'Secured by reCAPTCHA',
        payment: 'Stripe Ready Payments',
      };
      return bgTexts[key] || key;
    } else {
      const enTexts: Record<string, string> = {
        verifiedSellers: `${verifiedSellers}+ Verified Sellers`,
        secured: 'Secured by reCAPTCHA',
        payment: 'Stripe Ready Payments',
      };
      return enTexts[key] || key;
    }
  };

  return (
    <TrustStripContainer>
      <TrustItem>
        <CheckCircle />
        <span>{getText('verifiedSellers')}</span>
      </TrustItem>
      
      {showSecurity && (
        <TrustItem>
          <Shield />
          <span>{getText('secured')}</span>
        </TrustItem>
      )}
      
      {showPayment && (
        <TrustItem>
          <CreditCard />
          <span>{getText('payment')}</span>
        </TrustItem>
      )}
    </TrustStripContainer>
  );
};

export default TrustStrip;

