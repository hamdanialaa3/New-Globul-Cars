import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { brandsModelsDataService } from '@/services/brands-models-data.service';
import {
  getVariantsForModel,
  modelHasVariants
} from '@/services/carBrandsService';
import { resolveCanonicalBrand } from '@/services/brand-normalization';
import structuredBrandsData from '@/data/car-brands-structured.json';
import { VehicleFormData } from './types';
import useSellWorkflow from '@/hooks/useSellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';

const defaultForm: VehicleFormData = {
  make: '',
  makeRaw: '',
  year: '',
  model: '',
  variant: '',
  fuelType: '',
  mileage: '',
  firstRegistration: '',
  power: '',
  transmission: '',
  doors: '',
  seats: '',
  color: '',
  previousOwners: '',
  
  // Purchase Information
  purchaseMonth: '',
  purchaseYear: '',
  purchaseMileage: '',
  annualMileage: '',
  isSoleUser: null,
  
  // Exterior Details
  exteriorColor: '',
  trimLevel: '',
  
  // Location fields (Bulgaria-specific)
  saleProvince: '',
  saleCity: '',
  salePostalCode: '',
  
  // Deprecated (kept for backward compatibility)
  saleCountry: '',
  saleLocation: '',
  
  saleType: 'private',
  saleTimeline: 'unknown',
  roadworthy: null,
  hasAccidentHistory: false,
  hasServiceHistory: false
  ,
  // typed 'other' values
  makeOther: '',
  modelOther: '',
   // firstRegistrationYearOther and firstRegistrationMonthOther removed - no 'Other' for registration
  fuelTypeOther: '',
  colorOther: '',
  exteriorColorOther: '',
  trimLevelOther: ''
};

/**
 * Helper: returns the registration year string for a VehicleFormData value.
 * Prefers `year` if present (legacy/mobile select), otherwise extracts the year part from `firstRegistration`.
 */
export const getRegistrationYear = (data: Partial<VehicleFormData> | VehicleFormData | undefined): string => {
  if (!data) return '';
  const rawYear = (data as any).year || (data as any).firstRegistration || '';
  if (!rawYear) return '';
  return String(rawYear).split('-')[0];
};

export const useVehicleDataForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workflowData, updateWorkflowData, clearWorkflowData } = useSellWorkflow();

const initialValues = useMemo<VehicleFormData>(() => {
    const fromParams: Partial<VehicleFormData> = {
      make: searchParams.get('mk') || undefined,
      model: searchParams.get('md') || undefined,
      year: searchParams.get('fy') || undefined,
      fuelType: searchParams.get('fm') || undefined,
      mileage: searchParams.get('mi') || undefined,
      transmission: searchParams.get('tr') || undefined
    };

    return {
      ...defaultForm,
      ...workflowData,
      ...fromParams
    };
  }, [workflowData, searchParams]);

const [formData, setFormData] = useState<VehicleFormData>(initialValues);
  const [availableVariants, setAvailableVariants] = useState<string[]>([]);
  const [showVariants, setShowVariants] = useState(false);

const formEquals = useCallback(
  (a: VehicleFormData, b: VehicleFormData) => {
    const keys = Object.keys(defaultForm) as (keyof VehicleFormData)[];
    return keys.every(key => a[key] === b[key]);
  },
  []
);

useEffect(() => {
  setFormData(prev => (formEquals(prev, initialValues) ? prev : initialValues));
}, [initialValues, formEquals]);

  // ✅ FIX: Debounce workflow updates to prevent infinite loop
  useEffect(() => {
    const timer = setTimeout(() => {
      updateWorkflowData(formData, 'vehicle-data');
    }, 500); // Save after 500ms of no changes
    
    return () => clearTimeout(timer);
  }, [formData]); // Removed updateWorkflowData dependency to break loop

  // Load brands asynchronously
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  
  useEffect(() => {
    brandsModelsDataService.getAllBrands()
      .then(brands => setAvailableBrands(brands))
      .catch(error => {
        console.error('[useVehicleDataForm] Failed to load brands:', error);
        setAvailableBrands([]);
      });
  }, []);

  // Load models asynchronously
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  useEffect(() => {
    if (!formData.make) {
      setAvailableModels([]);
      return;
    }

    // (we don't export helper here) function lives at module scope

    const canonical = resolveCanonicalBrand(formData.make);
    
    brandsModelsDataService.getModelsForBrand(canonical)
      .then(models => {
        // Extra fallback: direct structured lookup if empty
        if (models.length === 0) {
          const candidate = (structuredBrandsData as any)[canonical];
          if (candidate?.models) {
            const flattened: string[] = [];
            Object.values(candidate.models).forEach((arr: any) => flattened.push(...arr));
            setAvailableModels(Array.from(new Set(flattened)));
            return;
          }
        }
        console.log('[useVehicleDataForm] brand selected:', formData.make, 'canonical:', canonical, 'models count:', models.length, 'first 8:', models.slice(0, 8));
        setAvailableModels(models);
      })
      .catch(error => {
        console.error('[useVehicleDataForm] Failed to load models:', error);
        setAvailableModels([]);
      });
  }, [formData.make]);

  useEffect(() => {
    if (formData.make && formData.model) {
      const hasVariants = modelHasVariants(formData.make, formData.model);
      setShowVariants(hasVariants);
      if (hasVariants) {
        setAvailableVariants(getVariantsForModel(formData.make, formData.model));
      } else {
        setAvailableVariants([]);
        setFormData(prev => (prev.variant === '' ? prev : { ...prev, variant: '' }));
      }
    } else {
      setShowVariants(false);
      setAvailableVariants([]);
      setFormData(prev => (prev.variant === '' ? prev : { ...prev, variant: '' }));
    }
  }, [formData.make, formData.model]);

  const handleInputChange = useCallback(
    (field: keyof VehicleFormData, value: string | boolean) => {
      setFormData(prev => {
        const next = { ...prev, [field]: value };
        if (field === 'make') {
          // Preserve raw user input then store canonical form for consistency
          next.makeRaw = String(value);
          const canonical = resolveCanonicalBrand(String(value));
          next.make = canonical;
          next.model = '';
          next.variant = '';
        }
        if (field === 'model') {
          next.variant = '';
        }
        return next;
      });
    },
    []
  );

  const canContinue = useMemo(() => {
    // ✅ FIX: Only require brand, model and a registration year.
    // Support either `year` (legacy/mobile select) or `firstRegistration` (ISO-like "YYYY" or "YYYY-MM").
    const registrationYear = getRegistrationYear(formData);
    const hasBasicInfo = !!formData.make && !!formData.model && !!registrationYear;

    return hasBasicInfo; // Users can continue with minimal info (Brand + Model + Year)
  }, [
    formData.make,
    formData.model,
    formData.firstRegistration,
    formData.year
  ]);

  const buildURLSearchParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (formData.make) params.set('mk', formData.make === '__other__' ? (formData.makeOther || '') : formData.make);
    if (formData.model) params.set('md', formData.model === '__other__' ? (formData.modelOther || '') : formData.model);
    if (formData.fuelType) params.set('fm', formData.fuelType === '__other__' ? (formData.fuelTypeOther || '') : formData.fuelType);
    if (formData.mileage) params.set('mi', formData.mileage);
    if (formData.transmission) params.set('tr', formData.transmission);
    // Map typed 'Other' year/month to secure value
    // Prefer `year` if present (mobile/legacy), otherwise extract from `firstRegistration`.
    const fy = getRegistrationYear(formData);
    if (fy) params.set('fy', fy);
    if (formData.color) params.set('color', formData.color === 'other' ? (formData.colorOther || '') : formData.color);
    return params;
  }, [searchParams, formData]);

  const resetForm = useCallback(() => {
    // Clear workflow data
    clearWorkflowData();
    
    // Reset step state
    SellWorkflowStepStateService.reset();
    
    // Reset form data to default
    setFormData(defaultForm);
    
    // Clear URL params
    setSearchParams({});
    
    // Clear localStorage/sessionStorage
    localStorage.removeItem('sell-workflow-state');
    sessionStorage.removeItem('sell-workflow-state');
    
    // Reload page to ensure clean state
    window.location.reload();
  }, [clearWorkflowData, setSearchParams]);

  return {
    formData,
    availableBrands,
    availableModels,
    availableVariants,
    showVariants,
    handleInputChange,
    canContinue,
    buildURLSearchParams,
    resetForm
  };
};

export default useVehicleDataForm;

