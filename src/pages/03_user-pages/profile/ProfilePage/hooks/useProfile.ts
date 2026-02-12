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
import { getUserByNumericId, getFirebaseUidByNumericId } from '../../../../../services/numeric-id-lookup.service';
import { ensureUserNumericId } from '../../../../../services/numeric-id-assignment.service';
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
  trustScore: 0,
  followersCount: 0,
  followingCount: 0
};

const DEFAULT_VERIFICATION = {
  email: false,
  phone: false,
  id: false,
  business: false
};

const RESERVED_ROUTES = ['settings', 'my-ads', 'campaigns', 'analytics', 'consultations'];

const normalizeUser = (raw: any): BulgarianUser | null => {
  if (!raw) return null;
  return {
    ...raw,
    profileType: raw.profileType ?? 'private',
    planTier: raw.planTier ?? 'free',
    stats: { ...DEFAULT_STATS, ...raw.stats },
    verification: { ...DEFAULT_VERIFICATION, ...raw.verification }
  } as BulgarianUser;
};

// Extended profile type for form data
type ExtendedProfileData = BulgarianUser & {
  accountType?: string;
  middleName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  businessName?: string;
  bulstat?: string;
  vatNumber?: string;
  businessType?: string;
  registrationNumber?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPostalCode?: string;
  website?: string;
  businessPhone?: string;
  businessEmail?: string;
  workingHours?: string;
  businessDescription?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  firstName?: string;
  lastName?: string;
};

const buildFormData = (profile: BulgarianUser | null): ProfileFormData => {
  const extended = profile as ExtendedProfileData | null;
  return {
    accountType: (extended?.accountType as any) || 'individual',
    firstName: extended?.firstName || '',
    lastName: extended?.lastName || '',
    middleName: extended?.middleName || '',
    dateOfBirth: extended?.dateOfBirth || '',
    placeOfBirth: extended?.placeOfBirth || '',
    businessName: extended?.businessName || '',
    bulstat: extended?.bulstat || '',
    vatNumber: extended?.vatNumber || '',
    businessType: (extended?.businessType as any) || 'dealership',
    registrationNumber: extended?.registrationNumber || '',
    businessAddress: extended?.businessAddress || '',
    businessCity: extended?.businessCity || '',
    businessPostalCode: extended?.businessPostalCode || '',
    website: extended?.website || '',
    businessPhone: extended?.businessPhone || '',
    businessEmail: extended?.businessEmail || '',
    workingHours: extended?.workingHours || '',
    businessDescription: extended?.businessDescription || '',
    phoneNumber: profile?.phoneNumber || '',
    email: profile?.email || '',
    address: extended?.address || '',
    city: profile?.location?.city || extended?.city || '',
    postalCode: extended?.postalCode || '',
    bio: profile?.bio || '',
    preferredLanguage: profile?.preferredLanguage || 'bg'
  };
};

const mapListingsToCars = (listings: unknown[]): ProfileCar[] =>
  listings.map((car: any) => ({
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
    inquiries: 0,
    sellerNumericId: car.sellerNumericId,
    carNumericId: car.carNumericId
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

      // ⚡ FIX: Check if viewing own profile
      // Case 1: No targetUserId = viewing own profile
      // Case 2: targetUserId is the current user's Firebase UID
      // Case 3: targetUserId is the current user's numeric ID
      let viewingOwn = !effectiveTargetId || effectiveTargetId === authUser?.uid;

      // If not matching UID, check if it's the user's numeric ID
      if (!viewingOwn && authUser && effectiveTargetId && /^\d+$/.test(effectiveTargetId)) {
        // effectiveTargetId looks like a numeric ID, get current user's numeric ID to compare
        try {
          const currentUserNumericId = authUser.uid; // We'll check this below
          // Load current user first to get their numeric ID
          const currentUserDoc = await bulgarianAuthService.getCurrentUserProfile();
          if (currentUserDoc?.numericId === parseInt(effectiveTargetId, 10)) {
            viewingOwn = true;
          }
        } catch (e) {
          // If we can't get numeric ID, assume they're different users
          logger.debug('Could not compare numeric IDs', { error: e });
        }
      }

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

      // Handle numeric ID - convert to Firebase UID first
      let targetPromise;
      if (viewingOwn) {
        targetPromise = viewerPromise;
      } else if (/^\d+$/.test(effectiveTargetId!)) {
        // It's a numeric ID - convert to Firebase UID first
        logger.debug('Numeric ID detected, converting to Firebase UID', { numericId: effectiveTargetId });
        const firebaseUid = await getFirebaseUidByNumericId(parseInt(effectiveTargetId!, 10));
        logger.debug('Firebase UID conversion result', { numericId: effectiveTargetId, firebaseUid });
        if (firebaseUid) {
          logger.debug('Fetching profile with Firebase UID', { firebaseUid });
          targetPromise = bulgarianAuthService.getUserProfileById(firebaseUid);
        } else {
          logger.warn('Could not convert numeric ID to Firebase UID - user may not exist', { numericId: effectiveTargetId });
          targetPromise = Promise.resolve(null);
        }
      } else {
        // It's a Firebase UID
        logger.debug('Firebase UID detected, fetching profile', { firebaseUid: effectiveTargetId });
        targetPromise = bulgarianAuthService.getUserProfileById(effectiveTargetId!);
      }

      const [viewerRaw, targetRaw] = await Promise.all([viewerPromise, targetPromise]);
      let normalizedViewer = normalizeUser(viewerRaw);
      let normalizedTarget = normalizeUser(targetRaw ?? viewerRaw ?? null);

      // ⚡ AUTO-ASSIGN: Ensure viewer (logged-in user) has a numeric ID
      if (normalizedViewer && !normalizedViewer.numericId) {
        logger.info('Viewer missing numeric ID, assigning...', { uid: normalizedViewer.uid });
        const numericId = await ensureUserNumericId(normalizedViewer.uid);
        if (numericId) {
          normalizedViewer = { ...normalizedViewer, numericId };
          // If viewing own profile, update target as well
          if (viewingOwn && normalizedTarget) {
            normalizedTarget = { ...normalizedTarget, numericId };
          }
        }
      }

      // ⚡ AUTO-ASSIGN: Ensure target user has a numeric ID (if viewing someone else)
      if (normalizedTarget && !viewingOwn && !normalizedTarget.numericId) {
        logger.info('Target user missing numeric ID, assigning...', { uid: normalizedTarget.uid });
        const numericId = await ensureUserNumericId(normalizedTarget.uid);
        if (numericId) {
          normalizedTarget = { ...normalizedTarget, numericId };
        }
      }

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

    let unsubscribe: (() => void) | null = null;
    let isActive = true; // Prevent state updates after cleanup

    try {
      unsubscribe = onSnapshot(
        doc(db, 'users', userId),
        snapshot => {
          if (!isActive) return; // Ignore updates after cleanup
          
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
        err => {
          logger.error('Real-time listener error', err as Error, { userId });
        }
      );
    } catch (error) {
      logger.error('Error setting up profile listener', error as Error, { userId });
    }

    return () => {
      isActive = false; // Flag first
      if (unsubscribe) {
        try {
          unsubscribe(); // Then cleanup
        } catch (cleanupError) {
          logger.warn('Error cleaning up profile listener', {
            error: (cleanupError as Error).message,
            userId
          });
        }
      }
    };
  }, [target?.uid, isOwnProfile]);

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

      const updateData: Record<string, unknown> = {
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Error updating profile', error);
      toast.error(
        (error as Error).message || 'Failed to update profile / Грешка при обновяване на профила',
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