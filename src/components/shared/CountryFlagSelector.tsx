// Country Flag Selector Component with SVG Flags
// مكون اختيار دولة مع أعلام SVG

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { ALL_COUNTRIES } from '../../data/country-codes';

interface CountryFlagSelectorProps {
  value: string; // dial code like "+359"
  onChange: (dialCode: string) => void;
}

const Container = styled.div`
  position: relative;
  min-width: 140px;
  max-width: 160px;
`;

const SelectedButton = styled.button`
  width: 100%;
  height: 48px;
  padding: 0.75rem 2.5rem 0.75rem 3.5rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  position: relative;
  
  &:hover {
    border-color: var(--accent-primary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FlagContainer = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const DialCode = styled.span`
  flex: 1;
  text-align: left;
`;

const ChevronIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0.5rem 0;
`;

const CountryOption = styled.button<{ $active: boolean }>`
  width: 100%;
  height: 44px;
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.$active ? 'var(--accent-primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-primary);
    color: white;
  }
  
  img {
    width: 28px;
    height: 20px;
    object-fit: cover;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
`;

const CountryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
`;

const CountryName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
`;

const CountryCode = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
  font-family: monospace;
  flex-shrink: 0;
`;

// Get flag URL from flag CDN
const getFlagUrl = (countryCode: string): string => {
  // Using flagcdn.com for reliable SVG flags
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

export const CountryFlagSelector: React.FC<CountryFlagSelectorProps> = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry = ALL_COUNTRIES.find(c => c.dial === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (dialCode: string) => {
    onChange(dialCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter countries based on search
  const filteredCountries = searchQuery
    ? ALL_COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dial.includes(searchQuery)
      )
    : ALL_COUNTRIES;

  return (
    <Container ref={containerRef}>
      <SelectedButton onClick={() => setIsOpen(!isOpen)} type="button">
        {selectedCountry && (
          <>
            <FlagContainer>
              <img 
                src={getFlagUrl(selectedCountry.code)} 
                alt={selectedCountry.name}
                onError={(e) => {
                  // Fallback to emoji if CDN fails
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.textContent = selectedCountry.flag;
                    parent.style.fontSize = '1.5rem';
                  }
                }}
              />
            </FlagContainer>
            <DialCode>{selectedCountry.dial}</DialCode>
          </>
        )}
        <ChevronIcon>
          <ChevronDown size={18} />
        </ChevronIcon>
      </SelectedButton>

      {isOpen && (
        <DropdownList>
          {filteredCountries.map(country => (
            <CountryOption
              key={country.code}
              type="button"
              $active={country.dial === value}
              onClick={() => handleSelect(country.dial)}
            >
              <img 
                src={getFlagUrl(country.code)} 
                alt={country.name}
                onError={(e) => {
                  // Fallback to emoji
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const span = document.createElement('span');
                    span.textContent = country.flag;
                    span.style.fontSize = '1.5rem';
                    parent.appendChild(span);
                  }
                }}
              />
              <CountryInfo>
                <CountryName>{country.name}</CountryName>
                <CountryCode>{country.dial}</CountryCode>
              </CountryInfo>
            </CountryOption>
          ))}
        </DropdownList>
      )}
    </Container>
  );
};
