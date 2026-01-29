import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Mobile Images Upload Page with AI Analysis
// Purpose: Photo upload for vehicle listing on mobile/tablet
// Mobile-first; no emojis; <300 lines
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MobileContainer, MobileStack } from '../../../components/ui/mobile-index';
import { MobileHeader } from '../../../components/layout/MobileHeader';
import { S } from './MobileImagesPage.styles';
import { geminiVisionService } from '../../../services/ai/gemini-vision.service';
import { useAuth } from '../../../contexts/AuthProvider';
import { useToast } from '../../../components/Toast';
import styled from 'styled-components';
import { SellProgressBar } from '../../../components/SellWorkflow';
import SellWorkflowStepStateService from '../../../services/sellWorkflowStepState';
import { WorkflowPersistenceService } from '../../../services/unified-workflow-persistence.service';
const MAX_IMAGES = 20;
const ProgressWrapper = styled.div `
  padding: 0.75rem 1rem 0;
`;
const MobileImagesPage = () => {
    var _a;
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { vehicleType = 'car' } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    useEffect(() => {
        SellWorkflowStepStateService.markPending('images');
    }, []);
    // ✅ FIX: Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach(img => {
                if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, [images]);
    const handleFileSelect = useCallback(async (event) => {
        const files = event.target.files;
        if (!files)
            return;
        const newImages = [];
        const remainingSlots = MAX_IMAGES - images.length;
        const filesToAdd = Math.min(files.length, remainingSlots);
        for (let i = 0; i < filesToAdd; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                newImages.push({
                    id: `${Date.now()}-${i}`,
                    file,
                    preview: URL.createObjectURL(file),
                    uploaded: false
                });
            }
        }
        setImages(prev => [...prev, ...newImages]);
        // AI Analysis for first image
        if (aiEnabled && newImages.length > 0 && images.length === 0) {
            analyzeFirstImage(newImages[0]);
        }
    }, [images.length, aiEnabled]);
    const analyzeFirstImage = async (image) => {
        if (!geminiVisionService.isReady())
            return;
        setAnalyzing(true);
        try {
            const result = await geminiVisionService.analyzeCarImage(image.file, user === null || user === void 0 ? void 0 : user.uid);
            setImages(prev => prev.map(img => img.id === image.id
                ? Object.assign(Object.assign({}, img), { aiAnalysis: {
                        make: result.make,
                        model: result.model,
                        year: result.year,
                        color: result.color,
                        confidence: result.confidence
                    } }) : img));
            if (result.confidence > 70) {
                toast.success(`AI detected: ${result.make} ${result.model} (${result.confidence}% confident)`);
            }
        }
        catch (error) {
            if (error.message.includes('quota') || error.message.includes('limit')) {
                toast.warning('AI quota exceeded. Upgrade for more analysis.');
            }
        }
        finally {
            setAnalyzing(false);
        }
    };
    const handleRemoveImage = (id) => {
        setImages(prev => {
            const updated = prev.filter(img => img.id !== id);
            const removed = prev.find(img => img.id === id);
            if (removed) {
                URL.revokeObjectURL(removed.preview);
            }
            return updated;
        });
    };
    const handleContinue = async () => {
        if (images.length === 0)
            return;
        setUploading(true);
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        const params = new URLSearchParams(searchParams.toString());
        // ✅ NEW ROUTE: Navigate to pricing page
        navigate(`/sell/inserat/${vehicleType}/pricing?${params.toString()}`);
    };
    const handleSkip = () => {
        const params = new URLSearchParams(searchParams.toString());
        // ✅ NEW ROUTE: Navigate to pricing page
        navigate(`/sell/inserat/${vehicleType}/pricing?${params.toString()}`);
    };
    const canContinue = images.length > 0;
    useEffect(() => {
        const hasPersistedImages = WorkflowPersistenceService.getImages().length > 0;
        if (images.length > 0 || hasPersistedImages) {
            SellWorkflowStepStateService.markCompleted('images');
        }
        else {
            SellWorkflowStepStateService.markPending('images');
        }
    }, [images.length]);
    return (_jsxs(S.PageWrapper, { children: [_jsx(MobileHeader, {}), _jsx(ProgressWrapper, { children: _jsx(SellProgressBar, { currentStep: "images" }) }), _jsx(S.ContentWrapper, { children: _jsx(MobileContainer, { maxWidth: "md", children: _jsxs(MobileStack, { spacing: "lg", children: [_jsxs(S.HeaderSection, { children: [_jsx(S.PageTitle, { children: t('sell.images.title') }), _jsx(S.PageSubtitle, { children: t('sell.images.subtitle') })] }), _jsxs(S.InfoCard, { children: [_jsx(S.InfoTitle, { children: t('sell.images.infoTitle') }), _jsx(S.InfoText, { children: t('sell.images.infoText') })] }), analyzing && (_jsxs(AIAnalysisCard, { children: [_jsx(AIIcon, { children: "\uD83E\uDD16" }), _jsx(AIText, { children: "AI is analyzing your car image..." })] })), ((_a = images[0]) === null || _a === void 0 ? void 0 : _a.aiAnalysis) && images[0].aiAnalysis.confidence && images[0].aiAnalysis.confidence > 60 && (_jsxs(AIResultCard, { children: [_jsxs(AIResultHeader, { children: [_jsx("span", { children: "AI Detection" }), _jsxs(ConfidenceBadge, { confidence: images[0].aiAnalysis.confidence, children: [images[0].aiAnalysis.confidence, "% confident"] })] }), _jsxs(AIResultDetails, { children: [_jsxs(DetailItem, { children: [_jsx(Label, { children: "Make:" }), _jsx(Value, { children: images[0].aiAnalysis.make })] }), _jsxs(DetailItem, { children: [_jsx(Label, { children: "Model:" }), _jsx(Value, { children: images[0].aiAnalysis.model })] }), _jsxs(DetailItem, { children: [_jsx(Label, { children: "Year:" }), _jsx(Value, { children: images[0].aiAnalysis.year })] }), _jsxs(DetailItem, { children: [_jsx(Label, { children: "Color:" }), _jsx(Value, { children: images[0].aiAnalysis.color })] })] })] })), _jsxs(S.UploadArea, { children: [_jsx(S.FileInput, { type: "file", id: "image-upload", accept: "image/*", multiple: true, onChange: handleFileSelect, disabled: images.length >= MAX_IMAGES }), _jsxs(S.UploadLabel, { htmlFor: "image-upload", children: [_jsx(S.UploadIcon, { children: "+" }), _jsx(S.UploadText, { children: t('sell.images.addPhotos') }), _jsx(S.UploadHint, { children: t('sell.images.maxPhotos') })] })] }), images.length > 0 && (_jsx(S.ImagesGrid, { children: images.map((image) => (_jsxs(S.ImageCard, { children: [_jsx(S.ImagePreview, { src: image.preview, alt: "Preview" }), _jsx(S.RemoveButton, { onClick: () => handleRemoveImage(image.id), children: "\u00D7" })] }, image.id))) })), _jsx(S.Counter, { children: `${images.length} / ${MAX_IMAGES} ${t('sell.images.photos')}` })] }) }) }), _jsx(S.StickyFooter, { children: canContinue ? (_jsx(S.PrimaryButton, { onClick: handleContinue, disabled: uploading, children: uploading ? t('sell.images.uploading') : t('common.next') })) : (_jsx(S.SkipButton, { onClick: handleSkip, children: t('sell.images.skipPhotos') })) })] }));
};
const AIAnalysisCard = styled.div `
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;
const AIIcon = styled.span `
  font-size: 24px;
`;
const AIText = styled.span `
  font-weight: 500;
`;
const AIResultCard = styled.div `
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
`;
const AIResultHeader = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #1a1a1a;
`;
const ConfidenceBadge = styled.span `
  background: ${p => p.confidence > 80 ? '#10b981' : p.confidence > 60 ? '#f59e0b' : '#ef4444'};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;
const AIResultDetails = styled.div `
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;
const DetailItem = styled.div `
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const Label = styled.span `
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;
const Value = styled.span `
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
`;
export default MobileImagesPage;
