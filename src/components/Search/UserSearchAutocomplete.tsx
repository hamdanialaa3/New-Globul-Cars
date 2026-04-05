/**
 * UserSearchAutocomplete
 * Autocomplete dropdown for user search with live results
 * Used in StickySearchBar and UserSearchPage
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Search, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { userSearchService } from '../../services/search/user-search.service';
import { UserSearchResultCard } from './UserSearchResultCard';
import type { UserSearchResult } from '../../types/user-search.types';
import { logger } from '../../services/logger-service';

interface UserSearchAutocompleteProps {
  placeholder?: string;
  onSelect?: (user: UserSearchResult) => void;
}

export const UserSearchAutocomplete: React.FC<UserSearchAutocompleteProps> = ({
  placeholder,
  onSelect,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const generationRef = useRef(0);

  const defaultPlaceholder = language === 'bg'
    ? 'Търсене на потребител...'
    : 'Search users...';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    const gen = ++generationRef.current;
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const hits = await userSearchService.autocompleteUsers(q, 5);
      if (gen !== generationRef.current) return;
      setResults(hits);
      setOpen(hits.length > 0);
    } catch (err) {
      logger.error('User autocomplete failed', { error: err });
    } finally {
      if (gen === generationRef.current) setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 200);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleSelect = (user: UserSearchResult) => {
    setOpen(false);
    setQuery('');
    if (onSelect) {
      onSelect(user);
    } else {
      navigate(`/profile/view/${user.numericId}`);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate(`/search/users?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleViewAll();
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Wrapper ref={wrapperRef}>
      <InputRow>
        <SearchIcon>
          <Search size={18} />
        </SearchIcon>
        <Input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder || defaultPlaceholder}
          aria-label={defaultPlaceholder}
        />
        {query && (
          <ClearButton onClick={handleClear} type="button" aria-label="Clear">
            <X size={16} />
          </ClearButton>
        )}
      </InputRow>

      {open && (
        <Dropdown>
          {loading && <LoadingBar />}
          {results.map(user => (
            <DropdownItem key={user.objectID} onClick={() => handleSelect(user)}>
              <UserSearchResultCard user={user} compact />
            </DropdownItem>
          ))}
          {results.length > 0 && (
            <ViewAllButton onClick={handleViewAll}>
              <Users size={16} />
              {language === 'bg' ? 'Виж всички резултати' : 'View all results'}
            </ViewAllButton>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 480px;
`;

const InputRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  display: flex;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--bg-card);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--accent-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;

  &:hover { color: var(--text-tertiary); }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  border-bottom: 1px solid var(--border-primary);

  &:last-of-type {
    border-bottom: none;
  }

  /* Override card hover styling inside dropdown */
  > div {
    border: none;
    border-radius: 0;

    &:hover {
      box-shadow: none;
      background: var(--bg-hover);
      transform: none;
    }
  }
`;

const LoadingBar = styled.div`
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  animation: slide 1s infinite;

  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 14px;
  background: var(--bg-secondary);
  border: none;
  border-top: 1px solid var(--border-primary);
  color: var(--accent-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: var(--bg-hover);
  }
`;

export default UserSearchAutocomplete;
