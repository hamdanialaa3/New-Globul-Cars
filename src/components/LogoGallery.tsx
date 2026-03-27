// src/components/LogoGallery.tsx
// Component for displaying project logos throughout the application

import React from 'react';
import './LogoGallery.css';

const mainLogo = '/logo.webp';

interface LogoGalleryProps {
  variant?: 'hero' | 'footer' | 'sidebar' | 'header' | 'showcase';
  showAll?: boolean;
  className?: string;
}

const LogoGallery: React.FC<LogoGalleryProps> = ({
  variant = 'showcase',
  showAll = false,
  className = ''
}) => {
  const logos = [
    { src: mainLogo, alt: 'Globul Cars Official Logo', className: 'main-logo' }
  ];

  const getLogosToShow = () => logos;

  const logosToShow = getLogosToShow();

  return (
    <div className={`logo-gallery ${variant} ${className}`}>
      {logosToShow.map((logo, index) => (
        <div key={index} className={`logo-item ${logo.className}`}>
          <img
            src={logo.src}
            alt={logo.alt}
            className="logo-image"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export default LogoGallery;
