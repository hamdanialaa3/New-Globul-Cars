// src/components/CircularImageGallery.tsx
// Dynamic Circular Image Gallery with rotating images

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Use public folder images (no imports needed - direct paths)
// Array of all gallery images from public/assets/images/Pic/
const images = [
  '/assets/images/Pic/car_inside (1).jpg',
  '/assets/images/Pic/car_inside (2).jpg',
  '/assets/images/Pic/car_inside (3).jpg',
  '/assets/images/Pic/car_inside (4).jpg',
  '/assets/images/Pic/car_inside (5).jpg',
  '/assets/images/Pic/car_inside (6).jpg',
  '/assets/images/Pic/car_inside (7).jpg',
  '/assets/images/Pic/car_inside (8).jpg',
  '/assets/images/Pic/car_inside (9).jpg',
  '/assets/images/Pic/car_inside (10).jpg',
  '/assets/images/Pic/car_inside (11).jpg',
  '/assets/images/Pic/car_inside (12).jpg',
  '/assets/images/Pic/car_inside (13).jpg',
  '/assets/images/Pic/car_inside (14).jpg',
  '/assets/images/Pic/car_inside (15).jpg',
  '/assets/images/Pic/car_inside (16).jpg',
  '/assets/images/Pic/car_inside (17).jpg',
  '/assets/images/Pic/car_inside (18).jpg',
  '/assets/images/Pic/car_inside (19).jpg',
  '/assets/images/Pic/car_inside (20).jpg',
  '/assets/images/Pic/pexels-aboodi-18435540.jpg',
  '/assets/images/Pic/pexels-alexgtacar-745150-1592384.jpg',
  '/assets/images/Pic/pexels-bertellifotografia-799443.jpg',
  '/assets/images/Pic/pexels-boris-dahm-2150922402-31729752.jpg',
  '/assets/images/Pic/pexels-bylukemiller-29566896.jpg',
  '/assets/images/Pic/pexels-bylukemiller-29566897.jpg',
  '/assets/images/Pic/pexels-bylukemiller-29566898.jpg',
  '/assets/images/Pic/pexels-peely-712618.jpg',
  '/assets/images/Pic/pexels-james-collington-2147687246-30772805.jpg',
  '/assets/images/Pic/pexels-tomfisk-10034071.jpg',
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