/**
 * 🖼️ Car Gallery Component with Professional Animations
 * معرض صور السيارات مع الرسوم المتحركة الاحترافية
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { colors, shadows, spacing } from '../../design-system';
import FadeInImage from '../animations/FadeInImage';

interface CarGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const GalleryContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: ${spacing[4]};
  overflow: hidden;
  background: ${colors.background.primary};
`;

const MainImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: ${spacing[2]};
  padding: ${spacing[4]};
  background: ${colors.background.secondary};
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Thumbnail = styled(motion.div)<{ $active: boolean }>`
  position: relative;
  min-width: 80px;
  height: 60px;
  border-radius: ${spacing[2]};
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? colors.primary[500] : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary[300]};
    transform: scale(1.05);
  }
`;

const NavigationButton = styled(motion.button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: ${colors.text.primary};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${shadows.basic.lg};
  backdrop-filter: blur(10px);
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(-50%);
  }
`;

const PrevButton = styled(NavigationButton)`
  left: ${spacing[4]};
`;

const NextButton = styled(NavigationButton)`
  right: ${spacing[4]};
`;

const ImageCounter = styled(motion.div)`
  position: absolute;
  top: ${spacing[4]};
  right: ${spacing[4]};
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${spacing[2]} ${spacing[3]};
  border-radius: ${spacing[3]};
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  z-index: 10;
`;

const ZoomButton = styled(motion.button)`
  position: absolute;
  bottom: ${spacing[4]};
  right: ${spacing[4]};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 121, 0, 0.9);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${shadows.colored.primary.lg};
  backdrop-filter: blur(10px);
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 121, 0, 1);
    transform: scale(1.1);
  }
`;

const FullscreenModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${spacing[6]};
`;

const FullscreenImage = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: ${spacing[2]};
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: ${spacing[6]};
  right: ${spacing[6]};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const CarGallery: React.FC<CarGalleryProps> = ({
  images,
  alt,
  className,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const imageVariants = {
    enter: { opacity: 0, x: 300 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -300 },
  };

  const thumbnailVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    },
  };

  if (!images || images.length === 0) {
    return (
      <GalleryContainer className={className}>
        <MainImageContainer>
          <FadeInImage
            src="/placeholder-car.jpg"
            alt="لا توجد صور متاحة"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </MainImageContainer>
      </GalleryContainer>
    );
  }

  return (
    <GalleryContainer className={className}>
      <MainImageContainer>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <FadeInImage
              src={images[currentIndex]}
              alt={`${alt} - صورة ${currentIndex + 1}`}
              width="100%"
              height="100%"
              objectFit="cover"
              carAnimation={true}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <PrevButton
              onClick={goToPrevious}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ‹
            </PrevButton>
            
            <NextButton
              onClick={goToNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ›
            </NextButton>
          </>
        )}

        <ImageCounter
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {currentIndex + 1} / {images.length}
        </ImageCounter>

        <ZoomButton
          onClick={openFullscreen}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔍
        </ZoomButton>
      </MainImageContainer>

      {showThumbnails && images.length > 1 && (
        <ThumbnailContainer>
          {images.map((image, index) => (
            <Thumbnail
              key={index}
              $active={index === currentIndex}
              onClick={() => goToImage(index)}
              variants={thumbnailVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FadeInImage
                src={image}
                alt={`${alt} - مصغر ${index + 1}`}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Thumbnail>
          ))}
        </ThumbnailContainer>
      )}

      <AnimatePresence>
        {isFullscreen && (
          <FullscreenModal
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeFullscreen}
          >
            <CloseButton
              onClick={closeFullscreen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </CloseButton>
            
            <FullscreenImage
              src={images[currentIndex]}
              alt={`${alt} - كامل ${currentIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </FullscreenModal>
        )}
      </AnimatePresence>
    </GalleryContainer>
  );
};

export default CarGallery;
