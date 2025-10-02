// Sell Workflow State Management Hook
// Hook لإدارة حالة workflow بيع السيارة عبر جميع الخطوات

import { useState, useEffect, useCallback } from 'react';

export interface SellWorkflowData {
  // Vehicle Type & Seller
  vehicleType?: string;
  sellerType?: string;
  
  // Basic Info
  make?: string;
  model?: string;
  year?: string;
  mileage?: string;
  condition?: string;
  
  // Technical
  fuelType?: string;
  transmission?: string;
  power?: string;
  engineSize?: string;
  driveType?: string;
  
  // Equipment
  safety?: string;
  comfort?: string;
  infotainment?: string;
  extras?: string;
  
  // Images
  images?: string;
  mainImage?: string;
  
  // Pricing
  price?: string;
  currency?: string;
  priceType?: string;
  negotiable?: string;
  financing?: string;
  tradeIn?: string;
  warranty?: string;
  warrantyMonths?: string;
  paymentMethods?: string;
  
  // Contact
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  preferredContact?: string;
  
  // Location
  location?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  
  // Additional
  additionalPhone?: string;
  availableHours?: string;
  additionalInfo?: string;
  description?: string;
}

const STORAGE_KEY = 'globul_cars_sell_workflow';

export const useSellWorkflow = () => {
  const [workflowData, setWorkflowData] = useState<SellWorkflowData>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWorkflowData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading workflow data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (Object.keys(workflowData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflowData));
    }
  }, [workflowData]);

  const updateWorkflowData = useCallback((updates: Partial<SellWorkflowData>) => {
    setWorkflowData(prev => ({ ...prev, ...updates }));
  }, []);

  const clearWorkflowData = useCallback(() => {
    setWorkflowData({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getWorkflowData = useCallback(() => {
    return workflowData;
  }, [workflowData]);

  const isStepComplete = useCallback((step: string): boolean => {
    switch (step) {
      case 'vehicleType':
        return !!workflowData.vehicleType;
      case 'sellerType':
        return !!workflowData.sellerType;
      case 'vehicleData':
        return !!(workflowData.make && workflowData.model && workflowData.year);
      case 'equipment':
        return true; // Optional
      case 'images':
        return !!workflowData.images;
      case 'pricing':
        return !!workflowData.price;
      case 'contact':
        return !!(workflowData.sellerName && workflowData.city);
      default:
        return false;
    }
  }, [workflowData]);

  const getCompletionPercentage = useCallback((): number => {
    const steps = [
      'vehicleType',
      'sellerType',
      'vehicleData',
      'equipment',
      'images',
      'pricing',
      'contact'
    ];
    
    const completed = steps.filter(step => isStepComplete(step)).length;
    return Math.round((completed / steps.length) * 100);
  }, [isStepComplete]);

  return {
    workflowData,
    updateWorkflowData,
    clearWorkflowData,
    getWorkflowData,
    isStepComplete,
    getCompletionPercentage
  };
};

export default useSellWorkflow;


