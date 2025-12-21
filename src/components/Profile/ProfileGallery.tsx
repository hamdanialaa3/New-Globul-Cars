// src/components/Profile/ProfileGallery.tsx
// Profile Image Gallery Component - معرض صور البروفايل
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Plus, X, Image as ImageIcon, Loader } from 'lucide-react';
// import { useLanguage } from '../../contexts/LanguageContext'; // Unused
import { useTranslation } from '../../hooks/useTranslation';
import { ProfileService } from '../../services/profile';
import { logger } from '../../services/logger-service';

// ==================== STYLED COMPONENTS ====================

const GalleryContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const GalleryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
  }
  
  span {
    font-size: 0.875rem;
    color: #999;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const GalleryItem = styled.div<{ $isPlaceholder?: boolean }>`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.$isPlaceholder ? '#f5f5f5' : 'transparent'};
  border: ${props => props.$isPlaceholder ? '2px dashed #ddd' : 'none'};
  cursor: ${props => props.$isPlaceholder ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.$isPlaceholder ? 'scale(1.02)' : 'scale(1.05)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
  
  svg {
    color: #ccc;
  }
  
  span {
    font-size: 0.875rem;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(239, 83, 80, 0.95);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  
  ${GalleryItem}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background: #ef5350;
    transform: scale(1.1);
  }
  
  svg {
    color: white;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: white;
    animation: spin 1s linear  /* ⚡ OPTIMIZED: Removed infinite */;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// ==================== COMPONENT ====================

interface ProfileGalleryProps {
  userId: string;
  images?: string[];
  maxImages?: number;
  onUpdate?: (images: string[]) => void;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({
  userId,
  images = [],
  maxImages = 9,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState<string[]>(images);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (gallery.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(gallery.length);

    try {
      // Upload image
      const url = await ProfileService.image.uploadImage(
        userId,
        file,
        `gallery/image_${Date.now()}.jpg`
      );

      const newGallery = [...gallery, url];
      setGallery(newGallery);
      onUpdate?.(newGallery);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Gallery image uploaded', { userId, galleryLength: newGallery.length });
      }
    } catch (error) {
      logger.error('Gallery upload failed', error as Error, { userId, fileName: file.name });
      alert('Upload failed');
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle delete
  const handleDelete = async (index: number, url: string) => {
    const confirmed = window.confirm('Delete this image?');
    if (!confirmed) return;

    try {
      // Extract path from URL
      const path = url.split('/o/')[1]?.split('?')[0];
      if (path) {
        const decodedPath = decodeURIComponent(path);
        await ProfileService.image.deleteImage(userId, decodedPath.replace(`users/${userId}/`, ''));
      }

      const newGallery = gallery.filter((_, i) => i !== index);
      setGallery(newGallery);
      onUpdate?.(newGallery);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Gallery image deleted', { userId, index });
      }
    } catch (error) {
      logger.error('Gallery image delete failed', error as Error, { userId, index, url });
    }
  };

  // Placeholders count
  const placeholderCount = Math.max(0, Math.min(3, maxImages - gallery.length));

  return (
    <GalleryContainer>
      <GalleryHeader>
        <h3>{t('profile.gallery')}</h3>
        <span>{gallery.length} / {maxImages}</span>
      </GalleryHeader>

      <GalleryGrid>
        {/* Existing images */}
        {gallery.map((url, index) => (
          <GalleryItem key={url}>
            <img src={url} alt={`${t('profile.gallery')} ${index + 1}`} />
            <DeleteButton onClick={() => handleDelete(index, url)}>
              <X size={14} />
            </DeleteButton>
            {uploading === index && (
              <LoadingOverlay>
                <Loader size={24} />
              </LoadingOverlay>
            )}
          </GalleryItem>
        ))}

        {/* Add button (if not full) */}
        {gallery.length < maxImages && (
          <GalleryItem 
            $isPlaceholder 
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading === gallery.length ? (
              <LoadingOverlay>
                <Loader size={24} />
              </LoadingOverlay>
            ) : (
              <PlaceholderContent>
                <Plus size={32} />
                <span>{t('profile.addImage')}</span>
              </PlaceholderContent>
            )}
          </GalleryItem>
        )}

        {/* Empty placeholders */}
        {placeholderCount > 0 && [...Array(placeholderCount - 1)].map((_, i) => (
          <GalleryItem key={`placeholder-${i}`} $isPlaceholder>
            <PlaceholderContent>
              <ImageIcon size={32} />
            </PlaceholderContent>
          </GalleryItem>
        ))}
      </GalleryGrid>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
      />
    </GalleryContainer>
  );
};

export default ProfileGallery;
