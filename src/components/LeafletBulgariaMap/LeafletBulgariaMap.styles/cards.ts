import defaultStyled from 'styled-components';
const styled = defaultStyled;
import { borderGlow, borderPulse, markerPulse, legendDotPulse } from './animations';

export const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.9);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

export const LegendItem = styled.div<{ color: string; $isHovered: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: ${props => props.$isHovered ? 'rgba(59, 130, 246, 0.15)' : 'rgba(51, 65, 85, 0.6)'};
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid ${props => props.$isHovered ? '#3b82f6' : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.8),
                0 0 20px rgba(59, 130, 246, 0.4);
    flex-shrink: 0;
    animation: ${legendDotPulse} 2s ease-in-out infinite;
  }
  
  &:hover .legend-dot {
    box-shadow: 0 0 15px rgba(59, 130, 246, 1),
                0 0 30px rgba(59, 130, 246, 0.6);
    transform: scale(1.2);
  }
  
  span {
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 500;
  }
  
  .legend-count {
    margin-left: auto;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
`;

export const ShowMoreLegendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 400px;
  margin: 16px auto 0;
  padding: 14px 28px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  border: 2px solid #3b82f6;
  border-radius: 50px;
  color: #60a5fa;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Sidebar = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.$isOpen ? '0' : '-400px'};
  width: 380px;
  height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: -20px 0px 40px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 30px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
  }
`;

export const ProvinceTitle = styled.h3`
  color: #60a5fa;
  text-align: center;
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
  padding-bottom: 15px;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 700;
`;

export const CarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const CarCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    transform: translateY(-2px) scale(1.02);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
    
    &::before {
      left: 100%;
    }
  }
`;

export const CarImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(59, 130, 246, 0.3);
`;

export const CarInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #ffffff;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #60a5fa;
    font-weight: 500;
  }
  
  .car-details {
    margin-top: 8px;
    font-size: 12px;
    color: #94a3b8;
  }
`;
