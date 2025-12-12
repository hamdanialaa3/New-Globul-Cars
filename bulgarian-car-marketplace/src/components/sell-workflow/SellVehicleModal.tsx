// Sell Vehicle Modal Component
// نافذة منبثقة لبيع السيارة - نمط mobile.de

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SellVehicleWizard from './SellVehicleWizard';

interface SellVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  initialStep?: number;
}

// Animations
const modalEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const modalExit = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
  overflow-y: auto;
`;

const ModalContainer = styled.div<{ $isClosing: boolean }>`
  position: relative;
  background: var(--bg-primary);
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${props => props.$isClosing ? modalExit : modalEnter} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  max-width: 36px;
  max-height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: var(--bg-hover);
    transform: rotate(90deg) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: rotate(90deg) scale(0.95);
  }
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const WizardContainer = styled.div`
  padding: 2.5rem 2rem 2rem 2rem;
  min-height: 500px;
  position: relative;
`;

export const SellVehicleModal: React.FC<SellVehicleModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialStep = 0,
}) => {
  const { language } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleComplete = () => {
    // Wizard handles publishing and navigation internally
    // Close modal after a short delay to allow publishing to complete
    if (onComplete) {
      onComplete();
    }
    // Close modal after navigation starts
    setTimeout(() => {
      handleClose();
    }, 100);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContainer $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} aria-label={language === 'bg' ? 'Затвори' : 'Close'}>
          <X size={20} />
        </CloseButton>

        <WizardContainer>
          <SellVehicleWizard
            initialStep={initialStep}
            onComplete={handleComplete}
            onCancel={handleClose}
          />
        </WizardContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default SellVehicleModal;
