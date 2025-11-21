// src/pages/HomePage/ImageGallerySection.tsx
// Image gallery section component for HomePage with auto-rotating slideshow

import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';
import { logger } from '@globul-cars/services';

const ImageGallerySection = styled.section`
  background: var(--bg-secondary);
  padding: 4rem 0;
  position: relative;
  z-index: 1;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h2 {
    font-size: 1.75rem;
    font-weight: bold;
    color: var(--accent-primary);
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }
  
  @media (max-width: 768px) {
    h2 {
      font-size: 1.5rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 600px) {
    margin-bottom: 2rem;
    
    h2 {
      font-size: 1.375rem;
    }
    
    p {
      font-size: 0.875rem;
    }
  }
`;

const ViewGalleryButton = styled(Link)`
  display: inline-block;
  background: var(--accent-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid var(--accent-primary);

  &:hover {
    background: var(--bg-card);
    color: var(--accent-primary);
  }
`;

const SlideshowContainer = styled.div`
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
`;

const SlideImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
  animation: fadeIn 0.5s ease-in-out;
  loading: lazy;
  decoding: async;

  @keyframes fadeIn {
    from {
      opacity: 0.7;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--accent-primary);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: var(--shadow-md);

  svg {
    width: 28px;
    height: 28px;
    stroke-width: 2.5;
  }

  &:hover {
    background: var(--accent-primary);
    transform: translateY(-50%) scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  &.prev {
    left: 20px;
  }

  &.next {
    right: 20px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    svg {
      width: 24px;
      height: 24px;
    }

    &.prev {
      left: 10px;
    }

    &.next {
      right: 10px;
    }
  }
`;

const DotsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  background: ${({ $active }) => ($active ? 'var(--bg-card)' : 'var(--bg-card)')};
  opacity: ${({ $active }) => ($active ? '1' : '0.4')};
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    opacity: 1;
    transform: scale(1.3);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  opacity: 0.9;
  z-index: 10;
`;

// ✅ OPTIMIZED: Reduced from 50+ images to 12 best quality images for better performance
const GALLERY_IMAGE_NAMES = [
  'pexels-pixabay-248747.jpg',
  'pexels-pixabay-315938.jpg',
  'pexels-kelly-2402235.jpg',
  'pexels-tomfisk-10034071.jpg',
  'pexels-tomfisk-5982896.jpg',
  'pexels-albinberlin-919073.jpg',
  'pexels-maoriginalphotography-1454253.jpg',
  'pexels-peely-712618.jpg',
  'pexels-renato-rocca-2397962-5800943.jpg',
  'pexels-vraj-shah-115200-638479.jpg',
  'CX0008a_25-3.webp',
  'carpic.jpg'
];

const ImageGallerySectionComponent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [preloadedImages, setPreloadedImages] = useState<Map<number, string>>(new Map());

  // ✅ Preload current, next, and previous images only
  useEffect(() => {
    const loadImages = async () => {
      const imagesToLoad = [
        currentIndex,
        (currentIndex + 1) % GALLERY_IMAGE_NAMES.length,
        (currentIndex - 1 + GALLERY_IMAGE_NAMES.length) % GALLERY_IMAGE_NAMES.length
      ];

      const newPreloaded = new Map(preloadedImages);
      
      for (const idx of imagesToLoad) {
        if (!newPreloaded.has(idx)) {
          try {
            const imgModule = await import(`../../../../assets/images/gallery/${GALLERY_IMAGE_NAMES[idx]}`);
            newPreloaded.set(idx, imgModule.default);
          } catch (error) {
            logger.error('Failed to load gallery image', error as Error, { imageName: GALLERY_IMAGE_NAMES[idx], index: idx });
          }
        }
      }

      setPreloadedImages(newPreloaded);
      setCurrentImage(newPreloaded.get(currentIndex) || '');
    };

    loadImages();
  }, [currentIndex]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % GALLERY_IMAGE_NAMES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? GALLERY_IMAGE_NAMES.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % GALLERY_IMAGE_NAMES.length
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const { language } = useLanguage();
  
  if (GALLERY_IMAGE_NAMES.length === 0) {
    return (
      <ImageGallerySection>
        <SectionContainer>
          <SectionHeader>
            <h2>{language === 'bg' ? 'Галерия със снимки' : 'Image Gallery'}</h2>
            <p>{language === 'bg' ? 'В момента няма налични изображения.' : 'No images available at the moment.'}</p>
          </SectionHeader>
        </SectionContainer>
      </ImageGallerySection>
    );
  }

  return (
    <ImageGallerySection>
      <SectionContainer>
        <SectionHeader>
          <h2>{language === 'bg' ? 'Галерия със снимки' : 'Image Gallery'}</h2>
          <p>
            {language === 'bg' 
              ? 'Разгледайте нашата обширна колекция от високо качество изображения, показващи нашата идентичност и визуални активи.'
              : 'Explore our comprehensive collection of high-quality images showcasing our brand identity and visual assets.'}
          </p>
          <ViewGalleryButton to="/image-gallery">
            {language === 'bg' ? 'Виж цялата галерия →' : 'View Full Gallery →'}
          </ViewGalleryButton>
        </SectionHeader>

        <SlideshowContainer>
          {currentImage && (
            <SlideImage 
              src={currentImage} 
              alt={`Gallery image ${currentIndex + 1}`}
              key={currentIndex}
            />
          )}
          
          <NavButton className="prev" onClick={handlePrevious}>
            <ChevronLeft size={24} />
          </NavButton>
          
          <NavButton className="next" onClick={handleNext}>
            <ChevronRight size={24} />
          </NavButton>

          <ImageCounter>
            {currentIndex + 1} / {GALLERY_IMAGE_NAMES.length}
          </ImageCounter>

          <DotsContainer>
            {GALLERY_IMAGE_NAMES.slice(0, 10).map((_, index) => (
              <Dot
                key={index}
                $active={index === currentIndex}
                onClick={() => handleDotClick(index)}
              />
            ))}
            {GALLERY_IMAGE_NAMES.length > 10 && <span style={{ color: 'white', fontSize: '12px' }}>...</span>}
          </DotsContainer>
        </SlideshowContainer>
      </SectionContainer>
    </ImageGallerySection>
  );
};

export default memo(ImageGallerySectionComponent);