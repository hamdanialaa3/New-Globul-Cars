// src/components/Profile/ProfileImageUploader.tsx
// Profile Image Uploader Component - مكون رفع الصورة الشخصية
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProfileService } from '../../services/profile';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { measureAsync } from '../../utils/performance-monitor';

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
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FF7900;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 121, 0, 0.3);
  z-index: 10;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #ff8c1a;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    color: white;
    pointer-events: none;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef5350;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.3);
  z-index: 11;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #e53935;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1.05);
  }

  svg {
    color: white;
    pointer-events: none;
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
      console.log('🖼️ Processing image...');
      const processed = await measureAsync('processProfileImage', async () => {
        return await ProfileService.image.processProfileImage(file);
      });
      setProgress(40);

      // 3. Upload to Firebase Storage
      console.log('☁️ Uploading to Firebase...');
      const url = await measureAsync('uploadProfileImage', async () => {
        return await ProfileService.image.uploadImage(user.uid, file, 'profile/avatar.jpg');
      });
      setProgress(70);

      // 4. Update Firestore
      console.log('💾 Updating Firestore...');
      await updateDoc(doc(db, 'users', user.uid), {
        'profileImage.url': url,
        'profileImage.uploadedAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setProgress(90);

      // 5. Recalculate trust score
      console.log('🎯 Calculating trust score...');
      await ProfileService.trust.calculateTrustScore(user.uid);
      setProgress(100);

      // Success!
      setImageUrl(url);
      onUploadSuccess?.(url);
      console.log('✅ Profile image uploaded successfully!');

    } catch (err: any) {
      console.error('❌ Upload failed:', err);
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

    const confirmed = window.confirm('Delete profile image?');

    if (!confirmed) return;

    setUploading(true);

    try {
      // Delete from Storage
      await ProfileService.image.deleteImage(user.uid, 'profile/avatar.jpg');

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: null,
        updatedAt: serverTimestamp()
      });

      setImageUrl(undefined);
      console.log('✅ Profile image deleted');

    } catch (err: any) {
      console.error('❌ Delete failed:', err);
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
        <UploadButton onClick={handleClick} disabled={uploading}>
          {imageUrl ? <Camera size={20} /> : <Upload size={20} />}
        </UploadButton>
      )}

      {imageUrl && !uploading && (
        <DeleteButton onClick={handleDelete}>
          <X size={12} />
        </DeleteButton>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploaderContainer>
  );
};

export default ProfileImageUploader;
