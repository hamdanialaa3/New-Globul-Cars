// Responsive ID Card Overlay - Professional Solution
// Auto-scales fields based on image size
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FRONT_FIELDS_PERCENT, BACK_FIELDS_PERCENT, percentToPixels } from './field-definitions-percentage';
import OverlayInput from './OverlayInput';

interface ResponsiveOverlayProps {
  backgroundImage: string;
  formData: any;
  onChange: (fieldId: string, value: any) => void;
  errors: Record<string, string>;
  side: 'front' | 'back';
}

const ResponsiveOverlay: React.FC<ResponsiveOverlayProps> = ({
  backgroundImage,
  formData,
  onChange,
  errors,
  side
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1093, height: 690 });
  const [scale, setScale] = useState(1);

  // Select fields based on side
  const fields = side === 'front' ? FRONT_FIELDS_PERCENT : BACK_FIELDS_PERCENT;

  // Calculate image dimensions and scale when loaded or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        
        // Get actual displayed dimensions
        const displayWidth = img.offsetWidth;
        const displayHeight = img.offsetHeight;
        
        // Calculate scale factor
        const scaleX = displayWidth / 1093;  // Original width
        const scaleY = displayHeight / 690;   // Original height
        const avgScale = (scaleX + scaleY) / 2;
        
        console.log(`📐 ${side.toUpperCase()} side - Image scale:`, {
          displayWidth,
          displayHeight,
          scaleX: scaleX.toFixed(3),
          scaleY: scaleY.toFixed(3),
          avgScale: avgScale.toFixed(3)
        });
        
        setImageDimensions({ width: displayWidth, height: displayHeight });
        setScale(avgScale);
      }
    };

    // Update on image load
    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        updateDimensions();
      } else {
        img.addEventListener('load', updateDimensions);
      }
    }

    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    
    // Small delay to ensure layout is complete
    setTimeout(updateDimensions, 100);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (img) {
        img.removeEventListener('load', updateDimensions);
      }
    };
  }, [backgroundImage, side]);

  return (
    <Container ref={containerRef}>
      {/* Background Image */}
      <BackgroundImage 
        ref={imageRef}
        src={backgroundImage} 
        alt={`ID Card ${side}`}
      />
      
      {/* Overlay Fields */}
      <OverlayContainer>
        {fields.map((field) => {
          // Convert percentage to pixels based on actual image size
          const pixelPosition = percentToPixels(
            field.position,
            imageDimensions.width,
            imageDimensions.height
          );
          
          // Create traditional FieldDefinition with pixel positions
          const pixelField = {
            ...field,
            position: pixelPosition
          };
          
          return (
            <OverlayInput
              key={field.id}
              field={pixelField as any}
              value={formData[field.id]}
              onChange={onChange}
              scale={1}  // Already calculated in percentToPixels
              isValid={!errors[field.id]}
              error={errors[field.id]}
            />
          );
        })}
      </OverlayContainer>
      
      {/* Debug Info (removable in production) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugInfo>
          {side.toUpperCase()} | Scale: {scale.toFixed(3)} | 
          Image: {imageDimensions.width.toFixed(0)}×{imageDimensions.height.toFixed(0)}
        </DebugInfo>
      )}
    </Container>
  );
};

/**
 * Convert percentage position to pixels based on actual container size
 */
export function percentToPixels(
  percentPos: PercentageFieldDefinition['position'],
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: (percentPos.xPercent / 100) * containerWidth,
    y: (percentPos.yPercent / 100) * containerHeight,
    width: (percentPos.widthPercent / 100) * containerWidth,
    height: (percentPos.heightPercent / 100) * containerHeight
  };
}

// Styled Components
const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 1093px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackgroundImage = styled.img`
  width: 100%;
  height: auto;
  opacity: 0.6;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  user-select: none;
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
`;

const DebugInfo = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #00ff00;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 600;
  z-index: 10000;
  pointer-events: none;
`;

export default ResponsiveOverlay;

