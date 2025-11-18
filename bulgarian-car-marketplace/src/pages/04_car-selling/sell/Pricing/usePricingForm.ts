import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSellWorkflow from '@/hooks/useSellWorkflow';

export interface PricingFormState {
  price: string;
  currency: string;
  priceType: 'fixed' | 'negotiable' | 'installments';
  negotiable: boolean;
  vatDeductible: boolean;
}

const defaultPricingState: PricingFormState = {
  price: '',
  currency: 'EUR',
  priceType: 'fixed',
  negotiable: false,
  vatDeductible: false
};

export const usePricingForm = () => {
  const [searchParams] = useSearchParams();
  const { workflowData, updateWorkflowData } = useSellWorkflow();

  const initialState = useMemo<PricingFormState>(() => {
    return {
      ...defaultPricingState,
      price: searchParams.get('price') || workflowData.price || '',
      currency: searchParams.get('currency') || workflowData.currency || 'EUR',
      priceType: (searchParams.get('priceType') as PricingFormState['priceType']) ||
        (workflowData.priceType as PricingFormState['priceType']) ||
        'fixed',
      negotiable:
        searchParams.get('negotiable') === 'true' ||
        workflowData.negotiable === true ||
        workflowData.negotiable === 'true',
      vatDeductible: Boolean(workflowData.vatDeductible)
    };
  }, [workflowData, searchParams]);

  const [pricingData, setPricingData] = useState<PricingFormState>(initialState);

  useEffect(() => {
    setPricingData(initialState);
  }, [initialState]);

  useEffect(() => {
    updateWorkflowData(
      {
        price: pricingData.price,
        currency: pricingData.currency,
        priceType: pricingData.priceType,
        negotiable: pricingData.negotiable,
        vatDeductible: pricingData.vatDeductible
      },
      'pricing'
    );
  }, [pricingData, updateWorkflowData]);

  const handleFieldChange = useCallback(
    <K extends keyof PricingFormState>(field: K, value: PricingFormState[K]) => {
      setPricingData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const canContinue = useMemo(() => !!pricingData.price, [pricingData.price]);

  const serialize = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (pricingData.price) params.set('price', pricingData.price);
    params.set('currency', pricingData.currency);
    params.set('priceType', pricingData.priceType);
    if (pricingData.negotiable) {
      params.set('negotiable', 'true');
    } else {
      params.delete('negotiable');
    }
    return params;
  }, [pricingData, searchParams]);

  return {
    pricingData,
    handleFieldChange,
    canContinue,
    serialize
  };
};

export default usePricingForm;

