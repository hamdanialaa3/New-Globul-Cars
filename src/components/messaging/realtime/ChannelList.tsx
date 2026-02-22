/**
 * 📋 ChannelList Component
 * مكون قائمة القنوات
 * 
 * @description Sidebar/list of all conversations
 * الشريط الجانبي/قائمة جميع المحادثات
 * 
 * @author Claude Opus 4.5 - Chief Architect
 * @date January 8, 2026
 */

import React, { useState, useMemo } from 'react';
import styledBase, { keyframes } from 'styled-components';
import { Search, MessageSquarePlus, Filter, Inbox } from 'lucide-react';

import { RealtimeChannel } from '../../../services/messaging/realtime';
import { useLanguage } from '../../../contexts/LanguageContext';

import { ChannelListItem } from './ChannelListItem';

// Alias for styled-components
const styled = styledBase;

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ==================== STYLED COMPONENTS ====================

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary, #ffffff);
  animation: ${fadeIn} 0.3s ease;
  transition: background-color 0.3s ease;
  
  [data-theme='dark'] & {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }
`;

const Header = styled.header`
  padding: 20px 16px;
  background: var(--bg-secondary, #f8f9fa);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  transition: all 0.3s ease;
  
  [data-theme='dark'] & {
    background: rgba(15, 23, 42, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1a1d2e);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.3s ease;
  
  [data-theme='dark'] & {
    color: #fff;
  }
`;

const TitleIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  background: var(--bg-hover, rgba(0, 0, 0, 0.03));
  color: var(--text-primary, #1a1d2e);
  font-size: 14px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: var(--text-secondary, #64748b);
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary, #3b82f6);
    background: var(--bg-active, rgba(59, 130, 246, 0.05));
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  [data-theme='dark'] & {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    
    &:focus {
      border-color: rgba(59, 130, 246, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary, #64748b);
  width: 18px;
  height: 18px;
  transition: color 0.3s ease;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  overflow-x: auto;
  transition: border-color 0.3s ease;
  
  [data-theme='dark'] & {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterTab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
      : 'var(--bg-hover, rgba(0, 0, 0, 0.05))'};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--text-secondary, #64748b)')};
  
  &:hover {
    background: ${({ $active }) =>
      $active
        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
        : 'var(--bg-active, rgba(0, 0, 0, 0.1))'};
    color: ${({ $active }) => ($active ? '#fff' : 'var(--text-primary, #1a1d2e)')};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  [data-theme='dark'] & {
    background: ${({ $active }) =>
      $active
        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
        : 'rgba(255, 255, 255, 0.05)'};
    color: ${({ $active }) => ($active ? '#fff' : '#94a3b8')};
    
    &:hover {
      background: ${({ $active }) =>
        $active
          ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100())'
          : 'rgba(255, 255, 255, 0.1)'};
      color: #fff;
    }
  }
`;

const ChannelsScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  animation: ${slideIn} 0.5s ease;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  svg {
    width: 40px;
    height: 40px;
    color: #60a5fa;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  color: var(--text-primary, #1a1d2e);
  margin-bottom: 8px;
  font-weight: 600;
  transition: color 0.3s ease;
  
  [data-theme='dark'] & {
    color: #fff;
  }
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  max-width: 280px;
  margin-bottom: 24px;
  line-height: 1.5;
  transition: color 0.3s ease;
  
  [data-theme='dark'] & {
    color: #94a3b8;
  }
`;

const ExploreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.35);
  }
`;

const LoadingSkeleton = styled.div`
  padding: 16px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const SkeletonAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const SkeletonContent = styled.div`
  flex: 1;
`;

const SkeletonLine = styled.div<{ $width?: string }>`
  height: 14px;
  border-radius: 4px;
  margin-bottom: 8px;
  width: ${({ $width }) => $width || '100%'};
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const UnreadBadge = styled.span`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
`;

// ==================== INTERFACES ====================

type FilterType = 'all' | 'unread' | 'buying' | 'selling' | 'offers';

interface ChannelListProps {
  channels: RealtimeChannel[];
  activeChannelId?: string;
  currentUserNumericId: number;
  isLoading?: boolean;
  onSelectChannel: (channelId: string) => void;
  onNewConversation?: () => void;
}

// ==================== COMPONENT ====================

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeChannelId,
  currentUserNumericId,
  isLoading = false,
  onSelectChannel,
  onNewConversation: _onNewConversation, // Prefixed with _ for future use
}) => {
  const { language } = useLanguage();
  const locale = language === 'bg' ? 'bg' : 'en';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Translations
  const translations = {
    title: locale === 'bg' ? 'Съобщения' : 'Messages',
    search: locale === 'bg' ? 'Търсене в съобщенията...' : 'Search messages...',
    all: locale === 'bg' ? 'Всички' : 'All',
    unread: locale === 'bg' ? 'Непрочетени' : 'Unread',
    buying: locale === 'bg' ? 'Купувам' : 'Buying',
    selling: locale === 'bg' ? 'Продавам' : 'Selling',
    offers: locale === 'bg' ? 'Оферти' : 'Offers',
    emptyTitle: locale === 'bg' ? 'Няма съобщения' : 'No Messages',
    emptyDesc: locale === 'bg' 
      ? 'Все още нямате съобщения. Разгледайте автомобили и започнете разговор с продавач!'
      : 'You have no messages yet. Browse cars and start a conversation with a seller!',
    explore: locale === 'bg' ? 'Разгледай автомобили' : 'Explore Cars',
    noResults: locale === 'bg' ? 'Няма резултати' : 'No Results',
    noResultsDesc: locale === 'bg'
      ? 'Опитайте с различни ключови думи'
      : 'Try different keywords',
  };
  
  // Calculate unread count
  const unreadCount = useMemo(() => {
    return channels.reduce((count, channel) => {
      const unreadMap = channel.unreadCount || {};
      const unread = unreadMap[String(currentUserNumericId)] || 0;
      return count + unread;
    }, 0);
  }, [channels, currentUserNumericId]);
  
  // Filter and search channels
  const filteredChannels = useMemo(() => {
    let result = [...channels];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((channel) => {
        const carTitle = channel.carTitle?.toLowerCase() || '';
        const buyerName = (channel.buyerDisplayName || channel.buyerName || '').toLowerCase();
        const sellerName = (channel.sellerDisplayName || channel.sellerName || '').toLowerCase();
        const lastMessageContent = channel.lastMessage?.content?.toLowerCase() || '';
        
        return (
          carTitle.includes(query) ||
          buyerName.includes(query) ||
          sellerName.includes(query) ||
          lastMessageContent.includes(query)
        );
      });
    }
    
    // Apply filter type
    switch (activeFilter) {
      case 'unread':
        result = result.filter((channel) => {
          const unreadMap = channel.unreadCount || {};
          const unread = unreadMap[String(currentUserNumericId)] || 0;
          return unread > 0;
        });
        break;
        
      case 'buying':
        result = result.filter((channel) => 
          channel.buyerNumericId === currentUserNumericId
        );
        break;
        
      case 'selling':
        result = result.filter((channel) => 
          channel.sellerNumericId === currentUserNumericId
        );
        break;
        
      case 'offers':
        result = result.filter((channel) => 
          channel.hasActiveOffer === true
        );
        break;
    }
    
    // Sort by last activity (use updatedAt as fallback)
    result.sort((a, b) => {
      const aTime = a.lastActivityAt || a.updatedAt || 0;
      const bTime = b.lastActivityAt || b.updatedAt || 0;
      return bTime - aTime;
    });
    
    return result;
  }, [channels, searchQuery, activeFilter, currentUserNumericId]);
  
  // Loading skeletons
  if (isLoading && channels.length === 0) {
    return (
      <ListContainer>
        <Header>
          <Title>
            <TitleIcon>
              <Inbox size={20} color="#fff" />
            </TitleIcon>
            {translations.title}
          </Title>
          <SearchContainer>
            <SearchIcon />
            <SearchInput placeholder={translations.search} value="" disabled />
          </SearchContainer>
        </Header>
        
        <ChannelsScroll>
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingSkeleton key={i}>
              <SkeletonAvatar />
              <SkeletonContent>
                <SkeletonLine $width="70%" />
                <SkeletonLine $width="90%" />
                <SkeletonLine $width="40%" />
              </SkeletonContent>
            </LoadingSkeleton>
          ))}
        </ChannelsScroll>
      </ListContainer>
    );
  }
  
  return (
    <ListContainer>
      <Header>
        <Title>
          <TitleIcon>
            <Inbox size={20} color="#fff" />
          </TitleIcon>
          {translations.title}
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </Title>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            placeholder={translations.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </Header>
      
      <FilterTabs>
        <FilterTab
          $active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          {translations.all}
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'unread'}
          onClick={() => setActiveFilter('unread')}
        >
          {translations.unread}
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'buying'}
          onClick={() => setActiveFilter('buying')}
        >
          {translations.buying}
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'selling'}
          onClick={() => setActiveFilter('selling')}
        >
          {translations.selling}
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'offers'}
          onClick={() => setActiveFilter('offers')}
        >
          {translations.offers}
        </FilterTab>
      </FilterTabs>
      
      <ChannelsScroll>
        {filteredChannels.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              {searchQuery ? <Filter /> : <Inbox />}
            </EmptyIcon>
            <EmptyTitle>
              {searchQuery ? translations.noResults : translations.emptyTitle}
            </EmptyTitle>
            <EmptyDescription>
              {searchQuery ? translations.noResultsDesc : translations.emptyDesc}
            </EmptyDescription>
            {!searchQuery && (
              <ExploreButton onClick={() => window.location.href = '/cars'}>
                <MessageSquarePlus size={18} />
                {translations.explore}
              </ExploreButton>
            )}
          </EmptyState>
        ) : (
          filteredChannels.map((channel) => (
            <ChannelListItem
              key={channel.id}
              channel={channel}
              isActive={channel.id === activeChannelId}
              currentUserNumericId={currentUserNumericId}
              onClick={() => onSelectChannel(channel.id)}
            />
          ))
        )}
      </ChannelsScroll>
    </ListContainer>
  );
};

export default ChannelList;
