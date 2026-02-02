// ProfilePage - صفحة البروفايل الرئيسية
// تعرض البروفايل بناءً على numericId

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile/profile-service';
import ProfileShell from '@/components/profile/ProfileShell';
import ProfileLoader from '@/components/profile/ProfileLoader';
import type { SellerProfile } from '@/types/profile.types';
import { logger } from '@/services/logger-service';

/**
 * ProfilePage Component
 * صفحة عرض البروفايل الكامل
 * 
 * المسارات:
 * - /profile/:numericId - عرض البروفايل
 * - /profile/:numericId/edit - تعديل البروفايل (محمي)
 */
const ProfilePage: React.FC = () => {
  const { numericId } = useParams<{ numericId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!numericId) {
        setError('رقم البروفايل غير صحيح');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadingProgress(0);

        // محاكاة مراحل التحميل
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 200);

        logger.info('[ProfilePage] Loading profile', { numericId });

        // جلب البروفايل من الخادم
        const profileData = await profileService.getProfileByNumericId(
          parseInt(numericId, 10)
        );

        clearInterval(progressInterval);
        setLoadingProgress(100);

        setProfile(profileData);
        setError(null);

        logger.info('[ProfilePage] Profile loaded successfully', {
          numericId,
          profileType: profileData.profileType,
        });
      } catch (err: any) {
        logger.error('[ProfilePage] Error loading profile', {
          numericId,
          error: err.message,
        });

        setError(err.message || 'حدث خطأ أثناء تحميل البروفايل');
        setProfile(null);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300); // تأخير بسيط لإكمال الأنيميشن
      }
    };

    loadProfile();
  }, [numericId]);

  // معالج النقر على الأزرار
  const handleActionClick = (action: string, payload?: any) => {
    logger.info('[ProfilePage] Action clicked', { action, payload });

    switch (action) {
      case 'contact':
        // فتح نموذج الاتصال
        navigate(`/messages/new?to=${payload?.numericId}`);
        break;

      case 'message':
        // فتح المحادثة
        navigate(`/messages?with=${payload?.numericId}`);
        break;

      case 'edit':
        // الانتقال لصفحة التعديل
        navigate(`/profile/${numericId}/edit`);
        break;

      default:
        logger.warn('[ProfilePage] Unknown action', { action });
    }
  };

  // حالة التحميل
  if (isLoading) {
    return (
      <ProfileLoader
        progress={loadingProgress}
        isFullScreen={true}
        showTip={true}
      />
    );
  }

  // حالة الخطأ
  if (error || !profile) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '4rem auto',
          padding: '2rem',
          textAlign: 'center',
          background: '#FFF3CD',
          border: '1px solid #FFC107',
          borderRadius: '12px',
        }}
      >
        <h2 style={{ color: '#856404', marginBottom: '1rem' }}>
          ⚠️ خطأ في تحميل البروفايل
        </h2>
        <p style={{ color: '#856404', marginBottom: '1.5rem' }}>
          {error || 'البروفايل غير موجود'}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 2rem',
            background: '#FF7A2D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
          }}
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  // تحديد إذا كان هذا بروفايل المستخدم الحالي
  const isOwnProfile = user?.numericId === profile.numericId;
  const viewerNumericId = user?.numericId;

  return (
    <ProfileShell
      profile={profile}
      isLoading={false}
      error={null}
      isViewOnly={!isOwnProfile}
      onActionClick={handleActionClick}
      viewerNumericId={viewerNumericId}
    />
  );
};

export default ProfilePage;
