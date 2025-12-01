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
import { Upload, X, Image as ImageIcon, Video, Box } from 'lucide-react';
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

const ProgressWrapper = styled.div<{ isMobile?: boolean }>`
  padding: ${props => props.isMobile ? '0.75rem 1rem 0' : '1rem 2rem 0'};
  max-width: ${props => props.isMobile ? 'none' : '1200px'};
  margin: 0 auto;
`;

// Three Column Grid Container (Images, Video, 3D)
const SectionsGrid = styled.div<{ $isMobile?: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$isMobile ? '1fr' : 'repeat(3, 1fr)'};
  gap: ${props => props.$isMobile ? (props.theme.mobileSpacing?.md || '1rem') : '1.5rem'};
  margin-bottom: ${props => props.$isMobile ? (props.theme.mobileSpacing?.lg || '1.5rem') : '2rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Video Upload Section Styles
const VideoSection = styled.div<{ $isMobile?: boolean }>`
  background: var(--bg-card);
  border-radius: ${props => props.$isMobile ? (props.theme.mobileBorderRadius?.lg || '12px') : '16px'};
  padding: ${props => props.$isMobile ? (props.theme.mobileSpacing?.lg || '1.5rem') : '1.5rem'};
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const VideoSectionTitle = styled.h3<{ $isMobile?: boolean }>`
  font-size: ${props => props.$isMobile ? (props.theme.mobileTypography?.h3?.fontSize || '1.2rem') : '1.5rem'};
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const VideoSectionSubtitle = styled.p<{ $isMobile?: boolean }>`
  font-size: ${props => props.$isMobile ? (props.theme.mobileTypography?.small?.fontSize || '0.875rem') : '1rem'};
  color: var(--text-secondary);
  margin: 0 0 ${props => props.$isMobile ? (props.theme.mobileSpacing?.md || '1rem') : '1.5rem'} 0;
`;

const VideoUploadArea = styled.div<{ isDragOver: boolean; hasVideo: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? 'var(--accent-primary)' : (props.hasVideo ? 'var(--success)' : 'var(--border-primary)')};
  border-radius: ${props => props.theme.mobileBorderRadius?.md || '8px'};
  padding: ${props => props.theme.mobileSpacing?.lg || '1.5rem'};
  text-align: center;
  background: ${props => props.hasVideo ? 'var(--bg-accent)' : 'var(--bg-card)'};
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: var(--accent-primary);
  }
`;

const VideoPreview = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: ${props => props.theme.mobileBorderRadius?.md || '8px'};
  overflow: hidden;
  background: var(--bg-secondary);
`;

const VideoElement = styled.video`
  width: 100%;
  height: auto;
  display: block;
`;

const VideoRemoveButton = styled.button`
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
  z-index: 10;
  
  &:hover {
    background: rgba(239, 68, 68, 1);
  }
`;

// 3D Model Section Styles
const Model3DSection = styled.div<{ $isMobile?: boolean }>`
  background: var(--bg-card);
  border-radius: ${props => props.$isMobile ? (props.theme.mobileBorderRadius?.lg || '12px') : '16px'};
  padding: ${props => props.$isMobile ? (props.theme.mobileSpacing?.lg || '1.5rem') : '1.5rem'};
  border: 1px solid var(--border-primary);
  opacity: 0.7;
  position: relative;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Model3DHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.mobileSpacing?.md || '1rem'};
`;

const Model3DTitle = styled.h3<{ $isMobile?: boolean }>`
  font-size: ${props => props.$isMobile ? (props.theme.mobileTypography?.h3?.fontSize || '1.2rem') : '1.5rem'};
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ComingSoonBadge = styled.span`
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Model3DSubtitle = styled.p<{ $isMobile?: boolean }>`
  font-size: ${props => props.$isMobile ? (props.theme.mobileTypography?.small?.fontSize || '0.875rem') : '1rem'};
  color: var(--text-secondary);
  margin: 0 0 ${props => props.$isMobile ? (props.theme.mobileSpacing?.md || '1rem') : '1.5rem'} 0;
`;

const Model3DPlaceholder = styled.div`
  border: 2px dashed var(--border-primary);
  border-radius: ${props => props.theme.mobileBorderRadius?.md || '8px'};
  padding: ${props => props.theme.mobileSpacing?.xl || '2rem'};
  text-align: center;
  background: var(--bg-accent);
  color: var(--text-muted);
`;

const Model3DIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.mobileSpacing?.md || '1rem'};
  opacity: 0.5;
`;

const Model3DDescription = styled.p`
  font-size: ${props => props.theme.mobileTypography?.body?.fontSize || '1rem'};
  color: var(--text-secondary);
  margin: 0;
`;

// Images Section Card Component
const ImagesSectionCard = styled.div<{ $isMobile?: boolean }>`
  background: var(--bg-card);
  border-radius: ${props => props.$isMobile ? (props.theme.mobileBorderRadius?.lg || '12px') : '16px'};
  padding: ${props => props.$isMobile ? (props.theme.mobileSpacing?.lg || '1.5rem') : '1.5rem'};
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ImagesSectionTitle = styled.h3<{ $isMobile?: boolean }>`
  font-size: ${props => props.$isMobile ? (props.theme.mobileTypography?.h3?.fontSize || '1.2rem') : '1.5rem'};
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
`;

const ImagesSectionSubtitle = styled.p<{ $isMobile?: boolean }>`
  font-size: ${props => props.$isMobile ? (props.theme.mobileTypography?.small?.fontSize || '0.875rem') : '1rem'};
  color: var(--text-secondary);
  margin: 0 0 ${props => props.$isMobile ? (props.theme.mobileSpacing?.md || '1rem') : '1.5rem'} 0;
`;

const ImagesSectionContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-accent);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 2px;
  }
`;

const ImagesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  const { user } = useAuth();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isVideoDragOver, setIsVideoDragOver] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Map<number, string>>(new Map());
  const { files, hasImages, addFiles, removeFile, saveImages } = useImagesWorkflow();

  // Create preview URLs for images
  useEffect(() => {
    const newPreviews = new Map<number, string>();
    files.forEach((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      newPreviews.set(index, previewUrl);
    });
    setImagePreviews(newPreviews);

    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Cleanup video preview on unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

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

  // Video handlers
  const handleVideoDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(true);
  }, []);

  const handleVideoDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(false);
  }, []);

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsVideoDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const videoFiles = droppedFiles.filter(file => file.type.startsWith('video/'));

    if (videoFiles.length > 0) {
      if (videoFiles.length > 1) {
        toast.warn(language === 'bg' ? 'Можете да качите само едно видео.' : 'You can only upload one video.');
        return;
      }
      const file = videoFiles[0];
      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast.error(language === 'bg' ? 'Видео файлът е твърде голям. Максимум 100MB.' : 'Video file is too large. Maximum 100MB.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  }, [language]);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast.error(language === 'bg' ? 'Видео файлът е твърде голям. Максимум 100MB.' : 'Video file is too large. Maximum 100MB.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
    e.target.value = '';
  }, [language]);

  const handleRemoveVideo = useCallback(() => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
  }, [videoPreview]);

  const handleContinue = () => {
    if (hasImages) {
      saveImages();
      SellWorkflowStepStateService.markCompleted('images');
      const params = new URLSearchParams(searchParams);
      // Navigate to pricing page (EUR currency for Bulgaria market)
      navigate(`/sell/inserat/${vehicleType}/details/preis?${params.toString()}`);
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
        {files.map((file, index) => {
          const previewUrl = imagePreviews.get(index);
          return (
            <ImageCard key={`${file.name}-${index}`}>
              {previewUrl && <Image src={previewUrl} alt={`Upload ${index + 1}`} />}
              <RemoveButton onClick={() => removeFile(index)}>
                <X size={isMobile ? 12 : 16} />
              </RemoveButton>
            </ImageCard>
          );
        })}
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

          {/* Three Equal Sections Grid */}
          <SectionsGrid $isMobile={true}>
            {/* Images Section */}
            <ImagesSectionCard $isMobile={true}>
              <ImagesSectionTitle $isMobile={true}>
                <ImageIcon size={20} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
                {t('sell.images.title')}
              </ImagesSectionTitle>
              <ImagesSectionSubtitle $isMobile={true}>{t('sell.images.subtitle')}</ImagesSectionSubtitle>
              
              <MobileUploadArea
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('mobile-file-input')?.click()}
                style={{ marginBottom: '1rem' }}
              >
                <MobileUploadIcon>
                  <Upload size={32} />
                </MobileUploadIcon>
                <MobileUploadText style={{ fontSize: '0.875rem' }}>{t('sell.images.uploadText')}</MobileUploadText>
                <MobileUploadHint style={{ fontSize: '0.75rem' }}>{t('sell.images.uploadHint')}</MobileUploadHint>
                <input
                  id="mobile-file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </MobileUploadArea>

              <ImagesSectionContent>
                {renderImagesGrid()}
              </ImagesSectionContent>
            </ImagesSectionCard>

            {/* Video Upload Section */}
            <VideoSection $isMobile={true}>
              <VideoSectionTitle $isMobile={true}>{t('sell.images.video.title')}</VideoSectionTitle>
              <VideoSectionSubtitle $isMobile={true}>{t('sell.images.video.subtitle')}</VideoSectionSubtitle>
              
              {videoPreview ? (
                <VideoPreview>
                  <VideoElement src={videoPreview} controls />
                  <VideoRemoveButton onClick={handleRemoveVideo}>
                    <X size={16} />
                  </VideoRemoveButton>
                </VideoPreview>
              ) : (
                <VideoUploadArea
                  isDragOver={isVideoDragOver}
                  hasVideo={!!videoPreview}
                  onDragOver={handleVideoDragOver}
                  onDragLeave={handleVideoDragLeave}
                  onDrop={handleVideoDrop}
                  onClick={() => document.getElementById('mobile-video-input')?.click()}
                >
                  <MobileUploadIcon>
                    <Video size={32} />
                  </MobileUploadIcon>
                  <MobileUploadText style={{ fontSize: '0.875rem' }}>{t('sell.images.video.uploadText')}</MobileUploadText>
                  <MobileUploadHint style={{ fontSize: '0.75rem' }}>{t('sell.images.video.uploadHint')}</MobileUploadHint>
                  <input
                    id="mobile-video-input"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    style={{ display: 'none' }}
                  />
                </VideoUploadArea>
              )}
            </VideoSection>

            {/* 3D Model Section */}
            <Model3DSection $isMobile={true}>
              <Model3DHeader>
                <Model3DTitle $isMobile={true}>
                  <Box size={20} />
                  {t('sell.images.model3d.title')}
                </Model3DTitle>
                <ComingSoonBadge>{t('sell.images.model3d.comingSoon')}</ComingSoonBadge>
              </Model3DHeader>
              <Model3DSubtitle $isMobile={true}>{t('sell.images.model3d.subtitle')}</Model3DSubtitle>
              <Model3DPlaceholder>
                <Model3DIcon>
                  <Box size={48} />
                </Model3DIcon>
                <Model3DDescription>{t('sell.images.model3d.description')}</Model3DDescription>
              </Model3DPlaceholder>
            </Model3DSection>
          </SectionsGrid>

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

        {/* Three Equal Sections Grid */}
        <SectionsGrid $isMobile={false}>
          {/* Images Section */}
          <ImagesSectionCard $isMobile={false}>
            <ImagesSectionTitle $isMobile={false}>
              <ImageIcon size={24} style={{ marginRight: '0.5rem', display: 'inline-block' }} />
              {t('sell.images.title')}
            </ImagesSectionTitle>
            <ImagesSectionSubtitle $isMobile={false}>{t('sell.images.subtitle')}</ImagesSectionSubtitle>
            
            <DesktopUploadArea
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('desktop-file-input')?.click()}
              style={{ marginBottom: '1rem', padding: '2rem 1rem' }}
            >
              <DesktopUploadIcon>
                <Upload size={48} />
              </DesktopUploadIcon>
              <DesktopUploadText style={{ fontSize: '1rem' }}>{t('sell.images.uploadText')}</DesktopUploadText>
              <DesktopUploadHint style={{ fontSize: '0.875rem' }}>{t('sell.images.uploadHint')}</DesktopUploadHint>
              <input
                id="desktop-file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </DesktopUploadArea>

            <ImagesSectionContent>
              {renderImagesGrid()}
            </ImagesSectionContent>
          </ImagesSectionCard>

          {/* Video Upload Section */}
          <VideoSection $isMobile={false}>
            <VideoSectionTitle $isMobile={false}>{t('sell.images.video.title')}</VideoSectionTitle>
            <VideoSectionSubtitle $isMobile={false}>{t('sell.images.video.subtitle')}</VideoSectionSubtitle>
            
            {videoPreview ? (
              <VideoPreview>
                <VideoElement src={videoPreview} controls />
                <VideoRemoveButton onClick={handleRemoveVideo}>
                  <X size={16} />
                </VideoRemoveButton>
              </VideoPreview>
            ) : (
              <VideoUploadArea
                isDragOver={isVideoDragOver}
                hasVideo={!!videoPreview}
                onDragOver={handleVideoDragOver}
                onDragLeave={handleVideoDragLeave}
                onDrop={handleVideoDrop}
                onClick={() => document.getElementById('desktop-video-input')?.click()}
              >
                <DesktopUploadIcon>
                  <Video size={48} />
                </DesktopUploadIcon>
                <DesktopUploadText style={{ fontSize: '1rem' }}>{t('sell.images.video.uploadText')}</DesktopUploadText>
                <DesktopUploadHint style={{ fontSize: '0.875rem' }}>{t('sell.images.video.uploadHint')}</DesktopUploadHint>
                <input
                  id="desktop-video-input"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  style={{ display: 'none' }}
                />
              </VideoUploadArea>
            )}
          </VideoSection>

          {/* 3D Model Section */}
          <Model3DSection $isMobile={false}>
            <Model3DHeader>
              <Model3DTitle $isMobile={false}>
                <Box size={24} />
                {t('sell.images.model3d.title')}
              </Model3DTitle>
              <ComingSoonBadge>{t('sell.images.model3d.comingSoon')}</ComingSoonBadge>
            </Model3DHeader>
            <Model3DSubtitle $isMobile={false}>{t('sell.images.model3d.subtitle')}</Model3DSubtitle>
            <Model3DPlaceholder>
              <Model3DIcon>
                <Box size={64} />
              </Model3DIcon>
              <Model3DDescription>{t('sell.images.model3d.description')}</Model3DDescription>
            </Model3DPlaceholder>
          </Model3DSection>
        </SectionsGrid>

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