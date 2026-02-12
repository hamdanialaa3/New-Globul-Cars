import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Mobile Vehicle Data Page (Clean)
// Optimized for mobile and portrait tablets; no emojis; ≤300 lines
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { CAR_YEARS } from '../../../data/dropdown-options';
import { SellProgressBar } from '../../../components/SellWorkflow';
import { useProfileType } from '../../../contexts/ProfileTypeContext';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { useVehicleDataForm, getRegistrationYear } from './VehicleData/useVehicleDataForm';
// Layout wrappers moved to styles
import { S } from './MobileVehicleDataPage.styles';
// Local aliases for styled components
const FieldGroup = S.FieldGroup;
const Label = S.Label;
const Select = S.Select;
const Input = S.Input;
const Hint = S.Hint;
const StickyFooter = S.StickyFooter;
const PrimaryButton = S.PrimaryButton;
const ProgressWrapper = styled.div `
  padding: 0.75rem 1rem 0;
`;
export const MobileVehicleDataPageClean = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { vehicleType = 'car' } = useParams();
    const { profileType } = useProfileType();
    const { formData, availableBrands, availableModels, handleInputChange, canContinue, buildURLSearchParams } = useVehicleDataForm();
    useEffect(() => {
        SellWorkflowStepStateService.markPending('vehicle-data');
    }, []);
    const brands = useMemo(() => availableBrands, [availableBrands]);
    const models = useMemo(() => availableModels, [availableModels]);
    const fuelTypes = useMemo(() => [
        'Бензин', 'Дизел', 'Хибрид', 'Електрически', 'Газ (LPG)', 'Газ (CNG)'
    ], []);
    const transmissions = useMemo(() => [
        'Ръчна', 'Автоматична', 'Полуавтоматична', 'CVT', 'DSG'
    ], []);
    useEffect(() => {
        const registrationYear = getRegistrationYear(formData);
        if (formData.make && registrationYear) {
            SellWorkflowStepStateService.markCompleted('vehicle-data');
        }
        else {
            SellWorkflowStepStateService.markPending('vehicle-data');
        }
    }, [formData]);
    const goNext = () => {
        if (!canContinue)
            return;
        const params = buildURLSearchParams();
        params.set('vt', vehicleType);
        const st = searchParams.get('st') || profileType;
        if (st)
            params.set('st', st);
        navigate(`/sell/inserat/${vehicleType}/equipment?${params.toString()}`);
    };
    return (_jsxs(S.PageWrapper, { children: [_jsx(MobileHeader, {}), _jsx(ProgressWrapper, { children: _jsx(SellProgressBar, { currentStep: "vehicle-data" }) }), _jsx(S.ContentWrapper, { children: _jsx(MobileContainer, { maxWidth: "md", children: _jsxs(MobileStack, { spacing: "lg", children: [_jsxs(S.HeaderSection, { children: [_jsx(S.PageTitle, { children: t('sell.vehicleData.title') }), _jsx(S.PageSubtitle, { children: t('sell.vehicleData.subtitle') })] }), _jsx(S.Card, { children: _jsxs(S.Grid, { children: [_jsxs(FieldGroup, { children: [_jsx(Label, { htmlFor: "make", "$required": true, children: t('sell.vehicleData.make') }), _jsxs(Select, { id: "make", value: formData.make, onChange: (e) => handleInputChange('make', e.target.value), title: t('sell.vehicleData.make'), children: [_jsx("option", { value: "", children: t('sell.vehicleData.selectMake') }), brands.map((b) => (_jsx("option", { value: b, children: b }, b)))] }), _jsx(Hint, { children: t('sell.vehicleData.makeHint') })] }), _jsxs(FieldGroup, { children: [_jsx(Label, { htmlFor: "model", children: t('sell.vehicleData.model') }), models.length > 0 ? (_jsxs(Select, { id: "model", value: formData.model, onChange: (e) => handleInputChange('model', e.target.value), disabled: !formData.make, title: t('sell.vehicleData.model'), children: [_jsx("option", { value: "", children: t('sell.vehicleData.selectModel') }), models.map((m) => (_jsx("option", { value: m, children: m }, m)))] })) : (_jsx(Input, { id: "model", type: "text", placeholder: language === 'bg' ? 'Например: X5' : 'e.g. X5', value: formData.model, onChange: (e) => handleInputChange('model', e.target.value), disabled: !formData.make }))] }), _jsxs(FieldGroup, { children: [_jsx(Label, { htmlFor: "vehicle-year", "$required": true, children: t('sell.vehicleData.year') }), _jsxs(Select, { id: "vehicle-year", value: formData.year, onChange: (e) => handleInputChange('year', e.target.value), title: t('sell.vehicleData.year'), children: [_jsx("option", { value: "", children: t('sell.select') }), CAR_YEARS.map(option => (_jsx("option", { value: option.value, children: language === 'bg' ? option.label : option.labelEn || option.label }, option.value)))] })] }), _jsxs(FieldGroup, { children: [_jsx(Label, { htmlFor: "mileage", children: t('sell.vehicleData.mileage') }), _jsx(Input, { id: "mileage", type: "number", placeholder: "45000", value: formData.mileage, onChange: (e) => handleInputChange('mileage', e.target.value), min: "0", inputMode: "numeric" })] }), _jsxs(FieldGroup, { children: [_jsx(Label, { htmlFor: "fuelType", children: t('sell.vehicleData.fuel') }), _jsxs(Select, { id: "fuelType", value: formData.fuelType, onChange: (e) => handleInputChange('fuelType', e.target.value), title: t('sell.vehicleData.fuel'), children: [_jsx("option", { value: "", children: t('sell.select') }), fuelTypes.map(ft => (_jsx("option", { value: ft, children: ft }, ft)))] })] }), _jsxs(FieldGroup, { children: [_jsx(Label, { htmlFor: "transmission", children: t('sell.vehicleData.transmission') }), _jsxs(Select, { id: "transmission", value: formData.transmission, onChange: (e) => handleInputChange('transmission', e.target.value), title: t('sell.vehicleData.transmission'), children: [_jsx("option", { value: "", children: t('sell.select') }), transmissions.map(tr => (_jsx("option", { value: tr, children: tr }, tr)))] })] })] }) })] }) }) }), _jsx(StickyFooter, { children: _jsx(PrimaryButton, { "$enabled": canContinue, onClick: goNext, disabled: !canContinue, children: t('common.next') }) })] }));
};
export default MobileVehicleDataPageClean;
