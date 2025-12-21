// Color Picker Grid Component
// لوحة اختيار الألوان - مشابهة لـ mobile.de

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const COLORS = [
  { name: 'Beige', nameBg: 'Бежов', nameEn: 'Beige', value: 'beige', hex: '#F5F5DC' },
  { name: 'Braun', nameBg: 'Кафяв', nameEn: 'Brown', value: 'brown', hex: '#8B4513' },
  { name: 'Gold', nameBg: 'Златист', nameEn: 'Gold', value: 'gold', hex: '#FFD700' },
  { name: 'Grün', nameBg: 'Зелен', nameEn: 'Green', value: 'green', hex: '#008000' },
  { name: 'Rot', nameBg: 'Червен', nameEn: 'Red', value: 'red', hex: '#FF0000' },
  { name: 'Silber', nameBg: 'Сребрист', nameEn: 'Silver', value: 'silver', hex: '#C0C0C0' },
  { name: 'Blau', nameBg: 'Син', nameEn: 'Blue', value: 'blue', hex: '#0000FF' },
  { name: 'Schwarz', nameBg: 'Черен', nameEn: 'Black', value: 'black', hex: '#000000' },
  { name: 'Grau', nameBg: 'Сив', nameEn: 'Gray', value: 'gray', hex: '#808080' },
  { name: 'Orange', nameBg: 'Оранжев', nameEn: 'Orange', value: 'orange', hex: '#FFA500' },
  { name: 'Gelb', nameBg: 'Жълт', nameEn: 'Yellow', value: 'yellow', hex: '#FFFF00' },
  { name: 'Violett', nameBg: 'Виолетов', nameEn: 'Violet', value: 'violet', hex: '#8A2BE2' },
  { name: 'Weiß', nameBg: 'Бял', nameEn: 'White', value: 'white', hex: '#FFFFFF' },
];

interface ColorPickerGridProps {
  selectedColor: string;
  isMetallic: boolean;
  onColorChange: (color: string) => void;
  onMetallicToggle: (isMetallic: boolean) => void;
}

// Animations
const colorPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  60% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const pulseRing = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
`;

const metallicShine = keyframes`
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
  max-width: 100%;
`;

const ColorItem = styled.button<{ $color: string; $selected: boolean }>`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 3px solid ${props => props.$selected ? 'var(--accent-primary)' : 'rgba(148, 163, 184, 0.3)'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$selected 
    ? '0 0 0 4px rgba(255, 255, 255, 0.8), 0 0 0 8px var(--accent-primary), 0 8px 24px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  z-index: ${props => props.$selected ? 10 : 1};
  opacity: 0;
  animation: ${colorPop} 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  ${props => props.$selected && `
    transform: scale(1.15);
    
    &::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 3px solid var(--accent-primary);
      animation: ${pulseRing} 2s infinite;
    }
  `}
`;

const CheckIcon = styled(Check)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${props => {
    // Determine if we need white or black checkmark based on color brightness
    const color = props.color || '#000000';
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }};
  width: 24px;
  height: 24px;
  stroke-width: 3;
  z-index: 11;
`;

const MetallicToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-hover);
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent-primary);
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
`;

const MetallicLabel = styled.div<{ $checked: boolean }>`
  position: relative;
  overflow: hidden;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${props => props.$checked 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)'
    : 'transparent'};
  
  ${props => props.$checked && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: ${metallicShine} 2s infinite;
    }
  `}
`;

export const ColorPickerGrid: React.FC<ColorPickerGridProps> = ({
  selectedColor,
  isMetallic,
  onColorChange,
  onMetallicToggle,
}) => {
  const { language } = useLanguage();

  return (
    <Container>
      <ColorGrid>
        {COLORS.map((color, index) => {
          const isSelected = selectedColor === color.value;
          const displayName = language === 'bg' ? color.nameBg : color.nameEn;
          
          return (
            <ColorItem
              key={color.value}
              $color={color.hex}
              $selected={isSelected}
              onClick={() => onColorChange(color.value)}
              title={displayName}
              style={{ animationDelay: `${index * 0.05}s` }}
              aria-label={displayName}
            >
              {isSelected && <CheckIcon color={color.hex} />}
            </ColorItem>
          );
        })}
      </ColorGrid>
      
      <MetallicToggle onClick={() => onMetallicToggle(!isMetallic)}>
        <Checkbox
          checked={isMetallic}
          onChange={(e) => onMetallicToggle(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
        <Label onClick={(e) => e.stopPropagation()}>
          <MetallicLabel $checked={isMetallic}>
            {language === 'bg' ? 'Металик' : 'Metallic'}
          </MetallicLabel>
        </Label>
      </MetallicToggle>
    </Container>
  );
};

export default ColorPickerGrid;
