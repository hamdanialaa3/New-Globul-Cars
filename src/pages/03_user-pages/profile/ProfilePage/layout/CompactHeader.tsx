// ProfilePage/layout/CompactHeader.tsx
// Compact header with user info and quick actions
// Phase 0 Day 2: Extracted from index.tsx

import React from 'react';
import styled from 'styled-components';
import { Edit, LogOut, Settings as SettingsIcon, UserPlus } from 'lucide-react';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import type { ProfileTheme } from '../../../../../contexts/ProfileTypeContext';

interface CompactHeaderProps {
  user: BulgarianUser | null;
  theme: ProfileTheme;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEditClick?: () => void;
  onSettingsClick?: () => void;
  onFollowClick?: () => void;
  onLogoutClick?: () => void;
}

const HeaderContainer = styled.div<{ $themeColor?: string }>`
  background: linear-gradient(135deg, #3e3e3e 0%, #2a2a2a 100%);
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.4),
    -4px -4px 8px rgba(255, 255, 255, 0.05);
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  border-left: 4px solid ${props => props.$themeColor || '#FF8F10'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 16px;
  }
`;

const ProfileImageSmall = styled.img<{ $themeColor?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  
  border: 3px solid ${props => props.$themeColor || '#FF8F10'};
  box-shadow: 0 0 15px ${props => props.$themeColor || '#FF8F10'}40;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

const QuickActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const QuickActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' }>`
  background: ${props => 
    props.$variant === 'primary' ? 'linear-gradient(135deg, #FF8F10 0%, #FF7900 100%)' :
    props.$variant === 'success' ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' :
    'linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)'
  };
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  display: flex;
  align-items: center;
  gap: 6px;
  
  box-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.05);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      4px 4px 8px rgba(0, 0, 0, 0.4),
      -4px -4px 8px rgba(255, 255, 255, 0.08);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  user,
  theme,
  isOwnProfile,
  isFollowing,
  onEditClick,
  onSettingsClick,
  onFollowClick,
  onLogoutClick
}) => {
  if (!user) return null;

  return (
    <HeaderContainer $themeColor={theme.primary}>
      <ProfileImageSmall 
        src={user.photoURL || '/default-avatar.png'} 
        alt={user.displayName}
        $themeColor={theme.primary}
      />
      
      <UserInfo>
        <UserName>{user.displayName}</UserName>
        <UserEmail>{user.email}</UserEmail>
      </UserInfo>
      
      <QuickActionsContainer>
        {isOwnProfile ? (
          <>
            <QuickActionButton onClick={onEditClick} $variant="secondary">
              <Edit /> تعديل
            </QuickActionButton>
            <QuickActionButton onClick={onSettingsClick} $variant="secondary">
              <SettingsIcon /> إعدادات
            </QuickActionButton>
            <QuickActionButton onClick={onLogoutClick} $variant="secondary">
              <LogOut /> Logout
            </QuickActionButton>
          </>
        ) : (
          <QuickActionButton 
            onClick={onFollowClick} 
            $variant={isFollowing ? "success" : "primary"}
          >
            <UserPlus /> {isFollowing ? 'Following' : 'Follow'}
          </QuickActionButton>
        )}
      </QuickActionsContainer>
    </HeaderContainer>
  );
};

export default CompactHeader;

