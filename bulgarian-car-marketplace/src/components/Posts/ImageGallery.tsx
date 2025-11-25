// Smart Image Gallery Component
// Intelligent layout based on number of images (1-5)
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Smart layout based on number of images
  const renderGallery = () => {
    switch (images.length) {
      case 1:
        // Single image - full width
        return (
          <SingleImageLayout>
            <ImageWrapper onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Post image 1" />
            </ImageWrapper>
          </SingleImageLayout>
        );

      case 2:
        // Two images - side by side
        return (
          <TwoImageLayout>
            {images.map((img, idx) => (
              <ImageWrapper key={idx} onClick={() => openLightbox(idx)}>
                <img src={img} alt={`Post image ${idx + 1}`} />
              </ImageWrapper>
            ))}
          </TwoImageLayout>
        );

      case 3:
        // Three images - one large left, two stacked right
        return (
          <ThreeImageLayout>
            <LargeImageWrapper onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Post image 1" />
            </LargeImageWrapper>
            <SmallImagesColumn>
              <ImageWrapper onClick={() => openLightbox(1)}>
                <img src={images[1]} alt="Post image 2" />
              </ImageWrapper>
              <ImageWrapper onClick={() => openLightbox(2)}>
                <img src={images[2]} alt="Post image 3" />
              </ImageWrapper>
            </SmallImagesColumn>
          </ThreeImageLayout>
        );

      case 4:
        // Four images - 2x2 grid
        return (
          <FourImageLayout>
            {images.map((img, idx) => (
              <ImageWrapper key={idx} onClick={() => openLightbox(idx)}>
                <img src={img} alt={`Post image ${idx + 1}`} />
              </ImageWrapper>
            ))}
          </FourImageLayout>
        );

      case 5:
        // Five images - 2 large on top, 3 small on bottom
        return (
          <FiveImageLayout>
            <TopRow>
              <ImageWrapper onClick={() => openLightbox(0)}>
                <img src={images[0]} alt="Post image 1" />
              </ImageWrapper>
              <ImageWrapper onClick={() => openLightbox(1)}>
                <img src={images[1]} alt="Post image 2" />
              </ImageWrapper>
            </TopRow>
            <BottomRow>
              {images.slice(2).map((img, idx) => (
                <ImageWrapper key={idx + 2} onClick={() => openLightbox(idx + 2)}>
                  <img src={img} alt={`Post image ${idx + 3}`} />
                </ImageWrapper>
              ))}
            </BottomRow>
          </FiveImageLayout>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GalleryContainer>{renderGallery()}</GalleryContainer>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox onClick={closeLightbox}>
          <LightboxContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeLightbox}>
              <X size={28} />
            </CloseButton>

            {images.length > 1 && (
              <>
                <NavButton $direction="left" onClick={prevImage}>
                  <ChevronLeft size={36} strokeWidth={2.5} />
                </NavButton>
                <NavButton $direction="right" onClick={nextImage}>
                  <ChevronRight size={36} strokeWidth={2.5} />
                </NavButton>
              </>
            )}

            <LightboxImage src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} />

            <ImageCounter>
              {currentIndex + 1} / {images.length}
            </ImageCounter>
          </LightboxContent>
        </Lightbox>
      )}
    </>
  );
};

// ==================== STYLED COMPONENTS ====================

const GalleryContainer = styled.div`
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
`;

// Single Image Layout
const SingleImageLayout = styled.div`
  width: 100%;
`;

const ImageWrapper = styled.div`
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: #f8f9fa;
  border-radius: 8px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

// Two Images Layout (Side by Side)
const TwoImageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  aspect-ratio: 2 / 1;
  
  ${ImageWrapper} {
    height: 100%;
  }
`;

// Three Images Layout (1 large + 2 stacked)
const ThreeImageLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4px;
  aspect-ratio: 16 / 9;
`;

const LargeImageWrapper = styled(ImageWrapper)`
  height: 100%;
`;

const SmallImagesColumn = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  height: 100%;
`;

// Four Images Layout (2x2 Grid)
const FourImageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  aspect-ratio: 1 / 1;
  
  ${ImageWrapper} {
    aspect-ratio: 1 / 1;
  }
`;

// Five Images Layout (2 top + 3 bottom)
const FiveImageLayout = styled.div`
  display: grid;
  grid-template-rows: 1fr 0.6fr;
  gap: 4px;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

// Lightbox Styles
const Lightbox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LightboxContent = styled.div`
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10001;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const NavButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${p => p.$direction}: 20px;
  transform: translateY(-50%);
  width: 56px;
  height: 80px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10001;
  
  svg {
    width: 36px !important;
    height: 36px !important;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: white;
    transform: translateY(-50%) translateX(${p => p.$direction === 'left' ? '-4px' : '4px'});
    
    svg {
      transform: translateX(${p => p.$direction === 'left' ? '-2px' : '2px'});
    }
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 64px;
    ${p => p.$direction}: 10px;
    
    svg {
      width: 28px !important;
      height: 28px !important;
    }
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

export default ImageGallery;

