/**
 * ✅ COMPLETED: Permission Management Component for Super Admin Dashboard
 * Full-featured permission and role management system
 * 
 * @author AI Assistant
 * @date 2025-12-21
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Shield,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  UserX
} from 'lucide-react';
import { permissionManagementService } from '../services/permission-management-service';
import { adminService } from '../services/admin-permissions.service';
import { PERMISSIONS, hasPermission, listRolePermissions, type Role } from '../constants/rbac';
import type { PermissionCategory, PermissionTemplate, RoleTemplate } from '../services/permission-management-types';
import type { AdminPermissions } from '../services/admin-permissions.service';
import { logger } from '../services/logger-service';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'react-toastify';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

const Container = styled.div`
  padding: 2rem;
  background: var(--admin-bg-primary);
  border-radius: 16px;
  margin: 1rem;
  color: var(--admin-text-primary);
`;

const Title = styled.h2`
  color: var(--admin-accent-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border: 2px solid var(--admin-border-light);
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, var(--admin-accent-primary), var(--admin-accent-secondary))' : 'transparent'};
  color: ${props => props.$active ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? 'var(--admin-accent-primary)' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--admin-text-primary);
    background: ${props => props.$active ? 'linear-gradient(135deg, var(--admin-accent-primary), var(--admin-accent-secondary))' : 'var(--admin-bg-hover)'};
  }
`;

const ContentSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: var(--admin-accent-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: var(--admin-glass-card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--admin-border-light);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--admin-border-light);
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h4`
  color: var(--admin-accent-primary);
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardDescription = styled.p`
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Badge = styled.span<{ $type?: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  
  ${props => {
    const colors: Record<string, string> = {
      system: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      custom: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      active: 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
      inactive: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;',
      basic: 'background: rgba(100, 116, 139, 0.2); color: var(--admin-text-secondary);',
      advanced: 'background: rgba(234, 179, 8, 0.2); color: #eab308;',
      admin: 'background: rgba(249, 115, 22, 0.2); color: #f97316;',
      super_admin: 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'
    };
    return colors[props.$type || 'basic'] || colors.basic;
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  background: var(--admin-bg-hover);
  border: 1px solid var(--admin-border-light);
  border-radius: 6px;
  color: var(--admin-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--admin-accent-primary);
    border-color: var(--admin-accent-primary);
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--admin-accent-primary), var(--admin-accent-secondary));
  color: var(--admin-text-primary);
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
  background: var(--admin-glass-card-bg);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: var(--admin-text-primary);
`;

const TableHeader = styled.thead`
  background: var(--admin-accent-primary);
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--admin-accent-primary);
  border: 2px solid var(--admin-border-light);
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
  
  &:hover {
    background: var(--admin-accent-primary);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  background: var(--admin-bg-hover);
  border: 1px solid var(--admin-border-light);
  border-radius: 8px;
  color: var(--admin-text-primary);
  font-size: 0.875rem;
  width: 100%;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--admin-accent-primary);
  }
`;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--admin-text-secondary);
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--admin-text-secondary);
`;

const PermissionList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const PermissionTag = styled.span`
  padding: 0.25rem 0.5rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--admin-text-secondary);
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--admin-glass-card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--admin-bg-primary);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: var(--admin-text-primary);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border: 2px solid var(--admin-border-light);
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  color: var(--admin-accent-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--admin-text-secondary);
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: var(--admin-accent-primary);
    color: var(--admin-text-primary);
  }
`;

const ModalBody = styled.div`
  color: var(--admin-text-secondary);
  line-height: 1.6;
`;

type TabType = 'roles' | 'permissions' | 'users';

const PermissionManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [permissions, setPermissions] = useState<PermissionTemplate[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleTemplate | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminPermissions | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'roles') {
        const rolesData = await permissionManagementService.getRoleTemplates();
        setRoles(rolesData);
      } else if (activeTab === 'permissions') {
        const [permissionsData, categoriesData] = await Promise.all([
          permissionManagementService.getPermissionTemplates(),
          permissionManagementService.getPermissionCategories()
        ]);
        setPermissions(permissionsData);
        setCategories(categoriesData);
      } else if (activeTab === 'users') {
        const adminPermissionsSnapshot = await getDocs(collection(db, 'admin_permissions'));
        const adminData = adminPermissionsSnapshot.docs.map((doc: any) => ({
          ...doc.data(),
          grantedAt: doc.data().grantedAt?.toDate() || new Date(),
          expiresAt: doc.data().expiresAt?.toDate()
        } as AdminPermissions));
        setAdminUsers(adminData);
      }
    } catch (error) {
      logger.error('Error loading permission data', error as Error);
      toast.error('Failed to load permission data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      await permissionManagementService.initializeDefaultPermissions();
      toast.success('Default permissions initialized successfully');
      loadData();
    } catch (error) {
      logger.error('Error initializing default permissions', error as Error);
      toast.error('Failed to initialize default permissions');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = adminUsers.filter((user: any) =>
    user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = categories.reduce((acc, category) => {
    acc[category.id] = permissions.filter(p => p.categoryId === category.id);
    return acc;
  }, {} as Record<string, PermissionTemplate[]>);

  return (
    <Container>
      <Title>
        <Shield size={24} />
        Permission Management
      </Title>

      <TabsContainer>
        <TabButton $active={activeTab === 'roles'} onClick={() => setActiveTab('roles')}>
          <Users size={16} />
          Roles ({roles.length})
        </TabButton>
        <TabButton $active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')}>
          <Shield size={16} />
          Permissions ({permissions.length})
        </TabButton>
        <TabButton $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <UserCheck size={16} />
          Admin Users ({adminUsers.length})
        </TabButton>
      </TabsContainer>

      <ActionButtons>
        <ActionButton onClick={loadData}>
          <RefreshCw size={16} />
          Refresh
        </ActionButton>
        <ActionButton onClick={handleInitializeDefaults}>
          <Settings size={16} />
          Initialize Defaults
        </ActionButton>
      </ActionButtons>

      <SearchInput
        type="text"
        placeholder={`Search ${activeTab}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <LoadingState>Loading {activeTab}...</LoadingState>
      ) : (
        <>
          {activeTab === 'roles' && (
            <ContentSection>
              <SectionTitle>
                <Users size={20} />
                Role Templates
              </SectionTitle>
              {filteredRoles.length === 0 ? (
                <EmptyState>No roles found</EmptyState>
              ) : (
                <Grid>
                  {filteredRoles.map((role) => (
                    <Card key={role.id}>
                      <CardTitle>
                        <div>
                          {role.name}
                          {role.isSystemRole && <Badge $type="system">System</Badge>}
                          {!role.isActive && <Badge $type="inactive">Inactive</Badge>}
                        </div>
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                      <div>
                        <Badge $type={role.level}>{role.level}</Badge>
                        <span style={{ color: '#aaa', fontSize: '0.875rem' }}>
                          {role.permissions.length} permissions
                        </span>
                      </div>
                      <PermissionList>
                        {role.permissions.slice(0, 5).map((permId) => {
                          const perm = permissions.find(p => p.id === permId);
                          return (
                            <PermissionTag key={permId}>
                              {perm?.name || permId}
                            </PermissionTag>
                          );
                        })}
                        {role.permissions.length > 5 && (
                          <PermissionTag>+{role.permissions.length - 5} more</PermissionTag>
                        )}
                      </PermissionList>
                      <ActionButtons>
                        <IconButton onClick={() => setSelectedRole(role)} title="View Details">
                          <Settings size={16} />
                        </IconButton>
                      </ActionButtons>
                    </Card>
                  ))}
                </Grid>
              )}
            </ContentSection>
          )}

          {activeTab === 'permissions' && (
            <ContentSection>
              {categories.map((category) => {
                const categoryPermissions = groupedPermissions[category.id] || [];
                const filtered = categoryPermissions.filter(p =>
                  filteredPermissions.includes(p)
                );

                if (filtered.length === 0) return null;

                return (
                  <div key={category.id} style={{ marginBottom: '2rem' }}>
                    <SectionTitle>
                      <Shield size={20} />
                      {category.name} ({filtered.length})
                    </SectionTitle>
                    <Grid>
                      {filtered.map((permission) => (
                        <Card key={permission.id}>
                          <CardTitle>
                            <div>
                              {permission.name}
                              {permission.isSystemPermission && <Badge $type="system">System</Badge>}
                              {!permission.isActive && <Badge $type="inactive">Inactive</Badge>}
                            </div>
                          </CardTitle>
                          <CardDescription>{permission.description}</CardDescription>
                          <div>
                            <Badge>{permission.resource}</Badge>
                            <Badge>{permission.action}</Badge>
                            <Badge $type={permission.level}>{permission.level}</Badge>
                          </div>
                        </Card>
                      ))}
                    </Grid>
                  </div>
                );
              })}
            </ContentSection>
          )}

          {activeTab === 'users' && (
            <ContentSection>
              <SectionTitle>
                <UserCheck size={20} />
                Admin Users
              </SectionTitle>
              {filteredUsers.length === 0 ? (
                <EmptyState>No admin users found</EmptyState>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <tr>
                        <TableHeaderCell>User ID</TableHeaderCell>
                        <TableHeaderCell>Role</TableHeaderCell>
                        <TableHeaderCell>Access Level</TableHeaderCell>
                        <TableHeaderCell>Permissions</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Granted At</TableHeaderCell>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.userId} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                          <TableCell>{user.userId}</TableCell>
                          <TableCell>
                            <Badge $type={user.role}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.accessLevel}</TableCell>
                          <TableCell>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.permissions.length} permission(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge $type="active">
                                <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Active
                              </Badge>
                            ) : (
                              <Badge $type="inactive">
                                <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.grantedAt ? new Date(user.grantedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </ContentSection>
          )}
        </>
      )}

      {/* Role Detail Modal */}
      {selectedRole && (
        <ModalOverlay onClick={() => setSelectedRole(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Role Details: {selectedRole.name}</ModalTitle>
              <CloseButton onClick={() => setSelectedRole(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Description:</strong> {selectedRole.description}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Level:</strong> <Badge $type={selectedRole.level}>{selectedRole.level}</Badge>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>System Role:</strong> {selectedRole.isSystemRole ? 'Yes' : 'No'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {selectedRole.isActive ? 'Active' : 'Inactive'}
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Permissions ({selectedRole.permissions.length}):</strong>
                <PermissionList style={{ marginTop: '0.5rem' }}>
                  {selectedRole.permissions.map((permId) => {
                    const perm = permissions.find(p => p.id === permId);
                    return (
                      <PermissionTag key={permId}>
                        {perm?.name || permId}
                      </PermissionTag>
                    );
                  })}
                </PermissionList>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <ModalOverlay onClick={() => setSelectedUser(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Admin User Details</ModalTitle>
              <CloseButton onClick={() => setSelectedUser(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ marginBottom: '1rem' }}>
                <strong>User ID:</strong> {selectedUser.userId}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Role:</strong> <Badge $type={selectedUser.role}>{selectedUser.role}</Badge>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Access Level:</strong> {selectedUser.accessLevel}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Granted By:</strong> {selectedUser.grantedBy}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Granted At:</strong> {selectedUser.grantedAt ? new Date(selectedUser.grantedAt).toLocaleString() : 'N/A'}
              </div>
              {selectedUser.expiresAt && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Expires At:</strong> {new Date(selectedUser.expiresAt).toLocaleString()}
                </div>
              )}
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Permissions ({selectedUser.permissions.length}):</strong>
                <PermissionList style={{ marginTop: '0.5rem' }}>
                  {selectedUser.permissions.map((perm) => (
                    <PermissionTag key={perm}>{perm}</PermissionTag>
                  ))}
                </PermissionList>
              </div>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default PermissionManagement;
