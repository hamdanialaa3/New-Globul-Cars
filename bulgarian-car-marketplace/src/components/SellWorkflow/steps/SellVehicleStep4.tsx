// Sell Vehicle Step 4: Images
// الخطوة 4: الصور

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Upload, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SellWorkflowData } from '../../../hooks/useSellWorkflow';
import { ImageStorageService } from '../../../services/ImageStorageService';
import { useAuth } from '../../../contexts/AuthProvider';
import { toast } from 'react-toastify';
import { logger } from '../../../services/logger-service';


interface SellVehicleStep4Props {
  workflowData: SellWorkflowData;
  onUpdate: (updates: Partial<SellWorkflowData>) => void;
}

// Animations
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-tertiary);
    }
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

const ImagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
    
    &:hover {
      background: var(--text-tertiary);
    }
  }
`;

const ImageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const ImageThumbnail = styled.div`
  position: relative;
  width: 80px;
  height: 60px;
  min-width: 80px;
  min-height: 60px;
  max-width: 80px;
  max-height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  flex-shrink: 0;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

const ImageName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageSize = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const ImageIndex = styled.div`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 600;
  min-width: 30px;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  max-width: 32px;
  max-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 16px;
    height: 16px;
    stroke-width: 3;
    flex-shrink: 0;
  }
`;

const ImageCount = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  text-align: center;
`;

const MAX_IMAGES = 20;

export const SellVehicleStep4: React.FC<SellVehicleStep4Props> = ({
  workflowData,
  onUpdate,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Map<number, string>>(new Map());

  // Load images from IndexedDB on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const savedImages = await ImageStorageService.getImages();
        if (savedImages.length > 0) {
          setImageFiles(savedImages);
          // Update workflow data
          onUpdate({ imagesCount: savedImages.length });
        }
      } catch (error) {
        logger.error('Failed to load images:', error);
      }
    };
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Create preview URLs for images
  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviews(new Map());
      return;
    }

    const newPreviews = new Map<number, string>();
    const oldPreviews = new Map(imagePreviews);
    
    imageFiles.forEach((file, index) => {
      // Check if we already have a preview for this index
      const existingPreview = imagePreviews.get(index);
      if (existingPreview) {
        // Keep existing preview if file hasn't changed
        newPreviews.set(index, existingPreview);
      } else if (file instanceof File) {
        // Create new preview URL
        try {
          const previewUrl = URL.createObjectURL(file);
          newPreviews.set(index, previewUrl);
          logger.info(`Created preview URL for image ${index + 1}:`, file.name);
        } catch (error) {
          logger.error(`Failed to create preview for image ${index + 1}:`, error);
        }
      }
    });
    
    setImagePreviews(newPreviews);

    // Cleanup old preview URLs that are no longer needed
    return () => {
      oldPreviews.forEach((url, index) => {
        // Only revoke if this index is no longer in the new previews
        if (!newPreviews.has(index) && url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!currentUser) {
      toast.error(language === 'bg' ? 'Моля влезте' : 'Please sign in');
      return;
    }

    const filesArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - imageFiles.length;
    
    if (filesArray.length > remainingSlots) {
      toast.warning(
        language === 'bg' 
          ? `Можете да добавите само ${remainingSlots} снимки`
          : `You can only add ${remainingSlots} more images`
      );
      filesArray.splice(remainingSlots); // Limit to remaining slots
    }

    // Validate file sizes (10MB max per image)
    const oversizedFiles = filesArray.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(
        language === 'bg' 
          ? 'Някои файлове са твърде големи (макс. 10MB)'
          : 'Some files are too large (max 10MB)'
      );
      return;
    }

    setUploading(true);
    try {
      // Update local state FIRST so images appear immediately
      const newFiles = [...imageFiles, ...filesArray];
      setImageFiles(newFiles);
      logger.info('Images state updated immediately:', newFiles.length);
      
      // Then save to IndexedDB in the background
      try {
        await ImageStorageService.saveImages(newFiles);
        logger.info('Images saved to IndexedDB:', newFiles.length);
      } catch (saveError) {
        logger.error('Failed to save to IndexedDB (but images are still shown);:', saveError);
        // Don't show error to user since images are already displayed
      }
      
      // Update workflow data with count
      onUpdate({
        imagesCount: newFiles.length,
      });
      
      toast.success(
        language === 'bg' 
          ? `${filesArray.length} снимки добавени успешно`
          : `${filesArray.length} images added successfully`
      );
    } catch (error) {
      logger.error('Failed to process images:', error);
      toast.error(
        language === 'bg' 
          ? 'Грешка при обработка на снимки'
          : 'Error processing images'
      );
    } finally {
      setUploading(false);
    }
  }, [imageFiles, currentUser, language, onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemoveImage = useCallback(async (index: number) => {
    try {
      // Remove from IndexedDB
      await ImageStorageService.removeImage(index);
      
      // Update local state
      const newFiles = imageFiles.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      
      // Update workflow data
      onUpdate({
        imagesCount: newFiles.length,
        mainImage: newFiles[0] ? URL.createObjectURL(newFiles[0]) : undefined,
      });
    } catch (error) {
      logger.error('Failed to remove image:', error);
      toast.error(
        language === 'bg' 
          ? 'Грешка при изтриване на снимка'
          : 'Error removing image'
      );
    }
  }, [imageFiles, language, onUpdate]);

  return (
    <FormContainer>
      <InfoText>
        {language === 'bg' 
          ? `Можете да качите до ${MAX_IMAGES} снимки. Плъзнете и пуснете или кликнете за избор.`
          : `You can upload up to ${MAX_IMAGES} images. Drag and drop or click to select.`}
      </InfoText>

      <UploadArea
        $isDragOver={isDragOver}
        $hasImages={imageFiles.length > 0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon>
          <Upload />
        </UploadIcon>
        <UploadText>
          {language === 'bg' 
            ? 'Кликнете или плъзнете снимки тук'
            : 'Click or drag images here'}
        </UploadText>
        <UploadHint>
          {language === 'bg' 
            ? 'PNG, JPG, WEBP до 10MB'
            : 'PNG, JPG, WEBP up to 10MB'}
        </UploadHint>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            handleFileSelect(e.target.files);
            // Reset input to allow selecting same file again
            if (e.target) {
              e.target.value = '';
            }
          }}
        />
      </UploadArea>

      {imageFiles.length > 0 && (
        <>
          <ImagesList>
            {imageFiles.map((file, index) => {
              const previewUrl = imagePreviews.get(index);
              const fileSize = file.size ? (file.size / 1024 / 1024).toFixed(2) : '0';
              const fileName = file.name || `Image ${index + 1}`;
              
              return (
                <ImageItem key={`${index}-${file.name || index}`}>
                  <ImageIndex>#{index + 1}</ImageIndex>
                  <ImageThumbnail>
                    {previewUrl ? (
                      <ImagePreview src={previewUrl} alt={fileName} onError={(e) => {
                        logger.error('Failed to load preview for image:', index, file.name);
                        // Try to create a new preview URL if the old one is invalid
                        if (file instanceof File) {
                          const newUrl = URL.createObjectURL(file);
                          setImagePreviews(prev => {
                            const updated = new Map(prev);
                            updated.set(index, newUrl);
                            return updated;
                          });
                        }
                      }} />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem'
                      }}>
                        {language === 'bg' ? 'Зареждане...' : 'Loading...'}
                      </div>
                    )}
                  </ImageThumbnail>
                  <ImageInfo>
                    <ImageName title={fileName}>{fileName}</ImageName>
                    <ImageSize>{fileSize} MB</ImageSize>
                  </ImageInfo>
                  <RemoveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    title={language === 'bg' ? 'Изтрий' : 'Remove'}
                  >
                    <X />
                  </RemoveButton>
                </ImageItem>
              );
            })}
          </ImagesList>
          <ImageCount>
            {imageFiles.length} / {MAX_IMAGES} {language === 'bg' ? 'снимки' : 'images'}
          </ImageCount>
        </>
      )}

      {uploading && (
        <InfoText style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>
          {language === 'bg' ? 'Качване...' : 'Uploading...'}
        </InfoText>
      )}
    </FormContainer>
  );
};

export default SellVehicleStep4;
