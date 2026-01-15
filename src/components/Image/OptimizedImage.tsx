import React from 'react';
import styled from 'styled-components';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    loading?: 'lazy' | 'eager';
    sizes?: string;
}

const StyledPicture = styled.picture`
  display: contents;
`;

const StyledImg = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

/**
 * Optimized Image component with WebP support and lazy loading
 * Automatically generates responsive image sizes
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    width,
    height,
    className,
    loading = 'lazy',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
    // Generate WebP version URL (assumes images are stored in Firebase Storage)
    const getWebPUrl = (url: string): string => {
        if (url.includes('firebasestorage.googleapis.com')) {
            // Firebase Storage supports transformation via URL parameters
            return url;
        }
        // For local images, assume WebP version exists
        return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    };

    // Generate srcset for responsive images
    const generateSrcSet = (url: string, format: 'webp' | 'original'): string => {
        const widths = [400, 800, 1200, 1600];
        const baseUrl = format === 'webp' ? getWebPUrl(url) : url;

        return widths
            .map(w => `${baseUrl}?w=${w} ${w}w`)
            .join(', ');
    };

    const webpSrc = getWebPUrl(src);
    const hasWebP = webpSrc !== src;

    return (
        <StyledPicture>
            {hasWebP && (
                <source
                    type="image/webp"
                    srcSet={generateSrcSet(src, 'webp')}
                    sizes={sizes}
                />
            )}
            <source
                type={src.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' : 'image/png'}
                srcSet={generateSrcSet(src, 'original')}
                sizes={sizes}
            />
            <StyledImg
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                className={className}
                decoding="async"
            />
        </StyledPicture>
    );
};

interface LazyImageProps {
    src: string;
    alt: string;
    placeholder?: string;
    className?: string;
}

/**
 * Lazy loading image with blur-up placeholder effect
 */
export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    className
}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [currentSrc, setCurrentSrc] = React.useState(placeholder);

    React.useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
        };
    }, [src]);

    return (
        <StyledImg
            src={currentSrc}
            alt={alt}
            className={className}
            style={{
                filter: isLoaded ? 'none' : 'blur(10px)',
                transition: 'filter 0.3s ease-in-out'
            }}
        />
    );
};
