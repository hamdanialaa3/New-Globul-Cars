// src/components/LogoGallery.tsx
// Component for displaying project logos throughout the application

import React from 'react';
import './LogoGallery.css';

// Import logos
import mainLogo from '@/assets/logos/Copilot_20250926_020323.png';
import logo1 from '@/assets/logos/1 (1).png';
import logo2 from '@/assets/logos/Copilot_20250926_030243.png';
import logo3 from '@/assets/logos/Copilot_20250926_021333.png';
import logo4 from '@/assets/logos/Copilot_20250926_020825.png';
import logo5 from '@/assets/logos/Copilot_20250926_020259.png';

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
    { src: mainLogo, alt: 'Globul Cars Main Logo', className: 'main-logo' },
    { src: logo1, alt: 'Globul Cars Logo 1', className: 'logo-variant-1' },
    { src: logo2, alt: 'Globul Cars Logo 2', className: 'logo-variant-2' },
    { src: logo3, alt: 'Globul Cars Logo 3', className: 'logo-variant-3' },
    { src: logo4, alt: 'Globul Cars Logo 4', className: 'logo-variant-4' },
    { src: logo5, alt: 'Globul Cars Logo 5', className: 'logo-variant-5' },
  ];

  const getLogosToShow = () => {
    if (showAll) return logos;

    switch (variant) {
      case 'hero':
        return [logos[0], logos[1]]; // Main logo + one variant
      case 'header':
        return [logos[0]]; // Only main logo
      case 'footer':
        return [logos[0], logos[1], logos[2]]; // Main + two variants
      case 'sidebar':
        return [logos[0], logos[3]]; // Main + different variant
      case 'showcase':
      default:
        return logos.slice(0, 4); // First 4 logos
    }
  };

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