import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
const defaultPricingState = {
    price: '',
    currency: 'EUR',
    priceType: 'fixed',
    negotiable: false,
    vatDeductible: false
};
export const usePricingForm = () => {
    const [searchParams] = useSearchParams();
    const { workflowData, updateWorkflowData } = useSellWorkflow();
    const initialState = useMemo(() => {
        return Object.assign(Object.assign({}, defaultPricingState), { price: searchParams.get('price') || workflowData.price || '', currency: searchParams.get('currency') || workflowData.currency || 'EUR', priceType: searchParams.get('priceType') ||
                workflowData.priceType ||
                'fixed', negotiable: searchParams.get('negotiable') === 'true' ||
                workflowData.negotiable === true ||
                workflowData.negotiable === 'true', vatDeductible: Boolean(workflowData.vatDeductible) });
    }, [workflowData, searchParams]);
    const [pricingData, setPricingData] = useState(initialState);
    const [isInitialized, setIsInitialized] = useState(false);
    // ✅ FIX: Only initialize once on mount, don't reset on every change
    useEffect(() => {
        if (!isInitialized) {
            setPricingData(initialState);
            setIsInitialized(true);
        }
    }, [initialState, isInitialized]);
    // ✅ FIX: Only sync from URL/workflow on initial mount, not on every change
    // This prevents the price field from blinking/resetting while user is typing
    useEffect(() => {
        if (!isInitialized)
            return;
        // Only update if price is empty AND we have a value from URL/workflow
        const urlPrice = searchParams.get('price');
        const workflowPrice = workflowData.price;
        if (!pricingData.price && (urlPrice || workflowPrice)) {
            setPricingData(prev => (Object.assign(Object.assign({}, prev), { price: urlPrice || workflowPrice || prev.price, currency: searchParams.get('currency') || workflowData.currency || prev.currency, priceType: searchParams.get('priceType') ||
                    workflowData.priceType ||
                    prev.priceType, negotiable: searchParams.get('negotiable') === 'true' ||
                    workflowData.negotiable === true ||
                    workflowData.negotiable === 'true' ||
                    prev.negotiable, vatDeductible: Boolean(workflowData.vatDeductible) || prev.vatDeductible })));
        }
    }, [isInitialized]); // ✅ FIX: Only run once after initialization, not on every change
    useEffect(() => {
        updateWorkflowData({
            price: pricingData.price,
            currency: pricingData.currency,
            priceType: pricingData.priceType,
            negotiable: pricingData.negotiable,
            vatDeductible: pricingData.vatDeductible
        }, 'pricing');
    }, [pricingData, updateWorkflowData]);
    const handleFieldChange = useCallback((field, value) => {
        setPricingData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    }, []);
    const canContinue = useMemo(() => !!pricingData.price, [pricingData.price]);
    const serialize = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (pricingData.price)
            params.set('price', pricingData.price);
        params.set('currency', pricingData.currency);
        params.set('priceType', pricingData.priceType);
        if (pricingData.negotiable) {
            params.set('negotiable', 'true');
        }
        else {
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
