// src/components/Profile/CoverImageUploader.tsx
// Cover Image Uploader Component - مكون رفع صورة الغلاف
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Image, Upload, X, Loader } from 'lucide-react';
// import { useLanguage } from '../../contexts/LanguageContext'; // Unused
import { useTranslation } from '../../hooks/useTranslation';
import { ProfileService } from '../../services/profile';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';

// ==================== STYLED COMPONENTS ====================

const CoverContainer = styled.div<{ $themeColor?: string }>`
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  
  /* 🎨 Dynamic glassmorphic background for empty state */
  background: ${props => props.$themeColor
    ? `linear-gradient(135deg, ${props.$themeColor}40 0%, ${props.$themeColor}59 30%, ${props.$themeColor}73 60%, ${props.$themeColor}80 100%)`
    : 'linear-gradient(135deg, rgba(255, 175, 64, 0.25) 0%, rgba(255, 159, 42, 0.35) 30%, rgba(255, 143, 16, 0.45) 60%, rgba(255, 121, 0, 0.5) 100%)'};
  backdrop-filter: blur(12px) saturate(160%);
  
  /* Subtle border */
  border: ${props => props.$themeColor ? `2px solid ${props.$themeColor}4D` : '2px solid rgba(255, 215, 0, 0.3)'};
  box-shadow: 
    ${props => props.$themeColor ? `0 8px 28px ${props.$themeColor}33` : '0 8px 28px rgba(255, 143, 16, 0.2)'},
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  margin-bottom: 60px;
`;

const CoverImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    filter: brightness(0.9);
  }
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  
  svg {
    opacity: 0.7;
  }
  
  span {
    font-size: 1.125rem;
    font-weight: 500;
  }
`;

const UploadButton = styled.button<{ $themeColor?: string }>`
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: ${props => props.$themeColor ? `1px solid ${props.$themeColor}66` : '1px solid rgba(255, 215, 0, 0.4)'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.82rem;
  color: ${props => props.$themeColor || '#FF7900'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$themeColor ? `0 2px 6px ${props.$themeColor}26` : '0 2px 6px rgba(255, 143, 16, 0.15)'};
  z-index: 10;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  svg {
    pointer-events: none;
  }

  &:hover {
    background: white;
    border-color: ${props => props.$themeColor ? `${props.$themeColor}99` : 'rgba(255, 143, 16, 0.6)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(239, 83, 80, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.3);

  &:hover {
    background: #ef5350;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(239, 83, 80, 0.4);
  }
  
  &:active {
    transform: scale(1);
    box-shadow: 0 1px 4px rgba(239, 83, 80, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: white;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 12px;

  svg {
    animation: spin 1s linear  /* ⚡ OPTIMIZED: Removed infinite */;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ProgressText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
`;

const ProgressSubtext = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const ErrorBanner = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef5350;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3);
  max-width: 90%;
  text-align: center;
`;

// ==================== COMPONENT ====================

interface CoverImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  themeColor?: string;
}

const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  themeColor = '#FF7900'
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // 1. Validate
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Cover image must be less than 10MB');
      }

      setProgress(20);

      // 2. Process (optimize for 1200×400)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Processing cover image', { userId: user.uid, fileSize: file.size });
      }
      await ProfileService.image.processCoverImage(file);
      setProgress(40);

      // 3. Upload
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Uploading cover image to Firebase', { userId: user.uid });
      }
      const url = await ProfileService.image.uploadImage(
        user.uid,
        file,
        'cover/cover.jpg'
      );
      setProgress(70);

      // 4. Update Firestore
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Updating cover image in Firestore', { userId: user.uid });
      }
      await updateDoc(doc(db, 'users', user.uid), {
        'coverImage.url': url,
        'coverImage.uploadedAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setProgress(100);

      // Success!
      setImageUrl(url);
      onUploadSuccess?.(url);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Cover image uploaded successfully', { userId: user.uid, url });
      }

    } catch (err: any) {
      logger.error('Cover image upload failed', err as Error, { userId: user.uid, fileName: file?.name });
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user || !imageUrl) return;

    const confirmed = window.confirm('Delete cover image?');

    if (!confirmed) return;

    setUploading(true);

    try {
      await ProfileService.image.deleteImage(user.uid, 'cover/cover.jpg');
      
      await updateDoc(doc(db, 'users', user.uid), {
        coverImage: null,
        updatedAt: serverTimestamp()
      });

      setImageUrl(undefined);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Cover image deleted', { userId: user.uid });
      }

    } catch (err: any) {
      logger.error('Failed to delete cover image', err as Error, { userId: user.uid });
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle click
  const handleClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <CoverContainer $themeColor={themeColor}>
      <CoverImage $imageUrl={imageUrl} onClick={handleClick}>
        {!imageUrl && (
          <Placeholder>
            <Image size={64} />
            <span>Add Cover Image</span>
          </Placeholder>
        )}

        {uploading && (
          <LoadingOverlay>
            <Loader size={48} />
            <ProgressText>{progress}%</ProgressText>
            <ProgressSubtext>
              Uploading...
            </ProgressSubtext>
          </LoadingOverlay>
        )}
      </CoverImage>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {!uploading && (
        <UploadButton onClick={handleClick} disabled={uploading} $themeColor={themeColor}>
          <Upload size={18} />
          {imageUrl ? t('profile.changeCover') : t('profile.uploadCover')}
        </UploadButton>
      )}

      {imageUrl && !uploading && (
        <DeleteButton onClick={handleDelete}>
          <X size={18} />
        </DeleteButton>
      )}

      {error && <ErrorBanner>{error}</ErrorBanner>}
    </CoverContainer>
  );
};

export default CoverImageUploader;
