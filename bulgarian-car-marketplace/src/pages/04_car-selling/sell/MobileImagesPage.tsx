// Mobile Images Upload Page with AI Analysis
// Purpose: Photo upload for vehicle listing on mobile/tablet
// Mobile-first; no emojis; <300 lines

import React, { useState, useCallback, useEffect } from 'react';
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
import WorkflowPersistenceService from '../../../services/workflowPersistenceService';

const MAX_IMAGES = 20;

const ProgressWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded: boolean;
  aiAnalysis?: {
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    confidence?: number;
  };
}

const MobileImagesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const { user } = useAuth();
  const toast = useToast();
  
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    SellWorkflowStepStateService.markPending('images');
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
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

  const analyzeFirstImage = async (image: ImageFile) => {
    if (!geminiVisionService.isReady()) return;

    setAnalyzing(true);
    try {
      const result = await geminiVisionService.analyzeCarImage(image.file, user?.uid);
      
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { ...img, aiAnalysis: {
              make: result.make,
              model: result.model,
              year: result.year,
              color: result.color,
              confidence: result.confidence
            }}
          : img
      ));

      if (result.confidence > 70) {
        toast.success(`AI detected: ${result.make} ${result.model} (${result.confidence}% confident)`);
      }
    } catch (error: any) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        toast.warning('AI quota exceeded. Upgrade for more analysis.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemoveImage = (id: string) => {
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
    if (images.length === 0) return;

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
    const hasPersistedImages =
      WorkflowPersistenceService.getImages().length > 0;

    if (images.length > 0 || hasPersistedImages) {
      SellWorkflowStepStateService.markCompleted('images');
    } else {
      SellWorkflowStepStateService.markPending('images');
    }
  }, [images.length]);

  return (
    <S.PageWrapper>
      <MobileHeader />
      <ProgressWrapper>
        <SellProgressBar currentStep="images" />
      </ProgressWrapper>

      <S.ContentWrapper>
        <MobileContainer maxWidth="md">
          <MobileStack spacing="lg">
            <S.HeaderSection>
              <S.PageTitle>{t('sell.images.title')}</S.PageTitle>
              <S.PageSubtitle>{t('sell.images.subtitle')}</S.PageSubtitle>
            </S.HeaderSection>

            <S.InfoCard>
              <S.InfoTitle>{t('sell.images.infoTitle')}</S.InfoTitle>
              <S.InfoText>{t('sell.images.infoText')}</S.InfoText>
            </S.InfoCard>

            {analyzing && (
              <AIAnalysisCard>
                <AIIcon>🤖</AIIcon>
                <AIText>AI is analyzing your car image...</AIText>
              </AIAnalysisCard>
            )}

            {images[0]?.aiAnalysis && images[0].aiAnalysis.confidence && images[0].aiAnalysis.confidence > 60 && (
              <AIResultCard>
                <AIResultHeader>
                  <span>AI Detection</span>
                  <ConfidenceBadge confidence={images[0].aiAnalysis.confidence}>
                    {images[0].aiAnalysis.confidence}% confident
                  </ConfidenceBadge>
                </AIResultHeader>
                <AIResultDetails>
                  <DetailItem>
                    <Label>Make:</Label>
                    <Value>{images[0].aiAnalysis.make}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Model:</Label>
                    <Value>{images[0].aiAnalysis.model}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Year:</Label>
                    <Value>{images[0].aiAnalysis.year}</Value>
                  </DetailItem>
                  <DetailItem>
                    <Label>Color:</Label>
                    <Value>{images[0].aiAnalysis.color}</Value>
                  </DetailItem>
                </AIResultDetails>
              </AIResultCard>
            )}

            <S.UploadArea>
              <S.FileInput
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={images.length >= MAX_IMAGES}
              />
              <S.UploadLabel htmlFor="image-upload">
                <S.UploadIcon>+</S.UploadIcon>
                <S.UploadText>
                  {t('sell.images.addPhotos')}
                </S.UploadText>
                <S.UploadHint>
                    {t('sell.images.maxPhotos')}
                </S.UploadHint>
              </S.UploadLabel>
            </S.UploadArea>

            {images.length > 0 && (
              <S.ImagesGrid>
                {images.map((image) => (
                  <S.ImageCard key={image.id}>
                    <S.ImagePreview src={image.preview} alt="Preview" />
                    <S.RemoveButton onClick={() => handleRemoveImage(image.id)}>
                      ×
                    </S.RemoveButton>
                  </S.ImageCard>
                ))}
              </S.ImagesGrid>
            )}

            <S.Counter>
                {`${images.length} / ${MAX_IMAGES} ${t('sell.images.photos')}`}
            </S.Counter>
          </MobileStack>
        </MobileContainer>
      </S.ContentWrapper>

      <S.StickyFooter>
        {canContinue ? (
          <S.PrimaryButton
            onClick={handleContinue}
            disabled={uploading}
          >
            {uploading ? t('sell.images.uploading') : t('sell.start.continue')}
          </S.PrimaryButton>
        ) : (
          <S.SkipButton onClick={handleSkip}>
            {t('sell.images.skipPhotos')}
          </S.SkipButton>
        )}
      </S.StickyFooter>
    </S.PageWrapper>
  );
};

const AIAnalysisCard = styled.div`
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

const AIIcon = styled.span`
  font-size: 24px;
`;

const AIText = styled.span`
  font-weight: 500;
`;

const AIResultCard = styled.div`
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
`;

const AIResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #1a1a1a;
`;

const ConfidenceBadge = styled.span<{ confidence: number }>`
  background: ${p => p.confidence > 80 ? '#10b981' : p.confidence > 60 ? '#f59e0b' : '#ef4444'};
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const AIResultDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const Value = styled.span`
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
`;

export default MobileImagesPage;
