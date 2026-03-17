import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { CarListing } from '@/types/CarListing';

interface MobileContactBarProps {
  car: CarListing;
  language: 'bg' | 'en';
  onCall: () => void;
  onChat: () => void;
  scrollY?: number;
  imageGalleryHeight?: number;
}

// ✅ Sticky Mobile Contact Bar (Fixed at Bottom)
const MobileContactBarContainer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    display: none; /* Hide on desktop */
  }
  
  @media (prefers-color-scheme: dark) {
    background: rgba(15, 23, 42, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
`;

const ContactButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  ${props => props.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    `
    : `
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

export const MobileContactBar: React.FC<MobileContactBarProps> = ({
  car,
  language,
  onCall,
  onChat,
  scrollY = 0,
  imageGalleryHeight = 800,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // ✅ Show FAB when image gallery scrolls out of view
    // Conservative estimate: show after scrolling past 800px (typical hero/gallery height)
    setIsVisible(scrollY > imageGalleryHeight);
  }, [scrollY, imageGalleryHeight]);

  return (
    <AnimatePresence>
      {isVisible && (
        <MobileContactBarContainer
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ 
            type: 'spring',
            damping: 15,
            stiffness: 100
          }}
        >
          <ContactButton 
            $variant="primary"
            onClick={onCall}
            title={language === 'bg' ? 'Позвонете на продавача' : 'Call Seller'}
          >
            <Phone size={20} />
            <span>{language === 'bg' ? 'Позвони' : 'Call'}</span>
          </ContactButton>
          
          <ContactButton 
            $variant="secondary"
            onClick={onChat}
            title={language === 'bg' ? 'Чат с продавача' : 'Chat with Seller'}
          >
            <MessageCircle size={20} />
            <span>{language === 'bg' ? 'Чат' : 'Chat'}</span>
          </ContactButton>
        </MobileContactBarContainer>
      )}
    </AnimatePresence>
  );
};
