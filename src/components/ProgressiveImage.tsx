import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface ProgressiveImageProps {
  src: string;
  placeholder?: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
}

const ImageContainer = styled.div<{ $aspectRatio?: number }>`
  position: relative;
  overflow: hidden;
  background-color: var(--bg-card);
  ${props => props.$aspectRatio && `
    aspect-ratio: ${props.$aspectRatio};
  `}
`;

const StyledImage = styled.img<{ $loaded: boolean; $isPlaceholder: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
  opacity: ${props => props.$loaded ? 1 : 0};
  filter: ${props => props.$isPlaceholder ? 'blur(10px)' : 'none'};
  transform: ${props => props.$isPlaceholder ? 'scale(1.1)' : 'scale(1)'};
`;

const Skeleton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--bg-card) 25%,
    var(--bg-hover) 50%,
    var(--bg-card) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

/**
 * Progressive Image Component
 * Loads images with blur-up effect for better perceived performance
 * 
 * Features:
 * - Blur placeholder while loading
 * - Smooth transition to full image
 * - Fallback to skeleton loader
 * - Lazy loading support
 * - WebP support with fallback
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholder,
  alt,
  className,
  width,
  height,
  loading = 'lazy'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(!!placeholder);

  useEffect(() => {
    // Preload the full image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
      setIsPlaceholder(false);
    };

    img.onerror = () => {
      // Fallback to placeholder or keep loading skeleton
      if (!placeholder) {
        setImageLoaded(true);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder]);

  return (
    <ImageContainer className={className}>
      {!imageLoaded && !placeholder && <Skeleton />}
      
      {imageSrc && (
        <picture>
          {/* WebP version for modern browsers */}
          <source srcSet={imageSrc.replace(/\.(jpg|jpeg|png)$/, '.webp')} type="image/webp" />
          
          {/* Original format fallback */}
          <StyledImage
            src={imageSrc}
            alt={alt}
            $loaded={imageLoaded}
            $isPlaceholder={isPlaceholder}
            loading={loading}
            width={width}
            height={height}
            onLoad={() => {
              if (!imageLoaded) {
                setImageLoaded(true);
                setIsPlaceholder(false);
              }
            }}
          />
        </picture>
      )}
    </ImageContainer>
  );
};

export default ProgressiveImage;
