// ProfilePage - صفحة عرض البروفايل
// `/profile/:numericId` - يعرض بروفايل البائع

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
 * صفحة عرض بروفايل البائع
 * 
 * السلوك:
 * - `/profile/:numericId` - عرض البروفايل (للمستخدمين المسجلين فقط)
 * - إذا لم يكن مسجل → توجيه إلى تسجيل الدخول
 * - بعد تسجيل الدخول → العودة إلى نفس الصفحة
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

  // تحميل بيانات البروفايل
  useEffect(() => {
    if (!profileNumericId) {
      setError(language === 'bg' 
        ? 'معرف البروفايل غير صحيح'
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
            ? `فشل تحميل البروفايل: ${errorMessage}`
            : `Failed to load profile: ${errorMessage}`
        );
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileNumericId, language]);

  // تحديد ما إذا كان البروفايل الخاص بالمستخدم الحالي
  const isOwnProfile = useMemo(
    () => currentUser?.numericId === profileNumericId,
    [currentUser?.numericId, profileNumericId]
  );

  // معالج إجراءات البروفايل
  const handleProfileAction = (action: string, payload?: any) => {
    logger.info(`[ProfilePage] Action triggered: ${action}`, payload);

    switch (action) {
      case 'contact':
        logger.info('[ProfilePage] Opening contact form');
        // TODO: فتح نموذج الاتصال
        break;

      case 'message':
        logger.info('[ProfilePage] Opening messaging interface');
        // TODO: فتح واجهة الرسائل
        break;

      default:
        logger.warn(`[ProfilePage] Unknown action: ${action}`);
    }
  };

  // حالة التحميل
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          {language === 'bg' ? 'جاري التحميل...' : 'Loading...'}
        </LoadingContainer>
      </PageContainer>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h1>{language === 'bg' ? 'خطأ' : 'Error'}</h1>
          <p>{error}</p>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // عدم العثور على البروفايل
  if (!profile) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h1>{language === 'bg' ? 'البروفايل غير موجود' : 'Profile Not Found'}</h1>
          <p>
            {language === 'bg'
              ? 'لم نتمكن من العثور على البروفايل المطلوب'
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
