import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Shield, X, Check, Loader, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { twoFactorAuthService } from '../services/security/two-factor-auth.service';
import { useTheme } from '../contexts/ThemeContext';

interface MFAChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    verificationId?: string; // Optional if handled internally
}

const ModalOverlay = styled.div<{ $isOpen: boolean; $isDark: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ $isDark }) => ($isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.7)')};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div<{ $isDark: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#252936' : '#ffffff')};
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: ${({ $isDark }) =>
        $isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.6)'
            : '0 20px 60px rgba(0, 0, 0, 0.3)'};
  animation: slideUp 0.3s ease;
  border: ${({ $isDark }) => ($isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none')};

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.button<{ $isDark: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${({ $isDark }) => ($isDark ? '#d1d5db' : '#718096')};

  &:hover {
    background: ${({ $isDark }) =>
        $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    border-radius: 50%;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 16px;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
`;

const Title = styled.h2<{ $isDark: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ $isDark }) => ($isDark ? '#f9fafb' : '#1a202c')};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p<{ $isDark: boolean }>`
  color: ${({ $isDark }) => ($isDark ? '#d1d5db' : '#718096')};
  font-size: 14px;
  text-align: center;
  margin: 0;
`;

const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px;
  border: 2px solid ${({ $isDark }) => ($isDark ? '#4b5563' : '#e2e8f0')};
  border-radius: 8px;
  font-size: 18px;
  text-align: center;
  letter-spacing: 4px;
  background: ${({ $isDark }) => ($isDark ? '#374151' : '#ffffff')};
  color: ${({ $isDark }) => ($isDark ? '#f9fafb' : '#1a202c')};
  margin-bottom: 24px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px ${({ $isDark }) =>
        $isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const Button = styled.button<{ $isDark: boolean }>`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const MFAChallengeModal: React.FC<MFAChallengeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { language } = useLanguage();
    const { theme } = useTheme();
    // Simple check for dark mode based on theme context or class
    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark-theme');

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (code.length < 6) return;

        setLoading(true);
        setError('');

        try {
            const result = await twoFactorAuthService.verifyMFAChallenge(code);
            if (result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay $isOpen={isOpen} $isDark={isDark}>
            <ModalContent $isDark={isDark}>
                <CloseButton $isDark={isDark} onClick={onClose}>
                    <X size={24} />
                </CloseButton>

                <Header>
                    <IconWrapper>
                        <Shield size={32} />
                    </IconWrapper>
                    <Title $isDark={isDark}>
                        {language === 'bg' ? 'Двуфакторна защита' : 'Two-Factor Authentication'}
                    </Title>
                    <Subtitle $isDark={isDark}>
                        {language === 'bg'
                            ? 'Въведете кода, изпратен на вашия телефон'
                            : 'Enter the verification code sent to your phone'}
                    </Subtitle>
                </Header>

                {error && (
                    <ErrorMessage>
                        <AlertCircle size={16} />
                        {error}
                    </ErrorMessage>
                )}

                <Input
                    $isDark={isDark}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                />

                <Button
                    $isDark={isDark}
                    onClick={handleVerify}
                    disabled={loading || code.length < 6}
                >
                    {loading ? (
                        <>
                            <Loader size={18} className="spin" />
                            {language === 'bg' ? 'Проверка...' : 'Verifying...'}
                        </>
                    ) : (
                        <>
                            <Check size={18} />
                            {language === 'bg' ? 'Потвърди' : 'Verify'}
                        </>
                    )}
                </Button>
            </ModalContent>
        </ModalOverlay>
    );
};

export default MFAChallengeModal;
