// Saved Searches Page - Premium UI
// World-Class Implementation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSavedSearches } from '../hooks/useSavedSearches';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Search,
  Bell,
  BellOff,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react';
import { SavedSearch } from '../services/savedSearchesService';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
`;

const SearchGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
`;

const SearchCard = styled.div`
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #005ca9;
    transform: translateY(-2px);
  }
`;

const SearchName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchSummary = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
  line-height: 1.5;
`;

const SearchMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f1f1;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6c757d;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ResultsBadge = styled.span`
  background: #005ca9;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => 
    props.variant === 'primary' ? '#005ca9' :
    props.variant === 'danger' ? '#dc3545' :
    '#f8f9fa'
  };
  color: ${props => 
    props.variant === 'primary' || props.variant === 'danger' ? 'white' : '#212529'
  };

  &:hover {
    background: ${props => 
      props.variant === 'primary' ? '#004080' :
      props.variant === 'danger' ? '#c82333' :
      '#e9ecef'
    };
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 16px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 24px;
`;

const EmptyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #005ca9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #004080;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 92, 169, 0.3);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 64px 16px;
  font-size: 18px;
  color: #6c757d;
`;

const SavedSearchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { searches, loading, deleteSearch, toggleNotifications, duplicateSearch } = useSavedSearches();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearch = (search: SavedSearch) => {
    // Navigate to cars page with filters
    const params = new URLSearchParams();
    Object.entries(search.filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    navigate(`/cars?${params.toString()}`);
  };

  const handleDelete = async (e: React.MouseEvent, searchId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      setDeletingId(searchId);
      await deleteSearch(searchId);
      setDeletingId(null);
    }
  };

  const handleToggleNotifications = async (e: React.MouseEvent, searchId: string, currentValue: boolean) => {
    e.stopPropagation();
    await toggleNotifications(searchId, !currentValue);
  };

  const handleDuplicate = async (e: React.MouseEvent, searchId: string) => {
    e.stopPropagation();
    await duplicateSearch(searchId);
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return '1 day ago';
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      return `${Math.floor(days / 30)} months ago`;
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Loading saved searches...</LoadingState>
      </PageContainer>
    );
  }

  if (searches.length === 0) {
    return (
      <PageContainer>
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No Saved Searches</EmptyTitle>
          <EmptyText>
            Save your favorite searches to quickly find cars you're interested in
          </EmptyText>
          <EmptyButton onClick={() => navigate('/advanced-search')}>
            <Search size={20} />
            Start Searching
          </EmptyButton>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>
          <Search size={32} />
          Saved Searches ({searches.length})
        </Title>
        <Subtitle>Quickly access your favorite car searches</Subtitle>
      </Header>

      <SearchGrid>
        {searches.map((search) => (
          <SearchCard
            key={search.id}
            onClick={() => handleSearch(search)}
          >
            <SearchName>
              🔍 {search.name}
            </SearchName>
            
            <SearchSummary>
              {search.filters.make && `${search.filters.make} `}
              {search.filters.model && `${search.filters.model} `}
              {search.filters.yearMin && search.filters.yearMax && 
                `· ${search.filters.yearMin}-${search.filters.yearMax} `}
              {search.filters.location && `· ${search.filters.location}`}
            </SearchSummary>

            <SearchMeta>
              <ResultsBadge>
                {search.resultsCount} {search.resultsCount === 1 ? 'result' : 'results'}
              </ResultsBadge>
              <MetaItem>
                <Clock />
                {formatDate(search.createdAt)}
              </MetaItem>
            </SearchMeta>

            <Actions onClick={(e) => e.stopPropagation()}>
              <ActionButton
                variant="primary"
                onClick={() => handleSearch(search)}
                title="Search now"
              >
                <ExternalLink />
                Search
              </ActionButton>
              <ActionButton
                onClick={(e) => handleToggleNotifications(e, search.id, search.notifyOnNewResults)}
                title={search.notifyOnNewResults ? 'Disable notifications' : 'Enable notifications'}
              >
                {search.notifyOnNewResults ? <BellOff /> : <Bell />}
              </ActionButton>
              <ActionButton
                onClick={(e) => handleDuplicate(e, search.id)}
                title="Duplicate search"
              >
                <Copy />
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={(e) => handleDelete(e, search.id)}
                disabled={deletingId === search.id}
                title="Delete search"
              >
                <Trash2 />
              </ActionButton>
            </Actions>
          </SearchCard>
        ))}
      </SearchGrid>
    </PageContainer>
  );
};

export default SavedSearchesPage;
