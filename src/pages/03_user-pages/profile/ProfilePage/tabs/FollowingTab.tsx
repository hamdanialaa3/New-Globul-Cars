import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { followService } from '@/services/social/follow-service';
import { userService } from '@/services/user/canonical-user.service';
import { BulgarianUser } from '@/types/user/bulgarian-user.types';
import { logger } from '@/services/logger-service';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Users, UserX, Loader2, ArrowRight } from 'lucide-react';
import FollowButton from '@/components/social/FollowButton';

const Container = styled.div`
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary || '#1a1a1b'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;

  span {
    font-size: 1rem;
    font-weight: 400;
    color: #666;
    background: #f0f2f5;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const UserCard = styled.div`
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #2b7bff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: #f8fbff;
  }
`;

const Avatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f2f5;
`;

const AvatarPlaceholder = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #999;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1b;
  margin: 0;
`;

const UserType = styled.span`
  font-size: 0.75rem;
  color: #666;
  text-transform: capitalize;
`;

const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 20px;
  border: 2px dashed #dee2e6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;

  svg {
    width: 48px;
    height: 48px;
    color: #ced4da;
  }

  h3 {
    margin: 0;
    color: #343a40;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 4rem;
  color: #2b7bff;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const FollowingTab: React.FC = () => {
  const { user, isOwnProfile } = useOutletContext<{ user: BulgarianUser; isOwnProfile: boolean }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [followingList, setFollowingList] = useState<BulgarianUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchFollowing = async () => {
      // ✅ Allow fetching for both current user and other users
      // If we are viewing another user's profile, we want to see WHO THEY FOLLOW
      // "user" from outlet context is the PROFILE OWNER (the one we are viewing)
      if (!user?.uid) {
        logger.warn('FollowingTab: No user UID found in context');
        return;
      }

      try {
        setIsLoading(true);
        logger.debug('FollowingTab: Fetching following users for:', user.uid);

        // Step 1: Get list of following IDs
        const followingIds = await followService.getFollowing(user.uid);
        logger.debug('FollowingTab: Found following IDs:', followingIds);
        
        if (followingIds.length === 0) {
          if (isMounted) {
            setFollowingList([]);
            setIsLoading(false);
          }
          return;
        }

        // Step 2: Fetch profile data for these users
        const usersBatch = await userService.getUserProfilesBatch(followingIds);
        
        if (isMounted) {
          const list = Array.from(usersBatch.values());
          logger.debug('FollowingTab: Resolved user profiles:', list.length);
          setFollowingList(list);
          setIsLoading(false);
        }
      } catch (error) {
        logger.error('FollowingTab: Failed to load following list', error as Error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFollowing();
    return () => { isMounted = false; };
  }, [user?.uid]);

  const handleUserClick = (targetUser: BulgarianUser) => {
    // Navigate to their profile
    navigate(`/profile/view/${targetUser.numericId}`);
  };

  if (isLoading) {
    return (
      <LoadingWrapper>
        <Loader2 size={40} />
      </LoadingWrapper>
    );
  }

  const translations = {
    title: { bg: 'Следвани потребители', en: 'Following Users' },
    emptyTitle: { bg: 'Все още няма следвани потребители', en: 'No users followed yet' },
    emptySub: { bg: 'Започнете да следвате хора, за да виждате техните обяви тук.', en: 'Start following people to see their listings here.' },
    count: { bg: 'общо', en: 'total' }
  };

  const t = (key: keyof typeof translations) => 
    language === 'bg' ? translations[key].bg : translations[key].en;

  if (followingList.length === 0) {
    return (
      <Container>
        <Title>{t('title')} <span>0</span></Title>
        <EmptyState>
          <UserX />
          <h3>{t('emptyTitle')}</h3>
          <p>{t('emptySub')}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        {t('title')} 
        <span>{followingList.length} {t('count')}</span>
      </Title>
      
      <UserGrid>
        {followingList.map(item => (
          <UserCard key={item.uid} onClick={() => handleUserClick(item)}>
            {item.photoURL ? (
              <Avatar src={item.photoURL} alt={item.displayName || 'User'} />
            ) : (
              <AvatarPlaceholder>👤</AvatarPlaceholder>
            )}
            <UserInfo>
              <UserName>{item.displayName || 'Anonymous'}</UserName>
              <UserType>{item.profileType || 'private'}</UserType>
            </UserInfo>
            <ActionWrapper onClick={(e) => e.stopPropagation()}>
              <FollowButton 
                targetUserId={item.uid} 
                initialIsFollowing={true} 
                size="small"
                onStatusChange={() => {
                  // If unfollowed, we could optionally remove it from the list or just leave it
                  // For better UX, let's keep it but the button will show "Follow"
                }}
              />
              <ArrowRight size={18} style={{ marginLeft: '0.5rem', color: '#ccc' }} />
            </ActionWrapper>
          </UserCard>
        ))}
      </UserGrid>
    </Container>
  );
};

export default FollowingTab;
