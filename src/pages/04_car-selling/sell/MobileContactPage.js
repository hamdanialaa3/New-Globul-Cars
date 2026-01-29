import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Mobile Contact Page
// Purpose: Contact information collection for vehicle listing
// Mobile-first; no emojis; <300 lines
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { S } from './MobileContactPage.styles';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
const ProgressWrapper = styled.div `
  padding: 0.75rem 1rem 0;
`;
const MobileContactPage = () => {
    var _a;
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { vehicleType = 'car' } = useParams();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        zipCode: ''
    });
    useEffect(() => {
        SellWorkflowStepStateService.markPending('contact');
    }, []);
    const onChange = (field, value) => {
        setForm(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    const handleSubmit = async () => {
        if (!canContinue)
            return;
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(form).forEach(([key, value]) => {
            if (value)
                params.set(key, value);
        });
        // Navigate to preview/confirmation page
        navigate(`/sell/inserat/${vehicleType}/preview?${params.toString()}`);
    };
    const canContinue = !!(form.name && form.phone && form.email);
    useEffect(() => {
        if (form.name && form.phone && form.email) {
            SellWorkflowStepStateService.markCompleted('contact');
        }
        else {
            SellWorkflowStepStateService.markPending('contact');
        }
    }, [form.name, form.phone, form.email]);
    return (_jsxs(S.PageWrapper, { children: [_jsx(MobileHeader, {}), _jsx(ProgressWrapper, { children: _jsx(SellProgressBar, { currentStep: "contact" }) }), _jsx(S.ContentWrapper, { children: _jsx(MobileContainer, { maxWidth: "md", children: _jsxs(MobileStack, { spacing: "lg", children: [_jsxs(S.HeaderSection, { children: [_jsx(S.PageTitle, { children: t('sell.contact.title') }), _jsx(S.PageSubtitle, { children: t('sell.contact.subtitle') })] }), _jsx(S.Card, { children: _jsxs(S.Grid, { children: [_jsxs(S.FieldGroup, { children: [_jsx(S.Label, { htmlFor: "name", "$required": true, children: t('sell.contact.name') }), _jsx(S.Input, { id: "name", type: "text", value: form.name, onChange: (e) => onChange('name', e.target.value), placeholder: t('sell.contact.namePlaceholder') })] }), _jsxs(S.FieldGroup, { children: [_jsx(S.Label, { htmlFor: "phone", "$required": true, children: t('sell.contact.phone') }), _jsx(S.Input, { id: "phone", type: "tel", inputMode: "tel", value: form.phone, onChange: (e) => onChange('phone', e.target.value), placeholder: "+359 888 123 456" })] }), _jsxs(S.FieldGroup, { children: [_jsx(S.Label, { htmlFor: "email", "$required": true, children: t('sell.contact.email') }), _jsx(S.Input, { id: "email", type: "email", inputMode: "email", value: form.email, onChange: (e) => onChange('email', e.target.value), placeholder: "email@example.com" })] }), _jsxs(S.FieldGroup, { children: [_jsx(S.Label, { htmlFor: "city", children: t('sell.contact.locationData?.cityName') }), _jsx(S.Input, { id: "city", type: "text", value: (_a = form.locationData) === null || _a === void 0 ? void 0 : _a.cityName, onChange: (e) => onChange('city', e.target.value), placeholder: t('sell.contact.cityPlaceholder') })] }), _jsxs(S.FieldGroup, { children: [_jsx(S.Label, { htmlFor: "zipCode", children: t('sell.contact.zipCode') }), _jsx(S.Input, { id: "zipCode", type: "text", inputMode: "numeric", value: form.zipCode, onChange: (e) => onChange('zipCode', e.target.value), placeholder: "1000" })] })] }) }), _jsxs(S.InfoCard, { children: [_jsx(S.InfoTitle, { children: t('sell.contact.infoTitle') }), _jsx(S.InfoText, { children: t('sell.contact.infoText') })] })] }) }) }), _jsx(S.StickyFooter, { children: _jsx(S.PrimaryButton, { "$enabled": canContinue, onClick: handleSubmit, disabled: !canContinue, children: t('sell.contact.preview') }) })] }));
};
export default MobileContactPage;
