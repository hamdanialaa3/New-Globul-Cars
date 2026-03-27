import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Pricing Page with Workflow
// صفحة التسعير مع الأتمتة
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../../components/WorkflowVisualization';
import { Euro, Info } from 'lucide-react';
import * as S from './styles';
import { SellWorkflowLayout } from '../../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';
import { usePricingForm } from './usePricingForm';
import useSellWorkflow from '../../../../hooks/useSellWorkflow';
const PricingPageNew = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const { pricingData, handleFieldChange, canContinue, serialize } = usePricingForm();
    useEffect(() => {
        SellWorkflowStepStateService.markPending('pricing');
    }, []);
    useEffect(() => {
        if (pricingData.price) {
            SellWorkflowStepStateService.markCompleted('pricing');
        }
        else {
            SellWorkflowStepStateService.markPending('pricing');
        }
    }, [pricingData.price]);
    const vehicleType = searchParams.get('vt');
    // ✅ FIX: Get make from multiple sources
    const { workflowData } = useSellWorkflow();
    const make = searchParams.get('mk') ||
        searchParams.get('make') ||
        (workflowData === null || workflowData === void 0 ? void 0 : workflowData.make) ||
        (workflowData === null || workflowData === void 0 ? void 0 : workflowData.brand) ||
        '';
    const handleContinue = () => {
        if (!pricingData.price) {
            alert(language === 'bg' ? 'Моля, въведете цена!' : 'Please enter a price!');
            return;
        }
        const params = serialize();
        navigate(`/sell/inserat/${vehicleType || 'car'}/contact?${params.toString()}`);
    };
    const workflowSteps = [
        { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
        { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
        { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
        { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
        { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: true },
        { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
        { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
        { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
    ];
    const leftContent = (_jsxs(S.ContentSection, { children: [_jsxs(S.HeaderCard, { children: [_jsx(S.Title, { children: language === 'bg' ? 'Цена на превозното средство' : 'Vehicle Price' }), _jsx(S.Subtitle, { children: language === 'bg' ? 'Определете цената на вашето превозно средство' : 'Set your vehicle price' }), _jsx(S.BrandOrbitInline, { children: _jsx(WorkflowFlow, { variant: "inline", currentStepIndex: 4, totalSteps: 8, carBrand: make || undefined, language: language }) })] }), _jsxs(S.NavigationButtons, { children: [_jsxs(S.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: ["\u2190 ", language === 'bg' ? 'Назад' : 'Back'] }), _jsxs(S.Button, { type: "button", "$variant": "primary", onClick: handleContinue, disabled: !canContinue, children: [language === 'bg' ? 'Продължи' : 'Continue', " \u2192"] })] }), _jsxs(S.FormCard, { children: [_jsxs(S.Label, { children: [language === 'bg' ? 'Цена (EUR)' : 'Price (EUR)', _jsx("span", { style: { color: '#3b82f6', marginLeft: '0.25rem' }, children: "*" })] }), _jsxs(S.PriceInputWrapper, { children: [_jsx(S.PriceIcon, { children: _jsx(Euro, { size: 24 }) }), _jsx(S.PriceInput, { type: "number", value: pricingData.price, onChange: (e) => handleFieldChange('price', e.target.value), placeholder: "15000", min: "0" })] }), _jsxs(S.ToggleWrapper, { children: [_jsxs(S.ToggleSwitch, { "$checked": pricingData.negotiable, children: [_jsx("input", { type: "checkbox", id: "negotiable", checked: pricingData.negotiable, onChange: (e) => handleFieldChange('negotiable', e.target.checked) }), _jsx("span", { className: "toggle-slider" })] }), _jsx(S.ToggleLabel, { htmlFor: "negotiable", children: language === 'bg' ? 'Цената подлежи на договаряне' : 'Price is negotiable' })] })] }), _jsxs(S.InfoCard, { children: [_jsx(S.InfoIcon, { children: _jsx(Info, { size: 20 }) }), _jsxs(S.InfoText, { children: [_jsx("strong", { children: language === 'bg' ? 'Съвет:' : 'Tip:' }), _jsx("br", {}), language === 'bg'
                                ? 'Проучете пазарната цена на подобни превозни средства преди да определите цена.'
                                : 'Research market prices for similar vehicles before setting your price.'] })] }), _jsxs(S.NavigationButtons, { children: [_jsxs(S.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: ["\u2190 ", language === 'bg' ? 'Назад' : 'Back'] }), _jsxs(S.Button, { type: "button", "$variant": "primary", onClick: handleContinue, disabled: !canContinue, children: [language === 'bg' ? 'Продължи' : 'Continue', " \u2192"] })] })] }));
    return (_jsx(SellWorkflowLayout, { currentStep: "pricing", children: _jsx(SplitScreenLayout, { leftContent: leftContent }) }));
};
export default PricingPageNew;

