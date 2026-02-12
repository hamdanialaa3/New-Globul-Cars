/**
 * Read Receipt Component
 * ======================
 * Shows message delivery and read status
 * 
 * @gpt-suggestion Phase 5.3 - Read receipts feature
 * @author Implementation - January 14, 2026
 */

import React from 'react';
import styled from 'styled-components';
import { Check, CheckCheck } from 'lucide-react';

/**
 * Message status types
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface ReadReceiptProps {
  /** Message status */
  status: MessageStatus;
  /** Delivery timestamp (optional) */
  deliveredAt?: number;
  /** Read timestamp (optional) */
  readAt?: number;
  /** Show timestamp tooltip */
  showTimestamp?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Read Receipt Component
 * 
 * @description Shows visual indicator for message status
 * @example
 * <ReadReceipt status="read" readAt={Date.now()} showTimestamp />
 */
export const ReadReceipt: React.FC<ReadReceiptProps> = ({
  status,
  deliveredAt,
  readAt,
  showTimestamp = true,
  className
}) => {
  /**
   * Format timestamp for tooltip
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Get tooltip text
   */
  const getTooltip = (): string => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return deliveredAt && showTimestamp
          ? `Delivered ${formatTime(deliveredAt)}`
          : 'Delivered';
      case 'read':
        return readAt && showTimestamp
          ? `Read ${formatTime(readAt)}`
          : 'Read';
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };
  
  /**
   * Render status icon
   */
  const renderIcon = () => {
    switch (status) {
      case 'sending':
        return <LoadingDot />;
      
      case 'sent':
        return <Check size={14} />;
      
      case 'delivered':
        return <CheckCheck size={14} />;
      
      case 'read':
        return <CheckCheck size={14} />;
      
      case 'failed':
        return <FailedIcon>!</FailedIcon>;
      
      default:
        return null;
    }
  };
  
  return (
    <ReceiptContainer
      className={className}
      $status={status}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      {renderIcon()}
    </ReceiptContainer>
  );
};

// ==================== STYLED COMPONENTS ====================

const ReceiptContainer = styled.div<{ $status: MessageStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  
  color: ${props => {
    switch (props.$status) {
      case 'sending':
        return '#9ca3af';
      case 'sent':
        return '#6b7280';
      case 'delivered':
        return '#3b82f6';
      case 'read':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  }};
  
  transition: color 0.2s ease;
  cursor: help;
  
  svg {
    stroke-width: 2.5;
  }
`;

const LoadingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const FailedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  background: currentColor;
  color: white;
`;

/**
 * Message with Read Receipt (example usage)
 */
export const MessageWithReceipt = styled.div<{ $isSent: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  justify-content: ${props => props.$isSent ? 'flex-end' : 'flex-start'};
  
  .message-content {
    padding: 8px 12px;
    border-radius: 16px;
    background: ${props => props.$isSent ? '#3b82f6' : '#f3f4f6'};
    color: ${props => props.$isSent ? '#fff' : '#1f2937'};
    max-width: 70%;
    word-wrap: break-word;
  }
  
  .message-time {
    font-size: 11px;
    color: #9ca3af;
    margin-left: 8px;
  }
`;

export default ReadReceipt;
