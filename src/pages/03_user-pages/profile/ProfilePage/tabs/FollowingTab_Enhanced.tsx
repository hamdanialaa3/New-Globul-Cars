import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { followService } from '@/services/social/follow-service';
import { userService } from '@/services/user/canonical-user.service';
import { BulgarianUser } from '@/types/user/bulgarian-user.types';
import { logger } from '@/services/logger-service';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Users, UserX, Loader2, ArrowRight, MessageCircle, UserCheck } from 'lucide-react';
import FollowButton from '@/components/social/FollowButton';

// 🎨 Enhanced Styling with Dark/Light theme support
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-card));
  border-radius: 12px;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;

  span {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 0.35rem 0.75rem;
    border-radius: 20px;
    -webkit-text-fill-color: unset;
    background-clip: unset;
  }

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// 🔮 Glass Morphism Card with glassmorphism effect
const UserCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
    pointer-events: none;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: rgba(255, 143, 16, 0.1);
    border-color: var(--accent-primary);
    box-shadow: 
      0 8px 32px rgba(255, 143, 16, 0.2),
      0 0 20px rgba(255, 143, 16, 0.1),
      inset 0 0 20px rgba(255, 143, 16, 0.05);
    transform: translateY(-8px);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  [data-theme="dark"] & {
    background: rgba(50, 50, 60, 0.5);
    border-color: rgba(255, 143, 16, 0.3);

    &:hover {
      background: rgba(255, 143, 16, 0.15);
    }
  }
`;

// 🔮 Glass Morphism Avatar - Sphere effect
const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1) rotateZ(5deg);
  }
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-secondary);
  border: 3px solid var(--accent-primary);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.5),
    inset 2px 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;

  [data-theme="dark"] & {
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.3),
      inset -2px -2px 5px rgba(255, 255, 255, 0.1),
      inset 2px 2px 5px rgba(0, 0, 0, 0.5);
  }
`;

// 🌟 Glass sphere shine effect
const SphereShine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  pointer-events: none;
  z-index: 3;
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: 700;
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.5),
    inset 2px 2px 5px rgba(0, 0, 0, 0.2);
  margin: 0 auto;
`;

// User Details Modal
const ModalOverlay = styled.div`
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
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
  border-radius: 24px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    width: 95%;
  }
`;

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const UserContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserType = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const UserBio = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;

  button {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;

    &:first-child {
      background: var(--accent-primary);
      color: white;

      &:hover {
        box-shadow: 0 4px 12px rgba(255, 143, 16, 0.3);
        transform: translateY(-2px);
      }
    }

    &:last-child {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-primary);

      &:hover {
        background: var(--bg-tertiary);
      }
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;

  svg {
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
    color: var(--accent-primary);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface FollowingUser extends BulgarianUser {
  followedAt?: Date;
}

interface UserDetailsModal {
  user: FollowingUser | null;
  isOpen: boolean;
}

const FollowingTab: React.FC = () => {
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetailsModal>({ user: null, isOpen: false });
  const { language } = useLanguage();
  const navigate = useNavigate();

  const translations = {
    bg: {
      title: 'Хора, които следваш',
      emptyState: 'Не следваш никого',
      loading: 'Зареждане...',
      viewProfile: 'Преглед на профила',
      message: 'Съобщение',
      unfollow: 'Престани да следваш',
      followers: 'Последователи',
      listings: 'Обяви',
      joinDate: 'Присъединен',
      profileType: 'Тип профил'
    },
    en: {
      title: 'People You Follow',
      emptyState: 'You are not following anyone',
      loading: 'Loading...',
      viewProfile: 'View Profile',
      message: 'Message',
      unfollow: 'Unfollow',
      followers: 'Followers',
      listings: 'Listings',
      joinDate: 'Joined',
      profileType: 'Profile Type'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    loadFollowingUsers();
  }, []);

  const loadFollowingUsers = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual API call to fetch following users
      // const users = await followService.getFollowingUsers();
      // setFollowingUsers(users);
    } catch (error) {
      logger.error('Error loading following users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      // TODO: Implement unfollow logic
      setFollowingUsers(prev => prev.filter(u => u.uid !== userId));
      setSelectedUser({ user: null, isOpen: false });
    } catch (error) {
      logger.error('Error unfollowing user', error);
    }
  };

  const handleMessage = (userId: string) => {
    navigate(`/messaging/${userId}`);
  };

  const handleViewProfile = (numericId: number) => {
    navigate(`/profile/${numericId}`);
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <Loader2 />
        </LoadingState>
      </Container>
    );
  }

  if (followingUsers.length === 0) {
    return (
      <Container>
        <Title>
          <Users size={28} />
          {t.title}
        </Title>
        <EmptyState>
          <Users size={48} />
          <p>{t.emptyState}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderSection>
        <Title>
          <Users size={28} />
          {t.title}
          <span>{followingUsers.length}</span>
        </Title>
      </HeaderSection>

      <UserGrid>
        {followingUsers.map(user => (
          <UserCard
            key={user.uid}
            onClick={() => setSelectedUser({ user, isOpen: true })}
          >
            <AvatarContainer>
              {user.profileImage ? (
                <>
                  <Avatar src={user.profileImage} alt={user.displayName} />
                  <SphereShine />
                </>
              ) : (
                <AvatarPlaceholder>
                  {user.displayName?.charAt(0).toUpperCase()}
                </AvatarPlaceholder>
              )}
            </AvatarContainer>

            <UserContentArea>
              <UserName>
                {user.displayName}
                {user.verified && <UserCheck size={16} color="var(--accent-primary)" />}
              </UserName>

              <UserType>
                {user.profileType === 'dealer' ? '🏢 Dealer' : user.profileType === 'company' ? '🏛️ Company' : '👤 Private'}
              </UserType>

              {user.bio && <UserBio>{user.bio}</UserBio>}
            </UserContentArea>

            <ActionButtons>
              <button onClick={() => handleViewProfile(user.numericId)}>
                <ArrowRight size={16} />
                {t.viewProfile}
              </button>
              <button onClick={() => handleMessage(user.uid)}>
                <MessageCircle size={16} />
                {t.message}
              </button>
            </ActionButtons>
          </UserCard>
        ))}
      </UserGrid>

      {selectedUser.isOpen && selectedUser.user && (
        <ModalOverlay onClick={() => setSelectedUser({ user: null, isOpen: false })}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <AvatarContainer>
              {selectedUser.user.profileImage ? (
                <>
                  <Avatar src={selectedUser.user.profileImage} alt={selectedUser.user.displayName} />
                  <SphereShine />
                </>
              ) : (
                <AvatarPlaceholder>
                  {selectedUser.user.displayName?.charAt(0).toUpperCase()}
                </AvatarPlaceholder>
              )}
            </AvatarContainer>

            <UserName style={{ textAlign: 'center', marginTop: '1rem' }}>
              {selectedUser.user.displayName}
            </UserName>

            {selectedUser.user.bio && (
              <UserBio style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                {selectedUser.user.bio}
              </UserBio>
            )}

            <UserInfoGrid>
              <InfoItem>
                <InfoLabel>{t.followers}</InfoLabel>
                <InfoValue>{selectedUser.user.followerCount || 0}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>{t.listings}</InfoLabel>
                <InfoValue>{selectedUser.user.listingsCount || 0}</InfoValue>
              </InfoItem>
            </UserInfoGrid>

            <ActionButtons>
              <button onClick={() => handleViewProfile(selectedUser.user!.numericId)}>
                <ArrowRight size={16} />
                {t.viewProfile}
              </button>
              <button onClick={() => handleUnfollow(selectedUser.user!.uid)}>
                <UserX size={16} />
                {t.unfollow}
              </button>
            </ActionButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default FollowingTab;
