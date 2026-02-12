import { logger } from '../../../services/logger-service';
/**
 * Groups Section
 * Displays user's groups and allows joining/leaving groups
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Users, Plus, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { groupsService } from '../../../services/profile/groups.service';
import type { UserGroup, GroupMembership } from '../../../types/profile-enhancements.types';

const SectionContainer = styled.section<{ $isDark: boolean }>`
  padding: 24px;
  background: ${props => props.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  box-shadow: ${props => props.$isDark 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 24px;
  border: 1px solid ${props => props.$isDark ? '#334155' : '#e2e8f0'};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GroupCard = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  background: ${props => props.$isDark ? '#0f172a' : '#f8fafc'};
  border-radius: 12px;
  border: 1px solid ${props => props.$isDark ? '#1e293b' : '#e2e8f0'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$isDark ? '#475569' : '#cbd5e1'};
    box-shadow: ${props => props.$isDark 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const GroupIcon = styled.div<{ $isDark: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  margin-bottom: 12px;
`;

const GroupName = styled.h4<{ $isDark: boolean }>`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${props => props.$isDark ? '#f1f5f9' : '#1e293b'};
  margin: 0 0 4px 0;
`;

const GroupMembers = styled.div<{ $isDark: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const JoinButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.$isDark ? '#334155' : '#f8fafc'};
  color: ${props => props.$isDark ? '#cbd5e1' : '#64748b'};
  border: 1px solid ${props => props.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  width: 100%;

  &:hover {
    background: ${props => props.$isDark ? '#475569' : '#f1f5f9'};
    border-color: ${props => props.$isDark ? '#64748b' : '#cbd5e1'};
  }
`;

const EmptyState = styled.div<{ $isDark: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
`;

const EmptyIcon = styled.div<{ $isDark: boolean }>`
  margin-bottom: 16px;
  opacity: 0.5;
  color: ${props => props.$isDark ? '#64748b' : '#94a3b8'};
`;

const EmptyText = styled.p<{ $isDark: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$isDark ? '#94a3b8' : '#64748b'};
  margin: 0;
`;

interface GroupsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

export const GroupsSection: React.FC<GroupsSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [popularGroups, setPopularGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadGroups = async () => {
      try {
        const groups = await groupsService.getUserGroups(userId);
        setUserGroups(groups);

        // Load popular groups if user has less than 3 groups
        if (groups.length < 3) {
          const popular = await groupsService.getPopularGroups(5);
          setPopularGroups(popular.filter(g => !groups.some(ug => ug.id === g.id)));
        }
      } catch (error) {
        logger.error('Error loading groups:', error);
        setUserGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [userId]);

  const handleJoinGroup = async (groupId: string) => {
    if (!isOwnProfile) return;

    try {
      await groupsService.joinGroup(userId, groupId);
      const groups = await groupsService.getUserGroups(userId);
      setUserGroups(groups);
      setPopularGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (error) {
      logger.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!isOwnProfile) return;

    try {
      await groupsService.leaveGroup(userId, groupId);
      const groups = await groupsService.getUserGroups(userId);
      setUserGroups(groups);
    } catch (error) {
      logger.error('Error leaving group:', error);
    }
  };

  if (loading) {
    return null;
  }

  const allGroups = [...userGroups, ...popularGroups];

  if (allGroups.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <SectionContainer $isDark={isDark}>
      <SectionHeader>
        <SectionTitle $isDark={isDark}>
          <Users size={20} />
          {language === 'bg' ? 'Групи' : 'Groups'}
        </SectionTitle>
      </SectionHeader>

      {allGroups.length === 0 ? (
        <EmptyState $isDark={isDark}>
          <EmptyIcon $isDark={isDark}>
            <Users size={48} />
          </EmptyIcon>
          <EmptyText $isDark={isDark}>
            {language === 'bg' 
              ? 'Все още не сте член на групи'
              : 'Not a member of any groups yet'}
          </EmptyText>
        </EmptyState>
      ) : (
        <GroupsGrid>
          {allGroups.map(group => {
            const isMember = userGroups.some(ug => ug.id === group.id);
            return (
              <GroupCard key={group.id} $isDark={isDark}>
                <GroupIcon $isDark={isDark}>
                  <Users size={24} />
                </GroupIcon>
                <GroupName $isDark={isDark}>
                  {language === 'bg' ? group.name : group.nameEN}
                </GroupName>
                <GroupMembers $isDark={isDark}>
                  <Users size={12} />
                  {group.memberCount} {language === 'bg' ? 'члена' : 'members'}
                </GroupMembers>
                {isOwnProfile && (
                  isMember ? (
                    <JoinButton 
                      $isDark={isDark} 
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      <X size={16} />
                      {language === 'bg' ? 'Напусни' : 'Leave'}
                    </JoinButton>
                  ) : (
                    <JoinButton 
                      $isDark={isDark} 
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      <Plus size={16} />
                      {language === 'bg' ? 'Присъедини се' : 'Join'}
                    </JoinButton>
                  )
                )}
              </GroupCard>
            );
          })}
        </GroupsGrid>
      )}
    </SectionContainer>
  );
};

export default GroupsSection;

