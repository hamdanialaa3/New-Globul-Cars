import defaultStyled from 'styled-components';
const styled = defaultStyled;

export const MapContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

export const MapTitle = styled.h2`
  font-size: 48px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
`;

export const MapSubtitle = styled.p`
  font-size: 18px;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 40px;
  font-weight: 500;
`;

export const LeafletContainer = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  
  .leaflet-container {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  }
  
  .leaflet-tile {
    filter: hue-rotate(200deg) saturate(1.2) brightness(1.1);
  }
  
  .leaflet-interactive {
    animation: borderGlow 2s ease-in-out infinite;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  
  .bulgaria-border {
    animation: borderPulse 3s ease-in-out infinite;
  }
  
  .custom-marker-icon {
    background: transparent !important;
    border: none !important;
  }
  
  .marker-container {
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .marker-dot {
    position: absolute;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.8),
                0 0 30px rgba(59, 130, 246, 0.4);
    z-index: 3;
    transition: all 0.3s ease;
  }
  
  .small-marker .marker-dot {
    width: 8px;
    height: 8px;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.6),
                0 0 20px rgba(59, 130, 246, 0.3);
  }
  
  .small-marker .marker-ring {
    width: 14px;
    height: 14px;
  }
  
  .small-marker .marker-count {
    font-size: 9px;
    padding: 1px 5px;
  }
  
  .marker-container:hover .marker-dot {
    transform: scale(1.3);
    box-shadow: 0 0 20px rgba(59, 130, 246, 1),
                0 0 40px rgba(59, 130, 246, 0.6);
  }
  
  .marker-ring {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid #3b82f6;
    border-radius: 50%;
    animation: markerPulse 2.5s ease-out infinite;
    opacity: 0;
  }
  
  .marker-ring.ring-delay-1 {
    animation-delay: 0.8s;
  }
  
  .marker-ring.ring-delay-2 {
    animation-delay: 1.6s;
  }
  
  .marker-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 4;
    border: 2px solid white;
  }
  
  .car-tooltip {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
    border: 1px solid rgba(59, 130, 246, 0.3) !important;
    border-radius: 12px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    font-family: 'Inter', sans-serif !important;
  }
  
  .car-tooltip::before {
    border-top-color: #334155 !important;
  }
`;

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

export const StatCard = styled.div<{ $index: number }>`
  background: linear-gradient(135deg, 
    ${props => {
      const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];
      return colors[props.$index % colors.length];
    }} 0%, 
    ${props => {
      const colors = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#0f766e', '#ea580c'];
      return colors[props.$index % colors.length];
    }} 100%
  );
  padding: 28px;
  border-radius: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }

  h3 {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 8px;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 16px;
    opacity: 0.95;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;
