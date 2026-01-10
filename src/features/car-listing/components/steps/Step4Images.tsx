// Step 4: Images Upload with Compression
// الخطوة 4: رفع الصور مع الضغط
import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { logger } from '@/services/logger-service';
import { Upload, X, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCarListingStore } from '../../stores/car-listing-store';
import { Step4Data } from '../../schemas/car-listing.schema';
import { compressImages, validateImageFile, createImagePreview, revokeImagePreview } from '../../utils/image-compression';
import { toast } from 'react-toastify';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

const UploadArea = styled.div<{ $isDragOver: boolean; $hasImages: boolean }>`
  border: 2px dashed ${props => props.$isDragOver 
    ? 'var(--accent-primary)' 
    : props.$hasImages 
      ? 'var(--success)' 
      : 'var(--border)'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => props.$hasImages ? 'var(--bg-accent)' : 'var(--bg-card)'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: var(--accent-primary);
    background: var(--bg-hover);
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const UploadText = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const UploadHint = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ImageCard = styled.div<{ $isMain: boolean }>`
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${props => props.$isMain ? 'var(--accent-primary)' : 'var(--border)'};
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

const ImageNumber = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 1);
    transform: scale(1.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const MainImageBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const InfoText = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const Step4Images: React.FC = () => {
  const { language } = useLanguage();
  const { formData, updateStepData, markStepComplete, addImages, removeImage, setMainImage, imageFiles } = useCarListingStore();
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainImageIndex = formData.step4?.mainImageIndex || 0;

  // Create preview URLs
  useEffect(() => {
    const urls = new Map<number, string>();
    imageFiles.forEach((file, index) => {
      urls.set(index, createImagePreview(file));
    });
    setPreviewUrls(urls);

    return () => {
      urls.forEach(url => revokeImagePreview(url));
    };
  }, [imageFiles]);

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validationResults = fileArray.map(validateImageFile);
    const invalidFiles = validationResults.filter(r => !r.valid);
    
    if (invalidFiles.length > 0) {
      toast.error(invalidFiles[0].error || 'Invalid image file');
      return;
    }

    // Check total count (max 20)
    if (imageFiles.length + fileArray.length > 20) {
      toast.error(language === 'bg' 
        ? 'Максималният брой снимки е 20' 
        : 'Maximum 20 images allowed');
      return;
    }

    setIsCompressing(true);
    try {
      // Compress images
      const compressedFiles = await compressImages(fileArray);
      
      // Add to store (this updates imageFiles)
      await addImages(compressedFiles);
      
      // Update form data
      updateStepData('step4', {
        mainImageIndex: mainImageIndex,
      } as Partial<Step4Data>);
      
      markStepComplete(3);
      
      toast.success(language === 'bg' 
        ? `${compressedFiles.length} снимки добавени` 
        : `${compressedFiles.length} images added`);
    } catch (error) {
      logger.error('Error processing images', error as Error);
      toast.error(language === 'bg' 
        ? 'Грешка при обработка на снимките' 
        : 'Error processing images');
    } finally {
      setIsCompressing(false);
    }
  }, [imageFiles, addImages, setValue, updateStepData, markStepComplete, mainImageIndex, language]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback((index: number) => {
    removeImage(index);
    const newMainIndex = imageFiles.length > 1 ? Math.min(mainImageIndex, imageFiles.length - 2) : 0;
    updateStepData('step4', {
      mainImageIndex: newMainIndex,
    } as Partial<Step4Data>);
  }, [imageFiles, removeImage, updateStepData, mainImageIndex]);

  const handleSetMain = useCallback((index: number) => {
    setMainImage(index);
    updateStepData('step4', {
      mainImageIndex: index,
    } as Partial<Step4Data>);
  }, [setMainImage, updateStepData]);

  return (
    <StepContainer>
      <div>
        <StepTitle>
          {language === 'bg' ? 'Снимки на превозното средство' : 'Vehicle Photos'}
        </StepTitle>
        <StepDescription>
          {language === 'bg'
            ? 'Качете до 20 снимки на вашето превозно средство'
            : 'Upload up to 20 photos of your vehicle'}
        </StepDescription>
      </div>

      <UploadArea
        $isDragOver={isDragOver}
        $hasImages={imageFiles.length > 0}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon>
          <Upload size={48} />
        </UploadIcon>
        <UploadText>
          {language === 'bg'
            ? 'Плъзнете снимки тук или кликнете за избор'
            : 'Drag photos here or click to select'}
        </UploadText>
        <UploadHint>
          {language === 'bg'
            ? 'PNG, JPG до 10MB (ще бъдат компресирани автоматично)'
            : 'PNG, JPG up to 10MB (will be compressed automatically)'}
        </UploadHint>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
        />
      </UploadArea>

      {imageFiles.length > 0 && (
        <ImagesGrid>
          {imageFiles.map((file, index) => {
            const previewUrl = previewUrls.get(index);
            const isMain = index === mainImageIndex;
            
            return (
              <ImageCard
                key={index}
                $isMain={isMain}
                onClick={() => handleSetMain(index)}
              >
                {previewUrl && <ImagePreview src={previewUrl} alt={`Preview ${index + 1}`} />}
                {isMain && (
                  <MainImageBadge>
                    <Star size={12} />
                    {language === 'bg' ? 'Основна' : 'Main'}
                  </MainImageBadge>
                )}
                <ImageOverlay>
                  <ImageNumber>{index + 1}</ImageNumber>
                  <RemoveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                  >
                    <X size={16} />
                  </RemoveButton>
                </ImageOverlay>
              </ImageCard>
            );
          })}
        </ImagesGrid>
      )}

      <InfoText>
        📸 {language === 'bg'
          ? `${imageFiles.length}/20 снимки избрани. Първата снимка ще бъде основната.`
          : `${imageFiles.length}/20 photos selected. First photo will be the main one.`}
        {isCompressing && (
          <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--accent-primary)' }}>
            {language === 'bg' ? 'Компресиране...' : 'Compressing...'}
          </span>
        )}
      </InfoText>

      {imageFiles.length === 0 && (
        <p style={{ color: 'var(--error)', textAlign: 'center', marginTop: '1rem' }}>
          {language === 'bg' ? 'Моля добавете поне една снимка' : 'Please add at least one image'}
        </p>
      )}
    </StepContainer>
  );
};

