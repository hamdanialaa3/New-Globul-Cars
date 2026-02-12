import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Vehicle Data Page with Workflow - Modern Design
// صفحة بيانات السيارة مع الأتمتة - تصميم حديث
// File Size: ~280 lines (under 300 limit) ✅
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import SplitScreenLayout from '../../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../../components/WorkflowVisualization';
import { FUEL_TYPES, TRANSMISSION_TYPES, COLORS, DOOR_OPTIONS, SEAT_OPTIONS, BODY_TYPES } from './types';
import { isFeaturedBrand } from '../../../../services/carBrandsService';
import { CAR_YEARS } from '../../../../data/dropdown-options';
import { Star, Zap } from 'lucide-react';
import * as S from './styles';
import Tooltip, { CarSellingTooltips } from '../../../../components/Tooltip';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../../constants/ErrorMessages';
import useDraftAutoSave from '../../../../hooks/useDraftAutoSave';
import useWorkflowStep from '../../../../hooks/useWorkflowStep';
import KeyboardShortcutsHelper from '../../../../components/KeyboardShortcutsHelper';
import { SellWorkflowLayout } from '../../../../components/SellWorkflow';
import { useProfileType } from '../../../../contexts/ProfileTypeContext';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';
import { useVehicleDataForm, getRegistrationYear } from './useVehicleDataForm';
const VehicleDataPageNew = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const { profileType } = useProfileType();
    const vehicleType = searchParams.get('vt');
    const sellerType = searchParams.get('st') || profileType;
    const { formData, availableBrands, availableModels, availableVariants, showVariants, handleInputChange, canContinue, buildURLSearchParams } = useVehicleDataForm();
    useEffect(() => {
        SellWorkflowStepStateService.markPending('vehicle-data');
        // Check if previous step is completed
        const previousStepCompleted = SellWorkflowStepStateService.isCompleted('vehicle-selection');
        if (!previousStepCompleted) {
            logger.warn('Accessing vehicle data page without completing vehicle selection');
            // Could redirect back or show warning
        }
    }, []);
    useEffect(() => {
        const registrationYear = getRegistrationYear(formData);
        if (formData.make && registrationYear) {
            SellWorkflowStepStateService.markCompleted('vehicle-data');
        }
        else {
            SellWorkflowStepStateService.markPending('vehicle-data');
        }
    }, [formData]);
    // 🆕 Hooks for enhancements
    const { saveDraft, isSaving } = useDraftAutoSave(formData, { currentStep: 2, interval: 30000 });
    const { markComplete } = useWorkflowStep(2, 'Vehicle Data');
    const handleContinue = async () => {
        // 🆕 Enhanced validation with toast
        if (!formData.make) {
            toast.error(getErrorMessage('MAKE_REQUIRED', language));
            return;
        }
        const registrationYear = getRegistrationYear(formData);
        if (!registrationYear) {
            toast.error(getErrorMessage('YEAR_REQUIRED', language));
            return;
        }
        const yearNum = parseInt(registrationYear);
        const currentYear = new Date().getFullYear();
        if (yearNum < 1900 || yearNum > currentYear + 1) {
            toast.error(getErrorMessage('YEAR_INVALID', language, { currentYear: currentYear.toString() }));
            return;
        }
        try {
            // 🆕 Save data before navigation to ensure it's persisted
            await saveDraft(true);
            // 🆕 Mark step as completed
            markComplete({
                make: formData.make,
                model: formData.model,
                year: registrationYear
            });
            const params = buildURLSearchParams();
            if (vehicleType)
                params.set('vt', vehicleType);
            if (sellerType)
                params.set('st', sellerType);
            navigate(`/sell/inserat/${vehicleType || 'car'}/equipment?${params.toString()}`);
        }
        catch (error) {
            logger.error('Error saving vehicle data before navigation', error);
            toast.error(language === 'bg'
                ? 'Грешка при запазване на данните. Моля, опитайте отново.'
                : 'Error saving data. Please try again.');
        }
    };
    // Workflow steps for visualization (currently not used in UI)
    // const workflowSteps = [
    //   { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
    //   { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
    //   { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: false },
    //   { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: false },
    //   { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: false },
    //   { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
    //   { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
    //   { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
    // ];
    const leftContent = (_jsxs(S.ContentSection, { children: [_jsxs(S.HeaderCard, { children: [_jsx(S.Title, { children: language === 'bg' ? 'Данни за превозното средство' : 'Vehicle Data' }), _jsx(S.Subtitle, { children: language === 'bg'
                            ? 'Въведете основната информация за вашето превозно средство'
                            : 'Enter basic information about your vehicle' })] }), _jsxs(S.NavigationButtons, { children: [_jsxs(S.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: ["\u2190 ", language === 'bg' ? 'Назад' : 'Back'] }), _jsxs(S.Button, { type: "button", "$variant": "primary", onClick: handleContinue, disabled: !canContinue, children: [language === 'bg' ? 'Продължи' : 'Continue', " \u2192"] })] }), _jsxs(S.FormCard, { children: [_jsx(S.SectionTitle, { children: language === 'bg' ? 'Тип купе' : 'Body Type' }), _jsx(S.FormGrid, { children: _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "bodyType", "$required": true, children: language === 'bg' ? 'Изберете тип купе' : 'Select Body Type' }), _jsxs(S.Select, { id: "bodyType", "aria-label": language === 'bg' ? 'Тип купе' : 'Body Type', title: language === 'bg' ? 'Тип купе' : 'Body Type', value: formData.bodyType || '', onChange: (e) => {
                                        const value = e.target.value;
                                        handleInputChange('bodyType', value);
                                        if (value !== 'other') {
                                            handleInputChange('bodyTypeOther', '');
                                        }
                                    }, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете тип купе' : 'Select Body Type' }), BODY_TYPES && BODY_TYPES.length > 0 ? (BODY_TYPES.map(bodyType => (_jsx("option", { value: bodyType.value, children: language === 'bg' ? bodyType.labelBg : bodyType.labelEn }, bodyType.value)))) : (_jsxs(_Fragment, { children: [_jsx("option", { value: "sedan", children: language === 'bg' ? 'Седан' : 'Sedan' }), _jsx("option", { value: "suv", children: language === 'bg' ? 'Джип / SUV' : 'SUV' }), _jsx("option", { value: "hatchback", children: language === 'bg' ? 'Хечбек' : 'Hatchback' }), _jsx("option", { value: "coupe", children: language === 'bg' ? 'Купе' : 'Coupe' }), _jsx("option", { value: "wagon", children: language === 'bg' ? 'Комби' : 'Wagon' }), _jsx("option", { value: "convertible", children: language === 'bg' ? 'Кабрио' : 'Convertible' }), _jsx("option", { value: "pickup", children: language === 'bg' ? 'Пикап' : 'Pickup' }), _jsx("option", { value: "minivan", children: language === 'bg' ? 'Миниван' : 'Minivan' }), _jsx("option", { value: "other", children: language === 'bg' ? 'Друг' : 'Other' })] }))] }), formData.bodyType === 'other' && (_jsx(S.Input, { type: "text", value: formData.bodyTypeOther || '', onChange: (e) => handleInputChange('bodyTypeOther', e.target.value), placeholder: language === 'bg' ? 'Въведете тип купе' : 'Enter body type', style: { marginTop: '0.75rem' } }))] }) })] }), _jsxs(S.FormCard, { children: [_jsx(S.SectionTitle, { children: language === 'bg' ? 'Задължителни полета' : 'Required Fields' }), _jsx(S.BrandOrbitWrapper, { children: _jsx(WorkflowFlow, { variant: "inline", currentStepIndex: 1, totalSteps: 8, carBrand: formData.make || undefined, language: language }) }), _jsxs(S.FormGrid, { children: [_jsxs(S.FormGroup, { children: [_jsxs(S.Label, { htmlFor: "make", "$required": true, children: [language === 'bg' ? 'Марка' : 'Make', ' ', _jsx(Tooltip, { content: CarSellingTooltips[language].make })] }), _jsxs(S.Select, { id: "make", "aria-label": language === 'bg' ? 'Марка' : 'Make', title: language === 'bg' ? 'Марка' : 'Make', value: formData.make, onChange: (e) => {
                                            const value = e.target.value;
                                            handleInputChange('make', value);
                                            if (value !== '__other__') {
                                                handleInputChange('makeOther', '');
                                            }
                                        }, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете марка' : 'Select Make' }), availableBrands.map(brand => (_jsx("option", { value: brand, style: isFeaturedBrand(brand) ? {
                                                    fontWeight: '700',
                                                    color: '#ff8f10',
                                                    backgroundColor: 'rgba(255, 143, 16, 0.05)'
                                                } : {}, children: isFeaturedBrand(brand) ? `● ${brand}` : brand }, brand))), _jsx("option", { value: "__other__", children: language === 'bg' ? '◆ Друга марка (въведете ръчно)' : '◆ Other make (enter manually)' })] }), formData.make === '__other__' && (_jsx(S.Input, { type: "text", value: formData.makeOther || '', onChange: (e) => handleInputChange('makeOther', e.target.value), placeholder: language === 'bg' ? 'Въведете марка ръчно' : 'Enter make manually', style: { marginTop: '0.75rem' } })), _jsxs(S.HintText, { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(Star, { size: 14, color: "#ff8f10" }), language === 'bg'
                                                ? 'Най-популярни марки в България показани отгоре'
                                                : 'Most popular brands in Bulgaria shown first'] })] }), _jsxs(S.FormGroup, { children: [_jsxs(S.Label, { htmlFor: "year", "$required": true, children: [language === 'bg' ? 'Година' : 'Year', ' ', _jsx(Tooltip, { content: CarSellingTooltips[language].year })] }), _jsxs(S.Select, { id: "year", "aria-label": language === 'bg' ? 'Година' : 'Year', title: language === 'bg' ? 'Година' : 'Year', value: formData.year, onChange: (e) => handleInputChange('year', e.target.value), children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), CAR_YEARS.map(option => (_jsx("option", { value: option.value, children: language === 'bg' ? option.label : option.labelEn || option.label }, option.value)))] })] })] }), _jsx(S.FormGrid, { children: _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "model", children: language === 'bg' ? 'Модел' : 'Model' }), formData.make === '__other__' ? (_jsx(S.Input, { id: "model", type: "text", value: formData.modelOther || formData.model || '', onChange: (e) => {
                                        // If make is __other__, save to modelOther
                                        if (formData.make === '__other__') {
                                            handleInputChange('modelOther', e.target.value);
                                            // Also set model to __other__ to indicate manual entry
                                            if (e.target.value && formData.model !== '__other__') {
                                                handleInputChange('model', '__other__');
                                            }
                                        }
                                        else {
                                            handleInputChange('model', e.target.value);
                                        }
                                    }, placeholder: language === 'bg' ? 'Въведете модел ръчно' : 'Enter model manually' })) : availableModels.length > 0 ? (_jsxs(_Fragment, { children: [_jsxs(S.Select, { id: "model", "aria-label": language === 'bg' ? 'Модел' : 'Model', title: language === 'bg' ? 'Модел' : 'Model', value: formData.model, onChange: (e) => {
                                                const value = e.target.value;
                                                handleInputChange('model', value);
                                                if (value !== '__other__') {
                                                    handleInputChange('modelOther', '');
                                                }
                                            }, disabled: !formData.make && !formData.makeOther, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете модел' : 'Select Model' }), availableModels.map(model => (_jsx("option", { value: model, children: model }, model))), _jsx("option", { value: "__other__", children: language === 'bg' ? '◆ Друг модел (въведете ръчно)' : '◆ Other model (enter manually)' })] }), formData.model === '__other__' && (_jsx(S.Input, { type: "text", value: formData.modelOther || '', onChange: (e) => handleInputChange('modelOther', e.target.value), placeholder: language === 'bg' ? 'Въведете модел ръчно' : 'Enter model manually', style: { marginTop: '0.75rem' } }))] })) : (_jsx(S.Input, { id: "model", type: "text", value: formData.model, onChange: (e) => handleInputChange('model', e.target.value), placeholder: language === 'bg' ? 'Например: X5' : 'Example: X5', disabled: !formData.make && !formData.makeOther })), !formData.make && !formData.makeOther && (_jsxs(S.HintText, { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(Zap, { size: 12, color: "#7f8c8d" }), language === 'bg' ? 'Първо изберете марка' : 'Select make first'] }))] }) }), _jsxs(S.RequiredNote, { children: [_jsx("strong", { children: "*" }), " ", language === 'bg'
                                ? 'Тези полета са задължителни за продължаване'
                                : 'These fields are required to continue'] })] }), _jsxs(S.FormCard, { children: [_jsx(S.SectionTitle, { children: language === 'bg' ? 'Допълнителна информация (по избор)' : 'Additional Information (Optional)' }), _jsxs(S.FormGrid, { children: [_jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "model", children: language === 'bg' ? 'Модел' : 'Model' }), formData.make === '__other__' ? (_jsx(S.Input, { id: "model", type: "text", value: formData.modelOther || formData.model || '', onChange: (e) => {
                                            // If make is __other__, save to modelOther
                                            if (formData.make === '__other__') {
                                                handleInputChange('modelOther', e.target.value);
                                                // Also set model to __other__ to indicate manual entry
                                                if (e.target.value && formData.model !== '__other__') {
                                                    handleInputChange('model', '__other__');
                                                }
                                            }
                                            else {
                                                handleInputChange('model', e.target.value);
                                            }
                                        }, placeholder: language === 'bg' ? 'Въведете модел ръчно' : 'Enter model manually' })) : availableModels.length > 0 ? (_jsxs(_Fragment, { children: [_jsxs(S.Select, { id: "model", "aria-label": language === 'bg' ? 'Модел' : 'Model', title: language === 'bg' ? 'Модел' : 'Model', value: formData.model, onChange: (e) => {
                                                    const value = e.target.value;
                                                    handleInputChange('model', value);
                                                    if (value !== '__other__') {
                                                        handleInputChange('modelOther', '');
                                                    }
                                                }, disabled: !formData.make && !formData.makeOther, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете модел' : 'Select Model' }), availableModels.map(model => (_jsx("option", { value: model, children: model }, model))), _jsx("option", { value: "__other__", children: language === 'bg' ? '◆ Друг модел (въведете ръчно)' : '◆ Other model (enter manually)' })] }), formData.model === '__other__' && (_jsx(S.Input, { type: "text", value: formData.modelOther || '', onChange: (e) => handleInputChange('modelOther', e.target.value), placeholder: language === 'bg' ? 'Въведете модел ръчно' : 'Enter model manually', style: { marginTop: '0.75rem' } }))] })) : (_jsx(S.Input, { id: "model", type: "text", value: formData.model, onChange: (e) => handleInputChange('model', e.target.value), placeholder: language === 'bg' ? 'Например: X5' : 'Example: X5', disabled: !formData.make && !formData.makeOther })), !formData.make && !formData.makeOther && (_jsxs(S.HintText, { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(Zap, { size: 12, color: "#7f8c8d" }), language === 'bg' ? 'Първо изберете марка' : 'Select make first'] }))] }), showVariants && (_jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "variant", children: language === 'bg' ? 'Вариант / Версия' : 'Variant / Version' }), _jsxs(S.Select, { id: "variant", "aria-label": language === 'bg' ? 'Вариант / Версия' : 'Variant / Version', title: language === 'bg' ? 'Вариант / Версия' : 'Variant / Version', value: formData.variant, onChange: (e) => {
                                            const value = e.target.value;
                                            handleInputChange('variant', value);
                                            if (value !== '__other__') {
                                                handleInputChange('variantOther', '');
                                            }
                                        }, disabled: (!formData.model && !formData.modelOther) || availableVariants.length === 0, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете вариант' : 'Select Variant' }), availableVariants.map(variant => (_jsx("option", { value: variant, children: variant }, variant))), _jsx("option", { value: "__other__", children: language === 'bg' ? '◆ Друг вариант (въведете ръчно)' : '◆ Other variant (enter manually)' })] }), formData.variant === '__other__' && (_jsx(S.Input, { type: "text", value: formData.variantOther || '', onChange: (e) => handleInputChange('variantOther', e.target.value), placeholder: language === 'bg' ? 'Въведете вариант ръчно' : 'Enter variant manually', style: { marginTop: '0.75rem' } })), _jsxs(S.HintText, { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx(Zap, { size: 12, color: "#005ca9" }), language === 'bg'
                                                ? `${availableVariants.length} налични варианта`
                                                : `${availableVariants.length} variants available`] })] })), _jsxs(S.FormGroup, { children: [_jsxs(S.Label, { htmlFor: "mileage", children: [language === 'bg' ? 'Пробег (км)' : 'Mileage (km)', ' ', _jsx(Tooltip, { content: CarSellingTooltips[language].mileage })] }), _jsx(S.Input, { id: "mileage", type: "number", value: formData.mileage, onChange: (e) => handleInputChange('mileage', e.target.value), placeholder: "45000", min: "0" })] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "fuelType", children: language === 'bg' ? 'Гориво' : 'Fuel Type' }), _jsxs(S.Select, { id: "fuelType", "aria-label": language === 'bg' ? 'Гориво' : 'Fuel Type', title: language === 'bg' ? 'Гориво' : 'Fuel Type', value: formData.fuelType, onChange: (e) => {
                                            const value = e.target.value;
                                            handleInputChange('fuelType', value);
                                            if (value !== '__other__') {
                                                handleInputChange('fuelTypeOther', '');
                                            }
                                        }, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), FUEL_TYPES.map(fuel => (_jsx("option", { value: fuel, children: fuel }, fuel))), _jsx("option", { value: "__other__", children: language === 'bg' ? '◆ Друг тип гориво (въведете ръчно)' : '◆ Other fuel type (enter manually)' })] }), formData.fuelType === '__other__' && (_jsx(S.Input, { type: "text", value: formData.fuelTypeOther || '', onChange: (e) => handleInputChange('fuelTypeOther', e.target.value), placeholder: language === 'bg' ? 'Въведете тип гориво ръчно' : 'Enter fuel type manually', style: { marginTop: '0.75rem' } }))] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "transmission", children: language === 'bg' ? 'Скоростна кутия' : 'Transmission' }), _jsxs(S.Select, { id: "transmission", "aria-label": language === 'bg' ? 'Скоростна кутия' : 'Transmission', title: language === 'bg' ? 'Скоростна кутия' : 'Transmission', value: formData.transmission, onChange: (e) => handleInputChange('transmission', e.target.value), children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), TRANSMISSION_TYPES.map(trans => (_jsx("option", { value: trans, children: trans }, trans)))] })] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "condition", children: language === 'bg' ? 'Състояние' : 'Condition' }), _jsxs(S.Select, { id: "condition", "aria-label": language === 'bg' ? 'Състояние' : 'Condition', title: language === 'bg' ? 'Състояние' : 'Condition', value: formData.condition || '', onChange: (e) => handleInputChange('condition', e.target.value), children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), _jsx("option", { value: "new", children: language === 'bg' ? 'Нов' : 'New' }), _jsx("option", { value: "used", children: language === 'bg' ? 'Употребяван' : 'Used' })] })] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "power", children: language === 'bg' ? 'Мощност (к.с.)' : 'Power (HP)' }), _jsx(S.Input, { id: "power", type: "number", value: formData.power, onChange: (e) => handleInputChange('power', e.target.value), placeholder: "150", min: "0" })] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "color", children: language === 'bg' ? 'Цвят' : 'Color' }), _jsxs(S.Select, { id: "color", "aria-label": language === 'bg' ? 'Цвят' : 'Color', title: language === 'bg' ? 'Цвят' : 'Color', value: formData.color, onChange: (e) => {
                                            const value = e.target.value;
                                            handleInputChange('color', value);
                                            if (value !== '__other__' && value !== 'other') {
                                                handleInputChange('colorOther', '');
                                            }
                                        }, children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), COLORS.map(color => (_jsx("option", { value: color === 'Друг (Other)' ? '__other__' : color, children: color }, color)))] }), (formData.color === '__other__' || formData.color === 'other') && (_jsx(S.Input, { type: "text", value: formData.colorOther || '', onChange: (e) => handleInputChange('colorOther', e.target.value), placeholder: language === 'bg' ? 'Въведете цвят ръчно' : 'Enter color manually', style: { marginTop: '0.75rem' } }))] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "doors", children: language === 'bg' ? 'Врати' : 'Doors' }), _jsxs(S.Select, { id: "doors", "aria-label": language === 'bg' ? 'Врати' : 'Doors', title: language === 'bg' ? 'Врати' : 'Doors', value: formData.doors, onChange: (e) => handleInputChange('doors', e.target.value), children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), DOOR_OPTIONS.map(door => (_jsx("option", { value: door, children: door }, door)))] })] }), _jsxs(S.FormGroup, { children: [_jsx(S.Label, { htmlFor: "seats", children: language === 'bg' ? 'Места' : 'Seats' }), _jsxs(S.Select, { id: "seats", "aria-label": language === 'bg' ? 'Места' : 'Seats', title: language === 'bg' ? 'Места' : 'Seats', value: formData.seats, onChange: (e) => handleInputChange('seats', e.target.value), children: [_jsx("option", { value: "", children: language === 'bg' ? 'Изберете' : 'Select' }), SEAT_OPTIONS.map(seat => (_jsx("option", { value: seat, children: seat }, seat)))] })] })] })] }), _jsxs(S.FormCard, { children: [_jsx(S.SectionTitle, { children: language === 'bg' ? 'История' : 'History' }), _jsxs(S.HistoryRow, { children: [_jsxs(S.HistoryInfo, { children: [_jsx(S.HistoryLabel, { children: language === 'bg' ? 'Има история на катастрофи' : 'Has accident history' }), _jsx(S.HistoryHint, { children: formData.hasAccidentHistory
                                            ? (language === 'bg' ? '⚠ Да' : '⚠ Yes')
                                            : (language === 'bg' ? '✓ Не' : '✓ No') })] }), _jsxs(S.CyberToggleWrapper, { children: [_jsx(S.CyberToggleCheckbox, { type: "checkbox", id: "accident-history-toggle", checked: formData.hasAccidentHistory || false, onChange: (e) => handleInputChange('hasAccidentHistory', e.target.checked) }), _jsxs(S.CyberToggleLabel, { htmlFor: "accident-history-toggle", children: [_jsx(S.ToggleTrack, {}), _jsx(S.ToggleThumbIcon, {}), _jsx(S.ToggleThumbDots, {}), _jsx(S.ToggleThumbHighlight, {}), _jsxs(S.ToggleLabels, { children: [_jsx(S.ToggleLabelOn, { children: "YES" }), _jsx(S.ToggleLabelOff, { children: "NO" })] })] })] })] }), _jsxs(S.HistoryRow, { style: { marginTop: '1rem' }, children: [_jsxs(S.HistoryInfo, { children: [_jsx(S.HistoryLabel, { children: language === 'bg' ? 'Има сервизна история' : 'Has service history' }), _jsx(S.HistoryHint, { children: formData.hasServiceHistory
                                            ? (language === 'bg' ? '✓ Да' : '✓ Yes')
                                            : (language === 'bg' ? '✗ Не' : '✗ No') })] }), _jsxs(S.CyberToggleWrapper, { children: [_jsx(S.CyberToggleCheckbox, { type: "checkbox", id: "service-history-toggle", checked: formData.hasServiceHistory || false, onChange: (e) => handleInputChange('hasServiceHistory', e.target.checked) }), _jsxs(S.CyberToggleLabel, { htmlFor: "service-history-toggle", children: [_jsx(S.ToggleTrack, {}), _jsx(S.ToggleThumbIcon, {}), _jsx(S.ToggleThumbDots, {}), _jsx(S.ToggleThumbHighlight, {}), _jsxs(S.ToggleLabels, { children: [_jsx(S.ToggleLabelOn, { children: "YES" }), _jsx(S.ToggleLabelOff, { children: "NO" })] })] })] })] })] }), _jsxs(S.NavigationButtons, { children: [_jsxs(S.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: ["\u2190 ", language === 'bg' ? 'Назад' : 'Back'] }), _jsxs(S.Button, { type: "button", "$variant": "primary", onClick: handleContinue, disabled: !canContinue, children: [language === 'bg' ? 'Продължи' : 'Continue', " \u2192"] })] })] }));
    return (_jsxs(SellWorkflowLayout, { currentStep: "vehicle-data", children: [_jsx(SplitScreenLayout, { leftContent: leftContent }), _jsx(KeyboardShortcutsHelper, { onSave: () => saveDraft(true), onNext: handleContinue, onBack: () => navigate(-1), language: language }), isSaving && (_jsxs("div", { style: {
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 998
                }, children: ["\uD83D\uDCBE ", getErrorMessage('AUTO_SAVED', language)] }))] }));
};
export default VehicleDataPageNew;
