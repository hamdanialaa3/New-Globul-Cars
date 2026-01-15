/**
 * OptimizedImage Component
 * High-performance image component with WebP support and lazy loading
 * 
 * Features:
 * - WebP format with fallback
 * - Lazy loading by default
 * - Progressive loading states
 * - Responsive images support
 * - Memory-efficient rendering
 * 
 * @example
 * <OptimizedImage 
 *   src="/images/car.jpg" 
 *   alt="Car" 
 *   priority={false}
 * />
 */

import React, { memo, useState, useCallback } from 'react';
import styled from 'styled-components';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Styled Components - Defined OUTSIDE component for performance
const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 8px;
`;

const StyledImage = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => props.$loaded ? 1 : 0};
  will-change: opacity;
`;

const Placeholder = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid #ddd;
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * OptimizedImage Component
 * Memoized for maximum performance
 */
const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  onLoad: onLoadProp,
  onError: onErrorProp
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Convert to WebP if possible
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoadProp?.();
  }, [onLoadProp]);
  
  const handleError = useCallback(() => {
    setError(true);
    onErrorProp?.();
  }, [onErrorProp]);

  // If error loading WebP, fallback to original
  if (error) {
    return (
      <ImageWrapper className={className} style={{ width, height }}>
        <StyledImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          $loaded={true}
        />
      </ImageWrapper>
    );
  }

  return (
    <ImageWrapper className={className} style={{ width, height }}>
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <StyledImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          $loaded={loaded}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>
      <Placeholder $visible={!loaded} />
    </ImageWrapper>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
