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

// --- STYLED COMPONENTS ---

const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
`;

// Background animated grid
const BackgroundGrid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 204, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 204, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`;

// Spinner Ring (CSS only)
const SpinnerRing = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 30px;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }
  
  &::before {
    width: 100%;
    height: 100%;
    border: 5px solid rgba(0, 204, 255, 0.15);
    box-shadow: 
      0 0 20px rgba(0, 204, 255, 0.2),
      inset 0 0 20px rgba(0, 204, 255, 0.1);
  }
  
  &::after {
    width: 100%;
    height: 100%;
    border: 5px solid transparent;
    border-top-color: #00ccff;
    border-right-color: #00ccff;
    animation: ${spin} 1.5s linear infinite;
    box-shadow: 0 0 30px rgba(0, 204, 255, 0.5);
  }
`;

// Logo container centered in spinner
const LogoContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Project Logo with 3D rotation
const ProjectLogo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(0, 204, 255, 0.6));
  animation: ${rotateYSmooth} 4s linear infinite;
  transform-style: preserve-3d;
`;

const LoadingText = styled.h2<{ phase: number }>`
  font-family: 'Martica', 'Arial', sans-serif;
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
  animation: ${(props) =>
      props.phase === 1
        ? fadeInFlash
        : props.phase === 2
        ? pulseGlow
        : pulseCyan}
    ${(props) => (props.phase === 1 ? '1s' : '2s')} ease-in-out
    ${(props) => (props.phase > 1 ? 'infinite alternate' : 'forwards')};
  text-shadow: ${(props) =>
    props.phase === 3
      ? '0 0 15px rgba(0, 204, 255, 0.8)'
      : '0 0 20px rgba(255, 255, 255, 0.8)'};
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
`;

const ProgressFill = styled.div<{ percent: number }>`
  width: ${(props) => props.percent}%;
  height: 100%;
  background: linear-gradient(90deg, #00ccff, #0099cc);
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 204, 255, 0.8);
`;

const PercentText = styled.p`
  font-family: 'Martica', 'Arial', sans-serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
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
      <SpinnerRing>
        <LogoContainer>
          <ProjectLogo src="/Logo1.png" alt="Logo" />
        </LogoContainer>
      </SpinnerRing>
      <LoadingText phase={phase}>{message}</LoadingText>
      <ProgressBar>
        <ProgressFill percent={percent} />
      </ProgressBar>
      <PercentText>{percent}%</PercentText>
    </LoaderContainer>
  );
};

export default SmartLoaderCSS;
