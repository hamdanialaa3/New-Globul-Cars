// src/components/Profile/VerificationPanel.tsx
// Verification Panel Component - لوحة التحقق
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { Mail, Phone, IdCard, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ==================== STYLED COMPONENTS ====================

const PanelContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
  }
`;

const VerificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VerificationItem = styled.div<{ $verified: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.$verified ? '#f0f9ff' : '#f9f9f9'};
  border: 1px solid ${props => props.$verified ? '#4CAF50' : '#e0e0e0'};
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const IconContainer = styled.div<{ $verified: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$verified ? '#4CAF50' : '#ccc'};
  color: white;
`;

const ItemInfo = styled.div`
  flex: 1;
  
  .item-title {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    margin-bottom: 4px;
  }
  
  .item-description {
    font-size: 0.875rem;
    color: #666;
  }
`;

const StatusBadge = styled.div<{ $status: 'verified' | 'pending' | 'unverified' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'verified':
        return `
          background: #e8f5e9;
          color: #4CAF50;
        `;
      case 'pending':
        return `
          background: #fff3e0;
          color: #FF9800;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #999;
        `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #FF7900;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ff8c1a;
  }
`;

// ==================== COMPONENT ====================

interface VerificationPanelProps {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  businessVerified: boolean;
  onVerifyClick?: (type: 'phone' | 'id' | 'business') => void;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
  emailVerified,
  phoneVerified,
  idVerified,
  businessVerified,
  onVerifyClick
}) => {
  const { language } = useLanguage();

  const verifications = [
    {
      id: 'email',
      icon: Mail,
      title: language === 'bg' ? 'Имейл' : 'Email',
      description: language === 'bg' 
        ? 'Потвърдете вашия имейл адрес' 
        : 'Verify your email address',
      verified: emailVerified,
      action: null
    },
    {
      id: 'phone',
      icon: Phone,
      title: language === 'bg' ? 'Телефон' : 'Phone',
      description: language === 'bg'
        ? 'Потвърдете телефонен номер (+359)'
        : 'Verify phone number (+359)',
      verified: phoneVerified,
      action: 'phone'
    },
    {
      id: 'id',
      icon: IdCard,
      title: language === 'bg' ? 'Самоличност' : 'Identity',
      description: language === 'bg'
        ? 'Качете лична карта за потвърждение'
        : 'Upload ID card for verification',
      verified: idVerified,
      action: 'id'
    },
    {
      id: 'business',
      icon: Building,
      title: language === 'bg' ? 'Фирма' : 'Business',
      description: language === 'bg'
        ? 'Потвърдете фирмена регистрация'
        : 'Verify business registration',
      verified: businessVerified,
      action: 'business'
    }
  ];

  const getStatusIcon = (verified: boolean) => {
    if (verified) return <CheckCircle size={18} />;
    return <Clock size={18} />;
  };

  const getStatusText = (verified: boolean) => {
    if (verified) {
      return language === 'bg' ? 'Потвърдено' : 'Verified';
    }
    return language === 'bg' ? 'Непотвърдено' : 'Not Verified';
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <h3>{language === 'bg' ? 'Потвърждение' : 'Verification'}</h3>
        <p>
          {language === 'bg'
            ? 'Потвърдете акаунта си за по-висока степен на доверие'
            : 'Verify your account for higher trust level'}
        </p>
      </PanelHeader>

      <VerificationList>
        {verifications.map(item => (
          <VerificationItem key={item.id} $verified={item.verified}>
            <ItemLeft>
              <IconContainer $verified={item.verified}>
                <item.icon size={20} />
              </IconContainer>
              
              <ItemInfo>
                <div className="item-title">{item.title}</div>
                <div className="item-description">{item.description}</div>
              </ItemInfo>
            </ItemLeft>

            {item.verified ? (
              <StatusBadge $status="verified">
                {getStatusIcon(true)}
                {getStatusText(true)}
              </StatusBadge>
            ) : item.action ? (
              <ActionButton onClick={() => onVerifyClick?.(item.action as any)}>
                {language === 'bg' ? 'Потвърди' : 'Verify'}
              </ActionButton>
            ) : (
              <StatusBadge $status="unverified">
                {getStatusIcon(false)}
                {getStatusText(false)}
              </StatusBadge>
            )}
          </VerificationItem>
        ))}
      </VerificationList>
    </PanelContainer>
  );
};

export default VerificationPanel;
