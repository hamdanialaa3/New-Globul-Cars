/**
 * ✅ COMPLETED: Advanced User Management Component for Super Admin Dashboard
 * Full-featured user management with search, filtering, and actions
 * 
 * @author AI Assistant
 * @date 2025-12-21
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users, 
  Search, 
  RefreshCw,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Home,
  Building,
  Briefcase,
  UserCheck,
  X,
  Filter
} from 'lucide-react';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { firebaseRealDataService } from '../services/firebase-real-data-service';
import { auditLoggingService } from '../services/audit-logging-service';
import { logger } from '../services/logger-service';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  margin: 1rem;
  color: white;
`;

const Title = styled.h2`
  color: #ffd700;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 215, 0, 0.5);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #aaa;
  font-size: 0.875rem;
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #ffd700;
  }
  
  option {
    background: #2d2d2d;
    color: white;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
`;

const TableHeader = styled.thead`
  background: rgba(255, 215, 0, 0.1);
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #ffd700;
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 215, 0, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #ccc;
  font-size: 0.875rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserAvatar = styled.div<{ $bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$bgColor || '#667eea'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

const Badge = styled.span<{ $type?: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  margin-right: 0.5rem;
  
  ${props => {
    const colors: Record<string, string> = {
      active: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      suspended: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;',
      banned: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;',
      private: 'background: rgba(100, 116, 139, 0.2); color: #94a3b8;',
      dealer: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      company: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
      verified: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;'
    };
    return colors[props.$type || 'active'] || colors.active;
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ $variant?: 'success' | 'danger' | 'default' }>`
  padding: 0.5rem;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return 'rgba(34, 197, 94, 0.2)';
      case 'danger': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return 'rgba(34, 197, 94, 0.3)';
      case 'danger': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(255, 215, 0, 0.2)';
    }
  }};
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'success': return 'rgba(34, 197, 94, 0.3)';
        case 'danger': return 'rgba(239, 68, 68, 0.3)';
        default: return 'rgba(255, 215, 0, 0.2)';
      }
    }};
  }
`;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #aaa;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #aaa;
`;

const AdvancedUserManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [profileTypeFilter, setProfileTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    privateUsers: 0,
    dealerUsers: 0,
    companyUsers: 0,
    verifiedUsers: 0
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, profileTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      if (statusFilter !== 'all') {
        usersQuery = query(usersQuery, where('status', '==', statusFilter));
      }
      
      if (profileTypeFilter !== 'all') {
        usersQuery = query(usersQuery, where('profileType', '==', profileTypeFilter));
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));

      let filteredUsers = usersData;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredUsers = usersData.filter((user: any) => 
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.location?.city?.toLowerCase().includes(searchLower)
        );
      }

      setUsers(filteredUsers);

      const activeUsers = usersData.filter(u => u.status !== 'suspended' && u.status !== 'banned').length;
      const privateUsers = usersData.filter(u => u.profileType === 'private').length;
      const dealerUsers = usersData.filter(u => u.profileType === 'dealer').length;
      const companyUsers = usersData.filter(u => u.profileType === 'company').length;
      const verifiedUsers = usersData.filter(u => u.verification?.email || u.verification?.phone).length;

      setStats({
        totalUsers: usersData.length,
        activeUsers,
        privateUsers,
        dealerUsers,
        companyUsers,
        verifiedUsers
      });
    } catch (error) {
      logger.error('Error loading users', error as Error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      
      switch (action) {
        case 'activate':
          await updateDoc(userRef, { status: 'active', updatedAt: serverTimestamp() });
          toast.success('User activated successfully');
          break;
        case 'suspend':
          await updateDoc(userRef, { status: 'suspended', updatedAt: serverTimestamp() });
          toast.success('User suspended successfully');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteDoc(userRef);
            toast.success('User deleted successfully');
          }
          break;
      }

      if (currentUser) {
        await auditLoggingService.logUserAction(
          currentUser.uid,
          currentUser.email || 'admin',
          currentUser.displayName || 'Admin',
          `USER_${action.toUpperCase()}`,
          'user',
          userId,
          undefined,
          `User ${action} action performed.`,
          true,
          'high',
          'authorization'
        );
      }

      loadData();
    } catch (error) {
      logger.error(`Error ${action} user:`, error as Error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getProfileTypeIcon = (type: string) => {
    switch (type) {
      case 'private': return <Home size={14} />;
      case 'dealer': return <Building size={14} />;
      case 'company': return <Briefcase size={14} />;
      default: return <Users size={14} />;
    }
  };

  return (
    <Container>
      <Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          Advanced User Management
        </div>
        <ActionButton onClick={loadData} disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </ActionButton>
      </Title>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.activeUsers}</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.privateUsers}</StatValue>
          <StatLabel>Private Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.dealerUsers}</StatValue>
          <StatLabel>Dealers</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.companyUsers}</StatValue>
          <StatLabel>Companies</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.verifiedUsers}</StatValue>
          <StatLabel>Verified Users</StatLabel>
        </StatCard>
      </StatsGrid>

      <FiltersContainer>
        <SearchInput
          type="text"
          placeholder="Search by name, email, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </FilterSelect>
        <FilterSelect value={profileTypeFilter} onChange={(e) => setProfileTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="private">Private</option>
          <option value="dealer">Dealer</option>
          <option value="company">Company</option>
        </FilterSelect>
        <ActionButton onClick={loadData}>
          <Filter size={16} />
          Filter
        </ActionButton>
      </FiltersContainer>

      {loading ? (
        <LoadingState>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '1rem' }} />
          <div>Loading users...</div>
        </LoadingState>
      ) : users.length === 0 ? (
        <EmptyState>No users found</EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Profile Type</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                <TableHeaderCell>Listings</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {users.slice(0, 50).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <UserInfo>
                      <UserAvatar $bgColor={getStatusColor(user.status || 'active')}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                          getInitials(user.displayName || user.email || 'U')
                        )}
                      </UserAvatar>
                      <UserDetails>
                        <UserName>{user.displayName || 'No name'}</UserName>
                        <UserEmail>{user.email || 'No email'}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell>
                    <Badge $type={user.profileType}>
                      {getProfileTypeIcon(user.profileType)}
                      {user.profileType || 'private'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge $type={user.status || 'active'}>
                      {user.status === 'active' && <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                      {user.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? format(user.createdAt, 'yyyy-MM-dd') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.stats?.activeListings || 0} active / {user.stats?.totalListings || 0} total
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <IconButton onClick={() => handleUserAction(user.id, 'activate')} title="Activate" $variant="success">
                        <CheckCircle size={16} />
                      </IconButton>
                      <IconButton onClick={() => handleUserAction(user.id, 'suspend')} title="Suspend" $variant="danger">
                        <Ban size={16} />
                      </IconButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdvancedUserManagement;
