// src/components/CircularImageGallery.tsx
// Dynamic Circular Image Gallery with rotating images

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Static imports for gallery images (since require.context doesn't work in this setup)
import image1 from '@/assets/images/gallery/carpic.jpg';
import image2 from '@/assets/images/gallery/car_inside (1).jpg';
import image3 from '@/assets/images/gallery/car_inside (2).jpg';
import image4 from '@/assets/images/gallery/car_inside (3).jpg';
import image5 from '@/assets/images/gallery/car_inside (4).jpg';
import image6 from '@/assets/images/gallery/car_inside (5).jpg';
import image7 from '@/assets/images/gallery/car_inside (6).jpg';
import image8 from '@/assets/images/gallery/car_inside (7).jpg';
import image9 from '@/assets/images/gallery/car_inside (8).jpg';
import image10 from '@/assets/images/gallery/car_inside (9).jpg';
import image11 from '@/assets/images/gallery/car_inside (10).jpg';
import image12 from '@/assets/images/gallery/car_inside (11).jpg';
import image13 from '@/assets/images/gallery/car_inside (12).jpg';
import image14 from '@/assets/images/gallery/car_inside (13).jpg';
import image15 from '@/assets/images/gallery/car_inside (14).jpg';
import image16 from '@/assets/images/gallery/car_inside (15).jpg';
import image17 from '@/assets/images/gallery/car_inside (16).jpg';
import image18 from '@/assets/images/gallery/car_inside (17).jpg';
import image19 from '@/assets/images/gallery/car_inside (18).jpg';
import image20 from '@/assets/images/gallery/car_inside (19).jpg';
import image21 from '@/assets/images/gallery/car_inside (20).jpg';
import image22 from '@/assets/images/gallery/car_inside (21).jpg';
import image23 from '@/assets/images/gallery/CX0008a_25-3.webp';
import image24 from '@/assets/images/gallery/pexels-aboodi-18435540.jpg';
import image25 from '@/assets/images/gallery/pexels-albinberlin-919073.jpg';
import image26 from '@/assets/images/gallery/pexels-alexgtacar-745150-1592384.jpg';
import image27 from '@/assets/images/gallery/pexels-apvibes-28355547.jpg';
import image28 from '@/assets/images/gallery/pexels-axp-photography-500641970-19573775.jpg';
import image29 from '@/assets/images/gallery/pexels-bertellifotografia-799443.jpg';
import image30 from '@/assets/images/gallery/pexels-boris-dahm-2150922402-31729752.jpg';

// Array of all gallery images
const images = [
  image1, image2, image3, image4, image5, image6, image7, image8, image9, image10,
  image11, image12, image13, image14, image15, image16, image17, image18, image19, image20,
  image21, image22, image23, image24, image25, image26, image27, image28, image29, image30
];

interface CircularImageGalleryProps {
  className?: string;
  imageSize?: number;
  rotationSpeed?: number;
  showCount?: number;
}

const GalleryContainer = styled.div<{ imageSize: number }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  min-height: ${({ imageSize }) => imageSize + 100}px;
`;

const CircularFrame = styled.div<{ size: number; delay: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.primary.main};
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
    border-color: ${({ theme }) => theme.colors.secondary.main};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 1s ease-in-out;
  }
`;

const fadeInOut = keyframes`
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
`;

const AnimatedImage = styled.img<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  animation: ${fadeInOut} 4s ease-in-out infinite;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
`;

const CircularImageGallery: React.FC<CircularImageGalleryProps> = ({
  className = '',
  imageSize = 200,
  rotationSpeed = 3000, // 3 seconds
  showCount = 6
}) => {
  const [currentIndices, setCurrentIndices] = useState<number[]>(
    Array.from({ length: showCount }, (_, i) => i % images.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices(prevIndices =>
        prevIndices.map((_, index) => {
          // Rotate through all available images
          const nextIndex = (prevIndices[index] + 1) % images.length;
          return nextIndex;
        })
      );
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [rotationSpeed]);

  // Shuffle algorithm for more dynamic changes
  const getRandomImageIndex = (excludeIndices: number[]) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * images.length);
    } while (excludeIndices.includes(newIndex));
    return newIndex;
  };

  useEffect(() => {
    // Add some randomness to the rotation
    const randomInterval = setInterval(() => {
      setCurrentIndices(prevIndices => {
        const randomIndex = Math.floor(Math.random() * showCount);
        const newIndices = [...prevIndices];
        newIndices[randomIndex] = getRandomImageIndex(prevIndices);
        return newIndices;
      });
    }, rotationSpeed * 2); // Random change every 6 seconds

    return () => clearInterval(randomInterval);
  }, [rotationSpeed, showCount]);

  return (
    <GalleryContainer className={className} imageSize={imageSize}>
      {currentIndices.map((imageIndex, circleIndex) => (
        <CircularFrame
          key={circleIndex}
          size={imageSize}
          delay={circleIndex * 0.5}
        >
          <AnimatedImage
            src={images[imageIndex]}
            alt={`Gallery image ${imageIndex + 1}`}
            isVisible={true}
          />
        </CircularFrame>
      ))}
    </GalleryContainer>
  );
};

export default CircularImageGallery;