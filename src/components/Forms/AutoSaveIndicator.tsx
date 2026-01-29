/**
 * Auto-Save Indicator Component
 * Shows auto-save status with timestamp
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, Save, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  lastSaved?: Date | null;
  isSaving?: boolean;
  error?: string | null;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.theme.text.secondary};
  padding: 8px 12px;
  border-radius: 8px;
  background: ${props => props.theme.colors.background.light};
`;

const IconWrapper = styled.div<{ status: 'saving' | 'saved' | 'error' }>`
  display: flex;
  align-items: center;
  color: ${props => {
    if (props.status === 'saving') return props.theme.text.secondary;
    if (props.status === 'saved') return props.theme.colors.success.main || '#10b981';
    return props.theme.colors.error.main || '#ef4444';
  }};
  animation: ${props => props.status === 'saving' ? pulse : 'none'} 1.5s ease-in-out infinite;
`;

const Text = styled.span<{ status: 'saving' | 'saved' | 'error' }>`
  color: ${props => {
    if (props.status === 'error') return props.theme.colors.error.main || '#ef4444';
    return props.theme.text.secondary;
  }};
`;

const TimeAgo = styled.span`
  font-size: 11px;
  color: ${props => props.theme.text.tertiary};
`;

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return date.toLocaleDateString();
};

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  lastSaved,
  isSaving = false,
  error = null
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(lastSaved));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatus = (): 'saving' | 'saved' | 'error' => {
    if (error) return 'error';
    if (isSaving) return 'saving';
    return 'saved';
  };

  const status = getStatus();

  const renderIcon = () => {
    if (status === 'saving') return <Save size={16} />;
    if (status === 'error') return <AlertCircle size={16} />;
    return <Check size={16} />;
  };

  const renderText = () => {
    if (status === 'saving') return 'Saving draft...';
    if (status === 'error') return error || 'Save failed';
    if (lastSaved) return `Draft saved ${timeAgo}`;
    return 'No changes';
  };

  return (
    <Container>
      <IconWrapper status={status}>
        {renderIcon()}
      </IconWrapper>
      <Text status={status}>
        {renderText()}
      </Text>
    </Container>
  );
};

export default AutoSaveIndicator;
