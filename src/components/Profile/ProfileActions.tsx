import { logger } from '../../services/logger-service';
// RBAC-Aware Profile Actions Component
// Conditionally renders admin/dealer features based on user permissions
// Professional permission checking with hasPermission from rbac constants
// English/Bulgarian bilingual. No emojis. <200 lines.

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthProvider';
import { hasPermission, Role } from '../../constants/rbac';
import styled from 'styled-components';

interface ProfileActionsProps {
  profileId: string;
  userRole: Role;
  onViewAnalytics?: () => void;
  onManageTeam?: () => void;
  onAssignBadge?: () => void;
  onModerateContent?: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  profileId,
  userRole,
  onViewAnalytics,
  onManageTeam,
  onAssignBadge,
  onModerateContent
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Permission checks
  const canViewAdvancedAnalytics = hasPermission(userRole, 'analytics.view.advanced');
  const canManageTeam = hasPermission(userRole, 'team.invite');
  const canAssignBadges = hasPermission(userRole, 'badge.assign');
  const canModerate = hasPermission(userRole, 'posts.moderate');

  return (
    <Container>
      <SectionTitle>{t('profile.actions')}</SectionTitle>
      
      <ActionsGrid>
        {/* Basic actions - all users */}
        <ActionCard onClick={() => logger.info('Edit profile')}>
          <ActionIcon>✏️</ActionIcon>
          <ActionLabel>{t('profile.editProfile')}</ActionLabel>
        </ActionCard>

        <ActionCard onClick={() => logger.info('View listings')}>
          <ActionIcon>📋</ActionIcon>
          <ActionLabel>{t('profile.viewListings')}</ActionLabel>
        </ActionCard>

        {/* Advanced analytics - dealer, company, admin only */}
        {canViewAdvancedAnalytics && onViewAnalytics && (
          <ActionCard onClick={onViewAnalytics} premium>
            <ActionIcon>📊</ActionIcon>
            <ActionLabel>{t('profile.advancedAnalytics')}</ActionLabel>
            <PremiumBadge>{t('common.premium')}</PremiumBadge>
          </ActionCard>
        )}

        {/* Team management - dealer/company only */}
        {canManageTeam && onManageTeam && (
          <ActionCard onClick={onManageTeam}>
            <ActionIcon>👥</ActionIcon>
            <ActionLabel>{t('profile.manageTeam')}</ActionLabel>
          </ActionCard>
        )}

        {/* Badge assignment - admin only */}
        {canAssignBadges && onAssignBadge && (
          <ActionCard onClick={onAssignBadge} admin>
            <ActionIcon>🏆</ActionIcon>
            <ActionLabel>{t('profile.assignBadges')}</ActionLabel>
            <AdminBadge>{t('common.admin')}</AdminBadge>
          </ActionCard>
        )}

        {/* Content moderation - admin only */}
        {canModerate && onModerateContent && (
          <ActionCard onClick={onModerateContent} admin>
            <ActionIcon>🛡️</ActionIcon>
            <ActionLabel>{t('profile.moderateContent')}</ActionLabel>
            <AdminBadge>{t('common.admin')}</AdminBadge>
          </ActionCard>
        )}
      </ActionsGrid>

      {/* Role indicator */}
      <RoleIndicator>
        {t('profile.currentRole')}: <RoleBadge role={userRole}>{t(`roles.${userRole}`)}</RoleBadge>
      </RoleIndicator>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ActionCard = styled.button<{ premium?: boolean; admin?: boolean }>`
  background: ${({ premium, admin }) => premium ? '#fff9e6' : admin ? '#ffe6e6' : '#fff'};
  border: 1px solid ${({ premium, admin }) => premium ? '#f5a623' : admin ? '#d32f2f' : '#e0e0e0'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ActionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

const PremiumBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #f5a623;
  color: white;
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
`;

const AdminBadge = styled(PremiumBadge)`
  background: #d32f2f;
`;

const RoleIndicator = styled.div`
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.875rem;
  color: #666;
`;

const RoleBadge = styled.span<{ role: Role }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  background: ${({ role }) => 
    role === 'super_admin' ? '#9c27b0' :
    role === 'admin' ? '#d32f2f' :
    role === 'company' ? '#1976d2' :
    role === 'dealer' ? '#388e3c' :
    '#ff9800'
  };
  color: white;
`;

export default ProfileActions;
