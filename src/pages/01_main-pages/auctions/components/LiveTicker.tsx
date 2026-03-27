
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Activity } from 'lucide-react';
import { soundService } from '@/services/sound-service';

const slideUp = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  10% { transform: translateY(0); opacity: 1; }
  90% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
`;

const TickerWrapper = styled.div`
  width: 100%;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  z-index: 10;
`;

const TickerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.text.secondary};
  animation: ${slideUp} 4s ease-in-out infinite;
  
  strong {
    color: ${props => props.theme.colors.primary.main || '#2563EB'};
  }
`;

const LiveIndicator = styled.div`
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background-color: #ef4444;
    border-radius: 50%;
    animation: ${pulse} 1.5s infinite;
  }
`;

const MESSAGES = [
    { text: "Someone in Sofia just placed a bid on", highlight: "BMW X5 2023" },
    { text: "New auction starting for", highlight: "Mercedes-Benz S-Class" },
    { text: "Sold! Hammer price €12,500 for", highlight: "Audi A4 Avant" },
    { text: "High demand detected for", highlight: "Toyota RAV4 Hybrid" },
    { text: "New container arrived in", highlight: "Varna Port" },
    { text: "Auction closed: €45,000 for", highlight: "Porsche 911 (992)" },
    { text: "Fresh listing from Tokyo:", highlight: "Nissan Skyline GT-R" },
    { text: "Bid alert! User982 is active on", highlight: "Tesla Model 3" },
    { text: "Shipping confirmed for", highlight: "Custom Mustang 1967" }
];

export const LiveTicker: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % MESSAGES.length);
            // Optional: Subtle sound on change, might be annoying if loop is fast
            // soundService.playHover(); 
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const currentMsg = MESSAGES[index];

    return (
        <TickerWrapper>
            <div style={{ position: 'absolute', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LiveIndicator />
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>LIVE MARKET</span>
            </div>
            
            <TickerContent key={index}>
                <Activity size={14} />
                <span>{currentMsg.text} <strong>{currentMsg.highlight}</strong></span>
            </TickerContent>
        </TickerWrapper>
    );
};

