import React, { useState } from 'react';
import styled from 'styled-components';
import { adminService } from '../../../../services/admin/admin-service';
import { User } from '../../../../types/user/bulgarian-user.types';
import { Search, Shield, Lock, Mail, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-secondary);
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-secondary);
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary-main);
    }
  }
  
  button {
    padding: 0 1.5rem;
    background: var(--primary-main);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const UserCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const UserHeader = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(255,255,255,0.02);
  }
`;

const GodModePanel = styled.div`
  padding: 1.5rem;
  background: rgba(220, 38, 38, 0.05); // Red tint for danger zone
  border-top: 1px solid var(--border-secondary);
  
  h4 {
    color: var(--error-main);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.danger ? 'var(--error-main)' : 'var(--border-secondary)'};
  background: ${props => props.danger ? 'rgba(220, 38, 38, 0.1)' : 'var(--bg-card)'};
  color: ${props => props.danger ? 'var(--error-main)' : 'var(--text-primary)'};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const UserManager: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const users = await adminService.searchUsers(query);
            setResults(users);
        } catch {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForceUpdate = async (uid: string, type: 'dealer' | 'company' | 'private') => {
        if (!confirm(`DANGER: Force switching user to ${type}? This bypasses payment.`)) return;

        try {
            await adminService.forceUpdateUser(uid, {
                profileType: type,
                planTier: type === 'private' ? 'free' : type,
                // Reset limits to match new plan manually or rely on context to handle
            });
            toast.success(`User switched to ${type}`);
            handleSearch(); // Refresh
        } catch {
            toast.error('Force update failed');
        }
    };

    return (
        <Container>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={24} color="var(--primary-main)" />
                    User Manager (God Mode)
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Manage subscriptions, lock accounts, and override permissions.
                </p>
            </div>

            <SearchBar>
                <input
                    placeholder="Search by email or name..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    <Search size={18} /> Search
                </button>
            </SearchBar>

            <div>
                {results.map(user => (
                    <UserCard key={user.uid}>
                        <UserHeader onClick={() => setExpandedUser(expandedUser === user.uid ? null : user.uid)}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{user.displayName || 'Unnamed User'}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{
                                    padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', fontSize: '0.8rem'
                                }}>
                                    {user.profileType.toUpperCase()}
                                </span>
                                <ChevronRight
                                    size={20}
                                    style={{ transform: expandedUser === user.uid ? 'rotate(90deg)' : 'none', transition: '0.2s' }}
                                />
                            </div>
                        </UserHeader>

                        {expandedUser === user.uid && (
                            <GodModePanel>
                                <h4><AlertTriangle size={18} /> Danger Zone Actions</h4>
                                <ActionGrid>
                                    <ActionButton onClick={() => handleForceUpdate(user.uid, 'dealer')}>
                                        Force Upgrade: Dealer
                                    </ActionButton>
                                    <ActionButton onClick={() => handleForceUpdate(user.uid, 'company')}>
                                        Force Upgrade: Company
                                    </ActionButton>
                                    <ActionButton onClick={() => handleForceUpdate(user.uid, 'private')}>
                                        Downgrade to Private
                                    </ActionButton>
                                    <ActionButton danger>
                                        <Lock size={14} style={{ marginRight: '6px' }} /> Lock Account
                                    </ActionButton>
                                    <ActionButton>
                                        <Mail size={14} style={{ marginRight: '6px' }} /> Send Password Reset
                                    </ActionButton>
                                </ActionGrid>
                            </GodModePanel>
                        )}
                    </UserCard>
                ))}
            </div>
        </Container>
    );
};
