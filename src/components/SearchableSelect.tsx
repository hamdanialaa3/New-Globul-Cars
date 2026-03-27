import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown, Search, X } from 'lucide-react';

interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  maxHeight?: number;
  showSearch?: boolean;
  showClear?: boolean;
  groupBy?: boolean;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchableSelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchableSelectButton = styled.button<{ 
  isOpen: boolean; 
  disabled: boolean; 
  error: boolean;
  hasValue: boolean;
}>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, error }) => 
    error ? theme.colors.error.main : theme.colors.grey[300]
  };
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  background: ${({ theme, disabled }) => 
    disabled ? theme.colors.grey[100] : theme.colors.background.paper
  };
  color: ${({ theme, hasValue }) => 
    hasValue ? theme.colors.text.primary : theme.colors.text.secondary
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: left;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover:not(:disabled) {
    border-color: ${({ theme, error }) => 
      error ? theme.colors.error.dark : theme.colors.primary.main
    };
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => 
      error ? theme.colors.error.main : theme.colors.primary.main
    };
    box-shadow: 0 0 0 2px ${({ theme, error }) => 
      error ? theme.colors.error.light + '40' : theme.colors.primary.light + '40'
    };
  }

  ${({ isOpen }) => isOpen && `
    border-color: ${({ theme }: any) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }: any) => theme.colors.primary.light + '40'};
  `}
`;

const SearchableSelectValue = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SearchableSelectIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SearchableSelectIcon = styled.span<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const SearchableSelectClear = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SearchableSelectDropdown = styled.div<{ isOpen: boolean; maxHeight: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  max-height: ${({ maxHeight }) => maxHeight}px;
  overflow: hidden;
`;

const SearchableSelectSearch = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const SearchableSelectSearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-left: 40px;
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SearchableSelectSearchIcon = styled.div`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
`;

const SearchableSelectList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const SearchableSelectGroup = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.grey[50]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

const StyledSelectOption = styled.button<{ 
  isSelected: boolean; 
  isDisabled: boolean;
  isHighlighted: boolean;
}>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  background: ${({ theme, isSelected, isHighlighted }) => {
    if (isSelected) return theme.colors.primary.light + '20';
    if (isHighlighted) return theme.colors.grey[100];
    return 'transparent';
  }};
  color: ${({ theme, isSelected, isDisabled }) => {
    if (isDisabled) return theme.colors.text.disabled;
    if (isSelected) return theme.colors.primary.main;
    return theme.colors.text.primary;
  }};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: left;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[100]};

  &:hover:not(:disabled) {
    background: ${({ theme, isSelected }) => 
      isSelected ? theme.colors.primary.light + '20' : theme.colors.grey[100]
    };
  }

  &:focus {
    outline: none;
    background: ${({ theme, isSelected }) => 
      isSelected ? theme.colors.primary.light + '20' : theme.colors.grey[100]
    };
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SearchableSelectEmpty = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SearchableSelectError = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.error.main};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled = false,
  error = false,
  errorMessage,
  className,
  style,
  maxHeight = 300,
  showSearch = true,
  showClear = true,
  groupBy = false,
  onSearch,
  onFocus,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption = options.find(option => option.value === value);
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !option.disabled
  );

  const groupedOptions = groupBy
    ? filteredOptions.reduce((groups, option) => {
        const group = option.group || 'Other';
        if (!groups[group]) groups[group] = [];
        groups[group].push(option);
        return groups;
      }, {} as Record<string, SearchableSelectOption[]>)
    : { '': filteredOptions };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
    }
  }, [searchQuery, isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
    onBlur?.();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  return (
    <SearchableSelectContainer
      ref={containerRef}
      className={className}
      style={style}
    >
      <SearchableSelectButton
        type="button"
        isOpen={isOpen}
        disabled={disabled}
        error={error}
        hasValue={!!value}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <SearchableSelectValue>
          {selectedOption ? selectedOption.label : placeholder}
        </SearchableSelectValue>
        <SearchableSelectIcons>
          {showClear && value && (
            <SearchableSelectClear
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <X size={16} />
            </SearchableSelectClear>
          )}
          <SearchableSelectIcon isOpen={isOpen}>
            <ChevronDown size={16} />
          </SearchableSelectIcon>
        </SearchableSelectIcons>
      </SearchableSelectButton>

      <SearchableSelectDropdown isOpen={isOpen} maxHeight={maxHeight}>
        {showSearch && (
          <SearchableSelectSearch>
            <SearchableSelectSearchIcon>
              <Search size={16} />
            </SearchableSelectSearchIcon>
            <SearchableSelectSearchInput
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </SearchableSelectSearch>
        )}

        <SearchableSelectList>
          {Object.keys(groupedOptions).length === 0 || filteredOptions.length === 0 ? (
            <SearchableSelectEmpty>
              {searchQuery ? 'No options found' : 'No options available'}
            </SearchableSelectEmpty>
          ) : (
            Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              <div key={groupName}>
                {groupBy && groupName && (
                  <SearchableSelectGroup>{groupName}</SearchableSelectGroup>
                )}
                {groupOptions.map((option, index) => {
                  const globalIndex = filteredOptions.findIndex(o => o.value === option.value);
                  return (
                    <StyledSelectOption
                      key={option.value}
                      ref={(el: HTMLButtonElement | null) => { optionRefs.current[globalIndex] = el; }}
                      type="button"
                      isSelected={option.value === value}
                      isDisabled={option.disabled || false}
                      isHighlighted={globalIndex === highlightedIndex}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      onMouseEnter={() => handleOptionMouseEnter(globalIndex)}
                    >
                      {option.label}
                    </StyledSelectOption>
                  );
                })}
              </div>
            ))
          )}
        </SearchableSelectList>
      </SearchableSelectDropdown>

      {error && errorMessage && (
        <SearchableSelectError>{errorMessage}</SearchableSelectError>
      )}
    </SearchableSelectContainer>
  );
};

export default SearchableSelect;
