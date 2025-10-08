import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  AlertTriangle,
  Users,
  Settings,
  FileText,
  BarChart3,
  Search,
  Filter,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  permissionManagementService, 
  PermissionCategory, 
  PermissionTemplate, 
  RoleTemplate 
} from '../services/permission-management-service';
import { auditLoggingService } from '../services/audit-logging-service';

// Styled Components
const PermissionContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 16px 24px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#10b981' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: ${props => props.$active ? '2px solid #10b981' : '2px solid transparent'};
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$active ? 'white' : '#f3f4f6'};
  }
`;

const TabContent = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const Badge = styled.span<{ $variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `background: #dbeafe; color: #1e40af;`;
      case 'secondary':
        return `background: #f3f4f6; color: #374151;`;
      case 'success':
        return `background: #dcfce7; color: #166534;`;
      case 'warning':
        return `background: #fef3c7; color: #92400e;`;
      case 'danger':
        return `background: #fef2f2; color: #dc2626;`;
      default:
        return `background: #f3f4f6; color: #6b7280;`;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #10b981;
          color: white;
          &:hover {
            background: #059669;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
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

const Modal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;

  &:hover {
    color: #374151;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
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

// Main Component
const PermissionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [permissions, setPermissions] = useState<PermissionTemplate[]>([]);
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'permission' | 'role'>('category');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesData, permissionsData, rolesData] = await Promise.all([
        permissionManagementService.getPermissionCategories(),
        permissionManagementService.getPermissionTemplates(),
        permissionManagementService.getRoleTemplates()
      ]);

      setCategories(categoriesData);
      setPermissions(permissionsData);
      setRoles(rolesData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load permission data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (modalType === 'category') {
        // Create category logic
        console.log('Creating category:', formData);
      } else if (modalType === 'permission') {
        // Create permission logic
        console.log('Creating permission:', formData);
      } else if (modalType === 'role') {
        // Create role logic
        console.log('Creating role:', formData);
      }

      // Log the action
      await auditLoggingService.logUserAction(
        'current_admin',
        'admin@example.com',
        'Admin User',
        `${modalType.toUpperCase()}_CREATED`,
        modalType,
        undefined,
        undefined,
        `New ${modalType} created`,
        true,
        'medium',
        'data_modification'
      );

      setShowModal(false);
      setFormData({});
      loadData();
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const handleEdit = (item: any, type: 'category' | 'permission' | 'role') => {
    setEditingItem(item);
    setModalType(type);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string, type: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        // Delete logic here
        console.log('Deleting:', id, type);

        // Log the action
        await auditLoggingService.logUserAction(
          'current_admin',
          'admin@example.com',
          'Admin User',
          `${type.toUpperCase()}_DELETED`,
          type,
          id,
          undefined,
          `${type} deleted`,
          true,
          'high',
          'data_modification'
        );

        loadData();
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'user_management': return <Users size={20} />;
      case 'content_management': return <FileText size={20} />;
      case 'system_administration': return <Settings size={20} />;
      case 'analytics_reporting': return <BarChart3 size={20} />;
      default: return <Shield size={20} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'secondary';
      case 'write': return 'primary';
      case 'delete': return 'warning';
      case 'admin': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <PermissionContainer>
        <LoadingState>
          <div>Loading permissions...</div>
        </LoadingState>
      </PermissionContainer>
    );
  }

  if (error) {
    return (
      <PermissionContainer>
        <ErrorState>
          <div>{error}</div>
        </ErrorState>
      </PermissionContainer>
    );
  }

  return (
    <PermissionContainer>
      <Header>
        <HeaderTitle>
          <Shield size={24} />
          Permission Management
        </HeaderTitle>
        <HeaderSubtitle>
          Manage roles, permissions, and access control
        </HeaderSubtitle>
      </Header>

      <TabsContainer>
        <Tab $active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
          <Shield size={16} />
          Categories
        </Tab>
        <Tab $active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')}>
          <Settings size={16} />
          Permissions
        </Tab>
        <Tab $active={activeTab === 'roles'} onClick={() => setActiveTab('roles')}>
          <Users size={16} />
          Roles
        </Tab>
      </TabsContainer>

      <TabContent>
        {activeTab === 'categories' && (
          <Section>
            <SectionTitle>
              <Shield size={20} />
              Permission Categories
              <Button 
                $variant="primary" 
                onClick={() => {
                  setModalType('category');
                  setEditingItem(null);
                  setFormData({});
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                Add Category
              </Button>
            </SectionTitle>
            <Grid>
              {categories.map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>
                      {getCategoryIcon(category.id)}
                      {category.name}
                    </CardTitle>
                    <Badge $variant={category.isActive ? 'success' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardHeader>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                  <ActionButtons>
                    <Button onClick={() => handleEdit(category, 'category')}>
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button $variant="danger" onClick={() => handleDelete(category.id, 'category')}>
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </ActionButtons>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {activeTab === 'permissions' && (
          <Section>
            <SectionTitle>
              <Settings size={20} />
              Permission Templates
              <Button 
                $variant="primary" 
                onClick={() => {
                  setModalType('permission');
                  setEditingItem(null);
                  setFormData({});
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                Add Permission
              </Button>
            </SectionTitle>
            <Grid>
              {permissions.map(permission => (
                <Card key={permission.id}>
                  <CardHeader>
                    <CardTitle>
                      <Shield size={20} />
                      {permission.name}
                    </CardTitle>
                    <Badge $variant={getLevelColor(permission.level) as any}>
                      {permission.level}
                    </Badge>
                  </CardHeader>
                  <CardDescription>
                    {permission.description}
                  </CardDescription>
                  <div style={{ marginBottom: '12px' }}>
                    <Badge $variant="secondary">
                      {permission.resource}
                    </Badge>
                    <Badge $variant="secondary">
                      {permission.action}
                    </Badge>
                  </div>
                  <ActionButtons>
                    <Button onClick={() => handleEdit(permission, 'permission')}>
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button $variant="danger" onClick={() => handleDelete(permission.id, 'permission')}>
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </ActionButtons>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {activeTab === 'roles' && (
          <Section>
            <SectionTitle>
              <Users size={20} />
              Role Templates
              <Button 
                $variant="primary" 
                onClick={() => {
                  setModalType('role');
                  setEditingItem(null);
                  setFormData({});
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                Add Role
              </Button>
            </SectionTitle>
            <Grid>
              {roles.map(role => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle>
                      <Users size={20} />
                      {role.name}
                    </CardTitle>
                    <Badge $variant={role.isActive ? 'success' : 'secondary'}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardHeader>
                  <CardDescription>
                    {role.description}
                  </CardDescription>
                  <div style={{ marginBottom: '12px' }}>
                    <Badge $variant="primary">
                      {role.level}
                    </Badge>
                    <Badge $variant="secondary">
                      {role.permissions.length} permissions
                    </Badge>
                  </div>
                  <ActionButtons>
                    <Button onClick={() => handleEdit(role, 'role')}>
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button $variant="danger" onClick={() => handleDelete(role.id, 'role')}>
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </ActionButtons>
                </Card>
              ))}
            </Grid>
          </Section>
        )}
      </TabContent>

      {/* Modal */}
      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingItem ? 'Edit' : 'Create'} {modalType}
            </ModalTitle>
            <CloseButton onClick={() => setShowModal(false)}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          <FormGroup>
            <Label>Name (English)</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name in English"
            />
          </FormGroup>

          <FormGroup>
            <Label>Name (Bulgarian)</Label>
            <Input
              value={formData.nameBg || ''}
              onChange={(e) => setFormData({ ...formData, nameBg: e.target.value })}
              placeholder="Enter name in Bulgarian"
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </FormGroup>

          {modalType === 'permission' && (
            <>
              <FormGroup>
                <Label>Resource</Label>
                <Input
                  value={formData.resource || ''}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  placeholder="e.g., users, cars, messages"
                />
              </FormGroup>

              <FormGroup>
                <Label>Action</Label>
                <Input
                  value={formData.action || ''}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="e.g., create, read, update, delete"
                />
              </FormGroup>

              <FormGroup>
                <Label>Level</Label>
                <Select
                  value={formData.level || 'read'}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="delete">Delete</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormGroup>
            </>
          )}

          {modalType === 'role' && (
            <FormGroup>
              <Label>Permissions</Label>
              <CheckboxGroup>
                {permissions.map(permission => (
                  <CheckboxItem key={permission.id}>
                    <Checkbox
                      type="checkbox"
                      checked={formData.permissions?.includes(permission.id) || false}
                      onChange={(e) => {
                        const permissions = formData.permissions || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...permissions, permission.id] });
                        } else {
                          setFormData({ ...formData, permissions: permissions.filter((p: string) => p !== permission.id) });
                        }
                      }}
                    />
                    {permission.name}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormGroup>
          )}

          <ActionButtons>
            <Button $variant="primary" onClick={handleCreate}>
              <Save size={16} />
              {editingItem ? 'Update' : 'Create'}
            </Button>
            <Button onClick={() => setShowModal(false)}>
              <X size={16} />
              Cancel
            </Button>
          </ActionButtons>
        </ModalContent>
      </Modal>
    </PermissionContainer>
  );
};

export default PermissionManagement;

