// src/components/OptimizedImage.tsx
// Optimized Image Component with Lazy Loading & Progressive Loading
// مكون صورة محسّن مع تحميل تدريجي

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageContainer = styled.div<{ loaded: boolean; hasError: boolean }>`
  position: relative;
  overflow: hidden;
  background: ${props => props.hasError ? '#f8d7da' : (props.loaded ? 'transparent' : '#f0f0f0')};
  border-radius: 4px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
    opacity: ${props => props.loaded ? 1 : 0};
  }
`;

const Placeholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ErrorPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #721c24;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
  background: #f8d7da;
`;

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading by default
 * - Progressive loading with placeholder
 * - Error handling with fallback
 * - Intersection Observer for better performance
 * - Automatic WebP detection
 * 
 * Usage:
 * ```tsx
 * <OptimizedImage 
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={300}
 *   height={200}
 *   loading="lazy"
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className,
  fallback = '/images/placeholder.png',
  onLoad,
  onError
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(loading === 'eager');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current.parentElement as Element);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Try to use WebP if available
  useEffect(() => {
    if (!isVisible) return;

    // Check if browser supports WebP
    const checkWebPSupport = async () => {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      try {
        const response = await fetch(webpSrc, { method: 'HEAD' });
        if (response.ok) {
          setCurrentSrc(webpSrc);
          return;
        }
      } catch (e) {
        // WebP not available, use original
      }
      
      setCurrentSrc(src);
    };

    checkWebPSupport();
  }, [src, isVisible]);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoaded(false);
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
    onError?.();
  };

  return (
    <ImageContainer 
      loaded={loaded} 
      hasError={error}
      className={className}
      style={{ width, height }}
    >
      {!loaded && !error && <Placeholder />}
      {error && currentSrc === fallback && (
        <ErrorPlaceholder>
          ⚠️<br />
          Image not available
        </ErrorPlaceholder>
      )}
      {isVisible && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </ImageContainer>
  );
};

export default OptimizedImage;

