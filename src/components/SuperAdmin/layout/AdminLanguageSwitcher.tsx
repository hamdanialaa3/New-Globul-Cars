// src/components/SuperAdmin/layout/AdminLanguageSwitcher.tsx
import React from 'react';
import styled from 'styled-components';
import { useAdminLang, AdminLanguage } from '../../../contexts/AdminLanguageContext';
import { adminTheme } from '../styles/admin-theme';
import { Globe } from 'lucide-react';

const SwitcherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  border: 1px solid ${adminTheme.colors.border.subtle};
`;

const LangButton = styled.button<{ $active: boolean }>`
  background: ${p => p.$active ? adminTheme.colors.accent.primary : 'transparent'};
  color: ${p => p.$active ? '#fff' : adminTheme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.$active ? adminTheme.colors.accent.primary : 'rgba(255,255,255,0.05)'};
    color: #fff;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 6px;
  color: ${adminTheme.colors.text.muted};
`;

const AdminLanguageSwitcher: React.FC = () => {
  const { adminLang, setAdminLang } = useAdminLang();

  // Languages configuration
  const languages: { code: AdminLanguage; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'bg', label: 'BG' },
    { code: 'tr', label: 'TR' },
    { code: 'de', label: 'DE' },
    { code: 'ar', label: 'AR' },
  ];

  return (
    <SwitcherContainer>
      <IconWrapper>
        <Globe size={14} />
      </IconWrapper>
      {languages.map(lang => (
        <LangButton
          key={lang.code}
          $active={adminLang === lang.code}
          onClick={() => setAdminLang(lang.code)}
        >
          {lang.label}
        </LangButton>
      ))}
    </SwitcherContainer>
  );
};

export default AdminLanguageSwitcher;
