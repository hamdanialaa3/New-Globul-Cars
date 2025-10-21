/**
 * MessageComposer - Rich message input component
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Send,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Mic,
  X
} from 'lucide-react';

// ==================== INTERFACES ====================

interface MessageComposerProps {
  onSendMessage: (content: string, attachments?: any[]) => void;
  onTyping: (isTyping: boolean) => void;
  recipientName: string;
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e9ecef;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f5;
    color: #FF7900;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 22px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: none;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF7900;
    box-shadow: 0 0 0 3px rgba(255, 121, 0, 0.1);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const SendButton = styled.button<{ $canSend: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${p => p.$canSend ? '#FF7900' : '#dee2e6'};
  color: white;
  cursor: ${p => p.$canSend ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${p => p.$canSend ? '#FF6900' : '#dee2e6'};
    transform: ${p => p.$canSend ? 'scale(1.05)' : 'none'};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const AttachmentsPreview = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const AttachmentItem = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// ==================== COMPONENT ====================

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTyping,
  recipientName
}) => {
  const { t } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // ==================== HANDLERS ====================
  
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    
    // Send typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  }, [isTyping, onTyping]);
  
  const handleSend = useCallback(() => {
    if (!message.trim() && attachments.length === 0) return;
    
    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    setIsTyping(false);
    onTyping(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, attachments, onSendMessage, onTyping]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  }, []);
  
  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const canSend = message.trim().length > 0 || attachments.length > 0;
  
  // ==================== RENDER ====================
  
  return (
    <Container>
      {attachments.length > 0 && (
        <AttachmentsPreview>
          {attachments.map((file, index) => (
            <AttachmentItem key={index}>
              {file.type.startsWith('image/') && (
                <img src={URL.createObjectURL(file)} alt={file.name} />
              )}
              <RemoveButton onClick={() => handleRemoveAttachment(index)}>
                <X />
              </RemoveButton>
            </AttachmentItem>
          ))}
        </AttachmentsPreview>
      )}
      
      <InputContainer>
        <ActionsBar>
          <ActionButton
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={t('messages.attachImage')}
          >
            <ImageIcon />
          </ActionButton>
          <ActionButton
            type="button"
            title={t('messages.attachFile')}
          >
            <Paperclip />
          </ActionButton>
          <ActionButton
            type="button"
            title={t('messages.emoji')}
          >
            <Smile />
          </ActionButton>
        </ActionsBar>
        
        <InputWrapper>
          <TextArea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={t('messages.typeMessage', { name: recipientName })}
            rows={1}
          />
        </InputWrapper>
        
        <SendButton
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          $canSend={canSend}
          title={t('messages.send')}
        >
          <Send />
        </SendButton>
      </InputContainer>
      
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
      />
    </Container>
  );
};

export default MessageComposer;
