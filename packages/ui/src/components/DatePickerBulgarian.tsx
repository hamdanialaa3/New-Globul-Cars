// DatePickerBulgarian Component - Moved to @globul-cars/ui package
// Updated imports to use package aliases

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@globul-cars/core/contexts/LanguageContext';
import { Calendar, AlertCircle } from 'lucide-react';

interface DatePickerBulgarianProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  minDate?: string; // DD.MM.YYYY format
  maxDate?: string; // DD.MM.YYYY format
}

const DatePickerBulgarian: React.FC<DatePickerBulgarianProps> = ({
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
  minDate,
  maxDate
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  // Generate date options
  const generateDateOptions = () => {
    const options: { value: string; label: string; labelEn: string }[] = [];
    const currentYear = new Date().getFullYear();
    
    // Generate years from 1900 to current year + 10
    for (let year = currentYear + 10; year >= 1900; year--) {
      // Generate months
      for (let month = 1; month <= 12; month++) {
        const monthName = language === 'bg' 
          ? getMonthNameBG(month) 
          : getMonthNameEN(month);
        
        // Generate days (1-31)
        for (let day = 1; day <= 31; day++) {
          const dateStr = `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
          const isValidDate = isValidDateString(dateStr);
          
          if (isValidDate) {
            options.push({
              value: dateStr,
              label: `${day} ${monthName} ${year}`,
              labelEn: `${day} ${getMonthNameEN(month)} ${year}`
            });
          }
        }
      }
    }
    
    return options;
  };

  const getMonthNameBG = (month: number): string => {
    const months = [
      'януари', 'февруари', 'март', 'април', 'май', 'юни',
      'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'
    ];
    return months[month - 1];
  };

  const getMonthNameEN = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const isValidDateString = (dateStr: string): boolean => {
    const [day, month, year] = dateStr.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const validateDate = (dateStr: string): { isValid: boolean; message: string } => {
    if (!dateStr) {
      return { isValid: true, message: '' };
    }

    // Check format DD.MM.YYYY
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? 'Невалиден формат (DD.MM.YYYY)' 
          : 'Invalid format (DD.MM.YYYY)' 
      };
    }

    // Check if it's a valid date
    if (!isValidDateString(dateStr)) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? 'Невалидна дата' 
          : 'Invalid date' 
      };
    }

    // Check min/max date constraints
    if (minDate && dateStr < minDate) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? `Датата трябва да бъде след ${minDate}` 
          : `Date must be after ${minDate}` 
      };
    }

    if (maxDate && dateStr > maxDate) {
      return { 
        isValid: false, 
        message: language === 'bg' 
          ? `Датата трябва да бъде преди ${maxDate}` 
          : `Date must be before ${maxDate}` 
      };
    }

    return { isValid: true, message: '' };
  };

  useEffect(() => {
    setInputValue(value);
    const validation = validateDate(value);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
  }, [value, minDate, maxDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const validation = validateDate(newValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
    
    if (validation.isValid) {
      onChange(newValue);
    }
  };

  const handleSelectDate = (selectedDate: string) => {
    setInputValue(selectedDate);
    setIsOpen(false);
    onChange(selectedDate);
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return language === 'bg' ? 'дд.мм.гггг' : 'dd.mm.yyyy';
  };

  const dateOptions = generateDateOptions();

  return (
    <Container className={className} style={style}>
      {label && (
        <Label $required={required} $error={error}>
          {label}
          {required && <RequiredMark> *</RequiredMark>}
        </Label>
      )}

      <InputContainer>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
          $error={error || !isValid}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <CalendarIcon>
          <Calendar size={16} />
        </CalendarIcon>
      </InputContainer>

      {isOpen && (
        <DropdownMenu>
          <DropdownHeader>
            {language === 'bg' ? 'Изберете дата' : 'Select Date'}
          </DropdownHeader>
          <DropdownList>
            {dateOptions.slice(0, 100).map((option) => (
              <DropdownItem
                key={option.value}
                $isSelected={value === option.value}
                onClick={() => handleSelectDate(option.value)}
              >
                {language === 'bg' ? option.label : option.labelEn}
              </DropdownItem>
            ))}
          </DropdownList>
        </DropdownMenu>
      )}

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
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
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

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const CalendarIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
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

const DropdownHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
`;

const DropdownList = styled.div`
  max-height: 150px;
  overflow-y: auto;
`;

const DropdownItem = styled.div<{ $isSelected?: boolean }>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  background: ${props => props.$isSelected ? '#e3f2fd' : 'transparent'};
  color: #495057;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
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

export default DatePickerBulgarian;

