// src/pages/HomePage/ImageGallerySection.tsx
// Image gallery section component for HomePage

import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
    font-size: 2.5rem;
    font-weight: bold;
    color: #005ca9;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
    max-width: 600px;
    margin: 0 auto 2rem;
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

const LoadingFallback = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ImageGallerySectionComponent: React.FC = () => {
  return (
    <ImageGallerySection>
      <SectionContainer>
        <SectionHeader>
          <h2>Image Gallery</h2>
          <p>
            Explore our comprehensive collection of high-quality images showcasing our brand identity and visual assets.
          </p>
          <ViewGalleryButton to="/image-gallery">
            View Full Gallery →
          </ViewGalleryButton>
        </SectionHeader>

        <Suspense fallback={<LoadingFallback>Loading image gallery...</LoadingFallback>}>
          {React.createElement(
            lazy(() => import('../../components/ImageGallery')),
            {
              images: [
                '/images/gallery/car1.jpg',
                '/images/gallery/car2.jpg',
                '/images/gallery/car3.jpg',
                '/images/gallery/car4.jpg',
                '/images/gallery/car5.jpg',
                '/images/gallery/car6.jpg',
                '/images/gallery/car7.jpg',
                '/images/gallery/car8.jpg',
                '/images/gallery/car9.jpg',
                '/images/gallery/car10.jpg',
                '/images/gallery/car11.jpg',
                '/images/gallery/car12.jpg'
              ],
              showThumbnails: true,
              maxThumbnails: 12
            }
          )}
        </Suspense>
      </SectionContainer>
    </ImageGallerySection>
  );
};

export default ImageGallerySectionComponent;