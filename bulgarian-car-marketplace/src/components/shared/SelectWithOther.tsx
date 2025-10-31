// SelectWithOther Component - Universal dropdown with "Other" option
// مكون القائمة المنسدلة مع خيار "آخر" - شامل ومتعدد الاستخدامات

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, Plus } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  labelEn?: string;
  disabled?: boolean;
}

interface SelectWithOtherProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  showOther?: boolean;
  otherPlaceholder?: string;
  otherLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  showOther = true,
  otherPlaceholder,
  otherLabel,
  className,
  style
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // Check if current value is "other" or not in options
  useEffect(() => {
    const isInOptions = options.some(option => option.value === value);
    if (!isInOptions && value && value !== '') {
      setIsOtherSelected(true);
      setOtherValue(value);
      setShowOtherInput(true);
    } else {
      setIsOtherSelected(false);
      setShowOtherInput(false);
    }
  }, [value, options]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'OTHER') {
      setShowOtherInput(true);
      setIsOtherSelected(true);
      setOtherValue('');
      onChange('');
    } else {
      setShowOtherInput(false);
      setIsOtherSelected(false);
      onChange(selectedValue);
    }
  };

  const handleOtherInputChange = (inputValue: string) => {
    setOtherValue(inputValue);
    onChange(inputValue);
  };

  const getDisplayValue = () => {
    if (isOtherSelected && otherValue) {
      return otherValue;
    }
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      return language === 'bg' ? selectedOption.label : (selectedOption.labelEn || selectedOption.label);
    }
    return '';
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return language === 'bg' ? 'Изберете...' : 'Select...';
  };

  const getOtherPlaceholder = () => {
    if (otherPlaceholder) return otherPlaceholder;
    return language === 'bg' ? 'Въведете...' : 'Enter...';
  };

  const getOtherLabel = () => {
    if (otherLabel) return otherLabel;
    return language === 'bg' ? '▼ Друго' : '▼ Other';
  };

  return (
    <Container className={className} style={style}>
      {label && (
        <Label $required={required} $error={error}>
          {label}
          {required && <RequiredMark> *</RequiredMark>}
        </Label>
      )}

      <SelectContainer>
        <SelectButton
          $isOpen={isOpen}
          $error={error}
          $disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <SelectValue $isEmpty={!getDisplayValue()}>
            {getDisplayValue() || getPlaceholder()}
          </SelectValue>
          <ChevronIcon $isOpen={isOpen} />
        </SelectButton>

        {isOpen && (
          <DropdownMenu>
            <DropdownList>
              {options.map((option) => (
                <DropdownItem
                  key={option.value}
                  $isSelected={value === option.value}
                  $disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      handleSelectChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                >
                  {language === 'bg' ? option.label : (option.labelEn || option.label)}
                </DropdownItem>
              ))}
              
              {showOther && (
                <DropdownItem
                  $isOther={true}
                  onClick={() => {
                    handleSelectChange('OTHER');
                    setIsOpen(false);
                  }}
                >
                  <OtherIcon>
                    <Plus size={14} />
                  </OtherIcon>
                  {getOtherLabel()}
                </DropdownItem>
              )}
            </DropdownList>
          </DropdownMenu>
        )}
      </SelectContainer>

      {showOtherInput && (
        <OtherInputContainer>
          <OtherInput
            type="text"
            value={otherValue}
            onChange={(e) => handleOtherInputChange(e.target.value)}
            placeholder={getOtherPlaceholder()}
            $error={error}
          />
        </OtherInputContainer>
      )}

      {error && errorMessage && (
        <ErrorMessage>{errorMessage}</ErrorMessage>
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

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ 
  $isOpen: boolean; 
  $error: boolean; 
  $disabled: boolean; 
}>`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid ${props => {
    if (props.$error) return '#dc3545';
    if (props.$isOpen) return '#007bff';
    return '#ced4da';
  }};
  border-radius: 8px;
  background: ${props => props.$disabled ? '#f8f9fa' : '#ffffff'};
  color: ${props => props.$disabled ? '#6c757d' : '#495057'};
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  appearance: none;
  outline: none;

  &:hover:not(:disabled) {
    border-color: ${props => props.$error ? '#dc3545' : '#007bff'};
  }

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const SelectValue = styled.span<{ $isEmpty: boolean }>`
  color: ${props => props.$isEmpty ? '#6c757d' : '#495057'};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChevronIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  width: 16px;
  height: 16px;
  color: #6c757d;
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border: 2px solid #007bff;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
`;

const DropdownList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const DropdownItem = styled.li<{ 
  $isSelected?: boolean; 
  $disabled?: boolean; 
  $isOther?: boolean; 
}>`
  padding: 0.75rem 1rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  background: ${props => {
    if (props.$isSelected) return '#e3f2fd';
    if (props.$isOther) return '#f8f9fa';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$disabled) return '#6c757d';
    if (props.$isOther) return '#005ca9';
    return '#495057';
  }};
  font-weight: ${props => props.$isOther ? '600' : '400'};
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover:not([disabled]) {
    background: ${props => props.$isOther ? '#e3f2fd' : '#f8f9fa'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OtherIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #005ca9;
  color: white;
  border-radius: 50%;
  flex-shrink: 0;
`;

const OtherInputContainer = styled.div`
  margin-top: 0.5rem;
`;

const OtherInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#dc3545' : '#ced4da'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background: #ffffff;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }

  &::placeholder {
    color: #6c757d;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc3545;
  line-height: 1.2;
`;

export default SelectWithOther;
