/**
 * ⌨️ MessageInput Component
 * مكون إدخال الرسالة
 * 
 * @description Input field for composing and sending messages
 * حقل إدخال لكتابة وإرسال الرسائل
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styledBase, { keyframes } from 'styled-components';
import { logger } from '@/services/logger-service';
import { 
  Send, 
  Image as ImageIcon, 
  DollarSign, 
  X,
  Loader2
} from 'lucide-react';

import { useLanguage } from '../../../contexts/LanguageContext';

// Alias for styled-components
const styled = styledBase;

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ==================== STYLED COMPONENTS ====================

const InputContainer = styled.div`
  padding: 16px;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: #3B82F6;
  animation: ${fadeIn} 0.2s ease;
`;

const TypingDots = styled.span`
  display: flex;
  gap: 3px;
  
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3B82F6;
    animation: bounce 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
`;

const AttachmentButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) =>
      $active
        ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
        : 'rgba(255, 255, 255, 0.15)'};
    color: #ffffff;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TextInputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextInput = styled.textarea`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    border-color: rgba(59, 130, 246, 0.5);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SendButton = styled.button<{ $hasContent: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${({ $hasContent }) =>
    $hasContent
      ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $hasContent }) =>
    $hasContent ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'};
  cursor: ${({ $hasContent }) => ($hasContent ? 'pointer' : 'not-allowed')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    transform: ${({ $hasContent }) => ($hasContent ? 'scale(1.1)' : 'none')};
    box-shadow: ${({ $hasContent }) =>
      $hasContent ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'};
  }
  
  &:active:not(:disabled) {
    transform: ${({ $hasContent }) => ($hasContent ? 'scale(0.95)' : 'none')};
  }
`;

const SpinnerIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

// ==================== OFFER PANEL ====================

const OfferPanel = styled.div`
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  animation: ${fadeIn} 0.2s ease;
`;

const OfferHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OfferTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #3B82F6;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`;

const OfferInputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const OfferInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 400;
  }
  
  &:focus {
    border-color: #3B82F6;
  }
`;

const CurrencyLabel = styled.span`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`;

const SendOfferButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #22C55E, #16A34A);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ==================== COMPONENT ====================

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void | boolean>;
  onSendOffer?: (amount: number, currency?: string) => Promise<void | boolean>;
  onSendImage?: (file: File) => Promise<void | boolean>; // 📷 NEW: Image upload handler
  onTyping?: () => void;        // Simplified typing callback
  onStartTyping?: () => void;   // Legacy support
  onStopTyping?: () => void;    // Legacy support
  isTyping?: string; // Name of person typing, or empty
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendOffer,
  onSendImage, // 📷 NEW
  onTyping,
  onStartTyping,
  onStopTyping,
  isTyping,
  disabled = false,
  placeholder,
}) => {
  const { language } = useLanguage();
  const locale = language === 'bg' ? 'bg' : 'en';
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // 📷 NEW: File input ref
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);
  
  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Trigger typing indicator
    if (value) {
      // Use onTyping or onStartTyping
      const typingCallback = onTyping || onStartTyping;
      if (typingCallback) {
        typingCallback();
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) onStopTyping();
      }, 2000);
    }
  }, [onTyping, onStartTyping, onStopTyping]);
  
  // Send message
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;
    
    setIsSending(true);
    
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      if (onStopTyping) onStopTyping();
      
      // Focus back on input
      inputRef.current?.focus();
    } catch (error) {
      // Error handling is done in the parent
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Send offer
  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount.replace(/[^\d.]/g, ''));
    if (!amount || isNaN(amount) || !onSendOffer || isSending) return;
    
    setIsSending(true);
    
    try {
      await onSendOffer(amount, 'EUR');
      setOfferAmount('');
      setShowOfferPanel(false);
    } catch (error) {
      // Error handling is done in the parent
    } finally {
      setIsSending(false);
    }
  };
  
  // 📷 Handle image selection
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  // 📷 Handle image file change
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSendImage) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(locale === 'bg' ? 'Моля изберете файл изображение' : 'Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(locale === 'bg' ? 'Файлът е твърде голям (макс 5MB)' : 'File too large (max 5MB)');
      return;
    }
    
    setIsSending(true);
    try {
      await onSendImage(file);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      logger.error('Failed to send image', error as Error);
      alert(locale === 'bg' ? 'Грешка при изпращане на снимката' : 'Failed to send image');
    } finally {
      setIsSending(false);
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const defaultPlaceholder = locale === 'bg'
    ? 'Напишете съобщение...'
    : 'Type a message...';
  
  const hasContent = message.trim().length > 0;
  
  return (
    <InputContainer>
      {/* Typing indicator */}
      {isTyping && (
        <TypingIndicator>
          <TypingDots>
            <span />
            <span />
            <span />
          </TypingDots>
          <span>
            {isTyping} {locale === 'bg' ? 'пише...' : 'is typing...'}
          </span>
        </TypingIndicator>
      )}
      
      {/* Offer panel */}
      {showOfferPanel && (
        <OfferPanel>
          <OfferHeader>
            <OfferTitle>
              <DollarSign size={18} />
              {locale === 'bg' ? 'Ценово предложение' : 'Price Offer'}
            </OfferTitle>
            <CloseButton onClick={() => setShowOfferPanel(false)}>
              <X size={16} />
            </CloseButton>
          </OfferHeader>
          <OfferInputRow>
            <OfferInput
              type="text"
              inputMode="numeric"
              placeholder={locale === 'bg' ? 'Въведете сума' : 'Enter amount'}
              value={offerAmount || ''}
              onChange={(e) => {
                // Allow only numbers and decimal
                const value = e.target.value.replace(/[^\d.]/g, '');
                setOfferAmount(value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendOffer();
                }
              }}
            />
            <CurrencyLabel>EUR</CurrencyLabel>
            <SendOfferButton
              onClick={handleSendOffer}
              disabled={!offerAmount || isSending}
            >
              {isSending ? (
                <SpinnerIcon size={18} />
              ) : (
                locale === 'bg' ? 'Изпрати' : 'Send'
              )}
            </SendOfferButton>
          </OfferInputRow>
        </OfferPanel>
      )}
      
      {/* Main input row */}
      <InputRow>
        <AttachmentButtons>
          {onSendOffer && (
            <IconButton
              $active={showOfferPanel}
              onClick={() => setShowOfferPanel(!showOfferPanel)}
              title={locale === 'bg' ? 'Изпрати оферта' : 'Send offer'}
            >
              <DollarSign size={20} />
            </IconButton>
          )}
          {onSendImage && (
            <>
              <IconButton
                onClick={handleImageClick}
                title={locale === 'bg' ? 'Прикачи снимка' : 'Attach image'}
                disabled={disabled || isSending}
              >
                <ImageIcon size={20} />
              </IconButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </>
          )}
        </AttachmentButtons>
        
        <TextInputWrapper>
          <TextInput
            ref={inputRef}
            value={message || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled || isSending}
            rows={1}
          />
        </TextInputWrapper>
        
        <SendButton
          $hasContent={hasContent}
          onClick={handleSend}
          disabled={!hasContent || isSending || disabled}
        >
          {isSending ? (
            <SpinnerIcon size={20} />
          ) : (
            <Send size={20} />
          )}
        </SendButton>
      </InputRow>
    </InputContainer>
  );
};

export default MessageInput;
