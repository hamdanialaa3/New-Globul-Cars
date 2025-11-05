// src/pages/HomePage/ImageGallerySection.tsx
// Image gallery section component for HomePage with auto-rotating slideshow

import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/services/logger-service';

const ImageGallerySection = styled.section`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: #6c757d;
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
  background: #005ca9;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid #005ca9;

  &:hover {
    background: white;
    color: #005ca9;
  }
`;

const SlideshowContainer = styled.div`
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 92, 169, 0.2);
`;

const SlideImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
  animation: fadeIn 0.5s ease-in-out;

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
  background: rgba(0, 92, 169, 0.8);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 92, 169, 1);
    transform: translateY(-50%) scale(1.1);
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
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: ${({ $active }) => ($active ? 'white' : 'rgba(255, 255, 255, 0.3)')};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: scale(1.2);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  z-index: 10;
`;

// ✅ Gallery image names only - no eager loading!
const GALLERY_IMAGE_NAMES = [
  'car_inside (1).jpg',
  'car_inside (2).jpg',
  'car_inside (3).jpg',
  'car_inside (4).jpg',
  'car_inside (5).jpg',
  'car_inside (6).jpg',
  'car_inside (7).jpg',
  'car_inside (8).jpg',
  'car_inside (9).jpg',
  'car_inside (10).jpg',
  'car_inside (11).jpg',
  'car_inside (12).jpg',
  'car_inside (13).jpg',
  'car_inside (14).jpg',
  'car_inside (15).jpg',
  'car_inside (16).jpg',
  'car_inside (17).jpg',
  'car_inside (18).jpg',
  'car_inside (19).jpg',
  'car_inside (20).jpg',
  'car_inside (21).jpg',
  'carpic.jpg',
  'CX0008a_25-3.webp',
  'pexels-aboodi-18435540.jpg',
  'pexels-albinberlin-919073.jpg',
  'pexels-alexgtacar-745150-1592384.jpg',
  'pexels-apvibes-28355547.jpg',
  'pexels-axp-photography-500641970-19573775.jpg',
  'pexels-bertellifotografia-799443.jpg',
  'pexels-boris-dahm-2150922402-31729752.jpg',
  'pexels-bylukemiller-29566896.jpg',
  'pexels-bylukemiller-29566897.jpg',
  'pexels-bylukemiller-29566898.jpg',
  'pexels-bylukemiller-29566908 (1).jpg',
  'pexels-bylukemiller-29566908.jpg',
  'pexels-eden-fc-620771246-25456655.jpg',
  'pexels-griffinw-4978527.jpg',
  'pexels-hector-portillo-1114457866-28158983.jpg',
  'pexels-imperioame-16094485.jpg',
  'pexels-james-collington-2147687246-30772805.jpg',
  'pexels-jtesiniphoto-23247891.jpg',
  'pexels-juan-montes-92812630-32132995.jpg',
  'pexels-katrineskrebele-11519208.jpg',
  'pexels-kelly-2402235.jpg',
  'pexels-maoriginalphotography-1454253.jpg',
  'pexels-ogproductionz-15825383.jpg',
  'pexels-peely-712618.jpg',
  'pexels-pixabay-248747.jpg',
  'pexels-pixabay-315938.jpg',
  'pexels-renato-rocca-2397962-5800943.jpg',
  'pexels-rockwell-branding-agency-85164430-9137238.jpg',
  'pexels-smepictures-14240072.jpg',
  'pexels-tomfisk-10034071.jpg',
  'pexels-tomfisk-5982896.jpg',
  'pexels-vika-glitter-392079-16011264.jpg',
  'pexels-vraj-shah-115200-638479.jpg',
  'pexels-weickmann-32634336.jpg',
  'unnamed.jpg',
  'XXXXXX.jpg'
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