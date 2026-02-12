// src/features/team/TeamManagement.tsx
// Team Management Page - Company feature (routes delegate)

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Users, UserPlus, Mail, Shield, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';
import { useAuth } from '@/contexts/AuthProvider';
import { teamManagementService, TeamMember, TeamRole } from '@/services/company/team-management-service';
import { serviceLogger } from '@/services/logger-service';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InviteButton = styled.button`
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
  }
`;

const TeamGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const MemberCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
`;

const MemberEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const RoleBadge = styled.span<{ $role?: string }>`
  background: ${({ $role }) => $role === 'admin' ? '#fef3c7' : $role === 'agent' ? '#dbeafe' : '#d1fae5'};
  color: ${({ $role }) => $role === 'admin' ? '#92400e' : $role === 'agent' ? '#1d4ed8' : '#065f46'};
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #6c757d;
  gap: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
`;

const InviteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 480px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CancelBtn = styled.button`
  padding: 0.75rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
`;

const ROLE_LABELS: Record<string, Record<string, string>> = {
  admin: { bg: 'Администратор', en: 'Admin' },
  agent: { bg: 'Агент', en: 'Agent' },
  viewer: { bg: 'Наблюдател', en: 'Viewer' },
  owner: { bg: 'Собственик', en: 'Owner' },
};

export const TeamManagement: React.FC = () => {
  const { language } = useLanguage();
  const toast = useToast();
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('agent');
  const [inviting, setInviting] = useState(false);

  // Load team members from Firestore
  useEffect(() => {
    if (!user) return;
    let isActive = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await teamManagementService.getTeamMembers(user.uid);
        if (isActive) setMembers(data);
      } catch (err) {
        serviceLogger.error('TeamManagement', 'Failed to load team', err);
        if (isActive) {
          toast.error(language === 'bg' ? 'Грешка при зареждане на екипа' : 'Failed to load team');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, [user]);

  const handleInvite = async () => {
    if (!user || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await teamManagementService.inviteMember(user.uid, {
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedBy: user.uid,
      });
      toast.success(language === 'bg' ? `Поканата е изпратена до ${inviteEmail}` : `Invitation sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail('');
      // Refresh members
      const data = await teamManagementService.getTeamMembers(user.uid);
      setMembers(data);
    } catch (err) {
      serviceLogger.error('TeamManagement', 'Invite failed', err);
      toast.error(language === 'bg' ? 'Грешка при изпращане на поканата' : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <Container>
      <Header>
        <Title>
          <Users />
          {language === 'bg' ? 'Управление на екипа' : 'Team Management'}
        </Title>
        <InviteButton onClick={() => setShowInvite(true)}>
          <UserPlus />
          {language === 'bg' ? 'Покани член' : 'Invite Member'}
        </InviteButton>
      </Header>

      {loading ? (
        <LoadingContainer>
          <Loader size={20} className="spin" />
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingContainer>
      ) : members.length === 0 ? (
        <EmptyState>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <h3>{language === 'bg' ? 'Все още няма членове' : 'No team members yet'}</h3>
          <p>{language === 'bg' ? 'Поканете първия член на вашия екип' : 'Invite your first team member'}</p>
        </EmptyState>
      ) : (
        <TeamGrid>
          {/* Current user card */}
          {user && (
            <MemberCard>
              <Avatar>{getInitials(user.displayName || user.email || 'U')}</Avatar>
              <MemberInfo>
                <MemberName>{user.displayName || (language === 'bg' ? 'Вие' : 'You')}</MemberName>
                <MemberEmail>{user.email}</MemberEmail>
              </MemberInfo>
              <RoleBadge $role="admin">
                <Shield size={14} style={{ marginRight: '0.25rem' }} />
                {ROLE_LABELS.owner[language] || 'Owner'}
              </RoleBadge>
            </MemberCard>
          )}

          {/* Team members from Firestore */}
          {members.filter(m => m.uid !== user?.uid).map((member) => (
            <MemberCard key={member.id || member.uid}>
              <Avatar>{getInitials(member.displayName || member.email)}</Avatar>
              <MemberInfo>
                <MemberName>{member.displayName || member.email}</MemberName>
                <MemberEmail>{member.email}</MemberEmail>
              </MemberInfo>
              <RoleBadge $role={member.role}>
                {ROLE_LABELS[member.role]?.[language] || member.role}
              </RoleBadge>
            </MemberCard>
          ))}
        </TeamGrid>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <InviteModal onClick={() => setShowInvite(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {language === 'bg' ? 'Покани член на екипа' : 'Invite Team Member'}
            </h2>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {language === 'bg' ? 'Имейл адрес' : 'Email Address'}
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="member@company.com"
            />
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              {language === 'bg' ? 'Роля' : 'Role'}
            </label>
            <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)}>
              <option value="admin">{ROLE_LABELS.admin[language]}</option>
              <option value="agent">{ROLE_LABELS.agent[language]}</option>
              <option value="viewer">{ROLE_LABELS.viewer[language]}</option>
            </Select>
            <ButtonRow>
              <CancelBtn onClick={() => setShowInvite(false)}>
                {language === 'bg' ? 'Отказ' : 'Cancel'}
              </CancelBtn>
              <InviteButton onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                <Mail size={16} />
                {inviting
                  ? (language === 'bg' ? 'Изпращане...' : 'Sending...')
                  : (language === 'bg' ? 'Изпрати покана' : 'Send Invitation')}
              </InviteButton>
            </ButtonRow>
          </ModalContent>
        </InviteModal>
      )}
    </Container>
  );
};

export default TeamManagement;
