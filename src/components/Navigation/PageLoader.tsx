// src/components/navigation/PageLoader.tsx
// Professional Page Transition Loader with Car Theme
// Koli One - Bulgarian Car Marketplace
// Features: Progress counter, car-themed animation, logo display
// Supports: Bulgarian (bg) and English (en)

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { logger } from '../../services/logger-service';
import aiIcon from '../../assets/icons/koli_one_ai_Icon2.png';

/**
 * PageLoader Component
 * Shows professional loading overlay during page transitions
 * - Displays Koli One logo
 * - Animated mechanical gear (car theme)
 * - Percentage counter (0% → 100%)
 * - Bilingual loading messages (Bulgarian/English)
 */
const PageLoader: React.FC = () => {
  const location = useLocation();
  const { language } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Loading messages in both languages
  const loadingMessages = {
    bg: 'Подготвяме вашето автомобилно изживяване...',
    en: 'Preparing your automotive experience...'
  };

  useEffect(() => {
    // Start loader on route change
    setVisible(true);
    setProgress(0);

    logger.debug('[PageLoader] Started for route:', location.pathname);

    let currentProgress = 0;
    const interval = setInterval(() => {
      // Random increments for natural feel (10-25% jumps)
      const increment = Math.floor(Math.random() * 15) + 10;
      currentProgress += increment;

      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        
        // Hide loader with slight delay for smooth transition
        setTimeout(() => {
          setVisible(false);
          logger.debug('[PageLoader] Completed for route:', location.pathname);
        }, 200);
      } else {
        setProgress(currentProgress);
      }
    }, 120); // Update every 120ms for smooth animation

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999] 
        bg-black/40 backdrop-blur-sm 
        flex flex-col items-center justify-center
        pointer-events-none
        transition-opacity duration-200
      "
      role="status"
      aria-live="polite"
      aria-label={language === 'bg' ? 'Зареждане на страница' : 'Loading page'}
    >
      {/* Logo and Message Section */}
      <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">

        {/* Loading Message */}
        <p className="text-white text-sm md:text-base tracking-wide text-center px-4 font-medium">
          {loadingMessages[language]}
        </p>
      </div>

      {/* Animated Gear and Progress Section */}
      <div className="flex flex-col items-center gap-4">
        {/* Mechanical Gear Animation (Car Theme) with AI Icon */}
        <div className="relative w-20 h-20">
          {/* Outer gear ring - 40% opacity */}
          <div
            className="
              absolute inset-0
              border-4 rounded-full
              border-t-orange-500 border-r-orange-500
              animate-spin
            "
            style={{ 
              animationDuration: '1.5s',
              borderColor: 'rgba(209, 213, 219, 0.12)', // 40% of 30% = 12%
              borderTopColor: 'rgba(249, 115, 22, 0.4)', // orange-500 with 40% opacity
              borderRightColor: 'rgba(249, 115, 22, 0.4)'
            }}
          />
          
          {/* Inner gear - 40% opacity */}
          <div
            className="
              absolute inset-2
              border-3 rounded-full
              border-b-orange-400 border-l-orange-400
              animate-spin
            "
            style={{ 
              animationDuration: '2s', 
              animationDirection: 'reverse',
              borderColor: 'rgba(156, 163, 175, 0.16)', // 40% of 40% = 16%
              borderBottomColor: 'rgba(251, 146, 60, 0.4)', // orange-400 with 40% opacity
              borderLeftColor: 'rgba(251, 146, 60, 0.4)'
            }}
          />

          {/* Center hub - 40% opacity */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-4 h-4 rounded-full shadow-lg" 
              style={{ backgroundColor: 'rgba(249, 115, 22, 0.4)' }} // orange-500 with 40% opacity
            />
          </div>

          {/* AI Icon in front of gear */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <img 
              src={aiIcon} 
              alt="AI" 
              className="w-12 h-12 object-contain"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
            />
          </div>
        </div>

        {/* Progress Percentage Counter */}
        <div className="flex items-center gap-2">
          <span 
            className="
              text-white text-3xl md:text-4xl font-bold 
              tabular-nums tracking-wider
              drop-shadow-lg
            "
            aria-label={`${progress}%`}
          >
            {progress}%
          </span>
        </div>

        {/* Progress Bar (Optional - adds visual feedback) */}
        <div className="w-48 h-1 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
