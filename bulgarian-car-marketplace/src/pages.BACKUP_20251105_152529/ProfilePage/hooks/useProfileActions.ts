// ProfilePage/hooks/useProfileActions.ts
// Hook for profile actions (edit, save, logout, etc.)
// Phase 0 Day 2: Extracted from useProfile.ts

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebase-config';
import { bulgarianAuthService } from '../../../firebase';
import { logger } from '../../../services/logger-service';
import { useToast } from '../../../components/Toast';
import type { BulgarianUser } from '../../../types/user/bulgarian-user.types';
import type { ProfileFormData } from '../types';

export interface UseProfileActionsReturn {
  editing: boolean;
  formData: ProfileFormData;
  setEditing: (editing: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelEdit: () => void;
  handleLogout: () => Promise<void>;
}

export const useProfileActions = (
  user: BulgarianUser | null,
  loadUserData: () => Promise<void>
): UseProfileActionsReturn => {
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
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

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    try {
      if (!user || !auth.currentUser) {
        toast.error('لم يتم تسجيل الدخول');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });

      toast.success('تم حفظ التغييرات بنجاح');
      setEditing(false);
      await loadUserData();
      
    } catch (error) {
      logger.error('Error saving profile', error as Error);
      toast.error('فشل حفظ التغييرات');
    }
  }, [user, formData, loadUserData, toast]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    // Reset form data to user data
    if (user) {
      setFormData({
        accountType: 'individual',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
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
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        address: '',
        city: '',
        postalCode: '',
        bio: '',
        preferredLanguage: 'bg'
      });
    }
  }, [user]);

  const handleLogout = useCallback(async () => {
    try {
      await bulgarianAuthService.signOut();
      navigate('/');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      logger.error('Error during logout', error as Error);
      toast.error('فشل تسجيل الخروج');
    }
  }, [navigate, toast]);

  return {
    editing,
    formData,
    setEditing,
    setFormData,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout
  };
};

export default useProfileActions;

