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
  // Default fallback image for cars (inline SVG data URL to avoid missing-file issues)
  const defaultFallback =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f3f4f6"/><rect x="80" y="180" width="440" height="120" rx="24" ry="24" fill="%23d1d5db"/><circle cx="170" cy="320" r="40" fill="%239ca3af"/><circle cx="430" cy="320" r="40" fill="%239ca3af"/><rect x="160" y="170" width="280" height="70" rx="16" ry="16" fill="%23e5e7eb"/><path d="M140 210h320" stroke="%239ca3af" stroke-width="4" stroke-linecap="round"/></svg>';
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
