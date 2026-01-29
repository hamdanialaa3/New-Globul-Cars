/**
 * Car Emoji Picker - Simplified Version
 * Simple, independent emoji picker with car-themed icons
 */

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Car, Truck, Bus, Bike, Fuel, Gauge, 
  Wrench, DollarSign, Star, ThumbsUp, Clock, MapPin
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ==================== TYPES ====================

export interface CarEmoji {
  id: string;
  icon: LucideIcon;
  label: string;
}

// Simple list of essential car emojis
const carEmojis: CarEmoji[] = [
  { id: 'car', icon: Car, label: 'Кола' },
  { id: 'truck', icon: Truck, label: 'Камион' },
  { id: 'bus', icon: Bus, label: 'Автобус' },
  { id: 'bike', icon: Bike, label: 'Мотор' },
  { id: 'fuel', icon: Fuel, label: 'Гориво' },
  { id: 'gauge', icon: Gauge, label: 'Скорост' },
  { id: 'wrench', icon: Wrench, label: 'Ремонт' },
  { id: 'dollar', icon: DollarSign, label: 'Цена' },
  { id: 'star', icon: Star, label: 'Звезда' },
  { id: 'thumbsup', icon: ThumbsUp, label: 'Харесва' },
  { id: 'clock', icon: Clock, label: 'Време' },
  { id: 'mappin', icon: MapPin, label: 'Локация' },
];

// ==================== STYLED COMPONENTS ====================

const PickerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 999;
`;

const PickerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  max-width: calc(100vw - 32px);
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 12px;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 1000;
  animation: fadeIn 0.15s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  [data-theme='dark'] & {
    background: rgba(26, 29, 46, 0.98);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    bottom: 80px;
    width: 260px;
  }
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const EmojiButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  
  svg {
    width: 18px;
    height: 18px;
    color: var(--text-primary, #1a1d2e);
    transition: all 0.15s ease;
  }
  
  &:hover {
    background: var(--bg-hover, rgba(0, 0, 0, 0.05));
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  [data-theme='dark'] & {
    svg {
      color: #ffffff;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// ==================== COMPONENT ====================

interface CarEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: CarEmoji) => void;
  language?: 'bg' | 'en';
}

export const CarEmojiPicker: React.FC<CarEmojiPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  
  const handleEmojiSelect = (emoji: CarEmoji) => {
    onSelect(emoji);
    onClose();
  };
  
  return (
    <>
      <PickerOverlay $isOpen={isOpen} onClick={onClose} />
      <PickerContainer $isOpen={isOpen} ref={pickerRef}>
        <EmojiGrid>
          {carEmojis.map((emoji) => {
            const IconComponent = emoji.icon;
            return (
              <EmojiButton
                key={emoji.id}
                onClick={() => handleEmojiSelect(emoji)}
                title={emoji.label}
              >
                <IconComponent />
              </EmojiButton>
            );
          })}
        </EmojiGrid>
      </PickerContainer>
    </>
  );
};

export default CarEmojiPicker;
