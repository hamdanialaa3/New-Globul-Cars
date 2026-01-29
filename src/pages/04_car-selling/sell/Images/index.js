import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Images Upload Page with Workflow
// صفحة رفع الصور مع الأتمتة
// File Size: ~250 lines ✅
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { logger } from '../../../../services/logger-service';
import SplitScreenLayout from '../../../../components/SplitScreenLayout';
import { WorkflowFlow } from '../../../../components/WorkflowVisualization';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import * as S from './styles';
import { SellWorkflowLayout } from '../../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../../services/sellWorkflowStepState';
import { WorkflowPersistenceService } from '../../../../services/unified-workflow-persistence.service';
import { useImagesWorkflow } from './useImagesWorkflow';
import { toast } from 'react-toastify';
const ImagesPageNew = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const [isDragOver, setIsDragOver] = useState(false);
    const { files, hasImages, addFiles, removeFile, saveImages } = useImagesWorkflow();
    // ✅ FIX: Track preview URLs for cleanup
    const previewUrlsRef = useRef(new Map());
    const vehicleType = searchParams.get('vt');
    const make = searchParams.get('mk');
    useEffect(() => {
        SellWorkflowStepStateService.markPending('images');
        // Check storage usage and warn if high
        const storageUsage = WorkflowPersistenceService.getStorageUsage();
        if (storageUsage.percentage > 80) {
            logger.warn('High localStorage usage detected', storageUsage);
            toast.warn(language === 'bg'
                ? 'تحذير: استخدام تخزين عالي. قد تواجه مشاكل في حفظ الصور.'
                : 'Warning: High storage usage. You may experience issues saving images.', {
                autoClose: 10000
            });
        }
    }, [language]);
    useEffect(() => {
        const hasPersistedImages = WorkflowPersistenceService.getImages().length > 0;
        if (files.length > 0 || hasPersistedImages) {
            SellWorkflowStepStateService.markCompleted('images');
        }
        else {
            SellWorkflowStepStateService.markPending('images');
        }
    }, [files.length]);
    // ✅ FIX: Create and cleanup preview URLs
    useEffect(() => {
        // Revoke old URLs
        previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        previewUrlsRef.current.clear();
        // Create new URLs
        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            previewUrlsRef.current.set(index, url);
        });
        // Cleanup on unmount or files change
        return () => {
            previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
            previewUrlsRef.current.clear();
        };
    }, [files]);
    const handleFileSelect = (e) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        addFiles(droppedFiles);
    };
    const handleContinue = async () => {
        if (files.length === 0) {
            toast.error(language === 'bg'
                ? 'Моля, качете поне една снимка!'
                : 'Please upload at least one photo!');
            return;
        }
        try {
            await saveImages();
            logger.info('Images saved successfully', { count: files.length, vehicleType });
            const params = new URLSearchParams(searchParams.toString());
            params.set('images', files.length.toString());
            // ✅ NEW ROUTE: Navigate to pricing page
            navigate(`/sell/inserat/${vehicleType || 'car'}/pricing?${params.toString()}`);
        }
        catch (error) {
            logger.error('Error saving images', error, { vehicleType });
            // Show user-friendly error with retry option
            toast.error(language === 'bg'
                ? 'Възникна грешка при запазване на снимките. Опитайте отново.'
                : 'Error saving images. Please try again.', {
                autoClose: 5000,
                onClick: () => handleContinue() // Allow retry on click
            });
        }
    };
    const workflowSteps = [
        { id: 'vehicle', label: language === 'bg' ? 'Тип' : 'Type', icon: undefined, isCompleted: true },
        { id: 'seller', label: language === 'bg' ? 'Продавач' : 'Seller', icon: undefined, isCompleted: true },
        { id: 'data', label: language === 'bg' ? 'Данни' : 'Data', icon: undefined, isCompleted: true },
        { id: 'equipment', label: language === 'bg' ? 'Оборудване' : 'Equipment', icon: undefined, isCompleted: true },
        { id: 'images', label: language === 'bg' ? 'Снимки' : 'Images', icon: undefined, isCompleted: false },
        { id: 'pricing', label: language === 'bg' ? 'Цена' : 'Price', icon: undefined, isCompleted: false },
        { id: 'contact', label: language === 'bg' ? 'Контакт' : 'Contact', icon: undefined, isCompleted: false },
        { id: 'publish', label: language === 'bg' ? 'Публикуване' : 'Publish', icon: undefined, isCompleted: false }
    ];
    const leftContent = (_jsxs(S.ContentSection, { children: [_jsxs(S.HeaderCard, { children: [_jsx(S.Title, { children: language === 'bg' ? 'Снимки на превозното средство' : 'Vehicle Photos' }), _jsx(S.Subtitle, { children: language === 'bg'
                            ? 'Качете до 20 снимки на вашето превозно средство'
                            : 'Upload up to 20 photos of your vehicle' }), _jsx(S.BrandOrbitInline, { children: _jsx(WorkflowFlow, { variant: "inline", currentStepIndex: 3, totalSteps: 8, carBrand: make || undefined, language: language }) })] }), _jsxs(S.NavigationButtons, { children: [_jsxs(S.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: ["\u2190 ", language === 'bg' ? 'Назад' : 'Back'] }), _jsxs(S.Button, { type: "button", "$variant": "primary", onClick: handleContinue, children: [language === 'bg' ? 'Продължи' : 'Continue', " \u2192"] })] }), _jsxs(S.UploadCard, { "$isDragOver": isDragOver, onDragOver: (e) => { e.preventDefault(); setIsDragOver(true); }, onDragLeave: () => setIsDragOver(false), onDrop: handleDrop, children: [_jsx(S.UploadIcon, { children: _jsx(Upload, { size: 48 }) }), _jsx(S.UploadText, { children: language === 'bg'
                            ? 'Плъзнете снимки тук или кликнете за избор'
                            : 'Drag photos here or click to select' }), _jsx(S.FileInput, { type: "file", accept: "image/*", multiple: true, onChange: handleFileSelect }), _jsxs(S.UploadButton, { as: "label", htmlFor: "file-upload", children: [_jsx(ImageIcon, { size: 20 }), language === 'bg' ? 'Избери снимки' : 'Choose Photos'] }), _jsx("input", { id: "file-upload", type: "file", accept: "image/*", multiple: true, onChange: handleFileSelect, style: { display: 'none' } })] }), files.length > 0 && (_jsx(S.PreviewGrid, { children: files.map((file, index) => (_jsxs(S.PreviewCard, { children: [_jsx(S.PreviewImage, { src: previewUrlsRef.current.get(index) || '', alt: `Preview ${index + 1}` }), _jsx(S.RemoveButton, { onClick: () => removeFile(index), children: _jsx(X, { size: 16 }) }), _jsx(S.ImageNumber, { children: index + 1 })] }, index))) })), _jsxs(S.InfoBox, { children: ["\uD83D\uDCF8 ", language === 'bg'
                        ? `${files.length}/20 снимки избрани`
                        : `${files.length}/20 photos selected`, _jsx("br", {}), language === 'bg'
                        ? 'Първата снимка ще бъде основната'
                        : 'First photo will be the main one'] }), _jsxs(S.NavigationButtons, { children: [_jsxs(S.Button, { type: "button", "$variant": "secondary", onClick: () => navigate(-1), children: ["\u2190 ", language === 'bg' ? 'Назад' : 'Back'] }), _jsxs(S.Button, { type: "button", "$variant": "primary", onClick: handleContinue, children: [language === 'bg' ? 'Продължи' : 'Continue', " \u2192"] })] })] }));
    return (_jsx(SellWorkflowLayout, { currentStep: "images", children: _jsx(SplitScreenLayout, { leftContent: leftContent }) }));
};
export default ImagesPageNew;
