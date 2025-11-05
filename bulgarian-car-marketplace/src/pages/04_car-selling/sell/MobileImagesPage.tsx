// Mobile Images Upload Page
// Purpose: Photo upload for vehicle listing on mobile/tablet
// Mobile-first; no emojis; <300 lines

import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MobileContainer, MobileStack } from '@/components/ui/mobile-index';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { S } from './MobileImagesPage.styles';

const MAX_IMAGES = 20;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded: boolean;
}

const MobileImagesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicleType = 'car' } = useParams<{ vehicleType: string }>();
  
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [images.length]);

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
     navigate(`/sell/inserat/${vehicleType}/details/preis?${params.toString()}`);
  };

  const handleSkip = () => {
    const params = new URLSearchParams(searchParams.toString());
     navigate(`/sell/inserat/${vehicleType}/details/preis?${params.toString()}`);
  };

  const canContinue = images.length > 0;

  return (
    <S.PageWrapper>
      <MobileHeader />

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

export default MobileImagesPage;
