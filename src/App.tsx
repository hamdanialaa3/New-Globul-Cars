// src/App.tsx
// Main App Component for Bulgarian Car Marketplace
// Refactored to use AppProviders and AppRoutes for reduced complexity

import React from 'react';
import { AppProviders } from './providers';
import AppRoutes from './AppRoutes';
import IndexedDBActivityTracker from './services/indexeddb-activity-tracker';
import { logger } from './services/logger-service';
import { InstallPrompt } from './components/PWA/InstallPrompt';
import GuestExpirationModal from './components/auth/GuestExpirationModal';
import ConsentBanner from './components/ConsentBanner';

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
        }, 500);
      }, 500);
    }
  }, []);



  return (
    <AppProviders>
      <AppRoutes />
      <GuestExpirationModal />
      <InstallPrompt />
      <ConsentBanner />
    </AppProviders>
  );
};

export default App;