/**
 * Team Management Page
 * Route: /company/team
 * Access: Company accounts only
 * 
 * Main orchestrator for team management features
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthProvider';
import { useProfileType } from '@/contexts/ProfileTypeContext';
import { teamManagementService, TeamMember } from '@/services/company/team-management-service';
import { logger } from '@/services/logger-service';
import { TeamStats } from './components/TeamStats';
import { TeamMemberCard } from './components/TeamMemberCard';
import { InviteMemberModal } from './components/InviteMemberModal';
import { FaUserPlus, FaUsers, FaShieldAlt } from 'react-icons/fa';

// ===== Types =====

interface TeamState {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
}

// ===== Main Component =====

export const TeamManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { userProfile, isCompany } = useProfileType();

  const [state, setState] = useState<TeamState>({
    members: [],
    loading: true,
    error: null
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'agent' | 'viewer'>('all');

  // Fetch team members
  useEffect(() => {
    if (!user || !isCompany) return;

    const fetchMembers = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const members = await teamManagementService.getTeamMembers(user.uid);
        setState({ members, loading: false, error: null });
      } catch (error) {
        logger.error('Failed to fetch team members', error as Error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'فشل تحميل أعضاء الفريق'
        }));
      }
    };

    fetchMembers();
  }, [user, isCompany]);

  // Filter members
  const filteredMembers = state.members.filter(member => {
    const matchesSearch = member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle successful invite
  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    // Refresh members list
    if (user) {
      teamManagementService.getTeamMembers(user.uid).then(members => {
        setState(prev => ({ ...prev, members }));
      });
    }
  };

  // Access control
  if (!isCompany) {
    return (
      <Container>
        <AccessDenied>
          <FaShieldAlt />
          <h2>Access Denied</h2>
          <p>هذه الصفحة متاحة فقط لحسابات الشركات</p>
        </AccessDenied>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>
            <FaUsers />
            <span>إدارة الفريق</span>
          </Title>
          <InviteButton onClick={() => setShowInviteModal(true)}>
            <FaUserPlus />
            <span>دعوة عضو جديد</span>
          </InviteButton>
        </HeaderContent>
      </Header>

      {/* Stats Dashboard */}
      {user && <TeamStats companyId={user.uid} />}

      {/* Filters */}
      <Filters>
        <SearchInput
          type="text"
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <RoleFilters>
          <FilterButton
            active={roleFilter === 'all'}
            onClick={() => setRoleFilter('all')}
          >
            الكل ({state.members.length})
          </FilterButton>
          <FilterButton
            active={roleFilter === 'admin'}
            onClick={() => setRoleFilter('admin')}
          >
            مدراء ({state.members.filter(m => m.role === 'admin').length})
          </FilterButton>
          <FilterButton
            active={roleFilter === 'agent'}
            onClick={() => setRoleFilter('agent')}
          >
            وكلاء ({state.members.filter(m => m.role === 'agent').length})
          </FilterButton>
          <FilterButton
            active={roleFilter === 'viewer'}
            onClick={() => setRoleFilter('viewer')}
          >
            مشاهدين ({state.members.filter(m => m.role === 'viewer').length})
          </FilterButton>
        </RoleFilters>
      </Filters>

      {/* Members Grid */}
      {state.loading ? (
        <LoadingState>جاري التحميل...</LoadingState>
      ) : state.error ? (
        <ErrorState>{state.error}</ErrorState>
      ) : filteredMembers.length === 0 ? (
        <EmptyState>
          <FaUsers />
          <p>لا يوجد أعضاء بعد</p>
          <small>ابدأ بدعوة أعضاء فريقك</small>
        </EmptyState>
      ) : (
        <MembersGrid>
          {filteredMembers.map(member => (
            <TeamMemberCard
              key={member.id}
              member={member}
              companyId={user!.uid}
              onUpdate={() => {
                // Refresh members list
                teamManagementService.getTeamMembers(user!.uid).then(members => {
                  setState(prev => ({ ...prev, members }));
                });
              }}
            />
          ))}
        </MembersGrid>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          companyId={user!.uid}
          invitedBy={user!.uid}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </Container>
  );
};

// ===== Styled Components =====

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Header = styled.header`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  color: #1e3a8a;
  margin: 0;

  svg {
    color: #3b82f6;
  }
`;

const InviteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const Filters = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const RoleFilters = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: ${props => props.active ? '#2563eb' : '#eff6ff'};
  }
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.25rem;
  color: #6b7280;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #ef4444;
  font-size: 1.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;

  svg {
    font-size: 4rem;
    color: #d1d5db;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    margin: 0.5rem 0;
  }

  small {
    color: #9ca3af;
  }
`;

const AccessDenied = styled.div`
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    font-size: 4rem;
    color: #ef4444;
    margin-bottom: 1rem;
  }

  h2 {
    color: #1f2937;
    margin: 1rem 0;
  }

  p {
    color: #6b7280;
  }
`;
