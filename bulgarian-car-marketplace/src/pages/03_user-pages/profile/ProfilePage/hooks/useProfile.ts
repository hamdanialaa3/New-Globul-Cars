import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { bulgarianAuthService } from '../../../../../firebase/index';
import type { BulgarianUser } from '../../../../../types/user/bulgarian-user.types';
import { useToast } from '../../../../../components/Toast';
import { useProfileType } from '../../../../../contexts/ProfileTypeContext';
import { validateProfileData } from '../../../../../utils/validation';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../../../firebase/firebase-config';
import { unifiedCarService } from '../../../../../services/car';
import { logger } from '../../../../../services/logger-service';
import {
  ProfileFormData,
  ProfileCar,
  UseProfileReturn
} from '../types';

const DEFAULT_STATS = {
  totalListings: 0,
  activeListings: 0,
  totalViews: 0,
  totalMessages: 0,
  trustScore: 0
};

const DEFAULT_VERIFICATION = {
  email: false,
  phone: false,
  id: false,
  business: false
};

const RESERVED_ROUTES = ['settings', 'my-ads', 'campaigns', 'analytics', 'consultations'];

const normalizeUser = (raw: BulgarianUser | null): BulgarianUser | null => {
  if (!raw) return null;
  return {
    ...raw,
    profileType: raw.profileType ?? 'private',
    planTier: raw.planTier ?? 'free',
    stats: { ...DEFAULT_STATS, ...raw.stats },
    verification: { ...DEFAULT_VERIFICATION, ...raw.verification }
  };
};

const buildFormData = (profile: BulgarianUser | null): ProfileFormData => ({
  accountType: (profile as any)?.accountType || 'individual',
  firstName: (profile as any)?.firstName || '',
  lastName: (profile as any)?.lastName || '',
  middleName: (profile as any)?.middleName || '',
  dateOfBirth: (profile as any)?.dateOfBirth || '',
  placeOfBirth: (profile as any)?.placeOfBirth || '',
  businessName: (profile as any)?.businessName || '',
  bulstat: (profile as any)?.bulstat || '',
  vatNumber: (profile as any)?.vatNumber || '',
  businessType: (profile as any)?.businessType || 'dealership',
  registrationNumber: (profile as any)?.registrationNumber || '',
  businessAddress: (profile as any)?.businessAddress || '',
  businessCity: (profile as any)?.businessCity || '',
  businessPostalCode: (profile as any)?.businessPostalCode || '',
  website: (profile as any)?.website || '',
  businessPhone: (profile as any)?.businessPhone || '',
  businessEmail: (profile as any)?.businessEmail || '',
  workingHours: (profile as any)?.workingHours || '',
  businessDescription: (profile as any)?.businessDescription || '',
  phoneNumber: profile?.phoneNumber || '',
  email: profile?.email || '',
  address: (profile as any)?.address || '',
  city: profile?.location?.city || (profile as any)?.city || '',
  postalCode: (profile as any)?.postalCode || '',
  bio: profile?.bio || '',
  preferredLanguage: profile?.preferredLanguage || 'bg'
});

const mapListingsToCars = (listings: any[]): ProfileCar[] =>
  listings.map(car => ({
    id: car.id || '',
    title: `${car.make} ${car.model}`,
    make: car.make || '',
    model: car.model || '',
    year: car.year || 0,
    price: car.price || 0,
    imageUrl: (car.images && car.images.length > 0)
      ? (typeof car.images[0] === 'string' ? car.images[0] : '')
      : '',
    mainImage: (car.images && car.images.length > 0)
      ? (typeof car.images[0] === 'string' ? car.images[0] : '')
      : '',
    mileage: car.mileage,
    fuelType: car.fuelType,
    status: (car.status as 'active' | 'sold' | 'pending' | 'draft') || 'active',
    viewCount: car.views || 0,
    views: car.views || 0,
    inquiries: 0
  }));

export const useProfile = (targetUserId?: string): UseProfileReturn => {
  const { t } = useTranslation();
  const toast = useToast();
  const { profileType, theme, permissions, planTier } = useProfileType();

  const [viewer, setViewer] = useState<BulgarianUser | null>(null);
  const [target, setTarget] = useState<BulgarianUser | null>(null);
  const [userCars, setUserCars] = useState<ProfileCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(buildFormData(null));

  const effectiveTargetId = useMemo(() => {
    if (!targetUserId || RESERVED_ROUTES.includes(targetUserId)) {
      return undefined;
    }
    return targetUserId;
  }, [targetUserId]);

  const loadCarsForProfile = useCallback(async (profile: BulgarianUser | null) => {
    // ✅ CRITICAL FIX: Stronger validation
    if (!profile || !profile.uid || typeof profile.uid !== 'string' || profile.uid.trim() === '') {
      logger.warn('loadCarsForProfile: invalid profile', { profile: profile?.uid });
      setUserCars([]);
      return;
    }

    try {
      // Use unified service
      const cars = await unifiedCarService.getUserCars(profile.uid);
      setUserCars(mapListingsToCars(cars || []));
    } catch (error) {
      logger.error('Error loading cars for profile', error as Error, { userId: profile.uid });
      setUserCars([]);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authUser = auth.currentUser;
      const viewingOwn = !effectiveTargetId || effectiveTargetId === authUser?.uid;
      setIsOwnProfile(viewingOwn);

      // ⚡ FIX: If accessing own profile without being logged in, don't try to load data
      // AuthGuard will handle showing the login prompt
      if (viewingOwn && !authUser) {
        setLoading(false);
        setViewer(null);
        setTarget(null);
        setError(null);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug('useProfile: loading profiles', {
          targetUserId,
          effectiveTargetId,
          viewerId: authUser?.uid,
          viewingOwn
        });
      }

      const viewerPromise = authUser
        ? bulgarianAuthService.getCurrentUserProfile()
        : Promise.resolve(null);
      const targetPromise = viewingOwn
        ? viewerPromise
        : bulgarianAuthService.getUserProfileById(effectiveTargetId!);

      const [viewerRaw, targetRaw] = await Promise.all([viewerPromise, targetPromise]);
      const normalizedViewer = normalizeUser(viewerRaw);
      const normalizedTarget = normalizeUser(targetRaw ?? viewerRaw ?? null);

      setViewer(normalizedViewer);
      setTarget(normalizedTarget);
      setFormData(buildFormData(normalizedTarget));
      await loadCarsForProfile(normalizedTarget);

      // ⚡ FIX: Only show error if user is logged in and trying to access their own profile
      // Don't show error toast if user is not logged in (AuthGuard will handle it)
      if (!normalizedTarget) {
        const message = t('profile.load_user_error');
        setError(message);
        // Only show toast if user is logged in (viewer exists)
        if (normalizedViewer) {
          toast.error(message);
        }
      }
    } catch (err) {
      logger.error('Error loading user profile', err as Error, { targetUserId, effectiveTargetId });
      const message = t('profile.load_user_error_generic');
      setError(message);
      // ⚡ FIX: Only show toast if user is logged in
      // Check if viewer exists (user is logged in) before showing error toast
      const authUser = auth.currentUser;
      if (authUser) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [effectiveTargetId, loadCarsForProfile, t, targetUserId, toast]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (!target?.uid || !isOwnProfile) {
      return;
    }

    const userId = target.uid;
    if (typeof userId !== 'string' || userId.trim() === '') {
      logger.warn('[useProfile] invalid userId for realtime listener', { userId });
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      snapshot => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setTarget(prev => {
          const merged = normalizeUser({
            ...(prev ?? { uid: userId }),
            ...data,
            uid: userId,
            email: data.email || prev?.email || ''
          } as BulgarianUser);
          setFormData(buildFormData(merged));
          return merged;
        });
      },
      err => logger.error('Real-time listener error', err as Error, { userId })
    );

    return () => unsubscribe();
  }, [target?.uid]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!target) return;

      const validation = validateProfileData(formData, formData.accountType);
      if (!validation.valid) {
        const errorMessages = Object.values(validation.errors).join('\n');
        toast.error(errorMessages, 'Validation Error / Грешка при валидация');
        return;
      }

      const updateData: any = {
        uid: target.uid,
        displayName: formData.accountType === 'business'
          ? formData.businessName
          : `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phoneNumber || '',
        bio: formData.bio || '',
        locationData: {
          cityId: '',
          cityName: {
            bg: formData.city || '',
            en: formData.city || ''
          },
          coordinates: { lat: 0, lng: 0 },
          region: '',
          postalCode: formData.postalCode || '',
          address: formData.address || ''
        },
        location: {
          city: formData.city || '',
          region: '',
          postalCode: formData.postalCode || ''
        },
        preferredLanguage: formData.preferredLanguage as 'bg' | 'en',
        accountType: formData.accountType,
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        middleName: formData.middleName || '',
        dateOfBirth: formData.dateOfBirth || '',
        placeOfBirth: formData.placeOfBirth || '',
        address: formData.address || '',
        businessName: formData.businessName || '',
        bulstat: formData.bulstat || '',
        vatNumber: formData.vatNumber || '',
        businessType: formData.businessType || '',
        registrationNumber: formData.registrationNumber || '',
        businessAddress: formData.businessAddress || '',
        businessCity: formData.businessCity || '',
        businessPostalCode: formData.businessPostalCode || '',
        website: formData.website || '',
        businessPhone: formData.businessPhone || '',
        businessEmail: formData.businessEmail || '',
        workingHours: formData.workingHours || '',
        businessDescription: formData.businessDescription || ''
      };

      await bulgarianAuthService.updateUserProfile(updateData);

      toast.success(
        'Profile updated successfully! / Профилът е обновен успешно!',
        'Success / Успех'
      );
      setEditing(false);
      await loadUserData();
    } catch (err: any) {
      logger.error('Error updating profile', err as Error);
      toast.error(
        err?.message || 'Failed to update profile / Грешка при обновяване на профила',
        'Error / Грешка'
      );
    }
  };

  const handleCancelEdit = () => {
    setFormData(buildFormData(target));
    setEditing(false);
  };

  const handleLogout = async () => {
    try {
      await bulgarianAuthService.signOut();
      window.location.href = '/';
    } catch (err) {
      logger.error('Error signing out', err as Error);
    }
  };

  return {
    user: target,
    target,
    viewer,
    userCars,
    loading,
    editing,
    formData,
    isOwnProfile,
    error,

    profileType,
    theme,
    permissions,
    planTier,

    loadUserData,
    refresh: loadUserData,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
    setEditing,
    setUser: setTarget,
    loadUserCars: loadUserData
  };
};