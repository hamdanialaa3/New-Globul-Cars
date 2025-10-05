/**
 * 🖼️ FadeInImage Component
 * مكون الصور المتلاشية للسيارات
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string;
  lazy?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  carAnimation?: boolean;
}

const ImageContainer = styled(motion.div)<{
  $width?: string | number;
  $height?: string | number;
  $borderRadius?: string;
}>`
  position: relative;
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || 'auto'};
  border-radius: ${props => props.$borderRadius || '8px'};
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const StyledImage = styled(motion.img)<{
  $objectFit?: string;
  $carAnimation?: boolean;
}>`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  transition: all 0.3s ease;
  
  ${props => props.$carAnimation && `
    &:hover {
      transform: scale(1.05);
      filter: brightness(1.1) contrast(1.1);
    }
  `}
`;

const Placeholder = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #f1f5f9 25%,
    #e2e8f0 50%,
    #f1f5f9 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.875rem;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #FF7900;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CarSpeedLines = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 2px;
    height: 60%;
    background: linear-gradient(to bottom, transparent, #FF7900, transparent);
    transform: translateY(-50%);
  }

  &::before {
    left: 20%;
    animation: speedLine1 2s infinite;
  }

  &::after {
    right: 20%;
    animation: speedLine2 2s infinite 0.5s;
  }

  @keyframes speedLine1 {
    0%, 100% { opacity: 0; transform: translateY(-50%) translateX(-10px); }
    50% { opacity: 0.8; transform: translateY(-50%) translateX(0); }
  }

  @keyframes speedLine2 {
    0%, 100% { opacity: 0; transform: translateY(-50%) translateX(10px); }
    50% { opacity: 0.8; transform: translateY(-50%) translateX(0); }
  }
`;

const FadeInImage: React.FC<FadeInImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  objectFit = 'cover',
  borderRadius = '8px',
  lazy = true,
  placeholder,
  onLoad,
  onError,
  carAnimation = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
  };

  const placeholderVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    },
  };

  return (
    <ImageContainer
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      className={className}
    >
      <AnimatePresence mode="wait">
        {!isLoaded && !hasError && (
          <Placeholder
            key="placeholder"
            variants={placeholderVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <LoadingSpinner />
          </Placeholder>
        )}

        {hasError && (
          <Placeholder
            key="error"
            variants={placeholderVariants}
            initial="hidden"
            animate="visible"
          >
            🚗 صورة غير متاحة
          </Placeholder>
        )}

        {isLoaded && (
          <StyledImage
            key="image"
            src={src}
            alt={alt}
            $objectFit={objectFit}
            $carAnimation={carAnimation}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            loading={lazy ? "lazy" : "eager"}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </AnimatePresence>

      {carAnimation && isLoaded && (
        <CarSpeedLines
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        />
      )}
    </ImageContainer>
  );
};

export default FadeInImage;
