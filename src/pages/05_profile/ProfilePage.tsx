// ProfilePage - Profile display page
// `/profile/:numericId` - displays seller profile

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ProfileShell } from '@/components/profile';
import { profileService } from '@/services/profile/profile-service';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { logger } from '@/services/logger-service';
import type { SellerProfile } from '@/types/profile.types';

/**
 * Seller profile display page
 * 
 * Behavior:
 * - `/profile/:numericId` - display profile (registered users only)
 * - If not registered → redirect to login
 * - After login → return to the same page
 */

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  text-align: center;

  h1 {
    color: #c33;
    margin-top: 0;
  }

  p {
    color: #666;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.125rem;
  color: #666;
`;

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { numericId } = useParams<{ numericId: string }>();
  const { user: currentUser } = useAuth();
  const { language } = useLanguage();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileNumericId = useMemo(() => {
    const id = numericId ? parseInt(numericId, 10) : null;
    return isNaN(id || 0) ? null : id;
  }, [numericId]);

  // Load profile data
  useEffect(() => {
    if (!profileNumericId) {
      setError(language === 'bg' 
        ? 'Невалиден идентификатор на профил'
        : 'Invalid profile ID'
      );
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        logger.info(`[ProfilePage] Loading profile for numericId: ${profileNumericId}`);

        const profileData = await profileService.getProfileByNumericId(profileNumericId);
        setProfile(profileData);

        logger.info(`[ProfilePage] Successfully loaded profile: ${profileData.name}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('[ProfilePage] Error loading profile:', err);
        
        setError(
          language === 'bg'
            ? `Грешка при зареждане на профил: ${errorMessage}`
            : `Failed to load profile: ${errorMessage}`
        );
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileNumericId, language]);

  // Determine if this is the current user's profile
  const isOwnProfile = useMemo(
    () => currentUser?.numericId === profileNumericId,
    [currentUser?.numericId, profileNumericId]
  );

  // Profile action handler
  const handleProfileAction = (action: string, payload?: any) => {
    logger.info(`[ProfilePage] Action triggered: ${action}`, payload);

    switch (action) {
      case 'contact':
        logger.info('[ProfilePage] Opening contact form');
        // TODO: Open contact form
        break;

      case 'message':
        logger.info('[ProfilePage] Opening messaging interface');
        // TODO: Open messaging interface
        break;

      default:
        logger.warn(`[ProfilePage] Unknown action: ${action}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          {language === 'bg' ? 'Зареждане...' : 'Loading...'}
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h1>{language === 'bg' ? 'Грешка' : 'Error'}</h1>
          <p>{error}</p>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h1>{language === 'bg' ? 'Профилът не е намерен' : 'Profile Not Found'}</h1>
          <p>
            {language === 'bg'
              ? 'Не можахме да намерим търсения профил'
              : 'We could not find the requested profile'}
          </p>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // عرض البروفايل
  return (
    <PageContainer>
      <ProfileShell
        profile={profile}
        isLoading={false}
        error={null}
        isViewOnly={!isOwnProfile}
        onActionClick={handleProfileAction}
        viewerNumericId={currentUser?.numericId}
      />
    </PageContainer>
  );
};

ProfilePage.displayName = 'ProfilePage';

export default ProfilePage;
