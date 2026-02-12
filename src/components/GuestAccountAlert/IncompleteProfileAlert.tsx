/**
 * Incomplete Profile Alert Component
 * 
 * Shows only for users who:
 * - Don't have a verified email
 * - Don't have a displayName
 * - Guest/anonymous account
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '@/services/logger-service';

interface AlertData {
  title: string;
  description: string;
  button: string;
  subtext: string;
}

const translations: Record<string, AlertData> = {
  en: {
    title: '⚠️ Complete Your Profile',
    description: 'Your profile is incomplete. Add your name and verify your email to build trust with other users.',
    button: 'Complete Profile Now',
    subtext: 'Incomplete profiles may not be trusted by other users.'
  },
  bg: {
    title: '⚠️ Попълнете профила си',
    description: 'Вашият профил е непълен. Добавете името си и потвърдете имейла, за да изградите доверие.',
    button: 'Попълнете профила сега',
    subtext: 'Непълните профили може да не бъдат доверявани от други потребители.'
  },

};

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const AlertContainer = styled.div<{ $theme: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: linear-gradient(135deg, 
    ${props => props.$theme === 'dark' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.12)'} 0%,
    ${props => props.$theme === 'dark' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(255, 193, 7, 0.08)'} 100%
  );
  border-left: 5px solid #FF9800;
  border-bottom: 1px solid ${props => props.$theme === 'dark' 
    ? 'rgba(255, 152, 0, 0.4)' 
    : 'rgba(255, 152, 0, 0.3)'};
  width: 100%;
  box-sizing: border-box;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px ${props => props.$theme === 'dark'
    ? 'rgba(0, 0, 0, 0.4)'
    : 'rgba(255, 152, 0, 0.15)'};
  animation: ${slideIn} 0.4s ease-out;

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-radius: 50%;
  color: white;
  font-size: 16px;
  box-shadow: 0 3px 10px rgba(255, 152, 0, 0.4);

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 150px;
`;

const AlertTitle = styled.h3<{ $theme: string }>`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$theme === 'dark' ? '#FFFFFF' : '#1A1A1B'};
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const AlertDescription = styled.p<{ $theme: string }>`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: ${props => props.$theme === 'dark' ? '#E0E0E0' : '#444444'};
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const AlertSubtext = styled.p<{ $theme: string }>`
  margin: 0;
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.$theme === 'dark' ? '#FF9800' : '#E65100'};
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 9px;
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
  }
  50% {
    box-shadow: 0 4px 25px rgba(255, 152, 0, 0.6);
  }
`;

const CompleteButton = styled.button`
  padding: 7px 14px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${pulse} 2s ease-in-out infinite;

  &:hover {
    background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.5);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 10px;
  }
`;

const CloseButton = styled.button<{ $theme: string }>`
  padding: 0;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  background: transparent;
  color: ${props => props.$theme === 'dark' ? '#A0A0A0' : '#888888'};
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    color: ${props => props.$theme === 'dark' ? '#FF9800' : '#F57C00'};
    background: ${props => props.$theme === 'dark' 
      ? 'rgba(255, 152, 0, 0.1)' 
      : 'rgba(255, 152, 0, 0.1)'};
    transform: rotate(90deg);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
  }
`;

export const IncompleteProfileAlert: React.FC = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [userNumericId, setUserNumericId] = useState<number | null>(null);

  useEffect(() => {
    const checkProfileCompleteness = async () => {
      // لا يوجد مستخدم = لا نعرض
      if (!currentUser) {
        setShowAlert(false);
        return;
      }

      // ✅ ALWAYS fetch user data from Firestore first to get numericId
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Save numeric ID for navigation - ALWAYS do this first
          setUserNumericId(userData.numericId || null);

          // ✅ CHECK 1: Firebase Anonymous User (Guest)
          if (currentUser.isAnonymous) {
            setShowAlert(true);
            return;
          }

          // ✅ CHECK 2: Guest account type in Firestore
          if (userData.isGuest === true || userData.accountType === 'guest') {
            setShowAlert(true);
            return;
          }

          // ✅ CHECK 3: No email or unverified email
          const hasNoEmail = !userData.email && !currentUser.email;
          if (hasNoEmail || !currentUser.emailVerified) {
            setShowAlert(true);
            return;
          }

          // ✅ CHECK 4: No display name
          const hasNoName = !userData.displayName && !userData.firstName && !currentUser.displayName;
          if (hasNoName) {
            setShowAlert(true);
            return;
          }

          // If all checks pass, don't show alert
          setShowAlert(false);
        } else {
          // No user doc exists - treat as incomplete
          if (currentUser.isAnonymous) {
            setShowAlert(true);
          }
        }
      } catch (error) {
        logger.error('[IncompleteProfileAlert] Error checking profile:', error);
      }
    };

    checkProfileCompleteness();
  }, [currentUser]);

  // Check session storage for dismissal
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('incomplete-profile-dismissed') === 'true';
    if (wasDismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleCompleteProfile = () => {
    // Navigate to user's settings page using numeric ID
    if (userNumericId) {
      navigate(`/profile/${userNumericId}/settings`);
    } else {
      // Fallback: try to get numeric ID from URL or use default
      navigate('/profile/settings');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('incomplete-profile-dismissed', 'true');
  };

  // Don't render if dismissed or shouldn't show
  if (isDismissed || !showAlert || !currentUser) {
    return null;
  }

  const lang = (language as 'en' | 'bg' | 'ar') || 'en';
  const strings = translations[lang] || translations.en;
  const currentTheme = theme as 'dark' | 'light';

  return (
    <AlertContainer $theme={currentTheme}>
      <IconWrapper>
        👤
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
        <CloseButton 
          $theme={currentTheme} 
          onClick={handleDismiss} 
          aria-label="Dismiss alert"
          title="Dismiss"
        >
          ✕
        </CloseButton>
      </ActionWrapper>
    </AlertContainer>
  );
};

export default IncompleteProfileAlert;
