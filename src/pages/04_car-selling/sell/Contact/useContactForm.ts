import { useCallback, useEffect, useMemo, useState } from 'react';
import { BULGARIA_REGIONS, getCitiesByRegion } from '../../../../data/bulgaria-locations';
import { getPostalCodesForCity, getStreetsForPostalCode, PostalCodeData } from '../../../../data/bulgaria-postal-codes';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
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
  const [availablePostalCodes, setAvailablePostalCodes] = useState<PostalCodeData[]>([]);
  const [availableStreets, setAvailableStreets] = useState<string[]>([]);

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

  // Update cities when region changes
  useEffect(() => {
    if (!contactData.region) {
      setAvailableCities([]);
      setAvailablePostalCodes([]);
      setAvailableStreets([]);
      // Clear city, postal code, and location when region is cleared
      setContactData(prev => ({ ...prev, city: '', postalCode: '', location: '' }));
      return;
    }
    const cities = getCitiesByRegion(contactData.region, language);
    setAvailableCities(cities);
    // Clear city if it's not in the new region's cities
    if (cities.length > 0 && !cities.some(city => city.name === contactData.locationData?.cityName)) {
      setContactData(prev => ({ ...prev, city: '', postalCode: '', location: '' }));
      setAvailablePostalCodes([]);
      setAvailableStreets([]);
    }
  }, [contactData.region, contactData.locationData?.cityName, language]);

  // Update postal codes when city changes
  useEffect(() => {
    if (!contactData.locationData?.cityName || !contactData.region) {
      setAvailablePostalCodes([]);
      setAvailableStreets([]);
      // Clear postal code and location when city is cleared
      setContactData(prev => ({ ...prev, postalCode: '', location: '' }));
      return;
    }
    const postalCodes = getPostalCodesForCity(contactData.locationData?.cityName, contactData.region);
    setAvailablePostalCodes(postalCodes);
    // Clear postal code if it's not in the new city's postal codes
    if (postalCodes.length > 0 && !postalCodes.some(pc => pc.code === contactData.postalCode)) {
      setContactData(prev => ({ ...prev, postalCode: '', location: '' }));
      setAvailableStreets([]);
    }
  }, [contactData.locationData?.cityName, contactData.region, contactData.postalCode]);

  // Update streets when postal code changes
  useEffect(() => {
    if (!contactData.postalCode || !contactData.locationData?.cityName) {
      setAvailableStreets([]);
      // Clear location when postal code is cleared
      setContactData(prev => ({ ...prev, location: '' }));
      return;
    }
    const streets = getStreetsForPostalCode(contactData.postalCode, contactData.locationData?.cityName);
    setAvailableStreets(streets);
    // Clear location if it's not in the new postal code's streets
    if (streets.length > 0 && !streets.includes(contactData.location)) {
      setContactData(prev => ({ ...prev, location: '' }));
    }
  }, [contactData.postalCode, contactData.locationData?.cityName, contactData.location]);

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
      contactData.locationData?.cityName.trim().length > 0
    );
  }, [contactData, requireContactFields]);

  return {
    contactData,
    availableRegions,
    availableCities,
    availablePostalCodes,
    availableStreets,
    canContinue,
    handleFieldChange,
    toggleContactMethod,
    clearContactData
  };
};

export default useContactForm;

