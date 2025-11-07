import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { bulgarianAuthService } from '@/firebase/index';
// ✅ NEW: Import from canonical types
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
// Removed unused car-service imports
import { useToast } from '@/components/Toast';
import { useProfileType } from '@/contexts/ProfileTypeContext';  // NEW: Profile Type System
import { validateProfileData } from '@/utils/validation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase-config';
import carListingService from '@/services/carListingService';
import { logger } from '@/services/logger-service';
import {
  ProfileFormData,
  ProfileCar,
  UseProfileReturn
} from '../types';

export const useProfile = (targetUserId?: string): UseProfileReturn => {
  const { t } = useTranslation();
  const toast = useToast();
  const { profileType, theme, permissions, planTier } = useProfileType();  // NEW: Get profile type context

  // State management
  const [user, setUser] = useState<BulgarianUser | null>(null);
  const [userCars, setUserCars] = useState<ProfileCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true); // NEW: track if viewing own profile
  const [formData, setFormData] = useState<ProfileFormData>({
    accountType: 'individual',
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    businessName: '',
    bulstat: '',
    vatNumber: '',
    businessType: 'dealership',
    registrationNumber: '',
    businessAddress: '',
    businessCity: '',
    businessPostalCode: '',
    website: '',
    businessPhone: '',
    businessEmail: '',
    workingHours: '',
    businessDescription: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    bio: '',
    preferredLanguage: 'bg'
  });

  // Load user data function (defined before effects to satisfy hook dependency ordering)
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Determine if viewing own profile or another user's profile
      const currentUserAuth = auth.currentUser;
      const viewingOwnProfile = !targetUserId || targetUserId === currentUserAuth?.uid;
      setIsOwnProfile(viewingOwnProfile);

      // Get user profile (either current user or target user)
      let currentUser: BulgarianUser | null;
      if (targetUserId && !viewingOwnProfile) {
        // Viewing another user's profile
        currentUser = await bulgarianAuthService.getUserProfileById(targetUserId);
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Loading target user profile', { targetUserId });
        }
      } else {
        // Viewing own profile
        currentUser = await bulgarianAuthService.getCurrentUserProfile();
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Loading own profile');
        }
      }

      if (currentUser) {
        setUser(currentUser);
        setFormData({
          accountType: (currentUser as any).accountType || 'individual',
          firstName: (currentUser as any).firstName || '',
          lastName: (currentUser as any).lastName || '',
          middleName: (currentUser as any).middleName || '',
          dateOfBirth: (currentUser as any).dateOfBirth || '',
          placeOfBirth: (currentUser as any).placeOfBirth || '',
          businessName: (currentUser as any).businessName || '',
          bulstat: (currentUser as any).bulstat || '',
          vatNumber: (currentUser as any).vatNumber || '',
          businessType: (currentUser as any).businessType || 'dealership',
          registrationNumber: (currentUser as any).registrationNumber || '',
          businessAddress: (currentUser as any).businessAddress || '',
          businessCity: (currentUser as any).businessCity || '',
          businessPostalCode: (currentUser as any).businessPostalCode || '',
          website: (currentUser as any).website || '',
          businessPhone: (currentUser as any).businessPhone || '',
          businessEmail: (currentUser as any).businessEmail || '',
          workingHours: (currentUser as any).workingHours || '',
          businessDescription: (currentUser as any).businessDescription || '',
          phoneNumber: currentUser.phoneNumber || '',
          email: currentUser.email || '',
          address: (currentUser as any).address || '',
          city: (currentUser as any).city || '',
          postalCode: (currentUser as any).postalCode || '',
          bio: (currentUser as any).bio || '',
          preferredLanguage: currentUser.preferredLanguage || 'bg'
        });

        // Load user's cars (prefer sellerId/uid; fallback to email for legacy data)
        let userListings = await carListingService.getListingsBySellerId(currentUser.uid);
        if (!userListings || userListings.length === 0) {
          userListings = await carListingService.getListingsBySeller(currentUser.email || '');
        }
        
        const carsForProfile = userListings.map(car => ({
          id: car.id || '',
          title: `${car.make} ${car.model}`,
          make: car.make || '',
          model: car.model || '',
          year: car.year || 0,
          price: car.price || 0,
          imageUrl: (car.images && car.images.length > 0) ? 
            (typeof car.images[0] === 'string' ? car.images[0] : '') : '',
          mainImage: (car.images && car.images.length > 0) ? 
            (typeof car.images[0] === 'string' ? car.images[0] : '') : '',
          mileage: car.mileage,
          fuelType: car.fuelType,
          status: (car.status as 'active' | 'sold' | 'pending' | 'draft') || 'active',
          viewCount: car.views || 0,
          views: car.views || 0,
          inquiries: 0,
        }));
        
        setUserCars(carsForProfile);

      } else {
        toast.error(t('profile.load_user_error'));
      }
    } catch (error) {
      logger.error('Error loading user data', error as Error);
      toast.error(t('profile.load_user_error_generic'));
    } finally {
      setLoading(false);
    }
  }, [t, toast, targetUserId]);

  // Load user data on mount or when targetUserId changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData, targetUserId]); // Re-load when targetUserId or loader changes

  // Real-time updates listener
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setUser(prev => ({
            ...prev,
            ...userData,
            uid: user.uid,
            email: user.email,
            displayName: userData.displayName || prev?.displayName
          } as BulgarianUser));
          
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Real-time update received');
          }
        }
      },
      (error) => {
        logger.error('Real-time listener error', error as Error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.email]);
  

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      if (!user) return;

      // Validate profile data
      const validation = validateProfileData(formData, formData.accountType);
      if (!validation.valid) {
        const errorMessages = Object.values(validation.errors).join('\n');
        toast.error(errorMessages, 'Validation Error / Грешка при валидация');
        return;
      }

      // Prepare update data with all fields
        const updateData: any = {
        uid: user.uid,
        displayName: formData.accountType === 'business' 
          ? formData.businessName 
          : `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phoneNumber || '',
        bio: formData.bio || '',
          // Write new unified locationData while preserving legacy fields for backward compatibility
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
          // Legacy fields (to be removed after migration)
          location: {
            city: formData.city || '',
            region: '',
            postalCode: formData.postalCode || ''
          },
        preferredLanguage: formData.preferredLanguage as 'bg' | 'en',
        
        // Account type
        accountType: formData.accountType,
        
        // Individual fields
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        middleName: formData.middleName || '',
        dateOfBirth: formData.dateOfBirth || '',
        placeOfBirth: formData.placeOfBirth || '',
        address: formData.address || '',
        
        // Business fields (saved regardless, but only used if business)
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
      await loadUserData(); // Reload data
    } catch (error: any) {
      logger.error('Error updating profile', error as Error);
      toast.error(
        error.message || 'Failed to update profile / Грешка при обновяване на профила',
        'Error / Грешка'
      );
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        accountType: (user as any).accountType || 'individual',
        firstName: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        middleName: (user as any).middleName || '',
        dateOfBirth: (user as any).dateOfBirth || '',
        placeOfBirth: (user as any).placeOfBirth || '',
        businessName: (user as any).businessName || '',
        bulstat: (user as any).bulstat || '',
        vatNumber: (user as any).vatNumber || '',
        businessType: (user as any).businessType || 'dealership',
        registrationNumber: (user as any).registrationNumber || '',
        businessAddress: (user as any).businessAddress || '',
        businessCity: (user as any).businessCity || '',
        businessPostalCode: (user as any).businessPostalCode || '',
        website: (user as any).website || '',
        businessPhone: (user as any).businessPhone || '',
        businessEmail: (user as any).businessEmail || '',
        workingHours: (user as any).workingHours || '',
        businessDescription: (user as any).businessDescription || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        address: (user as any).address || '',
        city: user.location?.city || '',
        postalCode: (user as any).postalCode || '',
        bio: user.bio || '',
        preferredLanguage: user.preferredLanguage || 'bg'
      });
    }
    setEditing(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await bulgarianAuthService.signOut();
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      logger.error('Error signing out', error as Error);
    }
  };

  return {
    // State
    user,
    userCars,
    loading,
    editing,
    formData,
    isOwnProfile, // NEW: expose isOwnProfile state

    // NEW: Profile Type System
    profileType,
    theme,
    permissions,
    planTier,

    // Actions
    loadUserData,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
    setEditing,
    setUser,
    loadUserCars: loadUserData // Expose reload function for external use
  };
};