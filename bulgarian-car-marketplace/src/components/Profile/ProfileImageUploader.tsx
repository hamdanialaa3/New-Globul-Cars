// src/components/Profile/ProfileImageUploader.tsx
// Profile Image Uploader Component - مكون رفع الصورة الشخصية
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Camera, X, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProfileService } from '../../services/profile';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase-config';
import { measureAsync } from '../../utils/performance-monitor';
import { logger } from '../../services/logger-service';

// ==================== STYLED COMPONENTS ====================

const UploaderContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
`;

const ImagePreview = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  /* 🎨 Orange glassmorphic background for empty state */
  background: ${props => props.$hasImage 
    ? 'transparent' 
    : `linear-gradient(135deg,
        rgba(255, 159, 42, 0.35) 0%,
        rgba(255, 143, 16, 0.45) 50%,
        rgba(255, 121, 0, 0.55) 100%
      )`
  };
  backdrop-filter: ${props => props.$hasImage ? 'none' : 'blur(8px) saturate(150%)'};
  
  /* Glassy border for empty state */
  border: ${props => props.$hasImage 
    ? '4px solid #fff' 
    : '4px solid rgba(255, 215, 0, 0.4)'
  };
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.$hasImage
      ? '0 6px 20px rgba(0, 0, 0, 0.2)'
      : '0 8px 24px rgba(255, 143, 16, 0.35), 0 0 0 2px rgba(255, 215, 0, 0.3)'
    };
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Placeholder = styled.div`
  font-size: 3rem;
  color: white;
`;

const UploadButton = styled.button`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px rgba(34, 197, 94, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    transform: scale(1.1) translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(34, 197, 94, 0.45),
      0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(1.05) translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: scale(1);
  }

  svg {
    color: white;
    pointer-events: none;
    width: 20px;
    height: 20px;
    stroke-width: 2.5px;
  }

  /* Dark Mode Support */
  html[data-theme="dark"] & {
    border-color: #1e293b;
    box-shadow: 
      0 4px 12px rgba(34, 197, 94, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    bottom: -2px;
    right: -2px;
    border-width: 2.5px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px rgba(239, 68, 68, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 11;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: scale(1.15) translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(239, 68, 68, 0.45),
      0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(1.08) translateY(0);
  }

  svg {
    color: white;
    pointer-events: none;
    width: 18px;
    height: 18px;
    stroke-width: 3px;
  }

  /* Dark Mode Support */
  html[data-theme="dark"] & {
    border-color: #1e293b;
    box-shadow: 
      0 4px 12px rgba(239, 68, 68, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    top: -4px;
    right: -4px;
    border-width: 2.5px;

    svg {
      width: 16px;
      height: 16px;
    }
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
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 8px;

  svg {
    animation: spin 1s linear  /* ⚡ OPTIMIZED: Removed infinite */;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef5350;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.3);
`;

// ==================== COMPONENT ====================

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImageUrl,
  onUploadSuccess,
  onUploadError
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Sync with currentImageUrl prop
  useEffect(() => {
    if (currentImageUrl) {
      setImageUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // 1. Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      setProgress(20);

      // 2. Process image (compression + variants)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Processing profile image', { userId: user.uid, fileSize: file.size });
      }
      await measureAsync('processProfileImage', async () => {
        return await ProfileService.image.processProfileImage(file);
      });
      setProgress(40);

      // 3. Upload to Firebase Storage
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Uploading profile image to Firebase', { userId: user.uid });
      }
      const url = await measureAsync('uploadProfileImage', async () => {
        return await ProfileService.image.uploadImage(user.uid, file, 'profile/avatar.jpg');
      });
      setProgress(70);

      // 4. Update Firebase Auth photoURL
      const currentUser = auth.currentUser;
      if (currentUser) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Updating Firebase Auth photoURL', { userId: user.uid });
        }
        try {
          await updateProfile(currentUser, {
            photoURL: url
          });
        } catch (authError: any) {
          logger.warn('Failed to update Auth photoURL, continuing with Firestore update', authError);
        }
      }
      setProgress(75);

      // 5. Update Firestore (both photoURL and profileImage.url)
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Updating user profile in Firestore', { userId: user.uid });
      }
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url, // Main photoURL field
        'profileImage.url': url, // ProfileImage object for backward compatibility
        'profileImage.uploadedAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setProgress(90);

      // 6. Recalculate trust score
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Calculating trust score', { userId: user.uid });
      }
      try {
        await ProfileService.trust.calculateTrustScore(user.uid);
      } catch (trustError: any) {
        logger.warn('Failed to recalculate trust score', trustError);
        // Don't fail the upload if trust score calculation fails
      }
      setProgress(100);

      // Success!
      setImageUrl(url);
      onUploadSuccess?.(url);
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Profile image uploaded successfully', { userId: user.uid, url });
      }

    } catch (err: any) {
      logger.error('Profile image upload failed', err as Error, { userId: user.uid, fileName: file?.name });
      setError(err.message || 'Upload failed');
      onUploadError?.(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle delete image
  const handleDelete = async () => {
    if (!user || !imageUrl) return;

    const confirmed = window.confirm(
      language === 'bg' ? 'Изтриване на профилната снимка?' : 'Delete profile image?'
    );

    if (!confirmed) return;

    setUploading(true);
    setError(null);

    try {
      // Delete from Storage
      await ProfileService.image.deleteImage(user.uid, 'profile/avatar.jpg');

      // Update Firebase Auth photoURL
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await updateProfile(currentUser, {
            photoURL: null
          });
        } catch (authError: any) {
          logger.warn('Failed to update Auth photoURL during delete', authError);
        }
      }

      // Update Firestore (remove both photoURL and profileImage)
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: null,
        profileImage: null,
        updatedAt: serverTimestamp()
      });

      setImageUrl(undefined);
      onUploadSuccess?.('');
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Profile image deleted successfully', { userId: user.uid });
      }

    } catch (err: any) {
      logger.error('Profile image delete failed', err as Error, { userId: user.uid });
      setError(err.message || (language === 'bg' ? 'Грешка при изтриване' : 'Delete failed'));
      onUploadError?.(err.message);
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
    <UploaderContainer>
      <ImagePreview $hasImage={!!imageUrl} onClick={handleClick}>
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" />
        ) : (
          <Placeholder>
            {user?.displayName?.charAt(0).toUpperCase() || '👤'}
          </Placeholder>
        )}

        {uploading && (
          <LoadingOverlay>
            <Loader size={32} />
            <ProgressText>{progress}%</ProgressText>
          </LoadingOverlay>
        )}
      </ImagePreview>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {!uploading && (
        <UploadButton onClick={handleClick} disabled={uploading} title={language === 'bg' ? 'Качи/Промени снимка' : 'Upload/Change photo'}>
          <Camera size={20} />
        </UploadButton>
      )}

      {imageUrl && !uploading && (
        <DeleteButton onClick={handleDelete} title={language === 'bg' ? 'Изтрий снимка' : 'Delete photo'}>
          <X size={18} />
        </DeleteButton>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploaderContainer>
  );
};

export default ProfileImageUploader;
