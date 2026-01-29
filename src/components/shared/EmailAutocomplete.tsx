// Email Autocomplete Component with Domain Suggestions
// مكون الإكمال التلقائي للإيميل مع اقتراحات النطاقات

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface EmailAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  valid?: boolean;
}

const EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'abv.bg',
  'mail.bg',
  'dir.bg',
  'icloud.com',
  'protonmail.com'
];

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input<{ $error?: boolean; $valid?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$error ? '#ef4444' : props.$valid ? '#22c55e' : 'var(--border)'};
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : 'var(--accent-primary)'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
`;

const SuggestionItem = styled.li<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: ${props => props.$active ? 'var(--accent-primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-primary);
    color: white;
  }
`;

export const EmailAutocomplete: React.FC<EmailAutocompleteProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'name@example.com',
  error = false,
  valid = false
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get username part and check if @ is present
    const atIndex = value.indexOf('@');
    
    if (atIndex > 0) {
      const username = value.substring(0, atIndex);
      const domain = value.substring(atIndex + 1);
      
      // Filter domains that match current input
      const matchedDomains = EMAIL_DOMAINS.filter(d => 
        d.toLowerCase().startsWith(domain.toLowerCase()) && domain !== d
      );
      
      // Generate suggestions
      const newSuggestions = matchedDomains.map(d => `${username}@${d}`);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
          onChange(suggestions[activeSuggestionIndex]);
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  return (
    <Container ref={containerRef}>
      <Input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        $error={error}
        $valid={valid}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={suggestion}
              $active={index === activeSuggestionIndex}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setActiveSuggestionIndex(index)}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </Container>
  );
};
