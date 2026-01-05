// CarImage Component - Simple wrapper for car images
// مكون صورة السيارة - غلاف بسيط لصور السيارات

import React from 'react';
import OptimizedImage from './OptimizedImage';

interface CarImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * CarImage Component
 * 
 * A simple wrapper around OptimizedImage specifically for car photos.
 * Provides consistent defaults and fallback for car listings.
 * 
 * @param src - Image URL
 * @param alt - Alternative text for accessibility
 * @param className - Optional CSS classes
 * @param width - Optional width
 * @param height - Optional height
 * @param loading - Loading strategy (lazy or eager)
 * @param onLoad - Callback when image loads
 * @param onError - Callback when image fails to load
 */
const CarImage: React.FC<CarImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  // Default fallback image for cars
  const defaultFallback = '/assets/images/car-placeholder.jpg';

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      fallback={defaultFallback}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default CarImage;
