// Unified Images Upload Page - Responsive Design
// صفحة رفع الصور الموحدة - تصميم متجاوب
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { SellProgressBar } from '@/components/SellWorkflow';
import SellWorkflowStepStateService from '@/services/sellWorkflowStepState';
import WorkflowPersistenceService from '@/services/workflowPersistenceService';
import { useImagesWorkflow } from './Images/useImagesWorkflow';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

// Mobile Styles
const MobileContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  ${props => props.theme.mobileMixins?.safeAreaPadding || ''};
`;

const MobileContent = styled.div`
  padding: ${props => props.theme.mobileSpacing?.md || '1rem'};
`;

const MobileHeader = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.mobileSpacing?.lg || '1.5rem'};
`;

const MobileTitle = styled.h1`
  font-size: ${props => props.theme.mobileTypography?.h2?.fontSize || '1.5rem'};
  font-weight: ${props => props.theme.mobileTypography?.h2?.fontWeight || '600'};
  color: var(--text-primary);
  margin: 0;
`;

const MobileUploadArea = styled.div<{ isDragOver: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? 'var(--accent-primary)' : 'var(--border)'};
  border-radius: ${props => props.theme.mobileBorderRadius?.lg || '12px'};
  padding: ${props => props.theme.mobileSpacing?.xl || '2rem'};
  text-align: center;
  background: var(--bg-card);
  margin-bottom: ${props => props.theme.mobileSpacing?.lg || '1.5rem'};
  transition: all 0.2s ease;
`;

const MobileUploadIcon = styled.div`
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: ${props => props.theme.mobileSpacing?.md || '1rem'};
`;

const MobileUploadText = styled.p`
  font-size: ${props => props.theme.mobileTypography?.body?.fontSize || '1rem'};
  color: var(--text-secondary);
  margin: 0 0 ${props => props.theme.mobileSpacing?.sm || '0.5rem'} 0;
`;

const MobileUploadHint = styled.p`
  font-size: ${props => props.theme.mobileTypography?.small?.fontSize || '0.875rem'};
  color: var(--text-muted);
  margin: 0;
`;

const MobileImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.mobileSpacing?.md || '1rem'};
  margin-bottom: ${props => props.theme.mobileSpacing?.lg || '1.5rem'};
`;

const MobileImageCard = styled.div`
  position: relative;
  aspect-ratio: 4/3;
  border-radius: ${props => props.theme.mobileBorderRadius?.md || '8px'};
  overflow: hidden;
  background: var(--bg-secondary);
`;

const MobileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MobileRemoveButton = styled.button`
  position: absolute;
  top: ${props => props.theme.mobileSpacing?.xs || '0.25rem'};
  right: ${props => props.theme.mobileSpacing?.xs || '0.25rem'};
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
`;

const MobileStickyFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  padding: ${props => props.theme.mobileSpacing?.md || '1rem'};
  ${props => props.theme.mobileMixins?.safeAreaPadding || ''};
`;

const MobilePrimaryButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.mobileSpacing?.md || '1rem'};
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: ${props => props.theme.mobileBorderRadius?.lg || '12px'};
  font-weight: 600;
  font-size: ${props => props.theme.mobileTypography?.body?.fontSize || '1rem'};
  cursor: pointer;

  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }
`;

// Desktop Styles
const DesktopContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 0;
`;

const DesktopContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const DesktopHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const DesktopTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 1rem 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DesktopUploadArea = styled.div<{ isDragOver: boolean }>`
  border: 3px dashed ${props => props.isDragOver ? 'var(--accent-primary)' : 'var(--border)'};
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--bg-card);
  margin-bottom: 3rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-hover);
  }
`;

const DesktopUploadIcon = styled.div`
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
`;

const DesktopUploadText = styled.p`
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
`;

const DesktopUploadHint = styled.p`
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
`;

const DesktopImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const DesktopImageCard = styled.div`
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
`;

const DesktopImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DesktopRemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 1);
    transform: scale(1.1);
  }
`;

const DesktopActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
`;

const DesktopButton = styled.button`
  padding: 1rem 2rem;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
  }
`;

const DesktopPrimaryButton = styled.button`
  padding: 1rem 2.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
`;

const ProgressWrapper = styled.div`
  padding: ${props => props.isMobile ? '0.75rem 1rem 0' : '1rem 2rem 0'};
  max-width: ${props => props.isMobile ? 'none' : '1200px'};
  margin: 0 auto;
`;

const ImagesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const { user } = useAuth();

  const [isDragOver, setIsDragOver] = useState(false);
  const { files, hasImages, addFiles, removeFile, saveImages } = useImagesWorkflow();

  useEffect(() => {
    SellWorkflowStepStateService.markPending('images');

    // Check storage usage and warn if high
    const storageUsage = WorkflowPersistenceService.getStorageUsage();
    if (storageUsage.percentage > 80) {
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
    } else {
      SellWorkflowStepStateService.markPending('images');
    }
  }, [files.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      addFiles(imageFiles);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  }, [addFiles]);

  const handleContinue = () => {
    if (hasImages) {
      saveImages();
      SellWorkflowStepStateService.markCompleted('images');
      const params = new URLSearchParams(searchParams);
      navigate(`/sell/inserat/${vehicleType}/details/preis?${params}`);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    navigate(`/sell/inserat/${vehicleType}/equipment?${params}`);
  };

  const renderImagesGrid = () => {
    if (files.length === 0) return null;

    const ImageGrid = isMobile ? MobileImagesGrid : DesktopImagesGrid;
    const ImageCard = isMobile ? MobileImageCard : DesktopImageCard;
    const Image = isMobile ? MobileImage : DesktopImage;
    const RemoveButton = isMobile ? MobileRemoveButton : DesktopRemoveButton;

    return (
      <ImageGrid>
        {files.map((file, index) => (
          <ImageCard key={`${file.name}-${index}`}>
            <Image src={file.preview} alt={`Upload ${index + 1}`} />
            <RemoveButton onClick={() => removeFile(index)}>
              <X size={isMobile ? 12 : 16} />
            </RemoveButton>
          </ImageCard>
        ))}
      </ImageGrid>
    );
  };

  if (isMobile) {
    return (
      <MobileContainer>
        <ProgressWrapper isMobile={true}>
          <SellProgressBar currentStep="images" />
        </ProgressWrapper>
        <MobileContent>
          <MobileHeader>
            <MobileTitle>{t('sell.images.title')}</MobileTitle>
          </MobileHeader>

          <MobileUploadArea
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('mobile-file-input')?.click()}
          >
            <MobileUploadIcon>
              <Upload size={48} />
            </MobileUploadIcon>
            <MobileUploadText>{t('sell.images.uploadText')}</MobileUploadText>
            <MobileUploadHint>{t('sell.images.uploadHint')}</MobileUploadHint>
            <input
              id="mobile-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </MobileUploadArea>

          {renderImagesGrid()}

          <MobileStickyFooter>
            <MobilePrimaryButton
              onClick={handleContinue}
              disabled={!hasImages}
            >
              {t('common.continue')}
            </MobilePrimaryButton>
          </MobileStickyFooter>
        </MobileContent>
      </MobileContainer>
    );
  }

  return (
    <DesktopContainer>
      <ProgressWrapper isMobile={false}>
        <SellProgressBar currentStep="images" />
      </ProgressWrapper>
      <DesktopContent>
        <DesktopHeader>
          <DesktopTitle>{t('sell.images.title')}</DesktopTitle>
        </DesktopHeader>

        <DesktopUploadArea
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('desktop-file-input')?.click()}
        >
          <DesktopUploadIcon>
            <Upload size={64} />
          </DesktopUploadIcon>
          <DesktopUploadText>{t('sell.images.uploadText')}</DesktopUploadText>
          <DesktopUploadHint>{t('sell.images.uploadHint')}</DesktopUploadHint>
          <input
            id="desktop-file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </DesktopUploadArea>

        {renderImagesGrid()}

        <DesktopActions>
          <DesktopButton onClick={handleBack}>
            {t('common.back')}
          </DesktopButton>
          <DesktopPrimaryButton
            onClick={handleContinue}
            disabled={!hasImages}
          >
            {t('common.continue')}
          </DesktopPrimaryButton>
        </DesktopActions>
      </DesktopContent>
    </DesktopContainer>
  );
};

export default ImagesPage;