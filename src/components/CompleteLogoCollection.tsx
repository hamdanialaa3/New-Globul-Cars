import { logger } from '../services/logger-service';
// src/components/CompleteLogoCollection.tsx
// Dynamic Logo Collection with Rotating Images

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface CompleteLogoCollectionProps {
  imageSize?: number;
  rotationSpeed?: number;
  showCount?: number;
}

const CollectionContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const LogoGrid = styled.div<{ showCount: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const LogoFrame = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #005ca9;
  box-shadow: 0 8px 32px rgba(0, 84, 169, 0.2);
  transition: all 0.5s ease;
  position: relative;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(0, 84, 169, 0.3);
    border-color: #003d73;
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: linear-gradient(45deg, #005ca9, #007bff, #005ca9);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const LogoImage = styled.img<{ isVisible: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 1s ease-in-out;
  opacity: ${props => props.isVisible ? 1 : 0};
  position: absolute;
  top: 0;
  left: 0;
`;

const LogoTitle = styled.h3`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #005ca9;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`;

const LogoDescription = styled.p`
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.4;
  max-width: 180px;
`;

const LogoCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const CompleteLogoCollection: React.FC<CompleteLogoCollectionProps> = ({
  imageSize = 180,
  rotationSpeed = 4000,
  showCount = 8
}) => {
  const [currentIndices, setCurrentIndices] = useState<number[]>([]);
  const [images, setImages] = useState<string[]>([]);

  // Load images from the Pic folder
  useEffect(() => {
    const loadImages = async () => {
      try {
        // List of image files from the Pic folder
        const imageFiles = [
          '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
          '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
          '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg'
        ];

        // Convert to URLs
        const imageUrls = imageFiles.map(file => `/src/assets/images/Pic/${file}`);
        setImages(imageUrls);

        // Initialize current indices
        const initialIndices = Array.from({ length: showCount }, (_, i) =>
          Math.floor(Math.random() * imageUrls.length)
        );
        setCurrentIndices(initialIndices);
      } catch (error) {
        logger.error('Error loading images:', error);
      }
    };

    loadImages();
  }, [showCount]);

  // Rotate images
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndices(prev => prev.map(() =>
        Math.floor(Math.random() * images.length)
      ));
    }, rotationSpeed);

    return () => clearInterval(interval);
  }, [images.length, rotationSpeed]);

  const logoDescriptions = [
    { title: "Primary Logo", description: "Our main brand identity used across all platforms" },
    { title: "Icon Version", description: "Compact logo for mobile apps and favicons" },
    { title: "Horizontal", description: "Wide format perfect for headers and banners" },
    { title: "Vertical", description: "Tall format ideal for business cards and documents" },
    { title: "Monochrome", description: "Black and white version for official documents" },
    { title: "Minimal", description: "Simplified version for small spaces" },
    { title: "Badge", description: "Circular badge for social media profiles" },
    { title: "Wordmark", description: "Text-only version for flexible branding" }
  ];

  return (
    <CollectionContainer>
      <LogoGrid showCount={showCount}>
        {Array.from({ length: showCount }, (_, index) => (
          <LogoCard key={index}>
            <LogoFrame size={imageSize}>
              {images.length > 0 && (
                <LogoImage
                  src={images[currentIndices[index] % images.length] || ''}
                  alt={`Logo ${index + 1}`}
                  isVisible={true}
                  onError={(e) => {
                    logger.error('Image failed to load:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </LogoFrame>
            <LogoTitle>{logoDescriptions[index % logoDescriptions.length].title}</LogoTitle>
            <LogoDescription>{logoDescriptions[index % logoDescriptions.length].description}</LogoDescription>
          </LogoCard>
        ))}
      </LogoGrid>
    </CollectionContainer>
  );
};

export default CompleteLogoCollection;