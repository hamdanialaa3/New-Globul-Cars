import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const SwitcherContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px auto;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: fit-content;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const LangBtn = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'linear-gradient(135deg, #ff8c61 0%, #ff5e3a 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  padding: 6px 16px;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #ff8c61 0%, #ff5e3a 100%)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$active ? 'white' : '#1a1a1a'};
    transform: scale(1.05);
  }
`;

const CentralLangSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <SwitcherContainer>
            <LangBtn $active={language === 'en'} onClick={() => setLanguage('en')}>
                <Globe size={14} /> EN
            </LangBtn>
            <LangBtn $active={language === 'ar'} onClick={() => setLanguage('ar')}>
                AR Arabic
            </LangBtn>
            <LangBtn $active={language === 'bg'} onClick={() => setLanguage('bg')}>
                BG Български
            </LangBtn>
        </SwitcherContainer>
    );
};

export default CentralLangSwitcher;
