import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Shield, 
  Settings, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  advancedUserManagementService, 
  AdvancedUser, 
  UserRole 
} from '@/services/advanced-user-management-service';
import { permissionManagementService, PermissionCategory, RoleTemplate } from '@/services/permission-management-service';
import { auditLoggingService } from '@/services/audit-logging-service';

// Styled Components
const UserManagementContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderSubtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
`;

const Controls = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #667eea;
          color: white;
          &:hover {
            background: #5a67d8;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover {
            background: #e5e7eb;
          }
        `;
    }
  }}
`;

const UserTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
`;

const TableRow = styled.tr<{ $isActive?: boolean }>`
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }

  ${props => !props.$isActive && `
    opacity: 0.6;
    background: #fef2f2;
  `}
`;

const TableCell = styled.td`
  padding: 16px;
  vertical-align: middle;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 14px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.$status) {
      case 'active':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'inactive':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'suspended':
        return `
          background: #fef2f2;
          color: #dc2626;
        `;
      case 'banned':
        return `
          background: #f3f4f6;
          color: #374151;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const RoleBadge = styled.span`
  padding: 4px 8px;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 4px;
  margin-bottom: 4px;
  display: inline-block;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButtonSmall = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #667eea;
          color: white;
          &:hover {
            background: #5a67d8;
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover {
            background: #e5e7eb;
          }
        `;
    }
  }}
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-size: 16px;
`;

const ErrorState = styled.div`
  padding: 40px;
  text-align: center;
  color: #dc2626;
  font-size: 16px;
`;

const EmptyState = styled.div`
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #9ca3af;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  margin: 0;
`;

// Main Component
const AdvancedUserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdvancedUser[]>([]);
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, roleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load users
      const usersResult = await advancedUserManagementService.getUsers(
        currentPage,
        20,
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          search: searchTerm || undefined
        }
      );

      setUsers(usersResult.users);
      setTotalUsers(usersResult.total);
      setHasMore(usersResult.hasMore);

      // Load roles and permission categories
      const [rolesData, categoriesData] = await Promise.all([
        permissionManagementService.getRoleTemplates(),
        permissionManagementService.getPermissionCategories()
      ]);

      setRoles(rolesData);
      setPermissionCategories(categoriesData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const handleStatusChange = async (userId: string, newStatus: string, reason: string) => {
    try {
      await advancedUserManagementService.changeUserStatus(
        userId,
        newStatus as any,
        reason,
        'current_admin' // In production, get from auth context
      );

      // Log the action
      await auditLoggingService.logUserAction(
        'current_admin',
        'admin@example.com',
        'Admin User',
        'USER_STATUS_CHANGED',
        'user',
        userId,
        undefined,
        `User status changed to ${newStatus}. Reason: ${reason}`,
        true,
        'medium',
        'authorization'
      );

      // Reload data
      loadData();
    } catch (err) {
      console.error('Error changing user status:', err);
    }
  };

  const handleCreateUser = async (userData: Partial<AdvancedUser>, roleIds: string[]) => {
    try {
      await advancedUserManagementService.createUser(
        userData,
        roleIds,
        'current_admin' // In production, get from auth context
      );

      // Log the action
      await auditLoggingService.logUserAction(
        'current_admin',
        'admin@example.com',
        'Admin User',
        'USER_CREATED',
        'user',
        undefined,
        undefined,
        `New user created: ${userData.email}`,
        true,
        'medium',
        'data_modification'
      );

      // Reload data
      loadData();
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#f59e0b';
      case 'suspended': return '#ef4444';
      case 'banned': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <UserManagementContainer>
        <LoadingState>
          <div>Loading users...</div>
        </LoadingState>
      </UserManagementContainer>
    );
  }

  if (error) {
    return (
      <UserManagementContainer>
        <ErrorState>
          <div>{error}</div>
        </ErrorState>
      </UserManagementContainer>
    );
  }

  return (
    <UserManagementContainer>
      <Header>
        <HeaderTitle>
          <Users size={24} />
          Advanced User Management
        </HeaderTitle>
        <HeaderSubtitle>
          Manage users, roles, and permissions with real-time data
        </HeaderSubtitle>
      </Header>

      <Controls>
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: '12px' }}>
          <SearchInput
            type="text"
            placeholder="Search users by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ActionButton type="submit" $variant="primary">
            <Search size={16} />
            Search
          </ActionButton>
        </form>

        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </FilterSelect>

        <FilterSelect
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </FilterSelect>

        <ActionButton $variant="primary">
          <UserPlus size={16} />
          Create User
        </ActionButton>
      </Controls>

      <UserTable>
        {users.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Users size={24} />
            </EmptyIcon>
            <EmptyTitle>No users found</EmptyTitle>
            <EmptyDescription>
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No users have been created yet'
              }
            </EmptyDescription>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Roles</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Last Login</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {users.map(user => (
                <TableRow key={user.uid} $isActive={user.status === 'active'}>
                  <TableCell>
                    <UserInfo>
                      <UserAvatar $bgColor={getStatusColor(user.status)}>
                        {getInitials(user.displayName)}
                      </UserAvatar>
                      <UserDetails>
                        <UserName>{user.displayName}</UserName>
                        <UserEmail>{user.email}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell>
                    <StatusBadge $status={user.status}>
                      {user.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {user.roles.map(roleId => {
                      const role = roles.find(r => r.id === roleId);
                      return role ? (
                        <RoleBadge key={roleId}>{role.name}</RoleBadge>
                      ) : null;
                    })}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      {user.location.city}, {user.location.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {new Date(user.security.lastLogin).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButtonSmall $variant="primary">
                        <Eye size={14} />
                        View
                      </ActionButtonSmall>
                      <ActionButtonSmall>
                        <Edit size={14} />
                        Edit
                      </ActionButtonSmall>
                      {user.status === 'active' ? (
                        <ActionButtonSmall $variant="danger">
                          <Ban size={14} />
                          Suspend
                        </ActionButtonSmall>
                      ) : (
                        <ActionButtonSmall $variant="primary">
                          <CheckCircle size={14} />
                          Activate
                        </ActionButtonSmall>
                      )}
                      <ActionButtonSmall $variant="danger">
                        <Trash2 size={14} />
                        Delete
                      </ActionButtonSmall>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </UserTable>
    </UserManagementContainer>
  );
};

export default AdvancedUserManagement;

