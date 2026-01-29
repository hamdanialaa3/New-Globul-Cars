// src/pages/BrandGalleryPage.tsx
// Brand Gallery Page showcasing all Globul Cars logos and dynamic image gallery

import React from 'react';
import styled from 'styled-components';
import LogoGallery from '../../../../components/LogoGallery';
import CircularImageGallery from '../../../../components/CircularImageGallery';

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
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.xl};
  padding: ${({ theme }) => theme.spacing['4xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const LogoShowcase = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.xl};
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
  border-radius: ${({ theme }) => theme.colors.border.defaultRadius.lg};
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
    border-radius: ${({ theme }) => theme.colors.border.defaultRadius.md};
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

        {/* Company Footer with Social Media */}
        <div style={{ 
          marginTop: '3rem', 
          padding: '2rem', 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderRadius: '12px', 
          textAlign: 'center',
          fontSize: '0.95em'
        }}>
          <strong>Alaa Technologies</strong><br />
          77 Tsar Simeon Blvd, Sofia, Bulgaria | 📧 info@koli.one | 📞 +359 87 983 9671 (Text only)<br />
          
          {/* Social Media Links */}
          <div style={{ marginTop: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://www.facebook.com/koli.one/" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: '#1877f2', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/kolione/" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.youtube.com/@Kolionebg" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: '#ff0000', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/koli-one-a011993a9/" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: '#0077b5', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://x.com/kolionebg" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="X (Twitter)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@mobilebg.eu" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            </a>
            <a href="https://www.threads.com/@kolione" target="_blank" rel="noopener noreferrer" 
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: '#000000', color: 'white', textDecoration: 'none', transition: 'transform 0.3s' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} title="Threads">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.057-1.83.339-2.43.84-.537.449-.827 1.014-.794 1.546.032.496.296.936.764 1.273.555.4 1.27.574 2.068.527 1.06-.058 1.857-.4 2.37-1.016.45-.54.73-1.314.833-2.3-.73-.244-1.485-.43-2.252-.555-2.81-.457-5.03.196-6.61 1.942-1.298 1.437-1.946 3.305-1.875 5.403.07 2.098.948 3.834 2.541 5.02 1.412.952 3.14 1.43 5.14 1.43 3.302 0 5.83-1.218 7.513-3.619 1.31-1.869 1.972-4.302 1.972-7.236 0-2.933-.663-5.366-1.972-7.236-1.683-2.401-4.21-3.619-7.513-3.619z"/></svg>
            </a>
          </div>
          
          <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
            © 2026 Alaa Technologies. All rights reserved.
          </span>
        </div>
      </GallerySection>
    </BrandContainer>
  );
};

export default BrandGalleryPage;