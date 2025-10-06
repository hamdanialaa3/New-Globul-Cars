// src/components/Profile/business-upgrade/styles.ts
// Business Upgrade Card Styles - Modern 3D Design
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import styled, { keyframes } from 'styled-components';

// ==================== ANIMATIONS ====================

export const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
`;

// ==================== STYLED COMPONENTS ====================

export const UpgradeCard = styled.div`
  position: relative;
  border-radius: 20px;
  padding: 3px;
  background: linear-gradient(135deg, 
    #1e3a8a 0%, 
    #2563eb 25%, 
    #3b82f6 50%, 
    #2563eb 75%, 
    #1e3a8a 100%
  );
  background-size: 200% 200%;
  animation: ${shimmer} 4s linear infinite;
  margin-bottom: 24px;
  box-shadow: 
    0 10px 40px rgba(30, 58, 138, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  
  &:hover {
    transform: translateY(-2px);
    animation: ${glow} 2s ease-in-out infinite;
  }
`;

export const CardInner = styled.div`
  background: linear-gradient(135deg, 
    #1e3a8a 0%, 
    #1e40af 50%, 
    #1e3a8a 100%
  );
  border-radius: 18px;
  padding: 20px 16px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: radial-gradient(ellipse at top, 
      rgba(59, 130, 246, 0.3) 0%, 
      transparent 70%
    );
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: radial-gradient(ellipse at bottom, 
      rgba(30, 58, 138, 0.5) 0%, 
      transparent 70%
    );
    pointer-events: none;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
`;

export const IconCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25) 0%, 
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: ${float} 3s ease-in-out infinite;
  
  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

export const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  font-weight: 800;
  background: linear-gradient(135deg, 
    #ffffff 0%, 
    #e0f2fe 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.2px;
  text-align: center;
  white-space: nowrap;
`;

export const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(253, 224, 71, 0.25);
  border: 1px solid rgba(253, 224, 71, 0.5);
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fde047;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${pulse} 2s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
  margin: 0 auto 14px auto;
  width: fit-content;
  
  svg {
    width: 10px;
    height: 10px;
    filter: drop-shadow(0 0 4px rgba(253, 224, 71, 0.6));
  }
`;

export const CardDescription = styled.p`
  margin: 0 0 14px 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.15px;
  text-align: center;
  padding: 0 4px;
`;

export const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
`;

export const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  letter-spacing: 0.1px;
  line-height: 1.25;
  width: 100%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateX(4px);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  span {
    flex: 1;
  }
  
  svg {
    flex-shrink: 0;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    color: #fde047;
    width: 15px;
    height: 15px;
  }
`;

export const UpgradeButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, 
    #ffffff 0%, 
    #f0f9ff 100%
  );
  color: #1e3a8a;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
  overflow: hidden;
  letter-spacing: 0.15px;
  white-space: nowrap;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.3) 50%, 
      transparent 100%
    );
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 12px 28px rgba(0, 0, 0, 0.25),
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 2px rgba(255, 255, 255, 0.8);
    background: linear-gradient(135deg, 
      #f0f9ff 0%, 
      #ffffff 100%
    );
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
`;


