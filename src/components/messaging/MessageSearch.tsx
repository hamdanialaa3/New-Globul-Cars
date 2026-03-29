/**
 * Message Search Component
 * ========================
 * Search across all conversations
 * 
 * @gpt-suggestion Phase 5.4 - Message search feature
 * @author Implementation - January 14, 2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Search, X, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import { ref, get, query, orderByChild } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { logger } from '@/services/logger-service';
import { sanitizeHighlight } from '@/utils/sanitize-html';

/**
 * Search result interface
 */
export interface MessageSearchResult {
  channelId: string;
  messageId: string;
  content: string;
  senderNumericId: number;
  senderName?: string;
  timestamp: number;
  carTitle?: string;
  highlightedContent?: string;
}

interface MessageSearchProps {
  /** Current user's numeric ID */
  userNumericId: number;
  /** Callback when result is clicked */
  onResultClick?: (channelId: string, messageId: string) => void;
  /** Custom className */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Message Search Component
 * 
 * @description Full-text search across all user's conversations
 * @example
 * <MessageSearch userNumericId={18} onResultClick={handleClick} />
 */
export const MessageSearch: React.FC<MessageSearchProps> = ({
  userNumericId,
  onResultClick,
  className,
  placeholder = 'Search messages...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Load recent searches from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem(`recent_searches_${userNumericId}`);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, [userNumericId]);
  
  /**
   * Save recent search
   */
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(t => t !== term)].slice(0, 5);
      localStorage.setItem(`recent_searches_${userNumericId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userNumericId]);
  
  /**
   * Perform search
   */
  const performSearch = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const db = getDatabase();
      
      // Get user's channels
      const userChannelsRef = ref(db, `user_channels/${userNumericId}`);
      const channelsSnapshot = await get(userChannelsRef);
      
      if (!channelsSnapshot.exists()) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      const channels = Object.keys(channelsSnapshot.val());
      const allResults: MessageSearchResult[] = [];
      
      // Search in each channel
      for (const channelId of channels) {
        const messagesRef = ref(db, `messages/${channelId}`);
        const messagesSnapshot = await get(messagesRef);
        
        if (!messagesSnapshot.exists()) continue;
        
        const messages = messagesSnapshot.val();
        
        // Filter messages by search term
        for (const [messageId, message] of Object.entries(messages)) {
          const msg = message as any;
          
          // Skip deleted messages
          if (msg.deleted || (msg.deletedFor && msg.deletedFor.includes(userNumericId))) {
            continue;
          }
          
          // Check if content matches
          const content = msg.content || '';
          if (content.toLowerCase().includes(term.toLowerCase())) {
            // Highlight matching text
            const regex = new RegExp(`(${term})`, 'gi');
            const highlightedContent = content.replace(
              regex,
              '<mark>$1</mark>'
            );
            
            allResults.push({
              channelId,
              messageId,
              content,
              senderNumericId: msg.senderNumericId,
              senderName: msg.senderName,
              timestamp: msg.timestamp,
              carTitle: msg.carTitle,
              highlightedContent
            });
          }
        }
      }
      
      // Sort by timestamp (newest first)
      allResults.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit to 50 results
      setResults(allResults.slice(0, 50));
      
      logger.info('[MessageSearch] Search completed', {
        term,
        resultCount: allResults.length,
        userId: userNumericId
      });
      
    } catch (error) {
      logger.error('[MessageSearch] Search failed', error as Error, {
        term,
        userId: userNumericId
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [userNumericId]);
  
  /**
   * Handle search input change (debounced)
   */
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value.trim());
        saveRecentSearch(value.trim());
      }, 500);
    } else {
      setResults([]);
    }
  };
  
  /**
   * Handle result click
   */
  const handleResultClick = (result: MessageSearchResult) => {
    if (onResultClick) {
      onResultClick(result.channelId, result.messageId);
    }
    setIsOpen(false);
    setSearchTerm('');
  };
  
  /**
   * Format timestamp
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - timestamp) / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  return (
    <SearchContainer className={className}>
      <SearchInputWrapper>
        <SearchIcon>
          <Search size={18} />
        </SearchIcon>
        
        <SearchInput
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-label="Search messages"
        />
        
        {searchTerm && (
          <ClearButton
            onClick={() => {
              setSearchTerm('');
              setResults([]);
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </ClearButton>
        )}
      </SearchInputWrapper>
      
      {isOpen && (
        <ResultsDropdown>
          {isLoading && (
            <LoadingState>
              <LoadingSpinner />
              Searching...
            </LoadingState>
          )}
          
          {!isLoading && searchTerm && results.length === 0 && (
            <EmptyState>
              No messages found for "{searchTerm}"
            </EmptyState>
          )}
          
          {!isLoading && !searchTerm && recentSearches.length > 0 && (
            <>
              <SectionHeader>Recent Searches</SectionHeader>
              {recentSearches.map((term, index) => (
                <RecentSearchItem
                  key={index}
                  onClick={() => handleSearchChange(term)}
                >
                  <Clock size={14} />
                  {term}
                </RecentSearchItem>
              ))}
            </>
          )}
          
          {!isLoading && results.length > 0 && (
            <>
              <SectionHeader>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </SectionHeader>
              {results.map((result) => (
                <ResultItem
                  key={`${result.channelId}_${result.messageId}`}
                  onClick={() => handleResultClick(result)}
                >
                  <ResultIcon>
                    <MessageCircle size={16} />
                  </ResultIcon>
                  
                  <ResultContent>
                    <ResultMeta>
                      {result.carTitle && (
                        <CarTitle>{result.carTitle}</CarTitle>
                      )}
                      <ResultTime>{formatTime(result.timestamp)}</ResultTime>
                    </ResultMeta>
                    
                    <ResultText
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHighlight(result.highlightedContent || result.content)
                      }}
                    />
                  </ResultContent>
                  
                  <ResultArrow>
                    <ArrowRight size={16} />
                  </ResultArrow>
                </ResultItem>
              ))}
            </>
          )}
        </ResultsDropdown>
      )}
      
      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}
    </SearchContainer>
  );
};

// ==================== STYLED COMPONENTS ====================

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 40px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #6b7280;
  }
`;

const ResultsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const SectionHeader = styled.div`
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
`;

const RecentSearchItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  svg {
    color: #9ca3af;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f9fafb;
  }
`;

const ResultIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eff6ff;
  color: #3b82f6;
  flex-shrink: 0;
`;

const ResultContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CarTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
`;

const ResultTime = styled.span`
  font-size: 12px;
  color: #9ca3af;
`;

const ResultText = styled.div`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  
  /* Truncate long text */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  mark {
    background: #fef3c7;
    color: #92400e;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
  }
`;

const ResultArrow = styled.div`
  display: flex;
  align-items: center;
  color: #d1d5db;
  flex-shrink: 0;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  font-size: 14px;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

export default MessageSearch;
