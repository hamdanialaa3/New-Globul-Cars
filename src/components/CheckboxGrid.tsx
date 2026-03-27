import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';

interface CheckboxGridOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  count?: number;
}

interface CheckboxGridProps {
  options: CheckboxGridOption[];
  value: string[];
  onChange: (value: string[]) => void;
  columns?: number;
  maxSelections?: number;
  showCounts?: boolean;
  showDescriptions?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  onSelectionChange?: (selectedValues: string[]) => void;
}

const CheckboxGridContainer = styled.div`
  width: 100%;
`;

const CheckboxGridGrid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxGridItem = styled.label<{ 
  isSelected: boolean; 
  isDisabled: boolean;
  isError: boolean;
}>`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, isSelected, isError }) => {
    if (isError) return theme.colors.error.main;
    if (isSelected) return theme.colors.primary.main;
    return theme.colors.grey[300];
  }};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  background: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary.light + '10' : theme.colors.background.paper
  };
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  position: relative;

  &:hover:not(:disabled) {
    border-color: ${({ theme, isSelected, isError }) => {
      if (isError) return theme.colors.error.dark;
      if (isSelected) return theme.colors.primary.dark;
      return theme.colors.primary.main;
    }};
    background: ${({ theme, isSelected }) => 
      isSelected ? theme.colors.primary.light + '20' : theme.colors.grey[50]
    };
  }

  &:focus-within {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme, isError }) => 
      isError ? theme.colors.error.light + '40' : theme.colors.primary.light + '40'
    };
  }
`;

const CheckboxGridCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const CheckboxGridCheckboxIcon = styled.div<{ 
  isSelected: boolean; 
  isDisabled: boolean;
}>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme, isSelected, isDisabled }) => {
    if (isDisabled) return theme.colors.grey[300];
    if (isSelected) return theme.colors.primary.main;
    return theme.colors.grey[400];
  }};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  background: ${({ theme, isSelected, isDisabled }) => {
    if (isDisabled) return theme.colors.grey[100];
    if (isSelected) return theme.colors.primary.main;
    return 'transparent';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md};
  margin-top: 2px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${CheckboxGridItem}:hover & {
    border-color: ${({ theme, isSelected, isDisabled }) => {
      if (isDisabled) return theme.colors.grey[300];
      if (isSelected) return theme.colors.primary.dark;
      return theme.colors.primary.main;
    }};
  }
`;

const CheckboxGridContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CheckboxGridLabel = styled.div<{ isDisabled: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, isDisabled }) => 
    isDisabled ? theme.colors.text.disabled : theme.colors.text.primary
  };
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
`;

const CheckboxGridDescription = styled.div<{ isDisabled: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, isDisabled }) => 
    isDisabled ? theme.colors.text.disabled : theme.colors.text.secondary
  };
  line-height: 1.4;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CheckboxGridCount = styled.div<{ isDisabled: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, isDisabled }) => 
    isDisabled ? theme.colors.text.disabled : theme.colors.text.secondary
  };
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ theme, isDisabled }) => 
    isDisabled ? theme.colors.grey[100] : theme.colors.grey[200]
  };
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  display: inline-block;
`;

const CheckboxGridError = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const CheckboxGridInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CheckboxGrid: React.FC<CheckboxGridProps> = ({
  options,
  value,
  onChange,
  columns = 2,
  maxSelections,
  showCounts = false,
  showDescriptions = true,
  disabled = false,
  error = false,
  errorMessage,
  className,
  style,
  onSelectionChange,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);

  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const handleOptionChange = (optionValue: string, isChecked: boolean) => {
    if (disabled) return;

    let newSelectedValues: string[];
    
    if (isChecked) {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      newSelectedValues = [...selectedValues, optionValue];
    } else {
      newSelectedValues = selectedValues.filter(v => v !== optionValue);
    }

    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
    onSelectionChange?.(newSelectedValues);
  };

  const isOptionSelected = (optionValue: string) => {
    return selectedValues.includes(optionValue);
  };

  const isOptionDisabled = (option: CheckboxGridOption) => {
    if (disabled || option.disabled) return true;
    if (maxSelections && selectedValues.length >= maxSelections && !isOptionSelected(option.value)) {
      return true;
    }
    return false;
  };

  const getSelectionInfo = () => {
    if (maxSelections) {
      return `${selectedValues.length} / ${maxSelections} selected`;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <CheckboxGridContainer className={className} style={style}>
      <CheckboxGridGrid columns={columns}>
        {options.map((option) => {
          const isSelected = isOptionSelected(option.value);
          const isDisabled = isOptionDisabled(option);
          
          return (
            <CheckboxGridItem
              key={option.value}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isError={error}
            >
              <CheckboxGridCheckbox
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={(e) => handleOptionChange(option.value, e.target.checked)}
              />
              <CheckboxGridCheckboxIcon
                isSelected={isSelected}
                isDisabled={isDisabled}
              >
                {isSelected && <Check size={12} color="white" />}
              </CheckboxGridCheckboxIcon>
              <CheckboxGridContent>
                <CheckboxGridLabel isDisabled={isDisabled}>
                  {option.label}
                </CheckboxGridLabel>
                {showDescriptions && option.description && (
                  <CheckboxGridDescription isDisabled={isDisabled}>
                    {option.description}
                  </CheckboxGridDescription>
                )}
                {showCounts && option.count !== undefined && (
                  <CheckboxGridCount isDisabled={isDisabled}>
                    {option.count} items
                  </CheckboxGridCount>
                )}
              </CheckboxGridContent>
            </CheckboxGridItem>
          );
        })}
      </CheckboxGridGrid>

      {maxSelections && (
        <CheckboxGridInfo>
          {getSelectionInfo()}
        </CheckboxGridInfo>
      )}

      {error && errorMessage && (
        <CheckboxGridError>{errorMessage}</CheckboxGridError>
      )}
    </CheckboxGridContainer>
  );
};

export default CheckboxGrid;
