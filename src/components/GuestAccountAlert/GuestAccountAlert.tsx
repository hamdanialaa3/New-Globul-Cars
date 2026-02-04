import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

interface AlertData {
  title: string;
  description: string;
  button: string;
  subtext: string;
}

const translations: Record<string, AlertData> = {
  en: {
    title: 'Complete Your Profile',
    description: 'Your account is currently unverified. Complete your profile information to build trust with other users.',
    button: 'Complete Profile',
    subtext: 'Guest accounts may not be trusted by other users.'
  },
  bg: {
    title: 'Попълнете профила си',
    description: 'Вашият акаунт е в момента непроверен. Попълнете информацията на профила си, за да изградите доверие с други потребители.',
    button: 'Попълнете профила',
    subtext: 'Гост акаунтите може да не бъдат доверявани от други потребители.'
  },
  ar: {
    title: 'أكمل ملفك الشخصي',
    description: 'حسابك غير مُتحقق حالياً. أكمل معلومات ملفك الشخصي لبناء الثقة مع المستخدمين الآخرين.',
    button: 'أكمل الملف الشخصي',
    subtext: 'قد لا يثق المستخدمون الآخرون بحسابات الضيف.'
  }
};

const AlertContainer = styled.div<{ $visible: boolean; $theme: string }>`
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: linear-gradient(135deg, 
    ${props => props.$theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)'} 0%,
    ${props => props.$theme === 'dark' ? 'rgba(255, 193, 7, 0.12)' : 'rgba(255, 193, 7, 0.08)'} 100%
  );
  border-left: 4px solid #FF9800;
  border-radius: 0 8px 8px 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$theme === 'dark' 
    ? 'rgba(255, 152, 0, 0.3)' 
    : 'rgba(255, 152, 0, 0.2)'};
  box-shadow: 0 4px 12px ${props => props.$theme === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 152, 0, 0.1)'};

  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 12px;
    border-radius: 0 6px 6px 0;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #FF9800;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  font-weight: bold;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AlertTitle = styled.h3<{ $theme: string }>`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$theme === 'dark' ? '#F0F0F0' : '#1A1A1B'};
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const AlertDescription = styled.p<{ $theme: string }>`
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: ${props => props.$theme === 'dark' ? '#D0D0D0' : '#555555'};
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const AlertSubtext = styled.p<{ $theme: string }>`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: ${props => props.$theme === 'dark' ? '#A0A0A0' : '#888888'};
  line-height: 1.4;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const CompleteButton = styled.button`
  padding: 8px 16px;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;

  &:hover {
    background: #F57C00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 7px 14px;
    font-size: 13px;
  }
`;

const CloseButton = styled.button<{ $theme: string }>`
  padding: 6px 8px;
  background: transparent;
  color: ${props => props.$theme === 'dark' ? '#A0A0A0' : '#999999'};
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.$theme === 'dark' ? '#FF9800' : '#FF9800'};
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    padding: 4px 6px;
    font-size: 16px;
  }
`;

interface GuestAccountAlertProps {
  dismissible?: boolean;
}

export const GuestAccountAlert: React.FC<GuestAccountAlertProps> = ({ dismissible = true }) => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userNumericId, setUserNumericId] = useState<number | null>(null);

  useEffect(() => {
    const checkGuestStatus = async () => {
      if (!currentUser) {
        console.log('[GuestAlert] No current user');
        setIsGuest(false);
        return;
      }

      console.log('[GuestAlert] Checking guest status for user:', currentUser.uid);

      // Check if user is anonymous (Firebase guest)
      if (currentUser.isAnonymous) {
        console.log('[GuestAlert] User is anonymous (Firebase guest)');
        setIsGuest(true);
        setUserId(currentUser.uid);
        return;
      }

      // Check Firestore for guest account type
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const guestStatus = userData.isGuest === true || userData.accountType === 'guest';
          console.log('[GuestAlert] User data from Firestore:', {
            isGuest: userData.isGuest,
            accountType: userData.accountType,
            guestStatus
          });
          setIsGuest(guestStatus);
          setUserId(currentUser.uid);
          setUserNumericId(userData.numericId || null);
        } else {
          console.log('[GuestAlert] User document does not exist in Firestore');
        }
      } catch (error) {
        console.error('[GuestAlert] Error checking guest status:', error);
      }
    };

    checkGuestStatus();
  }, [currentUser]);

  const handleCompleteProfile = () => {
    if (userNumericId) {
      navigate(`/profile/${userNumericId}/settings`);
    } else if (userId) {
      // Fallback to Firebase UID if numeric ID not available
      navigate(`/profile/${userId}/settings`);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage for session
    sessionStorage.setItem('guest-alert-dismissed', 'true');
  };

  // Check if was dismissed in this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('guest-alert-dismissed') === 'true';
    if (wasDismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!isGuest || isDismissed || !userId) {
    // 🔧 DEVELOPMENT MODE: Uncomment to always show alert for testing
    // console.log('[GuestAlert] Not showing alert:', { isGuest, isDismissed, userId });
    return null;
  }

  console.log('[GuestAlert] Showing guest alert!');

  const lang = (language as 'en' | 'bg' | 'ar') || 'en';
  const strings = translations[lang] || translations.en;
  const currentTheme = theme as 'dark' | 'light';

  return (
    <AlertContainer $visible={true} $theme={currentTheme}>
      <IconWrapper>
        ⓘ
      </IconWrapper>
      <ContentWrapper>
        <AlertTitle $theme={currentTheme}>
          {strings.title}
        </AlertTitle>
        <AlertDescription $theme={currentTheme}>
          {strings.description}
        </AlertDescription>
        <AlertSubtext $theme={currentTheme}>
          {strings.subtext}
        </AlertSubtext>
      </ContentWrapper>
      <ActionWrapper>
        <CompleteButton onClick={handleCompleteProfile}>
          {strings.button}
        </CompleteButton>
        {dismissible && (
          <CloseButton $theme={currentTheme} onClick={handleDismiss} aria-label="Close alert">
            ✕
          </CloseButton>
        )}
      </ActionWrapper>
    </AlertContainer>
  );
};

export default GuestAccountAlert;
