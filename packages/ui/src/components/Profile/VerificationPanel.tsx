// src/components/Profile/VerificationPanel.tsx
// Verification Panel Component - عرض التحققات
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { Mail, Phone, IdCard, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { 
  PhoneVerificationModal, 
  IDVerificationModal,
  EmailVerificationModal,
  BusinessVerificationModal 
} from '../Verification';

// ==================== ANIMATIONS ====================

import { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulseIcon = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

// ==================== STYLED COMPONENTS ====================

const PanelContainer = styled.div<{ $themeColor?: string }>`
  border-radius: 16px;
  padding: 24px;
  position: relative;
  
  /* 🎨 Premium Glass */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(252, 253, 254, 0.82) 100%
  );
  backdrop-filter: blur(14px) saturate(160%);
  
  /* Subtle theme border */
  border: ${props => props.$themeColor ? `2px solid ${props.$themeColor}26` : '2px solid rgba(255, 143, 16, 0.15)'};
  
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 6px 24px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.03);
`;

const PanelHeader = styled.div<{ $themeColor?: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  
  /* Theme gradient border */
  border-bottom: 2px solid transparent;
  background-image: 
    linear-gradient(white, white),
    ${props => props.$themeColor 
      ? `linear-gradient(90deg, rgba(200, 200, 200, 0.2) 0%, ${props.$themeColor}80 30%, ${props.$themeColor}CC 50%, ${props.$themeColor}80 70%, rgba(200, 200, 200, 0.2) 100%)`
      : 'linear-gradient(90deg, rgba(200, 200, 200, 0.2) 0%, rgba(255, 143, 16, 0.5) 30%, rgba(255, 215, 0, 0.8) 50%, rgba(255, 143, 16, 0.5) 70%, rgba(200, 200, 200, 0.2) 100%)'};
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    
    /* Gradient text */
    background: linear-gradient(135deg, #212529 0%, #495057 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  svg {
    filter: ${props => props.$themeColor 
      ? `drop-shadow(0 2px 4px ${props.$themeColor}4D)`
      : 'drop-shadow(0 2px 4px rgba(255, 143, 16, 0.3))'};
  }
`;

const VerificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VerificationItem = styled.div<{ $verified: boolean; $themeColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  
  /* 🎨 IMPROVED: Verified = Bright Green, Unverified = Bright Red */
  background: ${props => props.$verified 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(22, 163, 74, 0.12) 100%)' /* ✅ Bright green glow */
    : 'linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(200, 35, 51, 0.10) 100%)' /* ❌ Bright red fade */
  };
  backdrop-filter: blur(8px);
  
  border: 1.5px solid ${props => props.$verified 
    ? 'rgba(34, 197, 94, 0.4)' /* ✅ Bright green border */
    : 'rgba(220, 53, 69, 0.4)' /* ❌ Bright red border */
  };
  
  box-shadow: ${props => props.$verified
    ? '0 4px 16px rgba(34, 197, 94, 0.15), 0 0 20px rgba(34, 197, 94, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)' /* ✅ Green glow */
    : '0 3px 10px rgba(220, 53, 69, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)' /* ❌ Bright red shadow */
  };
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 🎨 Left accent stripe - Green for verified, Red for unverified */
  border-left: 4px solid ${props => props.$verified 
    ? 'rgba(34, 197, 94, 0.8)' /* ✅ Bright green stripe */
    : 'rgba(220, 53, 69, 0.7)' /* ❌ Bright red stripe */
  };
  
  &:hover {
    transform: translateX(6px) translateY(-2px);
    border-color: ${props => props.$verified 
      ? 'rgba(34, 197, 94, 0.6)' /* ✅ Brighter green on hover */
      : 'rgba(220, 53, 69, 0.5)' /* ❌ Brighter red on hover */
    };
    box-shadow: ${props => props.$verified
      ? '0 6px 24px rgba(34, 197, 94, 0.25), 0 0 30px rgba(34, 197, 94, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)' /* ✅ Enhanced green glow */
      : '0 6px 18px rgba(220, 53, 69, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)' /* ❌ Bright red glow */
    };
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
`;

const IconWrapper = styled.div<{ $verified: boolean; $themeColor?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  
  /* 🎨 IMPROVED: Bright Green for verified, Bright Red for unverified */
  background: ${props => props.$verified 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 1) 0%, rgba(22, 163, 74, 1) 100%)' /* ✅ Bright vibrant green */
    : 'linear-gradient(135deg, rgba(220, 53, 69, 1) 0%, rgba(200, 35, 51, 1) 100%)' /* ❌ Bright red */
  };
  
  color: white;
  
  box-shadow: 
    0 4px 14px ${props => props.$verified 
      ? 'rgba(34, 197, 94, 0.5)' /* ✅ Bright green glow */
      : 'rgba(220, 53, 69, 0.4)' /* ❌ Bright red shadow */
    },
    ${props => props.$verified
      ? '0 0 20px rgba(34, 197, 94, 0.3)' /* ✅ Extra green LED glow */
      : '0 0 16px rgba(220, 53, 69, 0.3)' /* ❌ Bright red glow */
    },
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  transition: all 0.3s ease;
  
  /* ❌ REMOVED: Bottom accent - cleaner look */
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    /* ⚡ OPTIMIZED: Simple scale instead of infinite pulse */
    transform: scale(1.1);
    transition: transform 0.3s ease;
  }
`;

const ItemText = styled.div<{ $verified: boolean }>`
  h4 {
    margin: 0 0 5px 0;
    font-size: 1rem;
    font-weight: 700;
    color: ${props => props.$verified 
      ? '#22c55e' /* ✅ Bright green text for verified */
      : '#dc3545' /* ❌ Bright red text for unverified */
    };
    letter-spacing: 0.2px;
    text-shadow: ${props => props.$verified
      ? '0 0 10px rgba(34, 197, 94, 0.3)' /* ✅ Green glow */
      : 'none' /* ❌ No glow for unverified */
    };
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: ${props => props.$verified 
      ? '#16a34a' /* ✅ Dark green for verified description */
      : '#c82333' /* ❌ Bright dark red for unverified description */
    };
    font-weight: 500;
  }
`;

const StatusBadge = styled.div<{ $status: 'verified' | 'pending' | 'unverified' }>`
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: 0.3px;
  
  ${props => {
    switch (props.$status) {
      case 'verified':
        return `
          background: linear-gradient(135deg,
            rgba(34, 197, 94, 1) 0%,
            rgba(22, 163, 74, 1) 100%
          );
          color: white;
          border: 1px solid rgba(34, 197, 94, 0.5);
          box-shadow: 
            0 4px 16px rgba(34, 197, 94, 0.4),
            0 0 20px rgba(34, 197, 94, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        `;
      case 'pending':
        return `
          background: linear-gradient(135deg,
            rgba(255, 152, 0, 0.95) 0%,
            rgba(255, 143, 16, 1) 100%
          );
          color: white;
          border: 1px solid rgba(255, 215, 0, 0.5);
          box-shadow: 
            0 4px 12px rgba(255, 143, 16, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        `;
      case 'unverified':
        return `
          background: linear-gradient(135deg,
            rgba(220, 53, 69, 1) 0%,
            rgba(200, 35, 51, 1) 100%
          );
          color: white;
          border: 1px solid rgba(220, 53, 69, 0.5);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2);
        `;
    }
  }}
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
`;

const ActionButton = styled.button<{ $themeColor?: string }>`
  padding: 9px 18px;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* 🎨 IMPROVED: Bright Red button for unverified items */
  background: linear-gradient(135deg, 
    rgba(220, 53, 69, 1) 0%, 
    rgba(200, 35, 51, 1) 100%
  );
  background-size: 200% auto;
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
  
  box-shadow: 
    0 3px 12px rgba(239, 68, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Shimmer effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 100%
    );
    /* ⚡ OPTIMIZED: Static shimmer - triggers on hover */
    background-size: 200% 100%;
    background-position: 0% 0%;
  }
  
  &:hover::before {
    background-position: 100% 0%;
    transition: background-position 1s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(248, 113, 113, 1) 0%, 
      rgba(239, 68, 68, 1) 100%
    );
    transform: translateY(-2px);
    box-shadow: 
      0 6px 20px rgba(239, 68, 68, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 
      0 2px 8px rgba(239, 68, 68, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
`;

// ==================== COMPONENT ====================

interface VerificationPanelProps {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  businessVerified: boolean;
  onVerifyClick?: (type: string) => void;
  themeColor?: string;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
  emailVerified,
  phoneVerified,
  idVerified,
  businessVerified,
  onVerifyClick,
  themeColor = '#FF7900'
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
      <PanelContainer $themeColor={themeColor}>
        <PanelHeader $themeColor={themeColor}>
          <CheckCircle size={22} color={themeColor} />
          <h3>
            {language === 'bg' ? 'Потвърждения' : 'Verifications'}
          </h3>
        </PanelHeader>

        <VerificationList>
          {verifications.map((item) => (
            <VerificationItem key={item.id} $verified={item.verified} $themeColor={themeColor}>
              <ItemInfo>
                <IconWrapper $verified={item.verified} $themeColor={themeColor}>
                  {item.icon}
                </IconWrapper>
                <ItemText $verified={item.verified}>
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
                <ActionButton onClick={() => handleVerify(item.id)} $themeColor={themeColor}>
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