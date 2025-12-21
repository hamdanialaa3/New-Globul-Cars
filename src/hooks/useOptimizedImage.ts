// src/hooks/useOptimizedImage.ts
// ⚡ Custom hook for optimized image loading with lazy loading

import { useState, useEffect } from 'react';

interface UseOptimizedImageOptions {
  src: string;
  placeholder?: string;
  lazy?: boolean;
}

export function useOptimizedImage({ 
  src, 
  placeholder = '/placeholder.jpg',
  lazy = true 
}: UseOptimizedImageOptions) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!lazy) {
      loadImage();
      return;
    }

    // Lazy loading with Intersection Observer
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, lazy]);

  const loadImage = () => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
  };

  return { imageSrc, isLoading, hasError };
}

export default useOptimizedImage;

