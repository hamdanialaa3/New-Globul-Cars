
import React from 'react';
import styled from 'styled-components';
import { ShieldCheck, Users, Clock, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const TrustContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem 0;
  width: 100%;
  color: white;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    justify-content: center;
  }
`;

const TrustItem = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.$isDark
    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 165, 0, 0.12) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(250, 252, 255, 0.15) 100%)'};
  padding: 0.875rem 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: ${props => props.$isDark
    ? '1px solid rgba(255, 215, 0, 0.2)'
    : '1px solid rgba(255, 255, 255, 0.25)'};
  box-shadow: ${props => props.$isDark
    ? '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--btn-primary-bg);
    transition: left 0.6s ease;
  }

  &:hover {
    background: ${props => props.$isDark
      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(237, 233, 233, 0.25) 0%, rgba(250, 252, 255, 0.25) 100%)'};
    border-color: ${props => props.$isDark
      ? 'rgba(255, 215, 0, 0.4)'
      : 'rgba(255, 255, 255, 0.4)'};
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${props => props.$isDark
      ? '0 8px 30px rgba(255, 215, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      : '0 8px 30px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1);
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.625rem 1.25rem;
    gap: 0.5rem;
  }
`;

const IconWrapper = styled.div<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#FFD700' : 'var(--accent-primary)'};
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  filter: ${props => props.$isDark 
    ? 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))' 
    : 'drop-shadow(0 2px 4px rgba(255, 143, 16, 0.3))'};

  ${TrustItem}:hover & {
    color: ${props => props.$isDark ? '#FFA500' : '#FFD700'};
    transform: scale(1.1) rotate(5deg);
    filter: ${props => props.$isDark 
      ? 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.6))' 
      : 'drop-shadow(0 4px 8px rgba(255, 143, 16, 0.5))'};
  }
`;

const Text = styled.span<{ $isDark: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  text-shadow: ${props => props.$isDark
    ? '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;

  ${TrustItem}:hover & {
    text-shadow: ${props => props.$isDark
      ? '0 4px 12px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.4)'
      : '0 4px 12px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)'};
  }
`;

const TrustIndicators: React.FC = () => {
    const { language } = useLanguage();
    const { theme } = useTheme();
    const isBg = language === 'bg';
    const isDark = theme === 'dark';

    return (
        <TrustContainer>
            <TrustItem $isDark={isDark}>
                <IconWrapper $isDark={isDark}><ShieldCheck size={22} /></IconWrapper>
                <Text $isDark={isDark}>{isBg ? 'Проверени Продавачи' : 'Verified Sellers'}</Text>
            </TrustItem>

            <TrustItem $isDark={isDark}>
                <IconWrapper $isDark={isDark}><Users size={22} /></IconWrapper>
                <Text $isDark={isDark}>{isBg ? 'Сигурни Сделки' : 'Secure Transactions'}</Text>
            </TrustItem>

            <TrustItem $isDark={isDark}>
                <IconWrapper $isDark={isDark}><Clock size={22} /></IconWrapper>
                <Text $isDark={isDark}>{isBg ? 'Ежедневни Обяви' : 'Daily New Ads'}</Text>
            </TrustItem>

            <TrustItem $isDark={isDark}>
                <IconWrapper $isDark={isDark}><Award size={22} /></IconWrapper>
                <Text $isDark={isDark}>{isBg ? '#1 в България' : '#1 in Bulgaria'}</Text>
            </TrustItem>
        </TrustContainer>
    );
};

export default TrustIndicators;
