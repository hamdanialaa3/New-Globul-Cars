/**
 * useDealershipForm Hook
 * Phase 3: UI Components Integration
 * 
 * Custom hook for dealership form state management.
 * Handles validation, submission, and error handling.
 * 
 * File: src/hooks/useDealershipForm.ts
 */

import { useState } from 'react';
import { DealershipRepository } from '../repositories/DealershipRepository';
import { useToast } from '../components/Toast';
import { logger } from '../services/logger-service';
import type { DealershipInfo, DealershipInfoUpdate } from '../types/dealership/dealership.types';
import { isValidEIK, validateWorkingHours } from '../types/dealership/dealership.types';

export interface UseDealershipFormReturn {
  formData: Partial<DealershipInfo>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<DealershipInfo>>>;
  errors: Record<string, string>;
  loading: boolean;
  handleSubmit: () => Promise<boolean>;
  handleFieldChange: (field: string, value: any) => void;
  validateForm: () => boolean;
}

export const useDealershipForm = (
  uid: string,
  initialData?: DealershipInfo
): UseDealershipFormReturn => {
  const toast = useToast();
  const [formData, setFormData] = useState<Partial<DealershipInfo>>(
    initialData || getDefaultFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      const updated = { ...prev } as any;
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.dealershipNameBG) {
      newErrors.dealershipNameBG = 'اسم المعرض مطلوب';
    }

    if (!formData.eik) {
      newErrors.eik = 'رقم EIK مطلوب';
    } else if (!isValidEIK(formData.eik)) {
      newErrors.eik = 'رقم EIK غير صالح (يجب أن يكون 9 أو 13 رقم)';
    }

    if (!formData.contact?.phone) {
      newErrors['contact.phone'] = 'رقم الهاتف مطلوب';
    }

    if (!formData.contact?.email) {
      newErrors['contact.email'] = 'البريد الإلكتروني مطلوب';
    }

    if (!formData.address?.street) {
      newErrors['address.street'] = 'الشارع مطلوب';
    }

    if (!formData.address?.city) {
      newErrors['address.city'] = 'المدينة مطلوبة';
    }

    // Validate working hours
    if (formData.workingHours && !validateWorkingHours(formData.workingHours)) {
      newErrors.workingHours = 'ساعات العمل غير صالحة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return false;
    }

    setLoading(true);
    try {
      await DealershipRepository.updateWithUserSync(uid, formData as DealershipInfoUpdate);
      toast.success('تم حفظ معلومات المعرض بنجاح');
      return true;
    } catch (error) {
      logger.error('Error submitting dealership form', error as Error, { uid });
      toast.error('فشل حفظ المعلومات');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    loading,
    handleSubmit,
    handleFieldChange,
    validateForm
  };
};

function getDefaultFormData(): Partial<DealershipInfo> {
  return {
    dealershipNameBG: '',
    dealershipNameEN: '',
    eik: '',
    vatNumber: '',
    address: {
      street: '',
      city: 'София',
      region: 'София',
      postalCode: '',
      country: 'Bulgaria'
    },
    contact: {
      phone: '',
      phoneCountryCode: '+359',
      email: ''
    },
    workingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
      sunday: { isOpen: false }
    },
    services: {
      newCarSales: true,
      usedCarSales: true,
      carImport: false,
      tradeIn: false,
      financing: false,
      leasing: false,
      insurance: false,
      maintenance: false,
      repairs: false,
      warranty: false,
      carWash: false,
      detailing: false,
      homeDelivery: false,
      testDrive: true,
      onlineReservation: false,
      specializations: [],
      brands: []
    },
    certifications: {},
    media: {},
    settings: {
      displayLanguages: ['bg'],
      currency: 'EUR',
      privacySettings: {
        showPhoneNumber: true,
        showEmail: true,
        showAddress: true,
        showWorkingHours: true,
        allowDirectMessages: true,
        allowCalls: true
      },
      notifications: {
        newInquiries: true,
        newReviews: true,
        weeklyReport: true,
        monthlyReport: true
      },
      businessRules: {
        autoReplyEnabled: false
      }
    }
  };
}

export default useDealershipForm;

