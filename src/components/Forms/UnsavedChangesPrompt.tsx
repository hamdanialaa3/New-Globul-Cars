/**
 * Unsaved Changes Prompt Component
 * Warns users before navigating away from unsaved changes
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesPromptProps {
  hasUnsavedChanges: boolean;
  message?: string;
  onProceed?: () => void;
  onCancel?: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const Modal = styled.div`
  background: ${props => props.theme.bg.primary};
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  color: ${props => props.theme.warning || '#f59e0b'};
  display: flex;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.text.primary};
  margin: 0;
`;

const Message = styled.p`
  font-size: 14px;
  color: ${props => props.theme.text.secondary};
  line-height: 1.5;
  margin: 0 0 24px 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.danger || '#ef4444'};
    color: white;
    &:hover {
      background: ${props.theme.dangerHover || '#dc2626'};
    }
  ` : `
    background: ${props.theme.bg.secondary};
    color: ${props.theme.text.primary};
    &:hover {
      background: ${props.theme.bg.tertiary};
    }
  `}
`;

/**
 * Hook to prevent browser navigation when there are unsaved changes
 */
export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean, message?: string) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message || 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);
};

/**
 * Modal component to show when user tries to navigate away
 */
export const UnsavedChangesPrompt: React.FC<UnsavedChangesPromptProps> = ({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onProceed,
  onCancel
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && hasUnsavedChanges && onCancel) {
      onCancel();
    }
  }, [hasUnsavedChanges, onCancel]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [hasUnsavedChanges, handleKeyDown]);

  if (!hasUnsavedChanges) return null;

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <IconWrapper>
            <AlertTriangle size={24} />
          </IconWrapper>
          <Title>Unsaved Changes</Title>
        </Header>

        <Message>{message}</Message>

        <Actions>
          <Button variant="secondary" onClick={onCancel}>
            Stay on Page
          </Button>
          <Button variant="primary" onClick={onProceed}>
            Leave Without Saving
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  );
};

export default UnsavedChangesPrompt;
