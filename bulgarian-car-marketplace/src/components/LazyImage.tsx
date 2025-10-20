import React, { useState, useRef, useEffect , memo} from 'react';
import styled from 'styled-components';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  sizes?: string;
  srcSet?: string;
}

const LazyImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.grey[100]};
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const LazyImagePlaceholder = styled.div<{ isLoaded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.grey[100]};
  display: ${({ isLoaded }) => (isLoaded ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  opacity: ${({ isLoaded }) => (isLoaded ? 0 : 1)};
`;

const LazyImageSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme }) => theme.colors.grey[300]};
  border-top: 2px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LazyImageElement = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: ${({ isLoaded }) => (isLoaded ? 1 : 0)};
`;

const LazyImageError = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.grey[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  style,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  loading = 'lazy',
  decoding = 'async',
  sizes,
  srcSet,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  };

  return (
    <LazyImageContainer
      ref={containerRef}
      className={className}
      style={style}
    >
      <LazyImagePlaceholder isLoaded={isLoaded}>
        {placeholder ? (
          <img
            src={placeholder}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <LazyImageSpinner />
        )}
      </LazyImagePlaceholder>

      {isInView && (
        <>
          {isError ? (
            <LazyImageError>
              {fallback || 'Failed to load image'}
            </LazyImageError>
          ) : (
            <LazyImageElement
              ref={imgRef}
              src={src}
              alt={alt}
              isLoaded={isLoaded}
              loading={loading}
              decoding={decoding}
              sizes={sizes}
              srcSet={srcSet}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </>
      )}
    </LazyImageContainer>
  );
};

export default memo(LazyImage);
