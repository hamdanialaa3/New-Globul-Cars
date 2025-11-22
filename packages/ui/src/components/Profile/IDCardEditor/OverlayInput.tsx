// Overlay Input - Positioned transparent input field
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { FieldDefinition } from './types';
import SelectWithOther from '../../shared/SelectWithOther';
import { GENDERS, NATIONALITIES, DOCUMENT_TYPES } from '@globul-cars/core/constants/dropdown-options';

interface OverlayInputProps {
  field: FieldDefinition;
  value: any;
  onChange: (id: string, value: any) => void;
  scale?: number;
  isValid?: boolean;
  error?: string;
}

// Helper function to get select options based on field ID
const getSelectOptions = (fieldId: string) => {
  switch (fieldId) {
    case 'gender':
      return GENDERS;
    case 'nationality':
      return NATIONALITIES;
    case 'documentType':
      return DOCUMENT_TYPES;
    default:
      return [];
  }
};

const OverlayInput: React.FC<OverlayInputProps> = ({
  field,
  value,
  onChange,
  scale = 1,
  isValid = true,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(field.id, e.target.value);
  };

  // Calculate scaled position
  const style = {
    left: `${field.position.x * scale}px`,
    top: `${field.position.y * scale}px`,
    width: `${field.position.width * scale}px`,
    height: `${field.position.height * scale}px`
  };

  return (
    <InputContainer 
      style={style}
      $isValid={isValid}
      $isFocused={isFocused}
      $isHovered={isHovered}
      $hasError={!!error}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={error || field.label}
    >
      {field.inputType === 'select' ? (
        <SelectWithOther
          options={getSelectOptions(field.id)}
          value={value || ''}
          onChange={(newValue: string) => handleChange({ target: { value: newValue } } as any)}
          placeholder="--"
          showOther={true}
        />
      ) : field.inputType === 'number' ? (
        <StyledInput
          type="number"
          value={value || ''}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={field.example}
          min={field.min}
          max={field.max}
          readOnly={field.readOnly}
          $scale={scale}
        />
      ) : (
        <StyledInput
          type="text"
          value={value || ''}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={field.example}
          maxLength={field.maxLength}
          readOnly={field.readOnly}
          $scale={scale}
        />
      )}
      
      {/* Validation indicator */}
      {!isFocused && value && (
        <ValidationIcon $isValid={isValid}>
          {isValid ? '✓' : '✗'}
        </ValidationIcon>
      )}
      
      {/* Error tooltip */}
      {error && isHovered && (
        <ErrorTooltip>{error}</ErrorTooltip>
      )}
    </InputContainer>
  );
};

// Styled Components
const InputContainer = styled.div<{
  $isValid: boolean;
  $isFocused: boolean;
  $isHovered: boolean;
  $hasError: boolean;
}>`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  
  /* Subtle border to show field location */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border: 2px solid ${props => {
      if (props.$hasError) return '#dc3545';
      if (props.$isFocused) return '#FF7900';
      if (props.$isHovered) return 'rgba(255, 121, 0, 0.4)';
      return 'transparent';
    }};
    border-radius: 4px;
    pointer-events: none;
    transition: all 0.2s ease;
    box-shadow: ${props => {
      if (props.$hasError) return '0 0 0 4px rgba(220, 53, 69, 0.1)';
      if (props.$isFocused) return '0 0 0 4px rgba(255, 121, 0, 0.2)';
      if (props.$isValid && props.$isHovered) return '0 0 0 4px rgba(22, 163, 74, 0.1)';
      return 'none';
    }};
  }
  
  /* Shake animation for errors */
  ${props => props.$hasError && `
    animation: shake 0.3s ease-in-out;
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }
  `}
`;

const StyledInput = styled.input<{ $scale: number }>`
  width: 100%;
  height: 100%;
  
  /* Glass morphism effect */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  
  border: none;
  border-radius: 4px;
  
  /* Typography - matches ID card style */
  font-family: 'Courier New', monospace;
  font-size: ${props => Math.max(10, 14 * props.$scale)}px;
  font-weight: 600;
  color: #212529;
  text-align: center;
  text-transform: uppercase;
  
  padding: 0 8px;
  
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
  
  &:focus {
    outline: none;
    background: white;
  }
  
  &::placeholder {
    color: #adb5bd;
    font-weight: 400;
  }
  
  &:read-only {
    background: rgba(240, 240, 240, 0.6);
    cursor: not-allowed;
  }
  
  /* Hide number spinners */
  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const StyledSelect = styled.select<{ $scale: number }>`
  width: 100%;
  height: 100%;
  
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(2px);
  
  border: none;
  border-radius: 4px;
  
  font-family: 'Courier New', monospace;
  font-size: ${props => Math.max(10, 14 * props.$scale)}px;
  font-weight: 600;
  color: #212529;
  text-align: center;
  text-transform: uppercase;
  
  padding: 0 8px;
  cursor: pointer;
  
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
  
  &:focus {
    outline: none;
    background: white;
  }
`;

const ValidationIcon = styled.div<{ $isValid: boolean }>`
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  
  width: 18px;
  height: 18px;
  border-radius: 50%;
  
  background: ${props => props.$isValid ? '#16a34a' : '#dc3545'};
  color: white;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  font-size: 12px;
  font-weight: 700;
  
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ErrorTooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  
  background: #dc3545;
  color: white;
  
  padding: 6px 12px;
  border-radius: 6px;
  
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  
  z-index: 1000;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    
    border: 6px solid transparent;
    border-top-color: #dc3545;
  }
`;

export default OverlayInput;

