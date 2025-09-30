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
    displayName: '',
    phoneNumber: '',
    city: '',
    region: '',
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
          displayName: currentUser.displayName || '',
          phoneNumber: currentUser.phoneNumber || '',
          city: currentUser.location?.city || '',
          region: currentUser.location?.region || '',
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

      await bulgarianAuthService.updateUserProfile({
        uid: user.uid,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        location: {
          city: formData.city,
          region: formData.region,
          postalCode: ''
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
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        city: user.location?.city || '',
        region: user.location?.region || '',
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