import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Edit, User, Shield, Trash2, Search, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { usersReportService } from '../../../services/reports/users-report-service';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase-config';
import { logger } from '../../../services/logger-service';

// Professional God Mode UI
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Container = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const Badge = styled.span`
  background: #e74c3c;
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SearchInput = styled.input`
  background: #333;
  border: 1px solid #444;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  width: 300px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #333;
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #111;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #111;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const Card = styled.div`
  background: #222;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #333;
  transition: all 0.2s;
  position: relative;
  group: hover;

  &:hover {
    transform: translateY(-4px);
    border-color: #555;
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  border: 1px solid #444;
`;

const RoleTag = styled.span<{ type: string }>`
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 100px;
  text-transform: uppercase;
  font-weight: 700;
  background: ${props => {
    switch (props.type) {
      case 'admin': return '#c0392b';
      case 'dealer': return '#2980b9';
      case 'company': return '#8e44ad';
      default: return '#27ae60';
    }
  }};
  color: #fff;
`;

const UserInfo = styled.div`
  color: #fff;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  border-top: 1px solid #333;
  padding-top: 16px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  flex: 1;
  background: ${props => props.danger ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.danger ? '#e74c3c' : '#fff'};
  border: 1px solid ${props => props.danger ? 'rgba(231, 76, 60, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${props => props.danger ? '#e74c3c' : '#fff'};
    color: ${props => props.danger ? '#fff' : '#000'};
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

const StatItem = styled.div`
  font-size: 11px;
  color: #666;
  
  strong {
    color: #bbb;
    margin-left: 4px;
  }
`;

interface GodModeUserGridProps {
  onClose: () => void;
}

export const GodModeUserGrid: React.FC<GodModeUserGridProps> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersReportService.getAllUsers();
      setUsers(data);
    } catch (error) {
      logger.error('GodMode: Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId: string, currentStatus: boolean, userName: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isVerified: !currentStatus });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isVerified: !currentStatus } : u));
    } catch (error) {
      alert('Failed to verify user: ' + error);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (window.confirm(`⚠️ GOD MODE WARNING ⚠️\n\nAre you sure you want to PERMANENTLY DELETE user: ${email}?\n\nThis will remove their profile, listings, and data forever. This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(prev => prev.filter(u => u.uid !== userId));
        alert('User terminated.');
      } catch (error) {
        alert('Failed to delete user: ' + error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  return (
    <Overlay>
      <Container>
        <Header>
          <Title>
            <Shield size={28} />
            GOD MODE: USER CONTROL
            <Badge>{users.length} TOTAL</Badge>
          </Title>
          <Controls>
            <SearchInput
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <CloseButton onClick={fetchUsers} title="Refresh Data">
              <RefreshCw size={20} />
            </CloseButton>
            <CloseButton onClick={onClose} title="Close God Mode">
              <X size={24} />
            </CloseButton>
          </Controls>
        </Header>

        <Grid>
          {loading ? (
            <div style={{ color: '#fff', gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
              ACCESSING MAINFRAME DATA...
            </div>
          ) : filteredUsers.map(user => (
            <Card key={user.uid}>
              <CardHeader>
                <UserAvatar>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  ) : (
                    <User size={24} />
                  )}
                </UserAvatar>
                <RoleTag type={user.profileType || 'private'}>
                  {user.profileType || 'PRIVATE'}
                </RoleTag>
              </CardHeader>

              <UserInfo>
                <UserName>{user.displayName || 'Anonymous User'}</UserName>
                <UserEmail>{user.email}</UserEmail>
                <Stats>
                  <StatItem>Last Login: <strong>{user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 'N/A'}</strong></StatItem>
                  <StatItem>City: <strong>{user.city || 'N/A'}</strong></StatItem>
                </Stats>
              </UserInfo>

              <Actions>
                <ActionButton onClick={() => window.open(`/profile/${user.uid}`, '_blank')}>
                  <Edit size={14} /> EDIT
                </ActionButton>
                <ActionButton onClick={() => handleVerify(user.uid, user.isVerified, user.displayName)}>
                  {user.isVerified ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                  {user.isVerified ? ' UNVERIFY' : ' VERIFY'}
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(user.uid, user.email)}>
                  <Trash2 size={14} /> DELETE
                </ActionButton>
              </Actions>
            </Card>
          ))}
        </Grid>
      </Container>
    </Overlay>
  );
};
