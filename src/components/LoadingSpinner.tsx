// src/components/LoadingSpinner.tsx
// Unified Loading Spinner - delegates to KoliSphereLoader
// Maintains backward compatibility for 13+ consumers

import React, { memo } from 'react';
import { KoliSphereLoader } from './KoliSphereLoader';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string; // Deprecated: kept for backward compatibility but ignored
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = 'medium',
  text
}) => {
  return <KoliSphereLoader size={size} message={text} />;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
