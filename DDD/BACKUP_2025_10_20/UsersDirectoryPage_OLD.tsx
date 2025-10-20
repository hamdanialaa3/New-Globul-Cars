// src/pages/UsersDirectoryPage.tsx
// Users Directory Page - دليل المستخدمين
// 🎯 Browse all users with filters and sorting
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  MapPin, 
  Building2, 
  UserCircle,
  Star,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { BULGARIA_REGIONS } from '../data/bulgaria-locations';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

// ==================== TYPES ====================

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  profileImage?: { url: string };
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
  businessInfo?: {
    companyName?: string;
    dealerType?: string;
  };
  createdAt?: any;
}

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg,
    #f5f8fb 0%,
    #e8ecf1 25%,
    #dce1e6 50%,
    #e8ecf1 75%,
    #f5f8fb 100%
  );
  background-size: 200% 200%;
  ${css`animation: ${shimmer} 15s ease infinite;`}
  padding: 32px 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  ${css`animation: ${fadeIn} 0.6s ease-out;`}
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
    filter: drop-shadow(0 2px 4px rgba(255, 143, 16, 0.2));
  }
  
  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin: 0;
  }
`;

const FiltersBar = styled.div`
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(252, 253, 254, 0.85) 100%
  );
  backdrop-filter: blur(16px) saturate(170%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 2px solid rgba(255, 143, 16, 0.15);
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 28px rgba(255, 143, 16, 0.1);
  
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
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

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UserCard = styled.div`
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(252, 253, 254, 0.85) 100%
  );
  backdrop-filter: blur(12px) saturate(160%);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid rgba(255, 143, 16, 0.12);
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 6px 20px rgba(0, 0, 0, 0.06);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Yellow bottom accent */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.8) 50%,
      rgba(255, 215, 0, 0) 100%
    );
  }
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 143, 16, 0.3);
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 10px 32px rgba(255, 143, 16, 0.15);
    
    &::after {
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
    }
  }
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, rgba(255, 159, 42, 0.35) 0%, rgba(255, 143, 16, 0.45) 50%, rgba(255, 121, 0, 0.55) 100%)'
  };
  background-size: cover;
  background-position: center;
  border: 3px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 143, 16, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: white;
    opacity: 0.8;
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

const UserStats = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(255, 143, 16, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  
  .value {
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #FF8F10 0%, #FF7900 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .label {
    font-size: 0.7rem;
    color: #6c757d;
    margin-top: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }
`;

const TrustBadge = styled.div<{ $score: number }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.$score >= 80) return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
    if (props.$score >= 50) return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
    return 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)';
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  svg {
    color: #dee2e6;
    margin-bottom: 20px;
    ${css`animation: ${float} 3s ease-in-out infinite;`}
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

// ==================== COMPONENT ====================

const UsersDirectoryPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'trust'>('name');
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, accountTypeFilter, regionFilter, sortBy]);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(100));
      const snapshot = await getDocs(usersQuery);
      
      const loadedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      
      setUsers(loadedUsers);
      console.log('✅ Loaded users:', loadedUsers.length);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...users];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Account type filter
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.accountType === accountTypeFilter);
    }
    
    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.location?.region === regionFilter ||
        user.location?.city === regionFilter
      );
    }
    
    // Sorting
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
  
  const handleUserClick = (userId: string) => {
    navigate(`/profile?userId=${userId}`);
  };
  
  const t = (key: string) => {
    const translations: Record<string, any> = {
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
        name: 'Име (А-Я)',
        newest: 'Най-нови',
        trust: 'Доверие',
        results: 'резултата',
        loading: 'Зареждане на потребители...',
        noUsers: 'Не са намерени потребители',
        noUsersDesc: 'Опитайте да промените филтрите',
        trustScore: 'Доверие',
        listings: 'Обяви',
        verified: 'Потвърден'
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
        name: 'Name (A-Z)',
        newest: 'Newest',
        trust: 'Trust Score',
        results: 'results',
        loading: 'Loading users...',
        noUsers: 'No users found',
        noUsersDesc: 'Try adjusting your filters',
        trustScore: 'Trust',
        listings: 'Listings',
        verified: 'Verified'
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
          <h1>
            <Users size={40} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px' }} />
            {t('title')}
          </h1>
          <p>{t('subtitle')}</p>
        </Header>
        
        {/* Filters */}
        <FiltersBar>
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
              onChange={(e) => setAccountTypeFilter(e.target.value as any)}
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
            </Select>
          </FilterGroup>
        </FiltersBar>
        
        {/* Results count */}
        <StatsBar>
          <h3>
            {filteredUsers.length} {t('results')}
          </h3>
        </StatsBar>
        
        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <EmptyState>
            <Users size={80} />
            <h3>{t('noUsers')}</h3>
            <p>{t('noUsersDesc')}</p>
          </EmptyState>
        ) : (
          <UsersGrid>
            {filteredUsers.map((user) => (
              <UserCard key={user.uid} onClick={() => handleUserClick(user.uid)}>
                <UserHeader>
                  <Avatar $imageUrl={user.profileImage?.url}>
                    {!user.profileImage?.url && <UserCircle size={32} />}
                  </Avatar>
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
                        {(() => {
                          const region = BULGARIA_REGIONS.find((r: any) => 
                            r.name === user.location?.region || r.nameEn === user.location?.region
                          );
                          return language === 'bg' ? region?.name : region?.nameEn;
                        })()}
                      </UserLocation>
                    )}
                  </UserInfo>
                </UserHeader>
                
                {/* Stats */}
                <UserStats>
                  <StatItem>
                    <div className="value">
                      {user.verification?.trustScore || 0}
                    </div>
                    <div className="label">{t('trustScore')}</div>
                  </StatItem>
                  
                  {user.verification && (
                    user.verification.emailVerified || 
                    user.verification.phoneVerified || 
                    user.verification.idVerified
                  ) && (
                    <TrustBadge $score={user.verification.trustScore || 0}>
                      <Star size={14} fill="currentColor" />
                      {t('verified')}
                    </TrustBadge>
                  )}
                </UserStats>
              </UserCard>
            ))}
          </UsersGrid>
        )}
      </Container>
    </PageContainer>
  );
};

export default UsersDirectoryPage;

