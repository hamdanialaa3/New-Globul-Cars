// BackgroundSlideshow.tsx - Premium Cinematic Background Transitions
// Multiple modern transition effects with Ken Burns, 3D transforms, and advanced animations

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

interface BackgroundSlideshowProps {
  images: string[];
  interval?: number;
  transitionDuration?: number;
}

// Advanced Animations
const kenBurnsZoomIn = keyframes`
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: scale(1.15) translate(-20px, -10px);
    opacity: 0;
  }
`;

const kenBurnsZoomOut = keyframes`
  0% {
    transform: scale(1.15) translate(-20px, -10px);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0;
  }
`;

const kenBurnsPanLeft = keyframes`
  0% {
    transform: scale(1.1) translateX(0);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: scale(1.15) translateX(-50px);
    opacity: 0;
  }
`;

const kenBurnsPanRight = keyframes`
  0% {
    transform: scale(1.1) translateX(-50px);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: scale(1.15) translateX(0);
    opacity: 0;
  }
`;

const rotateReveal = keyframes`
  0% {
    transform: scale(0.8) rotate(-5deg);
    opacity: 0;
    filter: blur(10px);
  }
  10% {
    opacity: 1;
    filter: blur(0px);
  }
  90% {
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0;
    filter: blur(10px);
  }
`;

const slideFromLeft = keyframes`
  0% {
    transform: translateX(-100%) scale(0.9);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%) scale(1.1);
    opacity: 0;
  }
`;

const zoomBlur = keyframes`
  0% {
    transform: scale(1.3);
    filter: blur(20px);
    opacity: 0;
  }
  15% {
    opacity: 1;
    filter: blur(0px);
  }
  85% {
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1);
    filter: blur(20px);
    opacity: 0;
  }
`;

const circularReveal = keyframes`
  0% {
    clip-path: circle(0% at 50% 50%);
    transform: scale(1.2);
    opacity: 0;
  }
  10% {
    opacity: 1;
    clip-path: circle(70% at 50% 50%);
  }
  90% {
    opacity: 1;
  }
  100% {
    clip-path: circle(0% at 50% 50%);
    transform: scale(1);
    opacity: 0;
  }
`;

const diagonalSlide = keyframes`
  0% {
    transform: translate(-100%, -100%) scale(0.8) rotate(-10deg);
    opacity: 0;
    filter: brightness(0.7);
  }
  10% {
    opacity: 1;
    filter: brightness(1);
  }
  90% {
    opacity: 1;
    filter: brightness(1);
  }
  100% {
    transform: translate(50px, 50px) scale(1.2) rotate(10deg);
    opacity: 0;
    filter: brightness(0.7);
  }
`;

const rippleEffect = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
    filter: blur(30px) brightness(1.5);
  }
  15% {
    opacity: 1;
    filter: blur(0px) brightness(1);
  }
  85% {
    opacity: 1;
    filter: blur(0px) brightness(1);
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
    filter: blur(30px) brightness(0.7);
  }
`;

const glitchTransition = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0;
  }
  2%, 98% {
    transform: translate(var(--glitch-x, 0), var(--glitch-y, 0)) scale(1);
    opacity: 1;
  }
  4% {
    transform: translate(-3px, 2px) scale(1.01);
  }
  8% {
    transform: translate(3px, -2px) scale(0.99);
  }
  12% {
    transform: translate(0, 0) scale(1);
  }
`;

// Get animation based on index for variety
const getAnimation = (index: number) => {
  const animations = [
    kenBurnsZoomIn,
    kenBurnsZoomOut,
    kenBurnsPanLeft,
    kenBurnsPanRight,
    rotateReveal,
    zoomBlur,
    circularReveal,
    diagonalSlide,
    rippleEffect
  ];
  return animations[index % animations.length];
};

// Styled Components
const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
`;

const BackgroundImage = styled.div<{ 
  $image: string; 
  $isActive: boolean; 
  $animation: any;
  $duration: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => props.$isActive ? 1 : 0};
  
  ${props => props.$isActive && css`
    animation: ${props.$animation} ${props.$duration}s ease-in-out;
  `}
  
  /* Performance: Only apply will-change and hardware acceleration to active elements */
  will-change: ${props => props.$isActive ? 'transform, opacity, filter' : 'auto'};
  
  /* Hardware acceleration only for active layer */
  transform: ${props => props.$isActive ? 'translateZ(0)' : 'none'};
  backface-visibility: hidden;
  perspective: 1000px;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.45) 30%,
    rgba(0, 0, 0, 0.35) 50%,
    rgba(0, 0, 0, 0.45) 70%,
    rgba(0, 0, 0, 0.75) 100%
  );
  z-index: 1;
  pointer-events: none;
  
  /* Animated gradient overlay */
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;

  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const VignetteOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 2;
  pointer-events: none;
`;

const ParticlesOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  opacity: 0.15;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    box-shadow: 
      ${Array.from({ length: 50 }, (_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2;
        return `${x}vw ${y}vh 0 ${size}px rgba(255, 255, 255, 0.5)`;
      }).join(', ')};
    animation: twinkle 3s ease-in-out infinite;
  }
  
  &::after {
    animation-delay: 1.5s;
  }

  @keyframes twinkle {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
`;

const BackgroundSlideshow: React.FC<BackgroundSlideshowProps> = ({ 
  images, 
  interval = 6000,
  transitionDuration = 6
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setNextIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <Container>
      {/* Render current and next image for smooth transition */}
      {images.map((image, index) => (
        <BackgroundImage
          key={`${image}-${index}`}
          $image={image}
          $isActive={index === currentIndex}
          $animation={getAnimation(index)}
          $duration={transitionDuration}
        />
      ))}
      
      {/* Gradient overlay with animation */}
      <Overlay />
      
      {/* Vignette effect */}
      <VignetteOverlay />
      
      {/* Subtle particles/stars effect */}
      <ParticlesOverlay />
    </Container>
  );
};

export default BackgroundSlideshow;

