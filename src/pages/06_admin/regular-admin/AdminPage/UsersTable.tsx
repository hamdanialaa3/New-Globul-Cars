import React, { useState } from 'react';
import styled from 'styled-components';
import { useUsers } from '@/hooks/useUsers';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    User,
    Search,
    MoreVertical,
    Shield,
    ShieldOff,
    CheckCircle,
    XCircle,
    RefreshCw,
    Mail,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { toast } from 'react-toastify';
import { logger } from '@/services/logger-service';

const GlassContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  border-radius: 24px;
  padding: 24px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const Toolbar = styled.div`
  padding: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchInputCallback = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.8);
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    width: 18px;
    height: 18px;
  }
`;

const GlassTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
`;

const GlassRow = styled.tr`
  transition: all 0.2s ease;
  
  td {
    padding: 16px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    &:first-child {
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    &:last-child {
      border-top-right-radius: 12px;
      border-bottom-right-radius: 12px;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  &:hover td {
    background: rgba(255, 255, 255, 0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .info {
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: 600;
      color: #0f172a;
    }
    
    .email {
      font-size: 12px;
      color: #64748b;
    }
  }
`;

const Badge = styled.span<{ $variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  border: 1px solid transparent;
  
  ${props => {
        switch (props.$variant) {
            case 'success':
                return `background: rgba(220, 252, 231, 0.5); color: #166534; border-color: rgba(187, 247, 208, 0.5);`;
            case 'warning':
                return `background: rgba(254, 243, 199, 0.5); color: #854d0e; border-color: rgba(253, 230, 138, 0.5);`;
            case 'danger':
                return `background: rgba(254, 226, 226, 0.5); color: #991b1b; border-color: rgba(254, 202, 202, 0.5);`;
            case 'info':
                return `background: rgba(219, 234, 254, 0.5); color: #1e40af; border-color: rgba(191, 219, 254, 0.5);`;
            default:
                return `background: rgba(241, 245, 249, 0.5); color: #475569; border-color: rgba(226, 232, 240, 0.5);`;
        }
    }}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    color: #0f172a;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const UsersTable: React.FC = () => {
    const { t } = useLanguage();
    const { users, loading, hasMore, loadMore, searchUsers, refreshUsers } = useUsers({ pageSize: 15 });
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Debounce this in production
        searchUsers(e.target.value);
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        if (actionLoading) return;

        const confirmMsg = currentStatus
            ? 'Are you sure you want to deactivate this user?'
            : 'Are you sure you want to activate this user?';

        if (!window.confirm(confirmMsg)) return;

        setActionLoading(userId);
        try {
            await updateDoc(doc(db, 'users', userId), {
                isActive: !currentStatus,
                updatedAt: new Date()
            });
            toast.success('User status updated');
            refreshUsers();
        } catch (error) {
            logger.error('Failed to update user status', error as Error);
            toast.error('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleVerify = async (userId: string) => {
        if (actionLoading) return;
        setActionLoading(userId);
        try {
            await updateDoc(doc(db, 'users', userId), {
                isVerified: true,
                updatedAt: new Date()
            });
            toast.success('User verified');
            refreshUsers();
        } catch (error) {
            logger.error('Failed to verify user', error as Error);
            toast.error('Failed to verify user');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <GlassContainer>
            <Toolbar>
                <SearchInputCallback>
                    <Search />
                    <input
                        type="text"
                        placeholder={t('admin.searchUsers')}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </SearchInputCallback>
                <ActionButton onClick={() => refreshUsers()} title="Refresh">
                    <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                </ActionButton>
            </Toolbar>

            <div style={{ overflowX: 'auto' }}>
                <GlassTable>
                    <thead>
                        <tr>
                            <TableHeader>User</TableHeader>
                            <TableHeader>Role</TableHeader>
                            <TableHeader>Plan</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Joined</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any) => (
                            <GlassRow key={user.id}>
                                <td>
                                    <UserCell>
                                        <img src={user.photoURL || '/assets/images/default-avatar.svg'} alt={user.displayName} />
                                        <div className="info">
                                            <span className="name">{user.displayName || 'Unnamed User'}</span>
                                            <span className="email">{user.email}</span>
                                        </div>
                                    </UserCell>
                                </td>
                                <td>
                                    <Badge $variant={user.profileType === 'company' ? 'info' : user.profileType === 'dealer' ? 'warning' : 'neutral'}>
                                        {user.profileType || 'private'}
                                    </Badge>
                                </td>
                                <td>
                                    <span className="font-medium text-gray-700">{user.planTier || 'Free'}</span>
                                </td>
                                <td>
                                    <Badge $variant={user.isActive ? 'success' : 'danger'}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {user.isVerified && <CheckCircle size={14} color="#16a34a" style={{ marginLeft: 6 }} />}
                                </td>
                                <td>
                                    {user.createdAt?.seconds ? format(new Date(user.createdAt.seconds * 1000), 'MMM d, yyyy') : '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {!user.isVerified && (
                                            <ActionButton
                                                onClick={() => handleVerify(user.id)}
                                                disabled={!!actionLoading}
                                                title="Verify User"
                                                style={{ color: '#16a34a', background: 'rgba(220, 252, 231, 0.3)' }}
                                            >
                                                <CheckCircle size={18} />
                                            </ActionButton>
                                        )}
                                        <ActionButton
                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                            disabled={!!actionLoading}
                                            title={user.isActive ? "Deactivate User" : "Activate User"}
                                            style={{
                                                color: user.isActive ? '#ef4444' : '#16a34a',
                                                background: user.isActive ? 'rgba(254, 226, 226, 0.3)' : 'rgba(220, 252, 231, 0.3)'
                                            }}
                                        >
                                            {user.isActive ? <ShieldOff size={18} /> : <Shield size={18} />}
                                        </ActionButton>
                                    </div>
                                </td>
                            </GlassRow>
                        ))}
                        {users.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </GlassTable>
            </div>

            {hasMore && (
                <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.5)',
                            background: 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(4px)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#475569',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Loading...' : 'Load More Users'}
                    </button>
                </div>
            )}
        </GlassContainer>
    );
};

export default UsersTable;
