// City Cars Section Styles
// 🌐 3D Glass Ball City Cards with Professional Design

import styled, { keyframes } from 'styled-components';

// ✨ Animations for 3D Glass Balls
const glassShine = keyframes`
  0% {
    opacity: 0.6;
    transform: rotate(0deg) scale(1);
  }
  50% {
    opacity: 1;
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    opacity: 0.6;
    transform: rotate(360deg) scale(1);
  }
`;

const float3D = keyframes`
  0%, 100% {
    transform: translateY(0px) rotateX(0deg);
  }
  50% {
    transform: translateY(-5px) rotateX(2deg);
  }
`;

export const SectionContainer = styled.section`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(240, 248, 255, 0.95) 0%,
    rgba(230, 243, 255, 0.95) 100%
  );
  padding: 4rem 0;
  overflow: hidden;

  /* Background pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0, 92, 169, 0.02) 10px,
        rgba(0, 92, 169, 0.02) 20px
      );
    pointer-events: none;
    z-index: 0;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #005ca9;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.375rem;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 600px) {
    font-size: 0.875rem;
  }
`;

export const ViewAllButton = styled.button`
  display: inline-block;
  background: linear-gradient(135deg, #005ca9, #0066cc);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 92, 169, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 92, 169, 0.4);
    background: linear-gradient(135deg, #0066cc, #007bff);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const MapHint = styled.p`
  text-align: center;
  color: #6c757d;
  font-size: 0.95rem;
  margin: 1.5rem 0 3rem;
  font-style: italic;
`;

// City Grid Styles - Circular/spherical with smaller size
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  justify-items: center;
  
  /* 🎯 3D Perspective for glass balls */
  perspective: 1000px;
  perspective-origin: 50% 50%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.875rem;
  }
`;

export const CityCard = styled.div<{ $isActive?: boolean }>`
  /* 🌐 3D Glass Ball Effect - Glassmorphism */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.85) 50%,
    rgba(240, 240, 255, 0.9) 100%
  );
  border-radius: 50%; /* Fully circular */
  width: 160px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: visible;
  
  /* 🎈 Floating Animation */
  animation: ${float3D} 3s ease-in-out infinite;
  
  /* 🔮 Glass Border - Gradient Glass Effect */
  border: 3px solid ${props => props.$isActive 
    ? 'rgba(139, 92, 246, 0.5)' 
    : 'rgba(255, 255, 255, 0.6)'};
  
  /* 🎨 3D Shadow Layers - Multiple shadows for depth */
  box-shadow: 
    /* Inner glow */
    inset 0 0 20px rgba(255, 255, 255, 0.8),
    inset -5px -5px 15px rgba(0, 92, 169, 0.1),
    inset 5px 5px 15px rgba(255, 255, 255, 0.9),
    /* Outer shadow - 3D depth */
    0 10px 30px rgba(0, 92, 169, 0.15),
    0 5px 15px rgba(0, 92, 169, 0.1),
    /* Bottom shadow */
    0 20px 40px rgba(0, 0, 0, 0.1);
  
  /* 💎 Glass Backdrop Filter */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* ✨ Top Highlight - Glass Reflection with Animation */
  &::before {
    content: '';
    position: absolute;
    top: 5%;
    left: 10%;
    width: 55%;
    height: 55%;
    background: radial-gradient(
      ellipse at 30% 30%,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0.7) 30%,
      rgba(255, 255, 255, 0.3) 60%,
      transparent 90%
    );
    border-radius: 50%;
    filter: blur(10px);
    pointer-events: none;
    z-index: 2;
    animation: ${glassShine} 4s ease-in-out infinite;
  }

  /* 🌟 Bottom Shine - 3D Bottom Light with Glow */
  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: 15%;
    width: 40%;
    height: 40%;
    background: radial-gradient(
      circle at 60% 60%,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(255, 215, 0, 0.15) 40%,
      transparent 75%
    );
    border-radius: 50%;
    filter: blur(12px);
    pointer-events: none;
    z-index: 1;
  }
  
  /* 🎆 Ambient Light Ring - Outer Glow */
  &:hover::after {
    background: radial-gradient(
      circle at 60% 60%,
      rgba(139, 92, 246, 0.4) 0%,
      rgba(255, 215, 0, 0.25) 40%,
      transparent 75%
    );
    filter: blur(15px);
  }

  /* 🎯 Hover Effect - 3D Rotation + Glow */
  &:hover {
    transform: translateY(-12px) scale(1.1) rotateX(5deg);
    box-shadow: 
      inset 0 0 25px rgba(255, 255, 255, 1),
      inset -5px -5px 20px rgba(139, 92, 246, 0.15),
      inset 5px 5px 20px rgba(255, 255, 255, 1),
      0 15px 45px rgba(139, 92, 246, 0.3),
      0 8px 25px rgba(0, 92, 169, 0.2),
      0 25px 60px rgba(0, 0, 0, 0.15);
    border-color: rgba(139, 92, 246, 0.8);
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 250, 240, 0.95) 50%,
      rgba(255, 243, 224, 0.92) 100%
    );
    
    &::before {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  &:active {
    transform: translateY(-8px) scale(1.06);
  }
  
  /* 📱 Mobile Optimization */
  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
    padding: 1rem;
  }
  
  @media (max-width: 600px) {
    width: 120px;
    height: 120px;
    padding: 0.875rem;
    border-width: 2px;
  }
`;

export const CityName = styled.h3`
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 8px 0 0 0;
  text-align: center;
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  z-index: 3;
  position: relative;
  
  /* 💎 3D Text Effect - Embossed on glass */
  text-shadow: 
    /* Light from top-left */
    -1px -1px 2px rgba(255, 255, 255, 0.9),
    1px 1px 3px rgba(0, 92, 169, 0.3),
    /* Depth shadow */
    0 2px 4px rgba(0, 0, 0, 0.1),
    /* Glow effect */
    0 0 10px rgba(255, 255, 255, 0.5);
  
  /* 🎨 Gradient Text (optional enhancement) */
  background: linear-gradient(145deg, #1a1a2e 0%, #005ca9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
  
  @media (max-width: 600px) {
    font-size: 0.8125rem;
  }
`;

export const CityIcon = styled.span`
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 3;
  
  /* 🌟 3D Icon with Glass Effect */
  filter: 
    drop-shadow(0 4px 8px rgba(0, 92, 169, 0.3))
    drop-shadow(0 2px 4px rgba(255, 255, 255, 0.9))
    drop-shadow(0 -2px 4px rgba(255, 255, 255, 0.6));
  
  svg {
    width: 40px;
    height: 40px;
    color: #005ca9;
    /* Icon 3D depth */
    filter: drop-shadow(0 3px 6px rgba(0, 92, 169, 0.4));
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    
    svg {
      width: 32px;
      height: 32px;
    }
  }
  
  @media (max-width: 600px) {
    font-size: 1.75rem;
    margin-bottom: 0.375rem;
    
    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

export const CarCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
  padding: 0.5rem 1rem;
  position: relative;
  z-index: 3;
  
  /* 💎 Glass Badge with 3D Effect */
  background: linear-gradient(
    135deg,
    rgba(0, 92, 169, 0.95) 0%,
    rgba(0, 102, 204, 0.9) 100%
  );
  border-radius: 24px;
  color: white;
  font-size: 0.8125rem;
  font-weight: 700;
  
  /* 3D Glass Shadow */
  box-shadow: 
    /* Inner glow */
    inset 0 1px 2px rgba(255, 255, 255, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2),
    /* Outer depth */
    0 3px 8px rgba(0, 92, 169, 0.4),
    0 1px 3px rgba(0, 0, 0, 0.2);
  
  /* Glass border */
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  /* Text shadow for depth */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  svg {
    width: 16px;
    height: 16px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.875rem;
    font-size: 0.75rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 600px) {
    padding: 0.35rem 0.75rem;
    font-size: 0.6875rem;
    gap: 0.25rem;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export const CarCountNumber = styled.span`
  font-weight: 800;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

export const ViewCarsButton = styled.button`
  display: none; /* Hidden in circular design */
`;

export const LoadingCard = styled(CityCard)`
  pointer-events: none;
  opacity: 0.6;
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
  }
  
  animation: pulse 1.5s ease-in-out infinite;
`;

export const LoadingCircle = styled.div`
  width: 60%;
  height: 60%;
  background: linear-gradient(
    90deg,
    #e9ecef 25%,
    #f8f9fa 50%,
    #e9ecef 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 50%;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const LoadingText = styled.div`
  height: 1.5rem;
  background: linear-gradient(
    90deg,
    #e9ecef 25%,
    #f8f9fa 50%,
    #e9ecef 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  
  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  p {
    font-size: 1.1rem;
  }
`;

export const ShowMoreButton = styled.button`
  /* ⚡ SIMPLIFIED: Removed heavy animations for better performance */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
  margin: 2rem auto 0;
  padding: 0.875rem 1.75rem;
  background: white;
  border: 2px solid #005ca9;
  border-radius: 12px;
  color: #005ca9;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 92, 169, 0.1);
  
  @media (max-width: 600px) {
    font-size: 0.8125rem;
    padding: 0.75rem 1.5rem;
    max-width: 100%;
  }

  &:hover {
    background: #005ca9;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 92, 169, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    transition: transform 0.15s ease;
  }
  
  &:hover svg {
    transform: translateY(2px);
  }
`;

