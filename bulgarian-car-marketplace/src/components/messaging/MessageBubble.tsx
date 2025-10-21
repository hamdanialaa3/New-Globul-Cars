// src/components/Messaging/MessageBubble.tsx
// Message Bubble Component - فقاعة الرسالة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React from 'react';
import styled from 'styled-components';
import { Check, CheckCheck, Download, Image as ImageIcon } from 'lucide-react';
import type { Message } from '../../services/realtimeMessaging';

// ==================== STYLED COMPONENTS ====================

const BubbleContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  padding: 0 16px;
`;

const Bubble = styled.div<{ $isOwn: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.$isOwn ? '#FF7900' : '#f0f0f0'};
  color: ${props => props.$isOwn ? 'white' : '#333'};
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  ${props => props.$isOwn ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}
`;

const MessageText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const AttachmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const AttachmentItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
  
  &:hover {
    opacity: 0.9;
  }
`;

const FileAttachment = styled.div<{ $isOwn: boolean }>`
  padding: 12px;
  background: ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.2)' : 'white'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const FileInfo = styled.div<{ $isOwn: boolean }>`
  flex: 1;
  
  .filename {
    font-size: 0.875rem;
    font-weight: 500;
    color: ${props => props.$isOwn ? 'white' : '#333'};
  }
  
  .filesize {
    font-size: 0.75rem;
    color: ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.8)' : '#999'};
  }
`;

const MessageMeta = styled.div<{ $isOwn: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 0.75rem;
  color: ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.8)' : '#999'};
`;

// ==================== COMPONENT ====================

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn
}) => {
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('bg-BG', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Check size={14} />;
      case 'sent':
        return <Check size={14} />;
      case 'delivered':
        return <CheckCheck size={14} />;
      case 'read':
        return <CheckCheck size={14} color={isOwn ? '#4caf50' : '#999'} />;
      default:
        return null;
    }
  };

  return (
    <BubbleContainer $isOwn={isOwn}>
      <Bubble $isOwn={isOwn}>
        {message.text && (
          <MessageText>{message.text}</MessageText>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <>
            {message.attachments.some(a => a.type === 'image') && (
              <AttachmentsGrid>
                {message.attachments
                  .filter(a => a.type === 'image')
                  .map(attachment => (
                    <AttachmentItem
                      key={attachment.id}
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <img src={attachment.url} alt={attachment.name} />
                    </AttachmentItem>
                  ))}
              </AttachmentsGrid>
            )}

            {message.attachments
              .filter(a => a.type !== 'image')
              .map(attachment => (
                <FileAttachment
                  key={attachment.id}
                  $isOwn={isOwn}
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <Download size={20} />
                  <FileInfo $isOwn={isOwn}>
                    <div className="filename">{attachment.name}</div>
                    <div className="filesize">{formatFileSize(attachment.size)}</div>
                  </FileInfo>
                </FileAttachment>
              ))}
          </>
        )}

        <MessageMeta $isOwn={isOwn}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && getStatusIcon()}
        </MessageMeta>
      </Bubble>
    </BubbleContainer>
  );
};

export default MessageBubble;
