import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { adminService } from '../../services/admin/admin-service';
import { BulgarianUser } from '../../types/user/bulgarian-user.types'; // Fixed import
import { Loader, Search, Shield, User as UserIcon, Briefcase, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { logger } from '../../services/logger-service';

const Container = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 30px;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  font-size: 1rem;
  flex: 1;
  outline: none;
  color: #1e293b;

  &::placeholder {
    color: #94a3b8;
  }
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const UserEmail = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

const Badge = styled.span<{ type: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;

  ${props => props.type === 'admin' && `
    background: #fef2f2;
    color: #ef4444;
  `}
  ${props => props.type === 'dealer' && `
    background: #eff6ff;
    color: #3b82f6;
  `}
  ${props => props.type === 'company' && `
    background: #f0fdf4;
    color: #10b981;
  `}
  ${props => props.type === 'private' && `
    background: #f1f5f9;
    color: #64748b;
  `}
`;

const AuthUsersPage: React.FC = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const isBg = language === 'bg';

  const fetchUsers = async (query: string = '') => {
    setLoading(true);
    try {
      // Using searchUsers which currently fetches recent users if query is empty
      const results = await adminService.searchUsers(query);
      setUsers(results);
    } catch (error) {
      logger.error('Failed to fetch users', error as Error);
      toast.error(isBg ? 'Грешка при зареждане на потребители' : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  return (
    <Container>
      <Header>
        <Title>{isBg ? 'Потребители' : 'User Management'}</Title>
        <Subtitle>{isBg ? 'Преглед и управление на регистрирани потребители' : 'View and manage registered users across the platform'}</Subtitle>
      </Header>

      <form onSubmit={handleSearch}>
        <SearchBar>
          <Search size={20} color="#94a3b8" />
          <SearchInput
            placeholder={isBg ? 'Търсене по име или имейл...' : 'Search by name or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </form>

      <UsersTable>
        <TableHeader>
          <div>{isBg ? 'Потребител' : 'User'}</div>
          <div>{isBg ? 'Тип Профил' : 'Profile Type'}</div>
          <div>{isBg ? 'План' : 'Plan'}</div>
          <div>ID</div>
        </TableHeader>

        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <Loader className="animate-spin" color="#3b82f6" />
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.uid}>
              <UserInfo>
                <Avatar>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </Avatar>
                <UserMeta>
                  <UserName>{user.displayName || (isBg ? 'Без име' : 'No Name')}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserMeta>
              </UserInfo>

              <div>
                <Badge type={user.profileType || 'private'}>
                  {user.profileType === 'dealer' && <Briefcase size={14} />}
                  {user.profileType === 'company' && <Shield size={14} />}
                  {user.profileType === 'admin' && <Shield size={14} />}
                  {(user.profileType || 'private').toUpperCase()}
                </Badge>
              </div>

              <div style={{ color: '#64748b', fontWeight: 500 }}>
                {user.planTier ? user.planTier.toUpperCase() : 'FREE'}
              </div>

              <div style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>
                {user.uid.substring(0, 8)}...
              </div>
            </TableRow>
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            {isBg ? 'Няма намерени потребители.' : 'No users found.'}
          </div>
        )}
      </UsersTable>
    </Container>
  );
};

export default AuthUsersPage;
