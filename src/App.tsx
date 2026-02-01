// src/App.tsx
// Main App Component for Koli One
// Refactored to use AppProviders and AppRoutes for reduced complexity
// Enhanced with Professional Page Loader and Scroll Management

import React from 'react';
import { AppProviders } from './providers';
import AppRoutes from './AppRoutes';
import IndexedDBActivityTracker from './services/indexeddb-activity-tracker';
import { logger } from './services/logger-service';
import { InstallPrompt } from './components/PWA/InstallPrompt';
import GuestExpirationModal from './components/auth/GuestExpirationModal';
import ConsentBanner from './components/ConsentBanner';
import PendingFavoriteHandler from './components/PendingFavoriteHandler';
import ScrollToTop from './components/Navigation/ScrollToTop';
import PageLoader from './components/Navigation/PageLoader';
// 🔴 CRITICAL: Global ErrorBoundary to prevent white screen of death
import { ErrorBoundary } from './components/ErrorBoundary';
// ✅ MERGED: AIChatbotWidget merged into UnifiedAIChat in MainLayout
// import AIChatbotWidget from './components/messaging/AIChatbotWidget';

// 🔧 Dev utilities (available in console)
if (process.env.NODE_ENV === 'development') {
  import('./utils/checkCarsStatus').then(module => {
    (window as any).checkCarsStatus = module.checkAllCarsStatus;
    (window as any).fixCarsStatus = module.fixAllCarsStatus;
    // Development helper functions registered
  });
}

const App: React.FC = () => {


  // Initialize activity tracker on mount
  React.useEffect(() => {
    IndexedDBActivityTracker.initialize();

    // Remove initial loader
    const loader = document.getElementById('loader-container');
    if (loader) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
          logger.info('[App] Initial loader removed successfully');
        }, 500);
      }, 500);
    }
  }, []);



  return (
    <ErrorBoundary>
      <AppProviders>
        {/* 🔝 Automatic scroll to top on route change */}
        <ScrollToTop />
        
        {/* ⚙️ Professional page transition loader */}
        <PageLoader />
        
        {/* ✅ MERGED: AIChatbotWidget moved to UnifiedAIChat in MainLayout */}
        <PendingFavoriteHandler />
        <AppRoutes />
        <GuestExpirationModal />
        <InstallPrompt />
        <ConsentBanner />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;