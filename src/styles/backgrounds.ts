// Centralized Background Configuration
// Professional Metal Textures for Koli One

export const BACKGROUNDS = {
  // Metal BG 1 - Premium plate with frame (Best for HomePage)
  HOMEPAGE: {
    image: '/assets/backgrounds/metal-bg-1.jpg',
    style: `
      background-image: url('/assets/backgrounds/metal-bg-1.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
    `
  },
  
  // Metal BG 2 - Hexagonal with plate (Best for Auth Pages - Security)
  AUTH: {
    image: '/assets/backgrounds/metal-bg-2.jpg',
    style: `
      background-image: url('/assets/backgrounds/metal-bg-2.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
      filter: blur(2px);
    `
  },
  
  // Metal BG 3 - Bolts with hexagonal (Best for Profile - Personal & Strong)
  PROFILE: {
    image: '/assets/backgrounds/metal-bg-3.jpg',
    style: `
      background-image: url('/assets/backgrounds/metal-bg-3.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
      filter: blur(1px);
    `
  },
  
  // Metal BG 4 - Smooth with small hexagonal (Best for Dashboard - Professional)
  DASHBOARD: {
    image: '/assets/backgrounds/metal-bg-4.jpg',
    style: `
      background-image: url('/assets/backgrounds/metal-bg-4.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
      filter: blur(1.5px);
    `
  },
  
  // Metal BG 5 - Three plates (Best for Sell Pages - Organization)
  SELL: {
    image: '/assets/backgrounds/metal-bg-5.jpg',
    style: `
      background-image: url('/assets/backgrounds/metal-bg-5.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
      filter: blur(2px);
    `
  },
  
  // Metal BG 6 - Two plates (Best for Admin - Power & Control)
  ADMIN: {
    image: '/assets/backgrounds/metal-bg-6.jpg',
    style: `
      background-image: url('/assets/backgrounds/metal-bg-6.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
      filter: blur(1px);
    `
  }
};

// Helper function to apply background with overlay
export const getBackgroundStyle = (
  type: keyof typeof BACKGROUNDS,
  overlayOpacity: number = 0.85
) => `
  position: relative;
  ${BACKGROUNDS[type].style}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, ${overlayOpacity});
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

