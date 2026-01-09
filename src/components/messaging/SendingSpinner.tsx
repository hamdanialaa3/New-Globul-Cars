/**
 * Message Sending Spinner Component
 * Shows sending status inside message bubbles
 * 
 * @author CTO
 * @version 1.0
 * @since January 9, 2026
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface SendingSpinnerProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  size?: number;
  showLabel?: boolean;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${fadeIn} 0.2s ease-in;
`;

const IconWrapper = styled.div<{ status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' }>`
  display: flex;
  align-items: center;
  color: ${props => {
    if (props.status === 'failed') return props.theme.error || '#ef4444';
    if (props.status === 'read') return props.theme.primary || '#3b82f6';
    if (props.status === 'delivered') return props.theme.success || '#10b981';
    return props.theme.text.tertiary;
  }};

  ${props => props.status === 'sending' ? `
    animation: ${spin} 1s linear infinite;
  ` : ''}
`;

const Label = styled.span<{ status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' }>`
  font-size: 11px;
  color: ${props => {
    if (props.status === 'failed') return props.theme.error || '#ef4444';
    return props.theme.text.tertiary;
  }};
`;

export const SendingSpinner: React.FC<SendingSpinnerProps> = ({
  status,
  size = 14,
  showLabel = false
}) => {
  const renderIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={size} />;
      case 'sent':
        return <Check size={size} />;
      case 'delivered':
        return <CheckCheck size={size} />;
      case 'read':
        return <CheckCheck size={size} />;
      case 'failed':
        return <AlertCircle size={size} />;
      default:
        return <Clock size={size} />;
    }
  };

  const renderLabel = () => {
    if (!showLabel) return null;

    switch (status) {
      case 'sending':
        return <Label status={status}>Sending...</Label>;
      case 'sent':
        return <Label status={status}>Sent</Label>;
      case 'delivered':
        return <Label status={status}>Delivered</Label>;
      case 'read':
        return <Label status={status}>Read</Label>;
      case 'failed':
        return <Label status={status}>Failed to send</Label>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <IconWrapper status={status}>
        {renderIcon()}
      </IconWrapper>
      {renderLabel()}
    </Container>
  );
};

export default SendingSpinner;
