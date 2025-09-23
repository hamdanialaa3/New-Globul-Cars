import React, { useState } from 'react';
import styled from 'styled-components';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SelectContainer>
      <SelectButton
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {value || placeholder}
        <SelectArrow>▼</SelectArrow>
      </SelectButton>

      {isOpen && (
        <SelectDropdown>
          <SearchInput
            type="text"
            placeholder="Търси..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <OptionList>
            <Option
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              {placeholder}
            </Option>
            {filteredOptions.map(option => (
              <Option
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                {option}
              </Option>
            ))}
          </OptionList>
        </SelectDropdown>
      )}
    </SelectContainer>
  );
};

// Styled Components
const SelectContainer = styled.div`
  position: relative;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:disabled {
    background: ${({ theme }) => theme.colors.grey[100]};
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SelectArrow = styled.span`
  font-size: 10px;
`;

const SelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  max-height: 200px;
  overflow: hidden;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};

  &:focus {
    outline: none;
  }
`;

const OptionList = styled.div`
  max-height: 150px;
  overflow-y: auto;
`;

const Option = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
  }
`;