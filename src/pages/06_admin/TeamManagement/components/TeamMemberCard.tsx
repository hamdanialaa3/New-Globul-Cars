/**
 * Team Member Card Component
 * Displays individual team member with actions
 * Max: 150 lines (Constitutional Compliance)
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { TeamMember, teamManagementService } from '@/services/company/team-management-service';
import { RoleBadge } from './RoleBadge';
import { FaEllipsisV, FaEdit, FaTrash, FaBan, FaCheck } from 'react-icons/fa';
import { logger } from '@/services/logger-service';

interface Props {
  member: TeamMember;
  companyId: string;
  onUpdate: () => void;
}

export const TeamMemberCard: React.FC<Props> = ({ member, companyId, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'remove' | 'suspend' | 'reactivate') => {
    if (!confirm(`هل أنت متأكد من ${action === 'remove' ? 'حذف' : action === 'suspend' ? 'تعليق' : 'تفعيل'} هذا العضو?`)) return;

    try {
      setLoading(true);
      if (action === 'remove') {
        await teamManagementService.removeMember(companyId, member.id);
      } else if (action === 'suspend') {
        await teamManagementService.suspendMember(companyId, member.id);
      } else {
        await teamManagementService.reactivateMember(companyId, member.id);
      }
      onUpdate();
    } catch (error) {
      logger.error(`Failed to ${action} member`, error as Error);
      alert('فشلت العملية. حاول مرة أخرى.');
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const getLastActiveText = () => {
    if (!member.lastActive) return 'لم يسجل دخول بعد';
    const now = new Date();
    const diffMs = now.getTime() - member.lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  return (
    <Card status={member.status}>
      <CardHeader>
        <UserInfo>
          <Avatar>{member.displayName.charAt(0).toUpperCase()}</Avatar>
          <div>
            <Name>{member.displayName}</Name>
            <Email>{member.email}</Email>
          </div>
        </UserInfo>
        <MenuButton onClick={() => setShowMenu(!showMenu)} disabled={loading}>
          <FaEllipsisV />
          {showMenu && (
            <DropdownMenu>
              {member.status === 'active' ? (
                <MenuItem onClick={() => handleAction('suspend')}>
                  <FaBan /> تعليق
                </MenuItem>
              ) : (
                <MenuItem onClick={() => handleAction('reactivate')}>
                  <FaCheck /> تفعيل
                </MenuItem>
              )}
              <MenuItem danger onClick={() => handleAction('remove')}>
                <FaTrash /> حذف
              </MenuItem>
            </DropdownMenu>
          )}
        </MenuButton>
      </CardHeader>

      <RoleBadge role={member.role} />

      <Stats>
        <Stat>
          <Label>الحالة</Label>
          <Value status={member.status}>
            {member.status === 'active' ? 'نشط' : member.status === 'pending' ? 'معلق' : 'موقوف'}
          </Value>
        </Stat>
        <Stat>
          <Label>آخر نشاط</Label>
          <Value>{getLastActiveText()}</Value>
        </Stat>
      </Stats>
    </Card>
  );
};

// Styled Components

const Card = styled.div<{ status: string }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => 
    props.status === 'active' ? '#10b981' : 
    props.status === 'pending' ? '#f59e0b' : '#ef4444'};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1e3a8a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
`;

const Name = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const Email = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  position: relative;

  &:hover {
    color: #1f2937;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  z-index: 10;
`;

const MenuItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.danger ? '#ef4444' : '#374151'};
  cursor: pointer;

  &:hover {
    background: ${props => props.danger ? '#fee2e2' : '#f3f4f6'};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const Stat = styled.div``;

const Label = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const Value = styled.div<{ status?: string }>`
  font-weight: 600;
  color: ${props => 
    props.status === 'active' ? '#10b981' : 
    props.status === 'pending' ? '#f59e0b' : 
    props.status === 'suspended' ? '#ef4444' : '#1f2937'};
`;
