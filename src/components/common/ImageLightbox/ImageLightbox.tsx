import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

// Fade animation for modal
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Slide animations for images
const slideRight = keyframes`
  from { transform: translateX(50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideLeft = keyframes`
  from { transform: translateX(-50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(10px);
`;

const ControlsHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
`;

const ImageCounter = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px; /* Ensure 44px touch target */
  height: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }

  /* Mobile adjustment for better visibility/reachability */
  @media (max-width: 768px) {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255,255,255,0.2);
  }
`;

const MainImageArea = styled.div`
  position: relative;
  width: 100%;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$position}: 20px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 5;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-50%) scale(1.1);
  }

  svg {
    width: 28px;
    height: 28px;
  }

  @media (max-width: 768px) {
    width: 44px; /* Minimum touch target size */
    height: 44px;
    ${props => props.$position}: 10px;
    background: rgba(0,0,0,0.5); /* Better visibility on mobile */
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const ImageWrapper = styled.div<{ $animationKey: number }>`
  max-width: 90%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  // Use key to trigger animation restart
  animation: ${slideRight} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  user-select: none;
`;

const ThumbnailStrip = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  padding: 20px;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const Thumbnail = styled.button<{ $isActive: boolean }>`
  width: 60px;
  height: 60px;
  padding: 0;
  border: 2px solid ${props => props.$isActive ? '#ffffff' : 'transparent'};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  opacity: ${props => props.$isActive ? 1 : 0.6};
  transform: ${props => props.$isActive ? 'scale(1.1)' : 'scale(1)'};

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [animationKey, setAnimationKey] = useState(0); // Force re-render for animation

  // Sync internal state when props change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setAnimationKey(prev => prev + 1);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setAnimationKey(prev => prev + 1);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Also prevent touchmove to stop pull-to-refresh on mobile if needed, 
      // but might interfere with thumbnail scrolling.
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <ControlsHeader onClick={(e) => e.stopPropagation()}>
        <ImageCounter>
          {currentIndex + 1} / {images.length}
        </ImageCounter>
        <CloseButton onClick={onClose} aria-label="Close Gallery">
          <X />
        </CloseButton>
      </ControlsHeader>

      <MainImageArea onClick={(e) => e.stopPropagation()}>
        <NavButton $position="left" onClick={handlePrev} aria-label="Previous Image">
          <ChevronLeft />
        </NavButton>

        <ImageWrapper $animationKey={animationKey} key={animationKey}>
          <MainImage
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            draggable={false}
          />
        </ImageWrapper>

        <NavButton $position="right" onClick={handleNext} aria-label="Next Image">
          <ChevronRight />
        </NavButton>
      </MainImageArea>

      <ThumbnailStrip onClick={(e) => e.stopPropagation()}>
        {images.map((img, idx) => (
          <Thumbnail
            key={idx}
            $isActive={idx === currentIndex}
            onClick={() => {
              setCurrentIndex(idx);
              setAnimationKey(prev => prev + 1);
            }}
          >
            <img src={img} alt={`Thumb ${idx}`} />
          </Thumbnail>
        ))}
      </ThumbnailStrip>
    </Overlay>
  );
};

export default ImageLightbox;
