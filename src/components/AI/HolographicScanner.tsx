import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const scanAnimation = keyframes`
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 250px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 243, 255, 0.3);
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
`;

const ScanBeam = styled.div<{ $color: string }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  background: ${props => props.$color};
  box-shadow: 0 0 15px ${props => props.$color}, 0 0 30px ${props => props.$color};
  animation: ${scanAnimation} 2s linear infinite;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, ${props => props.$color}33, transparent);
    transform: translateY(-100%);
  }
`;

const GridOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 5;
  pointer-events: none;
`;

const LogTerminal = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #00f3ff;
  height: 60px;
  overflow: hidden;
  border-top: 1px solid rgba(0, 243, 255, 0.3);
  display: flex;
  flex-direction: column-reverse; /* Newest at bottom visually */
`;

const LogLine = styled(motion.div)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface HolographicScannerProps {
    imageSrc: string;
    isScanning: boolean;
    scanColor?: string;
    logs?: string[];
}

export const HolographicScanner: React.FC<HolographicScannerProps> = ({
    imageSrc,
    isScanning,
    scanColor = '#00f3ff',
    logs = []
}) => {
    return (
        <Container>
            <GridOverlay />
            {imageSrc && <ImagePreview src={imageSrc} alt="Analyzing..." />}

            {isScanning && <ScanBeam $color={scanColor} />}

            <AnimatePresence>
                {isScanning && logs.length > 0 && (
                    <LogTerminal
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {logs.slice(-3).map((log, index) => (
                            <LogLine
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {'>'} {log}
                            </LogLine>
                        ))}
                    </LogTerminal>
                )}
            </AnimatePresence>
        </Container>
    );
};
