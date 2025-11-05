// AllUsersPage.tsx - All Users with Simple Filters
// ⚡ Compact & Professional Design

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { Users, Search, Filter, X } from 'lucide-react';
import CarCardCompact from '@/components/CarCard/CarCardCompact';

interface User {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  accountType?: 'private' | 'dealer' | 'company';
  createdAt?: any;
}

const AllUsersPage: React.FC = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'private' | 'dealer' | 'company'>('all');

  useEffect(() => {
    loadUsers();
  }, [filterType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      if (filterType !== 'all') {
        q = query(q, where('profileType', '==', filterType));
      }
      
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const t = {
    bg: {
      title: 'Всички потребители',
      subtitle: 'Преглед на всички регистрирани потребители',
      search: 'Търсене по име или имейл...',
      all: 'Всички',
      private: 'Личен',
      dealer: 'Дилър',
      company: 'Компания',
      noResults: 'Няма намерени потребители',
      total: 'Общо',
      users: 'потребители'
    },
    en: {
      title: 'All Users',
      subtitle: 'Browse all registered users',
      search: 'Search by name or email...',
      all: 'All',
      private: 'Private',
      dealer: 'Dealer',
      company: 'Company',
      noResults: 'No users found',
      total: 'Total',
      users: 'users'
    }
  };

  const text = t[language as 'bg' | 'en'];

  return (
    <Container>
      <Header>
        <Users size={24} />
        <div>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
      </Header>

      {/* Simple Filter Bar */}
      <FilterBar>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput
            type="text"
            placeholder={text.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <ClearButton onClick={() => setSearchQuery('')}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchWrapper>

        <FilterButtons>
          <FilterButton
            $active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          >
            {text.all}
          </FilterButton>
          <FilterButton
            $active={filterType === 'private'}
            onClick={() => setFilterType('private')}
          >
            {text.private}
          </FilterButton>
          <FilterButton
            $active={filterType === 'dealer'}
            onClick={() => setFilterType('dealer')}
          >
            {text.dealer}
          </FilterButton>
          <FilterButton
            $active={filterType === 'company'}
            onClick={() => setFilterType('company')}
          >
            {text.company}
          </FilterButton>
        </FilterButtons>
      </FilterBar>

      {/* Results Summary */}
      <ResultsSummary>
        {text.total}: <strong>{filteredUsers.length}</strong> {text.users}
      </ResultsSummary>

      {/* Users Grid */}
      {loading ? (
        <LoadingState>
          <div>Loading...</div>
        </LoadingState>
      ) : filteredUsers.length === 0 ? (
        <EmptyState>
          <Users size={48} color="#ccc" />
          <h3>{text.noResults}</h3>
        </EmptyState>
      ) : (
        <UsersGrid>
          {filteredUsers.map(user => (
            <UserCard key={user.id} to={`/profile/${user.id}`}>
              <UserAvatar>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} />
                ) : (
                  <Users size={32} color="#999" />
                )}
              </UserAvatar>
              <UserName>{user.displayName || user.email || 'User'}</UserName>
              <UserEmail>{user.email}</UserEmail>
              <UserType $type={user.accountType || 'private'}>
                {user.accountType === 'dealer' ? text.dealer : 
                 user.accountType === 'company' ? text.company : text.private}
              </UserType>
            </UserCard>
          ))}
        </UsersGrid>
      )}
    </Container>
  );
};

export default AllUsersPage;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  svg {
    color: #FF8F10;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: #333;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 0.95rem;
    color: #666;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  svg {
    color: #999;
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #333;

  &::placeholder {
    color: #999;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #333;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 10px 18px;
  border: 1.5px solid ${p => p.$active ? '#FF8F10' : '#e0e0e0'};
  background: ${p => p.$active ? '#FF8F10' : 'white'};
  color: ${p => p.$active ? 'white' : '#666'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: ${p => p.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    border-color: #FF8F10;
    background: ${p => p.$active ? '#FF8F10' : 'rgba(255, 143, 16, 0.1)'};
  }
`;

const ResultsSummary = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 16px;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
`;

const UserCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: #FF8F10;
    box-shadow: 0 4px 12px rgba(255, 143, 16, 0.1);
    transform: translateY(-2px);
  }
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  text-align: center;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 8px;
  text-align: center;
  word-break: break-word;
`;

const UserType = styled.div<{ $type: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${p => 
    p.$type === 'dealer' ? '#dcfce7' :
    p.$type === 'company' ? '#dbeafe' : '#fff7ed'
  };
  color: ${p =>
    p.$type === 'dealer' ? '#16a34a' :
    p.$type === 'company' ? '#2563eb' : '#c2410c'
  };
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #999;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  h3 {
    margin: 16px 0 0 0;
    font-size: 1.2rem;
    color: #999;
  }
`;

