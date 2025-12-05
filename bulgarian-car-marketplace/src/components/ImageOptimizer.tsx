import { logger } from '../services/logger-service';
// src/components/ImageOptimizer.tsx
// Image optimization component for better performance

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  loading?: 'lazy' | 'eager';
}

const OptimizedImage = styled.img`
  transition: opacity 0.3s ease-in-out;
  &.loading {
    opacity: 0.5;
    filter: blur(2px);
  }
  &.loaded {
    opacity: 1;
    filter: blur(0);
  }
`;

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className,
  width = 400,
  height = 300,
  quality = 80,
  format = 'webp',
  loading = 'lazy'
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create optimized image URL
    const optimizeImage = async () => {
      try {
        // For Firebase Storage images, we can use resize parameters
        if (src.includes('firebasestorage.googleapis.com')) {
          const optimizedUrl = `${src}?alt=media&w=${width}&h=${height}&q=${quality}&f=${format}`;
          setOptimizedSrc(optimizedUrl);
        } else {
          // For other images, use a simple optimization approach
          setOptimizedSrc(src);
        }
      } catch (error) {
        logger.warn('Image optimization failed, using original:', error);
        setOptimizedSrc(src);
      }
    };

    optimizeImage();
  }, [src, width, height, quality, format]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // Fallback to original image if optimization fails
    if (optimizedSrc !== src) {
      setOptimizedSrc(src);
    }
  };

  return (
    <OptimizedImage
      src={optimizedSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      width={width}
      height={height}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        objectFit: 'cover'
      }}
    />
  );
};

export default ImageOptimizer;