/**
 * Glass Sphere Loading Overlay
 */

import React, { useEffect, useState } from 'react';
import { KoliSphereLoader } from '../KoliSphereLoader';

interface LightweightLoadingOverlayProps {
  isVisible: boolean;
}

const LightweightLoadingOverlay: React.FC<LightweightLoadingOverlayProps> = ({ 
  isVisible
}) => {
  const [percent, setPercent] = useState(0);

  // Simple percentage counter 0-100%
  useEffect(() => {
    if (!isVisible) {
      setPercent(0);
      return;
    }

    let currentPercent = 0;
    const loadInterval = setInterval(() => {
      currentPercent = Math.min(currentPercent + Math.random() * 15, 100);
      setPercent(Math.floor(currentPercent));

      if (currentPercent >= 100) {
        clearInterval(loadInterval);
      }
    }, 200);

    return () => clearInterval(loadInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <KoliSphereLoader
      fullscreen
      progress={percent}
      showPercentage
    />
  );
};

export default LightweightLoadingOverlay;
