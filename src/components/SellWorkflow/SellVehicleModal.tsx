// Sell Vehicle Modal Component
// نافذة منبثقة لبيع السيارة - نمط mobile.de

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SellVehicleWizard from './SellVehicleWizard';
import ModalWorkflowTimer from './ModalWorkflowTimer';

interface SellVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  initialStep?: number;
  initialVehicleType?: string;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: transparent; /* No background - modal fills entire screen */
  z-index: 10000;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  margin: 0;
  animation: ${fadeIn} 0.3s ease-out;
  overflow: hidden;
`;

const ModalContainer = styled.div<{ $isClosing: boolean }>`
  position: relative;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: none;
  border-radius: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: none;
  animation: ${props => props.$isClosing ? modalExit : modalEnter} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  
  /* Decorative gradient overlay */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #6366F1 0%, #8B5CF6 100%);
    border-radius: 10px;
    border: 2px solid ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
    
    &:hover {
      background: linear-gradient(180deg, #8B5CF6 0%, #FFA07A 100%);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  max-width: 44px;
  max-height: 44px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'
  };
  backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#1e293b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: white;
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    border-color: transparent;
  }
  
  &:active {
    transform: rotate(90deg) scale(0.95);
  }
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const WizardContainer = styled.div`
  padding: 2.5rem 2rem 2rem 2rem;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Allow flex shrinking */
  width: 100%;
  /* ModalContainer handles scrolling - no nested scroll here */

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
  
  @media (max-width: 640px) {
    padding: 1rem 0.75rem;
    padding-bottom: 0;
  }
`;

export const SellVehicleModal: React.FC<SellVehicleModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialStep = 0,
  initialVehicleType,
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
    <Overlay $isOpen={isOpen}>
      <ModalContainer $isClosing={isClosing}>
        <CloseButton onClick={handleClose} aria-label={language === 'bg' ? 'Затвори' : 'Close'}>
          <X size={20} />
        </CloseButton>

        {/* ✅ Timer integrated inside modal */}
        <ModalWorkflowTimer />

        <WizardContainer>
          <SellVehicleWizard
            initialStep={initialStep}
            onComplete={handleComplete}
            onCancel={handleClose}
            initialVehicleType={initialVehicleType}
          />
        </WizardContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default SellVehicleModal;

