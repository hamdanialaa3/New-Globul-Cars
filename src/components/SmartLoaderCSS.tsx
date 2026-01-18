import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// --- ANIMATIONS ---

// Fade In and Flash
const fadeInFlash = keyframes`
  0% {
    opacity: 0;
    text-shadow: none;
    transform: translateY(10px);
  }
  50% {
    opacity: 0.5;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
  }
`;

// Continuous Pulse (White)
const pulseGlow = keyframes`
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);
  }
  to {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

// Continuous Pulse (Cyan)
const pulseCyan = keyframes`
  from {
    text-shadow: 0 0 15px rgba(0, 204, 255, 0.8), 0 0 30px rgba(0, 204, 255, 0.4);
  }
  to {
    text-shadow: 0 0 5px rgba(0, 204, 255, 0.5), 0 0 10px rgba(0, 204, 255, 0.2);
  }
`;

// Logo rotation animation
const rotateYSmooth = keyframes`
  from { transform: perspective(1000px) rotateY(0deg); }
  to { transform: perspective(1000px) rotateY(360deg); }
`;

// Spinner ring rotation
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Glass sphere floating animation
const floatSphere = keyframes`
  0%, 100% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-20px) translateZ(0);
  }
`;

// Light rotation inside sphere
const rotateLight = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Caustic light movement
const causticMove = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
    opacity: 0.3;
  }
`;

// Spotlight sweep
const spotlightSweep = keyframes`
  0% {
    transform: translateX(-100%) rotate(45deg);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(200%) rotate(45deg);
    opacity: 0;
  }
`;

// Glass refraction shimmer
const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// --- STYLED COMPONENTS ---

const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 150, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  perspective: 2000px;
  perspective-origin: center center;
`;

// Background animated grid with depth
const BackgroundGrid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 204, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 204, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  opacity: 0.4;
  
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`;

// Ambient light sources in background
const AmbientLight1 = styled.div`
  position: absolute;
  top: 20%;
  left: 20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 204, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(60px);
  animation: ${floatSphere} 6s ease-in-out infinite;
  opacity: 0.6;
`;

const AmbientLight2 = styled.div`
  position: absolute;
  bottom: 20%;
  right: 20%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(50px);
  animation: ${floatSphere} 8s ease-in-out infinite reverse;
  opacity: 0.5;
`;

// Ground shadow for sphere
const SphereShadow = styled.div`
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: auto;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  animation: ${floatSphere} 4s ease-in-out infinite reverse;
  z-index: 0;
`;

// Glass Sphere Container - الكرة الزجاجية الرئيسية
const GlassSphere = styled.div`
  position: relative;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: ${floatSphere} 4s ease-in-out infinite;
  transform-style: preserve-3d;
  z-index: 1;
  
  /* Glass base layer */
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(0, 204, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 80%);
  
  /* Glass blur effect */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* Glass border with refraction */
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    /* Outer glow */
    0 0 80px rgba(0, 204, 255, 0.5),
    0 0 160px rgba(0, 204, 255, 0.3),
    0 0 240px rgba(0, 150, 255, 0.2),
    /* Inner reflections */
    inset 0 0 100px rgba(255, 255, 255, 0.1),
    inset -50px -50px 100px rgba(0, 150, 255, 0.15),
    inset 50px 50px 100px rgba(255, 107, 53, 0.1),
    /* Depth shadows */
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 40px 120px rgba(0, 0, 0, 0.3);
  
  /* Refraction shimmer */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      transparent 30%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: ${shimmer} 3s ease-in-out infinite;
    pointer-events: none;
    mix-blend-mode: overlay;
    z-index: 1;
  }
`;

// Top highlight (light source reflection)
const TopHighlight = styled.div`
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 30%,
    transparent 70%
  );
  filter: blur(30px);
  pointer-events: none;
  animation: ${floatSphere} 3s ease-in-out infinite;
`;

// Side highlight (secondary light source)
const SideHighlight = styled.div`
  position: absolute;
  top: 40%;
  left: 25%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0, 204, 255, 0.6) 0%,
    rgba(0, 204, 255, 0.3) 40%,
    transparent 70%
  );
  filter: blur(25px);
  pointer-events: none;
  animation: ${rotateLight} 8s linear infinite;
`;

// Caustic light patterns (light refracted through glass)
const CausticLight = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(0, 204, 255, 0.3) 0%, transparent 40%),
    conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(255, 255, 255, 0.1) 90deg,
      transparent 180deg,
      rgba(0, 204, 255, 0.1) 270deg,
      transparent 360deg
    );
  filter: blur(20px);
  pointer-events: none;
  animation: ${causticMove} 10s ease-in-out infinite;
  mix-blend-mode: screen;
`;

// Spotlight sweep effect
const SpotlightSweep = styled.div`
  position: absolute;
  top: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 30%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.2) 70%,
    transparent 100%
  );
  transform: rotate(45deg);
  animation: ${spotlightSweep} 4s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: overlay;
`;

// Content container inside sphere
const SphereContent = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2rem;
  backdrop-filter: blur(5px);
`;

// Spinner Ring (CSS only) - داخل الكرة الزجاجية
const SpinnerRing = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 30px;
  filter: drop-shadow(0 0 30px rgba(0, 204, 255, 0.5));
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }
  
  &::before {
    width: 100%;
    height: 100%;
    border: 4px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 0 30px rgba(0, 204, 255, 0.3),
      inset 0 0 30px rgba(255, 255, 255, 0.1),
      0 0 60px rgba(0, 204, 255, 0.2);
    backdrop-filter: blur(10px);
  }
  
  &::after {
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-top-color: rgba(255, 255, 255, 0.9);
    border-right-color: #00ccff;
    animation: ${spin} 1.5s linear infinite;
    box-shadow: 
      0 0 40px rgba(0, 204, 255, 0.8),
      0 0 80px rgba(0, 204, 255, 0.4),
      inset 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

// Logo container centered in spinner
const LogoContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

// Project Logo with 3D rotation and glass refraction
const ProjectLogo = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  filter: 
    drop-shadow(0 0 30px rgba(0, 204, 255, 0.8))
    drop-shadow(0 0 60px rgba(255, 255, 255, 0.4))
    brightness(1.2);
  animation: ${rotateYSmooth} 4s linear infinite;
  transform-style: preserve-3d;
  transition: filter 0.3s ease;
`;

// Loading Text with phase animation - داخل الكرة الزجاجية
const LoadingText = styled.h2<{ $phase: number }>`
  font-family: inherit;
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  animation: ${(props) =>
    props.$phase === 1
      ? fadeInFlash
      : props.$phase === 2
        ? pulseGlow
        : pulseCyan}
    ${(props) => (props.$phase === 1 ? '1s' : '2s')} ease-in-out
    ${(props) => (props.$phase > 1 ? 'infinite alternate' : 'forwards')};
  text-shadow: ${(props) =>
    props.$phase === 3
      ? '0 0 20px rgba(0, 204, 255, 1), 0 0 40px rgba(0, 204, 255, 0.6), 0 0 60px rgba(0, 204, 255, 0.3)'
      : '0 0 25px rgba(255, 255, 255, 1), 0 0 50px rgba(255, 255, 255, 0.6), 0 0 75px rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(2px);
  letter-spacing: 0.05em;
`;

const ProgressBar = styled.div`
  width: 320px;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 204, 255, 0.2);
`;

const ProgressFill = styled.div<{ $percent: number }>`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.9) 0%,
    #00ccff 50%,
    #0099cc 100%
  );
  border-radius: 10px;
  transition: width 0.3s ease;
  box-shadow: 
    0 0 20px rgba(0, 204, 255, 1),
    0 0 40px rgba(0, 204, 255, 0.6),
    inset 0 0 10px rgba(255, 255, 255, 0.5);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: ${shimmer} 2s ease-in-out infinite;
  }
`;

const PercentText = styled.p`
  font-family: inherit;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.8rem;
  font-weight: 500;
  text-shadow: 
    0 0 10px rgba(0, 204, 255, 0.8),
    0 0 20px rgba(0, 204, 255, 0.4);
  letter-spacing: 0.1em;
`;

// --- COMPONENT ---

interface SmartLoaderCSSProps {
  message?: string;
  percent?: number;
}

const SmartLoaderCSS: React.FC<SmartLoaderCSSProps> = ({
  message = 'Loading',
  percent = 0,
}) => {
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    // Phase 1: Fade in (0-1s)
    const timer1 = setTimeout(() => setPhase(2), 1000);
    // Phase 2: White pulse (1-3s)
    const timer2 = setTimeout(() => setPhase(3), 3000);
    // Phase 3: Cyan pulse (after 3s)

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <LoaderContainer>
      <BackgroundGrid />
      <AmbientLight1 />
      <AmbientLight2 />
      
      {/* Ground shadow */}
      <SphereShadow />
      
      <GlassSphere>
        {/* Light layers inside glass sphere */}
        <TopHighlight />
        <SideHighlight />
        <CausticLight />
        <SpotlightSweep />
        
        {/* Main content inside glass sphere */}
        <SphereContent>
          <SpinnerRing>
            <LogoContainer>
              <ProjectLogo src="/koli-one.png" alt="Logo" />
            </LogoContainer>
          </SpinnerRing>
          <LoadingText $phase={phase}>{message}</LoadingText>
          <ProgressBar>
            <ProgressFill $percent={percent} />
          </ProgressBar>
          <PercentText>{percent}%</PercentText>
        </SphereContent>
      </GlassSphere>
    </LoaderContainer>
  );
};

export default SmartLoaderCSS;
