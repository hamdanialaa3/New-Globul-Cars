// ImageModal Component - Wrapper for ImageLightbox
// مكون نافذة الصور المنبثقة

import React from 'react';
import ImageLightbox from './common/ImageLightbox/ImageLightbox';

interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex?: number;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  carName?: string;
}

/**
 * ImageModal Component
 * 
 * Wrapper component for ImageLightbox to provide backward compatibility
 * 
 * @param isOpen - Whether the modal is open
 * @param images - Array of image URLs
 * @param currentIndex - Current image index
 * @param onClose - Callback when modal is closed
 * @param onNavigate - Callback when navigating between images
 * @param carName - Name of the car (for accessibility)
 */
const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  images,
  currentIndex = 0,
  onClose,
  onNavigate,
  carName,
}) => {
  return (
    <ImageLightbox
      images={images}
      initialIndex={currentIndex}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default ImageModal;
