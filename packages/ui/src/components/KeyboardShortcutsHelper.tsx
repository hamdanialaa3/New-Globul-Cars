// Keyboard Shortcuts Helper
// مساعد اختصارات لوحة المفاتيح

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@globul-cars/core/contexts/ThemeContext';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsHelperProps {
  onSave?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  onPublish?: () => void;
  language?: 'bg' | 'en';
}

const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 999;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    left: 1rem;
    width: 48px;
    height: 48px;
  }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const Card = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? '#071025' : 'white')};
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $isDark }) => ($isDark ? '#e6eef9' : '#2c3e50')};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button<{ $isDark?: boolean }>`
  background: none;
  border: none;
  color: ${({ $isDark }) => ($isDark ? '#94a3b8' : '#64748b')};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ $isDark }) => ($isDark ? 'rgba(148,163,184,0.06)' : '#f1f5f9')};
  }
`;

const ShortcutsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ShortcutItem = styled.div<{ $isDark?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ $isDark }) => ($isDark ? '#071025' : '#f8fafc')};
  border-radius: 8px;
  border-left: 3px solid #ff8f10;
`;

const ShortcutDesc = styled.div<{ $isDark?: boolean }>`
  font-size: 0.938rem;
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#475569')};
  font-weight: 500;
`;

const KeyCombo = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Key = styled.kbd`
  background: linear-gradient(135deg, #1e293b, #334155);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 32px;
  text-align: center;
`;

const Plus = styled.span`
  color: #94a3b8;
  font-weight: 600;
`;

const Hint = styled.div<{ $isDark?: boolean }>`
  margin-top: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${({ $isDark }) => ($isDark ? '#cbd5e1' : '#475569')};
  line-height: 1.6;
`;

const KeyboardShortcutsHelper: React.FC<KeyboardShortcutsHelperProps> = ({
  onSave,
  onNext,
  onBack,
  onPublish,
  language = 'bg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const t = (bg: string, en: string) => language === 'bg' ? bg : en;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl/Cmd + Enter: Next step or Publish
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (onPublish) {
          onPublish();
        } else if (onNext) {
          onNext();
        }
      }

      // Escape: Go back
      if (e.key === 'Escape' && !isOpen) {
        e.preventDefault();
        onBack?.();
      }

      // ?: Show shortcuts
      if (e.key === '?' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close modal
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onNext, onBack, onPublish, isOpen]);

  const shortcuts = [
    {
      keys: ['Ctrl', 'S'],
      description: t('Запази като чернова', 'Save as draft'),
      available: !!onSave
    },
    {
      keys: ['Ctrl', 'Enter'],
      description: t('Продължи към следваща стъпка', 'Continue to next step'),
      available: !!onNext || !!onPublish
    },
    {
      keys: ['Esc'],
      description: t('Назад към предишна стъпка', 'Back to previous step'),
      available: !!onBack
    },
    {
      keys: ['?'],
      description: t('Покажи/скрий това меню', 'Show/hide this menu'),
      available: true
    }
  ];

  return (
    <>
      <FloatingButton
        onClick={() => setIsOpen(true)}
        title={t('Клавишни комбинации', 'Keyboard shortcuts')}
      >
        <Keyboard size={24} />
      </FloatingButton>

      <Modal $isOpen={isOpen} onClick={() => setIsOpen(false)}>
        <Card $isDark={isDark} onClick={e => e.stopPropagation()}>
          <Header>
            <Title $isDark={isDark}>
              <Keyboard />
              {t('Клавишни комбинации', 'Keyboard Shortcuts')}
            </Title>
            <CloseButton $isDark={isDark} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </CloseButton>
          </Header>

          <ShortcutsList>
            {shortcuts
              .filter(s => s.available)
              .map((shortcut, index) => (
                <ShortcutItem key={index} $isDark={isDark}>
                  <ShortcutDesc $isDark={isDark}>{shortcut.description}</ShortcutDesc>
                  <KeyCombo>
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <Plus>+</Plus>}
                        <Key>{key}</Key>
                      </React.Fragment>
                    ))}
                  </KeyCombo>
                </ShortcutItem>
              ))}
          </ShortcutsList>

          <Hint $isDark={isDark}>
            💡 {t(
              'Натиснете ? по всяко време, за да покажете това меню',
              'Press ? at any time to show this menu'
            )}
          </Hint>
        </Card>
      </Modal>
    </>
  );
};

export default KeyboardShortcutsHelper;

