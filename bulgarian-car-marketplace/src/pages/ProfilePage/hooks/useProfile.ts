import { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { bulgarianAuthService, BulgarianUser } from '../../../firebase';
import {
  ProfileFormData,
  ProfileCar,
  UseProfileReturn
} from '../types';

export const useProfile = (): UseProfileReturn => {
  const { t } = useTranslation();

  // State management
  const [user, setUser] = useState<BulgarianUser | null>(null);
  const [userCars] = useState<ProfileCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'BG',
    height: '',
    eyeColor: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    bio: '',
    preferredLanguage: 'bg'
  });

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data function
  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get current user
      const currentUser = await bulgarianAuthService.getCurrentUserProfile();
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          firstName: (currentUser as any).firstName || '',
          lastName: (currentUser as any).lastName || '',
          middleName: (currentUser as any).middleName || '',
          dateOfBirth: (currentUser as any).dateOfBirth || '',
          placeOfBirth: (currentUser as any).placeOfBirth || '',
          nationality: (currentUser as any).nationality || 'BG',
          height: (currentUser as any).height || '',
          eyeColor: (currentUser as any).eyeColor || '',
          phoneNumber: currentUser.phoneNumber || '',
          email: currentUser.email || '',
          address: (currentUser as any).address || '',
          city: currentUser.location?.city || '',
          postalCode: (currentUser as any).postalCode || '',
          bio: currentUser.bio || '',
          preferredLanguage: currentUser.preferredLanguage || 'bg'
        });

        // Load user's cars (placeholder for future implementation)
        // const cars = await bulgarianCarService.getUserCars(currentUser.id);
        // setUserCars(cars);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

      //  Validate required fields
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        alert('First Name and Last Name are required! / Име и Фамилия са задължителни!');
        return;
      }

      await bulgarianAuthService.updateUserProfile({
        uid: user.uid,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phoneNumber || '',
        bio: formData.bio || '',
        location: {
          city: formData.city || '',
          region: '',
          postalCode: formData.postalCode || ''
        },
        preferredLanguage: formData.preferredLanguage as 'bg' | 'en'
      });

      setEditing(false);
      await loadUserData(); // Reload data
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('profile.updateError'));
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        firstName: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        middleName: (user as any).middleName || '',
        dateOfBirth: (user as any).dateOfBirth || '',
        placeOfBirth: (user as any).placeOfBirth || '',
        nationality: (user as any).nationality || 'BG',
        height: (user as any).height || '',
        eyeColor: (user as any).eyeColor || '',
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
      console.error('Error signing out:', error);
    }
  };

  return {
    // State
    user,
    userCars,
    loading,
    editing,
    formData,

    // Actions
    loadUserData,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
    setEditing,
  };
};