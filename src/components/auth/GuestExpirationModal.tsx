import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AlertTriangle, UserPlus, Clock, X } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div<{ $isDark: boolean }>`
  width: 90%;
  max-width: 450px;
  background: ${props => props.$isDark ? '#1e1e1e' : '#ffffff'};
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  text-align: center;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid ${props => props.$isDark ? '#333' : '#eee'};

  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const CloseButton = styled.button<{ $isDark: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${props => props.$isDark ? '#888' : '#666'};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDark ? '#333' : '#f5f5f5'};
    color: ${props => props.$isDark ? '#fff' : '#000'};
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff4e5;
  color: #ff9800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 2px dashed #ff9800;
    opacity: 0.3;
    animation: spin 10s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${props => props.$isDark ? '#ffffff' : '#1a1a1a'};
`;

const Description = styled.p<{ $isDark: boolean }>`
  font-size: 16px;
  line-height: 1.5;
  color: ${props => props.$isDark ? '#a0a0a0' : '#666666'};
  margin-bottom: 24px;
`;

const ExpiryDate = styled.div`
  background: rgba(255, 152, 0, 0.1);
  color: #f57c00;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button<{ $isDark: boolean }>`
  background: transparent;
  color: ${props => props.$isDark ? '#888' : '#666'};
  border: 1px solid ${props => props.$isDark ? '#333' : '#e0e0e0'};
  padding: 14px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: ${props => props.$isDark ? '#333' : '#f5f5f5'};
    color: ${props => props.$isDark ? '#fff' : '#000'};
    border-color: ${props => props.$isDark ? '#555' : '#ccc'};
  }
`;

export const GuestExpirationModal: React.FC = () => {
    const { currentUser, isGuest } = useAuth();
    const { language } = useLanguage();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const isDark = theme === 'dark';

    // Check if we should show the modal
    useEffect(() => {
        if (isGuest && currentUser) {
            // Check if we've already shown it this session
            const sessionKey = `guest_warning_shown_${currentUser.uid}`;
            const hasShown = sessionStorage.getItem(sessionKey);

            if (!hasShown) {
                // Delay slightly for better UX
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem(sessionKey, 'true');
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [isGuest, currentUser]);

    if (!isOpen || !currentUser) return null;

    // Calculate expiration date (User creation + 7 days)
    const creationTime = currentUser.metadata.creationTime
        ? new Date(currentUser.metadata.creationTime)
        : new Date();

    const expiryDate = addDays(creationTime, 7);
    const daysLeft = Math.max(0, differenceInDays(expiryDate, new Date()));

    const handleLinkAccount = () => {
        setIsOpen(false);
        // Navigate to settings with 'focus' param to highlight inputs
        navigate('/profile/settings?section=account&focus=credentials');
    };

    const handleContinueAsGuest = () => {
        setIsOpen(false);
    };

    return (
        <Overlay>
            <ModalContainer $isDark={isDark}>
                <CloseButton $isDark={isDark} onClick={handleContinueAsGuest}>
                    <X size={24} />
                </CloseButton>

                <IconWrapper>
                    <AlertTriangle size={40} />
                </IconWrapper>

                <Title $isDark={isDark}>
                    {language === 'bg' ? 'Внимание: Профил за гости' : 'Guest Account Warning'}
                </Title>

                <Description $isDark={isDark}>
                    {language === 'bg'
                        ? 'Вие използвате временен профил. Този акаунт ще бъде автоматично изтрит след 7 дни, ако не бъде свързан с имейл или телефон.'
                        : 'You are using a temporary guest profile. This account will be automatically deleted after 7 days unless linked to an email or phone number.'}
                </Description>

                <ExpiryDate>
                    <Clock size={18} />
                    {language === 'bg'
                        ? `Остават ${daysLeft} дни (до ${format(expiryDate, 'dd.MM.yyyy')})`
                        : `${daysLeft} days remaining (until ${format(expiryDate, 'dd.MM.yyyy')})`}
                </ExpiryDate>

                <ButtonGroup>
                    <PrimaryButton onClick={handleLinkAccount}>
                        <UserPlus size={20} />
                        {language === 'bg' ? 'Свържи профил сега' : 'Link Account Now'}
                    </PrimaryButton>

                    <SecondaryButton $isDark={isDark} onClick={handleContinueAsGuest}>
                        {language === 'bg' ? 'Продължи като гост' : 'Continue as Guest'}
                    </SecondaryButton>
                </ButtonGroup>
            </ModalContainer>
        </Overlay>
    );
};

export default GuestExpirationModal;
