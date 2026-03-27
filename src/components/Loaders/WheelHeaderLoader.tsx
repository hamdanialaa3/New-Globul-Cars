import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0%   { transform: rotate(0deg); }
  65%  { transform: rotate(320deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50%      { opacity: 0.85; transform: scale(1); }
`;

const Wrapper = styled.div`
  display: grid;
  place-items: center;
  width: 128px;
  height: 128px;
  position: relative;
  opacity: 0.88;
`;

const GlowRing = styled.div`
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(139, 92, 246, 0.4), transparent 70%);
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

const Wheel = styled.div`
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 8px solid rgba(139, 92, 246, 0.55);
  border-top-color: rgba(139, 92, 246, 0.18);
  border-left-color: rgba(139, 92, 246, 0.32);
  backdrop-filter: blur(6px);
  animation: ${spin} 1.4s ease-in-out infinite;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 32px rgba(139, 92, 246, 0.25);
  background: rgba(0, 0, 0, 0.2);
`;

const Logo = styled.img`
  width: 46px;
  height: 46px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6));
  opacity: 0.92;
`;

export const WheelHeaderLoader: React.FC = () => (
  <Wrapper>
    <GlowRing />
    <Wheel>
      <Logo
        src="/logo512.png"
        alt="Globul Cars Loader"
      />
    </Wheel>
  </Wrapper>
);

export default WheelHeaderLoader;


