/**
 * AI Search Button Component - زر البحث الذكي
 * Triggers AI-powered natural language search
 * Shows loading state and handles errors gracefully
 * 
 * @since December 2025
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { aiQueryParserService } from '../../services/search/ai-query-parser.service';
import { logger } from '../../services/logger-service';

interface AISearchButtonProps {
  query: string;
  onSearch: (filters: any) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'icon';
}

const AISearchButton: React.FC<AISearchButtonProps> = ({ 
  query, 
  onSearch,
  disabled = false,
  variant = 'primary'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAISearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('🤖 AI Search initiated', { query });

      // Parse query with AI
      const aiFilters = await aiQueryParserService.parseQuery(query);
      
      logger.debug('AI parsed filters', { aiFilters });

      // Trigger search with parsed filters
      onSearch(aiFilters);

    } catch (err) {
      logger.error('AI Search failed', err as Error);
      setError('AI search failed. Using regular search...');
      
      // Fallback to regular search
      setTimeout(() => {
        onSearch({ text: query });
        setError(null);
      }, 1500);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Check if AI is available
  const isAIAvailable = aiQueryParserService.isServiceAvailable();

  if (!isAIAvailable && variant !== 'icon') {
    return null; // Hide button if AI not configured
  }

  if (variant === 'icon') {
    return (
      <IconButton 
        onClick={handleAISearch}
        disabled={disabled || isLoading}
        title="AI Smart Search"
      >
        {isLoading ? '⏳' : '🤖'}
      </IconButton>
    );
  }

  return (
    <Container>
      <Button
        onClick={handleAISearch}
        disabled={disabled || isLoading}
        variant={variant}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Thinking...</span>
          </>
        ) : (
          <>
            <Icon>🤖</Icon>
            <span>AI Smart Search</span>
          </>
        )}
      </Button>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Button = styled.button<{ variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.variant === 'secondary' ? '8px 16px' : '12px 24px'};
  border: none;
  border-radius: 8px;
  font-size: ${props => props.variant === 'secondary' ? '0.875rem' : '1rem'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  color: ${props => props.variant === 'secondary' ? '#667eea' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid #667eea' : 'none'};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Icon = styled.span`
  font-size: 1.25em;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
`;

export default AISearchButton;
