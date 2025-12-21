// src/components/Toast/Toast.tsx
// Toast Notification Component - مكون الإشعارات المنبثقة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ==================== ANIMATIONS ====================

const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

// ==================== STYLED COMPONENTS ====================

const ToastContainer = styled.div<{ $type: ToastType; $isClosing: boolean }>`
  position: fixed;
  top: 24px;
  right: 24px;
  min-width: 300px;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  z-index: 10000;
  animation: ${props => props.$isClosing ? slideOut : slideIn} 0.3s ease;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return '#4CAF50';
      case 'error': return '#ef5350';
      case 'warning': return '#ff9800';
      case 'info': return '#2196F3';
      default: return '#666';
    }
  }};
  
  @media (max-width: 768px) {
    right: 16px;
    left: 16px;
    min-width: auto;
  }
`;

const IconWrapper = styled.div<{ $type: ToastType }>`
  flex-shrink: 0;
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#4CAF50';
      case 'error': return '#ef5350';
      case 'warning': return '#ff9800';
      case 'info': return '#2196F3';
      default: return '#666';
    }
  }};
  
  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 4px;
`;

const Message = styled.div`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  word-wrap: break-word;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
  
  &:hover {
    color: #666;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(1);
  }
`;

// ==================== TYPES ====================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

// ==================== COMPONENT ====================

const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isClosing, setIsClosing] = React.useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={22} />;
      case 'error':
        return <XCircle size={22} />;
      case 'warning':
        return <AlertCircle size={22} />;
      case 'info':
        return <Info size={22} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return 'Успех / Success';
      case 'error':
        return 'Грешка / Error';
      case 'warning':
        return 'Внимание / Warning';
      case 'info':
        return 'Информация / Info';
    }
  };

  return (
    <ToastContainer $type={type} $isClosing={isClosing}>
      <IconWrapper $type={type}>
        {getIcon()}
      </IconWrapper>
      <Content>
        {title && <Title>{title}</Title>}
        <Message>{message}</Message>
      </Content>
      <CloseButton onClick={handleClose}>
        <X size={18} />
      </CloseButton>
    </ToastContainer>
  );
};

export default Toast;

