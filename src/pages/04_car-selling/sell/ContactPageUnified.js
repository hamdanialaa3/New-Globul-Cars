import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Contact Page Unified - Responsive Design
// صفحة تواصل موحدة - تصميم متجاوب
// Combines MobileContactPage + UnifiedContactPage functionality
// يجمع وظائف MobileContactPage + UnifiedContactPage
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthProvider';
import { useIsMobile } from '../../../hooks/useBreakpoint';
import SplitScreenLayout from '../../../components/SplitScreenLayout';
import SellWorkflowService from '../../../services/sell-workflow-service';
import SelectWithOther from '../../../components/shared/SelectWithOther';
import { CURRENCIES, PRICE_TYPES, AVAILABLE_HOURS } from '../../../data/dropdown-options';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../constants/ErrorMessages';
import ReviewSummary from '../../../components/ReviewSummary';
import useDraftAutoSave from '../../../hooks/useDraftAutoSave';
import { useSellWorkflow } from '../../../hooks/useSellWorkflow';
import useWorkflowStep from '../../../hooks/useWorkflowStep';
import { logger } from '../../../services/logger-service';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { useContactForm } from './Contact/useContactForm';
import { CONTACT_METHODS } from './Contact/contactConstants';
import { ContactIcons } from '../../../components/icons/contact/ContactMethodIcons';
// Mobile Components
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { SellProgressBar } from '../../../components/SellWorkflow';
// Styles - Conditional import based on device
const MobileContactStyles = React.lazy(() => import('./MobileContactPage.styles'));
const UnifiedContactStyles = React.lazy(() => import('./UnifiedContactStyles'));
const ContactPageUnified = () => {
    var _a, _b, _c;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const { currentUser } = useAuth();
    const isMobile = useIsMobile();
    const { contactData, availableRegions, availableCities, handleFieldChange, toggleContactMethod } = useContactForm({ language: language, requireContactFields: false });
    const [showOtherCityInput, setShowOtherCityInput] = useState(false);
    const [otherCityValue, setOtherCityValue] = useState('');
    const [pricingData, setPricingData] = useState(() => ({
        price: searchParams.get('price') || '',
        currency: searchParams.get('currency') || 'EUR',
        priceType: searchParams.get('priceType') || 'fixed',
        negotiable: searchParams.get('negotiable') === 'true'
    }));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showForcePublish, setShowForcePublish] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    // Enhanced state for reviews and uploads
    const [showReview, setShowReview] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [totalImages, setTotalImages] = useState(0);
    const [uploadErrors, setUploadErrors] = useState([]);
    useEffect(() => {
        SellWorkflowStepStateService.markPending('contact');
    }, []);
    // Hooks for enhanced features
    const { workflowData, updateWorkflowData, clearWorkflowData } = useSellWorkflow();
    const { saveDraft, isSaving, getTimeSinceLastSave } = useDraftAutoSave(Object.assign(Object.assign({}, workflowData), Object.fromEntries(searchParams)), { currentStep: 7, interval: 30000 });
    const { markComplete, logError } = useWorkflowStep(7, 'Contact Info');
    // Extract ALL parameters from URL
    const vehicleType = searchParams.get('vt');
    const sellerType = searchParams.get('st');
    const make = searchParams.get('mk');
    const model = searchParams.get('md');
    const fuelType = searchParams.get('fm');
    const year = searchParams.get('fy');
    const mileage = searchParams.get('mi');
    const transmission = searchParams.get('tr');
    const color = searchParams.get('cl');
    const safety = searchParams.get('safety');
    const comfort = searchParams.get('comfort');
    const infotainment = searchParams.get('infotainment');
    const extras = searchParams.get('extras');
    const images = searchParams.get('images');
    const price = searchParams.get('price');
    const currency = searchParams.get('currency');
    const priceType = searchParams.get('priceType');
    const negotiable = searchParams.get('negotiable');
    useEffect(() => {
        if (!currentUser)
            return;
        if (!contactData.sellerName && currentUser.displayName) {
            handleFieldChange('sellerName', currentUser.displayName);
        }
        if (!contactData.sellerEmail && currentUser.email) {
            handleFieldChange('sellerEmail', currentUser.email);
        }
    }, [currentUser, contactData.sellerName, contactData.sellerEmail, handleFieldChange]);
    useEffect(() => {
        const hasPrimaryContact = contactData.sellerName ||
            contactData.sellerEmail ||
            contactData.sellerPhone;
        if (hasPrimaryContact) {
            SellWorkflowStepStateService.markCompleted('contact');
        }
        else {
            SellWorkflowStepStateService.markPending('contact');
        }
    }, [contactData.sellerName, contactData.sellerEmail, contactData.sellerPhone]);
    // Handle city selection
    const handleCityChange = (value) => {
        if (value === 'OTHER') {
            setShowOtherCityInput(true);
            handleFieldChange('city', '');
        }
        else {
            setShowOtherCityInput(false);
            handleFieldChange('city', value);
        }
    };
    // Handle other city input
    const handleOtherCityChange = (value) => {
        setOtherCityValue(value);
        handleFieldChange('city', value);
    };
    useEffect(() => {
        var _a, _b;
        if (((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName) && !availableCities.some(city => { var _a; return city.name === ((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName); })) {
            setShowOtherCityInput(true);
            setOtherCityValue((_b = contactData.locationData) === null || _b === void 0 ? void 0 : _b.cityName);
        }
        else {
            setShowOtherCityInput(false);
            setOtherCityValue('');
        }
    }, [(_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName, availableCities]);
    // Handle pricing changes
    const handlePricingChange = (field, value) => {
        setPricingData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    // Validation function
    const validateForm = () => {
        var _a;
        const resolvedYear = workflowData.year || year;
        const resolvedModel = workflowData.model || model;
        if (!resolvedModel || resolvedModel.trim() === '') {
            toast.error(getErrorMessage('MODEL_REQUIRED', language));
            logError('MODEL_REQUIRED');
            return false;
        }
        if (!resolvedYear) {
            toast.error(getErrorMessage('YEAR_REQUIRED', language));
            logError('YEAR_REQUIRED');
            return false;
        }
        const yearNum = parseInt(resolvedYear, 10);
        const currentYear = new Date().getFullYear();
        if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
            toast.error(getErrorMessage('YEAR_INVALID', language, {
                currentYear: currentYear.toString()
            }));
            return false;
        }
        const totalImages = (_a = workflowData.imagesCount) !== null && _a !== void 0 ? _a : (images ? parseInt(images, 10) : 0);
        if (!totalImages || Number.isNaN(totalImages) || totalImages === 0) {
            toast.error(language === 'bg'
                ? 'Добавете поне една снимка, за да публикувате.'
                : 'Please add at least one image before publishing.');
            logError('IMAGES_REQUIRED');
            return false;
        }
        return true;
    };
    // Handle publish
    const handlePublish = async () => {
        var _a, _b;
        setError('');
        // Validate first
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            const fallbackModel = language === 'bg' ? 'Неизвестен модел' : 'Unknown Model';
            const finalModel = workflowData.model ||
                model ||
                fallbackModel;
            // ✅ FIX: Handle "Other" fields - use custom values if "__other__" is selected
            const finalMake = workflowData.make === '__other__'
                ? (workflowData.makeOther || workflowData.make || '')
                : (workflowData.make || make || '');
            const finalModelValue = workflowData.model === '__other__'
                ? (workflowData.modelOther || workflowData.model || '')
                : finalModel;
            const finalFuelType = workflowData.fuelType === '__other__'
                ? (workflowData.fuelTypeOther || workflowData.fuelType || '')
                : (workflowData.fuelType || fuelType || '');
            const finalColor = (workflowData.color === '__other__' || workflowData.color === 'Other')
                ? (workflowData.colorOther || workflowData.exteriorColorOther || workflowData.color || '')
                : (workflowData.color || color || '');
            const payload = Object.assign(Object.assign({}, workflowData), { vehicleType: workflowData.vehicleType || vehicleType || 'car', sellerType: workflowData.sellerType || sellerType || 'private', make: finalMake, model: finalModelValue, 
                // ✅ Save "Other" fields for reference and search
                makeOther: workflowData.make === '__other__' ? workflowData.makeOther : undefined, modelOther: workflowData.model === '__other__' ? workflowData.modelOther : undefined, variantOther: workflowData.variant === '__other__' ? workflowData.variantOther : undefined, fuelTypeOther: workflowData.fuelType === '__other__' ? workflowData.fuelTypeOther : undefined, colorOther: (workflowData.color === '__other__' || workflowData.color === 'Other')
                    ? (workflowData.colorOther || workflowData.exteriorColorOther)
                    : undefined, year: workflowData.year || year || '', mileage: workflowData.mileage || mileage || '0', fuelType: finalFuelType, transmission: workflowData.transmission || transmission || '', color: finalColor, exteriorColor: finalColor, price: pricingData.price || workflowData.price || '', currency: pricingData.currency || workflowData.currency || 'EUR', priceType: pricingData.priceType || workflowData.priceType || 'fixed', negotiable: pricingData.negotiable, safety: workflowData.safety || safety || '', comfort: workflowData.comfort || comfort || '', infotainment: workflowData.infotainment || infotainment || '', extras: workflowData.extras || extras || '', sellerName: contactData.sellerName || workflowData.sellerName || '', sellerEmail: contactData.sellerEmail || workflowData.sellerEmail || '', sellerPhone: contactData.sellerPhone || workflowData.sellerPhone || '', additionalPhone: contactData.additionalPhone || workflowData.additionalPhone || '', preferredContact: contactData.preferredContact.join(','), availableHours: contactData.availableHours || workflowData.availableHours || '', description: contactData.notes || workflowData.description || workflowData.additionalInfo || '', additionalInfo: contactData.notes || workflowData.additionalInfo || '', region: contactData.region || workflowData.region || '', city: ((_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName) || ((_b = workflowData.locationData) === null || _b === void 0 ? void 0 : _b.cityName) || '', postalCode: contactData.postalCode || workflowData.postalCode || '', location: contactData.location || workflowData.location || '', images: workflowData.images, imagesCount: workflowData.imagesCount });
            if (process.env.NODE_ENV === 'development') {
                logger.debug('Creating car listing with workflow data', { workflowData });
            }
            // Get current user ID
            const userId = currentUser === null || currentUser === void 0 ? void 0 : currentUser.uid;
            if (!userId) {
                throw new Error(language === 'bg'
                    ? 'Моля влезте в профила си'
                    : 'Please log in to your account');
            }
            // Flexible validation: Check critical fields only
            const validation = SellWorkflowService.validateWorkflowData(payload, false);
            const result = await SellWorkflowService.createCarListing(payload, userId);
            // ✅ CRITICAL FIX: Handle both string (carId) and object (with redirectUrl) responses
            const carId = typeof result === 'string' ? result : result.carId;
            const redirectUrl = typeof result === 'object' && result.redirectUrl
                ? result.redirectUrl
                : '/profile/my-ads'; // Fallback
            // Clear workflow data
            clearWorkflowData();
            localStorage.removeItem('current_draft_id');
            // Success message with toast
            toast.success(getErrorMessage('PUBLISHED_SUCCESS', language), {
                autoClose: 3000,
                position: 'top-center'
            });
            if (process.env.NODE_ENV === 'development') {
                logger.debug('Car listing published successfully', { carId, redirectUrl });
            }
            setTimeout(() => {
                // ✅ CRITICAL FIX: Navigate to numeric car URL instead of profile
                navigate(redirectUrl);
            }, 800);
        }
        catch (error) {
            logger.error('Error creating listing', error, {
                userId: currentUser === null || currentUser === void 0 ? void 0 : currentUser.uid,
                errorMessage: error.message
            });
            setError(error.message || (language === 'bg'
                ? 'Възникна грешка при създаване на обявата'
                : 'Error creating listing'));
            setIsSubmitting(false);
        }
    };
    // Handle mobile form submission (navigate to preview)
    const handleMobileSubmit = async () => {
        var _a;
        if (!canContinue)
            return;
        const params = new URLSearchParams(searchParams.toString());
        Object.entries({
            name: contactData.sellerName,
            phone: contactData.sellerPhone,
            email: contactData.sellerEmail,
            city: (_a = contactData.locationData) === null || _a === void 0 ? void 0 : _a.cityName,
            zipCode: contactData.postalCode
        }).forEach(([key, value]) => {
            if (value)
                params.set(key, value);
        });
        // Navigate to preview/confirmation page
        navigate(`/sell/inserat/${vehicleType || 'car'}/preview?${params.toString()}`);
    };
    const canContinue = !!(contactData.sellerName &&
        contactData.sellerPhone &&
        contactData.sellerEmail);
    const workflowSteps = [
        { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
        { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
        { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
        { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
        { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: true },
        { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: true },
        { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
        { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
    ];
    // Flexible validation: Allow publishing with partial data
    const isFormValid = true;
    // Render mobile version
    if (isMobile) {
        return (_jsx(React.Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsxs(MobileContactStyles.default.PageWrapper, { children: [_jsx(MobileHeader, {}), _jsx("div", { style: { padding: '0.75rem 1rem 0' }, children: _jsx(SellProgressBar, { currentStep: "contact" }) }), _jsx(MobileContactStyles.default.ContentWrapper, { children: _jsx(MobileContainer, { maxWidth: "md", children: _jsxs(MobileStack, { spacing: "lg", children: [_jsxs(MobileContactStyles.default.HeaderSection, { children: [_jsx(MobileContactStyles.default.PageTitle, { children: language === 'bg' ? 'Контактна информация' : 'Contact Information' }), _jsx(MobileContactStyles.default.PageSubtitle, { children: language === 'bg'
                                                    ? 'Въведете данни за контакт'
                                                    : 'Enter contact details' })] }), _jsx(MobileContactStyles.default.Card, { children: _jsxs(MobileContactStyles.default.Grid, { children: [_jsxs(MobileContactStyles.default.FieldGroup, { children: [_jsx(MobileContactStyles.default.Label, { htmlFor: "name", "$required": true, children: language === 'bg' ? 'Име' : 'Name' }), _jsx(MobileContactStyles.default.Input, { id: "name", type: "text", value: contactData.sellerName, onChange: (e) => handleFieldChange('sellerName', e.target.value), placeholder: language === 'bg' ? 'Вашето име' : 'Your name' })] }), _jsxs(MobileContactStyles.default.FieldGroup, { children: [_jsx(MobileContactStyles.default.Label, { htmlFor: "phone", "$required": true, children: language === 'bg' ? 'Телефон' : 'Phone' }), _jsx(MobileContactStyles.default.Input, { id: "phone", type: "tel", inputMode: "tel", value: contactData.sellerPhone, onChange: (e) => handleFieldChange('sellerPhone', e.target.value), placeholder: "+359 888 123 456" })] }), _jsxs(MobileContactStyles.default.FieldGroup, { children: [_jsx(MobileContactStyles.default.Label, { htmlFor: "email", "$required": true, children: language === 'bg' ? 'Имейл' : 'Email' }), _jsx(MobileContactStyles.default.Input, { id: "email", type: "email", inputMode: "email", value: contactData.sellerEmail, onChange: (e) => handleFieldChange('sellerEmail', e.target.value), placeholder: "email@example.com" })] }), _jsxs(MobileContactStyles.default.FieldGroup, { children: [_jsx(MobileContactStyles.default.Label, { htmlFor: "city", children: language === 'bg' ? 'Град' : 'City' }), _jsx(MobileContactStyles.default.Input, { id: "city", type: "text", value: (_b = contactData.locationData) === null || _b === void 0 ? void 0 : _b.cityName, onChange: (e) => handleCityChange(e.target.value), placeholder: language === 'bg' ? 'Вашият град' : 'Your city' })] }), _jsxs(MobileContactStyles.default.FieldGroup, { children: [_jsx(MobileContactStyles.default.Label, { htmlFor: "zipCode", children: language === 'bg' ? 'Пощенски код' : 'Postal Code' }), _jsx(MobileContactStyles.default.Input, { id: "zipCode", type: "text", inputMode: "numeric", value: contactData.postalCode, onChange: (e) => handleFieldChange('postalCode', e.target.value), placeholder: "1000" })] })] }) }), _jsx(MobileContactStyles.default.Card, { children: _jsxs(MobileContactStyles.default.FieldGroup, { children: [_jsx(MobileContactStyles.default.Label, { children: language === 'bg' ? 'Описание на превозното средство' : 'Vehicle Description' }), _jsx(MobileContactStyles.default.TextArea, { value: contactData.notes || '', onChange: (e) => handleFieldChange('notes', e.target.value), placeholder: language === 'bg'
                                                        ? 'Опишете подробно вашето превозно средство: състояние, особености, оборудване, история на обслужването и всичко друго, което купувачът трябва да знае...'
                                                        : 'Describe your vehicle in detail: condition, features, equipment, service history and everything else a buyer should know...', rows: 8 }), _jsx(MobileContactStyles.default.HelpText, { style: { marginTop: '0.5rem' }, children: language === 'bg'
                                                        ? 'Детайлното описание помага на купувачите да разберат по-добре вашето превозно средство и увеличава шансовете за продажба.'
                                                        : 'A detailed description helps buyers better understand your vehicle and increases the chances of sale.' })] }) }), _jsxs(MobileContactStyles.default.InfoCard, { children: [_jsx(MobileContactStyles.default.InfoTitle, { children: language === 'bg' ? 'Важна информация' : 'Important Information' }), _jsx(MobileContactStyles.default.InfoText, { children: language === 'bg'
                                                    ? 'Вашите данни за контакт ще бъдат видими само за купувачите, които проявят интерес към обявата ви.'
                                                    : 'Your contact details will only be visible to buyers who show interest in your listing.' })] })] }) }) }), _jsx(MobileContactStyles.default.StickyFooter, { children: _jsx(MobileContactStyles.default.PrimaryButton, { "$enabled": canContinue, onClick: handleMobileSubmit, disabled: !canContinue, children: language === 'bg' ? 'Продължи' : 'Continue' }) })] }) }));
    }
    // Render desktop version
    return (_jsx(React.Suspense, { fallback: _jsx("div", { children: "Loading..." }), children: _jsx(UnifiedContactStyles.default.Container, { children: _jsx(SplitScreenLayout, { leftContent: _jsxs(UnifiedContactStyles.default.ContentSection, { children: [_jsxs(UnifiedContactStyles.default.HeaderCard, { children: [_jsx(UnifiedContactStyles.default.Title, { children: language === 'bg' ? 'Контактна информация' : 'Contact Information' }), _jsx(UnifiedContactStyles.default.Subtitle, { children: language === 'bg'
                                        ? 'Въведете данни за контакт и местоположение'
                                        : 'Enter contact and location details' })] }), _jsxs(UnifiedContactStyles.default.NavigationButtons, { children: [_jsx(UnifiedContactStyles.default.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: language === 'bg' ? 'Назад' : 'Back' }), _jsx(UnifiedContactStyles.default.Button, { type: "button", "$variant": "secondary", onClick: () => saveDraft(true), disabled: isSaving, children: language === 'bg' ? 'Запази' : 'Save Draft' }), _jsx(UnifiedContactStyles.default.Button, { type: "button", "$variant": "primary", onClick: handlePublish, disabled: isSubmitting, children: isSubmitting
                                        ? (language === 'bg' ? 'Публикуване...' : 'Publishing...')
                                        : (language === 'bg' ? 'Публикувай обявата' : 'Publish Listing') })] }), _jsx(ReviewSummary, { workflowData: workflowData, imagesCount: workflowData.imagesCount || 0, language: language, onEdit: () => navigate(-1) }), _jsxs(UnifiedContactStyles.default.SectionCard, { children: [_jsx(UnifiedContactStyles.default.SectionTitle, { children: language === 'bg' ? 'Ценова информация' : 'Pricing Information' }), _jsxs(UnifiedContactStyles.default.CompactGrid, { children: [_jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Цена' : 'Price' }), _jsx(UnifiedContactStyles.default.Input, { type: "number", value: pricingData.price, onChange: (e) => handlePricingChange('price', e.target.value), placeholder: language === 'bg' ? 'Въведете цена' : 'Enter price', required: true, min: "100", max: "1000000" })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Валута' : 'Currency' }), _jsx(SelectWithOther, { options: CURRENCIES, value: pricingData.currency, onChange: (value) => handlePricingChange('currency', value), placeholder: language === 'bg' ? 'Изберете валута' : 'Select currency', label: language === 'bg' ? 'Валута' : 'Currency', required: true })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Тип цена' : 'Price Type' }), _jsx(SelectWithOther, { options: PRICE_TYPES, value: pricingData.priceType, onChange: (value) => handlePricingChange('priceType', value), placeholder: language === 'bg' ? 'Изберете тип цена' : 'Select price type', label: language === 'bg' ? 'Тип цена' : 'Price Type', required: true })] }), _jsx(UnifiedContactStyles.default.FormGroup, { children: _jsxs(UnifiedContactStyles.default.Label, { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx("input", { type: "checkbox", checked: pricingData.negotiable, onChange: (e) => handlePricingChange('negotiable', e.target.checked), style: { width: 'auto', cursor: 'pointer' } }), language === 'bg' ? 'Договаряне възможно' : 'Negotiable'] }) })] })] }), _jsxs(UnifiedContactStyles.default.SectionCard, { children: [_jsx(UnifiedContactStyles.default.SectionTitle, { children: language === 'bg' ? 'Лична информация' : 'Personal Information' }), _jsxs(UnifiedContactStyles.default.CompactGrid, { children: [_jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Име' : 'Name' }), _jsx(UnifiedContactStyles.default.Input, { type: "text", value: contactData.sellerName, onChange: (e) => handleFieldChange('sellerName', e.target.value), placeholder: language === 'bg' ? 'Вашето име' : 'Your name' })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Имейл' : 'Email' }), _jsx(UnifiedContactStyles.default.Input, { type: "email", value: contactData.sellerEmail, onChange: (e) => handleFieldChange('sellerEmail', e.target.value), placeholder: language === 'bg' ? 'вашият@имейл.com' : 'your@email.com' })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Телефон' : 'Phone' }), _jsx(UnifiedContactStyles.default.Input, { type: "tel", value: contactData.sellerPhone, onChange: (e) => handleFieldChange('sellerPhone', e.target.value), placeholder: "+359 888 123 456" })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { children: language === 'bg' ? 'Допълнителен телефон' : 'Additional Phone' }), _jsx(UnifiedContactStyles.default.Input, { type: "tel", value: contactData.additionalPhone, onChange: (e) => handleFieldChange('additionalPhone', e.target.value), placeholder: language === 'bg' ? '+359 888 654 321' : '+359 888 654 321' })] })] })] }), _jsxs(UnifiedContactStyles.default.SectionCard, { children: [_jsx(UnifiedContactStyles.default.SectionTitle, { children: language === 'bg' ? 'Местоположение' : 'Location' }), _jsxs(UnifiedContactStyles.default.CompactGrid, { children: [_jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Област' : 'Region' }), _jsx(SelectWithOther, { options: availableRegions.map(region => ({
                                                        value: region.name,
                                                        label: region.name,
                                                        labelEn: region.nameEn
                                                    })), value: contactData.region, onChange: (value) => handleFieldChange('region', value), placeholder: language === 'bg' ? 'Изберете област' : 'Select region', label: language === 'bg' ? 'Област' : 'Region', required: true })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { "$required": true, children: language === 'bg' ? 'Град' : 'City' }), _jsx(SelectWithOther, { options: availableCities.map(city => ({
                                                        value: city.name,
                                                        label: city.name,
                                                        labelEn: city.nameEn || city.name
                                                    })), value: (_c = contactData.locationData) === null || _c === void 0 ? void 0 : _c.cityName, onChange: (value) => handleCityChange(value), placeholder: language === 'bg' ? 'Изберете град' : 'Select city', label: language === 'bg' ? 'Град' : 'City', required: true, disabled: !contactData.region, otherPlaceholder: language === 'bg' ? 'Въведете град' : 'Enter city name' })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { children: language === 'bg' ? 'Пощенски код' : 'Postal Code' }), _jsx(UnifiedContactStyles.default.Input, { type: "text", value: contactData.postalCode, onChange: (e) => handleFieldChange('postalCode', e.target.value), placeholder: "1000" })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { children: language === 'bg' ? 'Точно местоположение' : 'Exact Location' }), _jsx(UnifiedContactStyles.default.Input, { type: "text", value: contactData.location, onChange: (e) => handleFieldChange('location', e.target.value), placeholder: language === 'bg' ? 'Улица, номер' : 'Street, number' })] })] })] }), _jsxs(UnifiedContactStyles.default.SectionCard, { children: [_jsx(UnifiedContactStyles.default.SectionTitle, { children: language === 'bg' ? 'Предпочитан начин на контакт' : 'Preferred Contact Method' }), _jsx(UnifiedContactStyles.default.ContactMethodsContainer, { children: CONTACT_METHODS.map(method => {
                                        const isSelected = contactData.preferredContact.includes(method.id);
                                        const IconComponent = ContactIcons[method.icon];
                                        return (_jsxs(UnifiedContactStyles.default.ContactMethodButton, { type: "button", "$selected": isSelected, onClick: () => toggleContactMethod(method.id), children: [_jsx(IconComponent, {}), _jsx("span", { children: method.label[language] })] }, method.id));
                                    }) }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { children: language === 'bg' ? 'Предпочитани часове за контакт' : 'Preferred Contact Hours' }), _jsx(SelectWithOther, { options: AVAILABLE_HOURS, value: contactData.availableHours, onChange: (value) => handleFieldChange('availableHours', value), placeholder: language === 'bg' ? 'Изберете часове' : 'Select hours', label: language === 'bg' ? 'Часове' : 'Hours' })] }), _jsxs(UnifiedContactStyles.default.FormGroup, { children: [_jsx(UnifiedContactStyles.default.Label, { children: language === 'bg' ? 'Описание на превозното средство' : 'Vehicle Description' }), _jsx(UnifiedContactStyles.default.TextArea, { value: contactData.notes || '', onChange: (e) => handleFieldChange('notes', e.target.value), placeholder: language === 'bg'
                                                ? 'Опишете подробно вашето превозно средство: състояние, особености, оборудване, история на обслужването и всичко друго, което купувачът трябва да знае...'
                                                : 'Describe your vehicle in detail: condition, features, equipment, service history and everything else a buyer should know...', rows: 8, style: { minHeight: '150px', resize: 'vertical' } }), _jsx(UnifiedContactStyles.default.HelpText, { style: { marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }, children: language === 'bg'
                                                ? 'Детайлното описание помага на купувачите да разберат по-добре вашето превозно средство и увеличава шансовете за продажба.'
                                                : 'A detailed description helps buyers better understand your vehicle and increases the chances of sale.' })] })] })] }), rightContent: null }) }) }));
};
export default ContactPageUnified;
