import React from 'react';
import styled, { keyframes } from 'styled-components';

const mainLogo = '/logo.png';

// (Comment removed - was in Arabic)
const glowRotation = keyframes`
  0% {
    filter: 
      drop-shadow(0 0 15px #8a2be2) 
      drop-shadow(0 0 25px #8a2be2) 
      drop-shadow(0 0 35px rgba(138, 43, 226, 0.5));
  }
  20% {
    filter: 
      drop-shadow(0 0 15px #6a5acd) 
      drop-shadow(0 0 25px #6a5acd) 
      drop-shadow(0 0 35px rgba(106, 90, 205, 0.5));
  }
  40% {
    filter: 
      drop-shadow(0 0 15px #4169e1) 
      drop-shadow(0 0 25px #4169e1) 
      drop-shadow(0 0 35px rgba(65, 105, 225, 0.5));
  }
  60% {
    filter: 
      drop-shadow(0 0 15px #1e90ff) 
      drop-shadow(0 0 25px #1e90ff) 
      drop-shadow(0 0 35px rgba(30, 144, 255, 0.5));
  }
  80% {
    filter: 
      drop-shadow(0 0 15px #ff1493) 
      drop-shadow(0 0 25px #ff1493) 
      drop-shadow(0 0 35px rgba(255, 20, 147, 0.5));
  }
  100% {
    filter: 
      drop-shadow(0 0 15px #8a2be2) 
      drop-shadow(0 0 25px #8a2be2) 
      drop-shadow(0 0 35px rgba(138, 43, 226, 0.5));
  }
`;

// (Comment removed - was in Arabic)
const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
`;

// (Comment removed - was in Arabic)
const AnimatedLogo = styled.img`
  width: 120px;
  height: auto;
  animation: ${glowRotation} 4s ease-in-out infinite;
  transition: all 0.3s ease;
  cursor: pointer;
  
  /* (Comment removed - was in Arabic)
  background: transparent;
  
  /* (Comment removed - was in Arabic)
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  
  &:hover {
    transform: scale(1.15) rotate(5deg);
    animation-duration: 2s;
    filter: 
      drop-shadow(0 0 20px #fff) 
      drop-shadow(0 0 30px #8a2be2) 
      drop-shadow(0 0 40px #4169e1);
  }
  
  /* (Comment removed - was in Arabic)
  &:active {
    transform: scale(0.95);
  }
`;

// (Comment removed - was in Arabic)
const LogoText = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

interface GlowingLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  text?: string;
  className?: string;
}

const GlowingLogo: React.FC<GlowingLogoProps> = ({
  size = 'medium',
  showText = false,
  text = 'Globul Cars',
  className = ''
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '80px' };
      case 'large':
        return { width: '160px' };
      default:
        return { width: '120px' };
    }
  };

  return (
    <LogoContainer className={className}>
      <div>
        <AnimatedLogo
          src={mainLogo}
          alt="Globul Cars Logo"
          style={getSizeStyles()}
        />
        {showText && <LogoText>{text}</LogoText>}
      </div>
    </LogoContainer>
  );
};

export default GlowingLogo;