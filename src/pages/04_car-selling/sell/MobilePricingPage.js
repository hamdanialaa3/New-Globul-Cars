import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Mobile Pricing Page
// Purpose: Price setting for vehicle listing on mobile/tablet
// Mobile-first; no emojis; <300 lines
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { S } from './MobilePricingPage.styles';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { usePricingForm } from './Pricing/usePricingForm';
import { AIPriceSuggestion } from '../../../components/AI';
const ProgressWrapper = styled.div `
  padding: 0.75rem 1rem 0;
`;
const MobilePricingPage = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { vehicleType = 'car' } = useParams();
    const [showAIPricing, setShowAIPricing] = useState(false);
    const { pricingData, handleFieldChange, canContinue, serialize } = usePricingForm();
    // Get car details from URL params for AI
    const carDetails = {
        make: searchParams.get('make') || '',
        model: searchParams.get('model') || '',
        year: parseInt(searchParams.get('year') || '2020'),
        mileage: parseInt(searchParams.get('mileage') || '0'),
        condition: searchParams.get('condition') || 'good',
        location: searchParams.get('location') || 'Sofia'
    };
    useEffect(() => {
        SellWorkflowStepStateService.markPending('pricing');
    }, []);
    const handleContinue = () => {
        if (!pricingData.price || parseFloat(pricingData.price) <= 0)
            return;
        const params = serialize();
        navigate(`/sell/inserat/${vehicleType}/contact?${params.toString()}`);
    };
    const formattedPrice = pricingData.price
        ? parseFloat(pricingData.price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')
        : '';
    useEffect(() => {
        if (pricingData.price && parseFloat(pricingData.price) > 0) {
            SellWorkflowStepStateService.markCompleted('pricing');
        }
        else {
            SellWorkflowStepStateService.markPending('pricing');
        }
    }, [pricingData.price]);
    return (_jsxs(S.PageWrapper, { children: [_jsx(MobileHeader, {}), _jsx(ProgressWrapper, { children: _jsx(SellProgressBar, { currentStep: "pricing" }) }), _jsx(S.ContentWrapper, { children: _jsx(MobileContainer, { maxWidth: "md", children: _jsxs(MobileStack, { spacing: "lg", children: [_jsxs(S.HeaderSection, { children: [_jsx(S.PageTitle, { children: t('sell.pricing.title') }), _jsx(S.PageSubtitle, { children: t('sell.pricing.subtitle') })] }), _jsxs(S.Card, { children: [_jsxs(S.FieldGroup, { children: [_jsx(S.Label, { htmlFor: "price", "$required": true, children: t('sell.pricing.price') }), _jsxs(S.PriceInputWrapper, { children: [_jsx(S.Input, { id: "price", type: "number", inputMode: "decimal", value: pricingData.price, onChange: (e) => handleFieldChange('price', e.target.value), placeholder: "25000", min: "0", step: "100" }), _jsx(S.Currency, { children: "EUR" })] }), formattedPrice && (_jsxs(S.FormattedPrice, { children: [formattedPrice, " EUR"] }))] }), carDetails.make && carDetails.model && (_jsx(S.Card, { style: { marginTop: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }, children: _jsx(AIPriceSuggestion, { carDetails: carDetails, onPriceSelect: (price) => handleFieldChange('price', price.toString()) }) })), _jsxs(S.ToggleWrapper, { children: [_jsxs(S.ToggleSwitch, { "$checked": pricingData.negotiable, children: [_jsx("input", { type: "checkbox", id: "negotiable", checked: pricingData.negotiable, onChange: (e) => handleFieldChange('negotiable', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] }), _jsx(S.ToggleLabel, { htmlFor: "negotiable", children: t('sell.pricing.negotiable') })] }), _jsxs(S.CheckboxGroup, { children: [_jsx(S.Checkbox, { type: "checkbox", id: "vat", checked: pricingData.vatDeductible, onChange: (e) => handleFieldChange('vatDeductible', e.target.checked) }), _jsx(S.CheckboxLabel, { htmlFor: "vat", children: t('sell.pricing.vatDeductible') })] })] }), _jsxs(S.InfoCard, { children: [_jsx(S.InfoTitle, { children: t('sell.pricing.infoTitle') }), _jsx(S.InfoText, { children: t('sell.pricing.infoText') })] })] }) }) }), _jsx(S.StickyFooter, { children: _jsx(S.PrimaryButton, { "$enabled": canContinue, onClick: handleContinue, disabled: !canContinue, children: t('common.next') }) })] }));
};
export default MobilePricingPage;
