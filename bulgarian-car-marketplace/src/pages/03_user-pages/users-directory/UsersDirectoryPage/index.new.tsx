// src/pages/UsersDirectoryPage/index.tsx
// ✅ REFACTORED: Users Directory Page with Service Layer & Performance Optimizations

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { useThrottle } from '@/hooks/useThrottle';
import { 
  Users, Search, MapPin, Building2, ArrowUpDown, Grid3x3, Circle, List,
  UserPlus, UserCheck, MessageCircle, CheckCircle, Award, Shield, TrendingUp
} from 'lucide-react';
import { BULGARIA_REGIONS } from '@/data/bulgaria-locations';
import { followService } from '@/services/social/follow.service';
import { usersDirectoryService } from '@/services/users/users-directory.service';
import { USERS_DIRECTORY_CONFIG } from '@/config/users-directory.config';
import { filterUsersBySearch, sortUsers } from '@/utils/userFilters';
import { BubblesGrid } from '@/components/UserBubble/BubblesGrid';
import { OnlineUsersRow } from '@/components/UserBubble/OnlineUsersRow';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
import { logger } from '@/services/logger-service';
import { toast } from 'react-toastify';

// ==================== STYLED COMPONENTS ====================
// (Keep all existing styled components - they're fine)
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f8fb 0%, #e8ecf1 100%);
  padding: 32px 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 12px 0;
    background: linear-gradient(135deg, #FF8F10 0%, #FFAD33 50%, #FF7900 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
  }
`;

const ControlsBar = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
`;

const ViewModeSelector = styled.div`
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 10px;
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: ${p => p.$active ? 'white' : 'transparent'};
  color: ${p => p.$active ? '#FF7900' : '#6c757d'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${p => p.$active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background: white;
    color: #FF7900;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    svg {
      color: #FF7900;
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(255, 143, 16, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 143, 16, 0.6);
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.25);
    background: rgba(255, 247, 237, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(255, 143, 16, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 143, 16, 0.6);
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.25);
    background: rgba(255, 247, 237, 0.5);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  svg {
    color: #FF7900;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  p {
    margin-top: 20px;
    font-size: 1.1rem;
    color: #6c757d;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  svg {
    color: #dee2e6;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.5rem;
    color: #495057;
    margin: 0 0 12px 0;
  }
  
  p {
    font-size: 1rem;
    color: #6c757d;
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  h3 {
    color: #dc3545;
    margin-bottom: 16px;
  }
  
  button {
    padding: 12px 24px;
    background: #FF7900;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
      background: #e66d00;
    }
  }
`;

// ==================== COMPONENT ====================

const UsersDirectoryPage: React.FC = () => {
  const { language } = useLanguage();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<BulgarianUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<BulgarianUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [profileTypeFilter, setProfileTypeFilter] = useState<'all' | 'private' | 'dealer' | 'company'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'trust' | 'listings'>('name');
  const [viewMode, setViewMode] = useState<'bubbles' | 'grid' | 'list'>('bubbles');
  
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [followingUserId, setFollowingUserId] = useState<string | null>(null);
  
  // ✅ Debounced search
  const debouncedSearch = useDebounce(searchTerm, USERS_DIRECTORY_CONFIG.TIMING.SEARCH_DEBOUNCE);
  
  // ✅ useMemo for filtered users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    
    // Search filter
    if (debouncedSearch) {
      filtered = filterUsersBySearch(filtered, debouncedSearch);
    }
    
    // Profile type filter
    if (profileTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.profileType === profileTypeFilter);
    }
    
    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.location?.region === regionFilter || user.location?.city === regionFilter
      );
    }
    
    // Sort
    return sortUsers(filtered, sortBy);
  }, [users, debouncedSearch, profileTypeFilter, regionFilter, sortBy]);
  
  // ✅ Load users on mount
  useEffect(() => {
    loadUsers();
    if (currentUser) {
      loadFollowingList();
    }
  }, [currentUser]);
  
  // ✅ Load initial users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await usersDirectoryService.getUsers({}, null);
      setUsers(result.users);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      
      // Load online users
      const online = await usersDirectoryService.getOnlineUsers();
      setOnlineUsers(online);
      
      logger.info('Users loaded successfully', { count: result.users.length });
    } catch (err) {
      const errorMsg = language === 'bg' ? 'Грешка при зареждане на потребители' : 'Error loading users';
      setError(errorMsg);
      logger.error('Error loading users', err as Error);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ Load more users
  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    
    try {
      setLoadingMore(true);
      const result = await usersDirectoryService.getUsers({}, lastDoc);
      
      setUsers(prev => [...prev, ...result.users]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      
      logger.info('More users loaded', { count: result.users.length });
    } catch (err) {
      logger.error('Error loading more users', err as Error);
      toast.error(language === 'bg' ? 'Грешка при зареждане' : 'Error loading more');
    } finally {
      setLoadingMore(false);
    }
  };
  
  // ✅ Load following list
  const loadFollowingList = async () => {
    if (!currentUser) return;
    
    try {
      const following = await followService.getFollowing(
        currentUser.uid, 
        USERS_DIRECTORY_CONFIG.LIMITS.MAX_FOLLOWING
      );
      setFollowingUsers(new Set(following));
    } catch (err) {
      logger.error('Error loading following list', err as Error);
    }
  };
  
  // ✅ Throttled follow handler
  const handleFollow = useThrottle(async (userId: string) => {
    if (!currentUser) {
      toast.warning(language === 'bg' ? 'Моля, влезте в профила си' : 'Please login');
      return;
    }
    
    if (followingUserId) return; // Prevent multiple clicks
    
    try {
      setFollowingUserId(userId);
      const isFollowing = followingUsers.has(userId);
      
      if (isFollowing) {
        await followService.unfollowUser(currentUser.uid, userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await followService.followUser(currentUser.uid, userId);
        setFollowingUsers(prev => new Set(prev).add(userId));
      }
    } catch (err) {
      logger.error('Error following/unfollowing user', err as Error);
      toast.error(language === 'bg' ? 'Грешка' : 'Error');
    } finally {
      setFollowingUserId(null);
    }
  }, USERS_DIRECTORY_CONFIG.TIMING.FOLLOW_THROTTLE);
  
  // ✅ Handle message
  const handleMessage = useCallback((userId: string) => {
    navigate(`/messages?user=${userId}`);
  }, [navigate]);
  
  // ✅ Handle user click
  const handleUserClick = useCallback((userId: string) => {
    navigate(`/profile/${userId}`);
  }, [navigate]);
  
  // Translations
  const t = (key: string) => {
    const translations: Record<string, any> = {
      bg: {
        title: 'Директория на потребителите',
        subtitle: 'Разгледайте всички потребители в платформата',
        search: 'Търсене по име или имейл',
        profileType: 'Тип профил',
        all: 'Всички',
        private: '🟠 Личен',
        dealer: '🟢 Дилър',
        company: '🔵 Компания',
        region: 'Регион',
        sortBy: 'Подреди по',
        name: 'Име',
        newest: 'Най-нови',
        trust: 'Доверие',
        listings: 'Обяви',
        results: 'резултата',
        loading: 'Зареждане на потребители...',
        noUsers: 'Не са намерени потребители',
        noUsersDesc: 'Опитайте да промените филтрите',
        retry: 'Опитай отново'
      },
      en: {
        title: 'Users Directory',
        subtitle: 'Browse all users on the platform',
        search: 'Search by name or email',
        profileType: 'Profile Type',
        all: 'All',
        private: '🟠 Private',
        dealer: '🟢 Dealer',
        company: '🔵 Company',
        region: 'Region',
        sortBy: 'Sort by',
        name: 'Name',
        newest: 'Newest',
        trust: 'Trust Score',
        listings: 'Listings',
        results: 'results',
        loading: 'Loading users...',
        noUsers: 'No users found',
        noUsersDesc: 'Try adjusting your filters',
        retry: 'Retry'
      }
    };
    return translations[language]?.[key] || key;
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingState>
            <Users size={64} />
            <p>{t('loading')}</p>
          </LoadingState>
        </Container>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <Container>
          <ErrorState>
            <h3>{error}</h3>
            <button onClick={loadUsers}>{t('retry')}</button>
          </ErrorState>
        </Container>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Container>
        <Header>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </Header>
        
        <ControlsBar>
          <ViewModeSelector>
            <ViewModeButton 
              $active={viewMode === 'bubbles'}
              onClick={() => setViewMode('bubbles')}
            >
              <Circle size={18} />
              Bubbles
            </ViewModeButton>
            
            <ViewModeButton 
              $active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={18} />
              Grid
            </ViewModeButton>
            
            <ViewModeButton 
              $active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
              List
            </ViewModeButton>
          </ViewModeSelector>
          
          <FilterGroup>
            <label>
              <Search size={16} />
              {t('search')}
            </label>
            <Input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxLength={USERS_DIRECTORY_CONFIG.LIMITS.MAX_SEARCH_LENGTH}
            />
          </FilterGroup>
          
          <FilterGroup style={{ maxWidth: '200px' }}>
            <label>
              <Building2 size={16} />
              {t('profileType')}
            </label>
            <Select 
              value={profileTypeFilter}
              onChange={(e) => setProfileTypeFilter(e.target.value as any)}
            >
              <option value="all">{t('all')}</option>
              <option value="private">{t('private')}</option>
              <option value="dealer">{t('dealer')}</option>
              <option value="company">{t('company')}</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup style={{ maxWidth: '200px' }}>
            <label>
              <MapPin size={16} />
              {t('region')}
            </label>
            <Select 
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="all">{t('all')}</option>
              {BULGARIA_REGIONS.map((region: any, index: number) => (
                <option key={index} value={region.name}>
                  {language === 'bg' ? region.name : region.nameEn}
                </option>
              ))}
            </Select>
          </FilterGroup>
          
          <FilterGroup style={{ maxWidth: '200px' }}>
            <label>
              <ArrowUpDown size={16} />
              {t('sortBy')}
            </label>
            <Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">{t('name')}</option>
              <option value="newest">{t('newest')}</option>
              <option value="trust">{t('trust')}</option>
              <option value="listings">{t('listings')}</option>
            </Select>
          </FilterGroup>
        </ControlsBar>
        
        {filteredUsers.length === 0 ? (
          <EmptyState>
            <Users size={80} />
            <h3>{t('noUsers')}</h3>
            <p>{t('noUsersDesc')}</p>
          </EmptyState>
        ) : viewMode === 'bubbles' ? (
          <>
            <OnlineUsersRow
              onlineUsers={onlineUsers}
              followingUsers={followingUsers}
              onFollow={handleFollow}
              onMessage={handleMessage}
            />
            
            <BubblesGrid
              users={filteredUsers}
              density="comfortable"
              bubbleSize="medium"
              followingUsers={followingUsers}
              onFollow={handleFollow}
              onMessage={handleMessage}
            />
          </>
        ) : (
          <div>Grid/List views - To be implemented</div>
        )}
      </Container>
    </PageContainer>
  );
};

export default UsersDirectoryPage;
