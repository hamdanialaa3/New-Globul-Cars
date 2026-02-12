import { logger } from '../../../services/logger-service';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Search, Eye, Edit, Trash2, Ban, CheckCircle,
  MapPin, Calendar, Home, Building, Briefcase, RefreshCw,
  Activity, Car, MessageSquare, Award, UserCheck, X
} from 'lucide-react';
import { RoleGuard } from '../../../components/guards/RoleGuard';
import {
  collection, doc, getDocs, updateDoc, deleteDoc, query,
  where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { firebaseRealDataService } from '../../../services/firebase-real-data-service';
import { auditLoggingService } from '../../../services/audit-logging-service';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%);
  color: #ffffff;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-bottom: 3px solid #ffd700;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #ffffff;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
  color: #e0e7ff;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'success' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4); }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4); }
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          &:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }
        `;
    }
  }}
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  &:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(255, 215, 0, 0.2); }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 500;
`;

const FiltersSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  &::placeholder { color: rgba(255, 255, 255, 0.5); }
  &:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2); }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  option { background: #1a1a1a; color: white; }
  &:focus { outline: none; border-color: #667eea; }
`;

const UsersTable = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: rgba(255, 255, 255, 0.1);
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #ffd700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableRow = styled.tr<{ $isActive?: boolean }>`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  &:hover { background: rgba(255, 255, 255, 0.05); }
  ${props => !props.$isActive && `opacity: 0.6; background: rgba(239, 68, 68, 0.1);`}
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
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

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  ${props => {
    switch (props.$status) {
      case 'active':
        return `background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);`;
      case 'suspended':
        return `background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);`;
      default:
        return `background: rgba(107, 114, 128, 0.2); color: #6b7280; border: 1px solid rgba(107, 114, 128, 0.3);`;
    }
  }}
`;

const ProfileTypeBadge = styled.span<{ $type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    switch (props.$type) {
      case 'private':
        return `background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);`;
      case 'dealer':
        return `background: rgba(168, 85, 247, 0.2); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3);`;
      case 'company':
        return `background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);`;
      default:
        return `background: rgba(107, 114, 128, 0.2); color: #6b7280; border: 1px solid rgba(107, 114, 128, 0.3);`;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ActionButtonSmall = styled.button<{ $variant?: 'primary' | 'success' | 'danger' }>`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `background: rgba(102, 126, 234, 0.8); color: white; &:hover { background: rgba(102, 126, 234, 1); }`;
      case 'success':
        return `background: rgba(16, 185, 129, 0.8); color: white; &:hover { background: rgba(16, 185, 129, 1); }`;
      case 'danger':
        return `background: rgba(239, 68, 68, 0.8); color: white; &:hover { background: rgba(239, 68, 68, 1); }`;
      default:
        return `background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); &:hover { background: rgba(255, 255, 255, 0.2); }`;
    }
  }}
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: white;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #ffd700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  &:hover { background: rgba(255, 255, 255, 0.1); color: white; }
`;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #aaa;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #aaa;
`;

const SuperAdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [profileTypeFilter, setProfileTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    privateUsers: 0,
    dealerUsers: 0,
    companyUsers: 0,
    verifiedUsers: 0,
    totalCars: 0,
    totalPosts: 0
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, profileTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const realAnalytics = await firebaseRealDataService.getRealAnalytics();

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
          user.locationData?.cityName?.toLowerCase().includes(searchLower)
        );
      }

      setUsers(filteredUsers);

      const activeUsers = usersData.filter(u => u.status !== 'suspended' && u.status !== 'banned').length;
      const privateUsers = usersData.filter(u => u.profileType === 'private').length;
      const dealerUsers = usersData.filter(u => u.profileType === 'dealer').length;
      const companyUsers = usersData.filter(u => u.profileType === 'company').length;
      const verifiedUsers = usersData.filter(u => u.emailVerified || u.phoneVerified).length;

      setStats({
        totalUsers: usersData.length,
        activeUsers,
        privateUsers,
        dealerUsers,
        companyUsers,
        verifiedUsers,
        totalCars: realAnalytics.totalCars || 0,
        totalPosts: realAnalytics.totalMessages || 0
      });

    } catch (err) {
      logger.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const userRef = doc(db, 'users', userId);

      switch (action) {
        case 'activate':
          await updateDoc(userRef, { status: 'active', updatedAt: serverTimestamp() });
          break;
        case 'suspend':
          await updateDoc(userRef, { status: 'suspended', updatedAt: serverTimestamp() });
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteDoc(userRef);
          }
          break;
      }

      await auditLoggingService.logUserAction(
        'super_admin', 'admin@example.com', 'Super Admin',
        `USER_${action.toUpperCase()}`, 'user', userId, undefined,
        `User ${action} action performed.`, true, 'high', 'authorization'
      );

      loadData();
    } catch (err) {
      logger.error(`Error ${action} user:`, err);
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

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>
          <RefreshCw size={24} className="animate-spin" />
          <div>Loading user data...</div>
        </LoadingState>
      </PageContainer>
    );
  }

  return (
    <RoleGuard requireSuperAdmin={true}>
      <PageContainer>
        <Header>
          <HeaderContent>
            <div>
              <HeaderTitle>
                <Users size={32} />
                Advanced User Management
              </HeaderTitle>
              <HeaderSubtitle>
                Full control over all users, subscribers, admins, posts, and vehicles
              </HeaderSubtitle>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <ActionButton onClick={() => navigate('/super-admin')}>
                <Activity size={16} />
                Back to Dashboard
              </ActionButton>
              <ActionButton $variant="success" onClick={loadData}>
                <RefreshCw size={16} />
                Refresh Data
              </ActionButton>
            </div>
          </HeaderContent>
        </Header>

        <MainContent>
          <StatsGrid>
            <StatCard>
              <StatIcon><Users size={24} /></StatIcon>
              <StatValue>{stats.totalUsers}</StatValue>
              <StatLabel>Total Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><UserCheck size={24} /></StatIcon>
              <StatValue>{stats.activeUsers}</StatValue>
              <StatLabel>Active Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Home size={24} /></StatIcon>
              <StatValue>{stats.privateUsers}</StatValue>
              <StatLabel>Private Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Building size={24} /></StatIcon>
              <StatValue>{stats.dealerUsers}</StatValue>
              <StatLabel>Dealers</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Briefcase size={24} /></StatIcon>
              <StatValue>{stats.companyUsers}</StatValue>
              <StatLabel>Companies</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Award size={24} /></StatIcon>
              <StatValue>{stats.verifiedUsers}</StatValue>
              <StatLabel>Verified Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Car size={24} /></StatIcon>
              <StatValue>{stats.totalCars}</StatValue>
              <StatLabel>Total Cars</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><MessageSquare size={24} /></StatIcon>
              <StatValue>{stats.totalPosts}</StatValue>
              <StatLabel>Total Posts</StatLabel>
            </StatCard>
          </StatsGrid>

          <FiltersSection>
            <FiltersGrid>
              <SearchInput
                type="text"
                placeholder="Search by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </FilterSelect>
              <FilterSelect value={profileTypeFilter} onChange={(e) => setProfileTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="private">Private</option>
                <option value="dealer">Dealer</option>
                <option value="company">Company</option>
              </FilterSelect>
              <ActionButton $variant="primary" onClick={loadData}>
                <Search size={16} />
                Search
              </ActionButton>
            </FiltersGrid>
          </FiltersSection>

          <UsersTable>
            {users.length === 0 ? (
              <EmptyState>
                <h3>No users found</h3>
                <p>Try adjusting your search criteria</p>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                    <TableHeaderCell>Registration Date</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {users.map((user: any) => (
                    <TableRow key={user.id} $isActive={user.status === 'active'}>
                      <TableCell>
                        <UserInfo>
                          <UserAvatar $bgColor={getStatusColor(user.status || 'active')}>
                            {getInitials(user.displayName || user.email)}
                          </UserAvatar>
                          <UserDetails>
                            <UserName>{user.displayName || 'User'}</UserName>
                            <UserEmail>{user.email}</UserEmail>
                          </UserDetails>
                        </UserInfo>
                      </TableCell>
                      <TableCell>
                        <ProfileTypeBadge $type={user.profileType || 'private'}>
                          {getProfileTypeIcon(user.profileType || 'private')}
                          {user.profileType === 'dealer' ? 'Dealer' :
                            user.profileType === 'company' ? 'Company' : 'Private'}
                        </ProfileTypeBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge $status={user.status || 'active'}>
                          {user.status === 'active' ? 'Active' : user.status === 'suspended' ? 'Suspended' : 'Inactive'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          {user.locationData?.cityName || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionButtons>
                          <ActionButtonSmall $variant="primary" onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }}>
                            <Eye size={12} />
                            View
                          </ActionButtonSmall>
                          {user.status === 'active' ? (
                            <ActionButtonSmall $variant="danger" onClick={() => handleUserAction(user.id, 'suspend')}>
                              <Ban size={12} />
                              Suspend
                            </ActionButtonSmall>
                          ) : (
                            <ActionButtonSmall $variant="success" onClick={() => handleUserAction(user.id, 'activate')}>
                              <CheckCircle size={12} />
                              Activate
                            </ActionButtonSmall>
                          )}
                          <ActionButtonSmall $variant="danger" onClick={() => handleUserAction(user.id, 'delete')}>
                            <Trash2 size={12} />
                            Delete
                          </ActionButtonSmall>
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </UsersTable>
        </MainContent>

        <Modal $isOpen={isUserModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>User Details</ModalTitle>
              <CloseButton onClick={() => setIsUserModalOpen(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            {selectedUser && (
              <div>
                <UserInfo style={{ marginBottom: '1.5rem' }}>
                  <UserAvatar $bgColor={getStatusColor(selectedUser.status || 'active')}>
                    {getInitials(selectedUser.displayName || selectedUser.email)}
                  </UserAvatar>
                  <UserDetails>
                    <UserName style={{ fontSize: '1.2rem' }}>{selectedUser.displayName || 'User'}</UserName>
                    <UserEmail style={{ fontSize: '1rem' }}>{selectedUser.email}</UserEmail>
                  </UserDetails>
                </UserInfo>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div><strong>Type:</strong> {selectedUser.profileType === 'dealer' ? 'Dealer' : selectedUser.profileType === 'company' ? 'Company' : 'Private'}</div>
                  <div><strong>Status:</strong> {selectedUser.status === 'active' ? 'Active' : selectedUser.status === 'suspended' ? 'Suspended' : 'Inactive'}</div>
                  <div><strong>City:</strong> {selectedUser.locationData?.cityName || 'Not specified'}</div>
                  <div><strong>Phone:</strong> {selectedUser.phoneNumber || 'Not specified'}</div>
                  <div><strong>Registration Date:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US') : '-'}</div>
                  <div><strong>Email Verified:</strong> {selectedUser.emailVerified ? 'Yes' : 'No'}</div>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <ActionButton onClick={() => setIsUserModalOpen(false)}>Close</ActionButton>
                  <ActionButton $variant="primary" onClick={() => window.open(`/profile/${selectedUser.id}`, '_blank')}>
                    <Eye size={16} />
                    View Profile
                  </ActionButton>
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      </PageContainer>
    </RoleGuard >
  );
};

export default SuperAdminUsersPage;