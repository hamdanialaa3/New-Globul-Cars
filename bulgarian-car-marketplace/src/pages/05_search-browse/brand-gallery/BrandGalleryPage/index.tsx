// src/pages/BrandGalleryPage.tsx
// Brand Gallery Page showcasing all Globul Cars logos and dynamic image gallery

import React from 'react';
import styled from 'styled-components';
import LogoGallery from '@/components/LogoGallery';
import CircularImageGallery from '@/components/CircularImageGallery';

const BrandContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`;

const BrandHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const BrandTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const BrandDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const GallerySection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const ImageGallerySection = styled.section`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['4xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const LogoShowcase = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['4xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing['2xl']};
  margin-top: ${({ theme }) => theme.spacing['3xl']};
`;

const LogoCard = styled.div`
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  img {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }
`;

const BrandGalleryPage: React.FC = () => {
  const logoDescriptions = [
    {
      title: "Main Logo",
      description: "The primary Globul Cars logo featuring our signature car icon and brand name. Used across all main branding materials."
    },
    {
      title: "Logo Variant 1",
      description: "A circular variant of our logo, perfect for profile pictures and small icon displays."
    },
    {
      title: "Logo Variant 2",
      description: "A bordered version with blue accent, ideal for certificates and official documents."
    },
    {
      title: "Logo Variant 3",
      description: "A clean, minimal version with subtle background, great for presentations and digital media."
    },
    {
      title: "Logo Variant 4",
      description: "A grayscale variant for formal documents and professional correspondence."
    },
    {
      title: "Logo Variant 5",
      description: "An enhanced version with shadow effects, perfect for marketing materials and advertisements."
    }
  ];

  return (
    <BrandContainer>
      <BrandHeader>
        <BrandTitle>Globul Cars Brand Gallery</BrandTitle>
        <BrandDescription>
          Explore our complete brand identity collection. Each logo variant is carefully designed
          to maintain brand consistency across different mediums and applications.
        </BrandDescription>
      </BrandHeader>

      <GallerySection>
        <LogoShowcase>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#005ca9',
            marginBottom: '1rem'
          }}>
            Complete Logo Collection
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#6c757d',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Our logos are designed to be versatile, professional, and instantly recognizable
            across all platforms and media types.
          </p>

          <LogoGallery variant="showcase" showAll={true} />

          <LogoGrid>
            {logoDescriptions.map((logo, index) => (
              <LogoCard key={index}>
                <h3>{logo.title}</h3>
                <p>{logo.description}</p>
              </LogoCard>
            ))}
          </LogoGrid>
        </LogoShowcase>

        {/* Dynamic Circular Image Gallery */}
        <ImageGallerySection>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#005ca9',
            marginBottom: '1rem'
          }}>
            Dynamic Image Gallery
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#6c757d',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Experience our rotating image gallery featuring beautiful car photography.
            Images change automatically every few seconds with smooth transitions.
          </p>

          <CircularImageGallery
            imageSize={180}
            rotationSpeed={4000}
            showCount={8}
          />
        </ImageGallerySection>
      </GallerySection>
    </BrandContainer>
  );
};

export default BrandGalleryPage;