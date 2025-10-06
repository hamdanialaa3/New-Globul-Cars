// src/components/Profile/VerificationPanel.tsx
// Verification Panel Component - عرض التحققات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { Mail, Phone, IdCard, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  PhoneVerificationModal, 
  IDVerificationModal,
  EmailVerificationModal,
  BusinessVerificationModal 
} from '../Verification';

// ==================== STYLED COMPONENTS ====================

const PanelContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }
`;

const VerificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const VerificationItem = styled.div<{ $verified: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${props => props.$verified ? '#f1f8e9' : '#fff3e0'};
  border-radius: 8px;
  border: 1px solid ${props => props.$verified ? '#c5e1a5' : '#ffe082'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const IconWrapper = styled.div<{ $verified: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$verified ? '#4caf50' : '#ff9800'};
  color: white;
`;

const ItemText = styled.div`
  h4 {
    margin: 0 0 4px 0;
    font-size: 0.95rem;
    color: #333;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
  }
`;

const StatusBadge = styled.div<{ $status: 'verified' | 'pending' | 'unverified' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => {
    switch (props.$status) {
      case 'verified':
        return `
          background: #4caf50;
          color: white;
        `;
      case 'pending':
        return `
          background: #ff9800;
          color: white;
        `;
      case 'unverified':
        return `
          background: #e0e0e0;
          color: #666;
        `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: #FF7900;
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(255, 121, 0, 0.2);
  
  &:hover {
    background: #ff8c1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 121, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(255, 121, 0, 0.2);
  }
`;

// ==================== COMPONENT ====================

interface VerificationPanelProps {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  businessVerified: boolean;
  onVerifyClick?: (type: string) => void;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
  emailVerified,
  phoneVerified,
  idVerified,
  businessVerified,
  onVerifyClick
}) => {
  const { language } = useLanguage();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  const handleVerify = (type: string) => {
    if (type === 'email') {
      setShowEmailModal(true);
    } else if (type === 'phone') {
      setShowPhoneModal(true);
    } else if (type === 'identity') {
      setShowIDModal(true);
    } else if (type === 'business') {
      setShowBusinessModal(true);
    }
    onVerifyClick?.(type);
  };

  const verifications = [
    {
      id: 'email',
      icon: <Mail size={20} />,
      title: language === 'bg' ? 'Имейл' : 'Email',
      description: language === 'bg' ? 'Потвърдете имейл адреса си' : 'Verify your email address',
      verified: emailVerified,
      canVerify: !emailVerified
    },
    {
      id: 'phone',
      icon: <Phone size={20} />,
      title: language === 'bg' ? 'Телефон' : 'Phone',
      description: language === 'bg' ? 'Потвърдете телефонния си номер' : 'Verify your phone number',
      verified: phoneVerified,
      canVerify: !phoneVerified
    },
    {
      id: 'identity',
      icon: <IdCard size={20} />,
      title: language === 'bg' ? 'Самоличност' : 'Identity',
      description: language === 'bg' ? 'Потвърдете самоличността си' : 'Verify your identity',
      verified: idVerified,
      canVerify: !idVerified
    },
    {
      id: 'business',
      icon: <Building size={20} />,
      title: language === 'bg' ? 'Бизнес' : 'Business',
      description: language === 'bg' ? 'Потвърдете бизнес акаунта си' : 'Verify your business account',
      verified: businessVerified,
      canVerify: !businessVerified
    }
  ];

  return (
    <>
      <PanelContainer>
        <PanelHeader>
          <CheckCircle size={22} color="#FF7900" />
          <h3>
            {language === 'bg' ? 'Потвърждения' : 'Verifications'}
          </h3>
        </PanelHeader>

        <VerificationList>
          {verifications.map((item) => (
            <VerificationItem key={item.id} $verified={item.verified}>
              <ItemInfo>
                <IconWrapper $verified={item.verified}>
                  {item.icon}
                </IconWrapper>
                <ItemText>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </ItemText>
              </ItemInfo>

              {item.verified ? (
                <StatusBadge $status="verified">
                  <CheckCircle size={14} />
                  {language === 'bg' ? 'Потвърдено' : 'Verified'}
                </StatusBadge>
              ) : (
                <ActionButton onClick={() => handleVerify(item.id)}>
                  {language === 'bg' ? 'Потвърди' : 'Verify'}
                </ActionButton>
              )}
            </VerificationItem>
          ))}
        </VerificationList>
      </PanelContainer>

      {/* Modals */}
      {showEmailModal && (
        <EmailVerificationModal
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            setShowEmailModal(false);
            window.location.reload();
          }}
        />
      )}

      {showPhoneModal && (
        <PhoneVerificationModal
          onClose={() => setShowPhoneModal(false)}
          onSuccess={() => {
            setShowPhoneModal(false);
            window.location.reload();
          }}
        />
      )}

      {showIDModal && (
        <IDVerificationModal
          onClose={() => setShowIDModal(false)}
          onSuccess={() => {
            setShowIDModal(false);
            window.location.reload();
          }}
        />
      )}

      {showBusinessModal && (
        <BusinessVerificationModal
          onClose={() => setShowBusinessModal(false)}
          onSuccess={() => {
            setShowBusinessModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default VerificationPanel;