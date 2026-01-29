// NumberInputBulgarian Component - Number input with Bulgarian validation
// مكون إدخال الأرقام البلغاري - إدخال الأرقام مع التحقق البلغاري

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { Hash, AlertCircle } from 'lucide-react';

interface NumberInputBulgarianProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  allowDecimals?: boolean;
  allowNegative?: boolean;
}

const NumberInputBulgarian: React.FC<NumberInputBulgarianProps> = ({
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  className,
  style,
  min,
  max,
  step = 1,
  suffix,
  prefix,
  allowDecimals = false,
  allowNegative = false
}) => {
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState(value.toString());
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const validateNumber = (numStr: string): { isValid: boolean; message: string } => {
    if (!numStr) {
      return { isValid: true, message: '' };
    }

    // Check if it's a valid number
    const num = parseFloat(numStr);
    if (isNaN(num)) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? 'Невалидно число' 
          : 'Invalid number' 
      };
    }

    // Check if decimals are allowed
    if (!allowDecimals && numStr.includes('.')) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? 'Десетичните числа не са разрешени' 
          : 'Decimal numbers are not allowed' 
      };
    }

    // Check if negative numbers are allowed
    if (!allowNegative && num < 0) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? 'Отрицателните числа не са разрешени' 
          : 'Negative numbers are not allowed' 
      };
    }

    // Check min/max constraints
    if (min !== undefined && num < min) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? `Стойността трябва да бъде поне ${min}` 
          : `Value must be at least ${min}` 
      };
    }

    if (max !== undefined && num > max) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? `Стойността трябва да бъде най-много ${max}` 
          : `Value must be at most ${max}` 
      };
    }

    return { isValid: true, message: '' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Remove any non-numeric characters except decimal point and minus
    if (!allowDecimals) {
      newValue = newValue.replace(/[^\d-]/g, '');
    } else {
      newValue = newValue.replace(/[^\d.-]/g, '');
    }
    
    // Remove minus if negative numbers not allowed
    if (!allowNegative) {
      newValue = newValue.replace(/-/g, '');
    }
    
    // Ensure only one decimal point
    if (allowDecimals) {
      const parts = newValue.split('.');
      if (parts.length > 2) {
        newValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    
    setInputValue(newValue);
    
    const validation = validateNumber(newValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
    
    if (validation.isValid) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      // Allow decimal point
      if (allowDecimals && e.keyCode === 190) {
        return;
      }
      // Allow minus sign
      if (allowNegative && e.keyCode === 189) {
        return;
      }
      e.preventDefault();
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    let placeholderText = language === 'bg' ? 'Въведете число' : 'Enter number';
    
    if (min !== undefined && max !== undefined) {
      placeholderText = `${min} - ${max}`;
    } else if (min !== undefined) {
      placeholderText = `≥ ${min}`;
    } else if (max !== undefined) {
      placeholderText = `≤ ${max}`;
    }
    
    return placeholderText;
  };

  return (
    <Container className={className} style={style}>
      {label && (
        <Label $required={required} $error={error}>
          {label}
          {required && <RequiredMark> *</RequiredMark>}
        </Label>
      )}

      <InputContainer>
        {prefix && <PrefixText>{prefix}</PrefixText>}
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled}
          $error={error || !isValid}
          $hasPrefix={!!prefix}
          $hasSuffix={!!suffix}
        />
        {suffix && <SuffixText>{suffix}</SuffixText>}
        <NumberIcon>
          <Hash size={16} />
        </NumberIcon>
      </InputContainer>

      {(!isValid || error) && (validationMessage || errorMessage) && (
        <ErrorMessage>
          <AlertCircle size={14} />
          {errorMessage || validationMessage}
        </ErrorMessage>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Label = styled.label<{ $required?: boolean; $error?: boolean }>`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$error ? '#dc3545' : '#495057'};
  margin-bottom: 0.5rem;
  line-height: 1.2;
`;

const RequiredMark = styled.span`
  color: #dc3545;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Input = styled.input<{ $error?: boolean; $hasPrefix?: boolean; $hasSuffix?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.$hasPrefix ? '2rem' : '1rem'};
  padding-right: ${props => props.$hasSuffix ? '2rem' : '2.5rem'};
  border: 2px solid ${props => props.$error ? '#dc3545' : '#ced4da'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background: #ffffff;
  transition: all 0.2s ease;
  outline: none;
  text-align: right;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  &::placeholder {
    color: #6c757d;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const PrefixText = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1;
`;

const SuffixText = styled.span`
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1;
`;

const NumberIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
`;

const ErrorMessage = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc3545;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export default NumberInputBulgarian;
