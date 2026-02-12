// Contact Data Card Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Displays contact information with verification

import React from 'react';
import styled from 'styled-components';
import { Phone, User, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import VerificationBadge from './VerificationBadge';

interface ContactDataCardProps {
  name: string;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
  };
  phoneNumber?: string;
  phoneVerified: boolean;
  onVerifyPhone?: () => void;
}

const ContactDataCard: React.FC<ContactDataCardProps> = ({
  name,
  address,
  phoneNumber,
  phoneVerified,
  onVerifyPhone
}) => {
  const { language } = useLanguage();

  return (
    <Card>
      <SectionHeader>
        <Title>
          <Phone size={20} />
          {language === 'bg' ? 'Данни за контакт' : 'Contact data'}
        </Title>
      </SectionHeader>

      <DataRow>
        <LabelSection>
          <IconWrapper><User size={16} /></IconWrapper>
          <Label>{language === 'bg' ? 'Име' : 'Name'}</Label>
        </LabelSection>
        <ValueSection>
          <Value>{name}</Value>
        </ValueSection>
      </DataRow>

      {address && (address.street || address.locationData?.cityName) && (
        <DataRow>
          <LabelSection>
            <IconWrapper><MapPin size={16} /></IconWrapper>
            <Label>{language === 'bg' ? 'Адрес' : 'Address'}</Label>
          </LabelSection>
          <ValueSection>
            <Value>
              {address.street && <div>{address.street}</div>}
              {(address.postalCode || address.locationData?.cityName) && (
                <div>
                  {address.postalCode} {address.locationData?.cityName}
                </div>
              )}
            </Value>
          </ValueSection>
        </DataRow>
      )}

      {phoneNumber && (
        <DataRow>
          <LabelSection>
            <IconWrapper><Phone size={16} /></IconWrapper>
            <Label>{language === 'bg' ? 'Телефонен номер' : 'Phone number'}</Label>
          </LabelSection>
          <ValueSection>
            <Value>{phoneNumber}</Value>
            <VerificationBadge 
              verified={phoneVerified} 
              type="phone"
              onVerify={onVerifyPhone}
              inline
            />
          </ValueSection>
        </DataRow>
      )}

      {phoneNumber && !phoneVerified && (
        <InfoBox>
          <AlertCircle size={16} />
          <InfoText>
            {language === 'bg'
              ? 'Активирайте допълнителни функции: Потвърдете телефонния номер сега'
              : 'Activate additional functions: Confirm phone number now'}
          </InfoText>
        </InfoBox>
      )}
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

const Value = styled.div`
  font-size: 0.9375rem;
  color: #212529;
  font-weight: 500;
  
  div {
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  color: #0066cc;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 10px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const InfoText = styled.span`
  font-size: 0.875rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
`;

export default ContactDataCard;

