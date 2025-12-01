// src/pages/UsersDirectoryPage/index.tsx
// Users Directory Page - Main Component
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { 
  Users, 
  Search, 
  MapPin, 
  Building2, 
  ArrowUpDown,
  Grid3x3,
  Circle,
  List,
  UserPlus,
  UserCheck,
  MessageCircle,
  CheckCircle,
  Award,
  Shield,
  TrendingUp
} from 'lucide-react';
import { collection, getDocs, query, limit, orderBy, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { BULGARIA_REGIONS } from '@/data/bulgaria-locations';
import { followService } from '@/services/social/follow.service';
import { logger } from '@/services/logger-service';
import { BubblesGrid } from '@/components/UserBubble/BubblesGrid';
import { OnlineUsersRow } from '@/components/UserBubble/OnlineUsersRow';

// ==================== TYPES ====================

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profileImage?: { url: string };
  profileType?: 'private' | 'dealer' | 'company';
  accountType?: 'individual' | 'business';
  location?: {
    city?: string;
    region?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    idVerified?: boolean;
    trustScore?: number;
  };
  stats?: {
    followers?: number;
    following?: number;
    listings?: number;
  };
  businessInfo?: {
    companyName?: string;
    dealerType?: string;
  };
  isOnline?: boolean;
  createdAt?: any;
}

// ==================== STYLED COMPONENTS ====================

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

const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg,
    rgba(255, 159, 42, 0.12) 0%,
    rgba(255, 215, 0, 0.08) 100%
  );
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #212529;
    font-weight: 700;
  }
  
  span {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
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

// ✅ IMPROVED: Professional Grid view
const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px; /* ✅ More spacing */
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

// ✅ NEW: Professional List View
const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ListItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  border: 1.5px solid rgba(255, 143, 16, 0.12);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative; /* ✅ For z-index stacking */
  z-index: 1; /* ✅ Base z-index */
  
  &:hover {
    transform: translateX(8px);
    border-color: rgba(255, 143, 16, 0.4);
    box-shadow: 0 6px 24px rgba(255, 143, 16, 0.18);
    z-index: 10; /* ✅ Bring to front on hover */
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const ListAvatar = styled.div<{ $imageUrl?: string; $initial: string; $borderColor: string }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #FF8F10 0%, #FF7900 50%, #FF6600 100%)'
  };
  background-size: cover;
  background-position: center;
  border: 3px solid ${p => p.$borderColor};
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.25);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: white;
  position: relative;
  
  &::before {
    content: '${p => !p.$imageUrl ? p.$initial : ''}';
  }
`;

const ListUserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ListUserName = styled.h3`
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 10px;
  
  .badge {
    font-size: 0.7rem;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: linear-gradient(135deg, #FF8F10 0%, #FF7900 100%);
    color: white;
    box-shadow: 0 2px 6px rgba(255, 143, 16, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .verified-icon {
    color: #1976D2;
  }
`;

const ListUserMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 4px;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    
    svg {
      color: #FF7900;
      flex-shrink: 0;
    }
  }
`;

const ListUserStats = styled.div`
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 143, 16, 0.08) 0%, rgba(255, 215, 0, 0.05) 100%);
  border-radius: 10px;
  margin-top: 12px;
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .value {
      font-size: 1.2rem;
      font-weight: 800;
      color: #FF7900;
      line-height: 1;
    }
    
    .label {
      font-size: 0.7rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
  }
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 10px 12px;
  }
`;

const ListActions = styled.div`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  ${p => p.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #FF7900 0%, #FF9533 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(255, 121, 0, 0.25);
      
      &:hover {
        background: linear-gradient(135deg, #e66d00 0%, #e68429 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 121, 0, 0.35);
      }
      
      &:active {
        transform: translateY(0);
      }
    `
    : `
      background: white;
      color: #495057;
      border: 1.5px solid #dee2e6;
      
      &:hover {
        background: #f8f9fa;
        border-color: #FF7900;
        color: #FF7900;
      }
    `
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 0.8rem;
  }
`;

const UserCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid rgba(255, 143, 16, 0.12);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 143, 16, 0.3);
    box-shadow: 0 10px 32px rgba(255, 143, 16, 0.15);
  }
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const Avatar = styled.div<{ $imageUrl?: string; $initial: string }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #FF8F10, #FF7900)'
  };
  background-size: cover;
  background-position: center;
  border: 3px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 28px;
  font-weight: 800;
  color: white;
  
  &::before {
    content: '${p => !p.$imageUrl ? p.$initial : ''}';
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.h3`
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .badge {
    font-size: 0.65rem;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 600;
    background: linear-gradient(135deg, #FF8F10 0%, #FF7900 100%);
    color: white;
    box-shadow: 0 2px 6px rgba(255, 143, 16, 0.3);
  }
`;

const UserEmail = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 4px;
`;

const UserLocation = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    color: #FF7900;
  }
`;

// ⚡ NEW: Load More Styled Components
const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
`;

const LoadMoreButton = styled.button`
  padding: 14px 32px;
  background: linear-gradient(135deg, #FF8F10 0%, #FF7900 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 143, 16, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #ccc;
  }
`;

const EndMessage = styled.div`
  text-align: center;
  padding: 30px 20px;
  font-size: 0.95rem;
  color: #6c757d;
  font-weight: 500;
`;

// ⚡ NEW: Quick Stats Dashboard
const QuickStatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ $highlight?: boolean }>`
  background: ${p => p.$highlight ? 'linear-gradient(135deg, #e7f3ff 0%, #ffffff 100%)' : 'white'};
  border: ${p => p.$highlight ? '2px solid #1877f2' : '1px solid #e0e0e0'};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-color: #FF7900;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  svg {
    color: #FF7900;
  }
`;

const StatBigNumber = styled.div<{ $color?: string }>`
  font-size: 32px;
  font-weight: 700;
  color: ${p => p.$color || '#212529'};
  line-height: 1;
  margin-bottom: 6px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #95a5a6;
  margin-top: 4px;
`;

const OnlinePulse = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #31a24c;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
`;

// ==================== COMPONENT ====================

const UsersDirectoryPage: React.FC = () => {
  const { language } = useLanguage();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ⚡ NEW: Pagination State
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'trust'>('name');
  const [viewMode, setViewMode] = useState<'bubbles' | 'grid' | 'list'>('bubbles');
  
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    loadUsers();
    if (currentUser) {
      loadFollowingList();
    }
  }, [currentUser]);
  
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, accountTypeFilter, regionFilter, sortBy]);
  
  // ⚡ UPDATED: Load initial users (30 max)
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(30) // Changed from 100 to 30
      );
      const snapshot = await getDocs(usersQuery);
      
      const loadedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      
      setUsers(loadedUsers);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 30);
      
      const online = loadedUsers.filter(u => u.isOnline).slice(0, 20);
      setOnlineUsers(online);
      
    } catch (error) {
      logger.error('Error loading users', error as Error);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ NEW: Load more users (pagination)
  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    
    try {
      setLoadingMore(true);
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(30)
      );
      const snapshot = await getDocs(usersQuery);
      
      const newUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      
      setUsers(prev => [...prev, ...newUsers]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 30);
      
    } catch (error) {
      logger.error('Error loading more users', error as Error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  const loadFollowingList = async () => {
    if (!currentUser) return;
    
    try {
      const following = await followService.getFollowing(currentUser.uid, 1000);
      setFollowingUsers(new Set(following));
    } catch (error) {
      logger.error('Error loading following', error as Error);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.accountType === accountTypeFilter);
    }
    
    if (regionFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.location?.region === regionFilter ||
        user.location?.city === regionFilter
      );
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'newest':
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        case 'trust':
          return (b.verification?.trustScore || 0) - (a.verification?.trustScore || 0);
        default:
          return 0;
      }
    });
    
    setFilteredUsers(filtered);
  };
  
  const handleFollow = async (userId: string) => {
    if (!currentUser) {
      alert(language === 'bg' ? 'Моля, влезте в профила си' : 'Please login');
      return;
    }
    
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
  };
  
  const handleMessage = (userId: string) => {
    alert('Messaging feature coming soon!');
  };
  
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      bg: {
        title: 'Директория на потребителите',
        subtitle: 'Разгледайте всички потребители в платформата',
        search: 'Търсене по име или имейл',
        accountType: 'Тип акаунт',
        all: 'Всички',
        individual: 'Индивидуален',
        business: 'Бизнес',
        region: 'Регион',
        sortBy: 'Подреди по',
        name: 'Име',
        newest: 'Най-нови',
        trust: 'Доверие',
        results: 'резултата',
        loading: 'Зареждане на потребители...',
        noUsers: 'Не са намерени потребители',
        noUsersDesc: 'Опитайте да промените филтрите',
        viewMode: 'Изглед'
      },
      en: {
        title: 'Users Directory',
        subtitle: 'Browse all users on the platform',
        search: 'Search by name or email',
        accountType: 'Account Type',
        all: 'All',
        individual: 'Individual',
        business: 'Business',
        region: 'Region',
        sortBy: 'Sort by',
        name: 'Name',
        newest: 'Newest',
        trust: 'Trust Score',
        results: 'results',
        loading: 'Loading users...',
        noUsers: 'No users found',
        noUsersDesc: 'Try adjusting your filters',
        viewMode: 'View Mode'
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
  
  return (
    <PageContainer>
      <Container>
        <Header>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </Header>

        {/* ⚡ NEW: Quick Stats Dashboard */}
        <QuickStatsBar>
          <StatCard>
            <StatHeader>
              <Users size={24} />
              <TrendingUp size={16} color="#31a24c" />
            </StatHeader>
            <StatBigNumber>{filteredUsers.length}</StatBigNumber>
            <StatLabel>{language === 'bg' ? 'Общо потребители' : 'Total Users'}</StatLabel>
            <StatSubtext>{language === 'bg' ? 'В текущия филтър' : 'In current filter'}</StatSubtext>
          </StatCard>

          <StatCard $highlight>
            <StatHeader>
              <Circle size={24} fill="#31a24c" />
              <OnlinePulse />
            </StatHeader>
            <StatBigNumber $color="#31a24c">
              {filteredUsers.filter(u => u.isOnline).length}
            </StatBigNumber>
            <StatLabel>{language === 'bg' ? 'Онлайн сега' : 'Online Now'}</StatLabel>
            <StatSubtext>{language === 'bg' ? 'Активни потребители' : 'Active users'}</StatSubtext>
          </StatCard>

          <StatCard>
            <StatHeader>
              <Shield size={24} />
            </StatHeader>
            <StatBigNumber>
              {filteredUsers.filter(u => u.verification?.emailVerified).length}
            </StatBigNumber>
            <StatLabel>{language === 'bg' ? 'Потвърдени' : 'Verified'}</StatLabel>
            <StatSubtext>
              {Math.round((filteredUsers.filter(u => u.verification?.emailVerified).length / (filteredUsers.length || 1)) * 100)}%
            </StatSubtext>
          </StatCard>

          <StatCard>
            <StatHeader>
              <Award size={24} />
            </StatHeader>
            <StatBigNumber>
              {Math.round(filteredUsers.reduce((sum, u) => sum + (u.verification?.trustScore || 0), 0) / (filteredUsers.length || 1))}
            </StatBigNumber>
            <StatLabel>{language === 'bg' ? 'Средна доверителност' : 'Avg Trust'}</StatLabel>
            <StatSubtext>Trust Score</StatSubtext>
          </StatCard>
        </QuickStatsBar>
        
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
            />
          </FilterGroup>
          
          <FilterGroup style={{ maxWidth: '200px' }}>
            <label>
              <Building2 size={16} />
              {t('accountType')}
            </label>
            <Select 
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value as 'all' | 'individual' | 'business')}
            >
              <option value="all">{t('all')}</option>
              <option value="individual">{t('individual')}</option>
              <option value="business">{t('business')}</option>
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
              {BULGARIA_REGIONS.map((region, index: number) => (
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
              onChange={(e) => setSortBy(e.target.value as 'name' | 'newest' | 'trust')}
            >
              <option value="name">{t('name')}</option>
              <option value="newest">{t('newest')}</option>
              <option value="trust">{t('trust')}</option>
            </Select>
          </FilterGroup>
        </ControlsBar>
        
        <StatsBar>
          <h3>{filteredUsers.length} {t('results')}</h3>
        </StatsBar>
        
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
        ) : viewMode === 'grid' ? (
          <UsersGrid>
            {filteredUsers.map((user) => (
              <UserCard key={user.uid} onClick={() => window.location.href = `/profile/${user.uid}`}>
                <UserHeader>
                  <Avatar 
                    $imageUrl={user.profileImage?.url}
                    $initial={user.displayName?.[0]?.toUpperCase() || '?'}
                  />
                  <UserInfo>
                    <UserName>
                      {user.displayName || 'User'}
                      {user.accountType === 'business' && (
                        <span className="badge">{t('business')}</span>
                      )}
                    </UserName>
                    <UserEmail>
                      {user.businessInfo?.companyName || user.email}
                    </UserEmail>
                    {user.location && (
                      <UserLocation>
                        <MapPin size={14} />
                        {language === 'bg' ? user.location.region : user.location.city}
                      </UserLocation>
                    )}
                  </UserInfo>
                </UserHeader>
              </UserCard>
            ))}
          </UsersGrid>
        ) : (
          <UsersList>
            {filteredUsers.map((user) => {
              const borderColor = user.profileType === 'dealer' ? '#16a34a' 
                                : user.profileType === 'company' ? '#1d4ed8' 
                                : '#FF8F10';
              const isVerified = user.verification?.emailVerified || user.verification?.phoneVerified;
              
              return (
                <ListItem key={user.uid} onClick={() => window.location.href = `/profile/${user.uid}`}>
                  <ListAvatar 
                    $imageUrl={user.profileImage?.url}
                    $initial={user.displayName?.[0]?.toUpperCase() || '?'}
                    $borderColor={borderColor}
                  />
                  
                  <ListUserInfo>
                    <ListUserName>
                      {user.displayName || 'User'}
                      {isVerified && (
                        <CheckCircle size={18} className="verified-icon" />
                      )}
                      {user.accountType === 'business' && (
                        <span className="badge">
                          {user.profileType === 'dealer' ? (language === 'bg' ? 'Дилър' : 'Dealer')
                           : user.profileType === 'company' ? (language === 'bg' ? 'Компания' : 'Company')
                           : t('business')}
                        </span>
                      )}
                    </ListUserName>
                    
                    <ListUserMeta>
                      {user.businessInfo?.companyName && (
                        <div className="meta-item">
                          <Building2 size={16} />
                          <span>{user.businessInfo.companyName}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="meta-item">
                          <MapPin size={16} />
                          <span>{language === 'bg' ? user.location.region || user.location.city : user.location.city || user.location.region}</span>
                        </div>
                      )}
                    </ListUserMeta>
                    
                    <ListUserStats>
                      <div className="stat">
                        <div className="value">{user.stats?.followers || 0}</div>
                        <div className="label">{language === 'bg' ? 'Последователи' : 'Followers'}</div>
                      </div>
                      <div className="stat">
                        <div className="value">{user.stats?.listings || 0}</div>
                        <div className="label">{language === 'bg' ? 'Обяви' : 'Listings'}</div>
                      </div>
                      <div className="stat">
                        <div className="value">{user.verification?.trustScore || 0}</div>
                        <div className="label">{language === 'bg' ? 'Доверие' : 'Trust'}</div>
                      </div>
                    </ListUserStats>
                  </ListUserInfo>
                  
                  <ListActions>
                    <ActionButton 
                      $variant="primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessage(user.uid);
                      }}
                    >
                      <MessageCircle size={16} />
                      {language === 'bg' ? 'Съобщение' : 'Message'}
                    </ActionButton>
                    <ActionButton 
                      $variant={followingUsers.has(user.uid) ? 'secondary' : 'primary'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(user.uid);
                      }}
                    >
                      {followingUsers.has(user.uid) ? (
                        <>
                          <UserCheck size={16} />
                          {language === 'bg' ? 'Следвам' : 'Following'}
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          {language === 'bg' ? 'Последвай' : 'Follow'}
                        </>
                      )}
                    </ActionButton>
                  </ListActions>
                </ListItem>
              );
            })}
          </UsersList>
        )}

        {/* ⚡ NEW: Load More Button */}
        {!loading && filteredUsers.length > 0 && hasMore && (
          <LoadMoreContainer>
            <LoadMoreButton onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                language === 'bg' ? 'Зареждане...' : 'Loading...'
              ) : (
                language === 'bg' ? 'Зареди още' : 'Load More'
              )}
            </LoadMoreButton>
          </LoadMoreContainer>
        )}

        {!loading && !hasMore && filteredUsers.length > 0 && (
          <EndMessage>
            {language === 'bg' 
              ? `Показани всички ${filteredUsers.length} потребители` 
              : `Showing all ${filteredUsers.length} users`}
          </EndMessage>
        )}
      </Container>
    </PageContainer>
  );
};

export default UsersDirectoryPage;

