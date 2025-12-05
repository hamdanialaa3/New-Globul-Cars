import { logger } from '../../services/logger-service';
// src/components/Messaging/MessageInput.tsx
// Message Input Component - مكون إدخال الرسالة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Paperclip, Image, Smile, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { advancedMessagingService } from '../../services/messaging';

// ==================== STYLED COMPONENTS ====================

const InputContainer = styled.div`
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const AttachmentsPreview = styled.div`
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const AttachmentChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.875rem;
  
  .filename {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .filesize {
    color: #999;
    font-size: 0.75rem;
  }
`;

const RemoveButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #ffebee;
  color: #f44336;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #ffcdd2;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextInput = styled.textarea`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: none;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$primary ? '#FF7900' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.$primary ? '#ff8c1a' : '#e0e0e0'};
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// ==================== COMPONENT ====================

interface MessageInputProps {
  conversationId: string;
  senderId: string;
  receiverId: string;
  onSend?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  senderId,
  receiverId,
  onSend
}) => {
  const { language } = useLanguage();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  // Handle typing indicator
  useEffect(() => {
    if (text.trim()) {
      advancedMessagingService.setTyping(conversationId, senderId, true);
    } else {
      advancedMessagingService.setTyping(conversationId, senderId, false);
    }
  }, [text, conversationId, senderId]);

  const handleSend = async () => {
    if ((!text.trim() && attachments.length === 0) || sending) return;

    setSending(true);

    try {
      if (attachments.length > 0) {
        await advancedMessagingService.sendMessageWithAttachments(
          conversationId,
          senderId,
          receiverId,
          text,
          attachments
        );
      } else {
        await advancedMessagingService.sendMessage(
          conversationId,
          senderId,
          receiverId,
          text
        );
      }

      // Reset
      setText('');
      setAttachments([]);
      onSend?.();

    } catch (error) {
      logger.error('Error sending message:', error);
      alert(language === 'bg' 
        ? 'Грешка при изпращане на съобщение'
        : 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      {attachments.length > 0 && (
        <AttachmentsPreview>
          {attachments.map((file, index) => (
            <AttachmentChip key={index}>
              {file.type.startsWith('image/') ? <Image size={16} /> : <Paperclip size={16} />}
              <span className="filename">{file.name}</span>
              <span className="filesize">({formatFileSize(file.size)})</span>
              <RemoveButton onClick={() => removeAttachment(index)}>
                <X size={12} />
              </RemoveButton>
            </AttachmentChip>
          ))}
        </AttachmentsPreview>
      )}

      <InputContainer>
        <ActionButton onClick={() => fileInputRef.current?.click()}>
          <Paperclip size={20} />
        </ActionButton>

        <HiddenInput
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
        />

        <InputWrapper>
          <TextInput
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              language === 'bg' 
                ? 'Напишете съобщение...'
                : 'Type a message...'
            }
            disabled={sending}
            rows={1}
          />
        </InputWrapper>

        <ActionButton
          $primary
          onClick={handleSend}
          disabled={sending || (!text.trim() && attachments.length === 0)}
        >
          <Send size={20} />
        </ActionButton>
      </InputContainer>
    </>
  );
};

export default MessageInput;
