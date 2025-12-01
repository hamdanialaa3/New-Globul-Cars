// src/components/Profile/CoverImageUploader.tsx
// Cover Image Uploader Component - مكون رفع صورة الغلاف
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Image, Upload, Loader, Camera, Move, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
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

const EditButton = styled.button<{ $themeColor?: string }>`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.98);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  color: #2c3e50;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 15;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 20px;
    height: 20px;
    color: #6c757d;
    pointer-events: none;
  }

  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  /* Dark Mode Support */
  html[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.95);
    color: #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(148, 163, 184, 0.2);
    
    svg {
      color: #cbd5e1;
    }
    
    &:hover {
      background: rgba(51, 65, 85, 0.98);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), 0 3px 8px rgba(0, 0, 0, 0.4);
      border-color: rgba(148, 163, 184, 0.3);
    }
    
    &:active {
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3);
    }
  }
  
  /* Light Mode Support */
  html[data-theme="light"] & {
    background: rgba(255, 255, 255, 0.98);
    color: #2c3e50;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &:hover {
      background: white;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 70px;
  left: 20px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  min-width: 240px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  overflow: hidden;
`;

const MenuOption = styled.button`
  width: 100%;
  padding: 14px 18px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
  direction: ltr;

  svg {
    width: 20px;
    height: 20px;
    color: #6c757d;
    flex-shrink: 0;
    order: -1; /* Icon always on the left */
  }

  span {
    flex: 1;
    text-align: right; /* Text aligned to the right for Arabic look */
  }

  &:hover {
    background: rgba(44, 62, 80, 0.05);
  }

  &:active {
    background: rgba(44, 62, 80, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.danger {
    color: #e74c3c;
    
    svg {
      color: #e74c3c;
    }
    
    &:hover {
      background: rgba(231, 76, 60, 0.08);
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
  const { language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);

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

  // Toggle menu
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle choose from library (same as upload)
  const handleChoosePhoto = () => {
    setIsMenuOpen(false);
    handleClick();
  };

  // Handle upload photo
  const handleUploadPhoto = () => {
    setIsMenuOpen(false);
    handleClick();
  };

  // Handle reposition
  const handleReposition = () => {
    setIsMenuOpen(false);
    setIsRepositioning(!isRepositioning);
    // TODO: Implement drag/reposition functionality
    alert(language === 'bg' 
      ? 'Функцията за репозициониране скоро ще бъде достъпна' 
      : 'Reposition feature coming soon');
  };

  // Handle remove
  const handleRemove = () => {
    setIsMenuOpen(false);
    handleDelete();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Get menu text based on language
  const getMenuText = () => {
    if (language === 'bg') {
      return {
        editButton: 'Редактирай корицата',
        choosePhoto: 'Избери снимка за корица',
        uploadPhoto: 'Качи снимка',
        reposition: 'Репозициониране',
        remove: 'Премахни',
        addCover: 'Добави корица',
        uploading: 'Качване...'
      };
    } else {
      return {
        editButton: 'Edit Cover Photo',
        choosePhoto: 'Choose Cover Photo',
        uploadPhoto: 'Upload Photo',
        reposition: 'Reposition',
        remove: 'Remove',
        addCover: 'Add Cover Image',
        uploading: 'Uploading...'
      };
    }
  };

  const menuText = getMenuText();

  return (
    <CoverContainer $themeColor={themeColor}>
      <CoverImage $imageUrl={imageUrl}>
        {!imageUrl && !uploading && (
          <Placeholder>
            <Image size={64} />
            <span>{menuText.addCover}</span>
          </Placeholder>
        )}

        {uploading && (
          <LoadingOverlay>
            <Loader size={48} />
            <ProgressText>{progress}%</ProgressText>
            <ProgressSubtext>
              {menuText.uploading}
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
        <>
          <EditButton onClick={toggleMenu} disabled={uploading} $themeColor={themeColor}>
            <Camera size={20} />
            <span>{menuText.editButton}</span>
          </EditButton>

          <DropdownMenu $isOpen={isMenuOpen} onClick={(e) => e.stopPropagation()}>
            <MenuOption onClick={handleChoosePhoto}>
              <Image size={20} />
              <span>{menuText.choosePhoto}</span>
            </MenuOption>
            
            <MenuOption onClick={handleUploadPhoto}>
              <Upload size={20} />
              <span>{menuText.uploadPhoto}</span>
            </MenuOption>
            
            {imageUrl && (
              <>
                <MenuOption onClick={handleReposition}>
                  <Move size={20} />
                  <span>{menuText.reposition}</span>
                </MenuOption>
                
                <MenuOption className="danger" onClick={handleRemove}>
                  <Trash2 size={20} />
                  <span>{menuText.remove}</span>
                </MenuOption>
              </>
            )}
          </DropdownMenu>
        </>
      )}

      {error && <ErrorBanner>{error}</ErrorBanner>}
    </CoverContainer>
  );
};

export default CoverImageUploader;
