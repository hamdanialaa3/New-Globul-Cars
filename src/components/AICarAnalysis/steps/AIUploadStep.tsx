/**
 * AIUploadStep Component
 * First step: Upload car images for AI analysis
 * 
 * Features:
 * - Drag & drop image upload
 * - Preview thumbnails
 * - File validation (JPEG/PNG, max 10MB, max 5 images)
 * - Bilingual support (bg/en)
 */

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { logger } from '@/services/logger-service';

interface AIUploadStepProps {
  onContinue: (images: File[]) => void;
  initialImages?: File[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const DropZone = styled(motion.div)<{ $isDragging: boolean; $hasError: boolean }>`
  border: 2px dashed ${({ $isDragging, $hasError, theme }) => {
    if ($hasError) return 'rgba(239, 68, 68, 0.5)';
    if ($isDragging) return 'rgba(59, 130, 246, 0.8)';
    return theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
  }};
  background: ${({ $isDragging, theme }) => 
    $isDragging 
      ? 'rgba(59, 130, 246, 0.1)' 
      : theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
  };
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)'};
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const DropZoneIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 3rem;
    height: 3rem;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  }
  
  @media (max-width: 768px) {
    svg {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
`;

const DropZoneText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const DropZoneSubtext = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }
`;

const PreviewCard = styled(motion.div)`
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.9);
    transform: scale(1.1);
  }
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 100, 100, 0.95)' : 'rgba(220, 38, 38, 0.95)'};
  font-size: 0.9rem;
  
  svg {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const AIUploadStep: React.FC<AIUploadStepProps> = ({ onContinue, initialImages = [] }) => {
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage === 'bg' ? 'bg' : 'en';
  const [images, setImages] = useState<File[]>(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    title: {
      bg: 'Качете снимки на автомобила',
      en: 'Upload Car Images'
    },
    description: {
      bg: 'Качете до 5 снимки на вашия автомобил за AI анализ. Алгоритъмът ще разпознае марка, модел, година и състояние.',
      en: 'Upload up to 5 images of your car for AI analysis. The algorithm will recognize brand, model, year, and condition.'
    },
    dropZone: {
      bg: 'Пуснете снимки тук или кликнете за избор',
      en: 'Drop images here or click to select'
    },
    dropZoneSubtext: {
      bg: 'JPEG, PNG или WebP (макс. 10MB)',
      en: 'JPEG, PNG or WebP (max. 10MB)'
    },
    continue: {
      bg: 'Продължи с анализ',
      en: 'Continue with Analysis'
    },
    errors: {
      noImages: {
        bg: 'Молим, качете поне една снимка',
        en: 'Please upload at least one image'
      },
      tooManyFiles: {
        bg: 'Максимум 5 снимки се допускат',
        en: 'Maximum 5 images allowed'
      },
      invalidType: {
        bg: 'Само JPEG, PNG или WebP са разрешени',
        en: 'Only JPEG, PNG or WebP are allowed'
      },
      tooLarge: {
        bg: 'Файлът е твърде голям (макс. 10MB)',
        en: 'File is too large (max. 10MB)'
      }
    }
  };

  const validateFiles = (files: FileList | File[]): File[] | null => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > MAX_FILES) {
      setError(t.errors.tooManyFiles[lang]);
      return null;
    }
    
    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t.errors.invalidType[lang]);
        return null;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        setError(t.errors.tooLarge[lang]);
        return null;
      }
    }
    
    return fileArray;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles) {
      setImages(prev => [...prev, ...validFiles]);
      logger.info('Images dropped', { count: validFiles.length });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles) {
        setImages(prev => [...prev, ...validFiles]);
        logger.info('Images selected', { count: validFiles.length });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setError(null);
    logger.info('Image removed', { index });
  };

  const handleContinue = () => {
    if (images.length === 0) {
      setError(t.errors.noImages[lang]);
      return;
    }
    
    logger.info('Continuing with uploaded images', { count: images.length });
    onContinue(images);
  };

  return (
    <Container>
      <GlassCard padding="large">
        <Title>{t.title[lang]}</Title>
        <Description>{t.description[lang]}</Description>
        
        <div style={{ marginTop: '1.5rem' }}>
          <DropZone
            $isDragging={isDragging}
            $hasError={!!error}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <DropZoneIcon
              animate={isDragging ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            >
              {isDragging ? <Upload /> : <Camera />}
            </DropZoneIcon>
            <DropZoneText>{t.dropZone[lang]}</DropZoneText>
            <DropZoneSubtext>{t.dropZoneSubtext[lang]}</DropZoneSubtext>
          </DropZone>
          
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
          />
        </div>
        
        <AnimatePresence>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertTriangle />
              <span>{error}</span>
            </ErrorMessage>
          )}
        </AnimatePresence>
        
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '1.5rem' }}
          >
            <PreviewGrid>
              <AnimatePresence>
                {images.map((file, index) => (
                  <PreviewCard
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <PreviewImage
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                    />
                    <RemoveButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X />
                    </RemoveButton>
                  </PreviewCard>
                ))}
              </AnimatePresence>
            </PreviewGrid>
          </motion.div>
        )}
        
        <ButtonGroup>
          <GlassButton
            variant="primary"
            fullWidth
            onClick={handleContinue}
            disabled={images.length === 0}
          >
            {t.continue[lang]}
          </GlassButton>
        </ButtonGroup>
      </GlassCard>
    </Container>
  );
};

export default AIUploadStep;
