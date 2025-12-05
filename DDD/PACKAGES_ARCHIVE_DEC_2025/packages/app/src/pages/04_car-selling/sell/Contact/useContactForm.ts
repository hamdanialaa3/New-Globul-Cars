import { useCallback, useEffect, useMemo, useState } from 'react';
import { BULGARIA_REGIONS, getCitiesByRegion } from '@globul-cars/core/constants/bulgaria-locations';
import useSellWorkflow from '@globul-cars/core/useSellWorkflow';
import { CONTACT_METHODS } from './contactConstants';

export interface ContactFormState {
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  additionalPhone: string;
  preferredContact: string[];
  region: string;
  city: string;
  postalCode: string;
  location: string;
  availableHours: string;
  notes: string;
}

interface UseContactFormOptions {
  language: 'bg' | 'en';
  requireContactFields?: boolean;
}

const defaultState: ContactFormState = {
  sellerName: '',
  sellerEmail: '',
  sellerPhone: '',
  additionalPhone: '',
  preferredContact: [],
  region: '',
  city: '',
  postalCode: '',
  location: '',
  availableHours: '',
  notes: ''
};

export const useContactForm = ({ language, requireContactFields = false }: UseContactFormOptions) => {
  const { workflowData, updateWorkflowData } = useSellWorkflow();
  const [contactData, setContactData] = useState<ContactFormState>(() => {
    const preferred = Array.isArray(workflowData.preferredContact)
      ? workflowData.preferredContact
      : typeof workflowData.preferredContact === 'string' && workflowData.preferredContact.length > 0
        ? workflowData.preferredContact.split(',').map(value => value.trim()).filter(Boolean)
        : [];

    return {
      ...defaultState,
      ...workflowData,
      preferredContact: preferred
    };
  });

  const [availableCities, setAvailableCities] = useState<Array<{ name: string; nameEn?: string }>>([]);

  useEffect(() => {
    updateWorkflowData(
      {
        ...contactData,
        preferredContact: contactData.preferredContact
      },
      'contact'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactData]);

  useEffect(() => {
    if (!contactData.region) {
      setAvailableCities([]);
      return;
    }
    const cities = getCitiesByRegion(contactData.region, language);
    setAvailableCities(cities);
    if (cities.length > 0 && !cities.some(city => city.name === contactData.city)) {
      setContactData(prev => ({ ...prev, city: '' }));
    }
  }, [contactData.region, contactData.city, language]);

  const handleFieldChange = useCallback(<K extends keyof ContactFormState>(field: K, value: ContactFormState[K]) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleContactMethod = useCallback((methodId: string) => {
    if (!CONTACT_METHODS.some(method => method.id === methodId)) return;
    setContactData(prev => {
      const exists = prev.preferredContact.includes(methodId);
      const preferredContact = exists
        ? prev.preferredContact.filter(id => id !== methodId)
        : [...prev.preferredContact, methodId];
      return { ...prev, preferredContact };
    });
  }, []);

  const clearContactData = useCallback(() => {
    setContactData(defaultState);
  }, []);

  const availableRegions = useMemo(() => BULGARIA_REGIONS, []);

  const canContinue = useMemo(() => {
    if (!requireContactFields) {
      return true;
    }

    return (
      contactData.sellerName.trim().length > 0 &&
      contactData.sellerEmail.trim().length > 0 &&
      contactData.sellerPhone.trim().length > 0 &&
      contactData.region.trim().length > 0 &&
      contactData.city.trim().length > 0
    );
  }, [contactData, requireContactFields]);

  return {
    contactData,
    availableRegions,
    availableCities,
    canContinue,
    handleFieldChange,
    toggleContactMethod,
    clearContactData
  };
};

export default useContactForm;

